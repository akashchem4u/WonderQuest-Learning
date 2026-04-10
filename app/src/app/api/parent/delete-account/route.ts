import { NextRequest, NextResponse } from "next/server";
import { requireParentAccessSession } from "@/lib/parent-access";
import { PARENT_SESSION_COOKIE_NAME } from "@/lib/parent-access";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    // 1. Find students linked ONLY to this guardian (no other parents, no teachers)
    const soloStudents = await db.query(
      `SELECT gsl.student_id
       FROM public.guardian_student_links gsl
       WHERE gsl.guardian_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM public.guardian_student_links other
           WHERE other.student_id = gsl.student_id
             AND other.guardian_id != $1
         )
         AND NOT EXISTS (
           SELECT 1 FROM public.teacher_student_roster tsr
           WHERE tsr.student_id = gsl.student_id AND tsr.active = true
         )`,
      [guardianId],
    );

    // 2. Clear FK blockers
    await db.query(
      `DELETE FROM public.coppa_consents WHERE guardian_id = $1`,
      [guardianId],
    );
    await db.query(
      `UPDATE public.feedback_items SET guardian_id = NULL WHERE guardian_id = $1`,
      [guardianId],
    );

    // 3. Delete solo-linked students (cascade handles their sessions, skills, etc.)
    for (const row of soloStudents.rows) {
      await db.query(
        `DELETE FROM public.student_profiles WHERE id = $1`,
        [row.student_id as string],
      );
    }

    // 4. Delete guardian — cascade handles:
    //    access_sessions, guardian_pushed_activities, guardian_student_links,
    //    notification_preferences, password_reset_tokens, push_subscriptions,
    //    student_notifications, weekly_digest_sends
    await db.query(
      `DELETE FROM public.guardian_profiles WHERE id = $1`,
      [guardianId],
    );

    // 5. Clear session cookie
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: PARENT_SESSION_COOKIE_NAME,
      value: "",
      maxAge: 0,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("delete-account error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete account." },
      { status: 500 },
    );
  }
}
