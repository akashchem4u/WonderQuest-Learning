import { createHash } from "node:crypto";
import {
  findCachedLiveQuestions,
  getSkillContext,
  insertAiGeneratedQuestion,
  type ContentQuestion,
} from "@/lib/content-bank";
import { launchBands } from "@/lib/launch-plan";

export type LiveQuestionRequest = {
  launchBandCode: string;
  skillCode: string;
  difficulty: number;
  themeCode: string | null;
  reason: "session-refresh" | "adaptive-retest" | "adaptive-stretch";
  referenceQuestion?: Pick<
    ContentQuestion,
    "prompt" | "subject" | "skill" | "difficulty" | "theme"
  > | null;
};

type ModelQuestionPayload = {
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  difficulty: number;
  format: string;
  explainerScript: string;
  mediaHint: string;
};

type ResolveLiveQuestionOptions = {
  excludeQuestionKeys?: string[];
  waitMs?: number;
};

const pendingWarmups = new Map<string, Promise<ContentQuestion | null>>();
const DISALLOWED_CONTENT_PATTERNS = [
  /\b(?:suicide|self-harm|self harm)\b/i,
  /\b(?:sex|sexual|porn)\b/i,
  /\b(?:murder|kill|blood|gore)\b/i,
  /\b(?:gun|knife|weapon)\b/i,
  /\b(?:drugs?|alcohol|beer|wine|vodka)\b/i,
  /\b(?:gambling|casino|betting)\b/i,
  /\b(?:terror(?:ism|ist)?)\b/i,
  /https?:\/\//i,
  /<[^>]+>/,
];
const DISALLOWED_ANSWER_PATTERNS = [
  /^all of the above$/i,
  /^none of the above$/i,
  /^both [a-z0-9 ]+$/i,
];
const BAND_WORD_LIMITS: Record<
  string,
  { prompt: number; answer: number; explainer: number; mediaHint: number }
> = {
  PREK: { prompt: 20, answer: 4, explainer: 24, mediaHint: 8 },
  K1: { prompt: 24, answer: 5, explainer: 28, mediaHint: 10 },
  G23: { prompt: 30, answer: 7, explainer: 34, mediaHint: 12 },
  G45: { prompt: 38, answer: 9, explainer: 42, mediaHint: 14 },
  G6: { prompt: 46, answer: 12, explainer: 56, mediaHint: 16 },
};

function envFlag(name: string, fallback = false) {
  const rawValue = process.env[name];
  const value = rawValue
    ?.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\[rn]/g, "")
    .trim()
    .toLowerCase();
  if (!value) {
    return fallback;
  }

  return value === "1" || value === "true" || value === "yes";
}

function getQuestionModel() {
  return process.env.OPENAI_QUESTION_MODEL || "gpt-5-mini";
}

function getFallbackQuestionModel() {
  const configured = process.env.OPENAI_QUESTION_FALLBACK_MODEL?.trim();
  return configured || null;
}

function getReasoningEffort() {
  return process.env.OPENAI_QUESTION_REASONING_EFFORT || "low";
}

function getAdaptiveWaitMs() {
  const configured = Number(process.env.OPENAI_QUESTION_ADAPTIVE_WAIT_MS ?? 2500);

  if (!Number.isFinite(configured) || configured < 0) {
    return 2500;
  }

  return Math.min(5000, Math.round(configured));
}

export function isLiveQuestionGenerationEnabled() {
  return envFlag("OPENAI_QUESTION_GENERATION_ENABLED", true) && Boolean(process.env.OPENAI_API_KEY?.trim());
}

function getBandLabel(launchBandCode: string) {
  return launchBands.find((band) => band.code === launchBandCode)?.label ?? launchBandCode;
}

function getAgeGuidance(launchBandCode: string) {
  switch (launchBandCode) {
    case "PREK":
      return "Ages 2 to 5. Keep wording extremely simple, concrete, and spoken-language friendly.";
    case "K1":
      return "Kindergarten to Grade 1. Use short sentences and early-reader vocabulary.";
    case "G23":
      return "Grade 2 to Grade 3. Use direct school-language prompts with short reasoning steps.";
    case "G45":
      return "Grade 4 to Grade 5. Use stronger reasoning but keep one clear best answer.";
    case "G6":
      return "Grade 6. Use middle-grade rigor and concise academic language.";
    default:
      return "Keep the question age-appropriate and classroom-safe.";
  }
}

