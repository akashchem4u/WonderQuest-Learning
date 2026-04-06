"use client";

import { useState } from "react";
import Link from "next/link";
import AppFrame from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0820",
  surface: "#12103a",
  card: "#1a1540",
  card2: "#1a1540",
  topbarBg: "linear-gradient(135deg, #2a1800, #1a0c00)",
  topbarBorder: "#3a2400",
  border: "#2a2060",
  borderLight: "#1a1540",
  violet: "#9b72ff",
  gold: "#ffd166",
  goldDim: "#c4a840",
  mint: "#58e8c1",
  correctMint: "#50e890",
  coral: "#ff7b6b",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  textGold: "#fff8e0",
  correctBg: "#1a3a20",
  correctBorder: "#50e890",
  wrongBg: "#2a1010",
  wrongBorder: "#ff7b6b",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

// ─── Stub question data ────────────────────────────────────────────────────────
const QUESTION = {
  questName: "Letter Quest!",
  questSub: "Forest Glen · Node 2 · Q3",
  totalSegs: 6,
  doneSegs: 2,
  stars: 6,
  targetLetter: "B",
  prompt: "Which one starts with B?",
  promptSub: "Find the picture that starts with the /b/ sound",
  qLabel: "Find the picture that starts with this letter",
  coachActive: "What sound does B make? Buh-buh-buh! Which picture starts with that sound?",
  coachCorrect: "Buh-buh-BEE! You know your letters! Amazing!",
  coachWrong: "Let's say the sound together! B goes buh-buh-buh. Which picture makes that sound?",
  pictures: [
    { id: "apple", emoji: "🍎", word: "apple", correct: false },
    { id: "bee", emoji: "🐝", word: "bee", correct: true },
    { id: "cat", emoji: "🐱", word: "cat", correct: false },
    { id: "dog", emoji: "🐶", word: "dog", correct: false },
  ],
};

type SceneState = "question" | "correct" | "wrong";

