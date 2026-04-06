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

// ─── Stub content (G4-5 reading wrong state) ─────────────────────────────────
const STUB = {
  questName: "Reading Quest",
  totalSegs: 5,
  doneSegs: 3,
  stars: 41,
  wrongIcon: "🔍",
  wrongHeadline: "Not quite — look at the clues.",
  wrongHint: "What do Dani's actions (slow walk, eyes down, not eating) tell you about how she felt?",
  coachAccent: "Inference",
  coachHint: " = reading clues to figure out what isn't stated directly.",
  question: "How was Dani most likely feeling after seeing the results?",
  choices: [
    "She was bored and wanted to go home.",
    "She was excited and couldn't wait to tell her parents.",
    "She was upset or disappointed about the results.",
    "She was confused about what the results meant.",
  ],
  correctChoice: 2,
  wrongChoice: 0, // pre-selected stub wrong answer
};

type PageState = "wrong" | "retry" | "correct";

function ProgressStrip({ total, done }: { total: number; done: number }) {
  return (
    <div style={{
      display: "flex", gap: 3, padding: "10px 16px",
      background: C.card, borderBottom: "1px solid #2a1818",
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 6, borderRadius: 3,
          background: i < done
            ? C.coral
            : i === done
            ? "rgba(255,123,107,0.5)"
            : "rgba(255,123,107,0.15)",
        }} />
      ))}
    </div>
  );
}

