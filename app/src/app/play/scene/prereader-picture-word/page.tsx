"use client";

import { useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  gold: "#ffd166",
  goldDark: "#1a0c00",
  violet: "#9b72ff",
  text: "#f0eaff",
  muted: "#8b7fb8",
  correct: "#50e890",
  correctBg: "#0d2a1a",
  wrong: "#ff7b6b",
  wrongBg: "#2a0e0e",
  topbar1: "#2a1800",
  topbar2: "#1a0c00",
};

type SceneState = "active" | "correct" | "wrong";

const QUESTION = {
  questName: "Words Quest",
  totalSegs: 6,
  doneSegs: 3,
  stars: 6,
  heroEmoji: "🐶",
  coachActive: { phonics: "Duh-duh-dog!", prompt: "Which word says what this picture is?" },
  coachCorrect: "Yes! D-O-G spells dog! You matched the picture to its word — that's reading!",
  choices: [
    { word: "cat", emoji: "🐱", correct: false },
    { word: "dog", emoji: "🐶", correct: true },
    { word: "sun", emoji: "☀️", correct: false },
    { word: "hat", emoji: "🎩", correct: false },
  ],
};

export default function PrereaderPictureWordScenePage() {
  const [sceneState, setSceneState] = useState<SceneState>("active");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [stars, setStars] = useState(QUESTION.stars);

  function handleChoice(idx: number, correct: boolean) {
    if (sceneState !== "active") return;
    setSelectedIdx(idx);
    if (correct) {
      setStars((s) => s + 1);
      setSceneState("correct");
    } else {
      setSceneState("wrong");
    }
  }

  function handleRetry() {
    setSelectedIdx(null);
    setSceneState("active");
  }

  function switchState(s: SceneState) {
    setSceneState(s);
    if (s === "correct") {
      setSelectedIdx(1);
      setStars(QUESTION.stars + 1);
    } else if (s === "wrong") {
      setSelectedIdx(0);
      setStars(QUESTION.stars);
    } else {
      setSelectedIdx(null);
      setStars(QUESTION.stars);
    }
  }

  const doneSegs = sceneState === "correct" ? QUESTION.doneSegs + 1 : QUESTION.doneSegs;

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes wq-letter-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(255,209,102,0.4), 0 0 30px rgba(255,209,102,0.15); }
          50% { box-shadow: 0 0 24px rgba(255,209,102,0.7), 0 0 50px rgba(255,209,102,0.3); }
        }
        @keyframes wq-obj-pop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes wq-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes wq-seg-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: 20, color: C.text }}>

        {/* Dev state switcher */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, justifyContent: "center", marginBottom: 24 }}>
          {(["active", "correct", "wrong"] as SceneState[]).map((s) => (
            <button
              key={s}
              onClick={() => switchState(s)}
              style={{
                ...FONT,
                padding: "8px 18px",
                borderRadius: 20,
                border: `2px solid ${sceneState === s ? C.gold : "#3a3060"}`,
                background: sceneState === s ? C.gold : C.card,
                color: sceneState === s ? C.goldDark : C.muted,
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {s === "active" ? "Active (Match the Dog)" : s === "correct" ? "Correct" : "Wrong"}
            </button>
          ))}
        </div>

        {/* Phone frame */}
        <div style={{
          width: 390,
          minHeight: 780,
          background: C.bg,
          borderRadius: 40,
          border: `2px solid #3a3060`,
          boxShadow: "0 0 0 1px #9b72ff22, 0 30px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}>

          {/* Status bar */}
          <div style={{
            height: 36,
            background: `linear-gradient(135deg, ${C.topbar1}, ${C.topbar2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            fontSize: "0.7rem",
            color: C.gold,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            <span>9:41</span>
            <span>⭐ {stars}</span>
          </div>

          {/* Top bar */}
          <div style={{
            background: `linear-gradient(135deg, ${C.topbar1}, ${C.topbar2})`,
            padding: "10px 16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            borderBottom: "1px solid #3a2000",
          }}>
            <Link href="/play" style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,209,102,0.12)",
              border: "none",
              color: C.gold,
              fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
            }}>←</Link>
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.gold }}>{QUESTION.questName}</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(255,209,102,0.15)",
              padding: "4px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,209,102,0.3)",
              fontSize: "0.85rem", fontWeight: 900, color: C.gold,
            }}>
              ⭐ {stars}
            </div>
          </div>

          {/* Progress strip */}
          <div style={{
            display: "flex", gap: 3, padding: "10px 16px",
            background: `linear-gradient(135deg, ${C.topbar1}, ${C.topbar2})`,
            flexShrink: 0,
          }}>
            {Array.from({ length: QUESTION.totalSegs }).map((_, i) => {
              const isDone = i < doneSegs;
              const isActive = i === doneSegs;
              let bg = "rgba(255,209,102,0.2)";
              if (isDone) bg = C.gold;
              else if (isActive) bg = "rgba(255,209,102,0.7)";
              return (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 6, borderRadius: 3, background: bg,
                    animation: isActive && sceneState === "active" ? "wq-seg-pulse 1.5s ease-in-out infinite" : "none",
                  }}
                />
              );
            })}
          </div>

          {/* Scene body */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            padding: "18px 20px 12px", gap: 16, overflowY: "auto",
          }}>

            {/* Wrong banner */}
            {sceneState === "wrong" && (
              <div style={{
                background: C.wrongBg, border: `2px solid ${C.wrong}`,
                borderRadius: 12, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: "1.4rem" }}>🐶</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.wrong, lineHeight: 1.3 }}>
                  Not quite — look at the picture.{" "}
                  <span style={{ color: C.text }}>Say the name out loud, then find the right word!</span>
                </div>
              </div>
            )}

            {/* Coach row (active and correct states) */}
            {sceneState !== "wrong" && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: sceneState === "correct" ? C.correctBg : C.card,
                borderRadius: 14,
                padding: "12px 14px",
                border: `1px solid ${sceneState === "correct" ? C.correct : "#3a3060"}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #2a1800, #ffd16644)",
                  border: `2px solid ${sceneState === "correct" ? C.correct : C.gold}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem", flexShrink: 0,
                }}>🦁</div>
                <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  {sceneState === "correct" ? (
                    <span style={{ color: C.correct, fontSize: "1rem" }}>✨ Yes! D-O-G spells dog!</span>
                  ) : (
                    <><span style={{ color: C.gold, fontSize: "1rem", fontWeight: 900 }}>{QUESTION.coachActive.phonics}</span><br />{QUESTION.coachActive.prompt}</>
                  )}
                  {sceneState === "correct" && (
                    <><br />You matched the picture to its word — that&apos;s reading!</>
                  )}
                </div>
              </div>
            )}

            {/* Picture hero */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                width: 160, height: 160,
                background: sceneState === "correct" ? C.correctBg : C.card,
                borderRadius: 20,
                border: `3px solid ${sceneState === "correct" ? C.correct : C.gold}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                animation: sceneState === "correct" ? "none" : "wq-letter-glow 2s ease-in-out infinite",
                gap: 6,
              }}>
                <span style={{ fontSize: 72, lineHeight: 1 }}>{QUESTION.heroEmoji}</span>
              </div>
            </div>

            {/* Prompt */}
            <div style={{ textAlign: "center", fontSize: "1rem", fontWeight: 700, color: C.text }}>
              {sceneState === "correct" ? (
                <span style={{ color: C.correct, fontSize: "1.15rem" }}>✓ dog</span>
              ) : (
                "Tap the word that matches the picture"
              )}
            </div>

            {/* Word choices */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {QUESTION.choices.map((choice, idx) => {
                const isSelected = selectedIdx === idx;
                let borderColor = "#3a3060";
                let bg = C.card2;
                let color = C.text;
                let anim = `wq-obj-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.05 * (idx + 1)}s backwards`;
                let opacity: number | undefined = undefined;
                let pointerEvents: "none" | "auto" = "auto";

                if (sceneState === "correct") {
                  if (choice.correct) {
                    bg = C.correctBg;
                    borderColor = C.correct;
                    color = C.correct;
                    anim = "none";
                  } else {
                    opacity = 0.35;
                    anim = "none";
                    pointerEvents = "none";
                  }
                } else if (sceneState === "wrong" && isSelected) {
                  bg = C.wrongBg;
                  borderColor = C.wrong;
                  anim = "wq-shake 0.5s ease-out";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleChoice(idx, choice.correct)}
                    style={{
                      ...FONT,
                      padding: "18px 10px",
                      background: bg,
                      border: `3px solid ${borderColor}`,
                      borderRadius: 16,
                      cursor: sceneState === "active" ? "pointer" : "default",
                      fontSize: "1.4rem",
                      fontWeight: 900,
                      color,
                      textAlign: "center",
                      lineHeight: 1.2,
                      animation: anim,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      opacity,
                      pointerEvents,
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>
                      {choice.correct && sceneState === "correct" ? `${choice.word} ✓` : choice.word}
                    </span>
                    {sceneState !== "correct" && (
                      <span style={{ fontSize: "0.9rem", opacity: 0.5 }}>{choice.emoji}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "12px 16px 20px",
            background: C.card,
            borderTop: "1px solid #2a2050",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {sceneState === "correct" ? (
              <button
                onClick={handleRetry}
                style={{
                  ...FONT,
                  width: "100%", padding: 14, borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #ffd166, #f0a000)",
                  color: C.goldDark,
                  fontSize: "1rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                Next Word ✨ +1⭐
              </button>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{
                    ...FONT, flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "#2a2050", color: C.violet,
                    border: "1px solid #3a3060",
                    fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  } as React.CSSProperties}>
                    🔊 Replay
                  </button>
                  <button style={{
                    ...FONT, flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "rgba(255,209,102,0.1)", color: C.gold,
                    border: "1px solid rgba(255,209,102,0.25)",
                    fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  } as React.CSSProperties}>
                    💡 Hint
                  </button>
                  <button style={{
                    ...FONT, flex: 1, padding: "10px 6px", borderRadius: 12,
                    background: "transparent", color: C.wrong,
                    border: `2px solid rgba(255,123,107,0.3)`,
                    fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                    🤷 IDK yet
                  </button>
                </div>
                <div style={{
                  background: "#1a2a15", border: "2px solid #50e890",
                  borderRadius: 12, padding: "8px 12px",
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: "0.78rem", fontWeight: 700, color: "#50e890", justifyContent: "center",
                }}>
                  {sceneState === "wrong" ? "⭐ Stars are safe — no star lost!" : "⭐ Stars are safe — keep trying!"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back nav */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/play" style={{
            ...FONT,
            display: "inline-block",
            background: C.card,
            border: `2px solid ${C.border}`,
            borderRadius: 10,
            color: C.muted,
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 20px",
            textDecoration: "none",
          }}>
            ← Play
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
