// session-service.ts
// Platform lane ownership (Phase 1 split from prototype-service.ts)
// Play lane may extend this module during Phase 2.
//
// Exports: createPlaySession, answerQuestion

import { db } from "@/lib/db";
import {
  findQuestions,
  getQuestionsByKeys,
  getQuestionByKey,
  type ContentQuestion,
} from "@/lib/content-bank";
import {
  findOrCreateLiveQuestion,
  isLiveQuestionGenerationEnabled,
  warmLiveQuestionCache,
} from "@/lib/live-question-generator";
import {
  updateStudentSkillMastery,
  type StudentSkillMasteryRecord,
} from "@/lib/mastery-service";
import { syncTeacherInterventionSignals } from "@/lib/intervention-service";
import { createMilestoneNotifications } from "@/lib/milestone-service";
import { getEssentialSkills } from "@/lib/curriculum-standards";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlaySessionInput = {
  studentId: string;
  sessionMode: string;
  /** Filter questions to a specific module (e.g. "math", "english") */
  module?: string;
  /** When the child explicitly picks a quest, pass the pushed-row ID + table */
  chosenQuestId?: string;
  chosenQuestTable?: "guardian_pushed_activities" | "teacher_pushed_sessions";
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
const MAX_ADAPTIVE_INSERTIONS = 4;
const LAUNCH_BAND_ORDER = ["PREK", "K1", "G23", "G45", "G6"];
const EARLY_GUIDED_SKILL_ORDER: Record<string, string[]> = {
  PREK: ["count-to-3", "shape-circle", "letter-b-recognition"],
  K1: ["short-a-sound", "read-simple-word", "add-to-10"],
};
const MODULE_BY_SUBJECT: Record<string, string> = {
  "early-literacy": "english",
  phonics: "english",
  reading: "english",
  math: "math",
  logic: "logic",
  "world-knowledge": "world-knowledge",
  geography: "geography",
  civics: "civics",
  science: "science",
  writing: "writing",
  history: "history",
};
const BAND_DIFFICULTY_RANGES: Record<
  string,
  { floor: number; ceiling: number }
> = {
  PREK: { floor: 1, ceiling: 2 },
  K1: { floor: 2, ceiling: 3 },
  G23: { floor: 3, ceiling: 4 },
  G45: { floor: 4, ceiling: 5 },
  G6: { floor: 5, ceiling: 6 },
};
const SKILL_LADDERS: Record<string, string[]> = {
  PREK: [
    "letter-a-recognition",
    "letter-b-recognition",
    "rhyme-match",
    "count-to-3",
    "count-to-5",
    "shape-circle",
    "shape-triangle",
    "bigger-smaller",
    "color-recognition",
    "land-water-basics",
    "place-clue-basics",
    "community-helper-basics",
    "safe-choice-basics",
    "weather-basics",
  ],
  K1: [
    "short-a-sound",
    "short-e-sound",
    "short-i-sound",
    "decodable-cvc-word",
    "read-simple-word",
    "sight-words-basic",
    "add-to-10",
    "subtract-from-10",
    "number-bonds-to-5",
    "map-symbol-basics",
    "landform-clues",
    "community-services-basics",
    "rules-and-fairness",
    "weather-patterns",
    "sentence-complete-basics",
    "past-present-basics",
  ],
  G23: [
    "main-idea",
    "cause-effect",
    "add-3-digit",
    "multiply-3x4",
    "time-to-hour",
    "skip-count-by-5",
    "compare-numbers",
    "pattern-next-item",
    "continent-basics",
    "region-climate",
    "government-branches-intro",
    "citizen-responsibility",
    "life-cycle-basics",
    "paragraph-sequence",
    "timeline-order",
  ],
  G45: [
    "use-context-clues",
    "text-evidence",
    "inference-making",
    "compare-fractions",
    "decimal-place-value",
    "percent-basics",
    "ratio-simple",
    "engineering-basics",
    "latitude-longitude",
    "human-physical-geography",
    "government-branches-powers",
    "election-process",
    "ecosystem-change",
    "revision-choice",
    "historical-cause-effect",
  ],
  G6: [
    "author-claim",
    "theme-analysis",
    "integer-number-line",
    "order-of-operations",
    "simple-equations",
    "rate-reasoning",
    "force-motion",
    "ecosystem-evidence",
    "earth-processes",
    "map-scale-data",
    "population-patterns",
    "constitution-principles",
    "media-citizenship",
    "argument-evidence",
    "revision-precision",
    "source-analysis",
    "multi-step-patterns",
  ],
};

type RequestedFocusPayload = {
  type: "question-sequence";
  sessionMode: string;
  questionKeys: string[];
  adaptiveQuestionKeys: string[];
};

type AdaptiveRoute = {
  action: "retest" | "stretch";
  message: string;
  questionKey: string;
} | null;

type SessionQuestionRecord = ContentQuestion;

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

function getLiveSessionQuestionBudget() {
  const configured = Number(process.env.OPENAI_QUESTION_MAX_PER_SESSION ?? 1);

  if (!Number.isFinite(configured) || configured <= 0) {
    return 0;
  }

  return Math.min(6, Math.floor(configured));
}

function getInitialLiveSessionQuestionCount() {
  return Math.min(2, getLiveSessionQuestionBudget());
}

function getAdaptiveWarmupCount() {
  const configured = Number(process.env.OPENAI_QUESTION_PREWARM_PER_SESSION ?? 2);

  if (!Number.isFinite(configured) || configured <= 0) {
    return 0;
  }

  return Math.min(4, Math.floor(configured));
}

function countLiveQuestionRecords(questions: SessionQuestionRecord[]) {
  return questions.filter((question) => question.source_kind === "ai-live").length;
}

async function countLiveQuestionsInSequence(questionKeys: string[]) {
  if (!questionKeys.length) {
    return 0;
  }

  const questions = await getQuestionsByKeys(questionKeys);
  return questions.filter((question) => question.source_kind === "ai-live").length;
}

function buildAdaptiveWarmupRequests(input: {
  selectedQuestions: SessionQuestionRecord[];
  launchBandCode: string;
  themeCode: string | null;
  remainingBudget: number;
}) {
  const maxWarmups = Math.min(
    getAdaptiveWarmupCount(),
    Math.max(0, input.remainingBudget),
  );

  if (!isLiveQuestionGenerationEnabled() || maxWarmups <= 0) {
    return [];
  }

  const candidates = input.selectedQuestions.slice(0, 2);
  const requests = [];

  for (const question of candidates) {
    requests.push({
      launchBandCode: input.launchBandCode,
      skillCode: question.skill,
      difficulty: Math.max(1, question.difficulty - 1),
      themeCode: input.themeCode ?? question.theme ?? null,
      reason: "adaptive-retest" as const,
      referenceQuestion: question,
    });
    requests.push({
      launchBandCode: input.launchBandCode,
      skillCode: question.skill,
      difficulty: question.difficulty + 1,
      themeCode: input.themeCode ?? question.theme ?? null,
      reason: "adaptive-stretch" as const,
      referenceQuestion: question,
    });
  }

  return requests.slice(0, maxWarmups);
}

function mergeQuestionLists(...lists: SessionQuestionRecord[][]) {
  const merged = new Map<string, SessionQuestionRecord>();

  for (const list of lists) {
    for (const item of list) {
      if (!merged.has(item.question_key)) {
        merged.set(item.question_key, item);
      }
    }
  }

  return [...merged.values()];
}

function getBandDifficultySequence(
  launchBandCode: string,
  orderBy: "difficulty_asc" | "difficulty_desc",
) {
  const range = BAND_DIFFICULTY_RANGES[launchBandCode] ?? { floor: 1, ceiling: 6 };
  const values = Array.from(
    { length: range.ceiling - range.floor + 1 },
    (_, index) => range.floor + index,
  );

  return orderBy === "difficulty_desc" ? values.reverse() : values;
}

async function collectBandQuestionsByDifficulty(input: {
  launchBandCode: string;
  baseExcludeQuestionKeys: string[];
  orderBy: "difficulty_asc" | "difficulty_desc";
  limit: number;
  modules?: string[];
}) {
  const difficultySequence = getBandDifficultySequence(
    input.launchBandCode,
    input.orderBy,
  );
  const bucketResults = await Promise.all(
    difficultySequence.map((difficulty) =>
      findQuestions({
        launchBands: [input.launchBandCode],
        excludeQuestionKeys: input.baseExcludeQuestionKeys,
        modules: input.modules,
        minDifficulty: difficulty,
        maxDifficulty: difficulty,
        orderBy: "random",
        limit: input.limit,
      }),
    ),
  );

  // Shuffle across difficulty buckets so question order varies per student/session
  const flat = bucketResults.flat();
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }
  return flat.slice(0, input.limit);
}

