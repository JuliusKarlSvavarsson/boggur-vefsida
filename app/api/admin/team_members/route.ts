import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const members = await sql`
    SELECT id, name, role, image, created_at
    FROM team_members
    ORDER BY created_at ASC
  `;

  return NextResponse.json(members);
}

export async function POST(request: Request) {
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
    INSERT INTO team_members (name, role, image)
    VALUES (${name}, ${role}, ${image})
    RETURNING id, name, role, image, created_at
  `;

  return NextResponse.json(member, { status: 201 });
}
