import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const otherServices = await sql`
    SELECT id, title, description, image, created_at
    FROM other_services
    ORDER BY created_at ASC
  `;

  return NextResponse.json(otherServices);
}
