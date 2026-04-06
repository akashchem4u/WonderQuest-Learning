// parent-service.ts
// Platform lane ownership (Phase 1 split from prototype-service.ts)
// Parent lane may extend this module during Phase 2.
//
// Exports: accessParent, restoreParentSession

import { db } from "@/lib/db";
import { getStudentSkillMastery } from "@/lib/mastery-service";
import {
  assertParentAccessAllowed,
  clearParentAccessFailures,
  recordParentAccessAttempt,
} from "@/lib/parent-access";
import { hashPin, normalizeUsername, validatePin, verifyPin } from "@/lib/pin";

// ─── Types ────────────────────────────────────────────────────────────────────

type ParentAccessInput = {
  username: string;
  pin: string;
  displayName?: string;
  childUsername?: string;
  relationship?: string;
  notifyWeekly?: boolean;
  notifyMilestones?: boolean;
};

type ParentAccessContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function ensureText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureBoolean(value: unknown) {
  return Boolean(value);
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function repairGuardianStudentLinks(guardianId: string) {
  const deleted = await db.query(
    `
      delete from public.guardian_student_links gsl
      where gsl.guardian_id = $1
        and not exists (
          select 1
          from public.student_profiles sp
          where sp.id = gsl.student_id
        )
    `,
    [guardianId],
  );

  return deleted.rowCount ?? 0;
}

async function getLinkedChildren(guardianId: string) {
  await repairGuardianStudentLinks(guardianId);

  const result = await db.query(
    `
      select
        sp.id,
        sp.username,
        sp.display_name,
        sp.launch_band_code,
        sp.avatar_key,
        ps.total_points,
        ps.current_level,
        ps.badge_count,
        ps.trophy_count
      from public.guardian_student_links gsl
      join public.student_profiles sp
        on sp.id = gsl.student_id
      left join public.progression_states ps
        on ps.student_id = sp.id
      where gsl.guardian_id = $1
      order by sp.display_name asc
    `,
    [guardianId],
  );

  return result.rows.map((row) => ({
    id: row.id as string,
    username: row.username as string,
    displayName: row.display_name as string,
    launchBandCode: row.launch_band_code as string,
    avatarKey: row.avatar_key as string,
    totalPoints: Number(row.total_points ?? 0),
    currentLevel: Number(row.current_level ?? 1),
    badgeCount: Number(row.badge_count ?? 0),
    trophyCount: Number(row.trophy_count ?? 0),
  }));
}

function mapNotificationPreferenceType(type: string) {
  if (
    type === "level_up" ||
    type === "badge" ||
    type === "streak" ||
    type === "milestone-earned"
  ) {
    return "milestone-earned";
  }

  return type;
}

async function getChildDashboard(studentId: string) {
  const summary = await db.query(
    `
      select
        (select count(*) from public.challenge_sessions where student_id = $1) as session_count,
        (select count(*) from public.challenge_sessions where student_id = $1 and ended_at is not null) as completed_session_count,
        (
          select coalesce(sum(sr.time_spent_ms), 0)
          from public.session_results sr
          join public.challenge_sessions cs
            on cs.id = sr.session_id
          where cs.student_id = $1
        ) as total_time_spent_ms,
        (
          select coalesce(sum(sr.effective_time_ms), 0)
          from public.session_results sr
          join public.challenge_sessions cs
            on cs.id = sr.session_id
          where cs.student_id = $1
        ) as effective_time_spent_ms,
        (
          select round(avg(effectiveness_score), 1)
          from public.challenge_sessions
          where student_id = $1 and effectiveness_score is not null
        ) as average_effectiveness,
        (
          select max(started_at)
          from public.challenge_sessions
          where student_id = $1
        ) as last_session_at
    `,
    [studentId],
  );

  const recentSessions = await db.query(
    `
      select
        id,
        session_mode,
        started_at,
        ended_at,
        effectiveness_score,
        total_questions
      from public.challenge_sessions
      where student_id = $1
      order by started_at desc
      limit 4
    `,
    [studentId],
  );

  const mastery = await db.query(
    `
      select
        sk.code as skill_code,
        sk.display_name,
        round(
          100.0 * count(*) filter (where sr.correct) / nullif(count(sr.id), 0),
          1
        ) as mastery_rate,
        count(sr.id) as attempts
      from public.session_results sr
      join public.challenge_sessions cs
        on cs.id = sr.session_id
      join public.skills sk
        on sk.id = sr.skill_id
      where cs.student_id = $1
      group by sk.code, sk.display_name
      having count(sr.id) > 0
    `,
    [studentId],
  );

  const mappedMastery = mastery.rows.map((row) => ({
    skillCode: row.skill_code as string,
    displayName: row.display_name as string,
    masteryRate: Number(row.mastery_rate ?? 0),
    attempts: Number(row.attempts ?? 0),
  }));

  const sessionCount = Number(summary.rows[0]?.session_count ?? 0);
  const completedSessions = Number(summary.rows[0]?.completed_session_count ?? 0);
  const totalTimeSpentMs = Number(summary.rows[0]?.total_time_spent_ms ?? 0);
  const effectiveTimeSpentMs = Number(
    summary.rows[0]?.effective_time_spent_ms ?? 0,
  );
  const averageEffectiveness =
    summary.rows[0]?.average_effectiveness === null
      ? null
      : Number(summary.rows[0]?.average_effectiveness);
  const strengths = [...mappedMastery]
    .sort((left, right) => right.masteryRate - left.masteryRate)
    .slice(0, 3);
  const supportAreas = [...mappedMastery]
    .sort((left, right) => left.masteryRate - right.masteryRate)
    .slice(0, 3);
  const completionRate =
    sessionCount > 0 ? Math.round((completedSessions / sessionCount) * 100) : null;
  const effectiveRatio =
    totalTimeSpentMs > 0
      ? Math.round((effectiveTimeSpentMs / totalTimeSpentMs) * 100)
      : null;
  const recommendedFocus =
    supportAreas[0]?.displayName ??
    strengths[0]?.displayName ??
    "Keep playing to unlock clearer patterns";
  const readinessLabel =
    averageEffectiveness === null
      ? "Building baseline"
      : averageEffectiveness >= 85
        ? "Ready for harder content"
        : averageEffectiveness >= 65
          ? "On track with support"
          : "Needs guided practice";

  return {
    studentId,
    sessionCount,
    completedSessions,
    totalTimeSpentMs,
    effectiveTimeSpentMs,
    averageEffectiveness,
    completionRate,
    effectiveRatio,
    lastSessionAt: (summary.rows[0]?.last_session_at as string | undefined) ?? null,
    strengths,
    supportAreas,
    recommendedFocus,
    readinessLabel,
    recentSessions: recentSessions.rows.map((row) => ({
      id: row.id as string,
      sessionMode: row.session_mode as string,
      startedAt: row.started_at as string,
      endedAt: (row.ended_at as string | undefined) ?? null,
      effectivenessScore:
        row.effectiveness_score === null
          ? null
          : Number(row.effectiveness_score),
      totalQuestions: Number(row.total_questions ?? 0),
    })),
  };
}

// ─── Exported service functions ───────────────────────────────────────────────

export async function accessParent(
  input: ParentAccessInput,
  context: ParentAccessContext = {},
) {
  const username = normalizeUsername(ensureText(input.username));
  const pin = ensureText(input.pin);
  const displayName = ensureText(input.displayName);
  const childUsername = normalizeUsername(ensureText(input.childUsername));
  const relationship = ensureText(input.relationship) || "parent";

  if (!username) {
    throw new Error("Parent username is required.");
  }

  if (!validatePin(pin)) {
    throw new Error("PIN must be exactly 4 digits.");
  }

  await assertParentAccessAllowed(username, context.ipAddress ?? null);

  let guardianRow: Record<string, unknown>;

  const existing = await db.query(
    `
      select id, username, display_name, pin_hash
      from public.guardian_profiles
      where username = $1
      limit 1
    `,
    [username],
  );

  if (existing.rowCount) {
    const row = existing.rows[0];

    if (!verifyPin(pin, username, row.pin_hash as string)) {
      await recordParentAccessAttempt({
        identifier: username,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        succeeded: false,
        failureReason: "wrong-pin",
      });
      throw new Error("Wrong username or PIN.");
    }

    guardianRow = row;
  } else {
    if (!displayName) {
      throw new Error("Display name is required for first-time parent setup.");
    }

    const inserted = await db.query(
      `
        insert into public.guardian_profiles (
          username,
          pin_hash,
          display_name,
          relationship_label
        )
        values ($1, $2, $3, $4)
        returning id, username, display_name
      `,
      [username, hashPin(pin, username), displayName, relationship],
    );

    guardianRow = inserted.rows[0];
  }

  let linkedChild = null;

  if (childUsername) {
    const child = await db.query(
      `
        select
          sp.id,
          sp.username,
          sp.display_name,
          sp.avatar_key,
          sp.launch_band_code,
          ps.total_points,
          ps.current_level,
          ps.badge_count,
          ps.trophy_count
        from public.student_profiles sp
        left join public.progression_states ps
          on ps.student_id = sp.id
        where sp.username = $1
        limit 1
      `,
      [childUsername],
    );

    if (!child.rowCount) {
      throw new Error("Child username was not found.");
    }

    linkedChild = child.rows[0];

    await db.query(
      `
        insert into public.guardian_student_links (guardian_id, student_id)
        values ($1, $2)
        on conflict (guardian_id, student_id) do nothing
      `,
      [guardianRow.id, linkedChild.id],
    );

    const preferenceRows = [
      {
        notificationType: "weekly-summary",
        enabled: ensureBoolean(input.notifyWeekly),
      },
      {
        notificationType: "milestone-earned",
        enabled: ensureBoolean(input.notifyMilestones),
      },
    ];

    for (const item of preferenceRows) {
      await db.query(
        `
          insert into public.notification_preferences (
            guardian_id,
            channel,
            notification_type,
            enabled,
            preferred_time_window
          )
          values ($1, 'in-app', $2, $3, 'evening')
          on conflict (guardian_id, channel, notification_type)
          do update set enabled = excluded.enabled, preferred_time_window = excluded.preferred_time_window
        `,
        [guardianRow.id, item.notificationType, item.enabled],
      );
    }
  }

  await clearParentAccessFailures(username, context.ipAddress ?? null);
  await recordParentAccessAttempt({
    identifier: username,
    ipAddress: context.ipAddress ?? null,
    userAgent: context.userAgent ?? null,
    succeeded: true,
    failureReason: null,
  });

  const linkedChildren = await getLinkedChildren(guardianRow.id as string);
  const dashboardStudentId =
    (linkedChild?.id as string | undefined) ?? linkedChildren[0]?.id;
  const childDashboards = (
    await Promise.all(
      linkedChildren.map((child) => getChildDashboard(child.id)),
    )
  ).filter((dashboard): dashboard is NonNullable<typeof dashboard> => Boolean(dashboard));
  const childDashboard = dashboardStudentId
    ? childDashboards.find((dashboard) => dashboard.studentId === dashboardStudentId) ??
      null
    : null;

  return {
    guardian: {
      id: guardianRow.id as string,
      username: guardianRow.username as string,
      displayName: guardianRow.display_name as string,
    },
    linkedChild: linkedChild
      ? {
          id: linkedChild.id as string,
          username: linkedChild.username as string,
          displayName: linkedChild.display_name as string,
          avatarKey: linkedChild.avatar_key as string,
          launchBandCode: linkedChild.launch_band_code as string,
          totalPoints: Number(linkedChild.total_points ?? 0),
          currentLevel: Number(linkedChild.current_level ?? 1),
          badgeCount: Number(linkedChild.badge_count ?? 0),
          trophyCount: Number(linkedChild.trophy_count ?? 0),
        }
      : null,
    linkedChildren,
    childDashboards,
    childDashboard,
  };
}

export async function restoreParentSession(guardianId: string) {
  await repairGuardianStudentLinks(guardianId);

  const guardianResult = await db.query(
    `
      select id, username, display_name
      from public.guardian_profiles
      where id = $1
      limit 1
    `,
    [guardianId],
  );

  if (!guardianResult.rowCount) {
    throw new Error("Guardian profile was not found.");
  }

  const guardianRow = guardianResult.rows[0];
  const linkedChildren = await getLinkedChildren(guardianId);
  const childDashboards = (
    await Promise.all(linkedChildren.map((child) => getChildDashboard(child.id)))
  ).filter((d): d is NonNullable<typeof d> => Boolean(d));
  const childDashboard = childDashboards[0] ?? null;

  return {
    guardian: {
      id: guardianRow.id as string,
      username: guardianRow.username as string,
      displayName: guardianRow.display_name as string,
    },
    linkedChild: null,
    linkedChildren,
    childDashboards,
    childDashboard,
  };
}

export async function getParentNotifications(
  guardianId: string,
  options: {
    includeRead?: boolean;
    limit?: number;
  } = {},
) {
  await repairGuardianStudentLinks(guardianId);

  const includeRead = Boolean(options.includeRead);
  const limit = Math.min(Math.max(Math.floor(options.limit ?? 25), 1), 100);
  const unreadCountResult = await db.query(
    `
      select count(*) as unread_count
      from public.student_notifications sn
      join public.guardian_student_links gsl
        on gsl.student_id = sn.student_id
       and gsl.guardian_id = $1
      left join public.notification_preferences np
        on np.guardian_id = $1
       and np.channel = 'in-app'
       and np.notification_type = (
         case
           when sn.type in ('level_up', 'badge', 'streak', 'milestone-earned')
             then 'milestone-earned'
           else sn.type
         end
       )
      where (sn.guardian_id is null or sn.guardian_id = $1)
        and sn.read = false
        and coalesce(np.enabled, true) = true
    `,
    [guardianId],
  );
  const result = await db.query(
    `
      select
        sn.id,
        sn.student_id,
        sn.type,
        sn.title,
        sn.description,
        sn.value,
        sn.read,
        sn.created_at,
        sp.display_name as student_display_name,
        sp.avatar_key,
        sp.launch_band_code
      from public.student_notifications sn
      join public.guardian_student_links gsl
        on gsl.student_id = sn.student_id
       and gsl.guardian_id = $1
      join public.student_profiles sp
        on sp.id = sn.student_id
      left join public.notification_preferences np
        on np.guardian_id = $1
       and np.channel = 'in-app'
       and np.notification_type = (
         case
           when sn.type in ('level_up', 'badge', 'streak', 'milestone-earned')
             then 'milestone-earned'
           else sn.type
         end
       )
      where (sn.guardian_id is null or sn.guardian_id = $1)
        and ($2::boolean or sn.read = false)
        and coalesce(np.enabled, true) = true
      order by sn.created_at desc, sn.id desc
      limit $3
    `,
    [guardianId, includeRead, limit],
  );

  const unreadCount = Number(unreadCountResult.rows[0]?.unread_count ?? 0);

  return {
    guardianId,
    unreadCount,
    notifications: result.rows.map((row) => ({
      id: String(row.id),
      studentId: String(row.student_id),
      studentDisplayName: String(row.student_display_name),
      avatarKey: String(row.avatar_key),
      launchBandCode: String(row.launch_band_code),
      preferenceType: mapNotificationPreferenceType(String(row.type)),
      type: String(row.type),
      title: String(row.title),
      description: String(row.description),
      value: row.value === null || row.value === undefined ? null : String(row.value),
      read: Boolean(row.read),
      createdAt: String(row.created_at),
    })),
  };
}

export async function getParentLinkHealth(guardianId: string) {
  const repairedBrokenLinks = await repairGuardianStudentLinks(guardianId);
  const linkRows = await db.query(
    `
      select
        gsl.id as link_id,
        gsl.student_id,
        sp.id as profile_student_id,
        sp.username,
        sp.display_name,
        sp.launch_band_code
      from public.guardian_student_links gsl
      left join public.student_profiles sp
        on sp.id = gsl.student_id
      where gsl.guardian_id = $1
      order by coalesce(sp.display_name, sp.username, '') asc, gsl.id asc
    `,
    [guardianId],
  );

  const links = await Promise.all(
    linkRows.rows.map(async (row) => {
      const studentId =
        row.student_id === null || row.student_id === undefined
          ? null
          : String(row.student_id);
      const hasStudentProfile =
        row.profile_student_id !== null && row.profile_student_id !== undefined;
      let dashboardReady = false;
      let issue: string | null = null;

      if (!studentId || !hasStudentProfile) {
        issue = "missing-student-profile";
      } else {
        try {
          await getChildDashboard(studentId);
          dashboardReady = true;
        } catch {
          issue = "dashboard-fetch-failed";
        }
      }

      return {
        linkId: String(row.link_id),
        studentId,
        username:
          row.username === null || row.username === undefined
            ? null
            : String(row.username),
        displayName:
          row.display_name === null || row.display_name === undefined
            ? null
            : String(row.display_name),
        launchBandCode:
          row.launch_band_code === null || row.launch_band_code === undefined
            ? null
            : String(row.launch_band_code),
        hasStudentProfile,
        dashboardReady,
        issue,
      };
    }),
  );

  return {
    guardianId,
    repairedBrokenLinks,
    linkedChildren: links.length,
    healthy: links.every((link) => link.hasStudentProfile && link.dashboardReady),
    links,
  };
}

async function getGuardianChildRecord(
  guardianId: string,
  childId?: string | null,
) {
  await repairGuardianStudentLinks(guardianId);

  const result = await db.query(
    `
      select
        sp.id,
        sp.username,
        sp.display_name,
        sp.avatar_key,
        sp.launch_band_code
      from public.guardian_student_links gsl
      join public.student_profiles sp
        on sp.id = gsl.student_id
      where gsl.guardian_id = $1
        and ($2::uuid is null or sp.id = $2::uuid)
      order by sp.display_name asc
      limit 1
    `,
    [guardianId, childId ?? null],
  );

  if (!result.rowCount) {
    throw new Error("Linked child was not found for this guardian.");
  }

  const row = result.rows[0];

  return {
    studentId: String(row.id),
    username: String(row.username),
    displayName: String(row.display_name),
    avatarKey: String(row.avatar_key),
    launchBandCode: String(row.launch_band_code),
  };
}

async function getParentSkillFallback(studentId: string) {
  const result = await db.query(
    `
      select
        sk.code as skill_code,
        sk.display_name,
        sk.subject_code,
        sk.launch_band_code,
        count(sr.id) as attempts,
        count(*) filter (where sr.correct) as correct_attempts,
        count(*) filter (where sr.correct and sr.first_try) as first_try_correct_attempts,
        count(*) filter (where sr.remediation_triggered) as remediation_count,
        round(
          100.0 * count(*) filter (where sr.correct) / nullif(count(sr.id), 0),
          1
        ) as mastery_score
      from public.session_results sr
      join public.challenge_sessions cs
        on cs.id = sr.session_id
      join public.skills sk
        on sk.id = sr.skill_id
      where cs.student_id = $1
      group by sk.code, sk.display_name, sk.subject_code, sk.launch_band_code
      having count(sr.id) > 0
      order by mastery_score asc, attempts desc, sk.display_name asc
    `,
    [studentId],
  );

  return result.rows.map((row) => ({
    skillCode: String(row.skill_code),
    displayName: String(row.display_name),
    subjectCode: String(row.subject_code),
    launchBandCode: String(row.launch_band_code),
    attempts: Number(row.attempts ?? 0),
    correctAttempts: Number(row.correct_attempts ?? 0),
    firstTryCorrectAttempts: Number(row.first_try_correct_attempts ?? 0),
    remediationCount: Number(row.remediation_count ?? 0),
    masteryScore: Number(row.mastery_score ?? 0),
    confidenceScore: 0,
    lastOutcome: null,
    supportSignal:
      Number(row.mastery_score ?? 0) < 45
        ? "support"
        : Number(row.mastery_score ?? 0) < 75
          ? "watch"
          : "strong",
  }));
}

export async function getParentSkills(
  guardianId: string,
  options: { childId?: string | null } = {},
) {
  const child = await getGuardianChildRecord(guardianId, options.childId ?? null);
  const mastery = await getStudentSkillMastery(child.studentId);
  const skills =
    mastery.length > 0
      ? mastery.map((row) => ({
          skillCode: row.skillCode,
          displayName: row.displayName,
          subjectCode: row.subjectCode,
          launchBandCode: row.launchBandCode,
          attempts: row.attempts,
          correctAttempts: row.correctAttempts,
          firstTryCorrectAttempts: row.firstTryCorrectAttempts,
          remediationCount: row.remediationCount,
          masteryScore: row.masteryScore,
          confidenceScore: row.confidenceScore,
          lastOutcome: row.lastOutcome,
          supportSignal:
            row.masteryScore < 45
              ? "support"
              : row.masteryScore < 75
                ? "watch"
                : "strong",
        }))
      : await getParentSkillFallback(child.studentId);

  const supportAreas = skills
    .filter((skill) => skill.supportSignal !== "strong")
    .slice(0, 5);
  const strengthAreas = [...skills]
    .sort((left, right) => right.masteryScore - left.masteryScore)
    .slice(0, 5);

  return {
    guardianId,
    child,
    skills,
    supportAreas,
    strengthAreas,
  };
}

export async function getParentReport(
  guardianId: string,
  options: { childId?: string | null } = {},
) {
  const child = await getGuardianChildRecord(guardianId, options.childId ?? null);
  const childDashboard = await getChildDashboard(child.studentId);
  const periods = [
    { key: "weekly", days: 7 },
    { key: "monthly", days: 30 },
  ] as const;

  const summaries = await Promise.all(
    periods.map(async (period) => {
      const summary = await db.query(
        `
          select
            count(distinct cs.id) as session_count,
            count(distinct cs.id) filter (where cs.ended_at is not null) as completed_session_count,
            count(sr.id) as attempts,
            count(*) filter (where sr.correct) as correct_attempts,
            coalesce(sum(sr.time_spent_ms), 0) as total_time_spent_ms,
            coalesce(sum(sr.effective_time_ms), 0) as effective_time_spent_ms,
            coalesce(sum(sr.points_earned), 0) as total_points_earned,
            round(avg(cs.effectiveness_score), 1) as average_effectiveness
          from public.challenge_sessions cs
          left join public.session_results sr
            on sr.session_id = cs.id
          where cs.student_id = $1
            and cs.started_at >= now() - make_interval(days => $2)
        `,
        [child.studentId, period.days],
      );

      const trend = await db.query(
        `
          with day_window as (
            select
              generate_series(
                current_date - ($2::int - 1),
                current_date,
                interval '1 day'
              )::date as day
          )
          select
            dw.day,
            coalesce(count(distinct cs.id), 0) as session_count,
            coalesce(count(sr.id), 0) as attempts,
            coalesce(count(*) filter (where sr.correct), 0) as correct_attempts,
            coalesce(sum(sr.points_earned), 0) as points_earned
          from day_window dw
          left join public.challenge_sessions cs
            on cs.student_id = $1
           and cs.started_at::date = dw.day
          left join public.session_results sr
            on sr.session_id = cs.id
          group by dw.day
          order by dw.day asc
        `,
        [child.studentId, period.days],
      );

      const subjectBreakdown = await db.query(
        `
          select
            sk.subject_code,
            count(sr.id) as attempts,
            count(*) filter (where sr.correct) as correct_attempts
          from public.session_results sr
          join public.challenge_sessions cs
            on cs.id = sr.session_id
          join public.skills sk
            on sk.id = sr.skill_id
          where cs.student_id = $1
            and cs.started_at >= now() - make_interval(days => $2)
          group by sk.subject_code
          order by attempts desc, sk.subject_code asc
        `,
        [child.studentId, period.days],
      );

      const row = summary.rows[0] ?? {};
      const attempts = Number(row.attempts ?? 0);
      const correctAttempts = Number(row.correct_attempts ?? 0);

      return {
        key: period.key,
        rangeDays: period.days,
        sessionCount: Number(row.session_count ?? 0),
        completedSessionCount: Number(row.completed_session_count ?? 0),
        attempts,
        correctAttempts,
        accuracyRate:
          attempts > 0
            ? Math.round((correctAttempts / attempts) * 100)
            : null,
        totalTimeSpentMs: Number(row.total_time_spent_ms ?? 0),
        effectiveTimeSpentMs: Number(row.effective_time_spent_ms ?? 0),
        totalPointsEarned: Number(row.total_points_earned ?? 0),
        averageEffectiveness:
          row.average_effectiveness === null || row.average_effectiveness === undefined
            ? null
            : Number(row.average_effectiveness),
        dailyTrend: trend.rows.map((trendRow) => ({
          day: String(trendRow.day).slice(0, 10),
          sessionCount: Number(trendRow.session_count ?? 0),
          attempts: Number(trendRow.attempts ?? 0),
          correctAttempts: Number(trendRow.correct_attempts ?? 0),
          pointsEarned: Number(trendRow.points_earned ?? 0),
        })),
        subjectBreakdown: subjectBreakdown.rows.map((subjectRow) => {
          const subjectAttempts = Number(subjectRow.attempts ?? 0);
          const subjectCorrectAttempts = Number(subjectRow.correct_attempts ?? 0);

          return {
            subjectCode: String(subjectRow.subject_code),
            attempts: subjectAttempts,
            correctAttempts: subjectCorrectAttempts,
            accuracyRate:
              subjectAttempts > 0
                ? Math.round((subjectCorrectAttempts / subjectAttempts) * 100)
                : null,
          };
        }),
      };
    }),
  );

  const skills = await getParentSkills(guardianId, { childId: child.studentId });

  return {
    guardianId,
    child,
    childDashboard,
    report: {
      weekly: summaries.find((item) => item.key === "weekly") ?? null,
      monthly: summaries.find((item) => item.key === "monthly") ?? null,
    },
    supportAreas: skills.supportAreas,
    strengthAreas: skills.strengthAreas,
  };
}

export async function markParentNotificationRead(
  guardianId: string,
  notificationId: string,
  read = true,
) {
  const result = await db.query(
    `
      update public.student_notifications sn
      set read = $3
      where sn.id = $1
        and (
          sn.guardian_id = $2
          or (
            sn.guardian_id is null
            and exists (
              select 1
              from public.guardian_student_links gsl
              where gsl.guardian_id = $2
                and gsl.student_id = sn.student_id
            )
          )
        )
      returning id, read, guardian_id
    `,
    [notificationId, guardianId, read],
  );

  if (!result.rowCount) {
    throw new Error("Notification was not found.");
  }

  return {
    notificationId: String(result.rows[0].id),
    read: Boolean(result.rows[0].read),
    guardianScoped:
      result.rows[0].guardian_id !== null && result.rows[0].guardian_id !== undefined,
  };
}

export async function markAllParentNotificationsRead(
  guardianId: string,
  options: { childId?: string | null; read?: boolean } = {},
) {
  const read = options.read ?? true;
  const child =
    options.childId === undefined
      ? null
      : await getGuardianChildRecord(guardianId, options.childId ?? null);

  const result = await db.query(
    `
      update public.student_notifications sn
      set read = $3
      where (
        sn.guardian_id = $1
        or (
          sn.guardian_id is null
          and exists (
            select 1
            from public.guardian_student_links gsl
            where gsl.guardian_id = $1
              and gsl.student_id = sn.student_id
          )
        )
      )
        and ($2::uuid is null or sn.student_id = $2::uuid)
      returning id
    `,
    [guardianId, child?.studentId ?? null, read],
  );

  return {
    guardianId,
    childId: child?.studentId ?? null,
    read,
    updatedCount: result.rowCount ?? 0,
  };
}
