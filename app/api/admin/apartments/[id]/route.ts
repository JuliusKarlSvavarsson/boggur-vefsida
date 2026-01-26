import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
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
    UPDATE apartments
    SET project_id = ${projectId}, floor = ${floor}, number = ${number}, status = ${status}, size = ${size}, rooms = ${rooms}, layout_image = ${layoutImage}, parking_spot = ${parkingSpot}
    WHERE id = ${params.id}
    RETURNING id, project_id, floor, number, status, size, rooms, layout_image, parking_spot, created_at
  `;

  if (!apartment) {
    return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
  }

  return NextResponse.json(apartment);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();

  await sql`DELETE FROM apartments WHERE id = ${params.id}`;

  return NextResponse.json({ success: true });
}
