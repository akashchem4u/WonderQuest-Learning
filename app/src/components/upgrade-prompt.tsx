"use client";

import Link from "next/link";

export type UpgradeReason = "child_limit" | "session_limit" | "ai_questions";

interface UpgradePromptProps {
  reason: UpgradeReason;
  /** Optional child name for personalized messaging */
  childName?: string;
  /** Free plan limit hit (e.g. 3 sessions) */
  limit?: number;
}

const REASON_COPY: Record<
  UpgradeReason,
  { icon: string; title: string; body: (childName?: string, limit?: number) => string; cta: string }
> = {
  child_limit: {
    icon: "👨‍👩‍👧",
    title: "Child limit reached",
    body: (_name, limit) =>
      `Your Free plan supports ${limit ?? 1} child. Upgrade to Family to add up to 2 children, or Family+ for up to 5.`,
    cta: "Upgrade to Family",
  },
  session_limit: {
    icon: "⭐",
    title: "Daily session limit reached",
    body: (name, limit) =>
      `${name ? `${name} has` : "You've"} used all ${limit ?? 3} free sessions today. Upgrade to Family for unlimited daily play.`,
    cta: "Upgrade to Family",
  },
  ai_questions: {
    icon: "🤖",
    title: "AI questions are a paid feature",
    body: () => "AI-generated questions are available on the Family and Family+ plans.",
    cta: "Upgrade to Family",
  },
};

export function UpgradePrompt({ reason, childName, limit }: UpgradePromptProps) {
  const copy = REASON_COPY[reason];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(155,114,255,0.12) 0%, rgba(255,209,102,0.08) 100%)",
        border: "1.5px solid rgba(155,114,255,0.35)",
        borderRadius: "14px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: "1.6rem", flexShrink: 0 }}>{copy.icon}</div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ font: "700 0.88rem system-ui", color: "#f0f6ff", marginBottom: "3px" }}>
          {copy.title}
        </div>
        <div style={{ font: "400 0.78rem system-ui", color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
          {copy.body(childName, limit)}
        </div>
      </div>
      <Link
        href="/parent/account#upgrade"
        style={{
          display: "inline-block",
          padding: "8px 18px",
          background: "linear-gradient(135deg, #9b72ff, #7c4dff)",
          borderRadius: "10px",
          font: "700 0.8rem system-ui",
          color: "#fff",
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {copy.cta} →
      </Link>
    </div>
  );
}
