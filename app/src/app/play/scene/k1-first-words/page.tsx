"use client";

import { useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  borderLight: "#2a2050",
  violet: "#9b72ff",
  violetDimBg: "rgba(155,114,255,0.08)",
  violetDimBorder: "rgba(155,114,255,0.2)",
  gold: "#ffd166",
  correctMint: "#50e890",
  correctBg: "#0d2a1a",
  coral: "#ff7b6b",
  wrongBg: "#2a0e0e",
  text: "#f0eaff",
  muted: "#8b7fb8",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

// ─── Stub data ─────────────────────────────────────────────────────────────────
const QUESTION = {
  questName: "First Words Quest",
  totalSegs: 5,
  doneSegs: 2,
  stars: 11,
  word: "jump",
  coachActive: "Read the word — then tap its picture! Take your time — say each letter sound.",
  coachPhonics: "Read the word — then tap its picture!",
  coachCorrect: "J-U-M-P says \"jump\" — and you knew it! That's real reading!",
  coachCorrectPhonics: "✨ You READ that word!",
  wrongBannerText: "Not quite — look at the word again.",
  wrongBannerSub: "Sound out each letter: j… u… m… p… What does it say?",
  choices: [
    { emoji: "😴", label: "sleep", correct: false },
    { emoji: "🏃", label: "run", correct: false },
    { emoji: "🐸", label: "jump", correct: true },
    { emoji: "🍎", label: "eat", correct: false },
  ],
};

type SceneState = "question" | "correct" | "wrong";

function ProgressStrip({ total, done }: { total: number; done: number }) {
  return (
    <div style={{
      display: "flex",
      gap: 3,
      padding: "10px 16px",
      background: C.card,
      flexShrink: 0,
      borderBottom: `1px solid ${C.borderLight}`,
    }}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < done;
        const isActive = i === done;
        let bg = `rgba(155,114,255,0.2)`;
        if (isDone) bg = C.violet;
        else if (isActive) bg = "rgba(155,114,255,0.6)";
        return (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: bg }} />
        );
      })}
    </div>
  );
}

