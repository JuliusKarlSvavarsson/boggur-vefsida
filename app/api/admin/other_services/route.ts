import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export async function GET() {
  const sql = getSql();

  const services = await sql`
    SELECT id, title, description, image, created_at
    FROM other_services
    ORDER BY created_at ASC
  `;

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const sql = getSql();
  const body = await request.json();

  const title = (body.title ?? "").trim();
  const description = body.description ?? null;
  const image = body.image ?? null;

  if (!title) {
    return NextResponse.json(
      { error: "Title is required." },
      { status: 400 },
    );
  }

  const [service] = await sql`
    INSERT INTO other_services (title, description, image)
    VALUES (${title}, ${description}, ${image})
    RETURNING id, title, description, image, created_at
  `;

  return NextResponse.json(service, { status: 201 });
}