async function pickQuestion(
  launchBandCode: string,
  skillCode: string,
  usedQuestionKeys: Set<string>,
  recentQuestionKeys: Set<string>,
  modules?: string[],
) {
  const baseFilters = {
    launchBands: [launchBandCode],
    skillCodes: [skillCode],
    modules,
    orderBy: "random" as const,
    limit: 1,
  };

  const [freshQuestion] = await findQuestions({
    ...baseFilters,
    excludeQuestionKeys: [...usedQuestionKeys, ...recentQuestionKeys],
  });

  if (freshQuestion) {
    return freshQuestion;
  }

  const [fallbackQuestion] = await findQuestions({
    ...baseFilters,
    excludeQuestionKeys: [...usedQuestionKeys],
  });

  return fallbackQuestion ?? null;
}

/**
 * Batch version of pickQuestion — fetches one question per skill in a single
 * DB round-trip instead of 2 × N serial queries. Falls back to per-skill
 * queries only for skills that the batch missed.
 */
async function pickQuestionsForSkills(
  launchBandCode: string,
  skills: string[],
  usedQuestionKeys: Set<string>,
  recentQuestionKeys: Set<string>,
  modules?: string[],
): Promise<Map<string, SessionQuestionRecord>> {
  if (!skills.length) return new Map();

  // One query: fetch a few candidates per skill, fresh (excludes recent + used)
  const perSkillLimit = 2;
  const freshBatch = await findQuestions({
    launchBands: [launchBandCode],
    skillCodes: skills,
    modules,
    excludeQuestionKeys: [...usedQuestionKeys, ...recentQuestionKeys],
    orderBy: "random",
    limit: skills.length * perSkillLimit,
  });

  const result = new Map<string, SessionQuestionRecord>();
  for (const q of freshBatch) {
    if (!result.has(q.skill)) result.set(q.skill, q);
  }

  // Skills with no fresh result — one fallback batch (excludes used only)
  const missingSkills = skills.filter((s) => !result.has(s));
  if (missingSkills.length) {
    const fallbackBatch = await findQuestions({
      launchBands: [launchBandCode],
      skillCodes: missingSkills,
      modules,
      excludeQuestionKeys: [...usedQuestionKeys],
      orderBy: "random",
      limit: missingSkills.length * perSkillLimit,
    });
    for (const q of fallbackBatch) {
      if (!result.has(q.skill)) result.set(q.skill, q);
    }
  }

  return result;
}

async function loadBandQuestionWindow(
  launchBandCode: string,
  usedQuestionKeys: Set<string>,
  recentQuestionKeys: Set<string>,
  orderBy: "difficulty_asc" | "difficulty_desc",
  limit: number,
  modules?: string[],
) {
  const freshQuestions = await collectBandQuestionsByDifficulty({
    launchBandCode,
    baseExcludeQuestionKeys: [...usedQuestionKeys, ...recentQuestionKeys],
    orderBy,
    limit,
    modules,
  });

  if (freshQuestions.length >= limit || recentQuestionKeys.size === 0) {
    return freshQuestions.slice(0, limit);
  }

  const fallbackQuestions = await collectBandQuestionsByDifficulty({
    launchBandCode,
    baseExcludeQuestionKeys: [...usedQuestionKeys],
    orderBy,
    limit,
    modules,
  });

  return mergeQuestionLists(freshQuestions, fallbackQuestions).slice(0, limit);
}

