import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET(request: Request) {
  const sql = getSql();
  const url = new URL(request.url);
  const streetId = url.searchParams.get("street_id");

  // Include aggregate apartment counts per building so clients can
  // surface availability (e.g. "X lausar · Y íbúðir") without making
  // additional per-building requests.
  const buildings = streetId
    ? await sql`
        SELECT
          b.id,
          b.title,
          b.slug,
          b.street_id,
          b.description,
          b.thumbnail,
          b.layout_image,
          b.minimap_svg,
          b.status,
          b.is_featured,
          b.display_order,
          b.created_at,
          COUNT(a.id)                            AS total_apartments,
          COUNT(*) FILTER (WHERE a.status = 'available') AS available_apartments,
          COUNT(*) FILTER (WHERE a.status = 'sold')      AS sold_apartments
        FROM buildings b
        LEFT JOIN apartments a ON a.building_id = b.id
        WHERE b.street_id = ${streetId}
        GROUP BY
          b.id,
          b.title,
          b.slug,
          b.street_id,
          b.description,
          b.thumbnail,
          b.layout_image,
          b.minimap_svg,
          b.status,
          b.is_featured,
          b.display_order,
          b.created_at
        ORDER BY b.created_at ASC
      `
    : await sql`
        SELECT
          b.id,
          b.title,
          b.slug,
          b.street_id,
          b.description,
          b.thumbnail,
          b.layout_image,
          b.minimap_svg,
          b.status,
          b.is_featured,
          b.display_order,
          b.created_at,
          COUNT(a.id)                            AS total_apartments,
          COUNT(*) FILTER (WHERE a.status = 'available') AS available_apartments,
          COUNT(*) FILTER (WHERE a.status = 'sold')      AS sold_apartments
        FROM buildings b
        LEFT JOIN apartments a ON a.building_id = b.id
        GROUP BY
          b.id,
          b.title,
          b.slug,
          b.street_id,
          b.description,
          b.thumbnail,
          b.layout_image,
          b.minimap_svg,
          b.status,
          b.is_featured,
          b.display_order,
          b.created_at
        ORDER BY b.created_at ASC
      `;

  return NextResponse.json(buildings);
}
