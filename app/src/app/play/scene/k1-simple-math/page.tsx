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
  correctGreen: "#50e890",
  correctBg: "#0d2a1a",
  wrong: "#ff7b6b",
  wrongBg: "#2a0e0e",
  text: "#f0eaff",
  muted: "#8b7fb8",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

// ─── Stub question data ───────────────────────────────────────────────────────
const QUESTION = {
  questName: "Math Quest",
  totalSegs: 5,
  doneSegs: 4,
  stars: 14,
  groupA: { emoji: "⭐", count: 3 },
  groupB: { emoji: "⭐", count: 2 },
  answer: 5,
  choices: [4, 5, 6, 7],
};

type SceneState = "question" | "correct" | "wrong";

function ProgressStrip({ total, done, isCorrect }: { total: number; done: number; isCorrect: boolean }) {
  return (
    <div style={{
      display: "flex", gap: 3, padding: "10px 16px",
      background: C.card, borderBottom: "1px solid #2a2050",
    }}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < done || isCorrect;
        const active = i === done && !isCorrect;
        return (
          <div key={i} style={{
            flex: 1, height: 6, borderRadius: 3,
            background: filled
              ? C.violet
              : active
              ? "rgba(155,114,255,0.6)"
              : "rgba(155,114,255,0.2)",
          }} />
        );
      })}
    </div>
  );
}

