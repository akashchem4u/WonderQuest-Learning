// milestone-service.ts
// Detect learning milestones after sessions and provide weekly summary data.

import { db } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MilestoneType =
  | "level-up"
  | "badge-earned"
  | "streak-7"
  | "streak-30"
  | "first-session"
  | "sessions-10"
  | "sessions-50"
  | "skill-mastered";

export type Milestone = {
  type: MilestoneType;
  title: string;
  description: string;
  value?: number | string;
  earnedAt: string;
};

export type WeeklySummary = {
  studentId: string;
  studentName: string;
  weekStart: string;
  weekEnd: string;
  sessionsCompleted: number;
  pointsEarned: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracyPercent: number;
  currentStreak: number;
  currentLevel: number;
  badgeCount: number;
  milestones: Milestone[];
};

// ─── Milestone icon/description helpers ───────────────────────────────────────

function buildMilestone(
  type: MilestoneType,
  value?: number | string,
  earnedAt?: string,
): Milestone {
  const at = earnedAt ?? new Date().toISOString();

  switch (type) {
    case "level-up":
      return {
        type,
        title: `Leveled up to Level ${value}!`,
        description: `Your child reached Level ${value}. They are making great progress!`,
        value,
        earnedAt: at,
      };
    case "badge-earned":
      return {
        type,
        title: "Earned a new badge!",
        description: "A new badge was unlocked for their hard work and consistency.",
        value,
        earnedAt: at,
      };
    case "streak-7":
      return {
        type,
        title: "7-day streak achieved!",
        description: "They have played every day for a full week. Incredible consistency!",
        value: 7,
        earnedAt: at,
      };
    case "streak-30":
      return {
        type,
        title: "30-day streak — legendary!",
        description: "A whole month of daily learning. This is a remarkable achievement!",
        value: 30,
        earnedAt: at,
      };
    case "first-session":
      return {
        type,
        title: "First session completed!",
        description: "They completed their very first WonderQuest session. The adventure begins!",
        value: 1,
        earnedAt: at,
      };
    case "sessions-10":
      return {
        type,
        title: "10 sessions completed!",
        description: "Double digits! They are building a real learning habit.",
        value: 10,
        earnedAt: at,
      };
    case "sessions-50":
      return {
        type,
        title: "50 sessions completed!",
        description: "50 sessions and counting — a true WonderQuest explorer!",
        value: 50,
        earnedAt: at,
      };
    case "skill-mastered":
      return {
        type,
        title: `Mastered a skill!`,
        description: `They achieved mastery in "${value}". Time to celebrate!`,
        value,
        earnedAt: at,
      };
  }
}

// ─── Milestone detection ──────────────────────────────────────────────────────

export async function detectNewMilestones(
  studentId: string,
  sessionId: string,
  prevProgression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    streakCount: number;
  },
): Promise<Milestone[]> {
  const now = new Date().toISOString();
  const milestones: Milestone[] = [];

  // Fetch current progression state
  const progResult = await db.query(
    `
      select current_level, badge_count, streak_count
      from public.progression_states
      where student_id = $1
      limit 1
    `,
    [studentId],
  );

  if (!progResult.rowCount) {
    return milestones;
  }

  const curr = progResult.rows[0];
  const currentLevel = Number(curr.current_level ?? 1);
  const badgeCount = Number(curr.badge_count ?? 0);
  const streakCount = Number(curr.streak_count ?? 0);

  // Level up
  if (currentLevel > prevProgression.currentLevel) {
    milestones.push(buildMilestone("level-up", currentLevel, now));
  }

  // Badge earned
  if (badgeCount > prevProgression.badgeCount) {
    milestones.push(buildMilestone("badge-earned", badgeCount, now));
  }

  // Streak milestones — only fire when crossing the threshold exactly
  const prevStreak = prevProgression.streakCount;
  if (streakCount >= 30 && prevStreak < 30) {
    milestones.push(buildMilestone("streak-30", 30, now));
  } else if (streakCount >= 7 && prevStreak < 7) {
    milestones.push(buildMilestone("streak-7", 7, now));
  }

  // Session count milestones
  const sessionCountResult = await db.query(
    `
      select count(*) as total
      from public.challenge_sessions
      where student_id = $1 and ended_at is not null
    `,
    [studentId],
  );

  const totalSessions = Number(sessionCountResult.rows[0]?.total ?? 0);

  if (totalSessions === 1) {
    milestones.push(buildMilestone("first-session", 1, now));
  } else if (totalSessions === 10) {
    milestones.push(buildMilestone("sessions-10", 10, now));
  } else if (totalSessions === 50) {
    milestones.push(buildMilestone("sessions-50", 50, now));
  }

  return milestones;
}

// ─── Store milestones in student_notifications ─────────────────────────────────

