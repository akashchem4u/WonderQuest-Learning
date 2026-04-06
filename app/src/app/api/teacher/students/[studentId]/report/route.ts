import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidTeacherId } from "@/lib/teacher-identity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params;
  const teacherId = request.nextUrl.searchParams.get("teacherId");

  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
  }

  // Verify the student is on this teacher's roster
  const rosterCheck = await db.query(
    `select 1 from public.teacher_student_roster
     where teacher_id = $1 and student_id = $2
     limit 1`,
    [teacherId, studentId],
  );

  if (!rosterCheck.rowCount || rosterCheck.rows.length === 0) {
    return NextResponse.json(
      { error: "Student not found or not on your roster" },
      { status: 404 },
    );
  }

  // Fetch student profile
  const profileRes = await db.query(
    `select display_name, avatar_key, launch_band_code, username
     from public.student_profiles
     where id = $1`,
    [studentId],
  );

  if (!profileRes.rows.length) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const profile = profileRes.rows[0];

  // Session stats
  const statsRes = await db.query(
    `select
       count(*) as total_sessions,
       count(*) filter (where ended_at is not null) as completed_sessions,
       coalesce(sum(extract(epoch from (ended_at - started_at)) * 1000) filter (where ended_at is not null), 0) as total_time_ms,
       coalesce(avg(correct_answers::float / nullif(total_questions, 0) * 100) filter (where ended_at is not null and total_questions > 0), 0) as avg_accuracy_pct,
       coalesce(sum(points_earned), 0) as total_points
     from public.play_sessions
     where student_id = $1`,
    [studentId],
  );

  const stats = statsRes.rows[0] ?? {};

  // Recent sessions (last 10)
  const sessionsRes = await db.query(
    `select id, session_mode, started_at, ended_at, correct_answers, total_questions, points_earned, effectiveness_score
     from public.play_sessions
     where student_id = $1
     order by started_at desc
     limit 10`,
    [studentId],
  );

  // Streak: count consecutive days with at least one session up to today
  const streakRes = await db.query(
    `select distinct date_trunc('day', started_at at time zone 'UTC') as session_day
     from public.play_sessions
     where student_id = $1
     order by session_day desc`,
    [studentId],
  );

  let streakDays = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const oneDay = 86400_000;
  let expected = today.getTime();
  for (const row of streakRes.rows) {
    const dayTs = new Date(row.session_day as string).getTime();
    // Allow today or yesterday as first day
    if (streakDays === 0 && Math.abs(dayTs - expected) > oneDay) break;
    if (dayTs !== expected && dayTs !== expected - oneDay) break;
    streakDays++;
    expected = dayTs - oneDay;
  }

  // Skill progress — gracefully handle missing table
  let topSkills: { skillCode: string; masteryPct: number }[] = [];
  let skillGaps: { skillCode: string; masteryPct: number }[] = [];

  try {
    const skillRes = await db.query(
      `select skill_code, mastery_score
       from public.student_skill_progress
       where student_id = $1
       order by mastery_score desc`,
      [studentId],
    );

    const allSkills = skillRes.rows.map((r) => ({
      skillCode: r.skill_code as string,
      masteryPct: Math.round(Number(r.mastery_score) * 100),
    }));

    topSkills = allSkills.slice(0, 3);
    skillGaps = [...allSkills].reverse().slice(0, 3).filter((s) => s.masteryPct < 70);
  } catch {
    // Table may not exist — fall back to deriving from play_session_responses
    try {
      const derivedRes = await db.query(
        `select
           r.skill_code,
           round(avg(case when r.is_correct then 1.0 else 0.0 end) * 100) as mastery_pct
         from public.play_session_responses r
         join public.play_sessions ps on ps.id = r.session_id
         where ps.student_id = $1
           and r.skill_code is not null
         group by r.skill_code
         having count(*) >= 3
         order by mastery_pct desc`,
        [studentId],
      );

      const allSkills = derivedRes.rows.map((r) => ({
        skillCode: r.skill_code as string,
        masteryPct: Number(r.mastery_pct),
      }));

      topSkills = allSkills.slice(0, 3);
      skillGaps = [...allSkills].reverse().slice(0, 3).filter((s) => s.masteryPct < 70);
    } catch {
      // Both tables missing or query failed — return empty arrays
      topSkills = [];
      skillGaps = [];
    }
  }

  return NextResponse.json({
    student: {
      id: studentId,
      displayName: profile.display_name as string,
      avatarKey: (profile.avatar_key as string) ?? "",
      launchBandCode: (profile.launch_band_code as string) ?? "",
      username: (profile.username as string) ?? "",
    },
    stats: {
      totalSessions: Number(stats.total_sessions ?? 0),
      completedSessions: Number(stats.completed_sessions ?? 0),
      totalTimeMs: Number(stats.total_time_ms ?? 0),
      avgAccuracyPct: Math.round(Number(stats.avg_accuracy_pct ?? 0)),
      totalPoints: Number(stats.total_points ?? 0),
      streakDays,
    },
    recentSessions: sessionsRes.rows.map((r) => ({
      id: r.id as string,
      sessionMode: (r.session_mode as string) ?? "",
      startedAt: r.started_at as string,
      endedAt: (r.ended_at as string | null) ?? null,
      correctAnswers: Number(r.correct_answers ?? 0),
      totalQuestions: Number(r.total_questions ?? 0),
      pointsEarned: Number(r.points_earned ?? 0),
      effectivenessScore: r.effectiveness_score != null ? Number(r.effectiveness_score) : null,
    })),
    topSkills,
    skillGaps,
  });
}