export default function K1SimpleMathScene() {
  const [state, setState] = useState<SceneState>("question");
  const [selected, setSelected] = useState<number | null>(null);

  const handleChoice = (val: number) => {
    if (state !== "question") return;
    setSelected(val);
    setState(val === QUESTION.answer ? "correct" : "wrong");
  };

  const handleNext = () => {
    setState("question");
    setSelected(null);
  };

  const stars = state === "correct" ? QUESTION.stars + 1 : QUESTION.stars;

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <style>{`
          @keyframes objPop { 0% { opacity:0; transform:scale(0.5); } 100% { opacity:1; transform:scale(1); } }
          @keyframes violetPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.1); } }
          @keyframes shake { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-7px); } 40% { transform:translateX(7px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
        `}</style>

        {/* Phone frame */}
        <div style={{
          width: 390, minHeight: 780, background: C.bg,
          borderRadius: 40, border: `2px solid ${C.border}`,
          boxShadow: "0 0 0 2px rgba(155,114,255,0.13), 0 30px 80px rgba(0,0,0,0.7)",
          overflow: "hidden", display: "flex", flexDirection: "column", margin: "0 auto",
        }}>

          {/* Status bar */}
          <div style={{
            height: 36, background: C.bg,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", fontSize: "0.7rem", color: C.muted, fontWeight: 700,
            borderBottom: "1px solid #2a2050",
          }}>
            <span>9:41</span>
            <span>⭐ {stars}</span>
          </div>

          {/* Top bar */}
          <div style={{
            background: C.card, padding: "10px 16px 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #2a2050",
          }}>
            <button style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(155,114,255,0.12)", border: "none",
              color: C.violet, fontSize: "1.1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.text }}>{QUESTION.questName}</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(155,114,255,0.15)", padding: "4px 10px",
              borderRadius: 12, border: "1px solid rgba(155,114,255,0.3)",
              fontSize: "0.85rem", fontWeight: 900, color: C.violet,
            }}>⭐ {stars}</div>
          </div>

          {/* Progress strip */}
          <ProgressStrip total={QUESTION.totalSegs} done={QUESTION.doneSegs} isCorrect={state === "correct"} />

          {/* Scene body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 20px 12px", gap: 14, overflowY: "auto" }}>

            {/* Coach / wrong banner */}
            {state === "question" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "rgba(155,114,255,0.08)", borderRadius: 14,
                padding: "12px 14px", border: "1px solid rgba(155,114,255,0.2)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #2a1858, rgba(155,114,255,0.27))",
                  border: `2px solid ${C.violet}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem",
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  <span style={{ color: C.violet, fontSize: "1rem", fontWeight: 900 }}>Count all the stars together!</span><br />
                  Touch each one as you count — how many in all?
                </div>
              </div>
            )}

            {state === "correct" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: C.correctBg, borderRadius: 14,
                padding: "12px 14px", border: `1px solid ${C.correctGreen}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #2a1858, rgba(155,114,255,0.27))",
                  border: `2px solid ${C.correctGreen}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem",
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  <span style={{ color: C.correctGreen, fontSize: "1rem", fontWeight: 900 }}>✨ 3 + 2 = 5! You counted them all!</span><br />
                  3… 4… 5! Perfect counting — you're a math star!
                </div>
              </div>
            )}

            {state === "wrong" && (
              <div style={{
                background: C.wrongBg, border: `2px solid ${C.wrong}`,
                borderRadius: 12, padding: "12px 14px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>⭐</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.wrong, lineHeight: 1.3 }}>
                  Not quite — let's count again together.<br />
                  <span style={{ color: C.text }}>Touch each star one at a time: 1, 2, 3… keep going!</span>
                </div>
              </div>
            )}

            {/* Equation display */}
            <div style={{
              background: C.card2, borderRadius: 16,
              border: `2px solid ${state === "correct" ? C.correctGreen : "#3a3060"}`,
              padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              {/* Group A */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center", maxWidth: 90 }}>
                  {Array.from({ length: QUESTION.groupA.count }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "1.5rem",
                        animation: `objPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${(i + 1) * 0.04}s backwards`,
                        filter: state === "correct" ? "drop-shadow(0 0 4px #50e890)" : undefined,
                      }}
                    >{QUESTION.groupA.emoji}</span>
                  ))}
                </div>
                <span style={{ fontSize: "1.2rem", fontWeight: 900, color: state === "correct" ? C.correctGreen : C.violet }}>
                  {QUESTION.groupA.count}
                </span>
              </div>

              {/* Op */}
              <div style={{ fontSize: "2rem", fontWeight: 900, color: C.text, alignSelf: "center" }}>+</div>

              {/* Group B */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center", maxWidth: 90 }}>
                  {Array.from({ length: QUESTION.groupB.count }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "1.5rem",
                        animation: `objPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${(QUESTION.groupA.count + i + 1) * 0.04}s backwards`,
                        filter: state === "correct" ? "drop-shadow(0 0 4px #50e890)" : undefined,
                      }}
                    >{QUESTION.groupB.emoji}</span>
                  ))}
                </div>
                <span style={{ fontSize: "1.2rem", fontWeight: 900, color: state === "correct" ? C.correctGreen : C.violet }}>
                  {QUESTION.groupB.count}
                </span>
              </div>

              {/* Equals */}
              <div style={{ fontSize: "2rem", fontWeight: 900, color: C.muted, alignSelf: "center" }}>=</div>

              {/* Answer or question mark */}
              {state === "correct" ? (
                <div style={{ fontSize: "2.8rem", fontWeight: 900, color: C.correctGreen, alignSelf: "center" }}>
                  {QUESTION.answer}
                </div>
              ) : (
                <div style={{
                  fontSize: "2.8rem", fontWeight: 900, color: C.violet, alignSelf: "center",
                  animation: "violetPulse 1.5s ease-in-out infinite",
                }}>?</div>
              )}
            </div>

            {/* Answer buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {QUESTION.choices.map((val, i) => {
                const isCorrect = val === QUESTION.answer;
                const isSelected = selected === val;
                let bg = C.card2;
                let borderColor = "#3a3060";
                let color = C.text;
                let opacity = 1;
                let pointerEvents: React.CSSProperties["pointerEvents"] = "auto";
                let animStyle = `objPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${(i + 1) * 0.05}s backwards`;

                if (state === "correct") {
                  if (isCorrect) {
                    bg = C.correctBg; borderColor = C.correctGreen; color = C.correctGreen;
                    animStyle = "none";
                  } else {
                    opacity = 0.35; pointerEvents = "none";
                  }
                } else if (state === "wrong" && isSelected) {
                  bg = C.wrongBg; borderColor = C.wrong; color = C.wrong;
                  animStyle = "shake 0.5s ease-out";
                }

                return (
                  <button
                    key={val}
                    onClick={() => handleChoice(val)}
                    style={{
                      width: 70, height: 70,
                      background: bg, border: `3px solid ${borderColor}`,
                      borderRadius: 14, cursor: "pointer",
                      ...FONT,
                      fontSize: "2rem", fontWeight: 900, color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity, pointerEvents,
                      animation: animStyle,
                      transition: "all 0.15s",
                    }}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "12px 16px 20px", background: C.card,
            borderTop: "1px solid #2a2050", display: "flex", flexDirection: "column", gap: 8,
          }}>
            {state === "correct" ? (
              <button onClick={handleNext} style={{
                width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #9b72ff, #7248e8)",
                color: "white", ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Next Problem ✨ +1⭐
              </button>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{
                    flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "#2a2050", color: C.violet,
                    border: "1px solid #3a3060",
                    ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>🔊 Replay</button>
                  <button style={{
                    flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "rgba(155,114,255,0.1)", color: C.violet,
                    border: "1px solid rgba(155,114,255,0.25)",
                    ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>💡 Hint</button>
                  <button style={{
                    flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "transparent", color: C.wrong,
                    border: "2px solid rgba(255,123,107,0.3)",
                    ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>🤷 IDK yet</button>
                </div>
                <div style={{
                  background: "#1a2a15", border: "2px solid #50e890",
                  borderRadius: 12, padding: "8px 12px",
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: "0.78rem", fontWeight: 700, color: "#50e890", justifyContent: "center",
                }}>
                  ⭐ {state === "wrong" ? "Stars are safe — no star lost!" : "Stars are safe — keep trying!"}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
