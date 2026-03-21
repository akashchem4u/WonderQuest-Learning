import { db } from "@/lib/db";
import {
  getAvatarByKey,
  getExplainerByKey,
  getQuestionByKey,
  sampleQuestions,
} from "@/lib/launch-data";
import { triageFeedback } from "@/lib/feedback-triage";
import { launchBands } from "@/lib/launch-plan";
import { hashPin, normalizeUsername, validatePin, verifyPin } from "@/lib/pin";

type ChildAccessInput = {
  username: string;
  pin: string;
  displayName?: string;
  avatarKey?: string;
  launchBandCode?: string;
};

type ParentAccessInput = {
  username: string;
  pin: string;
  displayName?: string;
  childUsername?: string;
  relationship?: string;
  notifyWeekly?: boolean;
  notifyMilestones?: boolean;
};

type PlaySessionInput = {
  studentId: string;
  sessionMode: string;
};

type AnswerInput = {
  sessionId: string;
  studentId: string;
  questionKey: string;
  answer: string;
  attempt?: number;
};

type FeedbackInput = {
  submittedByRole: string;
  guardianId?: string;
  studentId?: string;
  sourceChannel: string;
  reportedType?: string;
  message: string;
  context?: Record<string, unknown>;
};

type ProgressionSnapshot = {
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
};

function ensureText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureBoolean(value: unknown) {
  return Boolean(value);
}

