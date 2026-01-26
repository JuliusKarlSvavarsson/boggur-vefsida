import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET(request: Request) {
  const sql = getSql();
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project_id");

  const apartments = projectId
    ? await sql`
        SELECT id, project_id, floor, number, status, size, rooms, layout_image, parking_spot, created_at
        FROM apartments
        WHERE project_id = ${projectId}
        ORDER BY project_id, floor DESC, number ASC
      `
    : await sql`
        SELECT id, project_id, floor, number, status, size, rooms, layout_image, parking_spot, created_at
        FROM apartments
        ORDER BY project_id, floor DESC, number ASC
      `;

  return NextResponse.json(apartments);
}

export async function POST(request: Request) {
  const sql = getSql();
  const body = await request.json();

  const projectId = body.project_id as string | undefined;
  const floor = Number(body.floor);
  const number = (body.number ?? "").trim();
  const status = (body.status ?? "").trim().toLowerCase();
  const size = body.size != null ? Number(body.size) : null;
  const rooms = body.rooms != null ? Number(body.rooms) : null;
  const layoutImage = body.layout_image ?? null;
  const parkingSpot = body.parking_spot ?? null;

  if (!projectId || !number || !status) {
    return NextResponse.json(
      { error: "project_id, number and status are required." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(floor)) {
    return NextResponse.json({ error: "floor must be a number." }, { status: 400 });
  }

  if (!["available", "sold", "reserved"].includes(status)) {
    return NextResponse.json(
      { error: "status must be one of: available, sold, reserved." },
      { status: 400 },
    );
  }

  const [apartment] = await sql`
    INSERT INTO apartments (project_id, floor, number, status, size, rooms, layout_image, parking_spot)
    VALUES (${projectId}, ${floor}, ${number}, ${status}, ${size}, ${rooms}, ${layoutImage}, ${parkingSpot})
    RETURNING id, project_id, floor, number, status, size, rooms, layout_image, parking_spot, created_at
  `;

  return NextResponse.json(apartment, { status: 201 });
}
