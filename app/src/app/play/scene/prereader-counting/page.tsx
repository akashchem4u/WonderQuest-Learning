"use client";

import { useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0820",
  surface: "#12103a",
  card: "#1a1540",
  border: "#2a2060",
  borderLight: "#1a1540",
  // Pre-K gold theme
  gold: "#ffd166",
  goldDim: "#c4a840",
  goldDark: "#1a0c00",
  topbarBg1: "#2a1800",
  topbarBg2: "#1a0c00",
  topbarBorder: "#3a2400",
  progBg: "#2a1800",
  // Correct / wrong
  correctMint: "#50e890",
  correctBg: "#1a3a20",
  coral: "#ff7b6b",
  wrongBg: "#2a1010",
  // Text
  text: "#e8e0ff",
  muted: "#9b8ec4",
  coachText: "#c4b0ff",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const QUESTION = {
  questName: "Count the Stars!",
  questSub: "Forest Glen · Node 3",
  totalSegs: 7,
  doneSegs: 4,
  stars: 9,
  objects: ["⭐", "⭐", "⭐", "⭐", "⭐"],
  correctAnswer: 5,
  prompt: "Count the stars!",
  sub: "How many stars are there? Pick the number.",
  subWrong: "Touch each star and count out loud — 1, 2, 3...",
  coachActive: "Count them one by one! Touch each star as you go! ✨",
  coachCorrect: "One-two-three-four-FIVE! You're a counting champion! 🏆",
  coachWrong: "Let's count together: point to each one! One... two... three... four... five! 🖐️",
  numbers: [3, 4, 5, 6],
};

type SceneState = "question" | "correct" | "wrong";

function ProgressStrip({ total, done, state }: { total: number; done: number; state: SceneState }) {
  return (
    <div style={{ display: "flex", gap: 3, padding: "8px 20px", background: C.topbarBg2, borderBottom: `1px solid ${C.topbarBg1}`, flexShrink: 0 }}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < done;
        const isActive = i === done;
        let bg = C.progBg;
        if (isDone) bg = C.gold;
        else if (isActive && state === "correct") bg = C.gold;
        else if (isActive && state === "wrong") bg = "rgba(255,123,107,0.27)";
        else if (isActive) bg = "#f0a000";
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: bg,
              animation: isActive && state === "question" ? "wq-seg-pulse 1.5s ease-in-out infinite" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

export default function PrereaderCountingScenePage() {
  const [sceneState, setSceneState] = useState<SceneState>("question");
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [stars, setStars] = useState(QUESTION.stars);

  function handleNumClick(num: number) {
    if (sceneState !== "question") return;
    setSelectedNum(num);
    if (num === QUESTION.correctAnswer) {
      setStars((s) => s + 1);
      setSceneState("correct");
    } else {
      setSceneState("wrong");
    }
  }

  function handleRetry() {
    setSelectedNum(null);
    setSceneState("question");
  }

  function switchState(s: SceneState) {
    setSceneState(s);
    if (s === "correct") {
      setSelectedNum(QUESTION.correctAnswer);
      setStars(QUESTION.stars + 1);
    } else if (s === "wrong") {
      setSelectedNum(4);
      setStars(QUESTION.stars);
    } else {
      setSelectedNum(null);
      setStars(QUESTION.stars);
    }
  }

  const doneSegs = sceneState === "correct" ? QUESTION.doneSegs + 1 : QUESTION.doneSegs;

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes wq-seg-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes wq-obj-pop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes wq-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes wq-star-bump {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div style={{ ...FONT, background: C.bg, minHeight: "100vh", padding: "24px 16px", color: C.text }}>

        {/* Dev state switcher */}
        <div style={{ display: "flex", gap: 8, maxWidth: 900, margin: "0 auto 18px", flexWrap: "wrap" as const }}>
          {(["question", "correct", "wrong"] as SceneState[]).map((s) => (
            <button
              key={s}
              onClick={() => switchState(s)}
              style={{
                ...FONT,
                background: sceneState === s ? C.gold : C.card,
                border: `2px solid ${sceneState === s ? C.gold : C.border}`,
                borderRadius: 8,
                color: sceneState === s ? C.goldDark : C.muted,
                fontSize: 13,
                fontWeight: 700,
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              {s === "question" ? "Active (Count 5)" : s === "correct" ? "Correct!" : "Wrong (Gentle)"}
            </button>
          ))}
          <div style={{ fontSize: 11, color: C.muted, alignSelf: "center", marginLeft: 8 }}>
            Dev switcher
          </div>
        </div>

        {/* Scene card */}
        <div style={{
          background: C.surface,
          border: `2px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
          maxWidth: 900,
          margin: "0 auto",
        }}>

          {/* Top bar — Pre-K gold */}
          <div style={{
            background: `linear-gradient(135deg, ${C.topbarBg1}, ${C.topbarBg2})`,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${C.topbarBorder}`,
          }}>
            <Link
              href="/play"
              style={{
                ...FONT,
                background: "rgba(255,209,102,0.15)",
                border: `1.5px solid ${C.gold}`,
                borderRadius: 8,
                color: C.gold,
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              ← Home
            </Link>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff8e0" }}>{QUESTION.questName}</div>
              <div style={{
                fontSize: 10,
                color: sceneState === "correct" ? C.correctMint : C.goldDim,
                marginTop: 1,
              }}>
                {sceneState === "correct" ? "Q5 ✓ You got it!" : sceneState === "wrong" ? "Try again!" : `${QUESTION.questSub} · Q5`}
              </div>
            </div>
            <div style={{
              fontSize: 13,
              fontWeight: 900,
              color: sceneState === "correct" ? C.correctMint : C.gold,
              animation: sceneState === "correct" ? "wq-star-bump 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none",
            }}>
              🌟 {stars}{sceneState === "correct" ? " +1!" : ""}
            </div>
          </div>

          {/* Progress strip */}
          <ProgressStrip total={QUESTION.totalSegs} done={doneSegs} state={sceneState} />

          {/* Scene area */}
          <div style={{
            padding: "32px 40px 24px",
            textAlign: "center",
            background: sceneState === "correct"
              ? "radial-gradient(ellipse at 50% 30%, rgba(80,232,144,0.08) 0%, transparent 70%)"
              : "linear-gradient(180deg, #100b2e 0%, #12103a 100%)",
          }}>

            {/* Q label */}
            <div style={{
              fontSize: 11,
              fontWeight: 900,
              color: sceneState === "correct" ? C.correctMint : sceneState === "wrong" ? C.coral : C.goldDim,
              textTransform: "uppercase" as const,
              letterSpacing: "1.5px",
              marginBottom: 14,
            }}>
              {sceneState === "correct" ? "✓ That's right!" : sceneState === "wrong" ? "Not quite — give it another try!" : "How many do you see?"}
            </div>

            {/* Correct: large numeral */}
            {sceneState === "correct" && (
              <>
                <div style={{
                  fontSize: 80,
                  fontWeight: 900,
                  color: C.gold,
                  marginBottom: 8,
                  lineHeight: 1,
                  textShadow: "0 0 30px rgba(255,209,102,0.4)",
                }}>
                  5
                </div>
                <div style={{ marginBottom: 16, fontSize: 18, color: C.correctMint, fontWeight: 900 }}>
                  There are 5 stars! 🎉
                </div>
              </>
            )}

            {/* Object grid */}
            <div style={{
              display: "flex",
              flexWrap: "wrap" as const,
              gap: 10,
              justifyContent: "center",
              marginBottom: 20,
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
            }}>
              {QUESTION.objects.map((obj, i) => (
                <div
                  key={i}
                  style={{
                    width: 60,
                    height: 60,
                    background: sceneState === "correct"
                      ? "linear-gradient(135deg, #ffd166, #f0a000)"
                      : "linear-gradient(135deg, #2a2010, #3a2a00)",
                    border: `3px solid ${C.gold}`,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    animation: `wq-obj-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${0.05 * (i + 1)}s both`,
                  }}
                >
                  {obj}
                </div>
              ))}
            </div>

            {/* Prompt */}
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 6 }}>
              {QUESTION.prompt}
            </div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
              {sceneState === "wrong" ? QUESTION.subWrong : QUESTION.sub}
            </div>

            {/* Wrong banner */}
            {sceneState === "wrong" && (
              <div style={{
                background: C.wrongBg,
                border: `1.5px solid rgba(255,123,107,0.27)`,
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 13,
                color: C.coral,
                fontWeight: 700,
                textAlign: "center",
                marginBottom: 10,
              }}>
                That wasn&apos;t it! Touch each star and count — you can do it! 🌟
              </div>
            )}

            {/* Number buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16, marginTop: sceneState === "correct" ? 8 : 0 }}>
              {QUESTION.numbers.map((num) => {
                const isSelected = selectedNum === num;
                const isCorrectNum = num === QUESTION.correctAnswer;

                let bg = C.card;
                let borderColor = C.border;
                let color = C.text;
                let anim = "none";
                let opacity: number | undefined = undefined;

                if (sceneState === "correct") {
                  if (isCorrectNum) {
                    bg = C.correctBg;
                    borderColor = C.correctMint;
                    color = C.correctMint;
                  } else {
                    opacity = 0.4;
                  }
                } else if (sceneState === "wrong" && isSelected) {
                  bg = C.wrongBg;
                  borderColor = C.coral;
                  color = C.coral;
                  anim = "wq-shake 0.4s";
                }

                return (
                  <div
                    key={num}
                    onClick={() => handleNumClick(num)}
                    role="button"
                    tabIndex={0}
                    style={{
                      width: 70,
                      height: 70,
                      background: bg,
                      border: `3px solid ${borderColor}`,
                      borderRadius: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 900,
                      color,
                      cursor: sceneState === "question" ? "pointer" : "default",
                      transition: "border-color 0.15s, transform 0.15s, background 0.15s",
                      animation: anim,
                      opacity,
                    }}
                  >
                    {num}
                  </div>
                );
              })}
            </div>

            {/* Correct star badge */}
            {sceneState === "correct" && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                <div style={{
                  background: C.correctBg,
                  border: `2px solid ${C.correctMint}`,
                  borderRadius: 12,
                  padding: "8px 18px",
                  fontSize: 15,
                  fontWeight: 900,
                  color: C.correctMint,
                }}>
                  +1 ⭐
                </div>
              </div>
            )}

            {/* Coach row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: sceneState === "correct" ? C.correctBg : C.card,
              border: sceneState === "correct" ? `1px solid ${C.correctMint}` : "none",
              borderRadius: 12,
              padding: "10px 14px",
              maxWidth: 460,
              margin: "0 auto 8px",
            }}>
              <div style={{ fontSize: 28 }}>🦁</div>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: sceneState === "correct" ? C.correctMint : C.coachText,
              }}>
                {sceneState === "correct"
                  ? QUESTION.coachCorrect
                  : sceneState === "wrong"
                  ? QUESTION.coachWrong
                  : QUESTION.coachActive}
              </div>
            </div>

            {/* Star safe badge */}
            {sceneState !== "correct" && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#1a2a15",
                border: `1.5px solid ${C.correctMint}`,
                borderRadius: 14,
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 700,
                color: C.correctMint,
                marginBottom: 16,
              }}>
                ⭐ {sceneState === "wrong" ? "Stars safe — keep counting!" : "Your stars are safe!"}
              </div>
            )}

            {/* Correct CTA */}
            {sceneState === "correct" && (
              <button
                onClick={handleRetry}
                style={{
                  ...FONT,
                  marginTop: 12,
                  background: "linear-gradient(135deg, #ffd166, #f0a000)",
                  border: "none",
                  borderRadius: 12,
                  color: C.goldDark,
                  fontSize: 14,
                  fontWeight: 900,
                  padding: "12px 28px",
                  cursor: "pointer",
                }}
              >
                Next Question →
              </button>
            )}
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "12px 20px",
            background: C.surface,
            borderTop: `1px solid ${C.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            {sceneState === "correct" ? (
              <div style={{ fontSize: 12, color: C.correctMint, fontWeight: 700 }}>✓ Saved!</div>
            ) : (
              <>
                <button style={{
                  ...FONT,
                  background: C.card,
                  border: `2px solid ${C.gold}`,
                  borderRadius: 10,
                  color: C.gold,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}>
                  🔊 Hear again
                </button>
                <button style={{
                  ...FONT,
                  background: C.card,
                  border: `2px solid ${C.border}`,
                  borderRadius: 10,
                  color: C.muted,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}>
                  {sceneState === "wrong" ? "💡 Count with me" : "💡 Hint"}
                </button>
                <button style={{
                  ...FONT,
                  background: "transparent",
                  border: `2px solid rgba(255,123,107,0.27)`,
                  borderRadius: 10,
                  color: C.coral,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}>
                  🤷 I don&apos;t know yet
                </button>
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
