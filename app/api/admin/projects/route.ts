import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const projects = await sql`
    SELECT id, title, slug, description, image, location, status, created_at
    FROM projects
    ORDER BY created_at DESC
  `;

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const sql = getSql();
  const body = await request.json();

  const title = (body.title ?? "").trim();
  const slug = (body.slug ?? "").trim();
  const description = body.description ?? null;
  const image = body.image ?? null;
  const location = body.location ?? null;
  const status = body.status ?? null;

  if (!title || !slug) {
    return NextResponse.json(
      { error: "Title and slug are required." },
      { status: 400 },
    );
  }

  const [project] = await sql`
    INSERT INTO projects (title, slug, description, image, location, status)
    VALUES (${title}, ${slug}, ${description}, ${image}, ${location}, ${status})
    RETURNING id, title, slug, description, image, location, status, created_at
  `;

  return NextResponse.json(project, { status: 201 });
}
