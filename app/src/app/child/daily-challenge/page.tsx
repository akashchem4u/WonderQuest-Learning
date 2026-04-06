"use client";

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

// ─── Theme / band maps ────────────────────────────────────────────────────────

const THEMES: Record<string, { mascot: string; questName: string; headerBg: string }> = {
  space:    { mascot: "🚀", questName: "The Star Chart Mystery",  headerBg: "linear-gradient(135deg,#0d0d2b 0%,#1a1060 50%,#2d0b6b 100%)" },
  animals:  { mascot: "🦁", questName: "Wild Kingdom Scramble",   headerBg: "linear-gradient(135deg,#0f3d1e 0%,#1a5c2e 50%,#0d3321 100%)" },
  sports:   { mascot: "⚽", questName: "Championship Kick-Off",   headerBg: "linear-gradient(135deg,#2b0d0d 0%,#5c1a1a 50%,#7a2020 100%)" },
  arts:     { mascot: "🎨", questName: "Colour Theory Spectacular", headerBg: "linear-gradient(135deg,#2b0d2b 0%,#5c1a5c 50%,#6b1060 100%)" },
  ocean:    { mascot: "🌊", questName: "Deep Sea Discovery",       headerBg: "linear-gradient(135deg,#0d1e3d 0%,#1a3060 50%,#0d2244 100%)" },
  building: { mascot: "🏗️", questName: "Tower Design Blitz",      headerBg: "linear-gradient(135deg,#2b1a0d 0%,#5c3d1a 50%,#7a4a14 100%)" },
};

const BANDS: Record<string, { label: string; chipColor: string; chipBorder: string; chipBg: string; bandLabel: string }> = {
  K1:  { label: "K–1 Early",    chipColor: "#ffd166", chipBorder: "rgba(255,209,102,0.4)", chipBg: "rgba(255,209,102,0.1)", bandLabel: "K–1 · Early Learner" },
  G23: { label: "Gr 2–3",       chipColor: "#9b72ff", chipBorder: "rgba(155,114,255,0.4)", chipBg: "rgba(155,114,255,0.1)", bandLabel: "Gr 2–3 · Growing" },
  G45: { label: "Gr 4–5",       chipColor: "#58e8c1", chipBorder: "rgba(88,232,193,0.4)",  chipBg: "rgba(88,232,193,0.1)",  bandLabel: "Gr 4–5 · Fluent" },
  G67: { label: "Gr 6–7",       chipColor: "#ff7b6b", chipBorder: "rgba(255,123,107,0.4)", chipBg: "rgba(255,123,107,0.1)", bandLabel: "Gr 6–7 · Advanced" },
  // legacy p-codes fallback
  p0:  { label: "P0 Early",     chipColor: "#ffd166", chipBorder: "rgba(255,209,102,0.4)", chipBg: "rgba(255,209,102,0.1)", bandLabel: "P0 · Early Learner" },
  p1:  { label: "P1 Growing",   chipColor: "#9b72ff", chipBorder: "rgba(155,114,255,0.4)", chipBg: "rgba(155,114,255,0.1)", bandLabel: "P1 · Growing" },
  p2:  { label: "P2 Fluent",    chipColor: "#58e8c1", chipBorder: "rgba(88,232,193,0.4)",  chipBg: "rgba(88,232,193,0.1)",  bandLabel: "P2 · Fluent" },
  p3:  { label: "P3 Advanced",  chipColor: "#ff7b6b", chipBorder: "rgba(255,123,107,0.4)", chipBg: "rgba(255,123,107,0.1)", bandLabel: "P3 · Advanced" },
};

function resolveBand(launchBandCode: string) {
  return BANDS[launchBandCode] ?? BANDS.K1;
}