async function selectEasyFirstGuidedQuestions(
  launchBandCode: string,
  questionLimit: number,
  recentQuestionKeys: Set<string>,
  modules?: string[],
) {
  const skillPriority = EARLY_GUIDED_SKILL_ORDER[launchBandCode];

  if (!skillPriority?.length) {
    const prioritizedPool = await loadBandQuestionWindow(
      launchBandCode,
      new Set<string>(),
      recentQuestionKeys,
      "difficulty_asc",
      Math.max(questionLimit * 6, 24),
      modules,
    );

    return shuffleArray(prioritizedPool).slice(0, questionLimit);
  }

  const selected: SessionQuestionRecord[] = [];
  const usedQuestionKeys = new Set<string>();

  const ladderSkills = SKILL_LADDERS[launchBandCode] ?? [];

  // Batch-fetch one question per skill (priority + ladder) in 1–2 queries
  const allSkills = [
    ...skillPriority,
    ...ladderSkills.filter((s) => !skillPriority.includes(s)),
  ];
  const skillQuestionMap = await pickQuestionsForSkills(
    launchBandCode,
    allSkills,
    usedQuestionKeys,
    recentQuestionKeys,
    modules,
  );

  // Fill in priority-skill slots first
  for (const skill of skillPriority) {
    const nextQuestion = skillQuestionMap.get(skill);
    if (!nextQuestion) continue;
    selected.push(nextQuestion);
    usedQuestionKeys.add(nextQuestion.question_key);
    if (selected.length === questionLimit) return selected;
  }

  // Then ladder skills (skip any already covered by priority)
  for (const skill of ladderSkills) {
    if (skillPriority.includes(skill) || selected.some((item) => item.skill === skill)) {
      continue;
    }
    const nextQuestion = skillQuestionMap.get(skill);
    if (!nextQuestion) continue;
    selected.push(nextQuestion);
    usedQuestionKeys.add(nextQuestion.question_key);
    if (selected.length === questionLimit) return selected;
  }

  const remainingQuestions = await loadBandQuestionWindow(
    launchBandCode,
    usedQuestionKeys,
    recentQuestionKeys,
    "difficulty_asc",
    Math.max(questionLimit * 8, 32),
    modules,
  );

  const usedSkills = new Set(selected.map((item) => item.skill));
  const remainingBySkill = new Map<string, SessionQuestionRecord[]>();

  for (const question of remainingQuestions) {
    const bucket = remainingBySkill.get(question.skill) ?? [];
    bucket.push(question);
    remainingBySkill.set(question.skill, bucket);
  }

  const skillOrder = shuffleArray(Array.from(remainingBySkill.keys()));
  skillOrder.sort((leftSkill, rightSkill) => {
    const leftSeen = usedSkills.has(leftSkill) ? 1 : 0;
    const rightSeen = usedSkills.has(rightSkill) ? 1 : 0;

    return leftSeen - rightSeen;
  });

  const diversifiedRemainder: SessionQuestionRecord[] = [];

  while (selected.length + diversifiedRemainder.length < questionLimit) {
    let appended = false;
    const previousSkill =
      diversifiedRemainder[diversifiedRemainder.length - 1]?.skill ??
      selected[selected.length - 1]?.skill ??
      null;

    for (const skill of skillOrder) {
      const queue = remainingBySkill.get(skill);

      if (!queue?.length) {
        continue;
      }

      if (queue.length > 1 && skill === previousSkill) {
        continue;
      }

      diversifiedRemainder.push(queue.shift()!);
      appended = true;
      break;
    }

    if (appended) {
      continue;
    }

    const fallbackNext = skillOrder
      .map((skill) => remainingBySkill.get(skill))
      .find((queue): queue is SessionQuestionRecord[] => Boolean(queue?.length))
      ?.shift();

    if (!fallbackNext) {
      break;
    }

    diversifiedRemainder.push(fallbackNext);
  }

  return [...selected, ...diversifiedRemainder].slice(0, questionLimit);
}

async function maybeReplaceSessionQuestionsWithLiveVariants(
  selectedQuestions: SessionQuestionRecord[],
  launchBandCode: string,
  themeCode: string | null,
) {
  if (!isLiveQuestionGenerationEnabled() || !selectedQuestions.length) {
    return selectedQuestions;
  }

  const liveCount = Math.min(
    getInitialLiveSessionQuestionCount(),
    selectedQuestions.length,
  );

  if (liveCount <= 0) {
    return selectedQuestions;
  }

  const nextQuestions = [...selectedQuestions];
  const targetRequests = [];

  for (let offset = 0; offset < liveCount; offset += 1) {
    const index = nextQuestions.length - 1 - offset;
    const seedQuestion = nextQuestions[index];
    const request = {
      launchBandCode,
      skillCode: seedQuestion.skill,
      difficulty: seedQuestion.difficulty,
      themeCode: themeCode ?? seedQuestion.theme ?? null,
      reason: "session-refresh" as const,
      referenceQuestion: seedQuestion,
    };

    targetRequests.push({ index, request });
  }

  const replacements = await Promise.all(
    targetRequests.map(async ({ index, request }) => ({
      index,
      liveQuestion: await findOrCreateLiveQuestion(request, {
        excludeQuestionKeys: nextQuestions.map((item) => item.question_key),
        waitMs: 0,
      }),
    })),
  );

  for (const replacement of replacements) {
    if (replacement.liveQuestion) {
      nextQuestions[replacement.index] = replacement.liveQuestion;
    }
  }

  warmLiveQuestionCache(
    nextQuestions
      .slice(0, Math.min(nextQuestions.length, liveCount + 2))
      .map((question) => ({
        launchBandCode,
        skillCode: question.skill,
        difficulty: question.difficulty,
        themeCode: themeCode ?? question.theme ?? null,
        reason: "session-refresh" as const,
        referenceQuestion: question,
      })),
  );

  const remainingBudget =
    getLiveSessionQuestionBudget() - countLiveQuestionRecords(nextQuestions);
  const adaptiveWarmups = buildAdaptiveWarmupRequests({
    selectedQuestions: nextQuestions,
    launchBandCode,
    themeCode,
    remainingBudget,
  });

  if (adaptiveWarmups.length) {
    warmLiveQuestionCache(adaptiveWarmups);
  }

  return nextQuestions;
}

async function selectSessionQuestions(
  studentId: string,
  launchBandCode: string,
  sessionMode: string,
  themeCode: string | null,
  module?: string,
) {
  const modules = module ? [module] : undefined;
  const questionLimit = getQuestionLimit(launchBandCode, sessionMode);
  const recentQuestionKeys = await getRecentSessionQuestionKeys(studentId);

  if (sessionMode === "self-directed-challenge") {
    const prioritizedPool = await loadBandQuestionWindow(
      launchBandCode,
      new Set<string>(),
      recentQuestionKeys,
      "difficulty_desc",
      Math.max(questionLimit * 4, 32),
      modules,
    );
    const challengeWindow = Math.min(
      prioritizedPool.length,
      Math.max(questionLimit * 4, 32),
    );

    const baseSelection = shuffleArray(
      prioritizedPool.slice(0, challengeWindow),
    ).slice(0, questionLimit);

    return maybeReplaceSessionQuestionsWithLiveVariants(
      baseSelection,
      launchBandCode,
      themeCode,
    );
  }

  const guidedSelection = await selectEasyFirstGuidedQuestions(
    launchBandCode,
    questionLimit,
    recentQuestionKeys,
    modules,
  );

  return maybeReplaceSessionQuestionsWithLiveVariants(
    guidedSelection,
    launchBandCode,
    themeCode,
  );
}

function buildRequestedFocus(
  questionKeys: string[],
  sessionMode: string,
  adaptiveQuestionKeys: string[] = [],
) {
  return JSON.stringify({
    type: "question-sequence",
    sessionMode,
    questionKeys,
    adaptiveQuestionKeys,
  });
}

