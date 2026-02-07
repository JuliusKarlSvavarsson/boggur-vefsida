import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

// Debug endpoint to inspect which database the app is using and
// what apartments it sees for a given building_id.
export async function GET(request: Request) {
  const sql = getSql();
  const url = new URL(request.url);
  const buildingId = url.searchParams.get("building_id");

  if (!buildingId) {
    return NextResponse.json(
      { error: "Missing building_id query parameter" },
      { status: 400 },
    );
  }

  // Safely derive the database name (no credentials) from DATABASE_URL
  const connectionString = process.env.DATABASE_URL ?? "";
  let dbName: string | null = null;
  try {
    const parsed = new URL(connectionString);
    dbName = parsed.pathname.replace(/^\//, "") || null;
  } catch {
    dbName = null;
  }

  const apartments = await sql`
    SELECT id, building_id, number, size
    FROM apartments
    WHERE building_id = ${buildingId}
    ORDER BY number ASC
  `;

  return NextResponse.json({
    dbName,
    buildingId,
    apartmentCount: apartments.length,
    apartments,
  });
}