// ─── Progress strip ────────────────────────────────────────────────────────────
function ProgressStrip({ total, done, state }: { total: number; done: number; state: SceneState }) {
  return (
    <div style={{
      display: "flex",
      gap: 3,
      padding: "8px 20px",
      background: "#1a0c00",
      borderBottom: `1px solid ${C.topbarBorder}`,
      flexShrink: 0,
    }}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < done;
        const isActive = i === done;
        let bg = "#2a1800";
        if (isDone) bg = C.gold;
        if (isActive && state === "correct") bg = C.gold;
        else if (isActive && state === "wrong") bg = "rgba(255,123,107,0.3)";
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
              transition: "background 0.3s",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Picture card ────────────────────────────────────────────────────────────
function PictureCard({
  emoji,
  word,
  status,
  onClick,
}: {
  emoji: string;
  word: string;
  status: "idle" | "correct" | "wrong" | "dimmed";
  onClick: () => void;
}) {
  const base: React.CSSProperties = {
    background: C.card,
    border: `3px solid ${C.border}`,
    borderRadius: 16,
    padding: "16px 8px",
    textAlign: "center",
    cursor: status === "idle" ? "pointer" : "default",
    transition: "border-color 0.15s, transform 0.15s, background 0.15s",
    opacity: status === "dimmed" ? 0.35 : 1,
    pointerEvents: status === "dimmed" ? "none" : "auto",
  };

  if (status === "correct") {
    return (
      <div style={{ ...base, borderColor: C.correctBorder, background: C.correctBg }}>
        <span style={{ fontSize: 36, display: "block", marginBottom: 6 }}>{emoji}</span>
        <div style={{ fontSize: 12, fontWeight: 900, color: C.correctMint }}>{word} ✓</div>
      </div>
    );
  }

  if (status === "wrong") {
    return (
      <div style={{ ...base, borderColor: C.wrongBorder, background: C.wrongBg, animation: "wq-shake 0.4s ease-out" }}>
        <span style={{ fontSize: 36, display: "block", marginBottom: 6 }}>{emoji}</span>
        <div style={{ fontSize: 12, fontWeight: 900, color: C.coral }}>{word}</div>
      </div>
    );
  }

  return (
    <div style={base} onClick={onClick} role="button" tabIndex={0}>
      <span style={{ fontSize: 36, display: "block", marginBottom: 6 }}>{emoji}</span>
      <div style={{ fontSize: 12, fontWeight: 900, color: "#c4b0ff" }}>{word}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PrereaderLetterScenePage() {
  const [sceneState, setSceneState] = useState<SceneState>("question");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stars, setStars] = useState(QUESTION.stars);

  function handlePictureClick(id: string, correct: boolean) {
    if (sceneState !== "question") return;
    setSelectedId(id);
    if (correct) {
      setStars((s) => s + 1);
      setSceneState("correct");
    } else {
      setSceneState("wrong");
    }
  }

  function handleNext() {
    setSelectedId(null);
    setSceneState("question");
    setStars(QUESTION.stars);
  }

  function switchState(s: SceneState) {
    setSceneState(s);
    setSelectedId(null);
    if (s === "correct") {
      setSelectedId("bee");
      setStars(QUESTION.stars + 1);
    } else if (s === "wrong") {
      setSelectedId("apple");
      setStars(QUESTION.stars);
    } else {
      setStars(QUESTION.stars);
    }
  }

  const doneSegs = sceneState === "correct" ? QUESTION.doneSegs + 1 : QUESTION.doneSegs;

  const letterHeroBorder = sceneState === "correct" ? C.correctMint : C.gold;
  const letterHeroColor = sceneState === "correct" ? C.correctMint : C.gold;
  const letterHeroBg = sceneState === "correct"
    ? "linear-gradient(135deg, #1a3a20, #2a5a30)"
    : "linear-gradient(135deg, #2a1800, #3a2200)";

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes wq-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes wq-letter-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,209,102,0.2); }
          50% { box-shadow: 0 0 40px rgba(255,209,102,0.4); }
        }
        @keyframes wq-seg-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes wq-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes wq-star-bump {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        @keyframes wq-chip-pop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
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
                background: sceneState === s ? C.gold : C.card,
                border: `2px solid ${sceneState === s ? C.gold : C.border}`,
                borderRadius: 8,
                color: sceneState === s ? "#1a1000" : C.muted,
                fontSize: 13,
                fontWeight: 700,
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              {s === "question" ? "Active (Letter B)" : s === "correct" ? "Correct!" : "Wrong (Gentle)"}
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

          {/* Top bar — gold Pre-K theme */}
          <div style={{
            background: C.topbarBg,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${C.topbarBorder}`,
            flexShrink: 0,
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
                flexShrink: 0,
              }}
            >
              ← Play
            </Link>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: C.textGold }}>{QUESTION.questName}</div>
              <div style={{
                fontSize: 10,
                color: sceneState === "correct" ? C.correctMint : sceneState === "wrong" ? C.coral : C.goldDim,
                marginTop: 1,
              }}>
                {sceneState === "correct"
                  ? "Q3 ✓ You got it!"
                  : sceneState === "wrong"
                  ? "Try again!"
                  : QUESTION.questSub}
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

          {/* Main content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px" }}>

            {/* Left: scene area */}
            <div style={{
              padding: "28px 40px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              background: sceneState === "correct"
                ? "radial-gradient(ellipse at 50% 30%, rgba(80,232,144,0.08) 0%, transparent 70%)"
                : "linear-gradient(180deg, #100b2e 0%, #12103a 100%)",
              borderRight: `1px solid ${C.borderLight}`,
            }}>

              {/* Q label */}
              <div style={{
                fontSize: 11,
                fontWeight: 900,
                color: sceneState === "correct" ? C.correctMint : sceneState === "wrong" ? C.coral : C.goldDim,
                textTransform: "uppercase" as const,
                letterSpacing: "1.5px",
              }}>
                {sceneState === "correct"
                  ? "✓ That's right!"
                  : sceneState === "wrong"
                  ? "Not quite — try again!"
                  : QUESTION.qLabel}
              </div>

              {/* Large letter hero */}
              <div style={{
                width: 160,
                height: 160,
                background: letterHeroBg,
                border: `4px solid ${letterHeroBorder}`,
                borderRadius: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 96,
                fontWeight: 900,
                color: letterHeroColor,
                animation: "wq-letter-glow 3s ease-in-out infinite",
                flexShrink: 0,
              }}>
                {QUESTION.targetLetter}
              </div>

              {/* Prompt */}
              <div style={{ fontSize: 20, fontWeight: 900, color: sceneState === "correct" ? C.correctMint : C.text }}>
                {sceneState === "correct"
                  ? "🎉 B is for Bee! Buh-buh-BEE!"
                  : QUESTION.prompt}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {sceneState === "correct"
                  ? "Bee starts with the B sound — great listening!"
                  : sceneState === "wrong"
                  ? "Listen — Buh-buh-buh! Which picture starts with that?"
                  : QUESTION.promptSub}
              </div>

              {/* Wrong try-again banner */}
              {sceneState === "wrong" && (
                <div style={{
                  background: "#2a1010",
                  border: "1.5px solid rgba(255,123,107,0.4)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: C.coral,
                  fontWeight: 700,
                  textAlign: "center",
                  width: "100%",
                  maxWidth: 460,
                }}>
                  That wasn&apos;t it! Say it with me: Buh-buh-buh! 🎵
                </div>
              )}

              {/* Picture grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                width: "100%",
                maxWidth: 520,
              }}>
                {QUESTION.pictures.map((pic) => {
                  let status: "idle" | "correct" | "wrong" | "dimmed" = "idle";
                  if (sceneState === "correct") {
                    status = pic.correct ? "correct" : "dimmed";
                  } else if (sceneState === "wrong" && selectedId === pic.id) {
                    status = "wrong";
                  }
                  return (
                    <PictureCard
                      key={pic.id}
                      emoji={pic.emoji}
                      word={pic.word}
                      status={status}
                      onClick={() => handlePictureClick(pic.id, pic.correct)}
                    />
                  );
                })}
              </div>

              {/* Correct: star chip + next button */}
              {sceneState === "correct" && (
                <>
                  <div style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                  }}>
                    <div style={{
                      background: C.correctBg,
                      border: `2px solid ${C.correctMint}`,
                      borderRadius: 12,
                      padding: "8px 18px",
                      fontSize: 14,
                      fontWeight: 900,
                      color: C.correctMint,
                      animation: "wq-chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}>
                      +1 ⭐
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    style={{
                      ...FONT,
                      background: `linear-gradient(135deg, ${C.gold}, #f0a000)`,
                      border: "none",
                      borderRadius: 12,
                      color: "#1a1000",
                      fontSize: 14,
                      fontWeight: 900,
                      padding: "12px 28px",
                      cursor: "pointer",
                      width: "100%",
                      maxWidth: 260,
                    }}
                  >
                    Next Letter →
                  </button>
                </>
              )}

              {/* Star safe badge */}
              {sceneState !== "correct" && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#1a2a15",
                  border: `1.5px solid ${C.correctMint}`,
                  borderRadius: 14,
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.correctMint,
                }}>
                  ⭐ {sceneState === "wrong" ? "Stars safe — keep trying!" : "Your stars are safe!"}
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
                background: sceneState === "correct" ? C.correctBg : C.card,
                border: `1px solid ${sceneState === "correct" ? C.correctMint : sceneState === "wrong" ? "rgba(255,123,107,0.3)" : C.border}`,
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}>
                <div style={{
                  fontSize: 26,
                  animation: sceneState === "question" ? "wq-bounce 2s ease-in-out infinite" : "none",
                  flexShrink: 0,
                }}>
                  🦁
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: sceneState === "correct" ? C.correctMint : sceneState === "wrong" ? "#ff8888" : "#c4b0ff",
                  lineHeight: 1.5,
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Letters done</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.text }}>
                    {doneSegs} / {QUESTION.totalSegs}
                  </span>
                </div>
                <div style={{ height: 8, background: "#1a1540", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${C.gold}, ${C.mint})`,
                    width: `${(doneSegs / QUESTION.totalSegs) * 100}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: sceneState === "correct" ? C.gold : C.muted,
                  textAlign: "center",
                }}>
                  {sceneState === "correct" ? "🌟 Brilliant!" : sceneState === "wrong" ? "💪 You can do it!" : "Find the right picture!"}
                </div>
              </div>

              {/* Quick tip card */}
              <div style={{
                background: "#1a1400",
                border: `1px solid ${C.goldDim}40`,
                borderRadius: 10,
                padding: "10px 12px",
              }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: C.goldDim, textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 6 }}>
                  Phonics Tip
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#c4b0ff", lineHeight: 1.5 }}>
                  Say the letter sound out loud — <span style={{ color: C.gold }}>Buh-buh-buh!</span> Then match it to a picture.
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
                ⭐ Stars safe — keep trying!
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
              <div style={{ fontSize: 12, color: C.correctMint, fontWeight: 700 }}>✓ Saved!</div>
            ) : (
              <>
                <button style={{
                  ...FONT,
                  background: C.card2,
                  border: `2px solid ${C.gold}`,
                  borderRadius: 10,
                  color: C.gold,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}>
                  🔊 Hear the letter
                </button>
                <button style={{
                  ...FONT,
                  background: "transparent",
                  border: `2px solid ${sceneState === "wrong" ? C.gold : C.border}`,
                  borderRadius: 10,
                  color: sceneState === "wrong" ? C.gold : C.muted,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}>
                  💡 {sceneState === "wrong" ? "Say it with me" : "Hint"}
                </button>
                <button style={{
                  ...FONT,
                  background: "transparent",
                  border: "2px solid rgba(255,123,107,0.3)",
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
