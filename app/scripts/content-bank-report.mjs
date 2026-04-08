import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import {
  promptNeedsSanitization,
  sanitizeQuestionPrompt,
} from "../../tools/question-prompt-sanitizer.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");

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

function countBy(items, selector) {
  const counts = new Map();
  for (const item of items) {
    const key = selector(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function mapToSortedEntries(map) {
  return [...map.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return String(a[0]).localeCompare(String(b[0]));
  });
}

async function main() {
  const [questions, explainers] = await Promise.all([
    loadJson("data/launch/sample_questions.json"),
    loadJson("data/launch/explainers.json"),
  ]);

  const questionKeys = new Set();
  const duplicateQuestionKeys = new Map();

  for (const question of questions) {
    const key = question.question_key;
    duplicateQuestionKeys.set(key, (duplicateQuestionKeys.get(key) ?? 0) + 1);
    questionKeys.add(key);
  }

  const explainerKeys = new Set(explainers.map((explainer) => explainer.explainer_key));
  const missingExplainers = questions
    .filter((question) => !explainerKeys.has(question.explainer_key))
    .map((question) => ({
      question_key: question.question_key,
      explainer_key: question.explainer_key,
      launch_band: question.launch_band,
      skill: question.skill,
    }));

  const bandCounts = mapToSortedEntries(countBy(questions, (question) => question.launch_band));
  const moduleCounts = mapToSortedEntries(
    countBy(questions, (question) => question.module ?? question.subject),
  );
  const skillCounts = countBy(questions, (question) => `${question.launch_band}:${question.skill}`);
  const explainerUsage = mapToSortedEntries(countBy(questions, (question) => question.explainer_key));

  const topSkillsByBand = {};
  for (const band of [...new Set(questions.map((question) => question.launch_band))].sort()) {
    topSkillsByBand[band] = mapToSortedEntries(
      countBy(
        questions.filter((question) => question.launch_band === band),
        (question) => question.skill,
      ),
    ).slice(0, 10);
  }

  const duplicateKeys = [...duplicateQuestionKeys.entries()]
    .filter(([, count]) => count > 1)
    .map(([question_key, count]) => ({ question_key, count }));

  const thinExplainers = explainerUsage.filter(([, count]) => count < 10).slice(0, 20);
  const promptHygieneIssues = questions
    .filter((question) => promptNeedsSanitization(question.prompt))
    .slice(0, 20)
    .map((question) => ({
      question_key: question.question_key,
      skill: question.skill,
      launch_band: question.launch_band,
      prompt: String(question.prompt),
      sanitizedPrompt: sanitizeQuestionPrompt(question.prompt),
    }));
  const promptHygieneIssueCount = questions.reduce(
    (count, question) => count + (promptNeedsSanitization(question.prompt) ? 1 : 0),
    0,
  );

  console.log(
    JSON.stringify(
      {
        totals: {
          questions: questions.length,
          explainers: explainers.length,
        },
        bandCounts: Object.fromEntries(bandCounts),
        moduleCounts: Object.fromEntries(moduleCounts),
        topSkillsByBand: Object.fromEntries(
          Object.entries(topSkillsByBand).map(([band, entries]) => [
            band,
            entries.map(([skill, count]) => ({ skill, count })),
          ]),
        ),
        duplicateQuestionKeys: duplicateKeys,
        missingExplainers,
        thinExplainers: thinExplainers.map(([explainer_key, count]) => ({ explainer_key, count })),
        promptHygiene: {
          issueCount: promptHygieneIssueCount,
          sample: promptHygieneIssues,
        },
      },
      null,
      2,
    ),
  );
}

await main();
