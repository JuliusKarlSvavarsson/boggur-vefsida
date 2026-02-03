import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

type StreetRow = {
  id: string;
  name: string;
  image: string | null;
  is_featured: boolean;
  featured_order: number;
  created_at: string;
};

type BuildingAggRow = {
  id: string;
  slug: string;
  title: string;
  street_id: string;
  thumbnail: string | null;
  status: string | null;
  total_apartments: number | string | null;
  available_apartments: number | string | null;
  sold_apartments: number | string | null;
};

export async function GET() {
  const sql = getSql();

  const streets = (await sql`
    SELECT id, name, image, is_featured, featured_order, created_at
    FROM streets
    WHERE is_featured = true
    ORDER BY featured_order ASC, created_at ASC
  `) as StreetRow[];

  if (!streets.length) {
    return NextResponse.json([]);
  }

  const streetIds = streets.map((s) => s.id);

  const buildingRows = (await sql`
    SELECT
      b.id,
      b.slug,
      b.title,
      b.street_id,
      b.thumbnail,
      b.status,
      COUNT(a.id) AS total_apartments,
      COUNT(*) FILTER (WHERE a.status = 'available') AS available_apartments,
      COUNT(*) FILTER (WHERE a.status = 'sold') AS sold_apartments
    FROM buildings b
    LEFT JOIN apartments a ON a.building_id = b.id
    WHERE b.street_id = ANY(${streetIds})
    GROUP BY b.id, b.slug, b.title, b.street_id, b.thumbnail, b.status
    ORDER BY b.title ASC
  `) as BuildingAggRow[];

  const buildingsByStreet = new Map<string, BuildingAggRow[]>();

  for (const row of buildingRows) {
    const list = buildingsByStreet.get(row.street_id) ?? [];
    list.push(row);
    buildingsByStreet.set(row.street_id, list);
  }

  const result = streets.map((street) => {
    const buildings = buildingsByStreet.get(street.id) ?? [];

    const totals = buildings.reduce(
      (acc, b) => {
        const total = Number(b.total_apartments ?? 0);
        const available = Number(b.available_apartments ?? 0);
        const sold = Number(b.sold_apartments ?? 0);
        acc.total += Number.isFinite(total) ? total : 0;
        acc.available += Number.isFinite(available) ? available : 0;
        acc.sold += Number.isFinite(sold) ? sold : 0;
        return acc;
      },
      { total: 0, available: 0, sold: 0 },
    );

    return {
      id: street.id,
      name: street.name,
      image: street.image,
      total_apartments: totals.total,
      available_apartments: totals.available,
      sold_apartments: totals.sold,
      buildings: buildings.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        street_id: b.street_id,
        thumbnail: b.thumbnail,
        status: b.status,
        total_apartments: Number(b.total_apartments ?? 0) || 0,
        available_apartments: Number(b.available_apartments ?? 0) || 0,
        sold_apartments: Number(b.sold_apartments ?? 0) || 0,
      })),
    };
  });

  return NextResponse.json(result);
}
