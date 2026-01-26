import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();
  const body = await request.json();

  const title = (body.title ?? "").trim();
  const description = body.description ?? null;
  const image = body.image ?? null;

  if (!title) {
    return NextResponse.json(
      { error: "Title is required." },
      { status: 400 },
    );
  }

  const [service] = await sql`
    UPDATE services
    SET title = ${title}, description = ${description}, image = ${image}
    WHERE id = ${params.id}
    RETURNING id, title, description, image, created_at
  `;

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();

  await sql`DELETE FROM services WHERE id = ${params.id}`;

  return NextResponse.json({ success: true });
}
