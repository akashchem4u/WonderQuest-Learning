import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!authHeader || authHeader !== process.env.CRON_SECRET?.trim()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    // 1. Collect expired guest guardian IDs
    const expiredGuardians = await db.query(
      `SELECT id FROM public.guardian_profiles
       WHERE is_guest = true AND guest_expires_at < now()`,
    );

    const guardianIds = expiredGuardians.rows.map((r) => r.id as string);

    if (guardianIds.length === 0) {
      return NextResponse.json({ ok: true, deletedGuardians: 0, deletedStudents: 0 });
    }

    // 2. Find all guest students linked only to these expired guardians
    //    (don't delete a student who is also linked to a live account)
    const orphanStudents = await db.query(
      `SELECT gsl.student_id
       FROM public.guardian_student_links gsl
       JOIN public.student_profiles sp ON sp.id = gsl.student_id
       WHERE gsl.guardian_id = ANY($1::uuid[])
         AND sp.is_guest = true
         AND NOT EXISTS (
           SELECT 1 FROM public.guardian_student_links gsl2
           WHERE gsl2.student_id = gsl.student_id
             AND gsl2.guardian_id <> ALL($1::uuid[])
         )`,
      [guardianIds],
    );

    const studentIds = orphanStudents.rows.map((r) => r.student_id as string);

    // 3. Delete in order: sessions → session_results handled by FK cascade
    //    Delete students (cascade removes progression_states, session results via FK)
    let deletedStudents = 0;
    if (studentIds.length > 0) {
      // Remove challenge_sessions first (no cascade on student delete in all setups)
      await db.query(
        `DELETE FROM public.challenge_sessions WHERE student_id = ANY($1::uuid[])`,
        [studentIds],
      );
      await db.query(
        `DELETE FROM public.progression_states WHERE student_id = ANY($1::uuid[])`,
        [studentIds],
      );
      await db.query(
        `DELETE FROM public.student_skill_mastery WHERE student_id = ANY($1::uuid[])`,
        [studentIds],
      );
      const ds = await db.query(
        `DELETE FROM public.student_profiles WHERE id = ANY($1::uuid[]) RETURNING id`,
        [studentIds],
      );
      deletedStudents = ds.rowCount ?? 0;
    }

    // 4. Delete expired guardian profiles (links cascade via FK or cleaned up above)
    const dg = await db.query(
      `DELETE FROM public.guardian_profiles
       WHERE id = ANY($1::uuid[])
       RETURNING id`,
      [guardianIds],
    );

    return NextResponse.json({
      ok: true,
      deletedGuardians: dg.rowCount ?? 0,
      deletedStudents,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed." },
      { status: 500 },
    );
  }
}
