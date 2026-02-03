import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const teamMembers = await sql`
    SELECT id, name, role, image, phone, email, sort_order, created_at
    FROM team_members
    ORDER BY sort_order IS NULL, sort_order ASC, created_at ASC
  `;

  return NextResponse.json(teamMembers);
}
