import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET(_request: Request, context: { params: { slug: string } }) {
  const { slug } = context.params;
  const sql = getSql();

  const projects = await sql<{ id: string; title: string; slug: string; description: string | null; image: string | null }[]>`
    SELECT id, title, slug, description, image
    FROM projects
    WHERE slug = ${slug}
    LIMIT 1
  `;

  const project = projects[0];

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const apartments = await sql<{
    id: string;
    project_id: string;
    floor: number;
    number: string;
    status: string;
    size: number | null;
    rooms: number | null;
    layout_image: string | null;
    parking_spot: string | null;
  }[]>`
    SELECT id, project_id, floor, number, status, size, rooms, layout_image, parking_spot
    FROM apartments
    WHERE project_id = ${project.id}
    ORDER BY floor DESC, number ASC
  `;

  return NextResponse.json({ project, apartments });
}
