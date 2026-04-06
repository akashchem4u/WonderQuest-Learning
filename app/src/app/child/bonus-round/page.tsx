"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const THEMES: Record<string, { mascot: string; questName: string; bonusIcon: string; bonusName: string; accentBg: string; accentColor: string; heroGlow: string }> = {
  space:    { mascot: "🚀", questName: "The Solar System!", bonusIcon: "🛸", bonusName: "Alien Math Challenge", accentBg: "#9b72ff", accentColor: "#fff", heroGlow: "rgba(155,114,255,0.18)" },
  animals:  { mascot: "🦁", questName: "Safari Adventure!", bonusIcon: "🦒", bonusName: "Animal Word Puzzle",  accentBg: "#50e890", accentColor: "#0d1117", heroGlow: "rgba(80,232,144,0.14)" },
  sports:   { mascot: "⚽", questName: "World Cup Quest!",  bonusIcon: "🏅", bonusName: "Sports Stats Blitz",  accentBg: "#ffd166", accentColor: "#1a1400", heroGlow: "rgba(255,209,102,0.14)" },
  arts:     { mascot: "🎨", questName: "Colour Theory!",    bonusIcon: "🖌️", bonusName: "Art History Remix",   accentBg: "#ff7b6b", accentColor: "#fff",    heroGlow: "rgba(255,123,107,0.14)" },
  ocean:    { mascot: "🌊", questName: "Deep Sea Dive!",    bonusIcon: "🐠", bonusName: "Coral Reef Trivia",   accentBg: "#58e8c1", accentColor: "#0d1117", heroGlow: "rgba(88,232,193,0.14)" },
  building: { mascot: "🏗️", questName: "Master Builder!",  bonusIcon: "🧱", bonusName: "Geometry Challenge",  accentBg: "#ffd166", accentColor: "#1a1400", heroGlow: "rgba(255,209,102,0.12)" },
};

const BAND_XP: Record<string, { xpLabel: string; xpChipBg: string; xpChipBorder: string; xpChipColor: string }> = {
  p0: { xpLabel: "✨ +12 Star Dust", xpChipBg: "rgba(255,209,102,0.12)", xpChipBorder: "rgba(255,209,102,0.3)", xpChipColor: "#ffd166" },
  p1: { xpLabel: "✨ +15 Star Dust", xpChipBg: "rgba(155,114,255,0.12)", xpChipBorder: "rgba(155,114,255,0.3)", xpChipColor: "#9b72ff" },
  p2: { xpLabel: "✨ +18 Star Dust", xpChipBg: "rgba(88,232,193,0.12)",  xpChipBorder: "rgba(88,232,193,0.3)",  xpChipColor: "#58e8c1" },
  p3: { xpLabel: "✨ +20 Star Dust", xpChipBg: "rgba(255,123,107,0.12)", xpChipBorder: "rgba(255,123,107,0.3)", xpChipColor: "#ff7b6b" },
};

const STATES = [
  { key: "standard",       label: "Standard — Bonus Available" },
  { key: "no-bonus",       label: "No Bonus Available" },
  { key: "double-complete",label: "Bonus Completed — Double Complete!" },
  { key: "quiet-hours",    label: "Parent Quiet Hours — Bonus Suppressed" },
];

