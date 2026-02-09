import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

export const dynamic = "force-dynamic";

type SocialItemType = "building" | "project" | "service" | "apartment";

type MarkPostedBody = {
  type: SocialItemType;
  id: string;
};

export async function POST(request: Request) {
  const sql = getSql();

  let body: MarkPostedBody;
  try {
    body = (await request.json()) as MarkPostedBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { type, id } = body || ({} as MarkPostedBody);

  if (!type || !id || typeof id !== "string") {
    return NextResponse.json(
      { error: "type and id are required" },
      { status: 400 },
    );
  }

  let updated: { id: string }[] = [];

  if (type === "building") {
    updated = (await sql`
      UPDATE buildings
      SET last_social_posted_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `) as { id: string }[];
  } else if (type === "project") {
    updated = (await sql`
      UPDATE projects
      SET last_social_posted_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `) as { id: string }[];
  } else if (type === "service") {
    updated = (await sql`
      UPDATE services
      SET last_social_posted_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `) as { id: string }[];
  } else if (type === "apartment") {
    updated = (await sql`
      UPDATE apartments
      SET last_social_posted_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `) as { id: string }[];
  } else {
    return NextResponse.json(
      { error: "Unsupported type. Must be one of: building, project, service, apartment." },
      { status: 400 },
    );
  }

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    type,
    id,
  });
}
