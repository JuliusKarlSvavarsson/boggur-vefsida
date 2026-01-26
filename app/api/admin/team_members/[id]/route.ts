import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();
  const body = await request.json();

  const name = (body.name ?? "").trim();
  const role = (body.role ?? "").trim();
  const image = body.image ?? null;

  if (!name || !role) {
    return NextResponse.json(
      { error: "Name and role are required." },
      { status: 400 },
    );
  }

  const [member] = await sql`
    UPDATE team_members
    SET name = ${name}, role = ${role}, image = ${image}
    WHERE id = ${params.id}
    RETURNING id, name, role, image, created_at
  `;

  if (!member) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();

  await sql`DELETE FROM team_members WHERE id = ${params.id}`;

  return NextResponse.json({ success: true });
}
