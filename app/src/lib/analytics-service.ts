// analytics-service.ts
// Platform lane ownership (Phase 1 split from prototype-service.ts)
// Adult-ops lane may extend this module during Phase 2.
//
// Exports: getOwnerOverview, getTeacherOverview, getTeacherSkillDetail, getOwnerTriageDetail

import { db } from "@/lib/db";

// ─── Label builders (teacher) ─────────────────────────────────────────────────

function buildTeacherTrendLabel(masteryRate: number) {
  if (masteryRate >= 80) {
    return "class confidence is building";
  }

  if (masteryRate >= 60) {
    return "showing mixed consistency";
  }

  return "still needs guided support";
}

function buildTeacherRecommendedAction(displayName: string, masteryRate: number) {
  if (masteryRate >= 80) {
    return `Use ${displayName} as a warm-up confidence win, then shift class time to the next support lane.`;
  }

  if (masteryRate >= 60) {
    return `Run a short guided block for ${displayName}, then watch first-try success in the next session cycle.`;
  }

  return `Plan a slower teacher-led pass on ${displayName} with one-step support, quick retries, and visible examples.`;
}

// ─── Exported service functions ───────────────────────────────────────────────

export async function getOwnerOverview() {
  const counts = await db.query(
    `
      select
        (select count(*) from public.student_profiles where tester_flag = false) as student_count,
        (select count(*) from public.guardian_profiles where tester_flag = false) as guardian_count,
        (select count(*) from public.challenge_sessions cs join public.student_profiles sp on sp.id = cs.student_id where sp.tester_flag = false) as session_count,
        (
          select count(*)
          from public.feedback_items fi
          left join public.guardian_profiles gp on gp.id = fi.guardian_id
          left join public.student_profiles sp on sp.id = fi.student_id
          where coalesce(gp.tester_flag, false) = false and coalesce(sp.tester_flag, false) = false
        ) as feedback_count,
        (
          select coalesce(sum(ps.total_points), 0)
          from public.progression_states ps
          join public.student_profiles sp on sp.id = ps.student_id
          where sp.tester_flag = false
        ) as total_points,
        (select count(*) from public.example_items) as example_count,
        (select count(*) from public.explainer_assets) as explainer_count
    `,
  );

  const byBand = await db.query(
    `
      select
        lb.code,
        lb.display_name,
        count(sp.id) as student_count
      from public.launch_bands lb
      left join public.student_profiles sp
        on sp.launch_band_code = lb.code
       and sp.tester_flag = false
      group by lb.code, lb.display_name, lb.sort_order
      order by lb.sort_order asc
    `,
  );

  const topLearners = await db.query(
    `
      select
        sp.display_name,
        sp.launch_band_code,
        ps.total_points,
        ps.current_level,
        ps.badge_count,
        ps.trophy_count
      from public.progression_states ps
      join public.student_profiles sp
        on sp.id = ps.student_id
      where sp.tester_flag = false
      order by ps.total_points desc, sp.display_name asc
      limit 8
    `,
  );

  const latestSessions = await db.query(
    `
      select
        cs.id,
        cs.session_mode,
        cs.started_at,
        cs.ended_at,
        cs.effectiveness_score,
        sp.display_name
      from public.challenge_sessions cs
      join public.student_profiles sp
        on sp.id = cs.student_id
      where sp.tester_flag = false
      order by cs.started_at desc
      limit 8
    `,
  );

  const feedbackSummary = await db.query(
    `
      select
        ft.ai_category,
        count(*) as feedback_count
      from public.feedback_items fi
      join public.feedback_triage ft
        on ft.feedback_id = fi.id
      left join public.guardian_profiles gp
        on gp.id = fi.guardian_id
      left join public.student_profiles sp
        on sp.id = fi.student_id
      where coalesce(gp.tester_flag, false) = false
        and coalesce(sp.tester_flag, false) = false
      group by ft.ai_category
      order by feedback_count desc, ft.ai_category asc
    `,
  );

  const feedbackByReviewStatus = await db.query(
    `
      select
        coalesce(ft.review_status, 'pending') as review_status,
        count(*) as feedback_count
      from public.feedback_items fi
      join public.feedback_triage ft
        on ft.feedback_id = fi.id
      left join public.guardian_profiles gp
        on gp.id = fi.guardian_id
      left join public.student_profiles sp
        on sp.id = fi.student_id
      where coalesce(gp.tester_flag, false) = false
        and coalesce(sp.tester_flag, false) = false
      group by coalesce(ft.review_status, 'pending')
      order by feedback_count desc, review_status asc
    `,
  );

  const recentFeedback = await db.query(
    `
      select
        fi.id,
        fi.submitted_by_role,
        fi.source_channel,
        fi.message,
        fi.created_at,
        ft.ai_category,
        ft.urgency,
        ft.confidence,
        ft.impacted_area,
        ft.routing_target,
        ft.summary,
        ft.review_status
      from public.feedback_items fi
      join public.feedback_triage ft
        on ft.feedback_id = fi.id
      left join public.guardian_profiles gp
        on gp.id = fi.guardian_id
      left join public.student_profiles sp
        on sp.id = fi.student_id
      where coalesce(gp.tester_flag, false) = false
        and coalesce(sp.tester_flag, false) = false
      order by fi.created_at desc
      limit 8
    `,
  );

  return {
    counts: {
      students: Number(counts.rows[0]?.student_count ?? 0),
      guardians: Number(counts.rows[0]?.guardian_count ?? 0),
      sessions: Number(counts.rows[0]?.session_count ?? 0),
      feedbackItems: Number(counts.rows[0]?.feedback_count ?? 0),
      totalPoints: Number(counts.rows[0]?.total_points ?? 0),
      exampleItems: Number(counts.rows[0]?.example_count ?? 0),
      explainers: Number(counts.rows[0]?.explainer_count ?? 0),
    },
    byBand: byBand.rows.map((row) => ({
      code: row.code as string,
      displayName: row.display_name as string,
      studentCount: Number(row.student_count ?? 0),
    })),
    topLearners: topLearners.rows.map((row) => ({
      displayName: row.display_name as string,
      launchBandCode: row.launch_band_code as string,
      totalPoints: Number(row.total_points ?? 0),
      currentLevel: Number(row.current_level ?? 1),
      badgeCount: Number(row.badge_count ?? 0),
      trophyCount: Number(row.trophy_count ?? 0),
    })),
    latestSessions: latestSessions.rows.map((row) => ({
      id: row.id as string,
      displayName: row.display_name as string,
      sessionMode: row.session_mode as string,
      startedAt: row.started_at as string,
      endedAt: (row.ended_at as string | undefined) ?? null,
      effectivenessScore:
        row.effectiveness_score === null
          ? null
          : Number(row.effectiveness_score),
    })),
    feedbackByCategory: feedbackSummary.rows.map((row) => ({
      category: row.ai_category as string,
      count: Number(row.feedback_count ?? 0),
    })),
    feedbackByReviewStatus: feedbackByReviewStatus.rows.map((row) => ({
      reviewStatus: row.review_status as string,
      count: Number(row.feedback_count ?? 0),
    })),
    recentFeedback: recentFeedback.rows.map((row) => ({
      id: row.id as string,
      submittedByRole: row.submitted_by_role as string,
      sourceChannel: row.source_channel as string,
      message: row.message as string,
      createdAt: row.created_at as string,
      category: row.ai_category as string,
      urgency: row.urgency as string,
      confidence:
        row.confidence === null || row.confidence === undefined
          ? null
          : Number(row.confidence),
      impactedArea: (row.impacted_area as string | undefined) ?? null,
      routingTarget: row.routing_target as string,
      summary: row.summary as string,
      reviewStatus: (row.review_status as string | undefined) ?? "pending",
    })),
  };
}

