import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  try {
    // Active users (last 7 days and 30 days)
    const activeUsers = await db.query(`
      SELECT
        COUNT(DISTINCT student_id) FILTER (WHERE started_at >= now() - interval '7 days') AS dau_7d,
        COUNT(DISTINCT student_id) FILTER (WHERE started_at >= now() - interval '30 days') AS mau_30d
      FROM public.challenge_sessions
    `);

    // Session completion rates
    const completionRates = await db.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ended_at IS NOT NULL) AS completed,
        ROUND(100.0 * COUNT(*) FILTER (WHERE ended_at IS NOT NULL) / NULLIF(COUNT(*),0)) AS rate_pct,
        ROUND(AVG(EXTRACT(EPOCH FROM (ended_at - started_at))/60) FILTER (WHERE ended_at IS NOT NULL)) AS avg_duration_min
      FROM public.challenge_sessions
      WHERE started_at >= now() - interval '30 days'
    `);

    // Growth: new students per week (last 4 weeks)
    const weeklyGrowth = await db.query(`
      SELECT
        DATE_TRUNC('week', created_at) AS week,
        COUNT(*) AS new_students
      FROM public.student_profiles
      WHERE created_at >= now() - interval '4 weeks'
      GROUP BY 1
      ORDER BY 1
    `);

    // Retention: students active in week 1 and still active in week 2+
    const retention = await db.query(`
      SELECT
        COUNT(DISTINCT s1.student_id) AS cohort_size,
        COUNT(DISTINCT s2.student_id) AS retained
      FROM (
        SELECT DISTINCT student_id FROM public.challenge_sessions
        WHERE started_at BETWEEN now() - interval '14 days' AND now() - interval '7 days'
      ) s1
      LEFT JOIN (
        SELECT DISTINCT student_id FROM public.challenge_sessions
        WHERE started_at >= now() - interval '7 days'
      ) s2 ON s1.student_id = s2.student_id
    `);

    // Top skills by session count (engagement signal)
    const topSkills = await db.query(`
      SELECT sk.display_name, sk.launch_band_code, COUNT(sr.id) AS attempt_count,
        ROUND(100.0 * COUNT(sr.id) FILTER (WHERE sr.correct) / NULLIF(COUNT(sr.id), 0)) AS accuracy_pct
      FROM public.session_results sr
      JOIN public.example_items ei ON ei.id = sr.example_item_id
      JOIN public.skills sk ON sk.id = ei.skill_id
      WHERE sr.created_at >= now() - interval '7 days'
      GROUP BY sk.id, sk.display_name, sk.launch_band_code
      ORDER BY attempt_count DESC
      LIMIT 8
    `);

    const au = activeUsers.rows[0];
    const cr = completionRates.rows[0];
    const ret = retention.rows[0];

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      activeUsers: {
        last7d: Number(au.dau_7d),
        last30d: Number(au.mau_30d),
      },
      sessions: {
        total30d: Number(cr.total),
        completed30d: Number(cr.completed),
        completionRatePct: Number(cr.rate_pct ?? 0),
        avgDurationMin: Number(cr.avg_duration_min ?? 0),
      },
      weeklyGrowth: weeklyGrowth.rows.map((r) => ({
        week: r.week,
        newStudents: Number(r.new_students),
      })),
      retention: {
        cohortSize: Number(ret.cohort_size),
        retained: Number(ret.retained),
        ratePct:
          Number(ret.cohort_size) > 0
            ? Math.round((100 * Number(ret.retained)) / Number(ret.cohort_size))
            : 0,
      },
      topSkills: topSkills.rows.map((r) => ({
        name: r.display_name,
        band: r.launch_band_code,
        attempts: Number(r.attempt_count),
        accuracyPct: Number(r.accuracy_pct ?? 0),
      })),
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