function buildDeveloperPrompt() {
  return [
    "You generate one WonderQuest multiple-choice learning question.",
    "Return strict JSON matching the schema.",
    "The question must be age-appropriate, classroom-safe, and have exactly one clearly correct answer.",
    "Use exactly two distractors, and make them plausible but wrong.",
    "Do not mention that the content was AI-generated.",
    "Do not include markdown, numbering, or extra commentary.",
    "The explainer must be short, calm, and suitable for a reteach moment after a wrong answer.",
  ].join(" ");
}

// Variety pools used to seed the AI with a different surface context each call
const VARIETY_SCENARIOS: Record<string, string[]> = {
  math: [
    "a bakery counting cookies", "kids at a school fair", "a space mission counting stars",
    "a farm with animals", "a toy store sorting items", "a garden with flowers",
    "a sports day with points", "a birthday party", "a zoo visit", "a grocery shopping trip",
    "building blocks and towers", "a treasure hunt", "a library with books",
    "a kitchen recipe", "a bus route with stops",
  ],
  "early-literacy": [
    "a storybook about woodland creatures", "a letter-shaped snack", "a school mailbox",
    "a picture book about the beach", "a classroom word wall", "an alphabet parade",
    "a talking parrot learning words", "a magic spell with letters", "a treasure map with labels",
    "a friendly dragon learning to read",
  ],
  phonics: [
    "a pirate reading a map", "a robot sounding out words", "a singing caterpillar",
    "a frog learning letters by a pond", "a rocket ship with letter panels",
    "a bakery spelling ingredients", "a superhero with a word shield",
  ],
  reading: [
    "a mystery in the school library", "a letter from a pen pal", "a class newspaper story",
    "a nature journal about butterflies", "a recipe card story", "an adventure diary",
    "a story about two friends exploring a cave", "a message in a bottle",
  ],
  science: [
    "a nature walk in the park", "a science fair project", "a garden observation journal",
    "a wildlife documentary about frogs", "a weather station", "a backyard bug hunt",
    "a kitchen experiment with vinegar", "a visit to a natural history museum",
  ],
  logic: [
    "a puzzle room challenge", "a detective solving clues", "a robot sorting shapes",
    "a treasure chest with a pattern lock", "a board game with rules", "a recipe that follows steps",
    "a map with a route to decode",
  ],
};

const GENERIC_SCENARIOS = [
  "an everyday classroom moment", "a playground activity", "a family road trip",
  "a community helper at work", "a season change observation",
];

function pickVarietyScenario(subjectCode: string): string {
  const pool = VARIETY_SCENARIOS[subjectCode] ?? GENERIC_SCENARIOS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildUserPrompt(input: {
  launchBandCode: string;
  bandLabel: string;
  skillCode: string;
  skillName: string;
  subjectCode: string;
  skillDescription: string;
  difficulty: number;
  difficultyFloor: number;
  difficultyCeiling: number;
  themeCode: string | null;
  reason: LiveQuestionRequest["reason"];
  recentPrompts: string[];
  referencePrompt: string | null;
}) {
  const recentPromptBlock = input.recentPrompts.length
    ? input.recentPrompts.map((prompt) => `- ${prompt}`).join("\n")
    : "- none provided";

  // Pick a fresh scenario context so repeated generation for the same skill
  // produces surface-level variety across students and sessions
  const scenarioHint = pickVarietyScenario(input.subjectCode);

  return [
    `Launch band: ${input.launchBandCode} (${input.bandLabel})`,
    getAgeGuidance(input.launchBandCode),
    `Subject: ${input.subjectCode}`,
    `Skill: ${input.skillCode} (${input.skillName})`,
    `Skill description: ${input.skillDescription}`,
    `Difficulty target: ${input.difficulty} on a ${input.difficultyFloor}-${input.difficultyCeiling} band scale.`,
    `Theme wrapper: ${input.themeCode ?? "everyday classroom"}`,
    `Scenario context (use this to give the question a fresh setting — do NOT copy it literally, just let it inspire the scenario): ${scenarioHint}`,
    `Generation reason: ${input.reason}`,
    input.referencePrompt
      ? `Reference question to avoid duplicating directly: ${input.referencePrompt}`
      : "Reference question to avoid duplicating directly: none",
    "Avoid prompts that are too similar to these existing prompts:",
    recentPromptBlock,
    "Output requirements:",
    "- prompt: one question prompt string",
    "- correctAnswer: the exact correct answer string",
    "- distractors: exactly 2 wrong answer strings",
    "- difficulty: integer matching the target difficulty closely",
    "- format: choose one of voice-animation, voice-video, video, or text",
    "- explainerScript: one short reteach explanation",
    "- mediaHint: one short visual cue or asset hint",
  ].join("\n");
}

function buildResponseSchema(minDifficulty: number, maxDifficulty: number) {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "prompt",
      "correctAnswer",
      "distractors",
      "difficulty",
      "format",
      "explainerScript",
      "mediaHint",
    ],
    properties: {
      prompt: {
        type: "string",
        minLength: 8,
      },
      correctAnswer: {
        type: "string",
        minLength: 1,
      },
      distractors: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: {
          type: "string",
          minLength: 1,
        },
      },
      difficulty: {
        type: "integer",
        minimum: minDifficulty,
        maximum: maxDifficulty,
      },
      format: {
        type: "string",
        enum: ["voice-animation", "voice-video", "video", "text"],
      },
      explainerScript: {
        type: "string",
        minLength: 12,
      },
      mediaHint: {
        type: "string",
        minLength: 3,
      },
    },
  };
}

