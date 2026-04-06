"use client";

import { useState } from "react";
import Link from "next/link";
import AppFrame from "@/components/app-frame";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0820",
  surface: "#100b2e",
  card: "#1a1540",
  card2: "#12103a",
  rail: "#0e0c2a",
  border: "#2a2060",
  borderLight: "#1a1540",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#50e890",
  coral: "#ff7b6b",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  correctBg: "#1a3a20",
  correctBorder: "#50e890",
  wrongBg: "#2a0e0e",
  wrongBorder: "#ff7b6b",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

// ─── Stub question data ───────────────────────────────────────────────────────
const QUESTION = {
  questName: "Story Builder",
  questSub: "Aim High · Cosmic Castle",
  totalQ: 8,
  currentQ: 4,
  stars: 18,
  label: "Which word matches the picture?",
  image: "🐱",
  prompt: "What is this?",
  promptSub: "Pick the right word below",
  answers: [
    { id: "cat", emoji: "🐱", label: "cat", correct: true },
    { id: "dog", emoji: "🐶", label: "dog", correct: false },
    { id: "frog", emoji: "🐸", label: "frog", correct: false },
    { id: "rabbit", emoji: "🐰", label: "rabbit", correct: false },
  ],
  mascotHint: "Look at the picture carefully! What animal do you see? 👀",
  mascotCorrect: 'You got it! "cat" starts with the /k/ sound — great listening! 🎉',
  mascotWrong: "Hmm, look again! Listen to the start sound — /k/ /k/ /k/ ... what starts with that? 🎵",
  wrongBanner: {
    icon: "🔊",
    headline: "Not quite — give it another try!",
    hint: "Listen to the start sound — what animal starts with /k/?",
  },
};

