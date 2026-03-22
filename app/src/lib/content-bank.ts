import { readFileSync } from "node:fs";
import path from "node:path";

import type { ExplainerItem, SampleQuestionItem } from "@/lib/launch-data";

type ContentBank = {
  explainers: ExplainerItem[];
  sampleQuestions: SampleQuestionItem[];
  explainerIndex: Map<string, ExplainerItem>;
  questionIndex: Map<string, SampleQuestionItem>;
};

declare global {
  // eslint-disable-next-line no-var
  var __wonderquestContentBank: ContentBank | undefined;
}

function loadLaunchJson<T>(filename: string) {
  const filePath = path.resolve(process.cwd(), "..", "data", "launch", filename);
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function createContentBank(): ContentBank {
  const explainers = loadLaunchJson<ExplainerItem[]>("explainers.json");
  const sampleQuestions =
    loadLaunchJson<SampleQuestionItem[]>("sample_questions.json");

  return {
    explainers,
    sampleQuestions,
    explainerIndex: new Map(
      explainers.map((item) => [item.explainer_key, item]),
    ),
    questionIndex: new Map(
      sampleQuestions.map((item) => [item.question_key, item]),
    ),
  };
}

function getContentBank() {
  return (
    global.__wonderquestContentBank ??
    (global.__wonderquestContentBank = createContentBank())
  );
}

export function getSampleQuestions() {
  return getContentBank().sampleQuestions;
}

export function getQuestionByKey(questionKey: string) {
  return getContentBank().questionIndex.get(questionKey) ?? null;
}

export function getExplainerByKey(explainerKey: string) {
  return getContentBank().explainerIndex.get(explainerKey) ?? null;
}
