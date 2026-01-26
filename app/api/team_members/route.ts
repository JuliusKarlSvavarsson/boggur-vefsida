import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const teamMembers = await sql`
    SELECT id, name, role, image, created_at
    FROM team_members
    ORDER BY created_at ASC
  `;

  return NextResponse.json(teamMembers);
}
