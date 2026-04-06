"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Session types ────────────────────────────────────────────────────────────

type SessionData = {
  student: {
    displayName: string;
    launchBandCode: string;
  };
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  surface: "#1a1540",
  border: "#2a2060",
} as const;

type QuestState = "done" | "active" | "locked";
type Quest = { id: string; emoji: string; name: string; meta: string; type: string; state: QuestState; stars: number; note?: string };

type ViewMode = "active" | "fresh" | "complete";

const QUESTS_ACTIVE: Quest[] = [
  { id: "rhyme", emoji: "🔤", name: "Rhyme Time", meta: "5 questions · Listening + Rhyming", type: "Listening", state: "done", stars: 3 },
  { id: "story", emoji: "📚", name: "Story Builder", meta: "8 questions · Reading + Sequencing", type: "Reading", state: "active", stars: 2, note: "▶ In Progress (Q4)" },
  { id: "melody", emoji: "🎵", name: "Melody Match", meta: "6 questions · Phonics + Sounds", type: "Phonics", state: "done", stars: 3 },
  { id: "brain", emoji: "🧠", name: "Brain Blast", meta: "6 questions · Mixed challenge", type: "Mixed", state: "locked", stars: 0, note: "Finish Story Builder first" },
];

const QUESTS_FRESH: Quest[] = [
  { id: "river-words", emoji: "🌊", name: "River Words", meta: "7 questions · Sight words", type: "Reading", state: "active", stars: 0, note: "🆕 New!" },
  { id: "fish-count", emoji: "🐟", name: "Fish Count", meta: "5 questions · Numbers + Counting", type: "Math", state: "locked", stars: 0, note: "Do River Words first" },
  { id: "rapid-fire", emoji: "🚣", name: "Rapid Fire", meta: "10 questions · Mixed challenge", type: "Mixed", state: "locked", stars: 0, note: "Do both quests first" },
];

// ─── Band label helper ────────────────────────────────────────────────────────

function bandLabel(launchBandCode: string): string {
  const map: Record<string, string> = {
    K1: "K–1 Band",
    G23: "Gr 2–3 Band",
    G45: "Gr 4–5 Band",
    G67: "Gr 6–7 Band",
  };
  return map[launchBandCode] ?? launchBandCode;
}