function normalizeContext(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function ensureLaunchBandCode(launchBandCode: string) {
  if (!launchBands.some((item) => item.code === launchBandCode)) {
    throw new Error("Choose a valid age or grade band.");
  }

  return launchBandCode;
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function getSessionQuestionPool(launchBandCode: string, sessionMode: string) {
  const pool = sampleQuestions.filter((item) => item.launch_band === launchBandCode);

  if (sessionMode === "self-directed-challenge") {
    return [...pool].sort((left, right) => {
      if (right.difficulty !== left.difficulty) {
        return right.difficulty - left.difficulty;
      }

      return left.subject.localeCompare(right.subject);
    });
  }

  return [...pool].sort((left, right) => {
    if (left.difficulty !== right.difficulty) {
      return left.difficulty - right.difficulty;
    }

    return left.subject.localeCompare(right.subject);
  });
}

function levelFromPoints(points: number) {
  return Math.max(1, Math.floor(points / 40) + 1);
}

function badgeCountFromPoints(points: number) {
  return Math.floor(points / 30);
}

function trophyCountFromPoints(points: number) {
  return Math.floor(points / 120);
}

function toProgression(row?: Record<string, unknown>): ProgressionSnapshot {
  return {
    totalPoints: Number(row?.total_points ?? 0),
    currentLevel: Number(row?.current_level ?? 1),
    badgeCount: Number(row?.badge_count ?? 0),
    trophyCount: Number(row?.trophy_count ?? 0),
  };
}

async function ensureProgressionState(studentId: string) {
  await db.query(
    `
      insert into public.progression_states (student_id)
      values ($1)
      on conflict (student_id) do nothing
    `,
    [studentId],
  );
}

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

async function getQuestionMetadata(questionKey: string) {
  const result = await db.query(
    `
      select id, skill_id
      from public.example_items
      where example_key = $1
      limit 1
    `,
    [questionKey],
  );

  return {
    exampleItemId: (result.rows[0]?.id as string | undefined) ?? null,
    skillId: (result.rows[0]?.skill_id as string | undefined) ?? null,
  };
}

function buildQuestionCard(questionKey: string) {
  const question = getQuestionByKey(questionKey);

  if (!question) {
    throw new Error("Question was not found.");
  }

  return {
    questionKey: question.question_key,
    prompt: question.prompt,
    answers: shuffleArray([question.correct_answer, ...question.distractors]),
    explainerKey: question.explainer_key,
    subject: question.subject,
    skill: question.skill,
    difficulty: question.difficulty,
    theme: question.theme,
  };
}

export async function accessChild(input: ChildAccessInput) {
  const username = normalizeUsername(ensureText(input.username));
  const pin = ensureText(input.pin);
  const displayName = ensureText(input.displayName);
  const avatarKey = ensureText(input.avatarKey);
  const launchBandCode = ensureLaunchBandCode(
    ensureText(input.launchBandCode) || "K1",
  );

  if (!username) {
    throw new Error("Username is required.");
  }

  if (!validatePin(pin)) {
    throw new Error("PIN must be exactly 4 digits.");
  }

  const existing = await db.query(
    `
      select
        sp.id,
        sp.username,
        sp.display_name,
        sp.avatar_key,
        sp.launch_band_code,
        sp.preferred_theme_code,
        sp.pin_hash,
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
    [username],
  );

  if (existing.rowCount) {
    const row = existing.rows[0];

    if (!verifyPin(pin, username, row.pin_hash as string)) {
      throw new Error("Wrong username or PIN.");
    }

    await ensureProgressionState(row.id as string);

    return {
      created: false,
      student: {
        id: row.id as string,
        username: row.username as string,
        displayName: row.display_name as string,
        avatarKey: row.avatar_key as string,
        launchBandCode: row.launch_band_code as string,
        preferredThemeCode: (row.preferred_theme_code as string | undefined) ?? null,
      },
      progression: toProgression(row),
    };
  }

  if (!displayName || !avatarKey) {
    throw new Error("Display name and avatar are required for first-time setup.");
  }

  const avatar = getAvatarByKey(avatarKey);

  if (!avatar) {
    throw new Error("Choose a valid avatar.");
  }

  if (avatar.launch_band !== launchBandCode) {
    throw new Error("Choose an avatar that matches the selected age or grade band.");
  }

  const inserted = await db.query(
    `
      insert into public.student_profiles (
        username,
        pin_hash,
        display_name,
        avatar_key,
        launch_band_code,
        preferred_theme_code
      )
      values ($1, $2, $3, $4, $5, $6)
      returning id, username, display_name, avatar_key, launch_band_code, preferred_theme_code
    `,
    [
      username,
      hashPin(pin, username),
      displayName,
      avatarKey,
      launchBandCode,
      avatar.theme,
    ],
  );

  await ensureProgressionState(inserted.rows[0].id as string);

  return {
    created: true,
    student: {
      id: inserted.rows[0].id as string,
      username: inserted.rows[0].username as string,
      displayName: inserted.rows[0].display_name as string,
      avatarKey: inserted.rows[0].avatar_key as string,
      launchBandCode: inserted.rows[0].launch_band_code as string,
      preferredThemeCode:
        (inserted.rows[0].preferred_theme_code as string | undefined) ?? null,
    },
    progression: {
      totalPoints: 0,
      currentLevel: 1,
      badgeCount: 0,
      trophyCount: 0,
    },
  };
}

export async function accessParent(input: ParentAccessInput) {
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

  const linkedChildren = await getLinkedChildren(guardianRow.id as string);

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
  };
}

export async function createPlaySession(input: PlaySessionInput) {
  const sessionMode = ensureText(input.sessionMode) || "guided-quest";

  const student = await db.query(
    `
      select id, display_name, avatar_key, launch_band_code, preferred_theme_code
      from public.student_profiles
      where id = $1
      limit 1
    `,
    [input.studentId],
  );

  if (!student.rowCount) {
    throw new Error("Student profile was not found.");
  }

  const studentRow = student.rows[0];

  await ensureProgressionState(studentRow.id as string);

  const questions = getSessionQuestionPool(
    studentRow.launch_band_code as string,
    sessionMode,
  )
    .slice(0, 3)
    .map((item) => buildQuestionCard(item.question_key));

  const session = await db.query(
    `
      insert into public.challenge_sessions (
        student_id,
        session_mode,
        theme_code,
        requested_focus,
        total_questions
      )
      values ($1, $2, $3, $4, $5)
      returning id, created_at
    `,
    [
      input.studentId,
      sessionMode,
      studentRow.preferred_theme_code ?? null,
      sessionMode,
      questions.length,
    ],
  );

  const progression = await db.query(
    `
      select total_points, current_level, badge_count, trophy_count
      from public.progression_states
      where student_id = $1
    `,
    [input.studentId],
  );

  return {
    sessionId: session.rows[0].id as string,
    student: {
      id: studentRow.id as string,
      displayName: studentRow.display_name as string,
      avatarKey: studentRow.avatar_key as string,
      launchBandCode: studentRow.launch_band_code as string,
      preferredThemeCode:
        (studentRow.preferred_theme_code as string | undefined) ?? null,
    },
    progression: toProgression(progression.rows[0]),
    questions,
  };
}

export async function answerQuestion(input: AnswerInput) {
  const session = await db.query(
    `
      select
        cs.id,
        cs.student_id,
        cs.total_questions,
        cs.session_mode,
        sp.launch_band_code
      from public.challenge_sessions cs
      join public.student_profiles sp
        on sp.id = cs.student_id
      where cs.id = $1 and cs.student_id = $2
      limit 1
    `,
    [input.sessionId, input.studentId],
  );

  if (!session.rowCount) {
    throw new Error("Session was not found.");
  }

  const question = getQuestionByKey(input.questionKey);

  if (!question) {
    throw new Error("Question was not found.");
  }

  await ensureProgressionState(input.studentId);

  const questionSequence = getSessionQuestionPool(
    session.rows[0].launch_band_code as string,
    (session.rows[0].session_mode as string) || "guided-quest",
  )
    .slice(0, Number(session.rows[0].total_questions ?? 0))
    .map((item) => item.question_key);

  const completed = await db.query(
    `
      select count(*) as correct_attempts
      from public.session_results
      where session_id = $1 and correct = true
    `,
    [input.sessionId],
  );

  const expectedQuestionKey =
    questionSequence[Number(completed.rows[0]?.correct_attempts ?? 0)] ?? null;

  if (expectedQuestionKey !== input.questionKey) {
    throw new Error("Question order is out of sync. Refresh the session and try again.");
  }

  const isCorrect = ensureText(input.answer) === question.correct_answer;
  const metadata = await getQuestionMetadata(input.questionKey);

  if (!metadata.exampleItemId || !metadata.skillId) {
    throw new Error("Question content is not synced yet. Run the launch content sync.");
  }

  const priorAttempts = await db.query(
    `
      select
        count(*) as attempt_count,
        bool_or(correct) as already_correct
      from public.session_results
      where session_id = $1 and example_item_id = $2
    `,
    [input.sessionId, metadata.exampleItemId],
  );

  if (priorAttempts.rows[0]?.already_correct) {
    throw new Error("This question was already completed.");
  }

  const serverAttempt = Number(priorAttempts.rows[0]?.attempt_count ?? 0) + 1;
  const pointsEarned = isCorrect ? (serverAttempt === 1 ? 10 : 6) : 0;

  await db.query(
    `
      insert into public.session_results (
        session_id,
        example_item_id,
        skill_id,
        correct,
        first_try,
        time_spent_ms,
        effective_time_ms,
        remediation_triggered,
        points_earned
      )
      values ($1, $2, $3, $4, $5, 0, 0, $6, $7)
    `,
    [
      input.sessionId,
      metadata.exampleItemId,
      metadata.skillId,
      isCorrect,
      serverAttempt === 1,
      !isCorrect,
      pointsEarned,
    ],
  );

  const current = await db.query(
    `
      select total_points, current_level, badge_count, trophy_count
      from public.progression_states
      where student_id = $1
      limit 1
    `,
    [input.studentId],
  );

  const previousProgression = toProgression(current.rows[0]);
  const nextTotalPoints = previousProgression.totalPoints + pointsEarned;
  const nextProgression = {
    totalPoints: nextTotalPoints,
    currentLevel: levelFromPoints(nextTotalPoints),
    badgeCount: badgeCountFromPoints(nextTotalPoints),
    trophyCount: trophyCountFromPoints(nextTotalPoints),
  };

  if (pointsEarned > 0) {
    await db.query(
      `
        update public.progression_states
        set
          total_points = $2,
          current_level = $3,
          badge_count = $4,
          trophy_count = $5,
          last_restored_at = now(),
          updated_at = now()
        where student_id = $1
      `,
      [
        input.studentId,
        nextProgression.totalPoints,
        nextProgression.currentLevel,
        nextProgression.badgeCount,
        nextProgression.trophyCount,
      ],
    );
  }

  const summary = await db.query(
    `
      select
        count(*) filter (where correct) as correct_attempts,
        count(*) as total_attempts
      from public.session_results
      where session_id = $1
    `,
    [input.sessionId],
  );

  const correctItems = Number(summary.rows[0]?.correct_attempts ?? 0);
  const totalQuestions = Number(session.rows[0]?.total_questions ?? 0);
  const sessionCompleted = totalQuestions > 0 && correctItems >= totalQuestions;

  if (sessionCompleted) {
    const effectivenessScore =
      totalQuestions > 0
        ? Math.round((correctItems / totalQuestions) * 100)
        : null;

    await db.query(
      `
        update public.challenge_sessions
        set ended_at = now(), effectiveness_score = $2
        where id = $1
      `,
      [input.sessionId, effectivenessScore],
    );
  }

  const explainer = getExplainerByKey(question.explainer_key);

  return {
    correct: isCorrect,
    pointsEarned,
    correctAnswer: question.correct_answer,
    needsRetry: !isCorrect,
    sessionCompleted,
    explainer: !isCorrect
      ? {
          format: explainer?.format ?? "voice-video",
          script: explainer?.script ?? "Let us try that one more time together.",
          mediaHint: explainer?.media_hint ?? "simple guided example",
        }
      : null,
    progression: pointsEarned > 0 ? nextProgression : previousProgression,
    milestones: {
      leveledUp:
        nextProgression.currentLevel > previousProgression.currentLevel,
      badgeEarned: nextProgression.badgeCount > previousProgression.badgeCount,
      trophyEarned:
        nextProgression.trophyCount > previousProgression.trophyCount,
    },
  };
}

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
        ft.routing_target,
        ft.summary
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
    recentFeedback: recentFeedback.rows.map((row) => ({
      id: row.id as string,
      submittedByRole: row.submitted_by_role as string,
      sourceChannel: row.source_channel as string,
      message: row.message as string,
      createdAt: row.created_at as string,
      category: row.ai_category as string,
      urgency: row.urgency as string,
      routingTarget: row.routing_target as string,
      summary: row.summary as string,
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
        count(sr.id) as attempts,
        count(*) filter (where sr.correct) as correct_attempts,
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
    attempts: Number(row.attempts ?? 0),
    correctAttempts: Number(row.correct_attempts ?? 0),
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

export async function createFeedback(input: FeedbackInput) {
  const submittedByRole = ensureText(input.submittedByRole) || "parent";
  const sourceChannel = ensureText(input.sourceChannel) || "unknown";
  const message = ensureText(input.message);

  if (!message) {
    throw new Error("Feedback message is required.");
  }

  const context = {
    ...normalizeContext(input.context),
    reportedType: ensureText(input.reportedType) || "general",
  };

  const triage = triageFeedback({
    message,
    reportedType: ensureText(input.reportedType),
    sourceChannel,
  });

  const inserted = await db.query(
    `
      insert into public.feedback_items (
        submitted_by_role,
        guardian_id,
        student_id,
        source_channel,
        message,
        context
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
      returning id
    `,
    [
      submittedByRole,
      input.guardianId || null,
      input.studentId || null,
      sourceChannel,
      message,
      JSON.stringify(context),
    ],
  );

  await db.query(
    `
      insert into public.feedback_triage (
        feedback_id,
        ai_category,
        confidence,
        urgency,
        impacted_area,
        duplicate_cluster_id,
        summary,
        routing_target,
        review_status
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
    `,
    [
      inserted.rows[0].id,
      triage.category,
      triage.confidence,
      triage.urgency,
      triage.impactedArea,
      triage.duplicateClusterId,
      triage.summary,
      triage.routingTarget,
    ],
  );

  return {
    feedbackId: inserted.rows[0].id as string,
    triage: {
      category: triage.category,
      confidence: triage.confidence,
      urgency: triage.urgency,
      routingTarget: triage.routingTarget,
    },
  };
}
