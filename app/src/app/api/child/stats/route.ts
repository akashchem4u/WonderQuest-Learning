import { NextRequest, NextResponse } from "next/server";
import { requireChildAccessSession } from "@/lib/child-access";

export async function GET(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const { db } = await import("@/lib/db");

    const [prog, sessions, masteryRes, profileRes, lastSkillRes] = await Promise.all([
      db.query(
        `select total_points, current_level, badge_count, trophy_count
         from public.progression_states where student_id = $1`,
        [studentId],
      ),
      db.query(
        `select started_at, correct_answers, total_questions, points_earned
         from public.play_sessions
         where student_id = $1 and ended_at is not null
         order by started_at desc limit 7`,
        [studentId],
      ),
      db.query(
        `select count(*) as mastered_count
         from public.student_skill_mastery
         where student_id = $1 and mastery_score >= 80`,
        [studentId],
      ),
      db.query(
        `select display_name, coalesce(interests, '{}') as interests
         from public.student_profiles where id = $1`,
        [studentId],
      ),
      db.query(
        `select sk.display_name as skill_name
         from public.student_skill_mastery ssm
         join public.skills sk on sk.id = ssm.skill_id
         where ssm.student_id = $1
         order by ssm.last_seen_at desc nulls last
         limit 1`,
        [studentId],
      ),
    ]);

    // Calculate streak from play_sessions (days with at least one session)
    const days = new Set(
      sessions.rows.map((r: Record<string, unknown>) =>
        new Date(r.started_at as string).toDateString(),
      ),
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (days.has(d.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    const p = prog.rows[0] ?? {};
    const last = sessions.rows[0];
    const masteredCount = Number(masteryRes.rows[0]?.mastered_count ?? 0);
    const displayName = (profileRes.rows[0]?.display_name as string | undefined) ?? null;
    const interests: string[] = (profileRes.rows[0]?.interests as string[] | undefined) ?? [];
    const lastSkillName = (lastSkillRes.rows[0]?.skill_name as string | undefined) ?? null;

    return NextResponse.json({
      totalPoints: Number(p.total_points ?? 0),
      currentLevel: Number(p.current_level ?? 1),
      badgeCount: Number(p.badge_count ?? 0),
      trophyCount: Number(p.trophy_count ?? 0),
      streakDays: streak,
      masteredSkillsCount: masteredCount,
      displayName,
      interests,
      lastSkillName,
      lastSession: last
        ? {
            correctAnswers: Number(last.correct_answers ?? 0),
            totalQuestions: Number(last.total_questions ?? 0),
            pointsEarned: Number(last.points_earned ?? 0),
          }
        : null,
    });
  } catch {
    return NextResponse.json({
      totalPoints: 0,
      currentLevel: 1,
      badgeCount: 0,
      trophyCount: 0,
      streakDays: 0,
      masteredSkillsCount: 0,
      displayName: null,
      interests: [],
      lastSkillName: null,
      lastSession: null,
    });
  }
}