function parseRequestedFocus(
  requestedFocus: string | null | undefined,
  fallbackSessionMode = "guided-quest",
): RequestedFocusPayload {
  try {
    const parsed = JSON.parse(requestedFocus ?? "{}") as Partial<RequestedFocusPayload>;
    const questionKeys = Array.isArray(parsed.questionKeys)
      ? parsed.questionKeys.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];
    const adaptiveQuestionKeys = Array.isArray(parsed.adaptiveQuestionKeys)
      ? parsed.adaptiveQuestionKeys.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];

    return {
      type: "question-sequence",
      sessionMode:
        typeof parsed.sessionMode === "string" && parsed.sessionMode.length > 0
          ? parsed.sessionMode
          : fallbackSessionMode,
      questionKeys,
      adaptiveQuestionKeys,
    };
  } catch {
    return {
      type: "question-sequence",
      sessionMode: fallbackSessionMode,
      questionKeys: [],
      adaptiveQuestionKeys: [],
    };
  }
}

function extractRequestedQuestionKeys(
  requestedFocus: string | null | undefined,
  totalQuestions: number,
) {
  return parseRequestedFocus(requestedFocus).questionKeys.slice(0, totalQuestions);
}

function extractAdaptiveQuestionKeys(requestedFocus: string | null | undefined) {
  return new Set(parseRequestedFocus(requestedFocus).adaptiveQuestionKeys);
}

function insertAdaptiveQuestionIntoFocus(
  requestedFocus: string | null | undefined,
  afterQuestionKey: string,
  adaptiveQuestionKey: string,
  sessionMode: string,
) {
  const parsed = parseRequestedFocus(requestedFocus, sessionMode);

  if (parsed.questionKeys.includes(adaptiveQuestionKey)) {
    return {
      requestedFocus: buildRequestedFocus(
        parsed.questionKeys,
        parsed.sessionMode,
        parsed.adaptiveQuestionKeys,
      ),
      totalQuestions: parsed.questionKeys.length,
    };
  }

  const afterIndex = parsed.questionKeys.indexOf(afterQuestionKey);
  const questionKeys = [...parsed.questionKeys];
  const insertAt = afterIndex >= 0 ? afterIndex + 1 : questionKeys.length;
  questionKeys.splice(insertAt, 0, adaptiveQuestionKey);

  const adaptiveQuestionKeys = [...new Set([...parsed.adaptiveQuestionKeys, adaptiveQuestionKey])];

  return {
    requestedFocus: buildRequestedFocus(questionKeys, parsed.sessionMode, adaptiveQuestionKeys),
    totalQuestions: questionKeys.length,
  };
}

