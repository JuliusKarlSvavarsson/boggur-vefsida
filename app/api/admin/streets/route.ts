import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const streets = await sql`
    SELECT id, name, image, is_featured, featured_order, created_at
    FROM streets
    ORDER BY created_at ASC
  `;

  return NextResponse.json(streets);
}

export async function POST(request: Request) {
  const sql = getSql();
  const body = await request.json();

  const name = (body.name ?? "").trim();
  const image = body.image ?? null;
  const isFeatured = Boolean(body.is_featured);
  const featuredOrder =
    body.featured_order != null && body.featured_order !== ""
      ? Number(body.featured_order)
      : 0;

  if (!name) {
    return NextResponse.json(
      { error: "Name is required." },
      { status: 400 },
    );
  }

  const [street] = await sql`
    INSERT INTO streets (name, image, is_featured, featured_order)
    VALUES (${name}, ${image}, ${isFeatured}, ${featuredOrder})
    RETURNING id, name, image, is_featured, featured_order, created_at
  `;

  return NextResponse.json(street, { status: 201 });
}
