import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();

  // Lightweight debug: expose which database name this handler is
  // connected to so we can verify environments without leaking
  // credentials.
  const connectionString = process.env.DATABASE_URL ?? "";
  let dbName: string | null = null;
  try {
    const parsed = new URL(connectionString);
    dbName = parsed.pathname.replace(/^\//, "") || null;
  } catch {
    dbName = null;
  }

  const [building] = await sql`
    SELECT id, title, slug, street_id, description, thumbnail, layout_image, minimap_svg, status, is_featured, display_order, created_at
    FROM buildings
    WHERE id = ${params.id}
  `;

  if (!building) {
    return NextResponse.json({ error: "Building not found" }, { status: 404 });
  }

  const apartments = await sql`
    SELECT
      id,
      building_id,
      project_id,
      floor,
      number,
      status,
      size,
      rooms,
      layout_image,
      interior_images,
      parking_spot,
      x_position,
      y_position,
      width,
      height,
      created_at
    FROM apartments
    WHERE building_id = ${building.id}
    ORDER BY floor DESC, number ASC
  `;

  return NextResponse.json({
    building,
    apartments,
    _debug: {
      dbName,
      buildingId: params.id,
      apartmentCount: apartments.length,
    },
  });
}
