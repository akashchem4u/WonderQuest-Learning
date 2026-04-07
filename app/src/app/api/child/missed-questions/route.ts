import { NextRequest, NextResponse } from "next/server";
import { requireChildAccessSession } from "@/lib/child-access";

const SUBJECT_EMOJI: Record<string, string> = {
  math: "🔢",
  phonics: "🔤",
  reading: "📖",
  writing: "✏️",
  science: "🔬",
  geography: "🌍",
  history: "🏛️",
  civics: "⚖️",
  logic: "🧩",
  "early-literacy": "🌟",
  "world-knowledge": "🌐",
};

export async function GET(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const { db } = await import("@/lib/db");

    const result = await db.query(
      `
      select
        sk.id as skill_id,
        sk.code as skill_code,
        sk.display_name,
        sk.subject_code,
        count(*) filter (where sr.correct = false) as miss_count,
        (
          select ei.prompt
          from public.example_items ei
          where ei.skill_id = sk.id
            and ei.active = true
          order by ei.difficulty asc
          limit 1
        ) as preview_prompt
      from public.session_results sr
      join public.challenge_sessions cs on cs.id = sr.session_id
      join public.skills sk on sk.id = sr.skill_id
      where cs.student_id = $1
        and sr.correct = false
        and cs.started_at >= now() - interval '30 days'
      group by sk.id, sk.code, sk.display_name, sk.subject_code
      having count(*) filter (where sr.correct = false) >= 1
      order by miss_count desc
      limit 10
      `,
      [studentId],
    );

    const questions = result.rows.map((row: Record<string, unknown>) => ({
      id: String(row.skill_id),
      subject: String(row.subject_code),
      subjectEmoji: SUBJECT_EMOJI[String(row.subject_code)] ?? "📚",
      preview: String(row.preview_prompt ?? row.display_name),
      missedCount: Number(row.miss_count ?? 0),
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load missed questions.",
      },
      { status: 400 },
    );
  }
}
