import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const streets = await sql`
    SELECT id, name, image, created_at
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

  if (!name) {
    return NextResponse.json(
      { error: "Name is required." },
      { status: 400 },
    );
  }

  const [street] = await sql`
    INSERT INTO streets (name, image)
    VALUES (${name}, ${image})
    RETURNING id, name, image, created_at
  `;

  return NextResponse.json(street, { status: 201 });
}
