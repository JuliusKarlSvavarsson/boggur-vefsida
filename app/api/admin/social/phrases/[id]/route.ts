import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

type SocialPhraseRow = {
  id: string;
  kind: string;
  text: string;
  active: boolean;
  created_at: string;
};

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();
  const id = Number(params.id);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json(
      { error: "Ógilt auðkenni." },
      { status: 400 },
    );
  }

  const body = await request.json();
  const fields: string[] = [];
  const values: any[] = [];

  if (typeof body.text === "string") {
    fields.push("text = ");
    values.push(body.text.trim());
  }
  if (typeof body.active === "boolean") {
    fields.push("active = ");
    values.push(body.active);
  }

  if (fields.length === 0) {
    return NextResponse.json(
      { error: "Ekkert að uppfæra." },
      { status: 400 },
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : undefined;
  const active =
    typeof body.active === "boolean" ? Boolean(body.active) : undefined;

  const [row] = (await sql`
    UPDATE social_phrases
    SET
      text = COALESCE(${text}, text),
      active = COALESCE(${active}, active)
    WHERE id = ${id}
    RETURNING id, kind, text, active, created_at
  `) as SocialPhraseRow[];

  if (!row) {
    return NextResponse.json(
      { error: "Fann ekki texta." },
      { status: 404 },
    );
  }

  return NextResponse.json(row);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sql = getSql();
  const id = Number(params.id);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json(
      { error: "Ógilt auðkenni." },
      { status: 400 },
    );
  }

  const result = await sql`
    DELETE FROM social_phrases
    WHERE id = ${id}
    RETURNING id
  ` as { id: string }[];

  if (!result || result.length === 0) {
    return NextResponse.json(
      { error: "Fann ekki texta." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
