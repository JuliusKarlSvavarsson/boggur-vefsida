import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
};

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

export async function GET(_request: Request, context: { params: { slug: string } }) {
  const { slug } = context.params;
  const sql = getSql();

  const projects = (await sql`
    SELECT id, title, slug, description, image
    FROM projects
    WHERE slug = ${slug}
    LIMIT 1
  `) as ProjectRow[];

  const project = projects[0];

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const apartments = (await sql`
    SELECT id, project_id, floor, number, status, size, rooms, layout_image, parking_spot
    FROM apartments
    WHERE project_id = ${project.id}
    ORDER BY floor DESC, number ASC
  `) as ApartmentRow[];

  return NextResponse.json({ project, apartments });
}
