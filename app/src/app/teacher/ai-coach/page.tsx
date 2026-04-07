"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  red: "#ff7b6b",
};

interface AiSuggestion {
  studentId: string;
  displayName: string;
  bandCode: string;
  archetype: "advanced" | "on-track" | "developing" | "foundational";
  focusSkill: string;
  focusSkillName: string;
  reason: string;
  aiNote: string;
  masteryScore: number;
  priority: "urgent" | "normal";
}

function archetypeInfo(archetype: AiSuggestion["archetype"]) {
  switch (archetype) {
    case "advanced": return { emoji: "🚀", label: "Advanced", color: C.mint };
    case "on-track": return { emoji: "✅", label: "On Track", color: C.blue };
    case "developing": return { emoji: "📈", label: "Developing", color: C.gold };
    case "foundational": return { emoji: "🌱", label: "Foundational", color: C.amber };
  }
}

export default function AiCoachPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState<number | null>(null);
  const [isVirtual, setIsVirtual] = useState(false);

  useEffect(() => {
    setAuthed(!!getTeacherId());
  }, []);

  useEffect(() => {
    if (!authed) return;
    Promise.all([
      fetch("/api/teacher/ai-suggestions").then((r) => r.ok ? r.json() : { suggestions: [] }),
      fetch("/api/teacher/has-virtual-class").then((r) => r.ok ? r.json() : { isVirtual: false }),
    ])
      .then(([sData, vData]) => {
        setSuggestions((sData as { suggestions: AiSuggestion[] }).suggestions ?? []);
        setIsVirtual((vData as { isVirtual?: boolean }).isVirtual ?? false);
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, [authed]);

  async function handlePushAll() {
    setPushing(true);
    try {
      const res = await fetch("/api/teacher/ai-push-sessions", { method: "POST" });
      if (res.ok) {
        const data = await res.json() as { pushed: number; suggestions: AiSuggestion[] };
        setPushed(data.pushed);
        setSuggestions(data.suggestions ?? []);
      }
    } finally {
      setPushing(false);
    }
  }

  async function handlePushOne(s: AiSuggestion) {
    setPushing(true);
    try {
      const res = await fetch("/api/teacher/ai-push-sessions", { method: "POST" });
      if (res.ok) {
        const data = await res.json() as { pushed: number; suggestions: AiSuggestion[] };
        setPushed(data.pushed);
        setSuggestions(data.suggestions ?? []);
      }
    } finally {
      setPushing(false);
    }
  }

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/ai-coach">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/ai-coach">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px" }}>
        {/* Header */}
        <div style={{ marginBottom: 6 }}>
          <Link href="/teacher" style={{ fontSize: 12, color: C.muted, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
            ← Teacher Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>🤖 AI Learning Coach</h1>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                Adaptive curriculum recommendations for your classroom
              </p>
            </div>
            {isVirtual && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)",
                color: C.amber,
              }}>
                🎭 Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Demo mode banner */}
        {isVirtual && (
          <div style={{
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: C.text,
          }}>
            You are viewing a <strong style={{ color: C.amber }}>virtual demo classroom</strong>. These suggestions are generated from simulated mastery data. Push sessions to see how the AI coaching flow works end-to-end.
          </div>
        )}

        {/* Push All button + status */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={handlePushAll}
            disabled={pushing || loading}
            style={{
              padding: "12px 24px", borderRadius: 12, background: C.violet, color: "#fff",
              font: "700 0.9rem system-ui", border: "none",
              cursor: (pushing || loading) ? "not-allowed" : "pointer",
              opacity: (pushing || loading) ? 0.7 : 1,
            }}
          >
            {pushing ? "Analyzing & pushing…" : "Push All →"}
          </button>
          <span style={{ fontSize: 12, color: C.muted }}>
            Pushes the top-priority skill session for each student who needs it
          </span>
        </div>

        {pushed !== null && (
          <div style={{
            background: C.mint + "15", border: `1px solid ${C.mint}44`,
            borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700,
            color: C.mint, marginBottom: 20,
          }}>
            {pushed === 0
              ? "All sessions already queued — no new pushes needed."
              : `${pushed} session${pushed !== 1 ? "s" : ""} successfully pushed to students.`}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ fontSize: 13, color: C.muted, padding: "20px 0" }}>
            Analyzing student mastery data…
          </div>
        )}

        {/* Suggestion cards */}
        {!loading && suggestions.length === 0 && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "32px", textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: C.muted }}>
              No students in your roster yet. Add students or create a demo classroom to see AI suggestions.
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {suggestions.map((s) => {
            const { emoji, label, color } = archetypeInfo(s.archetype);
            return (
              <div key={s.studentId} style={{
                background: C.surface,
                border: `1px solid ${s.priority === "urgent" ? C.red + "44" : C.border}`,
                borderRadius: 14,
                padding: "18px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}>
                {/* Archetype icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: color + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>
                  {emoji}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{s.displayName}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: color + "22", color,
                    }}>{label}</span>
                    {s.priority === "urgent" && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: C.red + "22", color: C.red,
                      }}>Urgent</span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
                    Focus skill: <strong style={{ color: C.text }}>{s.focusSkillName}</strong>
                    <span style={{ marginLeft: 8 }}>
                      · Mastery: <strong style={{ color: s.masteryScore < 40 ? C.red : s.masteryScore < 65 ? C.amber : C.mint }}>{s.masteryScore}%</strong>
                    </span>
                  </div>

                  {/* Mastery bar */}
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 8, maxWidth: 200 }}>
                    <div style={{
                      width: `${s.masteryScore}%`, height: "100%", borderRadius: 4,
                      background: s.masteryScore < 40 ? C.red : s.masteryScore < 65 ? C.amber : C.mint,
                    }} />
                  </div>

                  <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", lineHeight: 1.5 }}>
                    {s.aiNote}
                  </div>
                </div>

                {/* Push button */}
                <button
                  onClick={() => handlePushOne(s)}
                  disabled={pushing}
                  style={{
                    padding: "8px 16px", borderRadius: 10, background: C.violet, color: "#fff",
                    font: "700 0.8rem system-ui", border: "none",
                    cursor: pushing ? "not-allowed" : "pointer",
                    opacity: pushing ? 0.6 : 1,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  Push Session →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}
