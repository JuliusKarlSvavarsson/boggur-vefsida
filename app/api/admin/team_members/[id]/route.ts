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
  const phone = body.phone ? String(body.phone).trim() : null;
  const email = body.email ? String(body.email).trim() : null;
  let sort_order = body.sort_order as number | null;
  if (typeof sort_order !== "number" || !Number.isFinite(sort_order)) {
    sort_order = null;
  }

  if (!name || !role) {
    return NextResponse.json(
      { error: "Name and role are required." },
      { status: 400 },
    );
  }

  const [member] = await sql`
    UPDATE team_members
    SET name = ${name}, role = ${role}, image = ${image}, phone = ${phone}, email = ${email}, sort_order = ${sort_order}
    WHERE id = ${params.id}
    RETURNING id, name, role, image, phone, email, sort_order, created_at
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
