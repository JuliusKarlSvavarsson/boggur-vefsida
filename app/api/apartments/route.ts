import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

type ApartmentRow = {
  id: string;
  project_id: string;
  floor: number;
  number: string;
  status: string;
  size: number | null;
  rooms: number | null;
  layout_image: string | null;
  parking_spot: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project_id");

  if (!projectId) {
    return NextResponse.json({ error: "Missing project_id query parameter" }, { status: 400 });
  }

  const sql = getSql();

  const apartments = (await sql`
    SELECT id, project_id, floor, number, status, size, rooms, layout_image, parking_spot
    FROM apartments
    WHERE project_id = ${projectId}
    ORDER BY floor DESC, number ASC
  `) as ApartmentRow[];

  return NextResponse.json(apartments);
}
