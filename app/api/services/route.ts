import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const services = await sql`
    SELECT id, title, description, image, created_at
    FROM services
    ORDER BY created_at ASC
  `;

  return NextResponse.json(services);
}