export default function PlayWrongPage() {
  const [pageState, setPageState] = useState<PageState>("wrong");
  const [selected, setSelected] = useState<number | null>(STUB.wrongChoice);

  const handleRetry = () => {
    setPageState("retry");
    setSelected(null);
  };

  const handleChoice = (idx: number) => {
    if (pageState !== "retry") return;
    setSelected(idx);
    if (idx === STUB.correctChoice) {
      setPageState("correct");
    } else {
      setPageState("wrong");
    }
  };

  const handleNext = () => {
    setPageState("wrong");
    setSelected(STUB.wrongChoice);
  };

  const stars = pageState === "correct" ? STUB.stars + 1 : STUB.stars;

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <style>{`
          @keyframes acShake { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-8px); } 40% { transform:translateX(8px); } 60% { transform:translateX(-5px); } 80% { transform:translateX(5px); } }
          @keyframes slideIn { 0% { opacity:0; transform:translateX(-10px); } 100% { opacity:1; transform:translateX(0); } }
        `}</style>

        {/* Phone frame */}
        <div style={{
          width: 390, minHeight: 720, background: C.bg,
          borderRadius: 40, border: `2px solid ${C.border}`,
          boxShadow: "0 0 0 2px rgba(255,123,107,0.13), 0 30px 80px rgba(0,0,0,0.7)",
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
            borderBottom: "1px solid #2a1818",
          }}>
            <button style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,123,107,0.12)", border: "none",
              color: C.coral, fontSize: "1.1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.text }}>{STUB.questName}</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(255,123,107,0.12)", padding: "4px 10px",
              borderRadius: 12, border: "1px solid rgba(255,123,107,0.3)",
              fontSize: "0.85rem", fontWeight: 900, color: C.coral,
            }}>⭐ {stars}</div>
          </div>

          {/* Progress strip */}
          <ProgressStrip total={STUB.totalSegs} done={STUB.doneSegs} />

          {/* Scene body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 18px 12px", gap: 13, overflowY: "auto" }}>

            {/* Wrong banner — shown on wrong state */}
            {pageState === "wrong" && (
              <div style={{
                borderRadius: 14, padding: "13px 14px",
                display: "flex", alignItems: "flex-start", gap: 10,
                border: `2px solid ${C.wrong}`, background: C.wrongBg,
              }}>
                <div style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}>{STUB.wrongIcon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.92rem", fontWeight: 900, color: C.wrong, marginBottom: 3 }}>
                    {STUB.wrongHeadline}
                  </div>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                    {STUB.wrongHint}
                  </div>
                </div>
              </div>
            )}

            {/* Correct banner — shown on correct state */}
            {pageState === "correct" && (
              <div style={{
                borderRadius: 14, padding: "13px 14px",
                display: "flex", alignItems: "flex-start", gap: 10,
                border: `2px solid ${C.correctGreen}`, background: C.correctBg,
              }}>
                <div style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}>✨</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.92rem", fontWeight: 900, color: C.correctGreen, marginBottom: 3 }}>
                    You got it — great inference!
                  </div>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                    Dani's actions (slow walk, eyes down, not eating) are all clues that show she was upset or disappointed.
                  </div>
                </div>
              </div>
            )}

            {/* Coach inline — shown on wrong or retry */}
            {(pageState === "wrong" || pageState === "retry") && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,123,107,0.06)", borderRadius: 12,
                padding: "10px 12px", border: "1px solid rgba(255,123,107,0.15)",
              }}>
                <div style={{
                  fontSize: "1rem", width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(255,123,107,0.1)", border: "1px solid rgba(255,123,107,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>🦁</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: C.muted, lineHeight: 1.35 }}>
                  <span style={{ color: C.coral, fontWeight: 900 }}>{STUB.coachAccent}</span>
                  {STUB.coachHint}
                </div>
              </div>
            )}

            {/* Question */}
            <div style={{ fontSize: "0.92rem", fontWeight: 900, color: C.text, lineHeight: 1.4 }}>
              {STUB.question}
            </div>

            {/* Answer choices */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STUB.choices.map((choice, i) => {
                const isWrongSelected = pageState === "wrong" && i === selected;
                const isCorrectSelected = pageState === "correct" && i === STUB.correctChoice;
                const isDimmed = pageState === "correct" && i !== STUB.correctChoice;

                let bg = C.card2;
                let borderColor = "#3a3060";
                let color = C.text;
                let opacity = 1;
                let pointerEvents: React.CSSProperties["pointerEvents"] = "auto";
                let animStyle: string | undefined = `slideIn 0.35s ease-out ${(i + 1) * 0.04}s backwards`;

                if (isWrongSelected) {
                  bg = C.wrongBg; borderColor = C.wrong;
                  animStyle = "acShake 0.5s ease-out";
                } else if (isCorrectSelected) {
                  bg = C.correctBg; borderColor = C.correctGreen; color = C.correctGreen;
                  animStyle = undefined;
                } else if (isDimmed) {
                  opacity = 0.35; pointerEvents = "none";
                }

                return (
                  <div
                    key={i}
                    onClick={() => handleChoice(i)}
                    style={{
                      background: bg, border: `3px solid ${borderColor}`,
                      borderRadius: 14, cursor: pageState === "retry" ? "pointer" : "default",
                      display: "flex", flexDirection: "row",
                      alignItems: "center", justifyContent: "flex-start",
                      padding: "11px 12px", minHeight: 52,
                      opacity, pointerEvents,
                      animation: animStyle,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "0.84rem", fontWeight: 700, color, lineHeight: 1.4 }}>
                      {choice}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "12px 16px 20px", background: C.card,
            borderTop: "1px solid #2a2050", display: "flex", flexDirection: "column", gap: 8,
          }}>
            {pageState === "correct" ? (
              <button onClick={handleNext} style={{
                width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #ff7b6b, #d04a38)",
                color: "white", ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Next Question ✨ +1⭐
              </button>
            ) : pageState === "wrong" ? (
              <>
                <button onClick={handleRetry} style={{
                  width: "100%", padding: 14, borderRadius: 14, border: "none",
                  background: "rgba(255,123,107,0.15)",
                  color: C.coral, ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  borderWidth: 2, borderStyle: "solid", borderColor: "rgba(255,123,107,0.4)",
                }}>
                  Try Again — I've got this!
                </button>
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
                  ⭐ Stars are safe — no star lost!
                </div>
              </>
            ) : (
              /* retry state */
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
                  ⭐ Stars are safe — keep trying!
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