export async function getTeacherOverview() {
  const counts = await db.query(
    `
      select
        (select count(*) from public.student_profiles where tester_flag = false) as student_count,
        (select count(*) from public.challenge_sessions cs join public.student_profiles sp on sp.id = cs.student_id where sp.tester_flag = false) as session_count,
        (select count(*) from public.challenge_sessions cs join public.student_profiles sp on sp.id = cs.student_id where sp.tester_flag = false and cs.ended_at is not null) as completed_session_count
    `,
  );

  const byBand = await db.query(
    `
      select
        lb.code,
        lb.display_name,
        count(sp.id) as student_count
      from public.launch_bands lb
      left join public.student_profiles sp
        on sp.launch_band_code = lb.code
       and sp.tester_flag = false
      group by lb.code, lb.display_name, lb.sort_order
      order by lb.sort_order asc
    `,
  );

  const masterySummary = await db.query(
    `
      select
        sk.code as skill_code,
        sk.display_name,
        sk.launch_band_code,
        count(distinct cs.student_id) as learner_count,
        count(sr.id) as attempts,
        count(*) filter (where sr.correct) as correct_attempts,
        count(*) filter (where sr.first_try) as first_try_count,
        count(*) filter (where sr.remediation_triggered) as remediation_count,
        round(avg(sr.time_spent_ms) / 1000.0, 1) as avg_seconds,
        round(
          100.0 * count(*) filter (where sr.correct) / nullif(count(sr.id), 0),
          1
        ) as mastery_rate
      from public.session_results sr
      join public.skills sk
        on sk.id = sr.skill_id
      join public.challenge_sessions cs
        on cs.id = sr.session_id
      join public.student_profiles sp
        on sp.id = cs.student_id
      where sp.tester_flag = false
      group by sk.code, sk.display_name, sk.launch_band_code
      having count(sr.id) > 0
      order by mastery_rate asc, attempts desc
    `,
  );

  const latestSessions = await db.query(
    `
      select
        cs.id,
        cs.session_mode,
        cs.started_at,
        cs.effectiveness_score,
        sp.launch_band_code
      from public.challenge_sessions cs
      join public.student_profiles sp
        on sp.id = cs.student_id
      where sp.tester_flag = false
      order by cs.started_at desc
      limit 10
    `,
  );

  const mappedSummary = masterySummary.rows.map((row) => ({
    skillCode: row.skill_code as string,
    displayName: row.display_name as string,
    launchBandCode: row.launch_band_code as string,
    learnerCount: Number(row.learner_count ?? 0),
    attempts: Number(row.attempts ?? 0),
    correctAttempts: Number(row.correct_attempts ?? 0),
    firstTryCount: Number(row.first_try_count ?? 0),
    remediationCount: Number(row.remediation_count ?? 0),
    averageSeconds:
      row.avg_seconds === null || row.avg_seconds === undefined
        ? 0
        : Number(row.avg_seconds),
    masteryRate: Number(row.mastery_rate ?? 0),
  }));

  return {
    counts: {
      students: Number(counts.rows[0]?.student_count ?? 0),
      sessions: Number(counts.rows[0]?.session_count ?? 0),
      completedSessions: Number(counts.rows[0]?.completed_session_count ?? 0),
    },
    byBand: byBand.rows.map((row) => ({
      code: row.code as string,
      displayName: row.display_name as string,
      studentCount: Number(row.student_count ?? 0),
    })),
    skillSummary: mappedSummary,
    supportAreas: mappedSummary.slice(0, 6),
    strengthAreas: [...mappedSummary]
      .sort((left, right) => right.masteryRate - left.masteryRate)
      .slice(0, 6),
    latestSessions: latestSessions.rows.map((row) => ({
      id: row.id as string,
      sessionMode: row.session_mode as string,
      launchBandCode: row.launch_band_code as string,
      startedAt: row.started_at as string,
      effectivenessScore:
        row.effectiveness_score === null
          ? null
          : Number(row.effectiveness_score),
    })),
  };
}

