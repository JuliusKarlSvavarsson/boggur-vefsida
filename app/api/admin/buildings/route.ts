import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET(request: Request) {
  const sql = getSql();
  const url = new URL(request.url);
  const streetId = url.searchParams.get("street_id");

  const buildings = streetId
    ? await sql`
        SELECT id, title, slug, street_id, description, thumbnail, layout_image, status, is_featured, display_order, created_at
        FROM buildings
        WHERE street_id = ${streetId}
        ORDER BY created_at ASC
      `
    : await sql`
        SELECT id, title, slug, street_id, description, thumbnail, layout_image, status, is_featured, display_order, created_at
        FROM buildings
        ORDER BY created_at ASC
      `;

  return NextResponse.json(buildings);
}

export async function POST(request: Request) {
  const sql = getSql();
  const body = await request.json();

  const title = (body.title ?? "").trim();
  const slug = (body.slug ?? "").trim();
  const streetId = body.street_id ?? null;
  const description = body.description ?? null;
  const thumbnail = body.thumbnail ?? null;
  const layoutImage = body.layout_image ?? null;
  const status = body.status ?? null;
  const isFeatured = Boolean(body.is_featured);
  const rawDisplayOrder = body.display_order;
  const displayOrderTmp =
    rawDisplayOrder !== undefined && rawDisplayOrder !== null && rawDisplayOrder !== ""
      ? Number(rawDisplayOrder)
      : null;
  const displayOrder =
    displayOrderTmp !== null && Number.isFinite(displayOrderTmp)
      ? displayOrderTmp
      : null;

  if (!title || !slug) {
    return NextResponse.json(
      { error: "Title and slug are required." },
      { status: 400 },
    );
  }

  const [building] = await sql`
    INSERT INTO buildings (title, slug, street_id, description, thumbnail, layout_image, status, is_featured, display_order)
    VALUES (${title}, ${slug}, ${streetId}, ${description}, ${thumbnail}, ${layoutImage}, ${status}, ${isFeatured}, ${displayOrder})
    RETURNING id, title, slug, street_id, description, thumbnail, layout_image, status, is_featured, display_order, created_at
  `;

  return NextResponse.json(building, { status: 201 });
}
