"use client";

import { useState, useEffect, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  coral: "#ff7b6b",
  blue: "#38bdf8",
  text: "#f0f6ff",
  muted: "#8b949e",
  urgent: "#ef4444",
};

type Archetype = "advanced" | "on-track" | "developing" | "foundational";

interface AiSuggestion {
  studentId: string;
  displayName: string;
  bandCode: string;
  archetype: Archetype;
  focusSkill: string;
  focusSkillName: string;
  reason: string;
  aiNote: string;
  masteryScore: number;
  priority: "urgent" | "normal";
  fatigued?: boolean;
  varietySkill?: string;
  varietySkillName?: string;
  varietyReason?: string;
}

const ARCHETYPE_LABELS: Record<Archetype, string> = {
  advanced: "Advanced",
  "on-track": "On Track",
  developing: "Developing",
  foundational: "Foundational",
};

const ARCHETYPE_COLORS: Record<Archetype, string> = {
  advanced: C.mint,
  "on-track": C.blue,
  developing: C.amber,
  foundational: C.coral,
};

const BAND_LABELS: Record<string, string> = {
  PREK: "Pre-K", P0: "Pre-K", K1: "K–1", P1: "K–1",
  G23: "G2–3", P2: "G2–3", G45: "G4–5", P3: "G4–5",
};

