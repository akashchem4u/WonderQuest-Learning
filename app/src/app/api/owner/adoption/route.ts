import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  try {
    // Teacher adoption: sessions per teacher, last active
    const teacherAdoption = await db.query(`
      SELECT
        tp.id,
        tp.display_name,
        tp.username,
        tp.school_name,
        COUNT(DISTINCT cs.id) as session_count,
        COUNT(DISTINCT cs.student_id) as active_students,
        MAX(cs.started_at) as last_session_at,
        COUNT(DISTINCT cs.id) FILTER (WHERE cs.started_at >= now() - interval '7 days') as sessions_7d
      FROM public.teacher_profiles tp
      LEFT JOIN public.teacher_student_links tsl ON tsl.teacher_id = tp.id
      LEFT JOIN public.challenge_sessions cs ON cs.student_id = tsl.student_id
      GROUP BY tp.id, tp.display_name, tp.username, tp.school_name
      ORDER BY sessions_7d DESC, session_count DESC
      LIMIT 20
    `);

    // School-level rollup (group by school_name)
    const schoolAdoption = await db.query(`
      SELECT
        COALESCE(tp.school_name, 'Unknown School') as school_name,
        COUNT(DISTINCT tp.id) as teacher_count,
        COUNT(DISTINCT tsl.student_id) as student_count,
        COUNT(DISTINCT cs.id) as total_sessions,
        COUNT(DISTINCT cs.id) FILTER (WHERE cs.started_at >= now() - interval '7 days') as sessions_7d,
        MAX(cs.started_at) as last_activity_at
      FROM public.teacher_profiles tp
      LEFT JOIN public.teacher_student_links tsl ON tsl.teacher_id = tp.id
      LEFT JOIN public.challenge_sessions cs ON cs.student_id = tsl.student_id
      GROUP BY COALESCE(tp.school_name, 'Unknown School')
      ORDER BY sessions_7d DESC
      LIMIT 15
    `);

    // Funnel: signups → first session → week 2 active → week 4 active
    const funnel = await db.query(`
      SELECT
        COUNT(DISTINCT sp.id) as total_students,
        COUNT(DISTINCT cs1.student_id) as had_first_session,
        COUNT(DISTINCT cs7.student_id) as active_by_day7,
        COUNT(DISTINCT cs30.student_id) as active_by_day30
      FROM public.student_profiles sp
      LEFT JOIN (
        SELECT DISTINCT student_id FROM public.challenge_sessions
      ) cs1 ON cs1.student_id = sp.id
      LEFT JOIN (
        SELECT DISTINCT student_id FROM public.challenge_sessions
        WHERE started_at >= (
          SELECT MIN(started_at) FROM public.challenge_sessions cs2
          WHERE cs2.student_id = challenge_sessions.student_id
        ) + interval '7 days'
      ) cs7 ON cs7.student_id = sp.id
      LEFT JOIN (
        SELECT DISTINCT student_id FROM public.challenge_sessions
        WHERE started_at >= (
          SELECT MIN(started_at) FROM public.challenge_sessions cs3
          WHERE cs3.student_id = challenge_sessions.student_id
        ) + interval '30 days'
      ) cs30 ON cs30.student_id = sp.id
    `);

    // Guardian adoption (parents who have linked children)
    const guardianAdoption = await db.query(`
      SELECT
        COUNT(DISTINCT gp.id) as total_guardians,
        COUNT(DISTINCT gsl.guardian_id) as linked_guardians,
        COUNT(DISTINCT gsl.guardian_id) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM public.challenge_sessions cs
            WHERE cs.student_id = gsl.student_id
            AND cs.started_at >= now() - interval '7 days'
          )
        ) as active_parent_guardians_7d
      FROM public.guardian_profiles gp
      LEFT JOIN public.guardian_student_links gsl ON gsl.guardian_id = gp.id
    `);

    const f = funnel.rows[0];
    const g = guardianAdoption.rows[0];
    const totalStudents = Number(f.total_students);

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      funnel: {
        totalStudents,
        hadFirstSession: Number(f.had_first_session),
        activeByDay7: Number(f.active_by_day7),
        activeByDay30: Number(f.active_by_day30),
        firstSessionRate: totalStudents > 0 ? Math.round(100 * Number(f.had_first_session) / totalStudents) : 0,
      },
      guardians: {
        total: Number(g.total_guardians),
        linked: Number(g.linked_guardians),
        active7d: Number(g.active_parent_guardians_7d),
      },
      bySchool: schoolAdoption.rows.map(r => ({
        school: r.school_name,
        teachers: Number(r.teacher_count),
        students: Number(r.student_count),
        totalSessions: Number(r.total_sessions),
        sessions7d: Number(r.sessions_7d),
        lastActivityAt: r.last_activity_at,
      })),
      byTeacher: teacherAdoption.rows.map(r => ({
        id: r.id,
        name: r.display_name,
        username: r.username,
        school: r.school_name ?? "—",
        sessionCount: Number(r.session_count),
        activeStudents: Number(r.active_students),
        sessions7d: Number(r.sessions_7d),
        lastSessionAt: r.last_session_at,
      })),
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[adoption]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