export default function K1FirstWordsScenePage() {
  const [sceneState, setSceneState] = useState<SceneState>("question");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [stars, setStars] = useState(QUESTION.stars);

  function handleChoice(idx: number, correct: boolean) {
    if (sceneState !== "question") return;
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
    setSceneState("question");
  }

  function switchState(s: SceneState) {
    setSceneState(s);
    if (s === "correct") {
      setSelectedIdx(2); // jump
      setStars(QUESTION.stars + 1);
    } else if (s === "wrong") {
      setSelectedIdx(0); // sleep
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
        @keyframes wq-violet-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(155,114,255,0.3), 0 0 30px rgba(155,114,255,0.1); }
          50% { box-shadow: 0 0 24px rgba(155,114,255,0.6), 0 0 50px rgba(155,114,255,0.25); }
        }
        @keyframes wq-correct-glow {
          0% { box-shadow: 0 0 0 rgba(80,232,144,0); }
          50% { box-shadow: 0 0 40px rgba(80,232,144,0.6); }
          100% { box-shadow: 0 0 20px rgba(80,232,144,0.3); }
        }
        @keyframes wq-obj-pop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes wq-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-7px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes wq-star-bump {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: 20, color: C.text }}>

        {/* Dev state switcher */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, justifyContent: "center", marginBottom: 24 }}>
          {(["question", "correct", "wrong"] as SceneState[]).map((s) => (
            <button
              key={s}
              onClick={() => switchState(s)}
              style={{
                ...FONT,
                padding: "8px 18px",
                borderRadius: 20,
                border: `2px solid ${sceneState === s ? C.violet : "#3a3060"}`,
                background: sceneState === s ? C.violet : C.card,
                color: sceneState === s ? "#fff" : C.muted,
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {s === "question" ? `Active (Read "jump")` : s === "correct" ? "Correct" : "Wrong"}
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
          boxShadow: `0 0 0 2px rgba(155,114,255,0.13), 0 30px 80px rgba(0,0,0,0.7)`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          margin: "0 auto",
        }}>

          {/* Status bar */}
          <div style={{
            height: 36,
            background: C.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            fontSize: "0.7rem",
            color: C.muted,
            fontWeight: 700,
            flexShrink: 0,
            borderBottom: `1px solid ${C.borderLight}`,
          }}>
            <span>9:41</span>
            <span>⭐ {stars}</span>
          </div>

          {/* Top bar */}
          <div style={{
            background: C.card,
            padding: "10px 16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            borderBottom: `1px solid ${C.borderLight}`,
          }}>
            <Link
              href="/play"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(155,114,255,0.12)",
                color: C.violet,
                fontSize: "1.1rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ←
            </Link>
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.text }}>{QUESTION.questName}</span>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(155,114,255,0.15)",
              padding: "4px 10px",
              borderRadius: 12,
              border: "1px solid rgba(155,114,255,0.3)",
              fontSize: "0.85rem",
              fontWeight: 900,
              color: C.violet,
              animation: sceneState === "correct" ? "wq-star-bump 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none",
            }}>
              ⭐ {stars}
            </div>
          </div>

          {/* Progress strip */}
          <ProgressStrip total={QUESTION.totalSegs} done={doneSegs} />

          {/* Scene body */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "18px 20px 12px",
            gap: 14,
            overflowY: "auto" as const,
          }}>

            {/* Wrong banner */}
            {sceneState === "wrong" && (
              <div style={{
                background: C.wrongBg,
                border: `2px solid ${C.coral}`,
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}>
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>📖</span>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.coral, lineHeight: 1.3 }}>
                    {QUESTION.wrongBannerText}
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.3 }}>
                    {QUESTION.wrongBannerSub}
                  </div>
                </div>
              </div>
            )}

            {/* Coach inline */}
            {sceneState !== "wrong" && (
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: sceneState === "correct" ? C.correctBg : C.violetDimBg,
                borderRadius: 14,
                padding: "12px 14px",
                border: `1px solid ${sceneState === "correct" ? C.correctMint : C.violetDimBorder}`,
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2a1858, rgba(155,114,255,0.27))",
                  border: `2px solid ${sceneState === "correct" ? C.correctMint : C.violet}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}>
                  🦁
                </div>
                <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  {sceneState === "correct" ? (
                    <>
                      <span style={{ color: C.correctMint, fontSize: "1rem" }}>{QUESTION.coachCorrectPhonics}<br /></span>
                      {QUESTION.coachCorrect}
                    </>
                  ) : (
                    <>
                      <span style={{ color: C.violet, fontSize: "1rem", fontWeight: 900 }}>{QUESTION.coachPhonics}<br /></span>
                      Take your time — say each letter sound.
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Word hero */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                width: 280,
                height: 120,
                background: sceneState === "correct" ? C.correctBg : C.card2,
                borderRadius: 20,
                border: `3px solid ${sceneState === "correct" ? C.correctMint : C.violet}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: sceneState === "correct" ? "wq-correct-glow 0.6s ease-out" : "wq-violet-glow 2.5s ease-in-out infinite",
              }}>
                <span style={{
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  fontSize: "3.2rem",
                  fontWeight: 900,
                  color: sceneState === "correct" ? C.correctMint : C.text,
                  letterSpacing: "0.02em",
                }}>
                  {QUESTION.word}
                </span>
              </div>
            </div>

            {/* Scene question */}
            <div style={{
              textAlign: "center",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: sceneState === "correct" ? C.correctMint : C.muted,
            }}>
              {sceneState === "correct" ? `✓ jump = 🐸 You got it!` : "Tap the picture that matches the word"}
            </div>

            {/* Answer grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {QUESTION.choices.map((choice, idx) => {
                const isSelected = selectedIdx === idx;

                let borderColor = "#3a3060";
                let bg = C.card2;
                let labelColor = C.muted;
                let opacity: number | undefined = undefined;
                let anim = `wq-obj-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.05 * (idx + 1)}s backwards`;

                if (sceneState === "correct") {
                  if (choice.correct) {
                    borderColor = C.correctMint;
                    bg = C.correctBg;
                    labelColor = C.correctMint;
                    anim = "none";
                  } else {
                    opacity = 0.35;
                    anim = "none";
                  }
                } else if (sceneState === "wrong" && isSelected) {
                  borderColor = C.coral;
                  bg = C.wrongBg;
                  anim = "wq-shake 0.5s ease-out";
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleChoice(idx, choice.correct)}
                    role="button"
                    tabIndex={0}
                    style={{
                      background: bg,
                      border: `3px solid ${borderColor}`,
                      borderRadius: 16,
                      cursor: sceneState === "question" ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "14px 10px 10px",
                      gap: 6,
                      transition: "all 0.15s",
                      animation: anim,
                      opacity,
                    }}
                  >
                    <span style={{ fontSize: "2.2rem" }}>{choice.emoji}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 900, color: labelColor }}>
                      {choice.correct && sceneState === "correct" ? `${choice.label} ✓` : choice.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "12px 16px 20px",
            background: C.card,
            borderTop: `1px solid #2a2050`,
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
                  width: "100%",
                  padding: 14,
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #9b72ff, #7248e8)",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Next Word ✨ +1⭐
              </button>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "🔊 Replay", bg: "#2a2050", color: C.violet, border: "1px solid #3a3060" },
                    { label: "💡 Hint", bg: "rgba(155,114,255,0.1)", color: C.violet, border: "1px solid rgba(155,114,255,0.25)" },
                    { label: "🤷 IDK yet", bg: "transparent", color: C.coral, border: `2px solid rgba(255,123,107,0.3)` },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      style={{
                        ...FONT,
                        flex: 1,
                        padding: "10px 6px",
                        borderRadius: 12,
                        border: btn.border,
                        background: btn.bg,
                        color: btn.color,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
                <div style={{
                  background: "#1a2a15",
                  border: `2px solid ${C.correctMint}`,
                  borderRadius: 12,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: C.correctMint,
                  justifyContent: "center",
                }}>
                  ⭐ {sceneState === "wrong" ? "Stars are safe — no star lost!" : "Stars are safe — keep trying!"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back nav */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link
            href="/play"
            style={{
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
            }}
          >
            ← Play
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
