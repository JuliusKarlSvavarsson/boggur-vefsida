import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const { password } = body;

  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD er ekki skilgreint á vefþjóni." },
      { status: 500 },
    );
  }

  if (!password || password !== expectedPassword) {
    return NextResponse.json({ error: "Rangt aðgangsorð." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