export default function DailyChallengePage() {
  const [activeTab, setActiveTab] = useState<"card" | "states">("card");
  const [activeTheme, setActiveTheme] = useState("space");
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

  const theme = THEMES[activeTheme] ?? THEMES.space;
  const band = resolveBand(launchBandCode);

  const bg     = "#0d1117";
  const card   = "#161b22";
  const border = "rgba(255,255,255,0.06)";
  const text   = "#f0f6ff";
  const muted  = "#8b949e";
  const accent = "#50e890";

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const tabBtn = (tab: "card" | "states"): React.CSSProperties => ({
    background: "none", border: "none",
    borderBottom: activeTab === tab ? `3px solid ${accent}` : "3px solid transparent",
    color: activeTab === tab ? accent : muted,
    cursor: "pointer", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 600,
    minHeight: 44, padding: "10px 16px", transition: "color .2s, border-color .2s",
  });

  const pillBtn = (active: boolean, accentColor?: string): React.CSSProperties => ({
    background: active ? `rgba(${accentColor ? "" : "80,232,144,"}0.12)` : "rgba(255,255,255,0.05)",
    border: active ? `1.5px solid ${accentColor ?? accent}` : `1.5px solid ${border}`,
    borderRadius: 20, color: active ? (accentColor ?? accent) : muted,
    cursor: "pointer", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 13, fontWeight: 600,
    minHeight: 36, padding: "6px 14px", transition: "all .18s",
  });

  return (
    <AppFrame audience="kid">
      <div style={{ background: bg, color: text, fontFamily: "'Nunito', system-ui, sans-serif", minHeight: "100vh", paddingBottom: 48 }}>

        {/* Page header */}
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "20px 24px 0", borderRadius: "12px 12px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>WonderQuest</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: text, marginBottom: 16 }}>Child Daily Challenge Launcher</div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, maxWidth: 900, margin: "0 auto", background: card, padding: "0 24px", borderBottom: `1px solid ${border}` }}>
            <button onClick={() => setActiveTab("card")}   style={tabBtn("card")}>Daily Challenge Card</button>
            <button onClick={() => setActiveTab("states")} style={tabBtn("states")}>States</button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: muted, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 16, fontWeight: 700 }}>
            Loading challenge...
          </div>
        )}

        {/* ── TAB 1: Card ── */}
        {!loading && activeTab === "card" && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
            {/* Controls */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Theme</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.keys(THEMES).map((t) => (
                    <button key={t} onClick={() => setActiveTheme(t)} style={pillBtn(activeTheme === t)}>
                      {THEMES[t].mascot} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Band (from session: {launchBandCode} · Level {currentLevel})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.keys(BANDS).filter((b) => !b.startsWith("p")).map((b) => (
                    <button key={b} onClick={() => {}} style={pillBtn(launchBandCode === b, BANDS[b].chipColor)}>
                      {BANDS[b].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Challenge Card */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, maxWidth: 420, width: "100%", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>

                {/* Header */}
                <div style={{ padding: "28px 24px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: theme.headerBg }}>
                  <div style={{ background: "linear-gradient(90deg,#c9a000,#ffd166)", borderRadius: 20, color: "#1a1000", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", padding: "4px 12px", textTransform: "uppercase" }}>
                    Today's Challenge ⚡
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "0.03em" }}>{today}</div>
                  <span style={{ fontSize: 64, lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}>{theme.mascot}</span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>{theme.questName}</div>
                </div>

                {/* Body */}
                <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, color: text, fontSize: 12, fontWeight: 700, padding: "5px 12px" }}>📐 Math</span>
                    <span style={{ background: band.chipBg, border: `1.5px solid ${band.chipBorder}`, borderRadius: 20, color: band.chipColor, fontSize: 12, fontWeight: 700, padding: "5px 12px" }}>{band.bandLabel}</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span style={{ background: "rgba(80,232,144,0.12)", border: "1.5px solid rgba(80,232,144,0.3)", borderRadius: 20, color: accent, fontSize: 13, fontWeight: 700, padding: "6px 14px" }}>+20 Bonus Star Dust! ✨</span>
                  </div>

                  <button style={{ background: accent, border: "none", borderRadius: 14, color: "#051a0a", cursor: "pointer", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 17, fontWeight: 800, minHeight: 52, padding: "12px 24px", width: "100%" }}>
                    Accept Challenge! 🚀
                  </button>

                  <button style={{ background: "none", border: "none", color: muted, cursor: "pointer", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 500, minHeight: 44, padding: 8, textAlign: "center", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    Explore freely instead →
                  </button>

                  <div style={{ color: muted, fontSize: 12, textAlign: "center" }}>New challenge tomorrow ✨</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: States ── */}
        {!loading && activeTab === "states" && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Challenge States</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>

              {/* Available */}
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 10, background: bg, borderBottom: `1px solid ${border}` }}>
                  <div style={{ borderRadius: "50%", height: 8, width: 8, background: accent, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>Available — Not Yet Started</div>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: text }}>Today's challenge is waiting! 🌟</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>Status: available — Default state shown at the start of each day. No pressure to accept.</div>
                  <button style={{ background: accent, border: "none", borderRadius: 12, color: "#051a0a", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 15, fontWeight: 800, minHeight: 48, padding: "10px 20px", width: "100%", cursor: "pointer" }}>Accept Challenge! 🚀</button>
                  <button style={{ background: "none", border: "none", color: muted, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 500, minHeight: 44, padding: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>Explore freely instead →</button>
                </div>
              </div>

              {/* In Progress */}
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 10, background: bg, borderBottom: `1px solid ${border}` }}>
                  <div style={{ borderRadius: "50%", height: 8, width: 8, background: "#ffd166", flexShrink: 0 }} />
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffd166" }}>In Progress</div>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: text }}>You're on today's challenge! 🔥<br />Keep going, {session?.student.displayName ?? "Explorer"}!</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>Status: started — Child accepted and has begun the quest. CTA routes back into the active quest session.</div>
                  <style>{`@keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(255,209,102,0.5)} 70%{box-shadow:0 0 0 10px rgba(255,209,102,0)} 100%{box-shadow:0 0 0 0 rgba(255,209,102,0)} }`}</style>
                  <div style={{ animation: "pulse-ring 2s ease infinite", background: "rgba(255,209,102,0.1)", border: "2px solid #ffd166", borderRadius: 12, color: "#ffd166", fontSize: 13, fontWeight: 700, padding: "10px 14px", textAlign: "center" }}>🔥 Quest in progress — tap to continue!</div>
                </div>
              </div>

              {/* Completed */}
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 10, background: bg, borderBottom: `1px solid ${border}` }}>
                  <div style={{ borderRadius: "50%", height: 8, width: 8, background: "#58e8c1", flexShrink: 0 }} />
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#58e8c1" }}>Completed</div>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: text }}>CHALLENGE COMPLETE! 🏆<br />{session?.student.displayName ?? "Explorer"} crushed it today!</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>Status: completed — XP awarded on completion. No accuracy % shown. Celebratory framing only.</div>
                  <div style={{ background: "rgba(88,232,193,0.12)", border: "1.5px solid rgba(88,232,193,0.35)", borderRadius: 10, color: "#58e8c1", fontSize: 15, fontWeight: 800, padding: "10px 16px", textAlign: "center" }}>+20 Bonus Star Dust earned! ✨</div>
                  <div style={{ color: text, fontSize: 13, fontWeight: 600, textAlign: "center" }}>See you tomorrow! 🌟</div>
                </div>
              </div>

              {/* Skipped */}
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 10, background: bg, borderBottom: `1px solid ${border}` }}>
                  <div style={{ borderRadius: "50%", height: 8, width: 8, background: muted, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: muted }}>Skipped / Expired</div>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: text }}>New challenge unlocks at midnight! 🌙</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>Status: skipped or day boundary passed — Zero negative language. No shame. No penalty.</div>
                  <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, borderRadius: 12, color: muted, fontSize: 14, fontWeight: 600, minHeight: 48, padding: "10px 20px", textAlign: "center" }}>See you tomorrow ✨</div>
                  <div style={{ color: muted, fontSize: 12, textAlign: "center" }}>Challenges reset every day — a fresh start is always coming!</div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 10, background: bg, borderBottom: `1px solid ${border}` }}>
                  <div style={{ borderRadius: "50%", height: 8, width: 8, background: "#9b72ff", flexShrink: 0 }} />
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9b72ff" }}>Quiet Hours (before 7 am)</div>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: text }}>Good morning! 🌅</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>CTA suppressed between midnight reset and 7 am local time. Challenge card visible but accept button is hidden to encourage healthy sleep habits.</div>
                  <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, borderRadius: 12, color: muted, fontSize: 14, fontWeight: 600, minHeight: 48, padding: "10px 20px", textAlign: "center" }}>Available after 7 am 🌅</div>
                  <div style={{ color: muted, fontSize: 12, textAlign: "center" }}>Your challenge is ready and waiting — no rush!</div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
