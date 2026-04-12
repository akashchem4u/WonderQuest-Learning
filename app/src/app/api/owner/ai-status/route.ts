import { NextRequest, NextResponse } from "next/server";
import { requireOwnerSession } from "@/lib/owner-session";

function envFlag(name: string): boolean {
  const v = process.env[name]?.trim().replace(/^["']|["']$/g, "").toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function envPresent(name: string): boolean {
  const v = process.env[name]?.trim().replace(/^["']|["']$/g, "");
  return !!v && v.length > 0;
}

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  const liveGenEnabled = envFlag("ENABLE_LIVE_QUESTION_GENERATION");
  const explainerEnabled = envFlag("ENABLE_CONCEPT_EXPLAINER");
  const openAiPresent = envPresent("OPENAI_API_KEY");
  const primaryModel = process.env.OPENAI_PRIMARY_MODEL?.trim() || "o4-mini";
  const fallbackModel = process.env.OPENAI_FALLBACK_MODEL?.trim() || "(none)";
  const sessionBudgetRaw = process.env.LIVE_SESSION_QUESTION_BUDGET?.trim();
  const sessionBudget = sessionBudgetRaw ? Number(sessionBudgetRaw) : 3;

  const features = [
    {
      name: "Live Question Generation",
      key: "ENABLE_LIVE_QUESTION_GENERATION",
      enabled: liveGenEnabled,
      healthy: liveGenEnabled ? openAiPresent : true,
      details: liveGenEnabled
        ? openAiPresent
          ? `Active — model: ${primaryModel}, fallback: ${fallbackModel}, session budget: ${sessionBudget}`
          : "Enabled but OPENAI_API_KEY is missing — questions will fall back to static bank"
        : "Disabled — all sessions use static question bank",
    },
    {
      name: "Concept Explainer",
      key: "ENABLE_CONCEPT_EXPLAINER",
      enabled: explainerEnabled,
      healthy: explainerEnabled ? openAiPresent : true,
      details: explainerEnabled
        ? openAiPresent
          ? `Active — uses ${primaryModel}`
          : "Enabled but OPENAI_API_KEY is missing — explanations will return null"
        : "Disabled",
    },
    {
      name: "OpenAI API Key",
      key: "OPENAI_API_KEY",
      enabled: openAiPresent,
      healthy: openAiPresent,
      details: openAiPresent ? "Present" : "Missing — all AI features will degrade gracefully",
    },
  ];

  const allHealthy = features.every((f) => f.healthy);

  return NextResponse.json({
    allHealthy,
    checkedAt: new Date().toISOString(),
    features,
    config: {
      primaryModel,
      fallbackModel,
      sessionBudget,
      liveGenEnabled,
      explainerEnabled,
    },
  });
}
