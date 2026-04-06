"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", gold: "#ffd166", amber: "#f59e0b",
};

type Overview = { studentCount: number; sessionCount: number; exampleCount: number };

// Experiments / feature flags active in this build
const FEATURE_FLAGS = [
  { id: "live_ai_questions", label: "Live AI Question Generation", description: "AI generates follow-up questions when bank runs dry", status: "active", env: "OPENAI_QUESTION_GENERATION_ENABLED" },
  { id: "adaptive_routing", label: "Adaptive Question Routing", description: "Correct answers trigger personalised follow-up questions (max 2 per session)", status: "active", env: "always on" },
  { id: "bank_first", label: "Bank-First AI Strategy", description: "Seeded questions served first; AI only supplements when bank is short", status: "active", env: "always on" },
  { id: "mastery_tracking", label: "Skill Mastery Tracking", description: "Per-skill mastery score updates after every session result", status: "active", env: "always on" },
  { id: "intervention_signals", label: "Intervention Auto-Queue", description: "Teacher intervention queue populated from mastery floor signals", status: "active", env: "always on" },
  { id: "streak_protection", label: "Streak Protection UI", description: '"Your stars are safe!" badge shown in-session', status: "active", env: "always on" },
];

export default function OwnerExperimentsPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/owner/overview")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 32px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/owner" style={{ fontSize: 12, color: "rgba(155,114,255,0.7)", textDecoration: "none", fontWeight: 600 }}>← Owner</Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Experiments & Feature Flags</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>Active features and runtime configuration for this build</p>

        {data && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
            {[
              { val: data.studentCount, lbl: "Students affected", color: C.violet },
              { val: data.sessionCount, lbl: "Sessions in corpus", color: C.mint },
              { val: data.exampleCount, lbl: "Bank questions", color: C.gold },
            ].map(({ val, lbl, color }) => (
              <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", flex: "1 1 120px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FEATURE_FLAGS.map((f) => (
            <div key={f.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.mint, flexShrink: 0, marginTop: 3, boxShadow: `0 0 6px ${C.mint}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{f.description}</div>
                <div style={{ fontSize: 10, color: "rgba(155,114,255,0.6)", fontFamily: "monospace" }}>env: {f.env}</div>
              </div>
              <div style={{ background: "rgba(80,232,144,0.12)", border: "1px solid rgba(80,232,144,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: C.mint, flexShrink: 0 }}>
                ACTIVE
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