function extractResponseText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const output = Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = Array.isArray((item as { content?: unknown }).content)
      ? ((item as { content: unknown[] }).content as unknown[])
      : [];

    for (const block of content) {
      if (!block || typeof block !== "object") {
        continue;
      }

      const typedBlock = block as { type?: unknown; text?: unknown };
      if (
        typedBlock.type === "output_text" &&
        typeof typedBlock.text === "string" &&
        typedBlock.text.trim()
      ) {
        return typedBlock.text;
      }
    }
  }

  throw new Error("OpenAI response did not contain output text.");
}

function sanitizePayload(
  payload: ModelQuestionPayload,
  difficultyFloor: number,
  difficultyCeiling: number,
) {
  const correctAnswer = payload.correctAnswer.trim();
  const distractors = payload.distractors
    .map((item) => item.trim())
    .filter((item) => item && item !== correctAnswer)
    .filter((item, index, array) => array.indexOf(item) === index)
    .slice(0, 2);

  if (!correctAnswer || distractors.length < 2) {
    throw new Error("Live question payload was missing a valid answer set.");
  }

  return {
    prompt: payload.prompt.trim(),
    correctAnswer,
    distractors,
    difficulty: Math.min(
      difficultyCeiling,
      Math.max(difficultyFloor, Math.round(payload.difficulty)),
    ),
    format: payload.format,
    explainerScript: payload.explainerScript.trim(),
    mediaHint: payload.mediaHint.trim(),
  };
}

function normalizeComparableText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function countWords(value: string) {
  const normalized = normalizeComparableText(value);
  return normalized ? normalized.split(" ").length : 0;
}

function truncateToWordLimit(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return value.trim();
  }

  return words.slice(0, maxWords).join(" ");
}

function getBandWordLimits(launchBandCode: string) {
  return BAND_WORD_LIMITS[launchBandCode] ?? BAND_WORD_LIMITS.G6;
}

function assertAllowedText(label: string, value: string) {
  if (!value.trim()) {
    throw new Error(`Live question ${label} was empty.`);
  }

  for (const pattern of DISALLOWED_CONTENT_PATTERNS) {
    if (pattern.test(value)) {
      throw new Error(`Live question ${label} failed safety checks.`);
    }
  }
}

function assertWordLimit(
  label: string,
  value: string,
  maxWords: number,
) {
  if (countWords(value) > maxWords) {
    throw new Error(`Live question ${label} exceeded the ${maxWords}-word limit.`);
  }
}