async function getRequestedQuestionSequence(
  requestedFocus: string | null | undefined,
  launchBandCode: string,
  _sessionMode: string,
  totalQuestions: number,
) {
  const sanitized = extractRequestedQuestionKeys(requestedFocus, totalQuestions);

  if (sanitized.length) {
    return sanitized;
  }

  return (
    await loadBandQuestionWindow(
      launchBandCode,
      new Set<string>(),
      new Set<string>(),
      "difficulty_asc",
      totalQuestions,
    )
  ).map((item) => item.question_key);
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

async function getSessionSkillCodes(sessionId: string) {
  const result = await db.query(
    `
      select distinct sk.code
      from public.session_results sr
      join public.skills sk
        on sk.id = sr.skill_id
      where sr.session_id = $1
    `,
    [sessionId],
  );

  return result.rows
    .map((row) => String(row.code ?? ""))
    .filter(Boolean);
}

async function completeAssignmentIfActive(input: {
  sessionId: string;
  studentId: string;
  sessionMode: string;
  launchBandCode: string;
}) {
  const skillCodes = await getSessionSkillCodes(input.sessionId);
  const result = await db.query(
    `
      update public.assignment_students ast
      set
        completed_at = coalesce(ast.completed_at, now()),
        session_id = coalesce(ast.session_id, $1)
      from public.assignments a
      where ast.assignment_id = a.id
        and ast.student_id = $2
        and ast.completed_at is null
        and a.session_mode = $3
        and (a.launch_band_code is null or a.launch_band_code = $4)
        and (
          cardinality(a.skill_codes) = 0
          or a.skill_codes && $5::text[]
        )
      returning ast.assignment_id
    `,
    [
      input.sessionId,
      input.studentId,
      input.sessionMode,
      input.launchBandCode,
      skillCodes,
    ],
  );

  return result.rows.map((row) => String(row.assignment_id));
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

function getQuestionModule(question: { subject: string; module?: string }) {
  return question.module ?? MODULE_BY_SUBJECT[question.subject] ?? "general";
}

function getNeighborBand(
  launchBandCode: string,
  direction: "previous" | "next",
) {
  const currentIndex = LAUNCH_BAND_ORDER.indexOf(launchBandCode);
  if (currentIndex < 0) {
    return null;
  }

  const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
  return LAUNCH_BAND_ORDER[nextIndex] ?? null;
}

async function findAdaptiveCandidate(filters: {
  launchBands?: string[];
  skillCodes?: string[];
  modules?: string[];
  minDifficulty?: number;
  maxDifficulty?: number;
  excludeQuestionKeys?: string[];
  orderBy?: "difficulty_asc" | "difficulty_desc" | "random";
}) {
  const [candidate] = await findQuestions({
    launchBands: filters.launchBands,
    skillCodes: filters.skillCodes,
    modules: filters.modules,
    minDifficulty: filters.minDifficulty,
    maxDifficulty: filters.maxDifficulty,
    excludeQuestionKeys: filters.excludeQuestionKeys,
    orderBy: filters.orderBy,
    limit: 1,
  });

  return candidate ?? null;
}

async function selectAdaptiveRoute(
  currentQuestion: ContentQuestion,
  launchBandCode: string,
  requestedFocus: string | null | undefined,
  recoveryMode: boolean,
  themeCode: string | null,
  options: {
    mastery?: StudentSkillMasteryRecord | null;
    liveBudgetRemaining?: number;
  } = {},
): Promise<AdaptiveRoute> {
  const usedQuestionKeys = new Set(
    extractRequestedQuestionKeys(requestedFocus, Number.MAX_SAFE_INTEGER),
  );
  usedQuestionKeys.add(currentQuestion.question_key);
  const currentModule = getQuestionModule(currentQuestion);
  const exclusionList = [...usedQuestionKeys];
  const mastery = options.mastery ?? null;
  const liveBudgetRemaining = Math.max(0, options.liveBudgetRemaining ?? 0);

  if (recoveryMode) {
    const sameSkillRecovery = await findAdaptiveCandidate({
      launchBands: [launchBandCode],
      skillCodes: [currentQuestion.skill],
      maxDifficulty: currentQuestion.difficulty,
      excludeQuestionKeys: exclusionList,
      orderBy: "difficulty_asc",
    });

    if (sameSkillRecovery) {
      return {
        action: "retest",
        message:
          "Quick concept check before we jump back to the main trail.",
        questionKey: sameSkillRecovery.question_key,
      };
    }

    const sameModuleRecovery = await findAdaptiveCandidate({
      launchBands: [launchBandCode],
      modules: [currentModule],
      maxDifficulty: currentQuestion.difficulty,
      excludeQuestionKeys: exclusionList,
      orderBy: "difficulty_asc",
    });

    if (sameModuleRecovery) {
      return {
        action: "retest",
        message:
          "One short support check is queued before the next main question.",
        questionKey: sameModuleRecovery.question_key,
      };
    }

    const previousBand = getNeighborBand(launchBandCode, "previous");
    if (previousBand) {
      const previousBandRecovery = await findAdaptiveCandidate({
        launchBands: [previousBand],
        modules: [currentModule],
        excludeQuestionKeys: exclusionList,
        orderBy: "difficulty_asc",
      });

      if (previousBandRecovery) {
        return {
          action: "retest",
          message:
            "Dropping to a simpler check for a moment, then we return to the main trail.",
          questionKey: previousBandRecovery.question_key,
        };
      }
    }

    if (isLiveQuestionGenerationEnabled() && liveBudgetRemaining > 0) {
      try {
        const liveQuestion = await findOrCreateLiveQuestion({
          launchBandCode,
          skillCode: currentQuestion.skill,
          difficulty: Math.max(1, currentQuestion.difficulty - 1),
          themeCode: currentQuestion.theme || themeCode,
          reason: "adaptive-retest",
          referenceQuestion: currentQuestion,
        }, {
          excludeQuestionKeys: exclusionList,
        });

        if (liveQuestion) {
          return {
            action: "retest",
            message:
              "A fresh support check is ready before we jump back to the main trail.",
            questionKey: liveQuestion.question_key,
          };
        }
      } catch (error) {
        console.error("WonderQuest live adaptive reteach generation failed", error);
      }
    }

    return null;
  }

  const weakMastery =
    mastery !== null &&
    (mastery.masteryScore < 55 ||
      mastery.consecutiveIncorrect >= 2 ||
      mastery.remediationCount >= 2);

  if (weakMastery) {
    return null;
  }

  const sameSkillStretch = await findAdaptiveCandidate({
    launchBands: [launchBandCode],
    skillCodes: [currentQuestion.skill],
    minDifficulty: currentQuestion.difficulty + 1,
    excludeQuestionKeys: exclusionList,
    orderBy: "difficulty_desc",
  });

  if (sameSkillStretch) {
    return {
      action: "stretch",
      message:
        "Stretch check unlocked. We will test a harder version before the next main question.",
      questionKey: sameSkillStretch.question_key,
    };
  }

  const ladder = SKILL_LADDERS[launchBandCode] ?? [];
  const currentSkillIndex = ladder.indexOf(currentQuestion.skill);
  if (currentSkillIndex >= 0) {
    for (const nextSkill of ladder.slice(currentSkillIndex + 1)) {
      const nextSkillQuestion = await findAdaptiveCandidate({
        launchBands: [launchBandCode],
        skillCodes: [nextSkill],
        excludeQuestionKeys: exclusionList,
        orderBy: "difficulty_desc",
      });

      if (nextSkillQuestion) {
        return {
          action: "stretch",
          message:
            "Strong answer. A next-step concept is queued before the main flow resumes.",
          questionKey: nextSkillQuestion.question_key,
        };
      }
    }
  }

  const nextBand = getNeighborBand(launchBandCode, "next");
  if (nextBand) {
    const nextBandStretch = await findAdaptiveCandidate({
      launchBands: [nextBand],
      modules: [currentModule],
      excludeQuestionKeys: exclusionList,
      orderBy: "difficulty_asc",
    });

    if (nextBandStretch) {
      return {
        action: "stretch",
        message:
          "Strong answer. We are sampling the next grade band before returning to the main route.",
        questionKey: nextBandStretch.question_key,
      };
    }
  }

  if (isLiveQuestionGenerationEnabled() && liveBudgetRemaining > 0) {
    try {
      const liveQuestion = await findOrCreateLiveQuestion({
        launchBandCode,
        skillCode: currentQuestion.skill,
        difficulty: currentQuestion.difficulty + 1,
        themeCode: currentQuestion.theme || themeCode,
        reason: "adaptive-stretch",
        referenceQuestion: currentQuestion,
      }, {
        excludeQuestionKeys: exclusionList,
      });

      if (liveQuestion) {
        return {
          action: "stretch",
          message:
            "Strong answer. A fresh live stretch check is queued before the main flow resumes.",
          questionKey: liveQuestion.question_key,
        };
      }
    } catch (error) {
      console.error("WonderQuest live adaptive stretch generation failed", error);
    }
  }

  return null;
}

function buildQuestionCardFromQuestion(
  question: ContentQuestion,
  routeType: "main" | "retest" | "stretch" = "main",
) {
  return {
    questionKey: question.question_key,
    prompt: question.prompt,
    answers: shuffleArray([question.correct_answer, ...question.distractors]),
    correctAnswer: question.correct_answer,
    explainerKey: question.question_key,
    subject: question.subject,
    skill: question.skill,
    difficulty: question.difficulty,
    theme: question.theme,
    routeType,
  };
}

async function buildQuestionCard(
  questionKey: string,
  routeType: "main" | "retest" | "stretch" = "main",
) {
  const question = await getQuestionByKey(questionKey);

  if (!question) {
    throw new Error("Question was not found.");
  }

  return buildQuestionCardFromQuestion(question, routeType);
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

  // ── Pushed activity: use child's explicit choice if provided, else auto-pick ──
  let pushedActivity: { id: string; skill_code: string; table: string } | null = null;

  if (input.chosenQuestId && input.chosenQuestTable) {
    // Child explicitly selected a quest from their list
    const table = input.chosenQuestTable === "teacher_pushed_sessions"
      ? "public.teacher_pushed_sessions"
      : "public.guardian_pushed_activities";
    const chosen = await db.query(
      `select id, skill_code from ${table} where id = $1 and student_id = $2 and consumed_at is null limit 1`,
      [input.chosenQuestId, input.studentId],
    );
    if (chosen.rowCount) {
      pushedActivity = {
        ...(chosen.rows[0] as { id: string; skill_code: string }),
        table: input.chosenQuestTable,
      };
    }
  }

  if (!pushedActivity) {
    // Auto-pick: guardian-pushed first (oldest), then teacher-pushed
    const pushedActivityResult = await db.query(
      `select id, skill_code
       from public.guardian_pushed_activities
       where student_id = $1 and consumed_at is null
       order by pushed_at asc
       limit 1`,
      [input.studentId],
    );
    if (pushedActivityResult.rowCount) {
      pushedActivity = {
        ...(pushedActivityResult.rows[0] as { id: string; skill_code: string }),
        table: "guardian_pushed_activities",
      };
    }
  }

  // ── Teacher-pushed session: check after guardian pushed (lower priority) ─────
  if (!pushedActivity) {
    const teacherPushed = await db.query(
      `select id, skill_code
       from public.teacher_pushed_sessions
       where student_id = $1 and consumed_at is null
       order by priority desc, pushed_at asc
       limit 1`,
      [input.studentId],
    );
    if (teacherPushed.rowCount) {
      pushedActivity = {
        ...(teacherPushed.rows[0] as { id: string; skill_code: string }),
        table: "teacher_pushed_sessions",
      };
    }
  }

  const selectedQuestions = await selectSessionQuestions(
    input.studentId,
    studentRow.launch_band_code as string,
    sessionMode,
    (studentRow.preferred_theme_code as string | undefined) ?? null,
    input.module,
  );

  // ── Auto-advancement stretch: inject 1 next-band question if child is outperforming ──
  try {
    const currentBand = studentRow.launch_band_code as string;
    const nextBand = getNeighborBand(currentBand, "next");
    if (nextBand) {
      const essentialCodes = getEssentialSkills(currentBand).map((s) => s.code);
      if (essentialCodes.length >= 2) {
        const masteryCheck = await db.query(
          `select
             count(*) filter (where ssm.mastery_score >= 70) as mastered_count,
             count(sk.id) as total_count
           from public.skills sk
           left join public.student_skill_mastery ssm
             on ssm.skill_id = sk.id and ssm.student_id = $1
           where sk.code = any($2::text[])`,
          [input.studentId, essentialCodes],
        );
        const masteredCount = Number(masteryCheck.rows[0]?.mastered_count ?? 0);
        const totalCount = Number(masteryCheck.rows[0]?.total_count ?? 0);
        const masteryPct = totalCount > 0 ? masteredCount / totalCount : 0;

        if (masteryPct >= 0.70 && masteredCount >= 2) {
          const [stretchQ] = await findQuestions({
            launchBands: [nextBand],
            orderBy: "difficulty_asc",
            limit: 1,
            excludeQuestionKeys: selectedQuestions.map((q) => q.question_key),
          });
          if (stretchQ) {
            selectedQuestions.push(stretchQ);
          }
        }
      }
    }
  } catch {
    // Non-fatal: continue with original question set
  }

  // If a pushed activity was found, prepend a question for that skill
  if (pushedActivity) {
    const pushedQuestion = await pickQuestion(
      studentRow.launch_band_code as string,
      pushedActivity.skill_code,
      new Set<string>(),
      new Set<string>(),
      input.module ? [input.module] : undefined,
    );

    if (pushedQuestion) {
      // Remove any existing question for the same skill from the tail to avoid
      // duplication, then put the pushed one first.
      const deduped = selectedQuestions.filter(
        (q) => q.question_key !== pushedQuestion.question_key,
      );
      selectedQuestions.length = 0;
      selectedQuestions.push(pushedQuestion, ...deduped);
    }
  }

  if (!selectedQuestions.length) {
    throw new Error(
      `No questions available for band ${studentRow.launch_band_code as string}. ` +
      "The question bank may need to be seeded. Please try again later.",
    );
  }

  const questionKeys = selectedQuestions.map((item) => item.question_key);
  const questions = selectedQuestions.map((item) => buildQuestionCardFromQuestion(item));

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

  // Mark the pushed activity as consumed now that we have a session ID
  if (pushedActivity) {
    const consumeTable =
      pushedActivity.table === "teacher_pushed_sessions"
        ? "public.teacher_pushed_sessions"
        : "public.guardian_pushed_activities";
    await db.query(
      `update ${consumeTable} set consumed_at = now(), session_id = $2 where id = $1`,
      [pushedActivity.id, session.rows[0].id as string],
    ).catch(() => {
      // Non-fatal: do not fail the session creation if the update fails
    });
  }

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

// ─── Private helpers for answerQuestion ──────────────────────────────────────

async function recordAnswerResult(input: {
  sessionId: string;
  exampleItemId: string;
  skillId: string;
  isCorrect: boolean;
  serverAttempt: number;
  timeSpentMs: number;
  pointsEarned: number;
}): Promise<void> {
  await db.query(
    `
      insert into public.session_results (
        session_id,
        example_item_id,
        skill_id,
        correct,
        first_try,
        hint_used,
        time_spent_ms,
        effective_time_ms,
        remediation_triggered,
        points_earned
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
    [
      input.sessionId,
      input.exampleItemId,
      input.skillId,
      input.isCorrect,
      input.serverAttempt === 1,
      false,
      input.timeSpentMs,
      input.isCorrect ? input.timeSpentMs : 0,
      !input.isCorrect,
      input.pointsEarned,
    ],
  );
}

async function applyMasteryAndInterventions(input: {
  studentId: string;
  skillId: string;
  sessionId: string;
  isCorrect: boolean;
  serverAttempt: number;
  timeSpentMs: number;
  bandCode: string | undefined;
}): Promise<StudentSkillMasteryRecord | null> {
  try {
    const masteryRecord = await updateStudentSkillMastery({
      studentId: input.studentId,
      skillId: input.skillId,
      sessionId: input.sessionId,
      correct: input.isCorrect,
      firstTry: input.serverAttempt === 1,
      remediationTriggered: !input.isCorrect,
      timeSpentMs: input.timeSpentMs,
      bandCode: input.bandCode,
    });
    await syncTeacherInterventionSignals(masteryRecord);
    return masteryRecord;
  } catch (error) {
    console.error("WonderQuest mastery/intervention update failed", error);
    return null;
  }
}

async function applyProgressionUpdate(input: {
  studentId: string;
  pointsEarned: number;
}): Promise<{
  previousProgression: ProgressionSnapshot;
  nextProgression: ProgressionSnapshot;
  milestoneFlags: { leveledUp: boolean; badgeEarned: boolean; trophyEarned: boolean };
}> {
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
  const nextTotalPoints = previousProgression.totalPoints + input.pointsEarned;
  const nextProgression = {
    totalPoints: nextTotalPoints,
    currentLevel: levelFromPoints(nextTotalPoints),
    badgeCount: badgeCountFromPoints(nextTotalPoints),
    trophyCount: trophyCountFromPoints(nextTotalPoints),
  };
  const milestoneFlags = {
    leveledUp:
      nextProgression.currentLevel > previousProgression.currentLevel,
    badgeEarned: nextProgression.badgeCount > previousProgression.badgeCount,
    trophyEarned:
      nextProgression.trophyCount > previousProgression.trophyCount,
  };

  if (input.pointsEarned > 0) {
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

    if (
      milestoneFlags.leveledUp ||
      milestoneFlags.badgeEarned ||
      milestoneFlags.trophyEarned
    ) {
      try {
        await createMilestoneNotifications({
          studentId: input.studentId,
          previousProgression,
          nextProgression,
          milestones: milestoneFlags,
        });
      } catch (error) {
        console.error("WonderQuest milestone notification write failed", error);
      }
    }
  }

  return { previousProgression, nextProgression, milestoneFlags };
}

async function resolveExplainerSignal(input: {
  sessionId: string;
  skillCode: string;
  isCorrect: boolean;
}): Promise<boolean> {
  // BL-014: explainer fires on 2nd+ miss for this skill within the session
  const skillMissCountRes = await db.query(
    `select count(*) as miss_count
     from public.session_results sr
     join public.example_items ei on ei.id = sr.example_item_id
     join public.skills sk on sk.id = sr.skill_id
     where sr.session_id = $1
       and sk.code = $2
       and sr.correct = false`,
    [input.sessionId, input.skillCode],
  );
  const skillMissCount = Number(skillMissCountRes.rows[0]?.miss_count ?? 0);
  return !input.isCorrect && skillMissCount >= 2;
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

  const question = await getQuestionByKey(input.questionKey);

  if (!question) {
    throw new Error("Question was not found.");
  }

  await ensureProgressionState(input.studentId);

  const requestedFocus =
    (session.rows[0].requested_focus as string | undefined) ?? null;
  const adaptiveQuestionKeys = extractAdaptiveQuestionKeys(requestedFocus);
  const currentQuestionIsAdaptive = adaptiveQuestionKeys.has(input.questionKey);
  const questionSequence = await getRequestedQuestionSequence(
    requestedFocus,
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
  let totalQuestions = Number(session.rows[0]?.total_questions ?? 0);
  let adaptiveRoute: AdaptiveRoute = null;
  let masteryRecord: StudentSkillMasteryRecord | null = null;
  let resolvedStreak = 0;

  await recordAnswerResult({
    sessionId: input.sessionId,
    exampleItemId: metadata.exampleItemId,
    skillId: metadata.skillId,
    isCorrect,
    serverAttempt,
    timeSpentMs,
    pointsEarned,
  });

  masteryRecord = await applyMasteryAndInterventions({
    studentId: input.studentId,
    skillId: metadata.skillId,
    sessionId: input.sessionId,
    isCorrect,
    serverAttempt,
    timeSpentMs,
    bandCode: session.rows[0]?.launch_band_code as string | undefined,
  });

  const liveQuestionsUsed = await countLiveQuestionsInSequence(questionSequence);
  const liveBudgetRemaining = Math.max(
    0,
    getLiveSessionQuestionBudget() - liveQuestionsUsed,
  );

  if (!isCorrect && liveBudgetRemaining > 0 && isLiveQuestionGenerationEnabled()) {
    warmLiveQuestionCache([
      {
        launchBandCode: session.rows[0].launch_band_code as string,
        skillCode: question.skill,
        difficulty: Math.max(1, question.difficulty - 1),
        themeCode: question.theme || null,
        reason: "adaptive-retest",
        referenceQuestion: question,
      },
    ]);
  }

  // BL-005: Immediate remediation — insert a support question right after a miss
  // Triggers on 2nd+ attempt on the same question, or after 2+ consecutive wrong answers
  if (
    !isCorrect &&
    !currentQuestionIsAdaptive &&
    adaptiveQuestionKeys.size < MAX_ADAPTIVE_INSERTIONS &&
    (serverAttempt >= 2 || (masteryRecord !== null && masteryRecord.consecutiveIncorrect >= 2))
  ) {
    try {
      const remediationRoute = await selectAdaptiveRoute(
        question,
        session.rows[0].launch_band_code as string,
        requestedFocus,
        true, // always recovery mode on a miss
        question.theme || null,
        { mastery: masteryRecord, liveBudgetRemaining },
      );
      if (remediationRoute) {
        const updatedFocus = insertAdaptiveQuestionIntoFocus(
          requestedFocus,
          input.questionKey,
          remediationRoute.questionKey,
          (session.rows[0].session_mode as string) || "guided-quest",
        );
        totalQuestions = updatedFocus.totalQuestions;
        adaptiveRoute = remediationRoute;
        await db.query(
          `update public.challenge_sessions set requested_focus = $2, total_questions = $3 where id = $1`,
          [input.sessionId, updatedFocus.requestedFocus, totalQuestions],
        );
      }
    } catch (error) {
      console.error("WonderQuest immediate remediation insertion failed", error);
    }
  }

  const {
    previousProgression,
    nextProgression,
    milestoneFlags,
  } = await applyProgressionUpdate({
    studentId: input.studentId,
    pointsEarned,
  });

  if (
    isCorrect &&
    !currentQuestionIsAdaptive &&
    adaptiveQuestionKeys.size < MAX_ADAPTIVE_INSERTIONS
  ) {
    const masteryDrivenRecovery =
      masteryRecord !== null &&
      (masteryRecord.masteryScore < 55 ||
        masteryRecord.consecutiveIncorrect >= 2 ||
        masteryRecord.remediationCount >= 2);

    adaptiveRoute = await selectAdaptiveRoute(
      question,
      session.rows[0].launch_band_code as string,
      requestedFocus,
      serverAttempt > 1 || masteryDrivenRecovery,
      question.theme || null,
      {
        mastery: masteryRecord,
        liveBudgetRemaining,
      },
    );

    if (adaptiveRoute) {
      const updatedFocus = insertAdaptiveQuestionIntoFocus(
        requestedFocus,
        input.questionKey,
        adaptiveRoute.questionKey,
        (session.rows[0].session_mode as string) || "guided-quest",
      );

      totalQuestions = updatedFocus.totalQuestions;

      await db.query(
        `
          update public.challenge_sessions
          set requested_focus = $2, total_questions = $3
          where id = $1
        `,
        [input.sessionId, updatedFocus.requestedFocus, totalQuestions],
      );
    }
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

    try {
      await completeAssignmentIfActive({
        sessionId: input.sessionId,
        studentId: input.studentId,
        sessionMode: (session.rows[0].session_mode as string) || "guided-quest",
        launchBandCode: session.rows[0].launch_band_code as string,
      });
    } catch (error) {
      console.error("WonderQuest assignment completion tracking failed", error);
    }

    // ── Streak persistence ────────────────────────────────────────────────────
    try {
      const todayUTC = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
      const yesterdayUTC = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      const streakRow = await db.query(
        `select streak_count, last_session_date from public.progression_states where student_id = $1 limit 1`,
        [input.studentId],
      );

      const prevStreak = Number(streakRow.rows[0]?.streak_count ?? 0);
      const lastDate = streakRow.rows[0]?.last_session_date
        ? String(streakRow.rows[0].last_session_date).slice(0, 10)
        : null;

      let newStreak: number;
      if (lastDate === todayUTC) {
        newStreak = prevStreak; // already played today, no change
      } else if (lastDate === yesterdayUTC) {
        newStreak = prevStreak + 1; // consecutive day
      } else {
        newStreak = 1; // reset or first session
      }

      await db.query(
        `update public.progression_states
         set streak_count = $2, last_session_date = $3, updated_at = now()
         where student_id = $1`,
        [input.studentId, newStreak, todayUTC],
      );

      // ── Streak milestone notifications ──────────────────────────────────────
      const STREAK_MILESTONES = [3, 7, 10, 14, 21, 30, 50, 100];
      if (newStreak !== prevStreak && STREAK_MILESTONES.includes(newStreak)) {
        try {
          const identityResult = await db.query(
            `select display_name from public.student_profiles where id = $1 limit 1`,
            [input.studentId],
          );
          const displayName = String(identityResult.rows[0]?.display_name ?? "Your learner");

          const guardianResult = await db.query(
            `select guardian_id from public.guardian_student_links where student_id = $1`,
            [input.studentId],
          );
          const guardianIds: string[] = guardianResult.rows
            .map((r: { guardian_id: unknown }) => String(r.guardian_id ?? ""))
            .filter(Boolean);
          const targets = guardianIds.length ? guardianIds : [null];

          for (const guardianId of targets) {
            const dedup = await db.query(
              `select 1 from public.student_notifications
               where student_id = $1
                 and (($2::uuid is null and guardian_id is null) or guardian_id = $2::uuid)
                 and type = 'streak'
                 and value = $3
                 and created_at >= now() - interval '12 hours'
               limit 1`,
              [input.studentId, guardianId, String(newStreak)],
            );
            if (!dedup.rowCount) {
              await db.query(
                `insert into public.student_notifications
                   (student_id, guardian_id, type, title, description, value)
                 values ($1, $2, 'streak', $3, $4, $5)`,
                [
                  input.studentId,
                  guardianId,
                  `🔥 ${newStreak}-Day Streak!`,
                  `${displayName} has played ${newStreak} days in a row!`,
                  String(newStreak),
                ],
              );
            }
          }
        } catch (streakNotifError) {
          console.error("WonderQuest streak milestone notification failed", streakNotifError);
        }
      }

      resolvedStreak = newStreak;
    } catch (streakError) {
      console.error("WonderQuest streak persistence failed", streakError);
    }

    // ── Auto-advancement check: notify parent if child has mastered ≥80% of essential skills ──
    try {
      const currentBand = session.rows[0].launch_band_code as string;
      const nextBand = getNeighborBand(currentBand, "next");
      const essentialCodes = getEssentialSkills(currentBand).map((s) => s.code);
      if (nextBand && essentialCodes.length >= 3) {
        const advCheck = await db.query(
          `select
             count(*) filter (where ssm.mastery_score >= 80) as mastered_count,
             count(sk.id) as total_count
           from public.skills sk
           left join public.student_skill_mastery ssm
             on ssm.skill_id = sk.id and ssm.student_id = $1
           where sk.code = any($2::text[])`,
          [input.studentId, essentialCodes],
        );
        const masteredCount = Number(advCheck.rows[0]?.mastered_count ?? 0);
        const totalCount = Number(advCheck.rows[0]?.total_count ?? 0);
        const advPct = totalCount > 0 ? masteredCount / totalCount : 0;

        if (advPct >= 0.80) {
          const studentId = input.studentId;
          const [studentRow2] = (await db.query(
            `select display_name from public.student_profiles where id = $1`,
            [studentId],
          )).rows;
          const displayName = String(studentRow2?.display_name ?? "Your learner");

          const guardianResult = await db.query(
            `select guardian_id from public.guardian_student_links where student_id = $1`,
            [studentId],
          );
          const BAND_LABEL: Record<string, string> = {
            PREK: "Pre-K", K1: "K–1", G23: "Grades 2–3", G45: "Grades 4–5",
          };
          const curLabel = BAND_LABEL[currentBand] ?? currentBand;
          const nextLabel = BAND_LABEL[nextBand] ?? nextBand;

          for (const { guardian_id: guardianId } of guardianResult.rows) {
            const dedup = await db.query(
              `select 1 from public.student_notifications
               where student_id = $1 and guardian_id = $2 and type = 'advancement_ready'
               and created_at >= now() - interval '7 days' limit 1`,
              [studentId, guardianId],
            );
            if (!dedup.rowCount) {
              await db.query(
                `insert into public.student_notifications
                   (student_id, guardian_id, type, title, description, value)
                 values ($1, $2, 'advancement_ready', $3, $4, $5)`,
                [
                  studentId,
                  guardianId,
                  `${displayName} may be ready to advance! 🚀`,
                  `${displayName} has mastered ${masteredCount} of ${totalCount} essential ${curLabel} skills. Consider moving them to ${nextLabel}.`,
                  currentBand,
                ],
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("WonderQuest auto-advancement check failed", error);
    }
  }

  const shouldTriggerExplainer = await resolveExplainerSignal({
    sessionId: input.sessionId,
    skillCode: question.skill,
    isCorrect,
  });

  return {
    correct: isCorrect,
    pointsEarned,
    correctAnswer: question.correct_answer,
    needsRetry: !isCorrect,
    sessionCompleted,
    currentStreak: resolvedStreak,
    adaptiveAction: adaptiveRoute?.action ?? null,
    adaptiveMessage: adaptiveRoute?.message ?? null,
    adaptiveQuestion: adaptiveRoute
      ? await buildQuestionCard(adaptiveRoute.questionKey, adaptiveRoute.action)
      : null,
    explainer: shouldTriggerExplainer
      ? {
          format: question.voice_script ? "voice-video" : "text",
          script:
            question.voice_script ||
            question.explanation_text ||
            "Let us try that one more time together.",
          mediaHint: question.media_hint || "simple guided example",
        }
      : null,
    progression: pointsEarned > 0 ? nextProgression : previousProgression,
    milestones: milestoneFlags,
  };
}

// ─── Play session history for child profile ───────────────────────────────────
export async function getPlaySessionHistory(studentId: string) {
  const res = await db.query(
    `select
       cs.id,
       cs.session_mode,
       cs.started_at,
       cs.ended_at,
       cs.total_questions,
       cs.effectiveness_score,
       coalesce(sr_agg.correct_answers, 0) as correct_answers,
       coalesce(sr_agg.points_earned, 0)   as points_earned
     from public.challenge_sessions cs
     left join lateral (
       select
         count(*) filter (where correct) as correct_answers,
         coalesce(sum(points_earned), 0)  as points_earned
       from public.session_results
       where session_id = cs.id
     ) sr_agg on true
     where cs.student_id = $1
       and cs.ended_at is not null
     order by cs.started_at desc
     limit 20`,
    [studentId],
  );
  return {
    sessions: res.rows.map((r) => ({
      id: String(r.id),
      sessionMode: String(r.session_mode ?? "practice"),
      startedAt: String(r.started_at),
      endedAt: r.ended_at ? String(r.ended_at) : null,
      totalQuestions: Number(r.total_questions ?? 0),
      correctAnswers: Number(r.correct_answers ?? 0),
      pointsEarned: Number(r.points_earned ?? 0),
      effectivenessScore: r.effectiveness_score != null ? Number(r.effectiveness_score) : null,
    })),
  };
}
