import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const projects = await sql`
    SELECT id, title, slug, description, image, location, status, created_at
    FROM projects
    ORDER BY created_at DESC
  `;

  return NextResponse.json(projects);
}