function validatePayloadForBand(
  request: LiveQuestionRequest,
  payload: ReturnType<typeof sanitizePayload>,
) {
  const limits = getBandWordLimits(request.launchBandCode);
  const adjustedPayload = {
    ...payload,
    explainerScript: truncateToWordLimit(payload.explainerScript, limits.explainer),
    mediaHint: truncateToWordLimit(payload.mediaHint, limits.mediaHint),
  };
  const allAnswers = [adjustedPayload.correctAnswer, ...adjustedPayload.distractors];
  const normalizedAnswers = allAnswers.map((item) => normalizeComparableText(item));
  const normalizedPrompt = normalizeComparableText(adjustedPayload.prompt);
  const normalizedReferencePrompt = normalizeComparableText(
    request.referenceQuestion?.prompt ?? "",
  );

  assertAllowedText("prompt", adjustedPayload.prompt);
  assertAllowedText("explainer", adjustedPayload.explainerScript);
  assertAllowedText("media hint", adjustedPayload.mediaHint);
  assertWordLimit("prompt", adjustedPayload.prompt, limits.prompt);

  for (const answer of allAnswers) {
    assertAllowedText("answer option", answer);
    assertWordLimit("answer option", answer, limits.answer);
  }

  for (const pattern of DISALLOWED_ANSWER_PATTERNS) {
    if (allAnswers.some((answer) => pattern.test(answer))) {
      throw new Error("Live question answer set used a disallowed answer pattern.");
    }
  }

  if (new Set(normalizedAnswers).size !== normalizedAnswers.length) {
    throw new Error("Live question answer set collapsed to duplicate normalized values.");
  }

  if (normalizedAnswers.some((answer) => answer === normalizedPrompt)) {
    throw new Error("Live question prompt matched one of the answer options.");
  }

  if (
    normalizedReferencePrompt &&
    (normalizedPrompt === normalizedReferencePrompt ||
      normalizedPrompt.includes(normalizedReferencePrompt) ||
      normalizedReferencePrompt.includes(normalizedPrompt))
  ) {
    throw new Error("Live question prompt duplicated the reference prompt too closely.");
  }

  return adjustedPayload;
}

function buildWarmupKey(request: LiveQuestionRequest) {
  return [
    request.launchBandCode,
    request.skillCode,
    Math.max(1, Math.round(request.difficulty)),
    request.themeCode ?? "",
  ].join("|");
}

async function waitForWarmupResult<T>(promise: Promise<T>, waitMs: number) {
  if (waitMs <= 0) {
    return null;
  }

  return Promise.race<T | null>([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), waitMs);
    }),
  ]);
}

