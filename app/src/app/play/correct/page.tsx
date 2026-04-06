"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#58e8c1",
  coral: "#ff7b6b",
  text: "#f0eaff",
  muted: "#8b7fb8",
  correct: "#50e890",
  correctBg: "#0d2a1a",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

// ─── Band definitions ─────────────────────────────────────────────────────────
type Band = "prek" | "k1" | "g23" | "g45";

const BANDS: Record<Band, {
  label: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  topBarBg: string;
  topBarBorder: string;
  questName: string;
  stars: number;
  coachMsg: React.ReactNode;
  ctaLabel: string;
  ctaBg: string;
  ctaColor: string;
  answers: { label: string; sublabel?: string; emoji?: string; correct: boolean }[];
  evidenceBlock?: string;
}> = {
  prek: {
    label: "Pre-K Gold",
    accent: C.gold,
    accentBg: "rgba(255,209,102,0.2)",
    accentBorder: "rgba(255,209,102,0.4)",
    accentText: C.gold,
    topBarBg: "linear-gradient(135deg, #2a1800, #1a0c00)",
    topBarBorder: "transparent",
    questName: "Counting Quest",
    stars: 5,
    coachMsg: (
      <>
        <span style={{ color: C.gold, fontWeight: 900 }}>✨ Yes! 5 stars!</span>
        <br />
        You counted them all — 1, 2, 3, 4, 5! Amazing counting!
      </>
    ),
    ctaLabel: "Next Question ✨",
    ctaBg: "linear-gradient(135deg, #ffd166, #f0a000)",
    ctaColor: "#1a0c00",
    answers: [
      { emoji: "4️⃣", label: "4", correct: false },
      { emoji: "5️⃣", label: "5", correct: true },
      { emoji: "6️⃣", label: "6", correct: false },
      { emoji: "7️⃣", label: "7", correct: false },
    ],
  },
  k1: {
    label: "K-1 Violet",
    accent: C.violet,
    accentBg: "rgba(155,114,255,0.15)",
    accentBorder: "rgba(155,114,255,0.3)",
    accentText: C.violet,
    topBarBg: C.card,
    topBarBorder: "#2a2050",
    questName: "Phonics Quest",
    stars: 9,
    coachMsg: (
      <>
        <span style={{ color: C.correct, fontWeight: 900 }}>✨ Buh-buh-bee! B is right!</span>
        <br />
        Bee starts with the B sound — you heard it perfectly!
      </>
    ),
    ctaLabel: "Next Sound ✨",
    ctaBg: "linear-gradient(135deg, #9b72ff, #7248e8)",
    ctaColor: "white",
    answers: [
      { label: "S", sublabel: "sss", correct: false },
      { label: "B", sublabel: "buh ✓", correct: true },
      { label: "D", sublabel: "duh", correct: false },
      { label: "R", sublabel: "rrr", correct: false },
    ],
  },
  g23: {
    label: "G2-3 Mint",
    accent: C.mint,
    accentBg: "rgba(88,232,193,0.1)",
    accentBorder: "rgba(88,232,193,0.3)",
    accentText: C.mint,
    topBarBg: C.card,
    topBarBorder: "#1a3030",
    questName: "Reading Quest",
    stars: 27,
    coachMsg: (
      <>
        <span style={{ color: C.correct, fontWeight: 900 }}>✨ You found it in the passage!</span>
        <br />
        "She decided to stay inside…" — great detective reading!
      </>
    ),
    ctaLabel: "Next Passage ✨",
    ctaBg: "linear-gradient(135deg, #58e8c1, #30b090)",
    ctaColor: "#0a2a22",
    answers: [
      { label: "She went to the park with her dog.", correct: false },
      { label: "She stayed inside and read a book. ✓", correct: true },
      { label: "She called a friend on the phone.", correct: false },
      { label: "She went back to sleep.", correct: false },
    ],
  },
  g45: {
    label: "G4-5 Coral",
    accent: C.coral,
    accentBg: "rgba(255,123,107,0.1)",
    accentBorder: "rgba(255,123,107,0.3)",
    accentText: C.coral,
    topBarBg: C.card,
    topBarBorder: "#2a1818",
    questName: "Reading Quest",
    stars: 42,
    coachMsg: (
      <>
        <span style={{ color: C.correct, fontWeight: 900 }}>✨ You read between the lines!</span>
        <br />
        "Slow walk, eyes down, not eating" — all clues pointing to disappointment.
      </>
    ),
    ctaLabel: "Next Passage ✨",
    ctaBg: "linear-gradient(135deg, #ff7b6b, #d04a38)",
    ctaColor: "white",
    evidenceBlock: `"Walked slowly," "kept her eyes down," and "pushed her food around" are all clues that show Dani was upset.`,
    answers: [
      { label: "She was bored and wanted to go home.", correct: false },
      { label: "She was excited to tell her parents.", correct: false },
      { label: "She was upset or disappointed. ✓", correct: true },
      { label: "She was confused about the results.", correct: false },
    ],
  },
};

