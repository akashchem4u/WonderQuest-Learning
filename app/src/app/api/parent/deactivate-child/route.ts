import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";

export async function PATCH(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = (await request.json()) as { childId: string; deactivate: boolean };

    if (!body.childId) {
      return NextResponse.json({ error: "childId is required." }, { status: 400 });
    }

    // Verify this parent owns this child
    const link = await db.query(
      `select 1 from public.guardian_student_links where guardian_id = $1 and student_id = $2 limit 1`,
      [guardianId, body.childId],
    );
    if (!link.rowCount) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    await db.query(
      `update public.student_profiles
       set deactivated_at = $2, updated_at = now()
       where id = $1`,
      [body.childId, body.deactivate ? new Date().toISOString() : null],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update child status." },
      { status },
    );
  }
}
