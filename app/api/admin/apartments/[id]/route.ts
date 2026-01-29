import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();
  const body = await request.json();

  const projectId =
    body.project_id != null && String(body.project_id).trim() !== ""
      ? String(body.project_id)
      : null;
  const buildingId = body.building_id as string | undefined;
  const floor = Number(body.floor);
  const number = (body.number ?? "").trim();
  const status = (body.status ?? "").trim().toLowerCase();
  const size = body.size != null ? Number(body.size) : null;
  const rooms = body.rooms != null ? Number(body.rooms) : null;
  const layoutImage = body.layout_image ?? null;
  const parkingSpot = body.parking_spot ?? null;
  const xPosition =
    body.x_position != null && body.x_position !== ""
      ? Number(body.x_position)
      : null;
  const yPosition =
    body.y_position != null && body.y_position !== ""
      ? Number(body.y_position)
      : null;
  const width =
    body.width != null && body.width !== "" ? Number(body.width) : null;
  const height =
    body.height != null && body.height !== "" ? Number(body.height) : null;
  const interiorImages = Array.isArray(body.interior_images)
    ? (body.interior_images as string[]).filter((url) =>
        typeof url === "string" && url.trim().length > 0,
      )
    : null;

  if (!number || !status) {
    return NextResponse.json(
      { error: "number and status are required." },
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

  if (
    xPosition != null &&
    (!Number.isFinite(xPosition) || xPosition < 0 || xPosition > 100)
  ) {
    return NextResponse.json(
      { error: "x_position must be between 0 and 100 when provided." },
      { status: 400 },
    );
  }

  if (
    yPosition != null &&
    (!Number.isFinite(yPosition) || yPosition < 0 || yPosition > 100)
  ) {
    return NextResponse.json(
      { error: "y_position must be between 0 and 100 when provided." },
      { status: 400 },
    );
  }

  if (width != null && (!Number.isFinite(width) || width <= 0 || width > 100)) {
    return NextResponse.json(
      { error: "width must be between 0 and 100 when provided." },
      { status: 400 },
    );
  }

  if (
    height != null &&
    (!Number.isFinite(height) || height <= 0 || height > 100)
  ) {
    return NextResponse.json(
      { error: "height must be between 0 and 100 when provided." },
      { status: 400 },
    );
  }

  const [apartment] = await sql`
    UPDATE apartments
    SET project_id = ${projectId}, building_id = ${buildingId ?? null}, floor = ${floor}, number = ${number}, status = ${status}, size = ${size}, rooms = ${rooms}, layout_image = ${layoutImage}, interior_images = ${interiorImages}, parking_spot = ${parkingSpot}, x_position = ${xPosition}, y_position = ${yPosition}, width = ${width}, height = ${height}
    WHERE id = ${params.id}
    RETURNING id, project_id, building_id, floor, number, status, size, rooms, layout_image, interior_images, parking_spot, x_position, y_position, width, height, created_at
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
