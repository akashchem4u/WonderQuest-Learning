"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  mint: "#58e8c1",
  mintDim: "#2a7060",
  mintBg: "#0a2a22",
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

// ─── Stub question data ────────────────────────────────────────────────────────
const QUESTION = {
  questName: "Multiplication Quest",
  totalSegs: 6,
  doneSegs: 3,
  stars: 22,
  left: 3,
  op: "×",
  right: 4,
  answer: 12,
  choices: [9, 12, 16, 15],
  coachActive: "3 groups of 4! How many total? Recall it or skip count — you've got this!",
  coachCorrect: "3 × 4 = 12! 4, 8, 12 — three groups of four. Your multiplication brain is ON! 🧠",
  skipCounts: [4, 8, 12, 16, 20],
  skipTarget: 12,
  arrayRows: 3,
  arrayCols: 4,
};

type SceneState = "question" | "correct" | "wrong";

function ProgressStrip({ total, done, activeIdx }: { total: number; done: number; activeIdx: number }) {
  return (
    <div style={{
      display: "flex", gap: 3, padding: "10px 16px",
      background: C.card, borderBottom: `1px solid #1a3030`,
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 6, borderRadius: 3,
          background: i < done ? C.mint : i === activeIdx ? `rgba(88,232,193,0.5)` : `rgba(88,232,193,0.15)`,
        }} />
      ))}
    </div>
  );
}

function CoachBubble({ text, accent, correct }: { text: string; accent?: string; correct?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      background: correct ? C.correctBg : `rgba(88,232,193,0.07)`,
      borderRadius: 14, padding: "12px 14px",
      border: `1px solid ${correct ? C.correctGreen : "rgba(88,232,193,0.18)"}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #0a2a22, rgba(88,232,193,0.27))",
        border: `2px solid ${correct ? C.correctGreen : C.mint}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.2rem",
      }}>🦁</div>
      <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
        {accent && (
          <span style={{ color: correct ? C.correctGreen : C.mint, fontSize: "0.95rem", fontWeight: 900 }}>
            {accent}
          </span>
        )}
        {accent && <br />}
        {text}
      </div>
    </div>
  );
}