export default function ChildQuestPage() {
  const [view, setView] = useState<ViewMode>("active");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const launchBandCode = session?.student.launchBandCode ?? "K1";
  const currentLevel = session?.progression.currentLevel ?? 1;
  const totalPoints = session?.progression.totalPoints ?? 0;

  const quests = view === "fresh" ? QUESTS_FRESH : QUESTS_ACTIVE;
  const nodeColor = view === "fresh" ? C.mint : C.violet;
  const nodeName = view === "fresh" ? "River Rush" : view === "complete" ? "Aim High ✓" : "Aim High";
  const nodeIcon = view === "fresh" ? "🌊" : "🎯";
  const ctaLabel = view === "complete" ? "🗺️ Go to Next Node!" : view === "fresh" ? "▶ Start River Words!" : "▶ Continue Story Builder";
  const ctaColor = view === "fresh" ? "linear-gradient(135deg, #50e890, #3ab870)" : "linear-gradient(135deg, #9b72ff, #7c4dff)";

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`@keyframes dot-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.5); } 50% { box-shadow: 0 0 0 4px rgba(155,114,255,0); } }`}</style>
      <div style={{ minHeight: "100vh", background: "#0a0820", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px" }}>

        {/* Dev tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 390 }}>
          {(["active", "fresh", "complete"] as ViewMode[]).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "7px 14px", background: view === v ? C.violet : "#1a1540", border: `2px solid ${view === v ? C.violet : C.border}`, borderRadius: 8, color: view === v ? "#fff" : C.muted, fontFamily: "'Nunito', system-ui", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {v === "active" ? "Active Node" : v === "fresh" ? "Fresh Node" : "Node Complete"}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ color: C.muted, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 16, fontWeight: 700, padding: "40px 0" }}>
            Loading quest...
          </div>
        )}

        {/* Phone frame */}
        {!loading && (
          <div style={{ width: 390, background: C.base, borderRadius: 40, border: `2px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px 4px", fontSize: 11, color: C.muted, fontWeight: 700 }}>
              <span>9:41</span><span>{bandLabel(launchBandCode)}</span><span>🔋</span>
            </div>

            {/* Node context */}
            <div style={{ padding: "12px 16px", background: `linear-gradient(135deg, ${view === "fresh" ? "#1a3a20, #0e2010" : "1e1470, #2a1060"})`, borderBottom: `1px solid ${view === "fresh" ? C.mint : C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, background: view === "fresh" ? "#1a3a20" : "#2d1f80", borderRadius: 10, border: `2px solid ${view === "fresh" ? C.mint : C.violet}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {nodeIcon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{nodeName}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
                  {view === "complete" ? "Cosmic Castle · All quests done!" : `Cosmic Castle · Node ${view === "fresh" ? "8 🆕 Just unlocked!" : `${currentLevel}`}`}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>🌟 {view === "complete" ? totalPoints + 3 : totalPoints}</div>
            </div>

            {/* Stars safe */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#1a2a15", border: "1.5px solid #50e890", borderRadius: 16, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.mint, margin: "10px 12px 4px" }}>
              ⭐ Your stars are safe — can always replay!
            </div>

            {/* Node complete banner */}
            {view === "complete" && (
              <div style={{ padding: "12px 16px", background: "linear-gradient(135deg, #1a2a10, #0e2010)", borderBottom: "1px solid #50e890", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.mint, marginBottom: 2 }}>Node Complete!</div>
                <div style={{ fontSize: 12, color: C.muted }}>You earned 9 stars on Aim High</div>
              </div>
            )}

            <div style={{ padding: "8px 16px 4px", fontSize: 10, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
              {view === "complete" ? "All quests finished" : view === "fresh" ? "Brand new quests!" : "Quests on this node"}
            </div>

            {/* Quest list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px 14px" }}>
              {quests.map((q) => {
                const isDone = q.state === "done";
                const isActive = q.state === "active";
                const isLocked = q.state === "locked";
                return (
                  <div
                    key={q.id}
                    style={{
                      background: isDone ? "#0e2010" : isActive ? "#1e1470" : "#1a1540",
                      border: `3px solid ${isDone ? C.mint : isActive ? C.violet : C.border}`,
                      borderRadius: 14, padding: 14,
                      display: "flex", gap: 12,
                      opacity: isLocked ? 0.4 : 1,
                      cursor: isLocked ? "default" : "pointer",
                    }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: isDone ? "#1a3a20" : isActive ? "#2d1f80" : "#12083a" }}>
                        {q.emoji}
                      </div>
                      <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", border: `2px solid ${C.base}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, background: isDone ? C.mint : isActive ? C.violet : C.border, color: "#fff", fontWeight: 900, animation: isActive ? "dot-pulse 2s ease-in-out infinite" : undefined }}>
                        {isDone ? "✓" : isActive ? "▶" : "🔒"}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: isDone ? "#c0e8c0" : C.text, marginBottom: 2 }}>{q.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{view === "complete" ? "Tap to replay — stars are safe!" : q.meta}</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 8, fontSize: 9, fontWeight: 700, background: "#12083a", color: C.muted }}>{q.type}</span>
                        {q.note && (
                          <span style={{ padding: "2px 8px", borderRadius: 8, fontSize: 9, fontWeight: 700, background: isDone ? "#1a3a20" : isActive ? "#2d1f80" : "#1a1000", color: isDone ? C.mint : isActive ? "#c4b0ff" : C.gold }}>
                            {q.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: isDone ? C.gold : isActive ? C.muted : "#555", fontWeight: 700, flexShrink: 0, alignSelf: "center" }}>
                      {isDone ? "⭐⭐⭐" : isActive ? "⭐⭐☆" : "⭐⭐⭐"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.surface}`, background: view === "fresh" ? "#0e2010" : "#12103a" }}>
              <button style={{ width: "100%", background: ctaColor, border: "none", borderRadius: 12, color: view === "fresh" ? "#0a1a0a" : "#fff", fontFamily: "'Nunito', system-ui", fontSize: 15, fontWeight: 900, padding: 13, cursor: "pointer" }}>
                {ctaLabel}
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Link href="/child" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>← Home</Link>
          <Link href="/child/world" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>World Map</Link>
        </div>
      </div>
    </AppFrame>
  );
}
