import { NextResponse } from "next/server";
import { getSql } from "@/app/lib/db";

type SocialSettingsRow = {
  apartment_weight: number;
  building_weight: number;
  project_weight: number;
  service_weight: number;
};

const DEFAULT_SETTINGS: SocialSettingsRow = {
  apartment_weight: 50,
  building_weight: 25,
  project_weight: 13,
  service_weight: 12,
};

export async function GET() {
  const sql = getSql();

  try {
    const rows = (await sql`
      SELECT apartment_weight, building_weight, project_weight, service_weight
      FROM social_settings
      ORDER BY id
      LIMIT 1
    `) as SocialSettingsRow[];

    if (!rows || rows.length === 0) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const row = rows[0];
    return NextResponse.json({
      apartment_weight: Number(row.apartment_weight ?? DEFAULT_SETTINGS.apartment_weight),
      building_weight: Number(row.building_weight ?? DEFAULT_SETTINGS.building_weight),
      project_weight: Number(row.project_weight ?? DEFAULT_SETTINGS.project_weight),
      service_weight: Number(row.service_weight ?? DEFAULT_SETTINGS.service_weight),
    });
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(request: Request) {
  const sql = getSql();
  const body = await request.json();

  const apartment_weight = Math.max(0, Math.round(Number(body.apartment_weight ?? DEFAULT_SETTINGS.apartment_weight)));
  const building_weight = Math.max(0, Math.round(Number(body.building_weight ?? DEFAULT_SETTINGS.building_weight)));
  const project_weight = Math.max(0, Math.round(Number(body.project_weight ?? DEFAULT_SETTINGS.project_weight)));
  const service_weight = Math.max(0, Math.round(Number(body.service_weight ?? DEFAULT_SETTINGS.service_weight)));

  if (apartment_weight + building_weight + project_weight + service_weight === 0) {
    return NextResponse.json(
      { error: "Heildarþyngd má ekki vera 0." },
      { status: 400 },
    );
  }

  const [row] = (await sql`
    INSERT INTO social_settings (id, apartment_weight, building_weight, project_weight, service_weight, updated_at)
    VALUES (1, ${apartment_weight}, ${building_weight}, ${project_weight}, ${service_weight}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      apartment_weight = EXCLUDED.apartment_weight,
      building_weight = EXCLUDED.building_weight,
      project_weight = EXCLUDED.project_weight,
      service_weight = EXCLUDED.service_weight,
      updated_at = NOW()
    RETURNING apartment_weight, building_weight, project_weight, service_weight
  `) as SocialSettingsRow[];

  return NextResponse.json(row);
}