const BAND_ORDER: Band[] = ["prek", "k1", "g23", "g45"];

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressStrip({ accent }: { accent: string }) {
  return (
    <div style={{ display: "flex", gap: 3, padding: "10px 16px 10px" }}>
      {[true, true, true, true, false].map((done, i) => (
        <div key={i} style={{
          flex: 1, height: 6, borderRadius: 3,
          background: done ? accent : `${accent}33`,
        }} />
      ))}
    </div>
  );
}

function AnswerGrid({ band, answers }: { band: Band; answers: typeof BANDS["prek"]["answers"] }) {
  const isLetterBand = band === "k1";
  const isListBand = band === "g23" || band === "g45";

  if (isListBand) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {answers.map((a, i) => (
          <div key={i} style={{
            background: a.correct ? C.correctBg : C.card2,
            border: `3px solid ${a.correct ? C.correct : "#3a3060"}`,
            borderRadius: 14, display: "flex", flexDirection: "row",
            alignItems: "center", justifyContent: "flex-start",
            padding: "12px 14px", minHeight: 56, position: "relative",
            opacity: a.correct ? 1 : 0.35,
          }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: a.correct ? C.correct : C.text, lineHeight: 1.4 }}>
              {a.label}
            </span>
            {a.correct && (
              <span style={{ position: "absolute", top: 5, right: 6, fontSize: "0.8rem", fontWeight: 900, color: C.correct }}>✓</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {answers.map((a, i) => (
        <div key={i} style={{
          background: a.correct ? C.correctBg : C.card2,
          border: `3px solid ${a.correct ? C.correct : "#3a3060"}`,
          borderRadius: 14, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "14px 10px", gap: 6, minHeight: 90, position: "relative",
          opacity: a.correct ? 1 : 0.35,
        }}>
          {isLetterBand ? (
            <>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, color: a.correct ? C.correct : C.text }}>{a.label}</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: a.correct ? C.correct : C.muted }}>{a.sublabel}</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "2rem" }}>{a.emoji}</span>
              <span style={{ fontSize: "0.84rem", fontWeight: 700, color: a.correct ? C.correct : C.text }}>{a.label}</span>
            </>
          )}
          {a.correct && (
            <span style={{ position: "absolute", top: 5, right: 6, fontSize: "0.8rem", fontWeight: 900, color: C.correct }}>✓</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlayCorrectPage() {
  const [activeBand, setActiveBand] = useState<Band>("prek");
  const band = BANDS[activeBand];

  const isGold = activeBand === "prek";
  const starBg = isGold ? "rgba(255,209,102,0.2)" : band.accentBg;
  const starBorder = isGold ? "rgba(255,209,102,0.4)" : band.accentBorder;

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <style>{`
          @keyframes star-bump { 0%{transform:scale(1);}50%{transform:scale(1.3);}100%{transform:scale(1);} }
          @keyframes obj-pop { 0%{opacity:0;transform:scale(0.5);}100%{opacity:1;transform:scale(1);} }
          @keyframes burst-expand { 0%{transform:scale(0.5);opacity:0.8;}100%{transform:scale(1.5);opacity:0;} }
          @keyframes trophy-bob { 0%{transform:translateY(0) scale(1);}100%{transform:translateY(-8px) scale(1.05);} }
        `}</style>

        {/* Band tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
          {BAND_ORDER.map((b) => (
            <button key={b} onClick={() => setActiveBand(b)} style={{
              padding: "8px 16px", borderRadius: 20,
              border: `2px solid ${activeBand === b ? C.correct : "#3a3060"}`,
              background: activeBand === b ? C.correct : C.card,
              color: activeBand === b ? "#0a2a10" : C.muted,
              ...FONT, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
            }}>
              {BANDS[b].label}
            </button>
          ))}
        </div>

        {/* Phone frame */}
        <div style={{
          width: 390, minHeight: 720, background: C.bg,
          borderRadius: 40, border: `2px solid #3a3060`,
          boxShadow: `0 0 0 2px ${band.accent}22, 0 30px 80px rgba(0,0,0,0.7)`,
          overflow: "hidden", display: "flex", flexDirection: "column", margin: "0 auto",
        }}>

          {/* Status bar */}
          <div style={{
            height: 36,
            background: isGold ? "linear-gradient(135deg, #2a1800, #1a0c00)" : C.bg,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", fontSize: "0.7rem", fontWeight: 700,
            color: isGold ? C.gold : C.muted,
            borderBottom: isGold ? "none" : "1px solid #2a2050",
          }}>
            <span>9:41</span>
            <span>⭐ {band.stars}</span>
          </div>

          {/* Top bar */}
          <div style={{
            background: band.topBarBg,
            padding: "10px 16px 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: band.topBarBorder !== "transparent" ? `1px solid ${band.topBarBorder}` : "none",
          }}>
            <button style={{
              width: 36, height: 36, borderRadius: "50%", border: "none",
              background: band.accentBg, color: band.accent,
              fontSize: "1.1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: isGold ? C.gold : C.text }}>
              {band.questName}
            </span>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: starBg, border: `1px solid ${starBorder}`,
              padding: "4px 10px", borderRadius: 12,
              fontSize: "0.85rem", fontWeight: 900, color: band.accent,
              animation: "star-bump 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              ⭐ {band.stars}
            </div>
          </div>

          {/* Progress strip */}
          <div style={{ background: isGold ? "linear-gradient(135deg, #2a1800, #1a0c00)" : C.card }}>
            <ProgressStrip accent={band.accent} />
          </div>

          {/* Scene body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 18px 12px", gap: 14, overflowY: "auto" }}>

            {/* Coach bubble */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: isGold ? "#1a1000" : C.correctBg,
              border: `1px solid ${isGold ? C.gold : C.correct}`,
              borderRadius: 14, padding: "12px 14px",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem",
                background: isGold ? "linear-gradient(135deg, #2a1800, rgba(255,209,102,0.27))" : C.correctBg,
                border: `2px solid ${isGold ? C.gold : C.correct}`,
              }}>🦁</div>
              <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                {band.coachMsg}
              </div>
            </div>

            {/* G4-5 evidence block */}
            {activeBand === "g45" && band.evidenceBlock && (
              <div style={{
                background: C.correctBg, border: `2px solid ${C.correct}`,
                borderRadius: 12, padding: "10px 12px",
                fontSize: "0.82rem", fontWeight: 700, color: C.correct, lineHeight: 1.4,
              }}>
                <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, opacity: 0.8 }}>📌 Evidence</div>
                {band.evidenceBlock}
              </div>
            )}

            {/* Answer grid */}
            <AnswerGrid band={activeBand} answers={band.answers} />

            {/* Star bonus chip */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "8px 16px",
                background: band.accentBg,
                border: `2px solid ${band.accentBorder}`,
                borderRadius: 20, fontSize: "0.9rem", fontWeight: 900, color: band.accentText,
                animation: "obj-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s backwards",
              }}>
                ✨ +1 Star earned!
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "12px 16px 20px", background: C.card, borderTop: "1px solid #2a2050" }}>
            <button style={{
              width: "100%", padding: 14, borderRadius: 14, border: "none",
              background: band.ctaBg, color: band.ctaColor,
              ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {band.ctaLabel}
            </button>
          </div>
        </div>

        {/* Overlay demo */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p style={{ fontSize: "0.78rem", color: C.muted, fontWeight: 700 }}>Overlay variant (optional burst between questions)</p>
          <div style={{
            width: 390, height: 340, background: C.bg, borderRadius: 40,
            border: "2px solid rgba(80,232,144,0.27)",
            overflow: "hidden", position: "relative",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 20,
          }}>
            {/* Burst rings */}
            {[120, 200, 300].map((size, i) => (
              <div key={i} style={{
                position: "absolute", borderRadius: "50%",
                width: size, height: size,
                border: "4px solid rgba(80,232,144,0.15)",
                animation: `burst-expand 1.2s ease-out ${i * 0.2}s infinite`,
              }} />
            ))}
            <div style={{ position: "relative", textAlign: "center", zIndex: 1 }}>
              <div style={{ fontSize: 64, animation: "trophy-bob 1s ease-in-out infinite alternate" }}>⭐</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: C.correct, margin: "8px 0 4px" }}>Correct!</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: C.muted }}>You earned a star</div>
              <br />
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(80,232,144,0.15)", border: `2px solid ${C.correct}`,
                borderRadius: 20, padding: "8px 20px",
                fontSize: "1.1rem", fontWeight: 900, color: C.correct,
                animation: "obj-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s backwards",
              }}>
                ⭐ +1 Star
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