export default function AiCoachPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { fetchTeacherId().then(id => setAuthed(!!id)); }, []);

  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pushing, setPushing] = useState<Set<string>>(new Set());
  const [pushed, setPushed] = useState<Set<string>>(new Set());
  const [pushAllBusy, setPushAllBusy] = useState(false);
  const [pushAllResult, setPushAllResult] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/ai-suggestions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { suggestions: AiSuggestion[] };
      setSuggestions(data.suggestions ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authed) fetchSuggestions(); }, [authed, fetchSuggestions]);

  async function pushSession(s: AiSuggestion) {
    setPushing((prev) => new Set(prev).add(s.studentId));
    try {
      await fetch("/api/teacher/ai-push-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: [s.studentId] }),
      });
      setPushed((prev) => new Set(prev).add(s.studentId));
    } catch { /* ignore */ } finally {
      setPushing((prev) => { const n = new Set(prev); n.delete(s.studentId); return n; });
    }
  }

  async function pushAll() {
    setPushAllBusy(true);
    setPushAllResult(null);
    try {
      const res = await fetch("/api/teacher/ai-push-sessions", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { pushed: number };
      setPushAllResult(`${data.pushed} session${data.pushed !== 1 ? "s" : ""} queued for your students`);
      setPushed(new Set(suggestions.map((s) => s.studentId)));
    } catch {
      setPushAllResult("Could not push sessions — please try again");
    } finally {
      setPushAllBusy(false);
    }
  }

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/ai-coach">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  const urgentCount = suggestions.filter((s) => s.priority === "urgent").length;
  const archetypeCounts: Record<Archetype, number> = { advanced: 0, "on-track": 0, developing: 0, foundational: 0 };
  for (const s of suggestions) archetypeCounts[s.archetype]++;

  return (
    <AppFrame audience="teacher" currentPath="/teacher/ai-coach">
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px", paddingBottom: "env(safe-area-inset-bottom, 24px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
                🤖 AI Learning Coach
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: C.muted }}>
                Personalized next-step recommendations for every student, based on their current mastery and curriculum alignment.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <button
                onClick={fetchSuggestions}
                disabled={loading}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: "transparent", color: C.muted, fontSize: 13, cursor: loading ? "default" : "pointer",
                  minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}
              >
                ↻ Refresh
              </button>
              <div>
                <button
                  onClick={pushAll}
                  disabled={pushAllBusy || suggestions.length === 0}
                  style={{
                    padding: "8px 18px", borderRadius: 8, border: "none",
                    background: pushAllBusy ? "rgba(155,114,255,0.4)" : C.violet,
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: (pushAllBusy || suggestions.length === 0) ? "default" : "pointer",
                    opacity: suggestions.length === 0 ? 0.4 : 1,
                    minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    display: "block", width: "100%",
                  }}
                >
                  {pushAllBusy ? "Queuing…" : "Push All Sessions →"}
                </button>
                {/* After the Push All Sessions button */}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.4 }}>
                  Sends today&apos;s AI-recommended skill focus to each student&apos;s quest queue.
                  Students see the new quest next time they log in.
                </div>
              </div>
            </div>
          </div>
          {pushAllResult && (
            <div style={{
              marginTop: 12, padding: "10px 16px", borderRadius: 8,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              color: C.mint, fontSize: 13,
            }}>
              ✓ {pushAllResult}
            </div>
          )}
        </div>

        {/* Summary bar */}
        {!loading && suggestions.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 28 }}>
            {urgentCount > 0 && (
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.urgent }}>{urgentCount}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Need urgent support</div>
              </div>
            )}
            {(["advanced", "on-track", "developing", "foundational"] as Archetype[]).map((arch) =>
              archetypeCounts[arch] > 0 ? (
                <div key={arch} style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: ARCHETYPE_COLORS[arch] }}>{archetypeCounts[arch]}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{ARCHETYPE_LABELS[arch]}</div>
                </div>
              ) : null,
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
            <div style={{ fontSize: 15 }}>Analyzing your classroom…</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ padding: "20px", borderRadius: 10, background: "rgba(255,123,107,0.08)", border: "1px solid rgba(255,123,107,0.2)", color: C.coral, fontSize: 14 }}>
            Could not load suggestions. {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && suggestions.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", borderRadius: 12, background: "rgba(155,114,255,0.05)", border: "1px solid rgba(155,114,255,0.15)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>No students to coach yet</div>
            <div style={{ fontSize: 14, color: C.muted, maxWidth: 380, margin: "0 auto" }}>
              Add students to your roster or set up a demo classroom from the dashboard to see AI coaching suggestions.
            </div>
          </div>
        )}

        {/* Student cards */}
        {!loading && !error && suggestions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {suggestions.map((s) => {
              const isPushed = pushed.has(s.studentId);
              const isBusy = pushing.has(s.studentId);
              const archetypeColor = ARCHETYPE_COLORS[s.archetype];

              return (
                <div key={s.studentId} style={{
                  padding: "18px 20px", borderRadius: 12,
                  background: s.priority === "urgent" ? "rgba(239,68,68,0.05)" : C.surface,
                  border: `1px solid ${s.priority === "urgent" ? "rgba(239,68,68,0.25)" : C.border}`,
                  display: "flex", gap: 16, alignItems: "flex-start",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                    background: `${archetypeColor}22`, border: `2px solid ${archetypeColor}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: archetypeColor,
                  }}>
                    {s.displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{s.displayName}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${archetypeColor}22`, color: archetypeColor, border: `1px solid ${archetypeColor}44` }}>
                        {ARCHETYPE_LABELS[s.archetype]}
                      </span>
                      <span style={{ fontSize: 11, color: C.muted }}>{BAND_LABELS[s.bandCode] ?? s.bandCode}</span>
                      {s.priority === "urgent" && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(239,68,68,0.15)", color: C.urgent, border: "1px solid rgba(239,68,68,0.3)" }}>
                          ⚡ Urgent
                        </span>
                      )}
                      {s.fatigued && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(245,158,11,0.15)", color: C.amber, border: "1px solid rgba(245,158,11,0.3)" }}>
                          🔄 Skill Fatigue
                        </span>
                      )}
                    </div>

                    {/* Mastery bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: C.muted }}>Focus: <span style={{ color: C.text, fontWeight: 500 }}>{s.focusSkillName}</span></span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: archetypeColor }}>{s.masteryScore}%</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3,
                          width: `${Math.max(4, s.masteryScore)}%`,
                          background: s.masteryScore < 40 ? C.urgent : s.masteryScore < 65 ? C.amber : archetypeColor,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>

                    {/* AI Note */}
                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(155,114,255,0.06)", border: "1px solid rgba(155,114,255,0.12)", fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 8 }}>
                      <span style={{ color: C.violet, marginRight: 6 }}>🤖</span>{s.aiNote}
                    </div>

                    {/* Variety skill card (shown when student is fatigued) */}
                    {s.fatigued && s.varietySkillName && (
                      <div style={{
                        padding: "10px 14px", borderRadius: 8, marginBottom: 8,
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)",
                        display: "flex", gap: 10, alignItems: "flex-start",
                      }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>🔀</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 3 }}>
                            Mix in: {s.varietySkillName}
                          </div>
                          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                            {s.varietyReason ?? `Alternating with ${s.varietySkillName} will re-energise focus and often makes the original skill click faster.`}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>{s.reason}</div>

                    {/* Push button */}
                    <div>
                      <button
                        onClick={() => pushSession(s)}
                        disabled={isBusy || isPushed}
                        style={{
                          padding: "7px 16px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 600,
                          cursor: (isBusy || isPushed) ? "default" : "pointer",
                          background: isPushed ? "rgba(34,197,94,0.15)" : isBusy ? "rgba(155,114,255,0.3)" : C.violet,
                          color: isPushed ? C.mint : "#fff",
                          minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        {isPushed ? "✓ Session queued" : isBusy ? "Queuing…" : "Push Session →"}
                      </button>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                        Assigns to their next session
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info footer */}
        <div style={{ marginTop: 32, padding: "14px 18px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>How this works:</strong> The AI coach analyzes each student&apos;s mastery
          across all curriculum skills for their grade band and identifies the single highest-impact skill to
          practice next. Pushing a session queues it as the first activity the next time that student plays.
          When a student has spent many sessions on a skill without breaking through, the coach flags a{" "}
          <span style={{ color: C.amber }}>🔄 Skill Fatigue</span> alert and automatically queues a variety
          skill alongside the main focus — keeping engagement high while reinforcing the original concept from
          a fresh angle. Suggestions refresh automatically as students complete sessions.
        </div>
      </div>
    </AppFrame>
  );
}