export async function storeMilestoneNotifications(
  studentId: string,
  milestones: Milestone[],
): Promise<void> {
  if (milestones.length === 0) return;

  // Find all guardians linked to this student
  const guardianResult = await db.query(
    `
      select guardian_id
      from public.guardian_student_links
      where student_id = $1
    `,
    [studentId],
  );

  const guardianIds: (string | null)[] = guardianResult.rows.length > 0
    ? guardianResult.rows.map((r) => r.guardian_id as string)
    : [null];

  for (const milestone of milestones) {
    for (const guardianId of guardianIds) {
      await db.query(
        `
          insert into public.student_notifications (
            student_id, guardian_id, type, title, description, value, created_at
          ) values ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          studentId,
          guardianId,
          milestone.type,
          milestone.title,
          milestone.description,
          milestone.value != null ? String(milestone.value) : null,
          milestone.earnedAt,
        ],
      );
    }
  }
}

// ─── Get all milestone history for a student ──────────────────────────────────

export async function getStudentMilestones(
  studentId: string,
  limit = 20,
): Promise<Milestone[]> {
  const result = await db.query(
    `
      select type, title, description, value, created_at
      from public.student_notifications
      where student_id = $1
      order by created_at desc
      limit $2
    `,
    [studentId, limit],
  );

  return result.rows.map((row) => ({
    type: row.type as MilestoneType,
    title: row.title as string,
    description: row.description as string,
    value: row.value != null ? (row.value as string) : undefined,
    earnedAt: row.created_at as string,
  }));
}

// ─── Weekly summary ───────────────────────────────────────────────────────────

export async function getWeeklySummary(
  guardianId: string,
  studentId: string,
): Promise<WeeklySummary> {
  // Verify guardian is linked to this student
  const linkResult = await db.query(
    `
      select gsl.student_id, sp.display_name
      from public.guardian_student_links gsl
      join public.student_profiles sp on sp.id = gsl.student_id
      where gsl.guardian_id = $1 and gsl.student_id = $2
      limit 1
    `,
    [guardianId, studentId],
  );

  const studentName =
    linkResult.rows.length > 0
      ? (linkResult.rows[0].display_name as string)
      : "your child";

  // Week boundaries (Mon–Sun)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun
  const daysFromMon = (dayOfWeek + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysFromMon);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Sessions this week
  const sessionsResult = await db.query(
    `
      select
        count(*) as sessions_completed,
        coalesce(sum(sr_agg.points), 0) as points_earned,
        coalesce(sum(sr_agg.questions), 0) as questions_answered,
        coalesce(sum(sr_agg.correct), 0) as correct_answers
      from public.challenge_sessions cs
      left join lateral (
        select
          sum(sr.points_earned) as points,
          count(*)              as questions,
          count(*) filter (where sr.correct) as correct
        from public.session_results sr
        where sr.session_id = cs.id
      ) sr_agg on true
      where cs.student_id = $1
        and cs.ended_at is not null
        and cs.started_at >= $2
        and cs.started_at <= $3
    `,
    [studentId, weekStart.toISOString(), weekEnd.toISOString()],
  );

  const sessRow = sessionsResult.rows[0];
  const sessionsCompleted = Number(sessRow?.sessions_completed ?? 0);
  const pointsEarned = Number(sessRow?.points_earned ?? 0);
  const questionsAnswered = Number(sessRow?.questions_answered ?? 0);
  const correctAnswers = Number(sessRow?.correct_answers ?? 0);
  const accuracyPercent =
    questionsAnswered > 0
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0;

  // Current progression
  const progResult = await db.query(
    `
      select current_level, badge_count, streak_count
      from public.progression_states
      where student_id = $1
      limit 1
    `,
    [studentId],
  );

  const progRow = progResult.rows[0];
  const currentLevel = Number(progRow?.current_level ?? 1);
  const badgeCount = Number(progRow?.badge_count ?? 0);
  const currentStreak = Number(progRow?.streak_count ?? 0);

  // Milestones earned this week
  const milestoneResult = await db.query(
    `
      select type, title, description, value, created_at
      from public.student_notifications
      where student_id = $1
        and guardian_id = $2
        and created_at >= $3
        and created_at <= $4
      order by created_at asc
    `,
    [studentId, guardianId, weekStart.toISOString(), weekEnd.toISOString()],
  );

  const milestones: Milestone[] = milestoneResult.rows.map((row) => ({
    type: row.type as MilestoneType,
    title: row.title as string,
    description: row.description as string,
    value: row.value != null ? (row.value as string) : undefined,
    earnedAt: row.created_at as string,
  }));

  return {
    studentId,
    studentName,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    sessionsCompleted,
    pointsEarned,
    questionsAnswered,
    correctAnswers,
    accuracyPercent,
    currentStreak,
    currentLevel,
    badgeCount,
    milestones,
  };
}
