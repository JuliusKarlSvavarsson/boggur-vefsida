import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export const dynamic = "force-dynamic";

type SocialItemType = "building" | "project" | "service" | "apartment";

type BuildingRow = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  layout_image: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
};

type ServiceRow = {
  id: string;
  title: string;
  image: string | null;
};

type ApartmentRow = {
  id: string;
  number: string;
  floor: number;
  size: number | null;
  rooms: number | null;
  layout_image: string | null;
  interior_images: string[] | null;
  building_slug: string;
  building_title: string;
  building_thumbnail: string | null;
  building_layout_image: string | null;
};

const HOOKS: string[] = [
  "🔥 Nýtt í sölu",
  "Vönduð eign",
  "Nýtt á síðunni",
  "Frábær staðsetning",
  "Tilbúið til afhendingar",
];

const CTAS: string[] = [
  "Skoðaðu nánar 👇",
  "Sjáðu frekari upplýsingar á síðunni",
  "Hafðu samband fyrir nánari upplýsingar",
];

function getBaseUrl(request: Request): string {
  const host = request.headers.get("host") ?? "localhost:3000";
  const isDev = process.env.NODE_ENV === "development";
  const protocol = isDev ? "http" : "https";
  return `${protocol}://${host}`;
}

function toAbsoluteUrl(baseUrl: string, url: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  let path = trimmed.replace(/\\/g, "/");
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return `${baseUrl}${path}`;
}

function buildCaption(title: string): { caption: string; captionId: string } {
  const hookIndex = Math.floor(Math.random() * HOOKS.length);
  const ctaIndex = Math.floor(Math.random() * CTAS.length);
  const hook = HOOKS[hookIndex];
  const cta = CTAS[ctaIndex];

  // Pattern: hook — title. CTA
  let caption = `${hook} — ${title}. ${cta}`;

  if (caption.length > 120) {
    caption = caption.slice(0, 117).trimEnd();
    if (!caption.endsWith(".")) {
      caption += "...";
    }
  }

  const captionId = `${hookIndex}:${ctaIndex}`;
  return { caption, captionId };
}

function addUtm(url: string): string {
  const hasQuery = url.includes("?");
  const glue = hasQuery ? "&" : "?";
  return (
    url +
    `${glue}utm_source=facebook&utm_medium=social&utm_campaign=auto`
  );
}