async function generateAndPersistLiveQuestion(
  request: LiveQuestionRequest,
): Promise<ContentQuestion | null> {
  if (!isLiveQuestionGenerationEnabled()) {
    return null;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const skill = await getSkillContext(request.skillCode);
  if (!skill) {
    return null;
  }

  const bandLabel = getBandLabel(request.launchBandCode);
  const targetDifficulty = Math.min(
    skill.difficulty_ceiling,
    Math.max(skill.difficulty_floor, request.difficulty),
  );

  const requestBody = {
    reasoning: {
      effort: getReasoningEffort(),
    },
    input: [
      {
        role: "developer",
        content: buildDeveloperPrompt(),
      },
      {
        role: "user",
        content: buildUserPrompt({
          launchBandCode: request.launchBandCode,
          bandLabel,
          skillCode: skill.code,
          skillName: skill.display_name,
          subjectCode: skill.subject_code,
          skillDescription: skill.description,
          difficulty: targetDifficulty,
          difficultyFloor: skill.difficulty_floor,
          difficultyCeiling: skill.difficulty_ceiling,
          themeCode: request.themeCode,
          reason: request.reason,
          recentPrompts: [],
          referencePrompt: request.referenceQuestion?.prompt ?? null,
        }),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "wonderquest_live_question",
        strict: true,
        schema: buildResponseSchema(
          skill.difficulty_floor,
          skill.difficulty_ceiling,
        ),
      },
    },
  };

  async function requestModelPayload(model: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000);
    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          ...requestBody,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI live generation failed: ${response.status} ${errorBody}`);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    return JSON.parse(extractResponseText(payload)) as ModelQuestionPayload;
  }

  const primaryModel = getQuestionModel();
  const fallbackModel = getFallbackQuestionModel();
  let parsed: ModelQuestionPayload;
  let resolvedModel = primaryModel;

  try {
    parsed = await requestModelPayload(primaryModel);
  } catch (error) {
    if (!fallbackModel || fallbackModel === primaryModel) {
      throw error;
    }

    console.error(
      "WonderQuest live question primary model failed; retrying fallback model",
      error,
    );
    parsed = await requestModelPayload(fallbackModel);
    resolvedModel = fallbackModel;
  }

  const sanitized = sanitizePayload(
    parsed,
    skill.difficulty_floor,
    skill.difficulty_ceiling,
  );
  const validated = validatePayloadForBand(request, sanitized);

  const keySeed = createHash("sha1")
    .update(
      [
        request.launchBandCode,
        request.skillCode,
        validated.prompt,
        validated.correctAnswer,
      ].join("|"),
    )
    .digest("hex")
    .slice(0, 16);

  return insertAiGeneratedQuestion({
    launchBandCode: request.launchBandCode,
    skillCode: request.skillCode,
    themeCode: request.themeCode,
    difficulty: validated.difficulty,
    prompt: validated.prompt,
    correctAnswer: validated.correctAnswer,
    distractors: validated.distractors,
    explanationText: validated.explainerScript,
    voiceScript: validated.explainerScript,
    mediaHint: validated.mediaHint,
    format: validated.format,
    generationMetadata: {
      model: resolvedModel,
      reasoningEffort: getReasoningEffort(),
      reason: request.reason,
      cacheBucket: buildWarmupKey(request),
      referenceSkill: request.referenceQuestion?.skill ?? request.skillCode,
      referenceSubject: request.referenceQuestion?.subject ?? skill.subject_code,
      fallbackModel: resolvedModel === primaryModel ? null : primaryModel,
    },
    keySeed,
  });
}

function queueLiveQuestionWarmup(request: LiveQuestionRequest) {
  if (!isLiveQuestionGenerationEnabled()) {
    return null;
  }

  const key = buildWarmupKey(request);
  const existing = pendingWarmups.get(key);

  if (existing) {
    return existing;
  }

  const promise = (async () => {
    try {
      const [cachedQuestion] = await findCachedLiveQuestions({
        launchBandCode: request.launchBandCode,
        skillCode: request.skillCode,
        difficulty: request.difficulty,
        limit: 1,
      });

      if (cachedQuestion) {
        return cachedQuestion;
      }

      return await generateAndPersistLiveQuestion(request);
    } catch (error) {
      console.error("WonderQuest live question warmup failed", error);
      return null;
    } finally {
      pendingWarmups.delete(key);
    }
  })();

  pendingWarmups.set(key, promise);
  return promise;
}

export async function findOrCreateLiveQuestion(
  request: LiveQuestionRequest,
  options: ResolveLiveQuestionOptions = {},
): Promise<ContentQuestion | null> {
  const excludeQuestionKeys = options.excludeQuestionKeys ?? [];
  const [cachedQuestion] = await findCachedLiveQuestions({
    launchBandCode: request.launchBandCode,
    skillCode: request.skillCode,
    difficulty: request.difficulty,
    excludeQuestionKeys,
    limit: 1,
  });

  if (cachedQuestion) {
    return cachedQuestion;
  }

  const warmup = queueLiveQuestionWarmup(request);

  if (!warmup) {
    return null;
  }

  const waitMs =
    typeof options.waitMs === "number"
      ? options.waitMs
      : request.reason === "session-refresh"
        ? 0
        : getAdaptiveWaitMs();

  const generatedQuestion = await waitForWarmupResult(warmup, waitMs);

  if (generatedQuestion && !excludeQuestionKeys.includes(generatedQuestion.question_key)) {
    return generatedQuestion;
  }

  const [cachedAfterWarmup] = await findCachedLiveQuestions({
    launchBandCode: request.launchBandCode,
    skillCode: request.skillCode,
    difficulty: request.difficulty,
    excludeQuestionKeys,
    limit: 1,
  });

  return cachedAfterWarmup ?? null;
}

export function warmLiveQuestionCache(requests: LiveQuestionRequest[]) {
  const uniqueRequests = new Map<string, LiveQuestionRequest>();

  for (const request of requests) {
    uniqueRequests.set(buildWarmupKey(request), request);
  }

  for (const request of uniqueRequests.values()) {
    const warmup = queueLiveQuestionWarmup(request);
    if (warmup) {
      void warmup.catch(() => undefined);
    }
  }
}

export async function generateLiveQuestion(
  request: LiveQuestionRequest,
): Promise<ContentQuestion | null> {
  return generateAndPersistLiveQuestion(request);
}
