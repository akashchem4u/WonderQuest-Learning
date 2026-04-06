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

// ─── Stub content ─────────────────────────────────────────────────────────────
const SCENE = {
  questName: "Reading Quest",
  totalSegs: 5,
  doneSegs: 3,
  stars: 41,
  passage: {
    activeParts: [
      { text: "When the results were posted on the bulletin board, ", clue: false },
      { text: "Dani walked slowly to her seat without saying a word.", clue: true },
      { text: " She stared at her paper for a long time. Her friend Priya asked if she wanted to go to recess, but ", clue: false },
      { text: "Dani shook her head and kept her eyes down.", clue: true },
      { text: " Later at lunch, Dani pushed her food around without eating. Priya sat beside her quietly.", clue: false },
    ],
  },
  questionType: "🔍 Inference",
  question: "How was Dani most likely feeling after seeing the results?",
  choices: [
    "She was bored and wanted to go home.",
    "She was excited and couldn't wait to tell her parents.",
    "She was upset or disappointed about the results.",
    "She was confused about what the results meant.",
  ],
  correctChoice: 2, // index
  evidenceText: '"Walked slowly," "kept her eyes down," and "pushed her food around without eating" are clues that show Dani was upset or disappointed.',
};

type SceneState = "question" | "correct" | "wrong";

function ProgressStrip({ total, done, isCorrect }: { total: number; done: number; isCorrect: boolean }) {
  return (
    <div style={{
      display: "flex", gap: 3, padding: "10px 16px",
      background: C.card, borderBottom: "1px solid #2a1818",
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
              ? "rgba(255,123,107,0.5)"
              : "rgba(255,123,107,0.15)",
          }} />
        );
      })}
    </div>
  );
}

