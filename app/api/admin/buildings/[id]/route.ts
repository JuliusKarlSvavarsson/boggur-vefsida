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
  const streetId = body.street_id as string | undefined;
  const description = body.description ?? null;
  const thumbnail = body.thumbnail ?? null;
  const layoutImage = body.layout_image ?? null;
  const status = body.status ?? null;

  if (!title || !slug || !streetId) {
    return NextResponse.json(
      { error: "Title, slug, and street are required." },
      { status: 400 },
    );
  }

  const [building] = await sql`
    UPDATE buildings
    SET title = ${title}, slug = ${slug}, street_id = ${streetId}, description = ${description}, thumbnail = ${thumbnail}, layout_image = ${layoutImage}, status = ${status}
    WHERE id = ${params.id}
    RETURNING id, title, slug, street_id, description, thumbnail, layout_image, status, created_at
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
