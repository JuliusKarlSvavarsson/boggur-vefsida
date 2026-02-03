import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const members = await sql`
    SELECT id, name, role, image, phone, email, sort_order, created_at
    FROM team_members
    ORDER BY sort_order IS NULL, sort_order ASC, created_at ASC
  `;

  return NextResponse.json(members);
}

export async function POST(request: Request) {
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
    INSERT INTO team_members (name, role, image, phone, email, sort_order)
    VALUES (${name}, ${role}, ${image}, ${phone}, ${email}, ${sort_order})
    RETURNING id, name, role, image, phone, email, sort_order, created_at
  `;

  return NextResponse.json(member, { status: 201 });
}
