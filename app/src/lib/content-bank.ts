import { db } from "@/lib/db";

export type ContentQuestion = {
  question_key: string;
  launch_band: string;
  module: string;
  subject: string;
  skill: string;
  theme: string;
  prompt: string;
  correct_answer: string;
  distractors: string[];
  modality: string;
  difficulty: number;
  explanation_text: string;
  voice_script: string;
  media_hint: string;
  source_kind: string;
  generation_metadata: Record<string, unknown>;
};

export type SkillContext = {
  id: string;
  code: string;
  subject_code: string;
  launch_band_code: string;
  display_name: string;
  description: string;
  difficulty_floor: number;
  difficulty_ceiling: number;
};

export type QuestionQueryFilters = {
  questionKeys?: string[];
  excludeQuestionKeys?: string[];
  launchBands?: string[];
  skillCodes?: string[];
  subjectCodes?: string[];
  modules?: string[];
  sourceKinds?: string[];
  minDifficulty?: number;
  maxDifficulty?: number;
  limit?: number;
  orderBy?: "difficulty_asc" | "difficulty_desc" | "question_key_asc" | "random";
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

const SUBJECTS_BY_MODULE = Object.entries(MODULE_BY_SUBJECT).reduce<
  Record<string, string[]>
>((accumulator, [subject, module]) => {
  const existing = accumulator[module] ?? [];
  existing.push(subject);
  accumulator[module] = existing;
  return accumulator;
}, {});

const AMBIGUOUS_EARLY_WORD_DISTRACTORS: Record<
  string,
  { blocked: string[]; replacements: string[] }
> = {
  bat: {
    blocked: ["ball", "net", "goal", "kick", "team", "pass"],
    replacements: ["bag", "hat", "map", "cap", "jam", "van"],
  },
};

const PROMPT_META_SUFFIX_PATTERNS = [
  /\bUse the clue words\.$/i,
  /\bCheck the pattern\.$/i,
  /\bThink step by step\.$/i,
  /\bChoose the strongest answer\.$/i,
  /\bLook at every detail\.$/i,
  /\bUse what you know\.$/i,
  /\bRead the choices twice\.$/i,
  /\bSolve it carefully\.$/i,
  /\bChoose carefully\.$/i,
  /\bGo one step at a time\.$/i,
  /\bPick the best answer\.$/i,
];

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function capitalizeSentence(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function sanitizePromptMetaSuffixes(value: string) {
  let prompt = collapseWhitespace(value);

  for (const pattern of PROMPT_META_SUFFIX_PATTERNS) {
    prompt = prompt.replace(pattern, "").trim();
  }

  return collapseWhitespace(prompt);
}

function sanitizeCauseEffectPrompt(skill: string, prompt: string) {
  if (skill !== "cause-effect" && skill !== "historical-cause-effect") {
    return prompt;
  }

  let nextPrompt = sanitizePromptMetaSuffixes(prompt);
  nextPrompt = nextPrompt.replace(/\s+(What (?:was|is|happened|happens))/i, ". $1");
  nextPrompt = nextPrompt.replace(/\.\s+\./g, ". ");
  nextPrompt = collapseWhitespace(nextPrompt);

  if (!nextPrompt) {
    return prompt;
  }

  return capitalizeSentence(nextPrompt);
}

function sanitizeQuestionPrompt(skill: string, prompt: string) {
  const trimmed = sanitizePromptMetaSuffixes(prompt);
  return sanitizeCauseEffectPrompt(skill, trimmed);
}

function questionModuleFromSubject(subject: string) {
  return MODULE_BY_SUBJECT[subject] ?? "general";
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function toGenerationMetadata(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  return {};
}

function sanitizeEarlyLearnerWordQuestion(input: {
  skill: string;
  correctAnswer: string;
  distractors: string[];
}) {
  const skill = input.skill.toLowerCase();
  const correctAnswer = input.correctAnswer.toLowerCase();
  const ambiguousConfig = AMBIGUOUS_EARLY_WORD_DISTRACTORS[correctAnswer];
  const isWordReadingSkill =
    skill === "read-simple-word" ||
    skill === "decodable-cvc-word" ||
    skill === "short-a-sound" ||
    skill === "short-e-sound" ||
    skill === "short-i-sound";

  if (!isWordReadingSkill || !ambiguousConfig) {
    return input.distractors;
  }

  const blocked = new Set(
    ambiguousConfig.blocked.map((value) => value.toLowerCase()),
  );
  const sanitized = input.distractors.filter(
    (value) => !blocked.has(value.toLowerCase()),
  );
  const used = new Set([
    correctAnswer,
    ...sanitized.map((value) => value.toLowerCase()),
  ]);

  for (const replacement of ambiguousConfig.replacements) {
    if (sanitized.length >= input.distractors.length) {
      break;
    }

    if (used.has(replacement.toLowerCase())) {
      continue;
    }

    sanitized.push(replacement);
    used.add(replacement.toLowerCase());
  }

  return sanitized.slice(0, input.distractors.length);
}

function mapQuestionRow(row: Record<string, unknown>): ContentQuestion {
  const subject = String(row.subject ?? "");
  const skill = String(row.skill ?? "");
  const correctAnswer = String(row.correct_answer ?? "");

  return {
    question_key: String(row.question_key ?? ""),
    launch_band: String(row.launch_band ?? ""),
    module: questionModuleFromSubject(subject),
    subject,
    skill,
    theme: String(row.theme ?? ""),
    prompt: sanitizeQuestionPrompt(skill, String(row.prompt ?? "")),
    correct_answer: correctAnswer,
    distractors: sanitizeEarlyLearnerWordQuestion({
      skill,
      correctAnswer,
      distractors: toStringArray(row.distractors),
    }),
    modality: "tap",
    difficulty: Number(row.difficulty ?? 1),
    explanation_text: String(row.explanation_text ?? ""),
    voice_script: String(row.voice_script ?? ""),
    media_hint: String(row.media_hint ?? ""),
    source_kind: String(row.source_kind ?? "seeded"),
    generation_metadata: toGenerationMetadata(row.generation_metadata),
  };
}

function appendArrayFilter(
  clauses: string[],
  values: unknown[],
  sql: string,
  items: string[] | undefined,
) {
  if (!items?.length) {
    return;
  }

  values.push(items);
  clauses.push(sql.replace("?", `$${values.length}::text[]`));
}

function appendScalarFilter(
  clauses: string[],
  values: unknown[],
  sql: string,
  value: number | undefined,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return;
  }

  values.push(value);
  clauses.push(sql.replace("?", `$${values.length}`));
}

function buildQuestionQuery(filters: QuestionQueryFilters) {
  const clauses = ["ei.active = true", "s.active = true"];
  const values: unknown[] = [];

  appendArrayFilter(
    clauses,
    values,
    "ei.example_key = any(?)",
    filters.questionKeys,
  );
  appendArrayFilter(
    clauses,
    values,
    "not (ei.example_key = any(?))",
    filters.excludeQuestionKeys,
  );
  appendArrayFilter(
    clauses,
    values,
    "ei.launch_band_code = any(?)",
    filters.launchBands,
  );
  appendArrayFilter(
    clauses,
    values,
    "s.code = any(?)",
    filters.skillCodes,
  );
  appendArrayFilter(
    clauses,
    values,
    "coalesce(ei.source_kind, 'seeded') = any(?)",
    filters.sourceKinds,
  );

  const subjectCodes = [
    ...(filters.subjectCodes ?? []),
    ...((filters.modules ?? []).flatMap((module) => SUBJECTS_BY_MODULE[module] ?? [])),
  ];

  appendArrayFilter(
    clauses,
    values,
    "s.subject_code = any(?)",
    [...new Set(subjectCodes)],
  );

  appendScalarFilter(
    clauses,
    values,
    "ei.difficulty >= ?",
    filters.minDifficulty,
  );
  appendScalarFilter(
    clauses,
    values,
    "ei.difficulty <= ?",
    filters.maxDifficulty,
  );

  const orderBy =
    filters.orderBy === "difficulty_desc"
      ? "ei.difficulty desc, random()"
      : filters.orderBy === "question_key_asc"
        ? "ei.example_key asc"
        : filters.orderBy === "random"
          ? "random()"
          : "ei.difficulty asc, random()";

  let limitClause = "";
  if (typeof filters.limit === "number" && Number.isFinite(filters.limit)) {
    values.push(Math.max(1, Math.floor(filters.limit)));
    limitClause = `limit $${values.length}`;
  }

  return {
    sql: `
      select
        ei.example_key as question_key,
        ei.launch_band_code as launch_band,
        coalesce(ei.theme_code, '') as theme,
        ei.prompt_text as prompt,
        ei.correct_answer,
        ei.distractors,
        ei.difficulty,
        ei.explanation_text,
        coalesce(ei.voice_script, '') as voice_script,
        coalesce(ei.media_hint, '') as media_hint,
        coalesce(ei.source_kind, 'seeded') as source_kind,
        coalesce(ei.generation_metadata, '{}'::jsonb) as generation_metadata,
        s.code as skill,
        s.subject_code as subject
      from public.example_items ei
      join public.skills s
        on s.id = ei.skill_id
      where ${clauses.join("\n        and ")}
      order by ${orderBy}
      ${limitClause}
    `,
    values,
  };
}

export async function findQuestions(filters: QuestionQueryFilters = {}) {
  const query = buildQuestionQuery(filters);
  const result = await db.query(query.sql, query.values);
  return result.rows.map((row) => mapQuestionRow(row as Record<string, unknown>));
}

export async function getQuestionByKey(questionKey: string) {
  const [question] = await findQuestions({
    questionKeys: [questionKey],
    limit: 1,
    orderBy: "question_key_asc",
  });

  return question ?? null;
}

export async function getQuestionsByKeys(questionKeys: string[]) {
  if (!questionKeys.length) {
    return [];
  }

  const questions = await findQuestions({
    questionKeys,
    limit: questionKeys.length,
    orderBy: "question_key_asc",
  });

  const questionIndex = new Map(
    questions.map((question) => [question.question_key, question]),
  );

  return questionKeys
    .map((questionKey) => questionIndex.get(questionKey) ?? null)
    .filter((question): question is ContentQuestion => Boolean(question));
}

export async function getSkillContext(skillCode: string) {
  const result = await db.query(
    `
      select
        id,
        code,
        subject_code,
        launch_band_code,
        display_name,
        description,
        difficulty_floor,
        difficulty_ceiling
      from public.skills
      where code = $1 and active = true
      limit 1
    `,
    [skillCode],
  );

  if (!result.rowCount) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: String(row.id),
    code: String(row.code),
    subject_code: String(row.subject_code),
    launch_band_code: String(row.launch_band_code),
    display_name: String(row.display_name),
    description: String(row.description),
    difficulty_floor: Number(row.difficulty_floor ?? 1),
    difficulty_ceiling: Number(row.difficulty_ceiling ?? 1),
  } satisfies SkillContext;
}

export async function getRecentPromptsForSkill(skillCode: string, limit = 12) {
  const skill = await getSkillContext(skillCode);

  if (!skill) {
    return [];
  }

  try {
    const result = await db.query(
      `
        select ei.prompt_text
        from public.example_items ei
        where ei.skill_id = $1
          and ei.active = true
        limit $2
      `,
      [skill.id, limit],
    );

    return result.rows
      .map((row) => String(row.prompt_text ?? ""))
      .filter(Boolean);
  } catch (error) {
    console.error(
      "WonderQuest prompt history lookup failed; continuing without prompt history",
      error,
    );
    return [];
  }
}

type CachedLiveQuestionFilters = {
  launchBandCode: string;
  skillCode: string;
  difficulty: number;
  excludeQuestionKeys?: string[];
  limit?: number;
  difficultyDelta?: number;
};

export async function findCachedLiveQuestions(
  filters: CachedLiveQuestionFilters,
) {
  const limit = Math.max(1, Math.floor(filters.limit ?? 1));
  const difficultyDelta = Math.max(0, Math.floor(filters.difficultyDelta ?? 1));

  const exactWindow = await findQuestions({
    launchBands: [filters.launchBandCode],
    skillCodes: [filters.skillCode],
    sourceKinds: ["ai-live"],
    minDifficulty: Math.max(1, filters.difficulty - difficultyDelta),
    maxDifficulty: filters.difficulty + difficultyDelta,
    excludeQuestionKeys: filters.excludeQuestionKeys,
    orderBy: "difficulty_asc",
    limit,
  });

  if (exactWindow.length >= limit || difficultyDelta > 1) {
    return exactWindow;
  }

  const fallbackPool = await findQuestions({
    launchBands: [filters.launchBandCode],
    skillCodes: [filters.skillCode],
    sourceKinds: ["ai-live"],
    excludeQuestionKeys: filters.excludeQuestionKeys,
    orderBy: "difficulty_asc",
    limit,
  });

  if (!exactWindow.length) {
    return fallbackPool;
  }

  const merged = new Map(
    [...exactWindow, ...fallbackPool].map((question) => [question.question_key, question]),
  );

  return [...merged.values()].slice(0, limit);
}

type InsertAiQuestionInput = {
  launchBandCode: string;
  skillCode: string;
  themeCode: string | null;
  difficulty: number;
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  explanationText: string;
  voiceScript: string;
  mediaHint: string;
  format: string;
  sourceKind?: string;
  generationMetadata?: Record<string, unknown>;
  keySeed: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export async function insertAiGeneratedQuestion(input: InsertAiQuestionInput) {
  const skill = await getSkillContext(input.skillCode);

  if (!skill) {
    throw new Error(`Skill ${input.skillCode} was not found.`);
  }

  const sourceKind = input.sourceKind ?? "ai-live";
  const keyBase = `${sourceKind}_${slugify(input.skillCode)}_${slugify(input.keySeed)}`;
  const questionKey = `${keyBase}_q`;
  const explainerKey = `${keyBase}_x`;
  const generationMetadata = input.generationMetadata ?? {};

  await db.query(
    `
      insert into public.explainer_assets (
        explainer_key,
        launch_band_code,
        subject_code,
        format,
        misconception_type,
        script_text,
        media_hint,
        active,
        source_kind,
        generation_metadata
      )
      values ($1, $2, $3, $4, $5, $6, $7, true, $8, $9::jsonb)
      on conflict (explainer_key)
      do update
      set
        script_text = excluded.script_text,
        media_hint = excluded.media_hint,
        active = true,
        source_kind = excluded.source_kind,
        generation_metadata = excluded.generation_metadata
    `,
    [
      explainerKey,
      input.launchBandCode,
      skill.subject_code,
      input.format,
      input.skillCode,
      input.explanationText,
      input.mediaHint,
      sourceKind,
      JSON.stringify(generationMetadata),
    ],
  );

  await db.query(
    `
      insert into public.example_items (
        example_key,
        skill_id,
        theme_code,
        launch_band_code,
        prompt_text,
        correct_answer,
        distractors,
        explanation_text,
        voice_script,
        media_hint,
        difficulty,
        active,
        source_kind,
        generation_metadata
      )
      values (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7::jsonb,
        $8,
        $9,
        $10,
        $11,
        true,
        $12,
        $13::jsonb
      )
      on conflict (example_key)
      do update
      set
        prompt_text = excluded.prompt_text,
        correct_answer = excluded.correct_answer,
        distractors = excluded.distractors,
        explanation_text = excluded.explanation_text,
        voice_script = excluded.voice_script,
        media_hint = excluded.media_hint,
        difficulty = excluded.difficulty,
        active = true,
        source_kind = excluded.source_kind,
        generation_metadata = excluded.generation_metadata
    `,
    [
      questionKey,
      skill.id,
      input.themeCode,
      input.launchBandCode,
      input.prompt,
      input.correctAnswer,
      JSON.stringify(input.distractors),
      input.explanationText,
      input.voiceScript,
      input.mediaHint,
      input.difficulty,
      sourceKind,
      JSON.stringify(generationMetadata),
    ],
  );

  return getQuestionByKey(questionKey);
}