export default function Grade45ReadingScene() {
  const [state, setState] = useState<SceneState>("question");
  const [selected, setSelected] = useState<number | null>(null);

  const handleChoice = (idx: number) => {
    if (state !== "question") return;
    setSelected(idx);
    setState(idx === SCENE.correctChoice ? "correct" : "wrong");
  };

  const handleNext = () => {
    setState("question");
    setSelected(null);
  };

  const stars = state === "correct" ? SCENE.stars + 1 : SCENE.stars;
  const doneSegs = state === "correct" ? SCENE.doneSegs + 1 : SCENE.doneSegs;

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <style>{`
          @keyframes slideIn { 0% { opacity:0; transform:translateX(-10px); } 100% { opacity:1; transform:translateX(0); } }
          @keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-8px); } 75% { transform:translateX(8px); } }
        `}</style>

        {/* Phone frame */}
        <div style={{
          width: 390, minHeight: 840, background: C.bg,
          borderRadius: 40, border: `2px solid ${C.border}`,
          boxShadow: "0 0 0 2px rgba(255,123,107,0.13), 0 30px 80px rgba(0,0,0,0.7)",
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
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.text }}>{SCENE.questName}</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(255,123,107,0.12)", padding: "4px 10px",
              borderRadius: 12, border: "1px solid rgba(255,123,107,0.3)",
              fontSize: "0.85rem", fontWeight: 900, color: C.coral,
            }}>⭐ {stars}</div>
          </div>

          {/* Progress strip */}
          <ProgressStrip total={SCENE.totalSegs} done={doneSegs} isCorrect={state === "correct"} />

          {/* Scene body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 16px 10px", gap: 12, overflowY: "auto" }}>

            {/* Coach */}
            {state === "question" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                background: "rgba(255,123,107,0.07)", borderRadius: 14,
                padding: "10px 12px", border: "1px solid rgba(255,123,107,0.18)",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #2a0e0a, rgba(255,123,107,0.27))",
                  border: `2px solid ${C.coral}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem",
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.8rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  <span style={{ color: C.coral, fontWeight: 900 }}>The answer isn't always stated — you have to infer!</span><br />
                  Look for clues in how the character acts or speaks.
                </div>
              </div>
            )}

            {state === "correct" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                background: C.correctBg, borderRadius: 14,
                padding: "10px 12px", border: `1px solid ${C.correctGreen}`,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #2a0e0a, rgba(255,123,107,0.27))",
                  border: `2px solid ${C.correctGreen}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem",
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.8rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  <span style={{ color: C.correctGreen, fontSize: "0.9rem", fontWeight: 900 }}>✨ You read between the lines!</span><br />
                  The clues (slow walk, eyes down, not eating) all point to disappointment.
                </div>
              </div>
            )}

            {state === "wrong" && (
              <div style={{
                background: C.wrongBg, border: `2px solid ${C.wrong}`,
                borderRadius: 12, padding: "10px 12px",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>🔍</span>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: C.wrong, lineHeight: 1.35 }}>
                  Not quite — look at the highlighted clues.<br />
                  <span style={{ color: C.text }}>What do Dani's actions (slow walk, eyes down, not eating) tell you about how she felt?</span>
                </div>
              </div>
            )}

            {/* Passage card */}
            <div style={{
              background: C.card2, borderRadius: 16,
              border: `2px solid ${state === "correct" ? C.correctGreen : "#2a1818"}`,
              padding: "14px 16px",
            }}>
              <div style={{
                fontSize: "0.72rem", fontWeight: 900,
                color: state === "correct" ? C.correctGreen : C.coral,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
              }}>
                {state === "correct" ? "📖 Evidence in the passage" : state === "wrong" ? "📖 Look for the clues" : "📖 Read this"}
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.65 }}>
                {SCENE.passage.activeParts.map((part, i) => (
                  <span
                    key={i}
                    style={part.clue ? {
                      background: state === "correct"
                        ? "rgba(80,232,144,0.2)"
                        : "rgba(255,123,107,0.15)",
                      borderRadius: 3, padding: "0 2px",
                    } : undefined}
                  >
                    {part.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Evidence explanation — correct only */}
            {state === "correct" && (
              <div style={{
                background: C.correctBg, border: `2px solid ${C.correctGreen}`,
                borderRadius: 12, padding: "10px 12px",
                fontSize: "0.82rem", fontWeight: 700, color: C.correctGreen, lineHeight: 1.4,
              }}>
                <div style={{
                  fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em",
                  marginBottom: 4, opacity: 0.8,
                }}>📌 Evidence</div>
                {SCENE.evidenceText}
              </div>
            )}

            {/* Question type badge + question */}
            {state !== "correct" && (
              <>
                <div style={{
                  display: "inline-block", fontSize: "0.68rem", fontWeight: 900,
                  background: "rgba(255,123,107,0.15)", color: C.coral,
                  borderRadius: 6, padding: "2px 8px",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  alignSelf: "flex-start",
                }}>{SCENE.questionType}</div>
                <div style={{ fontSize: "0.92rem", fontWeight: 900, color: C.text, lineHeight: 1.4 }}>
                  {SCENE.question}
                </div>
              </>
            )}

            {/* Answer choices */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {SCENE.choices.map((choice, i) => {
                const isCorrect = i === SCENE.correctChoice;
                const isSelected = selected === i;
                let bg = C.card2;
                let borderColor = "#2a1818";
                let color = C.text;
                let opacity = 1;
                let pointerEvents: React.CSSProperties["pointerEvents"] = "auto";
                let animStyle = `slideIn 0.35s ease-out ${(i + 1) * 0.04}s backwards`;

                if (state === "correct") {
                  if (isCorrect) {
                    bg = C.correctBg; borderColor = C.correctGreen; color = C.correctGreen;
                    animStyle = "none";
                  } else {
                    opacity = 0.35; pointerEvents = "none";
                  }
                } else if (state === "wrong" && isSelected) {
                  bg = C.wrongBg; borderColor = C.wrong;
                  animStyle = "shake 0.5s ease-out";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleChoice(i)}
                    style={{
                      width: "100%", padding: "11px 12px",
                      background: bg, border: `2px solid ${borderColor}`,
                      borderRadius: 12, cursor: "pointer", textAlign: "left",
                      ...FONT, fontSize: "0.86rem", fontWeight: 700, color, lineHeight: 1.4,
                      opacity, pointerEvents,
                      animation: animStyle,
                      transition: "all 0.15s",
                    }}
                  >
                    {choice}{isCorrect && state === "correct" ? " ✓" : ""}
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
                Next Passage ✨ +1⭐
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
                  }}>📖 Re-read</button>
                  <button style={{
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
