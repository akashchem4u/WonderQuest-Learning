"use client";

import { useState } from "react";
import Link from "next/link";
import AppFrame from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0820",
  surface: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  borderLight: "#2a2050",
  violet: "#9b72ff",
  violetDim: "#5a3fa8",
  gold: "#ffd166",
  mint: "#58e8c1",
  correctMint: "#50e890",
  coral: "#ff7b6b",
  text: "#e8e0ff",
  muted: "#8b7fb8",
  correctBg: "#0d2a1a",
  correctBorder: "#50e890",
  wrongBg: "#2a0e0e",
  wrongBorder: "#ff7b6b",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

// ─── Stub question data ────────────────────────────────────────────────────────
const QUESTION = {
  questName: "Phonics Quest",
  questSub: "Meadow Path · Node 1",
  totalSegs: 7,
  doneSegs: 3,
  stars: 8,
  heroEmoji: "🐝",
  heroWord: "bee",
  prompt: "What sound does",
  promptAccent: "bee",
  promptEnd: "start with?",
  coachActive: "Buh! Buh! What letter makes that sound? Listen to the beginning — tap the letter you hear!",
  coachCorrect: "Buh-buh-bee! B is right! Bee starts with the B sound — you heard it perfectly!",
  coachWrong: "Not quite — say it out loud. What's the very first sound that comes out?",
  letters: [
    { id: "S", sound: "sss", correct: false },
    { id: "B", sound: "buh", correct: true },
    { id: "D", sound: "duh", correct: false },
    { id: "R", sound: "rrr", correct: false },
  ],
};

type SceneState = "question" | "correct" | "wrong";

