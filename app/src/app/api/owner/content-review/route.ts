import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  try {
    // High miss-rate skills: join student_skill_mastery with skills, filter miss rate > 40%
    // miss_rate = 1 - (correct_attempts / attempts) for skills with >= 5 attempts
    const highMissSkills = await db.query(`
      SELECT
        sk.code as skill_code,
        sk.display_name,
        sk.launch_band_code,
        SUM(ssm.attempts) as total_attempts,
        SUM(ssm.correct_attempts) as total_correct,
        ROUND(
          (1.0 - SUM(ssm.correct_attempts)::numeric / NULLIF(SUM(ssm.attempts), 0)) * 100
        , 1) as miss_rate_pct,
        COUNT(DISTINCT ssm.student_id) as student_count,
        COUNT(DISTINCT ei.id) as question_count
      FROM public.student_skill_mastery ssm
      JOIN public.skills sk ON sk.id = ssm.skill_id
      LEFT JOIN public.example_items ei ON ei.skill_id = sk.id AND ei.active = true
      GROUP BY sk.id, sk.code, sk.display_name, sk.launch_band_code
      HAVING
        SUM(ssm.attempts) >= 5
        AND (1.0 - SUM(ssm.correct_attempts)::numeric / NULLIF(SUM(ssm.attempts), 0)) > 0.4
      ORDER BY miss_rate_pct DESC
      LIMIT 20
    `);

    // Recently flagged content items (last 7 days) from feedback_triage joined to feedback_items
    const recentlyFlagged = await db.query(`
      SELECT
        fi.id,
        fi.created_at,
        ft.ai_category as category,
        ft.summary,
        ft.urgency,
        coalesce(ft.review_status, 'pending') as status
      FROM public.feedback_items fi
      JOIN public.feedback_triage ft ON ft.feedback_id = fi.id
      WHERE ft.ai_category = 'content'
        AND fi.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY fi.created_at DESC
      LIMIT 20
    `);

    // Skill review queue items
    const skillReviewItems = await db.query(`
      SELECT
        id,
        skill_code,
        status,
        notes,
        reviewed_by,
        created_at
      FROM public.skill_review_queue
      ORDER BY created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({
      highMissSkills: highMissSkills.rows.map((r) => ({
        skillCode: r.skill_code as string,
        displayName: (r.display_name as string | null) ?? r.skill_code,
        bandCode: (r.launch_band_code as string | null) ?? "—",
        missRatePct: Number(r.miss_rate_pct),
        totalAttempts: Number(r.total_attempts),
        studentCount: Number(r.student_count),
        questionCount: Number(r.question_count),
      })),
      recentlyFlagged: recentlyFlagged.rows.map((r) => ({
        id: r.id as string,
        createdAt: r.created_at as string,
        category: (r.category as string | null) ?? "content",
        summary: (r.summary as string | null) ?? "",
        urgency: (r.urgency as string | null) ?? "low",
        status: r.status as string,
      })),
      skillReviewItems: skillReviewItems.rows.map((r) => ({
        id: r.id as string,
        skillCode: r.skill_code as string,
        status: r.status as string,
        notes: (r.notes as string | null) ?? null,
        reviewedBy: (r.reviewed_by as string | null) ?? null,
        createdAt: r.created_at as string,
      })),
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[content-review GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  try {
    const body = (await request.json()) as {
      skillCode?: string;
      action?: string;
      note?: string;
    };

    const { skillCode, action, note } = body;

    if (!skillCode || typeof skillCode !== "string") {
      return NextResponse.json({ error: "skillCode is required." }, { status: 400 });
    }
    if (!action || !["flag", "approve", "dismiss"].includes(action)) {
      return NextResponse.json(
        { error: "action must be one of: flag, approve, dismiss." },
        { status: 400 },
      );
    }

    await db.query(
      `
      INSERT INTO public.skill_review_queue (skill_code, status, notes, reviewed_by)
      VALUES ($1, $2, $3, 'owner')
      `,
      [skillCode, action, note ?? null],
    );

    return NextResponse.json({ ok: true, skillCode, action });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[content-review POST]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
