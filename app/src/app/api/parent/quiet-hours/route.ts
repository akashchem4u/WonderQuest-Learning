import { NextRequest, NextResponse } from "next/server";
import {
  requireParentAccessSession,
  ParentAccessSessionError,
} from "@/lib/parent-access";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const result = await db.query(
      `select quiet_hours_settings from public.guardian_profiles where id = $1 limit 1`,
      [guardianId],
    );
    const settings = result.rows[0]?.quiet_hours_settings ?? null;
    return NextResponse.json({ settings });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed." },
      { status },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json();
    const { settings } = body as { settings: unknown };
    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "settings object required." },
        { status: 400 },
      );
    }
    await db.query(
      `update public.guardian_profiles set quiet_hours_settings = $2 where id = $1`,
      [guardianId, JSON.stringify(settings)],
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed." },
      { status },
    );
  }
}
