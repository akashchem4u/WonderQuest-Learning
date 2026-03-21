import { createHash } from "node:crypto";

export type FeedbackCategory =
  | "bug"
  | "enhancement"
  | "content"
  | "safety"
  | "product-insight";

export type FeedbackInput = {
  message: string;
  reportedType?: string;
  sourceChannel: string;
};

type TriageResult = {
  category: FeedbackCategory;
  confidence: number;
  urgency: "low" | "medium" | "high" | "critical";
  impactedArea: string;
  routingTarget: string;
  summary: string;
  duplicateClusterId: string;
};

const categoryHints: Record<FeedbackCategory, string[]> = {
  bug: [
    "bug",
    "broken",
    "error",
    "issue",
    "stuck",
    "freeze",
    "crash",
    "blank",
    "doesn't work",
    "does not work",
    "not working",
  ],
  enhancement: [
    "feature",
    "add",
    "would like",
    "wish",
    "improve",
    "better",
    "enhancement",
    "please add",
    "should have",
  ],
  content: [
    "question",
    "answer",
    "typo",
    "content",
    "wrong",
    "explainer",
    "reading",
    "math",
    "phonics",
    "lesson",
  ],
  safety: [
    "unsafe",
    "inappropriate",
    "scary",
    "offensive",
    "violent",
    "personal information",
    "bully",
    "harm",
  ],
  "product-insight": [],
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function summarize(message: string) {
  const trimmed = message.trim();
  if (trimmed.length <= 140) {
    return trimmed;
  }

  return `${trimmed.slice(0, 137)}...`;
}

function detectCategory(message: string, reportedType?: string) {
  const normalizedType = normalizeText(reportedType ?? "");

  if (
    normalizedType === "bug" ||
    normalizedType === "enhancement" ||
    normalizedType === "content" ||
    normalizedType === "safety"
  ) {
    return {
      category: normalizedType as FeedbackCategory,
      confidence: 0.96,
    };
  }

  const normalizedMessage = normalizeText(message);
  let bestCategory: FeedbackCategory = "product-insight";
  let bestScore = 0;

  for (const [category, hints] of Object.entries(categoryHints) as Array<
    [FeedbackCategory, string[]]
  >) {
    const score = hints.reduce((count, hint) => {
      return count + (normalizedMessage.includes(hint) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  }

  if (bestScore === 0) {
    return {
      category: "product-insight" as FeedbackCategory,
      confidence: 0.58,
    };
  }

  return {
    category: bestCategory,
    confidence: Math.min(0.9, 0.62 + bestScore * 0.1),
  };
}

function detectImpactedArea(message: string, sourceChannel: string) {
  const normalized = `${normalizeText(sourceChannel)} ${normalizeText(message)}`;

  if (/(login|pin|username|access|sign in)/.test(normalized)) {
    return "access";
  }

  if (/(question|answer|play|explainer|badge|trophy|points)/.test(normalized)) {
    return "play-loop";
  }

  if (/(parent|teacher|owner|dashboard|report|chart)/.test(normalized)) {
    return "dashboards";
  }

  if (/(notify|notification|reminder|weekly|milestone)/.test(normalized)) {
    return "notifications";
  }

  if (/(content|reading|math|phonics|lesson|story)/.test(normalized)) {
    return "content";
  }

  return "general";
}

function urgencyForCategory(category: FeedbackCategory, message: string) {
  const normalized = normalizeText(message);

  if (category === "safety") {
    return "critical" as const;
  }

  if (category === "bug" && /(crash|blocked|cannot|can't|stuck|error)/.test(normalized)) {
    return "high" as const;
  }

  if (category === "content" || category === "bug") {
    return "medium" as const;
  }

  return "low" as const;
}

function routingForCategory(category: FeedbackCategory, impactedArea: string) {
  if (category === "safety") {
    return "safety-review";
  }

  if (category === "content") {
    return "content-review";
  }

  if (category === "bug") {
    return impactedArea === "dashboards"
      ? "product-engineering"
      : "engineering-triage";
  }

  if (category === "enhancement") {
    return "product-roadmap";
  }

  return "product-insights";
}

function buildDuplicateClusterId(category: FeedbackCategory, impactedArea: string, message: string) {
  const normalized = normalizeText(message)
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 8)
    .join("-");

  return createHash("sha1")
    .update(`${category}:${impactedArea}:${normalized}`)
    .digest("hex")
    .slice(0, 12);
}

export function triageFeedback(input: FeedbackInput): TriageResult {
  const detected = detectCategory(input.message, input.reportedType);
  const impactedArea = detectImpactedArea(input.message, input.sourceChannel);

  return {
    category: detected.category,
    confidence: detected.confidence,
    urgency: urgencyForCategory(detected.category, input.message),
    impactedArea,
    routingTarget: routingForCategory(detected.category, impactedArea),
    summary: summarize(input.message),
    duplicateClusterId: buildDuplicateClusterId(
      detected.category,
      impactedArea,
      input.message,
    ),
  };
}
