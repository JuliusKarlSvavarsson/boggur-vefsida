import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
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
    UPDATE buildings
    SET
      title = ${title},
      slug = ${slug},
      street_id = ${streetId},
      description = ${description},
      thumbnail = ${thumbnail},
      layout_image = ${layoutImage},
      status = ${status},
      is_featured = ${isFeatured},
      display_order = ${displayOrder}
    WHERE id = ${params.id}
    RETURNING id, title, slug, street_id, description, thumbnail, layout_image, status, is_featured, display_order, created_at
  `;

  if (!building) {
    return NextResponse.json({ error: "Building not found" }, { status: 404 });
  }

  return NextResponse.json(building);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();

  await sql`DELETE FROM buildings WHERE id = ${params.id}`;

  return NextResponse.json({ success: true });
}
