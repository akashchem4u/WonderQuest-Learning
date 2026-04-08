import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  try {
    // 1. Skills summary
    const skillsSummary = await db.query(`
      SELECT
        COUNT(*) as total_skills,
        COUNT(*) FILTER (WHERE active = true) as published_skills,
        COUNT(*) FILTER (WHERE active = false) as inactive_skills
      FROM public.skills
    `);

    // 2. Skills by band
    const byBand = await db.query(`
      SELECT launch_band_code, COUNT(*) as skill_count
      FROM public.skills
      WHERE active = true
      GROUP BY launch_band_code
      ORDER BY launch_band_code
    `);

    // 3. Skills by subject
    const bySubject = await db.query(`
      SELECT s.display_name as subject, COUNT(sk.id) as skill_count
      FROM public.subjects s
      LEFT JOIN public.skills sk ON sk.subject_code = s.code AND sk.active = true
      GROUP BY s.display_name
      ORDER BY skill_count DESC
    `);

    // 4. Question bank totals
    const questionStats = await db.query(`
      SELECT COUNT(*) as total_questions, COUNT(DISTINCT skill_id) as skills_with_questions
      FROM public.example_items
      WHERE active = true
    `);

    // 5. Skills with no questions (coverage gaps)
    const skillGaps = await db.query(`
      SELECT sk.code, sk.display_name, sk.launch_band_code
      FROM public.skills sk
      LEFT JOIN public.example_items ei ON ei.skill_id = sk.id AND ei.active = true
      WHERE sk.active = true
      GROUP BY sk.id, sk.code, sk.display_name, sk.launch_band_code
      HAVING COUNT(ei.id) = 0
      ORDER BY sk.launch_band_code, sk.display_name
      LIMIT 20
    `);

    // 6. High miss rate skills (last 30 days, min 5 attempts)
    const highMissRate = await db.query(`
      SELECT
        sk.code,
        sk.display_name,
        sk.launch_band_code,
        COUNT(sr.id) as total_attempts,
        COUNT(sr.id) FILTER (WHERE sr.correct = false) as misses,
        ROUND(100.0 * COUNT(sr.id) FILTER (WHERE sr.correct = false) / NULLIF(COUNT(sr.id), 0)) as miss_rate_pct
      FROM public.session_results sr
      JOIN public.example_items ei ON ei.id = sr.example_item_id
      JOIN public.skills sk ON sk.id = ei.skill_id
      WHERE sr.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY sk.id, sk.code, sk.display_name, sk.launch_band_code
      HAVING COUNT(sr.id) >= 5
      ORDER BY miss_rate_pct DESC
      LIMIT 10
    `);

    const s = skillsSummary.rows[0];
    const q = questionStats.rows[0];
    const totalSkills = Number(s.total_skills);
    const skillsWithQuestions = Number(q.skills_with_questions);

    return NextResponse.json({
      summary: {
        totalSkills,
        publishedSkills: Number(s.published_skills),
        inactiveSkills: Number(s.inactive_skills),
        totalQuestions: Number(q.total_questions),
        skillsWithQuestions,
        skillsWithoutQuestions: totalSkills - skillsWithQuestions,
      },
      byBand: byBand.rows.map(r => ({ bandCode: r.launch_band_code, skillCount: Number(r.skill_count) })),
      bySubject: bySubject.rows.map(r => ({ subject: r.subject, skillCount: Number(r.skill_count) })),
      skillGaps: skillGaps.rows.map(r => ({ code: r.code, displayName: r.display_name, bandCode: r.launch_band_code })),
      highMissRate: highMissRate.rows.map(r => ({
        code: r.code,
        displayName: r.display_name,
        bandCode: r.launch_band_code,
        totalAttempts: Number(r.total_attempts),
        misses: Number(r.misses),
        missRatePct: Number(r.miss_rate_pct),
      })),
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[content-health]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
