import { NextRequest, NextResponse } from "next/server";
import { requireChildAccessSession } from "@/lib/child-access";

export async function PATCH(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const body = await request.json();
    const { db } = await import("@/lib/db");

    const sets: string[] = ["updated_at = now()"];
    const vals: unknown[] = [studentId];

    if (body.avatarKey) {
      vals.push(body.avatarKey);
      sets.push(`avatar_key = $${vals.length}`);
    }
    if (body.preferredThemeCode !== undefined) {
      vals.push(body.preferredThemeCode || null);
      sets.push(`preferred_theme_code = $${vals.length}`);
    }

    await db.query(
      `update public.student_profiles set ${sets.join(", ")} where id = $1`,
      vals,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 },
    );
  }
}
