// parent-report-service.ts
// Weekly and all-time child activity reports for the parent lane.

import { db } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StudentSessionSummary = {
  totalSessions: number;
  completedSessions: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracyPct: number | null;
  activeDays: number;
};

export type ChildWeeklyReport = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  avatarKey: string;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  stats: {
    starsEarned: number;
    sessions: number;
    learningMinutes: number;
    newBadges: number;
    streakDays: number;
  };
  skills: {
    skillId: string;
    skillName: string;
    subject: string;
    correctCount: number;
    totalCount: number;
    masteryPct: number;
    sessionCount: number;
  }[];
  sessionLog: {
    sessionId: string;
    startedAt: string;
    sessionMode: string;
    starsEarned: number;
    correctCount: number;
    totalQuestions: number;
    durationMinutes: number | null;
    effectivenessScore: number | null;
  }[];
  heatmap: {
    dayLabel: string;
    date: string;
    sessionCount: number;
  }[];
};

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Returns aggregate session + accuracy stats for a student over the last
 * `windowDays` days. Pass windowDays = 0 for all-time.
 * Does NOT enforce guardian access — callers are responsible for verifying
 * the guardian-student link before calling this function.
 */
export async function getStudentSessionSummary(
  studentId: string,
  windowDays: number,
): Promise<StudentSessionSummary> {
  const windowClause =
    windowDays > 0
      ? `and cs.started_at >= now() - interval '${windowDays} days'`
      : "";

  const result = await db.query(
    `select
       count(distinct cs.id) as total_sessions,
       count(distinct cs.id) filter (where cs.ended_at is not null) as completed_sessions,
       count(sr.id) filter (where sr.correct) as total_correct,
       count(sr.id) as total_questions,
       count(distinct date_trunc('day', cs.started_at)) as active_days
     from public.challenge_sessions cs
     left join public.session_results sr on sr.session_id = cs.id
     where cs.student_id = $1
     ${windowClause}`,
    [studentId],
  );

  const r = result.rows[0];
  const totalCorrect = Number(r.total_correct ?? 0);
  const totalQuestions = Number(r.total_questions ?? 0);

  return {
    totalSessions: Number(r.total_sessions ?? 0),
    completedSessions: Number(r.completed_sessions ?? 0),
    totalCorrect,
    totalQuestions,
    accuracyPct:
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null,
    activeDays: Number(r.active_days ?? 0),
  };
}

export async function getChildWeeklyReport(
  guardianId: string,
  studentId: string,
  weekOffset = 0,
): Promise<ChildWeeklyReport | null> {
  // Verify this guardian has access to the student
  const linkCheck = await db.query(
    `select 1 from public.guardian_student_links
     where guardian_id = $1 and student_id = $2 limit 1`,
    [guardianId, studentId],
  );
  if (!linkCheck.rowCount) return null;

  // Compute week boundaries (Monday–Sunday)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday
  const daysToMonday = (dayOfWeek + 6) % 7;
  const weekStartMs =
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
    daysToMonday * 86400_000 -
    weekOffset * 7 * 86400_000;
  const weekEndMs = weekStartMs + 7 * 86400_000;

  const weekStart = new Date(weekStartMs).toISOString();
  const weekEnd = new Date(weekEndMs).toISOString();

  const [profileRes, sessionsRes, skillsRes] = await Promise.all([
    db.query(
      `select sp.display_name, sp.launch_band_code, sp.avatar_key,
              coalesce(ps.streak_count, 0) as streak_count,
              coalesce(ps.badge_count, 0) as badge_count
       from public.student_profiles sp
       left join public.progression_states ps on ps.student_id = sp.id
       where sp.id = $1 limit 1`,
      [studentId],
    ),
    db.query(
      `select cs.id, cs.started_at, cs.session_mode, cs.total_questions,
              cs.effectiveness_score,
              extract(epoch from (cs.ended_at - cs.started_at)) / 60 as duration_minutes,
              count(sr.id) filter (where sr.correct) as correct_count,
              coalesce(sum(sr.points_earned), 0) as stars_earned
       from public.challenge_sessions cs
       left join public.session_results sr on sr.session_id = cs.id
       where cs.student_id = $1
         and cs.started_at >= $2 and cs.started_at < $3
       group by cs.id
       order by cs.started_at desc`,
      [studentId, weekStart, weekEnd],
    ),
    db.query(
      `select sr.skill_id,
              sk.display_name as skill_name,
              sk.subject_code as subject,
              count(*) filter (where sr.correct) as correct_count,
              count(*) as total_count,
              count(distinct cs.id) as session_count
       from public.session_results sr
       join public.challenge_sessions cs on cs.id = sr.session_id
       join public.skills sk on sk.id = sr.skill_id
       where cs.student_id = $1
         and cs.started_at >= $2 and cs.started_at < $3
       group by sr.skill_id, sk.display_name, sk.subject_code
       order by correct_count desc`,
      [studentId, weekStart, weekEnd],
    ),
  ]);

  if (!profileRes.rowCount) return null;

  const p = profileRes.rows[0];

  // Build heatmap for the 7 days of this week
  const heatmap: ChildWeeklyReport["heatmap"] = [];
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < 7; i++) {
    const dayMs = weekStartMs + i * 86400_000;
    const dayStart = new Date(dayMs).toISOString();
    const dayEnd = new Date(dayMs + 86400_000).toISOString();
    const count = sessionsRes.rows.filter(
      (r) => r.started_at >= dayStart && r.started_at < dayEnd,
    ).length;
    heatmap.push({
      dayLabel: DAY_LABELS[i],
      date: dayStart.split("T")[0],
      sessionCount: count,
    });
  }

  const totalStars = sessionsRes.rows.reduce((s, r) => s + Number(r.stars_earned), 0);
  const totalMinutes = sessionsRes.rows.reduce((s, r) => s + (r.duration_minutes != null ? Number(r.duration_minutes) : 0), 0);

  // Format week label
  const wStart = new Date(weekStartMs);
  const wEnd = new Date(weekEndMs - 86400_000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const weekLabel = `${fmt(wStart)} – ${fmt(wEnd)}`;

  return {
    studentId,
    displayName: p.display_name as string,
    launchBandCode: p.launch_band_code as string,
    avatarKey: p.avatar_key as string,
    weekLabel,
    weekStart,
    weekEnd,
    stats: {
      starsEarned: totalStars,
      sessions: sessionsRes.rowCount ?? 0,
      learningMinutes: Math.round(totalMinutes),
      newBadges: Number(p.badge_count ?? 0),
      streakDays: Number(p.streak_count),
    },
    skills: skillsRes.rows.map((r) => {
      const correct = Number(r.correct_count);
      const total = Number(r.total_count);
      return {
        skillId: r.skill_id as string,
        skillName: r.skill_name as string,
        subject: (r.subject as string | null) ?? "General",
        correctCount: correct,
        totalCount: total,
        masteryPct: total > 0 ? Math.round((correct / total) * 100) : 0,
        sessionCount: Number(r.session_count),
      };
    }),
    sessionLog: sessionsRes.rows.map((r) => ({
      sessionId: r.id as string,
      startedAt: r.started_at as string,
      sessionMode: r.session_mode as string,
      starsEarned: Number(r.stars_earned),
      correctCount: Number(r.correct_count),
      totalQuestions: Number(r.total_questions),
      durationMinutes: r.duration_minutes != null ? Math.round(Number(r.duration_minutes)) : null,
      effectivenessScore: r.effectiveness_score != null ? Number(r.effectiveness_score) : null,
    })),
    heatmap,
  };
}
