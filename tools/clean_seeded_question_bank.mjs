import { access, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import {
  promptNeedsSanitization,
  sanitizeQuestionPrompt,
} from "./question-prompt-sanitizer.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const questionBankPath = path.resolve(repoRoot, "data", "launch", "sample_questions.json");

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function loadQuestionBank() {
  const gzipPath = `${questionBankPath}.gz`;
  const resolvedPath = (await pathExists(gzipPath)) ? gzipPath : questionBankPath;
  const file = await readFile(resolvedPath);
  const rawText = resolvedPath.endsWith(".gz")
    ? gunzipSync(file).toString("utf8")
    : file.toString("utf8");

  return {
    resolvedPath,
    questions: JSON.parse(rawText),
  };
}

async function writeQuestionBank(questions) {
  const serialized = `${JSON.stringify(questions, null, 2)}\n`;
  const compressed = gzipSync(serialized, { level: 9 });

  await writeFile(`${questionBankPath}.gz`, compressed);
  await rm(questionBankPath, { force: true });
}

async function main() {
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const { resolvedPath, questions } = await loadQuestionBank();

  let changedCount = 0;
  const cleanedQuestions = questions.map((question) => {
    const prompt = String(question.prompt ?? "");

    if (!promptNeedsSanitization(prompt)) {
      return question;
    }

    changedCount += 1;

    return {
      ...question,
      prompt: sanitizeQuestionPrompt(prompt),
    };
  });

  if (!dryRun && changedCount > 0) {
    await writeQuestionBank(cleanedQuestions);
  }

  console.log(
    JSON.stringify(
      {
        source: resolvedPath,
        questionCount: cleanedQuestions.length,
        changedCount,
        wroteChanges: !dryRun && changedCount > 0,
        dryRun,
      },
      null,
      2,
    ),
  );
}

await main();
