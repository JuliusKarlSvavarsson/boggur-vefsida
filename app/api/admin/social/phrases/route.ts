import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

type SocialPhraseRow = {
  id: string;
  kind: string;
  text: string;
  active: boolean;
  created_at: string;
};

export async function GET() {
  const sql = getSql();

  try {
    const rows = (await sql`
      SELECT id, kind, text, active, created_at
      FROM social_phrases
      ORDER BY created_at ASC, id ASC
    `) as SocialPhraseRow[];

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const sql = getSql();
  const body = await request.json();

  const kind = String(body.kind ?? "").trim().toLowerCase();
  const text = String(body.text ?? "").trim();

  if (!text) {
    return NextResponse.json(
      { error: "Texti má ekki vera tómur." },
      { status: 400 },
    );
  }

  if (kind !== "hook" && kind !== "cta") {
    return NextResponse.json(
      { error: "Ógildur flokkur. Notaðu 'hook' eða 'cta'." },
      { status: 400 },
    );
  }

  const [row] = (await sql`
    INSERT INTO social_phrases (kind, text, active)
    VALUES (${kind}, ${text}, true)
    RETURNING id, kind, text, active, created_at
  `) as SocialPhraseRow[];

  return NextResponse.json(row, { status: 201 });
}