export async function getTeacherSkillDetail(skillCode: string) {
  const overview = await getTeacherOverview();
  const skill =
    overview.skillSummary.find((item) => item.skillCode === skillCode) ?? null;

  if (!skill) {
    throw new Error("Selected skill detail is not available yet.");
  }

  const learnerBreakdown = await db.query(
    `
      select
        cs.student_id,
        round(
          100.0 * count(*) filter (where sr.correct) / nullif(count(sr.id), 0),
          1
        ) as mastery_rate
      from public.session_results sr
      join public.skills sk
        on sk.id = sr.skill_id
      join public.challenge_sessions cs
        on cs.id = sr.session_id
      join public.student_profiles sp
        on sp.id = cs.student_id
      where sk.code = $1
        and sp.tester_flag = false
      group by cs.student_id
      order by mastery_rate asc
    `,
    [skillCode],
  );

  const tierCounts = {
    support: 0,
    watch: 0,
    onTrack: 0,
    strong: 0,
  };

  learnerBreakdown.rows.forEach((row) => {
    const masteryRate = Number(row.mastery_rate ?? 0);

    if (masteryRate >= 80) {
      tierCounts.strong += 1;
    } else if (masteryRate >= 65) {
      tierCounts.onTrack += 1;
    } else if (masteryRate >= 45) {
      tierCounts.watch += 1;
    } else {
      tierCounts.support += 1;
    }
  });

  const recentSkillActivity = await db.query(
    `
      select
        cs.id,
        cs.session_mode,
        cs.started_at,
        sr.correct,
        sr.first_try,
        sr.remediation_triggered,
        sr.time_spent_ms,
        sp.launch_band_code
      from public.session_results sr
      join public.skills sk
        on sk.id = sr.skill_id
      join public.challenge_sessions cs
        on cs.id = sr.session_id
      join public.student_profiles sp
        on sp.id = cs.student_id
      where sk.code = $1
        and sp.tester_flag = false
      order by cs.started_at desc
      limit 8
    `,
    [skillCode],
  );

  const peerSkills = [
    ...overview.supportAreas.slice(0, 4),
    ...overview.strengthAreas.slice(0, 4),
  ].filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.skillCode === item.skillCode) ===
      index,
  );

  return {
    overview,
    skill,
    tierCounts,
    peerSkills,
    firstTryRate: Math.round(
      (skill.firstTryCount / Math.max(skill.attempts, 1)) * 100,
    ),
    trendLabel: buildTeacherTrendLabel(skill.masteryRate),
    recommendedAction: buildTeacherRecommendedAction(
      skill.displayName,
      skill.masteryRate,
    ),
    recentSkillActivity: recentSkillActivity.rows.map((row) => ({
      id: row.id as string,
      sessionMode: row.session_mode as string,
      launchBandCode: row.launch_band_code as string,
      startedAt: row.started_at as string,
      correct: Boolean(row.correct),
      firstTry: Boolean(row.first_try),
      remediationTriggered: Boolean(row.remediation_triggered),
      timeSpentMs: Number(row.time_spent_ms ?? 0),
    })),
  };
}

