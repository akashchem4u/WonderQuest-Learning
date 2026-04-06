"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  coral: "#ff7b6b",
  coralBg: "#2a0e0a",
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
  doneSegs: 2,
  stars: 34,
  step1Left: 6,
  step1Right: 4,
  step1Answer: 24,
  step2Add: 7,
  finalAnswer: 31,
  choices: [24, 31, 34, 38],
};

type SceneState = "question" | "correct" | "wrong";

function ProgressStrip({ total, done, isCorrect }: { total: number; done: number; isCorrect: boolean }) {
  return (
    <div style={{
      display: "flex", gap: 3, padding: "10px 16px",
      background: C.card, borderBottom: `1px solid #2a1818`,
    }}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < done;
        const active = i === done && !isCorrect;
        return (
          <div key={i} style={{
            flex: 1, height: 6, borderRadius: 3,
            background: filled
              ? C.coral
              : active
              ? `rgba(255,123,107,0.5)`
              : `rgba(255,123,107,0.15)`,
          }} />
        );
      })}
    </div>
  );
}

export default function Grade45MathScene() {
  const [state, setState] = useState<SceneState>("question");
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleChoice = (val: number) => {
    if (state !== "question") return;
    setSelected(val);
    setState(val === QUESTION.finalAnswer ? "correct" : "wrong");
  };

  const handleNext = () => {
    setState("question");
    setSelected(null);
    setShowHint(false);
  };

  const stars = state === "correct" ? QUESTION.stars + 1 : QUESTION.stars;
  const doneSegs = state === "correct" ? QUESTION.doneSegs + 1 : QUESTION.doneSegs;

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <style>{`
          @keyframes coralPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
          @keyframes popIn { 0% { opacity:0; transform:scale(0.7); } 100% { opacity:1; transform:scale(1); } }
          @keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-8px); } 75% { transform:translateX(8px); } }
        `}</style>

        {/* Phone frame */}
        <div style={{
          width: 390, minHeight: 820, background: C.bg,
          borderRadius: 40, border: `2px solid ${C.border}`,
          boxShadow: `0 0 0 2px rgba(255,123,107,0.13), 0 30px 80px rgba(0,0,0,0.7)`,
          overflow: "hidden", display: "flex", flexDirection: "column", margin: "0 auto",
        }}>

          {/* Status bar */}
          <div style={{
            height: 36, background: C.bg,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", fontSize: "0.7rem", color: C.muted, fontWeight: 700,
            borderBottom: "1px solid #2a1818",
          }}>
            <span>9:41</span>
            <span>⭐ {stars}</span>
          </div>

          {/* Top bar */}
          <div style={{
            background: C.card, padding: "10px 16px 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #2a1818",
          }}>
            <button style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,123,107,0.12)", border: "none",
              color: C.coral, fontSize: "1.1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.text }}>{QUESTION.questName}</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(255,123,107,0.12)", padding: "4px 10px",
              borderRadius: 12, border: `1px solid rgba(255,123,107,0.3)`,
              fontSize: "0.85rem", fontWeight: 900, color: C.coral,
            }}>⭐ {stars}</div>
          </div>

          {/* Progress strip */}
          <ProgressStrip total={QUESTION.totalSegs} done={doneSegs} isCorrect={state === "correct"} />

          {/* Scene body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 18px 12px", gap: 14, overflowY: "auto" }}>

            {/* Coach / wrong banner */}
            {state === "question" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "rgba(255,123,107,0.07)", borderRadius: 14,
                padding: "10px 12px", border: "1px solid rgba(255,123,107,0.18)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #2a0e0a, rgba(255,123,107,0.27))",
                  border: `2px solid ${C.coral}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem",
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  <span style={{ color: C.coral, fontWeight: 900 }}>Two steps — multiply first, then add!</span><br />
                  Break it apart and you'll nail it.
                </div>
              </div>
            )}

            {state === "correct" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: C.correctBg, borderRadius: 14,
                padding: "10px 12px", border: `1px solid ${C.correctGreen}`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #2a0e0a, rgba(255,123,107,0.27))",
                  border: `2px solid ${C.correctGreen}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem",
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  <span style={{ color: C.correctGreen, fontSize: "0.95rem", fontWeight: 900 }}>✨ Two steps, perfectly solved!</span><br />
                  6 × 4 = 24, then 24 + 7 = 31. That's multi-step thinking!
                </div>
              </div>
            )}

            {state === "wrong" && (
              <div style={{
                background: C.wrongBg, border: `2px solid ${C.wrong}`,
                borderRadius: 12, padding: "10px 12px",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>🪜</span>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: C.wrong, lineHeight: 1.3 }}>
                  Not quite — check step 1 first.<br />
                  <span style={{ color: C.text }}>What is 6 × 4? Once you have that, add 7 more.</span>
                </div>
              </div>
            )}

            {/* Word problem card */}
            <div style={{
              background: C.card2, borderRadius: 16,
              border: `2px solid ${state === "correct" ? C.correctGreen : "#2a1818"}`,
              padding: "16px 18px",
            }}>
              <div style={{
                fontSize: "0.72rem", fontWeight: 900, color: state === "correct" ? C.correctGreen : C.coral,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
              }}>📝 Word Problem</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: C.text, lineHeight: 1.6 }}>
                Zara has <span style={{ color: C.coral, fontWeight: 900 }}>6</span> bags of apples. Each bag holds{" "}
                <span style={{ color: C.coral, fontWeight: 900 }}>4</span> apples. Her friend gives her{" "}
                <span style={{ color: C.coral, fontWeight: 900 }}>7</span> more apples. How many apples does Zara have <em>in all</em>?
              </div>
            </div>

            {/* Step breakdown — active/wrong */}
            {(state === "question") && (
              <div style={{
                background: C.card2, borderRadius: 14,
                border: "2px solid #2a1818", padding: "14px 16px",
              }}>
                <div style={{
                  fontSize: "0.72rem", fontWeight: 900, color: C.coral,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
                }}>🪜 Steps</div>
                {/* Step 1 */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #2a2050" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(255,123,107,0.2)", border: `2px solid ${C.coral}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 900, color: C.coral, flexShrink: 0,
                  }}>1</div>
                  <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text }}>6 bags × 4 apples each</div>
                  <div style={{
                    fontSize: "1rem", fontWeight: 900, color: C.coral,
                    animation: "coralPulse 1.5s ease-in-out infinite",
                  }}>= ?</div>
                </div>
                {/* Step 2 */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(255,123,107,0.2)", border: `2px solid ${C.coral}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 900, color: C.coral, flexShrink: 0,
                  }}>2</div>
                  <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text }}>Step 1 result + 7 more</div>
                  <div style={{
                    fontSize: "1rem", fontWeight: 900, color: C.coral,
                    animation: "coralPulse 1.5s ease-in-out infinite",
                  }}>= ?</div>
                </div>
              </div>
            )}

            {/* Step breakdown — wrong: step 1 hint revealed */}
            {state === "wrong" && (
              <div style={{
                background: C.card2, borderRadius: 14,
                border: "2px solid #2a1818", padding: "14px 16px",
              }}>
                <div style={{
                  fontSize: "0.72rem", fontWeight: 900, color: C.coral,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
                }}>💡 Step hint</div>
                {/* Step 1 — revealed */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #2a2050" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: C.correctBg, border: `2px solid ${C.correctGreen}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 900, color: C.correctGreen, flexShrink: 0,
                  }}>✓</div>
                  <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text }}>
                    6 × 4 = <strong style={{ color: C.correctGreen }}>24</strong>
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 900, color: C.correctGreen }}>Step 1: 24</div>
                </div>
                {/* Step 2 — still unknown */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(255,123,107,0.2)", border: `2px solid ${C.coral}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 900, color: C.coral, flexShrink: 0,
                  }}>2</div>
                  <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text }}>24 + 7 = ?</div>
                  <div style={{
                    fontSize: "1rem", fontWeight: 900, color: C.coral,
                    animation: "coralPulse 1.5s ease-in-out infinite",
                  }}>= ?</div>
                </div>
              </div>
            )}

            {/* Step breakdown — correct: both revealed */}
            {state === "correct" && (
              <div style={{
                background: C.card2, borderRadius: 14,
                border: `2px solid ${C.correctGreen}`, padding: "14px 16px",
              }}>
                <div style={{
                  fontSize: "0.72rem", fontWeight: 900, color: C.correctGreen,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
                }}>🪜 Steps</div>
                {/* Step 1 done */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #2a2050" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: C.correctBg, border: `2px solid ${C.correctGreen}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 900, color: C.correctGreen, flexShrink: 0,
                  }}>✓</div>
                  <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text }}>6 bags × 4 apples each</div>
                  <div style={{ fontSize: "1rem", fontWeight: 900, color: C.correctGreen }}>= 24</div>
                </div>
                {/* Step 2 done */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: C.correctBg, border: `2px solid ${C.correctGreen}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 900, color: C.correctGreen, flexShrink: 0,
                  }}>✓</div>
                  <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text }}>24 apples + 7 more</div>
                  <div style={{ fontSize: "1rem", fontWeight: 900, color: C.correctGreen }}>= 31</div>
                </div>
              </div>
            )}

            {/* Answer buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {QUESTION.choices.map((val, i) => {
                const isCorrect = val === QUESTION.finalAnswer;
                const isSelected = selected === val;
                let bg = C.card2;
                let borderColor = "#2a1818";
                let color = C.text;
                let opacity = 1;
                let pointerEvents: React.CSSProperties["pointerEvents"] = "auto";
                let animName = `popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${(i + 1) * 0.04}s backwards`;

                if (state === "correct") {
                  if (isCorrect) {
                    bg = C.correctBg; borderColor = C.correctGreen; color = C.correctGreen;
                    animName = "none";
                  } else {
                    opacity = 0.35; pointerEvents = "none";
                  }
                } else if (state === "wrong" && isSelected) {
                  bg = C.wrongBg; borderColor = C.wrong; color = C.wrong;
                  animName = "shake 0.5s ease-out";
                }

                return (
                  <button
                    key={val}
                    onClick={() => handleChoice(val)}
                    style={{
                      flex: 1, height: 62,
                      background: bg, border: `3px solid ${borderColor}`,
                      borderRadius: 14, cursor: "pointer",
                      ...FONT,
                      fontSize: "1.5rem", fontWeight: 900, color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity, pointerEvents,
                      animation: animName,
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
            borderTop: "1px solid #2a1818", display: "flex", flexDirection: "column", gap: 8,
          }}>
            {state === "correct" ? (
              <button onClick={handleNext} style={{
                width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #ff7b6b, #d04a38)",
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
                    background: "#1a0e0a", color: C.coral,
                    border: "1px solid rgba(255,123,107,0.2)",
                    ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>🔊 Replay</button>
                  <button onClick={() => setShowHint(!showHint)} style={{
                    flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "rgba(255,123,107,0.1)", color: C.coral,
                    border: "1px solid rgba(255,123,107,0.25)",
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
