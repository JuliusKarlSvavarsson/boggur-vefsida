import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();

  const [building] = await sql`
    SELECT id, title, slug, street_id, description, thumbnail, layout_image, status, created_at
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
    WHERE building_id = ${params.id}
    ORDER BY floor DESC, number ASC
  `;

  return NextResponse.json({ building, apartments });
}