function EquationCard({ blank, answered, correct }: { blank?: boolean; answered?: boolean; correct?: boolean }) {
  return (
    <div style={{
      background: C.card2, borderRadius: 20,
      border: `2px solid ${correct ? C.correctGreen : "#2a4040"}`,
      padding: "28px 24px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    }}>
      <span style={{ fontSize: "3.5rem", fontWeight: 900, color: C.text, lineHeight: 1 }}>{QUESTION.left}</span>
      <span style={{ fontSize: "2.8rem", fontWeight: 900, color: C.muted }}>{QUESTION.op}</span>
      <span style={{ fontSize: "3.5rem", fontWeight: 900, color: C.text, lineHeight: 1 }}>{QUESTION.right}</span>
      <span style={{ fontSize: "2.8rem", fontWeight: 900, color: C.muted }}>=</span>
      {answered ? (
        <span style={{ fontSize: "3.5rem", fontWeight: 900, color: C.correctGreen }}>{QUESTION.answer}</span>
      ) : (
        <span style={{
          fontSize: "3.5rem", fontWeight: 900, color: C.mint,
          borderBottom: `4px solid ${C.mint}`, minWidth: 60, textAlign: "center",
          animation: blank ? "mintPulse 1.5s ease-in-out infinite" : undefined,
        }}>?</span>
      )}
      <style>{`@keyframes mintPulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>
    </div>
  );
}

export default function Grade23MathScene() {
  const [state, setState] = useState<SceneState>("question");
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleChoiceTap = (val: number) => {
    if (state !== "question") return;
    setSelected(val);
    setState(val === QUESTION.answer ? "correct" : "wrong");
  };

  const handleNext = () => {
    setState("question");
    setSelected(null);
    setShowHint(false);
  };

  const stars = state === "correct" ? QUESTION.stars + 1 : QUESTION.stars;
  const activeSeg = state === "correct" ? QUESTION.doneSegs + 1 : QUESTION.doneSegs;

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Phone frame */}
        <div style={{
          width: 390, minHeight: 780, background: C.bg,
          borderRadius: 40, border: `2px solid ${C.border}`,
          boxShadow: `0 0 0 2px rgba(88,232,193,0.13), 0 30px 80px rgba(0,0,0,0.7)`,
          overflow: "hidden", display: "flex", flexDirection: "column", margin: "0 auto",
        }}>

          {/* Status bar */}
          <div style={{
            height: 36, background: C.bg,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", fontSize: "0.7rem", color: C.muted, fontWeight: 700,
            borderBottom: "1px solid #1a3030",
          }}>
            <span>9:41</span>
            <span>⭐ {stars}</span>
          </div>

          {/* Top bar */}
          <div style={{
            background: C.card, padding: "10px 16px 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #1a3030",
          }}>
            <button style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(88,232,193,0.12)", border: "none",
              color: C.mint, fontSize: "1.1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.text }}>{QUESTION.questName}</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(88,232,193,0.12)", padding: "4px 10px",
              borderRadius: 12, border: `1px solid rgba(88,232,193,0.3)`,
              fontSize: "0.85rem", fontWeight: 900, color: C.mint,
            }}>⭐ {stars}</div>
          </div>

          {/* Progress strip */}
          <ProgressStrip total={QUESTION.totalSegs} done={activeSeg} activeIdx={activeSeg} />

          {/* Scene body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 20px 12px", gap: 16, overflowY: "auto" }}>

            {/* Coach */}
            {state === "question" && (
              <CoachBubble accent="3 groups of 4!" text={QUESTION.coachActive} />
            )}
            {state === "correct" && (
              <CoachBubble accent="✨ 3 × 4 = 12! Nailed it!" text={QUESTION.coachCorrect} correct />
            )}
            {state === "wrong" && (
              <div style={{
                background: C.wrongBg, border: `2px solid ${C.wrong}`,
                borderRadius: 12, padding: "12px 14px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>🔢</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.wrong, lineHeight: 1.3 }}>
                  Not quite — try skip counting by 4s.<br />
                  <span style={{ color: C.text }}>4… 8… 12… keep going until you count 3 jumps!</span>
                </div>
              </div>
            )}

            {/* Equation */}
            <EquationCard blank={state === "question"} answered={state === "correct"} correct={state === "correct"} />

            {/* Hint array — shown on question state after hint button tap */}
            {state === "question" && showHint && (
              <>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.mint, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>
                  💡 Array hint
                </div>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: 12, background: "rgba(88,232,193,0.06)", borderRadius: 12,
                  border: "1px solid rgba(88,232,193,0.15)",
                }}>
                  {Array.from({ length: QUESTION.arrayRows }).map((_, r) => (
                    <div key={r} style={{ display: "flex", gap: 6 }}>
                      {Array.from({ length: QUESTION.arrayCols }).map((_, c) => (
                        <div key={c} style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: "rgba(88,232,193,0.4)", border: `2px solid ${C.mint}`,
                        }} />
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Skip-count strip — shown after wrong */}
            {state === "wrong" && (
              <>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.mint, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>
                  Skip count by 4:
                </div>
                <div style={{
                  background: "rgba(88,232,193,0.08)", border: "1px solid rgba(88,232,193,0.2)",
                  borderRadius: 12, padding: "10px 14px",
                  fontSize: "0.88rem", fontWeight: 700, color: C.mint,
                  textAlign: "center",
                }}>
                  {QUESTION.skipCounts.map((n) => (
                    <span key={n} style={{
                      display: "inline-block",
                      background: n === QUESTION.skipTarget ? C.mint : "rgba(88,232,193,0.15)",
                      color: n === QUESTION.skipTarget ? "#0a2a22" : C.mint,
                      borderRadius: 6, padding: "2px 8px", margin: 2,
                      opacity: n > QUESTION.skipTarget ? 0.4 : 1,
                    }}>{n}</span>
                  ))}
                </div>
              </>
            )}

            {/* Answer buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {QUESTION.choices.map((val, i) => {
                const isCorrect = val === QUESTION.answer;
                const isSelected = selected === val;
                let bg = C.card2;
                let borderColor = "#2a4040";
                let color = C.text;
                let opacity = 1;
                let pointerEvents: React.CSSProperties["pointerEvents"] = "auto";

                if (state === "correct") {
                  if (isCorrect) { bg = C.correctBg; borderColor = C.correctGreen; color = C.correctGreen; }
                  else { opacity = 0.35; pointerEvents = "none"; }
                } else if (state === "wrong" && isSelected) {
                  bg = C.wrongBg; borderColor = C.wrong; color = C.wrong;
                }

                return (
                  <button key={val} onClick={() => handleChoiceTap(val)} style={{
                    flex: 1, height: 68,
                    background: bg, border: `3px solid ${borderColor}`,
                    borderRadius: 14, cursor: "pointer",
                    ...FONT,
                    fontSize: "1.8rem", fontWeight: 900, color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity, pointerEvents,
                    transition: "all 0.15s",
                  }}>
                    {val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "12px 16px 20px", background: C.card,
            borderTop: "1px solid #1a3030", display: "flex", flexDirection: "column", gap: 8,
          }}>
            {state === "correct" ? (
              <button onClick={handleNext} style={{
                width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #58e8c1, #30b090)",
                color: "#0a2a22", ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Next Problem ✨ +1⭐
              </button>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{
                    flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "#162a22", color: C.mint,
                    border: "1px solid rgba(88,232,193,0.2)",
                    ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>🔊 Replay</button>
                  <button onClick={() => setShowHint(!showHint)} style={{
                    flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "rgba(88,232,193,0.1)", color: C.mint,
                    border: "1px solid rgba(88,232,193,0.25)",
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
