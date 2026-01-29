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
