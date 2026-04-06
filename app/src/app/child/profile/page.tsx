"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Session types ────────────────────────────────────────────────────────────

type SessionData = {
  student: {
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    streakCount?: number;
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
  mint: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  surface: "#12103a",
  border: "#2a2060",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bandLabel(launchBandCode: string): string {
  const map: Record<string, string> = {
    K1: "K–1 Band",
    G23: "Gr 2–3 Band",
    G45: "Gr 4–5 Band",
    G67: "Gr 6–7 Band",
  };
  return map[launchBandCode] ?? launchBandCode;
}

function bandShort(launchBandCode: string): string {
  const map: Record<string, string> = {
    K1: "K1",
    G23: "G3",
    G45: "G5",
    G67: "G7",
  };
  return map[launchBandCode] ?? launchBandCode.substring(0, 2);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: SessionData) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => { setSessionError(true); setLoading(false); });
  }, []);

  const displayName = session?.student.displayName ?? "Explorer";
  const avatarKey = session?.student.avatarKey ?? "🦋";
  const launchBandCode = session?.student.launchBandCode ?? "K1";
  const totalPoints = session?.progression.totalPoints ?? 0;
  const currentLevel = session?.progression.currentLevel ?? 1;
  const badgeCount = session?.progression.badgeCount ?? 0;
  const streakCount = session?.student?.streakCount ?? 0;

  // Use avatarKey as emoji if it's short (emoji key), else fall back to 🦋
  const avatarDisplay = avatarKey.length <= 4 ? avatarKey : "🦋";

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`@keyframes card-enter { from { opacity:0; transform:translateY(12px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
      <div style={{ minHeight: "100vh", background: "#0a0820", fontFamily: "'Nunito', system-ui, sans-serif", padding: "24px 16px 60px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 400, width: "100%" }}>

          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 16, fontWeight: 700, fontFamily: "'Nunito', system-ui, sans-serif" }}>
              Loading profile...
            </div>
          )}

          {/* Error state */}
          {!loading && sessionError && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.text, marginBottom: 8 }}>Couldn&apos;t load your profile</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Check your connection and try again.</div>
              <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", background: C.violet, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito', system-ui, sans-serif" }}>Try again</button>
            </div>
          )}

          {/* Profile card */}
          {!loading && !sessionError && (
            <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 20, overflow: "hidden", animation: "card-enter 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              {/* Hero */}
              <div style={{ background: "linear-gradient(135deg, #1e1470, #2a1060)", padding: "20px 20px 16px", position: "relative" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(155,114,255,0.12)" }} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #1a1540, #2a1060)", borderRadius: 18, border: `3px solid ${C.violet}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 0 16px rgba(155,114,255,0.25)" }}>
                      {avatarDisplay}
                    </div>
                    <div style={{ position: "absolute", bottom: -4, right: -4, width: 22, height: 22, borderRadius: 8, background: C.violet, color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #100b2e" }}>{bandShort(launchBandCode)}</div>
                  </div>
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{displayName}</div>
                    <div style={{ display: "inline-block", background: "rgba(155,114,255,0.25)", border: "1px solid #9b72ff", borderRadius: 8, padding: "2px 9px", fontSize: 11, fontWeight: 700, color: "#c4b0ff", marginBottom: 4 }}>{bandLabel(launchBandCode)}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>Level {currentLevel} · Node {currentLevel}</div>
                  </div>
                  <button onClick={() => setEditMode(!editMode)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, fontFamily: "'Nunito', system-ui", padding: "4px 10px", cursor: "pointer", flexShrink: 0 }}>
                    {editMode ? "Save" : "Edit"}
                  </button>
                </div>
                {/* Stats bar */}
                <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 10, overflow: "hidden" }}>
                  {[
                    [`⭐ ${totalPoints}`, "Stars"],
                    [`🔥 ${streakCount}`, "Streak"],
                    [`${currentLevel}`, "Level"],
                    [`${badgeCount}`, "Badges"],
                  ].map(([val, lbl]) => (
                    <div key={lbl} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{val}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worlds progress */}
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>World Progress</div>
                {[
                  { emoji: "🏰", name: "Cosmic Castle", nodes: "7/12", color: C.violet, width: "58%" },
                  { emoji: "🌊", name: "Number Reef", nodes: "3/10", color: C.mint, width: "30%" },
                ].map((w) => (
                  <div key={w.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{w.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: C.text }}>{w.name}</span>
                        <span style={{ fontSize: 10, color: C.muted }}>{w.nodes} nodes</span>
                      </div>
                      <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
                        <div style={{ height: "100%", width: w.width, background: w.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent badges */}
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Badges</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[["🎵", "Rhyme Queen", C.gold], ["📚", "5-Day Streak", C.coral], ["⭐", "Star Explorer", C.violet]].map(([emoji, name, color]) => (
                    <div key={name as string} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 4px" }}>{emoji}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textAlign: "center" }}>{name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings (edit mode) */}
              {editMode && (
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Customise</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Change your explorer:</div>
                  <Link href="/child/avatar" style={{ display: "block", padding: "10px 14px", background: "rgba(155,114,255,0.1)", border: "1px solid rgba(155,114,255,0.3)", borderRadius: 10, fontSize: 13, fontWeight: 700, color: C.violet, textDecoration: "none", textAlign: "center" }}>
                    {avatarDisplay} Change Avatar →
                  </Link>
                </div>
              )}

              {/* CTA row */}
              <div style={{ padding: "14px 16px", display: "flex", gap: 8 }}>
                <Link href="/child/world" style={{ flex: 1, padding: "12px 0", background: `linear-gradient(135deg, ${C.violet}, #7c4ddb)`, color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 900, textAlign: "center", textDecoration: "none" }}>
                  🗺️ World Map
                </Link>
                <Link href="/child/badges" style={{ flex: 1, padding: "12px 0", background: "rgba(255,255,255,0.06)", color: C.muted, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 14, fontWeight: 900, textAlign: "center", textDecoration: "none" }}>
                  🏅 Badges
                </Link>
              </div>
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/child" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>← Home</Link>
            <Link href="/child/streak" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>Streak</Link>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
