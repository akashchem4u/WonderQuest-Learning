import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// GET /api/admin/students — list all students
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await db.query(`
      SELECT
        sp.id,
        sp.display_name,
        sp.username,
        sp.avatar_key,
        sp.launch_band_code,
        sp.age_label,
        sp.reading_independence_level,
        sp.tester_flag,
        sp.is_virtual,
        sp.last_active_at,
        sp.birth_year,
        sp.interests,
        COUNT(DISTINCT gsl.guardian_id) AS guardian_count,
        COUNT(DISTINCT tsr.teacher_id) AS teacher_count,
        COUNT(DISTINCT cs.id) AS session_count
      FROM public.student_profiles sp
      LEFT JOIN public.guardian_student_links gsl ON gsl.student_id = sp.id
      LEFT JOIN public.teacher_student_roster tsr ON tsr.student_id = sp.id
      LEFT JOIN public.challenge_sessions cs ON cs.student_id = sp.id
      GROUP BY sp.id
      ORDER BY sp.display_name ASC
    `);

    return NextResponse.json({ students: result.rows });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/students GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
