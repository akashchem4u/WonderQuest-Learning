// session-service.ts
// Platform lane ownership (Phase 1 split from prototype-service.ts)
// Play lane may extend this module during Phase 2.
//
// Exports: createPlaySession, answerQuestion

import { db } from "@/lib/db";
import {
  getExplainerByKey,
  getQuestionByKey,
  getSampleQuestions,
} from "@/lib/content-bank";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  timeSpentMs?: number;
};

type ProgressionSnapshot = {
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function ensureText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTimeSpentMs(value: unknown) {
  const parsed =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : Number(value ?? 0);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.min(Math.round(parsed), 300000);
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

// ─── Question selection ───────────────────────────────────────────────────────

const EARLY_GUIDED_QUESTION_LIMIT = 5;
const STANDARD_GUIDED_QUESTION_LIMIT = 7;
const EARLY_SELF_DIRECTED_QUESTION_LIMIT = 6;
const STANDARD_SELF_DIRECTED_QUESTION_LIMIT = 8;
const EARLY_GUIDED_SKILL_ORDER: Record<string, string[]> = {
  PREK: ["count-to-3", "shape-circle", "letter-b-recognition"],
  K1: ["short-a-sound", "read-simple-word", "add-to-10"],
};

function isEarlyLearnerBand(launchBandCode: string) {
  return launchBandCode === "PREK" || launchBandCode === "K1";
}

function getQuestionLimit(launchBandCode: string, sessionMode: string) {
  const earlyLearnerBand = isEarlyLearnerBand(launchBandCode);

  if (sessionMode === "self-directed-challenge") {
    return earlyLearnerBand
      ? EARLY_SELF_DIRECTED_QUESTION_LIMIT
      : STANDARD_SELF_DIRECTED_QUESTION_LIMIT;
  }

  return earlyLearnerBand
    ? EARLY_GUIDED_QUESTION_LIMIT
    : STANDARD_GUIDED_QUESTION_LIMIT;
}

function getSessionQuestionPool(launchBandCode: string, sessionMode: string) {
  const pool = getSampleQuestions().filter(
    (item) => item.launch_band === launchBandCode,
  );

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

function selectEasyFirstGuidedQuestions(
  launchBandCode: string,
  pool: ReturnType<typeof getSessionQuestionPool>,
  questionLimit: number,
  recentQuestionKeys: Set<string>,
) {
  const skillPriority = EARLY_GUIDED_SKILL_ORDER[launchBandCode];

  if (!skillPriority?.length) {
    const prioritizedPool = [
      ...pool.filter((item) => !recentQuestionKeys.has(item.question_key)),
      ...pool.filter((item) => recentQuestionKeys.has(item.question_key)),
    ];

    return shuffleArray(prioritizedPool).slice(0, questionLimit);
  }

  const groupedBySkill = new Map<string, typeof pool>();

  for (const item of pool) {
    const existing = groupedBySkill.get(item.skill) ?? [];
    existing.push(item);
    groupedBySkill.set(item.skill, existing);
  }

  const selected = [];
  const usedQuestionKeys = new Set<string>();

  for (const skill of skillPriority) {
    const skillPool = shuffleArray(groupedBySkill.get(skill) ?? []);
    const nextQuestion =
      skillPool.find(
        (item) =>
          !usedQuestionKeys.has(item.question_key) &&
          !recentQuestionKeys.has(item.question_key),
      ) ??
      skillPool.find((item) => !usedQuestionKeys.has(item.question_key));

    if (!nextQuestion) {
      continue;
    }

    selected.push(nextQuestion);
    usedQuestionKeys.add(nextQuestion.question_key);

    if (selected.length === questionLimit) {
      return selected;
    }
  }

  // Skill-diversity fill: prefer questions from skills not yet represented,
  // then fall back to any non-recent, then recently-seen as a last resort.
  const usedSkills = new Set(selected.map((item) => item.skill));

  const freshNewSkill = pool.filter(
    (item) =>
      !usedQuestionKeys.has(item.question_key) &&
      !recentQuestionKeys.has(item.question_key) &&
      !usedSkills.has(item.skill),
  );

  const freshSameSkill = pool.filter(
    (item) =>
      !usedQuestionKeys.has(item.question_key) &&
      !recentQuestionKeys.has(item.question_key) &&
      usedSkills.has(item.skill),
  );

  const staleFallback = pool.filter(
    (item) =>
      !usedQuestionKeys.has(item.question_key) &&
      recentQuestionKeys.has(item.question_key),
  );

  const remainingQuestions = [
    ...shuffleArray(freshNewSkill),
    ...shuffleArray(freshSameSkill),
    ...shuffleArray(staleFallback),
  ];

  return [...selected, ...remainingQuestions].slice(0, questionLimit);
}

async function selectSessionQuestions(
  studentId: string,
  launchBandCode: string,
  sessionMode: string,
) {
  const pool = getSessionQuestionPool(launchBandCode, sessionMode);
  const questionLimit = getQuestionLimit(launchBandCode, sessionMode);
  const recentQuestionKeys = await getRecentSessionQuestionKeys(studentId);

  if (pool.length <= questionLimit) {
    return pool;
  }

  if (sessionMode === "self-directed-challenge") {
    const prioritizedPool = [
      ...pool.filter((item) => !recentQuestionKeys.has(item.question_key)),
      ...pool.filter((item) => recentQuestionKeys.has(item.question_key)),
    ];
    const challengeWindow = Math.min(
      prioritizedPool.length,
      Math.max(questionLimit * 4, 32),
    );

    return shuffleArray(prioritizedPool.slice(0, challengeWindow)).slice(0, questionLimit);
  }

  return selectEasyFirstGuidedQuestions(
    launchBandCode,
    pool,
    questionLimit,
    recentQuestionKeys,
  );
}

function buildRequestedFocus(questionKeys: string[], sessionMode: string) {
  return JSON.stringify({
    type: "question-sequence",
    sessionMode,
    questionKeys,
  });
}

function extractRequestedQuestionKeys(
  requestedFocus: string | null | undefined,
  totalQuestions: number,
) {
  try {
    const parsed = JSON.parse(requestedFocus ?? "{}") as {
      questionKeys?: unknown;
    };

    if (Array.isArray(parsed.questionKeys)) {
      return parsed.questionKeys
        .filter((item): item is string => typeof item === "string" && item.length > 0)
        .slice(0, totalQuestions);
    }
  } catch {
    // Fall back to the stored session order when the JSON payload is missing or stale.
  }

  return [];
}

function getRequestedQuestionSequence(
  requestedFocus: string | null | undefined,
  launchBandCode: string,
  sessionMode: string,
  totalQuestions: number,
) {
  const sanitized = extractRequestedQuestionKeys(requestedFocus, totalQuestions);

  if (sanitized.length) {
    return sanitized;
  }

  return getSessionQuestionPool(launchBandCode, sessionMode)
    .slice(0, totalQuestions)
    .map((item) => item.question_key);
}

async function getRecentSessionQuestionKeys(studentId: string, lookbackSessions = 8) {
  const recentSessions = await db.query(
    `
      select requested_focus
      from public.challenge_sessions
      where student_id = $1
      order by started_at desc
      limit $2
    `,
    [studentId, lookbackSessions],
  );

  const recentQuestionKeys = new Set<string>();

  for (const row of recentSessions.rows) {
    for (const questionKey of extractRequestedQuestionKeys(
      (row.requested_focus as string | undefined) ?? null,
      Number.MAX_SAFE_INTEGER,
    )) {
      recentQuestionKeys.add(questionKey);
    }
  }

  return recentQuestionKeys;
}

// ─── Progression math ─────────────────────────────────────────────────────────

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

// ─── DB helpers ───────────────────────────────────────────────────────────────

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
    correctAnswer: question.correct_answer,
    explainerKey: question.explainer_key,
    subject: question.subject,
    skill: question.skill,
    difficulty: question.difficulty,
    theme: question.theme,
  };
}

// ─── Exported service functions ───────────────────────────────────────────────

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

  const selectedQuestions = await selectSessionQuestions(
    input.studentId,
    studentRow.launch_band_code as string,
    sessionMode,
  );
  const questionKeys = selectedQuestions.map((item) => item.question_key);
  const questions = selectedQuestions.map((item) => buildQuestionCard(item.question_key));

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
      buildRequestedFocus(questionKeys, sessionMode),
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
        cs.requested_focus,
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

  const questionSequence = getRequestedQuestionSequence(
    (session.rows[0].requested_focus as string | undefined) ?? null,
    session.rows[0].launch_band_code as string,
    (session.rows[0].session_mode as string) || "guided-quest",
    Number(session.rows[0].total_questions ?? 0),
  );

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
  const timeSpentMs = normalizeTimeSpentMs(input.timeSpentMs);

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
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      input.sessionId,
      metadata.exampleItemId,
      metadata.skillId,
      isCorrect,
      serverAttempt === 1,
      timeSpentMs,
      isCorrect ? timeSpentMs : 0,
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