export async function GET(request: Request) {
  const sql = getSql();
  const baseUrl = getBaseUrl(request);

  const now = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  const cutoffIso = new Date(now - fourteenDaysMs).toISOString();

  // 0) Prefer individual available apartments first
  const apartmentsResult = (await sql`
    SELECT
      a.id,
      a.number,
      a.floor,
      a.size,
      a.rooms,
      a.layout_image,
      a.interior_images,
      b.slug   AS building_slug,
      b.title  AS building_title,
      b.thumbnail      AS building_thumbnail,
      b.layout_image   AS building_layout_image
    FROM apartments a
    JOIN buildings b ON a.building_id = b.id
    WHERE a.status = 'available'
      AND COALESCE(a.social_ready, true) = true
      AND (a.last_social_posted_at IS NULL OR a.last_social_posted_at < ${cutoffIso})
    ORDER BY
      a.last_social_posted_at IS NOT NULL,
      a.last_social_posted_at ASC,
      a.created_at ASC
    LIMIT 1
  `) as ApartmentRow[];

  if (apartmentsResult.length > 0) {
    const apartment = apartmentsResult[0];
    const interiorImages = (apartment.interior_images ?? []) as string[];
    const primaryInterior = interiorImages.length > 0 ? interiorImages[0] : null;
    const imageCandidate =
      primaryInterior ||
      apartment.layout_image ||
      apartment.building_thumbnail ||
      apartment.building_layout_image;
    const imageUrl = toAbsoluteUrl(baseUrl, imageCandidate);

    if (imageUrl) {
      const pageUrl = addUtm(`${baseUrl}/building/${apartment.building_slug}`);
      const title = `${apartment.building_title} – íbúð ${apartment.number}`;
      const { caption, captionId } = buildCaption(title);

      return NextResponse.json({
        item: {
          type: "apartment" as SocialItemType,
          id: apartment.id,
          title,
          url: pageUrl,
          image_url: imageUrl,
          caption,
          caption_id: captionId,
        },
      });
    }
  }

  // 1) Prefer buildings that currently have available apartments
  const buildingsResult = (await sql`
    SELECT
      b.id,
      b.title,
      b.slug,
      b.thumbnail,
      b.layout_image
    FROM buildings b
    WHERE COALESCE(b.social_ready, true) = true
      AND (b.last_social_posted_at IS NULL OR b.last_social_posted_at < ${cutoffIso})
      AND EXISTS (
        SELECT 1
        FROM apartments a
        WHERE a.building_id = b.id
          AND a.status = 'available'
      )
    ORDER BY
      b.last_social_posted_at IS NOT NULL,
      b.last_social_posted_at ASC,
      b.created_at ASC
    LIMIT 1
  `) as BuildingRow[];

  if (buildingsResult.length > 0) {
    const building = buildingsResult[0];
    const imageCandidate = building.thumbnail || building.layout_image;
    const imageUrl = toAbsoluteUrl(baseUrl, imageCandidate);

    if (imageUrl) {
      const pageUrl = addUtm(`${baseUrl}/building/${building.slug}`);
      const { caption, captionId } = buildCaption(building.title);

      return NextResponse.json({
        item: {
          type: "building" as SocialItemType,
          id: building.id,
          title: building.title,
          url: pageUrl,
          image_url: imageUrl,
          caption,
          caption_id: captionId,
        },
      });
    }
  }

  // 2) Fallback to projects, preferring "completed" / "sold" style statuses
  const projectsResult = (await sql`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.image
    FROM projects p
    WHERE COALESCE(p.social_ready, true) = true
      AND p.image IS NOT NULL
      AND p.image <> ''
      AND (p.last_social_posted_at IS NULL OR p.last_social_posted_at < ${cutoffIso})
    ORDER BY
      CASE
        WHEN lower(COALESCE(p.status, '')) LIKE '%sold%' THEN 0
        WHEN lower(COALESCE(p.status, '')) LIKE '%completed%' THEN 0
        WHEN lower(COALESCE(p.status, '')) LIKE '%lokið%' THEN 0
        ELSE 1
      END,
      p.created_at ASC
    LIMIT 1
  `) as ProjectRow[];

  if (projectsResult.length > 0) {
    const project = projectsResult[0];
    const imageUrl = toAbsoluteUrl(baseUrl, project.image);

    if (imageUrl) {
      const pageUrl = addUtm(`${baseUrl}/projects/${project.slug}`);
      const { caption, captionId } = buildCaption(project.title);

      return NextResponse.json({
        item: {
          type: "project" as SocialItemType,
          id: project.id,
          title: project.title,
          url: pageUrl,
          image_url: imageUrl,
          caption,
          caption_id: captionId,
        },
      });
    }
  }

  // 3) Final fallback: services
  const servicesResult = (await sql`
    SELECT
      s.id,
      s.title,
      s.image
    FROM services s
    WHERE COALESCE(s.social_ready, true) = true
      AND s.image IS NOT NULL
      AND s.image <> ''
      AND (s.last_social_posted_at IS NULL OR s.last_social_posted_at < ${cutoffIso})
    ORDER BY
      s.last_social_posted_at IS NOT NULL,
      s.last_social_posted_at ASC,
      s.created_at ASC
    LIMIT 1
  `) as ServiceRow[];

  if (servicesResult.length > 0) {
    const service = servicesResult[0];
    const imageUrl = toAbsoluteUrl(baseUrl, service.image);

    if (imageUrl) {
      const pageUrl = addUtm(`${baseUrl}/thjonustur`);
      const { caption, captionId } = buildCaption(service.title);

      return NextResponse.json({
        item: {
          type: "service" as SocialItemType,
          id: service.id,
          title: service.title,
          url: pageUrl,
          image_url: imageUrl,
          caption,
          caption_id: captionId,
        },
      });
    }
  }

  // Nothing suitable found
  return NextResponse.json({ item: null });
}
