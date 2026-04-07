import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { db } from "@/lib/db";

// ─── POST /api/parent/push-session ───────────────────────────────────────────
//
// Body: { studentId, skillCode, priority?, note? }
//   priority: 'urgent' | 'normal'  (default 'normal')
//
// Inserts a guardian_pushed_activities row that will be consumed by the next
// play session the child starts.

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const { studentId, skillCode, priority, note } = body as Record<string, unknown>;

    if (typeof studentId !== "string" || !studentId.trim()) {
      return NextResponse.json({ error: "studentId is required." }, { status: 400 });
    }

    if (typeof skillCode !== "string" || !skillCode.trim()) {
      return NextResponse.json({ error: "skillCode is required." }, { status: 400 });
    }

    const normalizedPriority =
      priority === "urgent" || priority === "normal" ? priority : "normal";

    const normalizedNote =
      typeof note === "string" && note.trim().length > 0
        ? note.trim().slice(0, 500)
        : null;

    // Verify guardian owns the student via guardian_student_links
    const linkCheck = await db.query(
      `
        select 1
        from public.guardian_student_links
        where guardian_id = $1
          and student_id = $2
        limit 1
      `,
      [guardianId, studentId.trim()],
    );

    if (!linkCheck.rowCount) {
      return NextResponse.json(
        { error: "You do not have access to this student." },
        { status: 403 },
      );
    }

    const insert = await db.query(
      `
        insert into public.guardian_pushed_activities (
          guardian_id,
          student_id,
          skill_code,
          priority,
          note
        )
        values ($1, $2, $3, $4, $5)
        returning id
      `,
      [
        guardianId,
        studentId.trim(),
        skillCode.trim(),
        normalizedPriority,
        normalizedNote,
      ],
    );

    return NextResponse.json(
      { ok: true, activityId: insert.rows[0].id as string },
      { status: 201 },
    );
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to push activity." },
      { status },
    );
  }
}
