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

// ─── Stub content ──────────────────────────────────────────────────────────────
const PASSAGE = {
  questName: "Reading Quest",
  totalSegs: 5,
  doneSegs: 2,
  stars: 26,
  title: "📖 Read this",
  sentences: [
    { text: "Maya woke up early on Saturday morning. She looked outside and saw that it was raining hard. ", key: false },
    { text: "She decided to stay inside and read her favorite book about dragons.", key: true },
    { text: " Later, the sun came out and Maya went to the park with her dog.", key: false },
  ],
  question: "What did Maya do when she saw it was raining?",
  choices: [
    { id: 0, text: "She went to the park with her dog.", correct: false },
    { id: 1, text: "She stayed inside and read a book about dragons.", correct: true },
    { id: 2, text: "She called a friend on the phone.", correct: false },
    { id: 3, text: "She went back to sleep.", correct: false },
  ],
  coachHint: "Look for clues — the answer is hiding in the passage.",
  coachCorrect: '"She decided to stay inside and read…" — great detective reading!',
};

type SceneState = "question" | "correct" | "wrong";

function ProgressStrip({ total, done, activeIdx }: { total: number; done: number; activeIdx: number }) {
  return (
    <div style={{
      display: "flex", gap: 3, padding: "10px 16px",
      background: C.card, borderBottom: "1px solid #1a3030",
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 6, borderRadius: 3,
          background: i < done ? C.mint : i === activeIdx ? "rgba(88,232,193,0.5)" : "rgba(88,232,193,0.15)",
        }} />
      ))}
    </div>
  );
}

export default function Grade23ReadingScene() {
  const [state, setState] = useState<SceneState>("question");
  const [selected, setSelected] = useState<number | null>(null);

  const handleChoice = (id: number, correct: boolean) => {
    if (state !== "question") return;
    setSelected(id);
    setState(correct ? "correct" : "wrong");
  };

  const handleNext = () => {
    setState("question");
    setSelected(null);
  };

  const stars = state === "correct" ? PASSAGE.stars + 1 : PASSAGE.stars;
  const activeSeg = state === "correct" ? PASSAGE.doneSegs + 1 : PASSAGE.doneSegs;

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Phone frame */}
        <div style={{
          width: 390, minHeight: 820, background: C.bg,
          borderRadius: 40, border: `2px solid ${C.border}`,
          boxShadow: "0 0 0 2px rgba(88,232,193,0.13), 0 30px 80px rgba(0,0,0,0.7)",
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
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.text }}>{PASSAGE.questName}</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(88,232,193,0.12)", padding: "4px 10px",
              borderRadius: 12, border: "1px solid rgba(88,232,193,0.3)",
              fontSize: "0.85rem", fontWeight: 900, color: C.mint,
            }}>⭐ {stars}</div>
          </div>

          {/* Progress strip */}
          <ProgressStrip total={PASSAGE.totalSegs} done={activeSeg} activeIdx={activeSeg} />

          {/* Scene body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 18px 12px", gap: 12, overflowY: "auto" }}>

            {/* Coach */}
            {state === "question" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "rgba(88,232,193,0.07)", borderRadius: 14,
                padding: "10px 12px", border: "1px solid rgba(88,232,193,0.18)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #0a2a22, rgba(88,232,193,0.27))",
                  border: `2px solid ${C.mint}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  <span style={{ color: C.mint, fontWeight: 900 }}>Read it, then answer!</span><br />
                  {PASSAGE.coachHint}
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
                  background: "linear-gradient(135deg, #0a2a22, rgba(88,232,193,0.27))",
                  border: `2px solid ${C.correctGreen}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  <span style={{ color: C.correctGreen, fontSize: "0.95rem" }}>✨ You found it in the passage!</span><br />
                  {PASSAGE.coachCorrect}
                </div>
              </div>
            )}

            {state === "wrong" && (
              <div style={{
                background: C.wrongBg, border: `2px solid ${C.wrong}`,
                borderRadius: 12, padding: "10px 12px",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>📖</span>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: C.wrong, lineHeight: 1.3 }}>
                  Not quite — read the <span style={{ color: C.text }}>highlighted part</span> again.<br />
                  <span style={{ color: C.text }}>What did Maya do when she saw the rain?</span>
                </div>
              </div>
            )}

            {/* Passage card */}
            <div style={{
              background: C.card2, borderRadius: 16,
              border: `2px solid ${state === "correct" ? C.correctGreen : "#2a4040"}`,
              padding: "16px 18px",
            }}>
              <div style={{
                fontSize: "0.78rem", fontWeight: 900,
                color: state === "correct" ? C.correctGreen : C.mint,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
              }}>{PASSAGE.title}</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: C.text, lineHeight: 1.65 }}>
                {PASSAGE.sentences.map((s, i) => (
                  <span key={i} style={s.key ? {
                    background: state === "correct" ? "rgba(80,232,144,0.2)" : "rgba(88,232,193,0.15)",
                    borderRadius: 4, padding: "1px 3px",
                  } : {}}>
                    {s.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Question */}
            <div style={{ fontSize: "0.72rem", fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Question
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 900, color: C.text, lineHeight: 1.4 }}>
              {PASSAGE.question}
            </div>

            {/* Answer choices */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PASSAGE.choices.map((choice, idx) => {
                const isSelected = selected === choice.id;
                let bg = C.card2;
                let borderColor = "#2a4040";
                let color = C.text;
                let opacity = 1;
                let pointerEvents: React.CSSProperties["pointerEvents"] = "auto";

                if (state === "correct") {
                  if (choice.correct) { bg = C.correctBg; borderColor = C.correctGreen; color = C.correctGreen; }
                  else { opacity = 0.35; pointerEvents = "none"; }
                } else if (state === "wrong" && isSelected) {
                  bg = C.wrongBg; borderColor = C.wrong;
                }

                return (
                  <button key={choice.id} onClick={() => handleChoice(choice.id, choice.correct)} style={{
                    width: "100%", padding: "12px 14px",
                    background: bg, border: `2px solid ${borderColor}`,
                    borderRadius: 12, cursor: "pointer", textAlign: "left",
                    ...FONT, fontSize: "0.88rem", fontWeight: 700, color, lineHeight: 1.4,
                    opacity, pointerEvents, transition: "all 0.15s",
                  }}>
                    {choice.correct && state === "correct" ? `${choice.text} ✓` : choice.text}
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
                Next Passage ✨ +1⭐
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
                  }}>📖 Re-read</button>
                  <button style={{
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