type SessionState = "question" | "correct" | "wrong";

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({
  total,
  current,
  state,
}: {
  total: number;
  current: number;
  state: SessionState;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current - 1;
        const active = i === current - 1;
        let bg = C.border;
        if (done) bg = C.mint;
        if (active && state === "question") bg = C.violet;
        if (active && state === "correct") bg = C.gold;
        if (active && state === "wrong") bg = C.coral;
        return (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: bg,
              boxShadow:
                active && state === "question"
                  ? "0 0 0 3px rgba(155,114,255,0.25)"
                  : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Answer card ─────────────────────────────────────────────────────────────
function AnswerCard({
  emoji,
  label,
  status,
  onClick,
}: {
  emoji: string;
  label: string;
  status: "idle" | "correct" | "wrong";
  onClick: () => void;
}) {
  const base: React.CSSProperties = {
    ...FONT,
    background: C.card,
    border: `3px solid ${C.border}`,
    borderRadius: 14,
    padding: "16px 12px",
    textAlign: "center",
    cursor: status === "idle" ? "pointer" : "default",
    fontSize: 16,
    fontWeight: 900,
    color: C.text,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    transition: "border-color 0.15s, background 0.15s",
  };
  if (status === "correct") {
    return (
      <div
        style={{
          ...base,
          background: C.correctBg,
          borderColor: C.correctBorder,
          color: C.mint,
        }}
      >
        <span style={{ fontSize: 28 }}>{emoji}</span>
        {label}
      </div>
    );
  }
  if (status === "wrong") {
    return (
      <div
        style={{
          ...base,
          background: C.wrongBg,
          borderColor: C.wrongBorder,
          color: C.coral,
          animation: "wq-shake 0.5s ease-out",
        }}
      >
        <span style={{ fontSize: 28 }}>{emoji}</span>
        {label}
      </div>
    );
  }
  return (
    <div style={base} onClick={onClick} role="button" tabIndex={0}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      {label}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlaySessionPage() {
  const [sessionState, setSessionState] = useState<SessionState>("question");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stars, setStars] = useState(QUESTION.stars);

  function handleAnswerClick(id: string, correct: boolean) {
    if (sessionState !== "question") return;
    setSelectedId(id);
    if (correct) {
      setStars((s) => s + 1);
      setSessionState("correct");
    } else {
      setSessionState("wrong");
    }
  }

  function handleNextQuestion() {
    setSelectedId(null);
    setSessionState("question");
  }

  function switchState(s: SessionState) {
    setSessionState(s);
    setSelectedId(null);
    if (s === "correct") setStars(QUESTION.stars + 1);
    else setStars(QUESTION.stars);
  }

  const doneCount = sessionState === "correct" ? QUESTION.currentQ : QUESTION.currentQ - 1;
  const currentProgress =
    sessionState === "correct"
      ? ((QUESTION.currentQ) / QUESTION.totalQ) * 100
      : ((QUESTION.currentQ - 1) / QUESTION.totalQ) * 100;

  return (
    <AppFrame audience="kid" currentPath="/play">
      {/* keyframe injection */}
      <style>{`
        @keyframes wq-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes wq-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes wq-chip-pop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes wq-star-bump {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div style={{ ...FONT, background: C.bg, minHeight: "100vh", padding: "24px 16px", color: C.text }}>

        {/* ── Dev state-switcher ── */}
        <div style={{
          display: "flex",
          gap: 8,
          maxWidth: 1100,
          margin: "0 auto 18px",
          flexWrap: "wrap" as const,
        }}>
          {(["question", "correct", "wrong"] as SessionState[]).map((s) => (
            <button
              key={s}
              onClick={() => switchState(s)}
              style={{
                ...FONT,
                background: sessionState === s ? C.violet : "#1a1540",
                border: `2px solid ${sessionState === s ? C.violet : C.border}`,
                borderRadius: 8,
                color: sessionState === s ? "#fff" : C.muted,
                fontSize: 13,
                fontWeight: 700,
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              {s === "question" ? "Active (Question)" : s === "correct" ? "Correct Answer" : "Wrong (Gentle)"}
            </button>
          ))}
          <div style={{ fontSize: 11, color: C.muted, alignSelf: "center", marginLeft: 8 }}>
            Dev switcher — click to preview each state
          </div>
        </div>

        {/* ── Play shell ── */}
        <div style={{
          background: C.surface,
          border: `2px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
          minHeight: 600,
          display: "flex",
          flexDirection: "column",
          maxWidth: 1100,
          margin: "0 auto",
        }}>

          {/* ── Top bar ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            background: C.card2,
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            <Link
              href="/play"
              style={{
                ...FONT,
                background: "transparent",
                border: `2px solid ${C.border}`,
                borderRadius: 8,
                color: C.muted,
                fontSize: 12,
                fontWeight: 700,
                padding: "5px 12px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              ← Home
            </Link>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{QUESTION.questName}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{QUESTION.questSub}</div>
            </div>

            <ProgressDots total={QUESTION.totalQ} current={QUESTION.currentQ} state={sessionState} />

            <div style={{
              fontSize: 11,
              color: sessionState === "correct" ? C.mint : sessionState === "wrong" ? C.coral : C.muted,
              fontWeight: 700,
              padding: "0 8px",
            }}>
              {sessionState === "correct"
                ? `Q${QUESTION.currentQ} ✓`
                : sessionState === "wrong"
                ? "Try again!"
                : `Q${QUESTION.currentQ}/${QUESTION.totalQ}`}
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: sessionState === "correct" ? "#1a1500" : "#1a1540",
              border: `2px solid ${sessionState === "correct" ? C.gold : C.border}`,
              borderRadius: 10,
              padding: "6px 12px",
              fontSize: 14,
              fontWeight: 900,
              color: C.gold,
              flexShrink: 0,
              animation: sessionState === "correct" ? "wq-star-bump 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none",
            }}>
              🌟 {stars}
            </div>

            <button style={{
              background: "transparent",
              border: `2px solid ${C.border}`,
              borderRadius: 8,
              color: C.muted,
              fontSize: 16,
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              ⏸
            </button>
          </div>

          {/* ── Main ── */}
          <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 320px",
          }}>

            {/* Question zone */}
            <div style={{
              padding: "40px 40px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              borderRight: `1px solid ${C.borderLight}`,
              background: sessionState === "correct"
                ? "radial-gradient(ellipse at 50% 40%, rgba(80,232,144,0.08) 0%, transparent 70%)"
                : "transparent",
            }}>

              {/* Label */}
              <div style={{
                fontSize: 11,
                fontWeight: 900,
                color: sessionState === "correct"
                  ? C.mint
                  : sessionState === "wrong"
                  ? C.coral
                  : C.muted,
                textTransform: "uppercase" as const,
                letterSpacing: "1.5px",
                marginBottom: 14,
              }}>
                {sessionState === "correct"
                  ? "✓ That's right!"
                  : sessionState === "wrong"
                  ? "Not quite — give it another try!"
                  : QUESTION.label}
              </div>

              {/* Image */}
              <div style={{
                width: 160,
                height: 160,
                background: sessionState === "correct"
                  ? "linear-gradient(135deg, #1a3a20, #2a5a30)"
                  : "linear-gradient(135deg, #1e1470, #2a1060)",
                borderRadius: 24,
                border: `3px solid ${sessionState === "correct" ? C.mint : C.violet}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 80,
                marginBottom: 20,
                boxShadow: sessionState === "correct"
                  ? "0 0 30px rgba(80,232,144,0.25)"
                  : "0 0 30px rgba(155,114,255,0.2)",
              }}>
                {QUESTION.image}
              </div>

              {/* Prompt */}
              <div style={{
                fontSize: 24,
                fontWeight: 900,
                color: sessionState === "correct" ? C.mint : C.text,
                textAlign: "center",
                marginBottom: 8,
              }}>
                {sessionState === "correct" ? `🎉 "cat" — yes!` : QUESTION.prompt}
              </div>

              <div style={{
                fontSize: 14,
                color: C.muted,
                textAlign: "center",
                marginBottom: 28,
              }}>
                {sessionState === "correct"
                  ? "Amazing! You earned a star for that one!"
                  : sessionState === "wrong"
                  ? "Listen again — what sound does it start with?"
                  : QUESTION.promptSub}
              </div>

              {/* Wrong banner */}
              {sessionState === "wrong" && (
                <div style={{
                  width: "100%",
                  maxWidth: 500,
                  background: C.wrongBg,
                  border: `2px solid ${C.coral}`,
                  borderRadius: 14,
                  padding: "13px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 16,
                }}>
                  <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>
                    {QUESTION.wrongBanner.icon}
                  </span>
                  <div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 900, color: C.coral, marginBottom: 3 }}>
                      {QUESTION.wrongBanner.headline}
                    </div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                      {QUESTION.wrongBanner.hint}
                    </div>
                  </div>
                </div>
              )}

              {/* Answer grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                width: "100%",
                maxWidth: 500,
              }}>
                {QUESTION.answers.map((ans) => {
                  let status: "idle" | "correct" | "wrong" = "idle";
                  if (selectedId === ans.id) {
                    status = ans.correct ? "correct" : "wrong";
                  }
                  return (
                    <AnswerCard
                      key={ans.id}
                      emoji={ans.emoji}
                      label={ans.label}
                      status={status}
                      onClick={() => handleAnswerClick(ans.id, ans.correct)}
                    />
                  );
                })}
              </div>

              {/* Correct state: +1 star chip + Next button */}
              {sessionState === "correct" && (
                <>
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <div style={{
                      background: C.correctBg,
                      border: `2px solid ${C.mint}`,
                      borderRadius: 14,
                      padding: "10px 20px",
                      fontSize: 16,
                      fontWeight: 900,
                      color: C.mint,
                      animation: "wq-chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}>
                      +1 ⭐
                    </div>
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      ...FONT,
                      marginTop: 20,
                      background: "linear-gradient(135deg, #9b72ff, #7c4dff)",
                      border: "none",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 900,
                      padding: "12px 32px",
                      cursor: "pointer",
                    }}
                  >
                    Next Question →
                  </button>
                </>
              )}
            </div>

            {/* Right rail */}
            <div style={{
              padding: "20px 16px",
              background: C.rail,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>

              {/* Mascot coach */}
              <div style={{
                background: C.card2,
                border: `2px solid ${sessionState === "correct" ? C.mint : sessionState === "wrong" ? "rgba(255,123,107,0.3)" : C.border}`,
                borderRadius: 14,
                padding: 12,
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: sessionState === "correct" ? 44 : 36,
                  marginBottom: 6,
                  display: "inline-block",
                  animation: sessionState === "question" ? "wq-bounce 2s ease-in-out infinite" : "none",
                }}>
                  🦁
                </div>
                <div style={{
                  background: sessionState === "correct" ? C.correctBg : "#1a1540",
                  border: `2px solid ${sessionState === "correct" ? C.mint : sessionState === "wrong" ? "rgba(255,123,107,0.3)" : C.border}`,
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: sessionState === "correct" ? C.mint : sessionState === "wrong" ? "#ff8888" : "#c4b0ff",
                  textAlign: "left",
                  marginTop: 6,
                }}>
                  {sessionState === "correct"
                    ? QUESTION.mascotCorrect
                    : sessionState === "wrong"
                    ? QUESTION.mascotWrong
                    : QUESTION.mascotHint}
                </div>
              </div>

              {/* Progress card */}
              <div style={{
                background: C.card2,
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Questions</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.text }}>
                    {doneCount} / {QUESTION.totalQ}
                  </span>
                </div>
                <div style={{ height: 8, background: "#1a1540", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 4,
                    background: "linear-gradient(90deg, #9b72ff, #58e8c1)",
                    width: `${currentProgress}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{
                  fontSize: 16,
                  textAlign: "center",
                  color: sessionState === "wrong" ? C.muted : C.gold,
                  marginTop: 4,
                }}>
                  {sessionState === "correct" ? "⭐ ⭐ ⭐" : "⭐ ⭐ ☆"}
                </div>
              </div>

              {/* Star safe badge */}
              <div style={{
                background: "#1a2a15",
                border: `2px solid ${C.mint}`,
                borderRadius: 10,
                padding: "8px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: C.mint,
                textAlign: "center",
              }}>
                ⭐ {sessionState === "wrong" ? "Stars safe — keep trying!" : "Your stars are safe!"}
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div style={{
            padding: "12px 20px",
            background: C.card2,
            borderTop: `1px solid ${C.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: 10,
          }}>
            {sessionState === "correct" ? (
              <>
                <div style={{ fontSize: 13, color: C.mint, fontWeight: 700 }}>✓ Answer saved!</div>
                <div />
                <div />
              </>
            ) : (
              <>
                <button style={{
                  ...FONT,
                  background: "#1a1540",
                  border: `2px solid ${C.violet}`,
                  borderRadius: 10,
                  color: C.violet,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  🔊 Replay question
                </button>
                <button style={{
                  ...FONT,
                  background: "transparent",
                  border: `2px solid ${sessionState === "wrong" ? C.violet : C.border}`,
                  borderRadius: 10,
                  color: sessionState === "wrong" ? C.violet : C.muted,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}>
                  💡 {sessionState === "wrong" ? "Get a hint" : "Give me a hint"}
                </button>
                <button style={{
                  ...FONT,
                  background: "transparent",
                  border: "2px solid rgba(255,123,107,0.27)",
                  borderRadius: 10,
                  color: C.coral,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}>
                  🤷 I don't know yet
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link
            href="/play"
            style={{
              ...FONT,
              display: "inline-block",
              background: "#1a1540",
              border: `2px solid ${C.border}`,
              borderRadius: 10,
              color: C.muted,
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 20px",
              textDecoration: "none",
            }}
          >
            ← Back to Play Hub
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
