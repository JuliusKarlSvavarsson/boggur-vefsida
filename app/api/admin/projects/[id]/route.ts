import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
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
    UPDATE projects
    SET title = ${title}, slug = ${slug}, description = ${description}, image = ${image}, location = ${location}, status = ${status}
    WHERE id = ${params.id}
    RETURNING id, title, slug, description, image, location, status, created_at
  `;

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();

  await sql`DELETE FROM projects WHERE id = ${params.id}`;

  return NextResponse.json({ success: true });
}