// ─── Progress strip ────────────────────────────────────────────────────────────
function ProgressStrip({ total, done, state }: { total: number; done: number; state: SceneState }) {
  return (
    <div style={{ display: "flex", gap: 3, padding: "10px 20px", background: C.card, borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0 }}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < done;
        const isActive = i === done;
        let bg = `rgba(155,114,255,0.15)`;
        if (isDone) bg = C.violet;
        if (isActive && state === "correct") bg = C.correctMint;
        else if (isActive) bg = `rgba(155,114,255,0.55)`;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: bg,
              transition: "background 0.3s",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Letter button ────────────────────────────────────────────────────────────
function LetterBtn({
  letter,
  sound,
  status,
  delay,
  onClick,
}: {
  letter: string;
  sound: string;
  status: "idle" | "correct" | "wrong" | "dimmed";
  delay: number;
  onClick: () => void;
}) {
  const base: React.CSSProperties = {
    ...FONT,
    height: 88,
    background: C.card2,
    border: `3px solid ${C.border}`,
    borderRadius: 16,
    cursor: status === "idle" ? "pointer" : "default",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    transition: "border-color 0.15s, background 0.15s",
    animation: `wq-obj-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s backwards`,
    opacity: status === "dimmed" ? 0.35 : 1,
    pointerEvents: status === "dimmed" ? "none" : "auto",
  };

  if (status === "correct") {
    return (
      <div style={{ ...base, background: C.correctBg, borderColor: C.correctBorder, animation: "none" }}>
        <span style={{ fontSize: "2.8rem", fontWeight: 900, color: C.correctMint, lineHeight: 1 }}>{letter}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.correctMint, letterSpacing: "0.05em" }}>{sound} ✓</span>
      </div>
    );
  }

  if (status === "wrong") {
    return (
      <div style={{ ...base, background: C.wrongBg, borderColor: C.wrongBorder, animation: "wq-shake 0.5s ease-out" }}>
        <span style={{ fontSize: "2.8rem", fontWeight: 900, color: C.coral, lineHeight: 1 }}>{letter}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.coral, letterSpacing: "0.05em" }}>{sound}</span>
      </div>
    );
  }

  return (
    <div style={base} onClick={onClick} role="button" tabIndex={0}>
      <span style={{ fontSize: "2.8rem", fontWeight: 900, color: C.text, lineHeight: 1 }}>{letter}</span>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.muted, letterSpacing: "0.05em" }}>{sound}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function K1PhonicsScenePage() {
  const [sceneState, setSceneState] = useState<SceneState>("question");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stars, setStars] = useState(QUESTION.stars);

  function handleLetterClick(id: string, correct: boolean) {
    if (sceneState !== "question") return;
    setSelectedId(id);
    if (correct) {
      setStars((s) => s + 1);
      setSceneState("correct");
    } else {
      setSceneState("wrong");
    }
  }

  function handleRetry() {
    setSelectedId(null);
    setSceneState("question");
  }

  function switchState(s: SceneState) {
    setSceneState(s);
    setSelectedId(null);
    if (s === "correct") {
      setSelectedId("B");
      setStars(QUESTION.stars + 1);
    } else if (s === "wrong") {
      setSelectedId("S");
      setStars(QUESTION.stars);
    } else {
      setStars(QUESTION.stars);
    }
  }

  const doneSegs = sceneState === "correct" ? QUESTION.doneSegs + 1 : QUESTION.doneSegs;

  const heroGlow = sceneState === "correct"
    ? "0 0 20px rgba(80,232,144,0.4), 0 0 50px rgba(80,232,144,0.2)"
    : "0 0 16px rgba(155,114,255,0.35), 0 0 40px rgba(155,114,255,0.15)";

  const heroBorderColor = sceneState === "correct" ? C.correctMint : C.violet;
  const heroBg = sceneState === "correct"
    ? C.correctBg
    : "linear-gradient(135deg, #221960, #1a1440)";

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes wq-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-7px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes wq-obj-pop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes wq-violet-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(155,114,255,0.3), 0 0 30px rgba(155,114,255,0.1); }
          50% { box-shadow: 0 0 24px rgba(155,114,255,0.6), 0 0 50px rgba(155,114,255,0.25); }
        }
        @keyframes wq-correct-burst {
          0% { box-shadow: 0 0 0 rgba(80,232,144,0); }
          50% { box-shadow: 0 0 40px rgba(80,232,144,0.6), 0 0 80px rgba(80,232,144,0.3); }
          100% { box-shadow: 0 0 20px rgba(80,232,144,0.3); }
        }
        @keyframes wq-star-bump {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        @keyframes wq-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      <div style={{ ...FONT, background: C.bg, minHeight: "100vh", padding: "24px 16px", color: C.text }}>

        {/* ── Dev state switcher ── */}
        <div style={{ display: "flex", gap: 8, maxWidth: 900, margin: "0 auto 18px", flexWrap: "wrap" as const }}>
          {(["question", "correct", "wrong"] as SceneState[]).map((s) => (
            <button
              key={s}
              onClick={() => switchState(s)}
              style={{
                ...FONT,
                background: sceneState === s ? C.violet : C.card,
                border: `2px solid ${sceneState === s ? C.violet : C.border}`,
                borderRadius: 8,
                color: sceneState === s ? "#fff" : C.muted,
                fontSize: 13,
                fontWeight: 700,
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              {s === "question" ? "Active (Bee → B?)" : s === "correct" ? "Correct" : "Wrong (Gentle)"}
            </button>
          ))}
          <div style={{ fontSize: 11, color: C.muted, alignSelf: "center", marginLeft: 8 }}>
            Dev switcher — click to preview each state
          </div>
        </div>

        {/* ── Scene card ── */}
        <div style={{
          background: C.surface,
          border: `2px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}>

          {/* Top bar */}
          <div style={{
            background: C.card,
            padding: "10px 20px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            borderBottom: `1px solid ${C.borderLight}`,
          }}>
            <Link
              href="/play"
              style={{
                ...FONT,
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(155,114,255,0.12)",
                border: "none",
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

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 900, color: C.text }}>{QUESTION.questName}</div>
              <div style={{ fontSize: "0.75rem", color: C.muted }}>{QUESTION.questSub}</div>
            </div>

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
          <ProgressStrip total={QUESTION.totalSegs} done={doneSegs} state={sceneState} />

          {/* Main body */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
          }}>

            {/* Left: scene area */}
            <div style={{
              padding: "28px 32px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              background: sceneState === "correct"
                ? "radial-gradient(ellipse at 50% 30%, rgba(80,232,144,0.07) 0%, transparent 70%)"
                : "transparent",
              borderRight: `1px solid ${C.borderLight}`,
            }}>

              {/* Wrong banner — top placement */}
              {sceneState === "wrong" && (
                <div style={{
                  width: "100%",
                  background: C.wrongBg,
                  border: `2px solid ${C.wrongBorder}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>🔊</span>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 900, color: C.coral }}>Not quite!</div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 700, color: C.text, lineHeight: 1.4, marginTop: 2 }}>
                      Say &quot;bee&quot; out loud. What&apos;s the very first sound that comes out?
                    </div>
                  </div>
                </div>
              )}

              {/* Hero image card */}
              <div style={{
                width: 160,
                height: 160,
                background: heroBg,
                borderRadius: 20,
                border: `3px solid ${heroBorderColor}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: heroGlow,
                animation: sceneState === "correct" ? "wq-correct-burst 0.6s ease-out" : "wq-violet-glow 2.5s ease-in-out infinite",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 72, lineHeight: 1 }}>{QUESTION.heroEmoji}</span>
                <span style={{
                  fontSize: "0.9rem",
                  fontWeight: 900,
                  color: sceneState === "correct" ? C.correctMint : C.muted,
                  textTransform: "lowercase" as const,
                  letterSpacing: "0.05em",
                }}>
                  {QUESTION.heroWord}
                </span>
              </div>

              {/* Question text */}
              <div style={{ textAlign: "center", fontSize: "1rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                {sceneState === "correct" ? (
                  <span style={{ color: C.correctMint, fontSize: "1.1rem", fontWeight: 900 }}>
                    ✓ B — &quot;Buh&quot; is the starting sound!
                  </span>
                ) : (
                  <>
                    {QUESTION.prompt}{" "}
                    <span style={{ color: C.violet, fontWeight: 900 }}>&quot;{QUESTION.promptAccent}&quot;</span>{" "}
                    {QUESTION.promptEnd}
                  </>
                )}
              </div>

              {/* Letter choice grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                width: "100%",
                maxWidth: 360,
              }}>
                {QUESTION.letters.map((ltr, i) => {
                  let status: "idle" | "correct" | "wrong" | "dimmed" = "idle";
                  if (sceneState === "correct") {
                    status = ltr.correct ? "correct" : "dimmed";
                  } else if (sceneState === "wrong" && selectedId === ltr.id) {
                    status = "wrong";
                  }
                  return (
                    <LetterBtn
                      key={ltr.id}
                      letter={ltr.id}
                      sound={ltr.sound}
                      status={status}
                      delay={0.05 * (i + 1)}
                      onClick={() => handleLetterClick(ltr.id, ltr.correct)}
                    />
                  );
                })}
              </div>

              {/* Correct CTA */}
              {sceneState === "correct" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: C.correctBg,
                    border: `2px solid ${C.correctMint}`,
                    borderRadius: 12,
                    padding: "8px 20px",
                    fontSize: 15,
                    fontWeight: 900,
                    color: C.correctMint,
                  }}>
                    +1 ⭐
                  </div>
                  <button
                    onClick={handleRetry}
                    style={{
                      ...FONT,
                      width: "100%",
                      maxWidth: 360,
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
                    Next Sound ✨ +1⭐
                  </button>
                </div>
              )}
            </div>

            {/* Right rail */}
            <div style={{
              padding: "20px 16px",
              background: "#0e0c2a",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}>

              {/* Coach */}
              <div style={{
                background: C.card,
                border: `2px solid ${sceneState === "correct" ? C.correctMint : sceneState === "wrong" ? "rgba(255,123,107,0.3)" : C.border}`,
                borderRadius: 14,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: sceneState === "correct" ? 44 : 36,
                  display: "inline-block",
                  animation: sceneState === "question" ? "wq-bounce 2s ease-in-out infinite" : "none",
                }}>
                  🦁
                </div>
                <div style={{
                  background: sceneState === "correct" ? C.correctBg : "#1a1540",
                  border: `1px solid ${sceneState === "correct" ? C.correctMint : sceneState === "wrong" ? "rgba(255,123,107,0.3)" : C.border}`,
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: sceneState === "correct" ? C.correctMint : sceneState === "wrong" ? "#ff8888" : "#c4b0ff",
                  textAlign: "left",
                  lineHeight: 1.4,
                }}>
                  {sceneState === "correct"
                    ? QUESTION.coachCorrect
                    : sceneState === "wrong"
                    ? QUESTION.coachWrong
                    : QUESTION.coachActive}
                </div>
              </div>

              {/* Progress card */}
              <div style={{
                background: C.card,
                border: `2px solid ${C.border}`,
                borderRadius: 14,
                padding: 12,
              }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: C.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "1px",
                  marginBottom: 8,
                }}>
                  This Quest
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Sounds done</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.text }}>
                    {doneSegs} / {QUESTION.totalSegs}
                  </span>
                </div>
                <div style={{ height: 8, background: "#1a1540", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 4,
                    background: "linear-gradient(90deg, #9b72ff, #58e8c1)",
                    width: `${(doneSegs / QUESTION.totalSegs) * 100}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: C.muted,
                  textAlign: "center",
                }}>
                  {sceneState === "correct" ? "🌟 Great work!" : sceneState === "wrong" ? "💪 Keep going!" : "Tap the right letter!"}
                </div>
              </div>

              {/* Star safe badge */}
              <div style={{
                background: "#1a2a15",
                border: `2px solid ${C.correctMint}`,
                borderRadius: 10,
                padding: "8px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: C.correctMint,
                textAlign: "center",
              }}>
                ⭐ {sceneState === "wrong" ? "Stars safe — keep trying!" : "Your stars are safe!"}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "12px 20px",
            background: C.card,
            borderTop: `1px solid ${C.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: 10,
          }}>
            {sceneState === "correct" ? (
              <div style={{ fontSize: 13, color: C.correctMint, fontWeight: 700 }}>✓ Sound saved!</div>
            ) : (
              <>
                <button style={{
                  ...FONT,
                  background: "#2a2050",
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  color: C.violet,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "9px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  🔊 Replay
                </button>
                <button style={{
                  ...FONT,
                  background: "rgba(155,114,255,0.1)",
                  border: "1px solid rgba(155,114,255,0.25)",
                  borderRadius: 10,
                  color: C.violet,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "9px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  💡 Hint
                </button>
                <button style={{
                  ...FONT,
                  background: "transparent",
                  border: "2px solid rgba(255,123,107,0.3)",
                  borderRadius: 10,
                  color: C.coral,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "9px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  🤷 IDK yet
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Back nav ── */}
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
