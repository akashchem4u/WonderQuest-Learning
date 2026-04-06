// parent-activity-service.ts
// Activity feed and skill progress data for the parent lane.

import { db } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecentSession = {
  sessionId: string;
  startedAt: string;
  sessionMode: string;
  starsEarned: number;
  correctCount: number;
  totalQuestions: number;
  durationMinutes: number | null;
  skillNames: string[];
};

export type SkillProgress = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  launchBandCode: string;
  correctCount: number;
  totalCount: number;
  masteryPct: number;
  lastPracticed: string | null;
};

export type ChildProfile = {
  id: string;
  username: string;
  displayName: string;
  launchBandCode: string;
  avatarKey: string;
  totalPoints: number;
  currentLevel: number;
  streakCount: number;
  badgeCount: number;
  unlockedBadges: unknown[];
};

// ─── Access guard ─────────────────────────────────────────────────────────────

async function verifyGuardianLink(
  guardianId: string,
  studentId: string,
): Promise<boolean> {
  const result = await db.query(
    `select 1 from public.guardian_student_links
     where guardian_id = $1 and student_id = $2 limit 1`,
    [guardianId, studentId],
  );
  return (result.rowCount ?? 0) > 0;
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getChildRecentSessions(
  guardianId: string,
  studentId: string,
  limit = 20,
): Promise<RecentSession[]> {
  const linked = await verifyGuardianLink(guardianId, studentId);
  if (!linked) return [];

  const sessionsRes = await db.query(
    `select
       cs.id,
       cs.started_at,
       cs.session_mode,
       cs.total_questions,
       extract(epoch from (cs.ended_at - cs.started_at)) / 60 as duration_minutes,
       count(sr.id) filter (where sr.correct) as correct_count,
       coalesce(sum(sr.points_earned), 0) as stars_earned
     from public.challenge_sessions cs
     left join public.session_results sr on sr.session_id = cs.id
     where cs.student_id = $1
     group by cs.id
     order by cs.started_at desc
     limit $2`,
    [studentId, limit],
  );

  const sessionIds: string[] = sessionsRes.rows.map((r) => r.id as string);

  if (sessionIds.length === 0) return [];

  // Fetch distinct skill names for each session
  const skillsRes = await db.query(
    `select sr.session_id, sk.display_name
     from public.session_results sr
     join public.skills sk on sk.id = sr.skill_id
     where sr.session_id = any($1::uuid[])
     group by sr.session_id, sk.display_name`,
    [sessionIds],
  );

  const skillsBySession: Record<string, string[]> = {};
  for (const row of skillsRes.rows) {
    const sid = row.session_id as string;
    if (!skillsBySession[sid]) skillsBySession[sid] = [];
    skillsBySession[sid].push(row.display_name as string);
  }

  return sessionsRes.rows.map((r) => ({
    sessionId: r.id as string,
    startedAt: r.started_at as string,
    sessionMode: r.session_mode as string,
    starsEarned: Number(r.stars_earned),
    correctCount: Number(r.correct_count),
    totalQuestions: Number(r.total_questions),
    durationMinutes:
      r.duration_minutes != null ? Math.round(Number(r.duration_minutes)) : null,
    skillNames: skillsBySession[r.id as string] ?? [],
  }));
}

export async function getChildSkillProgress(
  guardianId: string,
  studentId: string,
): Promise<SkillProgress[]> {
  const linked = await verifyGuardianLink(guardianId, studentId);
  if (!linked) return [];

  const result = await db.query(
    `select
       sk.code as skill_code,
       sk.display_name as skill_name,
       sk.subject_code,
       sk.launch_band_code,
       count(*) filter (where sr.correct) as correct_count,
       count(*) as total_count,
       max(cs.started_at) as last_practiced
     from public.session_results sr
     join public.challenge_sessions cs on cs.id = sr.session_id
     join public.skills sk on sk.id = sr.skill_id
     where cs.student_id = $1
     group by sk.id, sk.code, sk.display_name, sk.subject_code, sk.launch_band_code
     order by last_practiced desc`,
    [studentId],
  );

  return result.rows.map((r) => {
    const correct = Number(r.correct_count);
    const total = Number(r.total_count);
    return {
      skillCode: r.skill_code as string,
      skillName: r.skill_name as string,
      subjectCode: r.subject_code as string,
      launchBandCode: r.launch_band_code as string,
      correctCount: correct,
      totalCount: total,
      masteryPct: total > 0 ? Math.round((correct / total) * 100) : 0,
      lastPracticed: r.last_practiced != null ? (r.last_practiced as string) : null,
    };
  });
}

export async function getChildProfile(
  guardianId: string,
  studentId: string,
): Promise<ChildProfile | null> {
  const linked = await verifyGuardianLink(guardianId, studentId);
  if (!linked) return null;

  const result = await db.query(
    `select
       sp.id,
       sp.username,
       sp.display_name,
       sp.launch_band_code,
       sp.avatar_key,
       coalesce(ps.total_points, 0) as total_points,
       coalesce(ps.current_level, 1) as current_level,
       coalesce(ps.streak_count, 0) as streak_count,
       coalesce(ps.badge_count, 0) as badge_count,
       coalesce(ps.unlocked_badges, '[]'::jsonb) as unlocked_badges
     from public.student_profiles sp
     left join public.progression_states ps on ps.student_id = sp.id
     where sp.id = $1
     limit 1`,
    [studentId],
  );

  if (!result.rowCount) return null;
  const r = result.rows[0];

  return {
    id: r.id as string,
    username: r.username as string,
    displayName: r.display_name as string,
    launchBandCode: r.launch_band_code as string,
    avatarKey: r.avatar_key as string,
    totalPoints: Number(r.total_points),
    currentLevel: Number(r.current_level),
    streakCount: Number(r.streak_count),
    badgeCount: Number(r.badge_count),
    unlockedBadges: Array.isArray(r.unlocked_badges) ? r.unlocked_badges : [],
  };
}
