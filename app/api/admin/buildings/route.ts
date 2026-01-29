import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET(request: Request) {
  const sql = getSql();
  const url = new URL(request.url);
  const streetId = url.searchParams.get("street_id");

  const buildings = streetId
    ? await sql`
        SELECT id, title, slug, street_id, description, thumbnail, layout_image, status, created_at
        FROM buildings
        WHERE street_id = ${streetId}
        ORDER BY created_at ASC
      `
    : await sql`
        SELECT id, title, slug, street_id, description, thumbnail, layout_image, status, created_at
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
    INSERT INTO buildings (title, slug, street_id, description, thumbnail, layout_image, status)
    VALUES (${title}, ${slug}, ${streetId}, ${description}, ${thumbnail}, ${layoutImage}, ${status})
    RETURNING id, title, slug, street_id, description, thumbnail, layout_image, status, created_at
  `;

  return NextResponse.json(building, { status: 201 });
}
