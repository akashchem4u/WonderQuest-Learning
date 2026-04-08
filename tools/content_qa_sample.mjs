import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import {
  promptNeedsSanitization,
  sanitizeQuestionPrompt,
} from "./question-prompt-sanitizer.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

function projectPath(...segments) {
  return path.resolve(repoRoot, ...segments);
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function loadJson(relativePath) {
  const absolutePath = projectPath(relativePath);
  const gzipPath = `${absolutePath}.gz`;
  const resolvedPath = (await pathExists(gzipPath)) ? gzipPath : absolutePath;
  const file = await readFile(resolvedPath);
  const rawText = resolvedPath.endsWith(".gz")
    ? gunzipSync(file).toString("utf8")
    : file.toString("utf8");
  return JSON.parse(rawText);
}

function words(text) {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function pickDeterministicSample(items, sampleSize) {
  if (items.length <= sampleSize) {
    return items;
  }

  return Array.from({ length: sampleSize }, (_, index) => {
    const position = Math.floor(((index + 1) * items.length) / (sampleSize + 1));
    return items[position];
  });
}

function normalizeAnswer(value) {
  return String(value).trim().toLowerCase();
}

async function main() {
  const samplePerBand = Math.max(1, Number(process.env.SAMPLE_PER_BAND ?? 5) || 5);
  const questions = await loadJson("data/launch/sample_questions.json");
  const skills = await loadJson("data/launch/skills.json");

  const skillMap = new Map(
    skills.map((skill) => [
      String(skill.code),
      {
        launchBand: String(skill.launch_band),
        difficultyFloor: Number(skill.difficulty_floor),
        difficultyCeiling: Number(skill.difficulty_ceiling),
      },
    ]),
  );

  const disallowedAnswers = new Set([
    "all of the above",
    "none of the above",
  ]);

  const questionsByBand = new Map();
  for (const question of questions) {
    const band = String(question.launch_band);
    const existing = questionsByBand.get(band) ?? [];
    existing.push(question);
    questionsByBand.set(band, existing);
  }

  const report = {
    samplePerBand,
    bandSummaries: {},
    flaggedIssues: [],
  };

  for (const [band, bandQuestions] of [...questionsByBand.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const ordered = [...bandQuestions].sort((left, right) =>
      String(left.question_key).localeCompare(String(right.question_key)),
    );
    const sample = pickDeterministicSample(ordered, samplePerBand);
    const sampleRows = sample.map((question) => {
      const skillMeta = skillMap.get(String(question.skill)) ?? null;
      const answers = [
        question.correct_answer,
        ...(Array.isArray(question.distractors) ? question.distractors : []),
      ].map((answer) => String(answer));

      const hasDisallowedAnswer = answers.some((answer) =>
        disallowedAnswers.has(normalizeAnswer(answer)),
      );
      const promptRequiresCleanup = promptNeedsSanitization(question.prompt);
      const difficulty = Number(question.difficulty);
      const difficultyInRange =
        skillMeta === null
          ? false
          : difficulty >= skillMeta.difficultyFloor && difficulty <= skillMeta.difficultyCeiling;

      if (hasDisallowedAnswer || !difficultyInRange || promptRequiresCleanup) {
        report.flaggedIssues.push({
          band,
          questionKey: String(question.question_key),
          skill: String(question.skill),
          hasDisallowedAnswer,
          promptRequiresCleanup,
          difficulty,
          expectedFloor: skillMeta?.difficultyFloor ?? null,
          expectedCeiling: skillMeta?.difficultyCeiling ?? null,
        });
      }

      return {
        questionKey: String(question.question_key),
        skill: String(question.skill),
        subject: String(question.subject),
        difficulty,
        difficultyRange:
          skillMeta === null
            ? null
            : `${skillMeta.difficultyFloor}-${skillMeta.difficultyCeiling}`,
        difficultyInRange,
        hasDisallowedAnswer,
        promptRequiresCleanup,
        promptWordCount: words(question.prompt).length,
        answerWordCount: Math.max(...answers.map((answer) => words(answer).length)),
        prompt: String(question.prompt),
        sanitizedPrompt: sanitizeQuestionPrompt(question.prompt),
        correctAnswer: String(question.correct_answer),
        distractors: Array.isArray(question.distractors)
          ? question.distractors.map((answer) => String(answer))
          : [],
      };
    });

    report.bandSummaries[band] = {
      sampleCount: sampleRows.length,
      difficultyFailures: sampleRows.filter((row) => !row.difficultyInRange).length,
      disallowedAnswerFailures: sampleRows.filter((row) => row.hasDisallowedAnswer).length,
      promptHygieneFailures: sampleRows.filter((row) => row.promptRequiresCleanup).length,
      samples: sampleRows,
    };
  }

  console.log(JSON.stringify(report, null, 2));
}

await main();
