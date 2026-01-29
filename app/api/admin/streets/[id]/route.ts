import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
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
    UPDATE streets
    SET name = ${name}, image = ${image}
    WHERE id = ${params.id}
    RETURNING id, name, image, created_at
  `;

  if (!street) {
    return NextResponse.json({ error: "Street not found" }, { status: 404 });
  }

  return NextResponse.json(street);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();

  await sql`DELETE FROM streets WHERE id = ${params.id}`;

  return NextResponse.json({ success: true });
}
