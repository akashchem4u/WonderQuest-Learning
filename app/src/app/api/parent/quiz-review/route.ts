import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const childId = request.nextUrl.searchParams.get("childId")?.trim();
    const sessionId = request.nextUrl.searchParams.get("sessionId")?.trim();

    if (!childId) {
      return NextResponse.json({ error: "childId is required." }, { status: 400 });
    }

    // Verify this parent owns this child
    const link = await db.query(
      `select 1 from public.guardian_student_links where guardian_id = $1 and student_id = $2 limit 1`,
      [guardianId, childId],
    );
    if (!link.rowCount) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    // If sessionId provided → return per-question breakdown for that session
    if (sessionId) {
      const questions = await db.query(
        `select sr.correct, sr.first_try, sr.hint_used, sr.remediation_triggered,
                sr.time_spent_ms, sr.points_earned,
                sk.display_name as skill_name, sk.subject_code
         from public.session_results sr
         left join public.skills sk on sk.id = sr.skill_id
         where sr.session_id = $1
         order by sr.created_at asc`,
        [sessionId],
      );
      return NextResponse.json({ questions: questions.rows });
    }

    // Otherwise → return list of recent sessions
    const sessions = await db.query(
      `select cs.id,
              cs.started_at,
              cs.ended_at,
              cs.session_mode,
              cs.total_questions,
              cs.theme_code,
              count(sr.id)::int                                              as answered,
              sum(case when sr.correct then 1 else 0 end)::int              as correct_count,
              sum(case when sr.hint_used then 1 else 0 end)::int            as hints_used,
              sum(case when sr.first_try and sr.correct then 1 else 0 end)::int as first_try_correct
       from public.challenge_sessions cs
       left join public.session_results sr on sr.session_id = cs.id
       where cs.student_id = $1
         and cs.ended_at is not null
       group by cs.id
       order by cs.started_at desc
       limit 20`,
      [childId],
    );

    return NextResponse.json({ sessions: sessions.rows });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load quiz history." },
      { status },
    );
  }
}