export async function getOwnerTriageDetail(feedbackId: string) {
  const result = await db.query(
    `
      select
        fi.id,
        fi.submitted_by_role,
        fi.source_channel,
        fi.message,
        fi.created_at,
        ft.ai_category,
        ft.urgency,
        ft.confidence,
        ft.impacted_area,
        ft.routing_target,
        ft.summary,
        ft.review_status,
        ft.reviewer_note,
        sp.display_name as student_display_name
      from public.feedback_items fi
      join public.feedback_triage ft
        on ft.feedback_id = fi.id
      left join public.guardian_profiles gp
        on gp.id = fi.guardian_id
      left join public.student_profiles sp
        on sp.id = fi.student_id
      where fi.id = $1
        and coalesce(gp.tester_flag, false) = false
        and coalesce(sp.tester_flag, false) = false
      limit 1
    `,
    [feedbackId],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("That triage item is not available.");
  }

  return {
    id: row.id as string,
    submittedByRole: row.submitted_by_role as string,
    sourceChannel: row.source_channel as string,
    message: row.message as string,
    createdAt: row.created_at as string,
    category: row.ai_category as string,
    urgency: row.urgency as string,
    confidence:
      row.confidence === null || row.confidence === undefined
        ? null
        : Number(row.confidence),
    impactedArea: (row.impacted_area as string | undefined) ?? null,
    routingTarget: row.routing_target as string,
    summary: row.summary as string,
    reviewStatus: (row.review_status as string | undefined) ?? "pending",
    reviewerNote: (row.reviewer_note as string | undefined) ?? null,
    studentDisplayName: (row.student_display_name as string | undefined) ?? null,
  };
}
