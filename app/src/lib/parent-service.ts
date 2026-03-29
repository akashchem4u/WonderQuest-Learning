// parent-service.ts
// Platform lane ownership (Phase 1 split from prototype-service.ts)
// Parent lane may extend this module during Phase 2.
//
// Exports: accessParent, restoreParentSession

import { db } from "@/lib/db";
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

async function getLinkedChildren(guardianId: string) {
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