export default function BonusRoundPage() {
  const [activeTab, setActiveTab] = useState<"launcher" | "states">("launcher");
  const [activeTheme, setActiveTheme] = useState("space");
  const [activeBand, setActiveBand] = useState("p0");

  const theme = THEMES[activeTheme] ?? THEMES.space;
  const band  = BAND_XP[activeBand]  ?? BAND_XP.p0;

  const base    = "#0a0a12";
  const card    = "#161b22";
  const border  = "rgba(255,255,255,0.06)";
  const text    = "#f0f6ff";
  const muted   = "#8b949e";
  const accent  = "#50e890";

  const pillActive: React.CSSProperties = { background: accent, borderColor: accent, color: "#0d1117" };
  const pillBase: React.CSSProperties   = { background: card, border: `1px solid ${border}`, color: text, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 100, cursor: "pointer", minHeight: 32 };

  return (
    <AppFrame audience="kid">
      <div style={{ fontFamily: "'Nunito', system-ui, sans-serif", background: base, color: text, minHeight: "100vh" }}>

        {/* Tab Nav */}
        <nav style={{ display: "flex", gap: 0, borderBottom: `1px solid ${border}`, background: card, padding: "0 24px" }}>
          {(["launcher", "states"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none", border: "none", color: activeTab === tab ? accent : muted,
                fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
                padding: "14px 20px", borderBottom: activeTab === tab ? `3px solid ${accent}` : "3px solid transparent",
                letterSpacing: "0.02em", minHeight: 44, textTransform: "capitalize",
              }}
            >
              {tab === "launcher" ? "Launcher" : "States"}
            </button>
          ))}
        </nav>

        {/* ── TAB 1: LAUNCHER ── */}
        {activeTab === "launcher" && (
          <>
            {/* Controls Bar */}
            <div style={{ background: "#1a2030", borderBottom: `1px solid ${border}`, padding: "16px 24px", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 8 }}>Theme</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Object.keys(THEMES).map((t) => (
                    <button key={t} onClick={() => setActiveTheme(t)} style={{ ...pillBase, ...(activeTheme === t ? pillActive : {}) }}>
                      {THEMES[t].mascot} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 8 }}>Band</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["p0","p1","p2","p3"] as const).map((b) => (
                    <button key={b} onClick={() => setActiveBand(b)} style={{ ...pillBase, ...(activeBand === b ? { background: BAND_XP[b].xpChipColor, borderColor: BAND_XP[b].xpChipColor, color: b === "p0" || b === "p2" ? "#0d1117" : "#fff" } : {}) }}>
                      {b.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launcher Preview */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 24px", minHeight: 600 }}>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 28, width: "100%", maxWidth: 420, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>

                {/* Celebration Hero */}
                <div style={{ position: "relative", textAlign: "center", padding: "36px 24px 24px", background: `radial-gradient(ellipse at 50% 0%, ${theme.heroGlow} 0%, transparent 70%)` }}>
                  <style>{`@keyframes mascot-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
                  <span style={{ fontSize: 80, lineHeight: 1, marginBottom: 12, display: "block", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))", animation: "mascot-bounce 1.4s ease-in-out infinite" }}>
                    {theme.mascot}
                  </span>
                  <h1 style={{ fontSize: 22, fontWeight: 900, color: text, lineHeight: 1.25, margin: 0, marginBottom: 10 }}>
                    You finished <span style={{ color: theme.accentBg, display: "block" }}>{theme.questName}</span> 🎉
                  </h1>
                  <div style={{ marginTop: 12 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: band.xpChipBg, border: `1px solid ${band.xpChipBorder}`, borderRadius: 100, padding: "6px 16px", fontSize: 14, fontWeight: 700, color: band.xpChipColor }}>
                      {band.xpLabel}
                    </span>
                  </div>
                </div>

                <div style={{ height: 1, background: border, margin: "0 24px" }} />

                {/* Bonus Section */}
                <div style={{ padding: 24 }}>
                  <style>{`@keyframes badge-glow { 0%,100%{box-shadow:0 0 0 0 rgba(80,232,144,0)} 50%{box-shadow:0 0 16px 2px rgba(80,232,144,0.2)} }`}</style>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `linear-gradient(135deg, rgba(80,232,144,0.18), rgba(80,232,144,0.06))`, border: "1.5px solid rgba(80,232,144,0.4)", borderRadius: 12, padding: "8px 14px", fontSize: 13, fontWeight: 800, color: accent, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 18, animation: "badge-glow 2s ease-in-out infinite" }}>
                    🌟 Bonus Round Unlocked!
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                    <span style={{ fontSize: 42, lineHeight: 1, flexShrink: 0, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}>{theme.bonusIcon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: text, marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{theme.bonusName}</div>
                      <span style={{ display: "inline-block", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.04em", textTransform: "uppercase" }}>Math</span>
                    </div>
                  </div>

                  <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", minHeight: 56, background: theme.accentBg, color: theme.accentColor, border: "none", borderRadius: 16, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 18, fontWeight: 900, cursor: "pointer", marginBottom: 12, letterSpacing: "0.01em" }}>
                    Start Bonus Round! 🚀
                  </button>
                  <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 44, background: "none", border: "none", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 15, fontWeight: 600, color: muted, cursor: "pointer", letterSpacing: "0.01em" }}>
                    Maybe later →
                  </button>
                </div>

                <p style={{ textAlign: "center", fontSize: 11, color: muted, padding: "0 24px 20px", lineHeight: 1.5 }}>
                  No rush — bonus rounds are always here when you're ready!
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── TAB 2: STATES ── */}
        {activeTab === "states" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 32, padding: "40px 32px", maxWidth: 1200, margin: "0 auto" }}>

            {/* Standard */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, paddingLeft: 4 }}>Standard — Bonus Available</div>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                <div style={{ padding: "28px 22px 20px", textAlign: "center", borderBottom: `1px solid ${border}`, background: "radial-gradient(ellipse at 50% 0%, rgba(80,232,144,0.12) 0%, transparent 70%)" }}>
                  <span style={{ fontSize: 56, lineHeight: 1, display: "block", marginBottom: 10 }}>🚀</span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: text, lineHeight: 1.3, marginBottom: 6 }}>You finished The Solar System! 🎉</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(80,232,144,0.12)", border: "1px solid rgba(80,232,144,0.3)", borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: accent }}>✨ +12 Star Dust</span>
                  </div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, rgba(80,232,144,0.18), rgba(80,232,144,0.06))", border: "1.5px solid rgba(80,232,144,0.4)", borderRadius: 12, padding: "8px 14px", fontSize: 11, fontWeight: 800, color: accent, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 14 }}>🌟 Bonus Round Unlocked!</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${border}`, borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>🛸</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: text }}>Alien Math Challenge</div>
                      <div style={{ fontSize: 11, color: muted }}>Math</div>
                    </div>
                  </div>
                  <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, background: accent, color: "#0d1117", border: "none", borderRadius: 12, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>Start Bonus Round! 🚀</button>
                  <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 44, background: "none", border: `1px solid ${border}`, borderRadius: 12, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: muted, cursor: "pointer" }}>Maybe later →</button>
                </div>
              </div>
            </div>

            {/* No Bonus */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, paddingLeft: 4 }}>No Bonus Available</div>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                <div style={{ padding: "28px 22px 20px", textAlign: "center", borderBottom: `1px solid ${border}`, background: "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.10) 0%, transparent 70%)" }}>
                  <span style={{ fontSize: 56, lineHeight: 1, display: "block", marginBottom: 10 }}>🌟</span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: text, lineHeight: 1.3, marginBottom: 6 }}>Amazing quest, Emma!</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>You're doing incredible things. See you next time!</div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, background: "#9b72ff", color: "#fff", border: "none", borderRadius: 12, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Back to Home 🏠</button>
                </div>
              </div>
            </div>

            {/* Double Complete */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, paddingLeft: 4 }}>Bonus Completed — Double Complete!</div>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                <div style={{ padding: "28px 22px 20px", textAlign: "center", borderBottom: `1px solid ${border}`, background: "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.14) 0%, transparent 70%)" }}>
                  <span style={{ fontSize: 56, lineHeight: 1, display: "block", marginBottom: 10 }}>🏆</span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: text, lineHeight: 1.3, marginBottom: 6 }}>DOUBLE COMPLETE! 🏆</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.5, marginBottom: 10 }}>You're unstoppable, Emma! Two quests in a row!</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,209,102,0.12)", border: "1px solid rgba(255,209,102,0.3)", borderRadius: 100, padding: "6px 16px", fontSize: 11, fontWeight: 700, color: "#ffd166" }}>✨ +12 Star Dust</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,209,102,0.12)", border: "1px solid rgba(255,209,102,0.3)", borderRadius: 100, padding: "6px 16px", fontSize: 11, fontWeight: 700, color: "#ffd166" }}>🌟 +8 Bonus Star Dust</span>
                  </div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, background: "#ffd166", color: "#1a1400", border: "none", borderRadius: 12, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>Back to Home 🏠</button>
                  <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 44, background: "none", border: `1px solid ${border}`, borderRadius: 12, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: muted, cursor: "pointer" }}>See all my stars ✨</button>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, paddingLeft: 4 }}>Parent Quiet Hours — Bonus Suppressed</div>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                <div style={{ padding: "28px 22px 20px", textAlign: "center", borderBottom: `1px solid ${border}`, background: "linear-gradient(160deg, #0d1a2f 0%, #161b22 100%)" }}>
                  <span style={{ fontSize: 56, lineHeight: 1, display: "block", marginBottom: 10 }}>🌙</span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: text, lineHeight: 1.3, marginBottom: 6 }}>Shhh… it's quiet time 🌙</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>Great quest today, Emma! Bonus rounds open back up tomorrow.</div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, background: "#58e8c1", color: "#0d1117", border: "none", borderRadius: 12, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 12 }}>Back to Home 🏠</button>
                  <p style={{ textAlign: "center", fontSize: 11, color: muted, lineHeight: 1.5 }}>Quiet hours are set by your grown-up. Keep up the amazing work!</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </AppFrame>
  );
}
