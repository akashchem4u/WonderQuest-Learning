"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0820",
  surface: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#58e8c1",
  coral: "#ff7b6b",
  text: "#f0eaff",
  muted: "#8b7fb8",
  correct: "#50e890",
  wrong: "#ff7b6b",
  correctBg: "#0d2a1a",
  correctBorder: "#50e890",
  wrongBg: "#2a0e0e",
  wrongBorder: "#ff7b6b",
  goldBg: "#2a1800",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

// ─── Session type ──────────────────────────────────────────────────────────────
type SessionData = {
  student: { displayName: string; launchBandCode: string };
  progression: { totalPoints: number; currentLevel: number; badgeCount: number; trophyCount: number };
};

// ─── Question data ─────────────────────────────────────────────────────────────
const QUESTION = {
  prompt: "What sound does 🐝 start with?",
  hero: "🐝",
  answers: [
    { id: "s", letter: "S", phoneme: "sss" },
    { id: "b", letter: "B", phoneme: "buh" },
    { id: "d", letter: "D", phoneme: "duh" },
    { id: "r", letter: "R", phoneme: "rrr" },
  ],
  correctId: "b",
  wrongId: "s",
};

const PERSONAS = [
  { id: "leo", emoji: "🦁", name: "Coach Leo" },
  { id: "buddy", emoji: "🐧", name: "Buddy" },
  { id: "whisper", emoji: "🦉", name: "Whisper" },
  { id: "zap", emoji: "🤖", name: "Zap" },
];

type CoachState = "idle" | "speaking" | "celebration" | "support";

export default function PlayCoachPage() {
  const [coachState, setCoachState] = useState<CoachState>("idle");
  const [personaIdx, setPersonaIdx] = useState(0);
  const [displayName, setDisplayName] = useState("Explorer");
  const [launchBandCode, setLaunchBandCode] = useState("k1");

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        if (data?.student?.displayName) setDisplayName(data.student.displayName);
        if (data?.student?.launchBandCode) setLaunchBandCode(data.student.launchBandCode);
      })
      .catch(() => {});
  }, []);

  const persona = PERSONAS[personaIdx];

  return (
    <AppFrame audience="kid" currentPath="/play">
      <div
        style={{
          ...FONT,
          minHeight: "100vh",
          background: C.bg,
          color: C.text,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 16px 40px",
          gap: 20,
        }}
      >
        {/* ── Page header ── */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/play/session"
            style={{
              fontSize: "0.88rem",
              fontWeight: 900,
              color: C.violet,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {"← Back"}
          </Link>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 900,
              color: C.violet,
              letterSpacing: "0.04em",
            }}
          >
            {`🦁 ${displayName}'s Coach (${launchBandCode.toUpperCase()})`}
          </div>
          <div style={{ width: 48 }} />
        </div>

        {/* ── Persona picker ── */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {PERSONAS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPersonaIdx(i)}
              style={{
                ...FONT,
                padding: "7px 14px",
                borderRadius: 20,
                border: `1.5px solid ${i === personaIdx ? C.violet : C.border}`,
                background: i === personaIdx ? C.violet : C.card,
                color: i === personaIdx ? "#fff" : C.muted,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>

        {/* ── State tabs ── */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              { id: "idle", label: "Idle" },
              { id: "speaking", label: "Speaking" },
              { id: "celebration", label: "Celebration" },
              { id: "support", label: "Wrong Support" },
            ] as { id: CoachState; label: string }[]
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setCoachState(id)}
              style={{
                ...FONT,
                padding: "7px 14px",
                borderRadius: 20,
                border: `1.5px solid ${coachState === id ? C.violet : C.border}`,
                background: coachState === id ? C.violet : C.card,
                color: coachState === id ? "#fff" : C.muted,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Phone frame ── */}
        <div
          style={{
            width: "min(390px, 100%)",
            height: 600,
            background: C.surface,
            borderRadius: 40,
            border: `2px solid ${C.border}`,
            boxShadow: `0 0 0 2px ${C.violet}22, 0 30px 80px rgba(0,0,0,0.7)`,
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* ── Play backdrop ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              padding: 20,
              gap: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Question prompt */}
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 900,
                color: C.text,
                textAlign: "center",
              }}
            >
              {QUESTION.prompt}
            </div>

            {/* Hero card */}
            <div
              style={{
                width: 140,
                height: 140,
                background: coachState === "celebration" ? C.correctBg : C.card2,
                borderRadius: 18,
                border: `2px solid ${coachState === "celebration" ? C.correct : C.violet}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
              }}
            >
              {QUESTION.hero}
            </div>

            {/* Answer grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                width: "100%",
              }}
            >
              {QUESTION.answers.map((ans) => {
                const isCorrect = ans.id === QUESTION.correctId;
                const isWrong = ans.id === QUESTION.wrongId;
                const isSpeaking = coachState === "speaking";
                const isCelebration = coachState === "celebration";
                const isSupport = coachState === "support";

                let cardBorder = C.border;
                let cardBg = C.card2;
                let textColor = C.text;
                let cardOpacity = 1;

                if (isSpeaking) {
                  cardOpacity = 0.35;
                } else if (isCelebration) {
                  if (isCorrect) {
                    cardBorder = C.correctBorder;
                    cardBg = C.correctBg;
                    textColor = C.correct;
                  } else {
                    cardOpacity = 0.35;
                  }
                } else if (isSupport && isWrong) {
                  cardBorder = C.wrongBorder;
                  cardBg = C.wrongBg;
                  textColor = C.wrong;
                }

                return (
                  <div
                    key={ans.id}
                    style={{
                      background: cardBg,
                      border: `2px solid ${cardBorder}`,
                      borderRadius: 12,
                      height: 80,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      opacity: cardOpacity,
                      pointerEvents: isSpeaking ? "none" : "auto",
                      transition: "opacity 0.3s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: isCelebration && isCorrect ? "2.2rem" : "1.8rem",
                        fontWeight: 900,
                        color: textColor,
                      }}
                    >
                      {ans.letter}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 900,
                        color:
                          isCelebration && isCorrect ? C.correct : C.muted,
                      }}
                    >
                      {ans.phoneme}
                      {isCelebration && isCorrect ? " ✓" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Idle: bottom rail with coach dot ── */}
          {coachState === "idle" && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "12px 20px 22px",
                background: C.card,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "0 0 40px 40px",
                zIndex: 5,
              }}
            >
              {/* Idle dot */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2a1858, #9b72ff44)",
                  border: `2px solid ${C.violet}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  animation: "idle-pulse 2.5s ease-in-out infinite",
                }}
              >
                {persona.emoji}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    ...FONT,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "#2a2050",
                    color: C.violet,
                    border: `1px solid ${C.border}`,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {"🔊 Replay"}
                </button>
                <button
                  style={{
                    ...FONT,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: `rgba(155,114,255,0.10)`,
                    color: C.violet,
                    border: `1px solid rgba(155,114,255,0.25)`,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {"💡 Hint"}
                </button>
              </div>
            </div>
          )}

          {/* ── Speaking overlay ── */}
          {coachState === "speaking" && (
            <CoachOverlay
              persona={persona}
              avatarStyle={{
                border: `3px solid ${C.correct}`,
                background: `linear-gradient(135deg, #0d2a1a, #50e89033)`,
                animation: "coach-speak 0.4s ease-in-out infinite alternate",
              }}
              bubbleBorder={`1px solid ${C.border}`}
              bubbleBg={C.card}
              overlayBg="linear-gradient(180deg, #12103a00 0%, #12103aee 20%, #1a1440 100%)"
              showWaveBars
              waveBarColor={C.correct}
            >
              <span style={{ color: C.violet, fontWeight: 900 }}>
                Buh! Buh! Bee!
              </span>
              <br />
              Listen to the very beginning — what letter makes that sound?
            </CoachOverlay>
          )}

          {/* ── Celebration overlay ── */}
          {coachState === "celebration" && (
            <CoachOverlay
              persona={persona}
              avatarStyle={{
                border: `3px solid ${C.gold}`,
                background: `linear-gradient(135deg, #2a1800, #ffd16633)`,
                boxShadow: "0 0 20px rgba(255,209,102,0.4)",
                animation:
                  "coach-celebrate 0.6s ease-in-out infinite alternate",
              }}
              bubbleBorder={`1px solid rgba(255,209,102,0.3)`}
              bubbleBg={C.goldBg}
              overlayBg="linear-gradient(180deg, #12103a00 0%, #1a120aee 30%, #2a1800 100%)"
              showWaveBars
              waveBarColor={C.gold}
            >
              <span style={{ color: C.gold, fontWeight: 900 }}>
                {"✨ Buh-buh-bee! YES!"}
              </span>
              <br />
              B makes that sound — you heard it perfectly!{" "}
              <span style={{ fontSize: "1.1rem" }}>{"🎉"}</span>
            </CoachOverlay>
          )}

          {/* ── Wrong support overlay ── */}
          {coachState === "support" && (
            <CoachOverlay
              persona={persona}
              avatarStyle={{
                border: `3px solid ${C.violet}`,
                background: `linear-gradient(135deg, #2a1858, #9b72ff33)`,
              }}
              bubbleBorder={`1px solid rgba(155,114,255,0.25)`}
              bubbleBg={C.card}
              overlayBg="linear-gradient(180deg, #12103a00 0%, #12103aee 20%, #1a1440 100%)"
              showWaveBars={false}
              waveBarColor={C.correct}
            >
              Not quite —{" "}
              <span style={{ color: C.violet, fontWeight: 900 }}>
                say "bee" slowly.
              </span>
              <br />
              What{"'"}s the very first sound? Give it another try!
            </CoachOverlay>
          )}

          {/* CSS keyframes injected inline */}
          <style>{`
            @keyframes idle-pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.4); }
              50% { box-shadow: 0 0 0 8px rgba(155,114,255,0); }
            }
            @keyframes coach-speak {
              0% { transform: scale(1); }
              100% { transform: scale(1.06); }
            }
            @keyframes coach-celebrate {
              0% { transform: scale(1) rotate(-5deg); }
              100% { transform: scale(1.12) rotate(5deg); }
            }
            @keyframes wave-dance-1 { 0% { height: 4px; } 100% { height: 14px; } }
            @keyframes wave-dance-2 { 0% { height: 4px; } 100% { height: 20px; } }
            @keyframes wave-dance-3 { 0% { height: 4px; } 100% { height: 12px; } }
            @keyframes wave-dance-4 { 0% { height: 4px; } 100% { height: 18px; } }
            @keyframes wave-dance-5 { 0% { height: 4px; } 100% { height: 16px; } }
            .wave-bar-1 { animation: wave-dance-1 0.6s ease-in-out 0s infinite alternate; }
            .wave-bar-2 { animation: wave-dance-2 0.4s ease-in-out 0.1s infinite alternate; }
            .wave-bar-3 { animation: wave-dance-3 0.7s ease-in-out 0.05s infinite alternate; }
            .wave-bar-4 { animation: wave-dance-4 0.5s ease-in-out 0.15s infinite alternate; }
            .wave-bar-5 { animation: wave-dance-5 0.6s ease-in-out 0.08s infinite alternate; }
          `}</style>
        </div>

        {/* ── Caption ── */}
        <p
          style={{
            fontSize: "0.78rem",
            color: C.muted,
            textAlign: "center",
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          {coachState === "idle" &&
            "Coach idle: 44px dot with gentle pulse ring, question is live"}
          {coachState === "speaking" &&
            "Answer cards dimmed during speech — child listens first, then responds"}
          {coachState === "celebration" &&
            "Celebration: gold borders, avatar bounces + rotates, wave bars turn gold"}
          {coachState === "support" &&
            "Wrong support: coach looks encouraging, not disappointed. Violet border (not red)."}
        </p>
      </div>
    </AppFrame>
  );
}

// ─── Coach overlay sub-component ──────────────────────────────────────────────
interface CoachOverlayProps {
  persona: { emoji: string; name: string };
  avatarStyle: React.CSSProperties;
  bubbleBorder: string;
  bubbleBg: string;
  overlayBg: string;
  showWaveBars: boolean;
  waveBarColor: string;
  children: React.ReactNode;
}

function CoachOverlay({
  persona,
  avatarStyle,
  bubbleBorder,
  bubbleBg,
  overlayBg,
  showWaveBars,
  waveBarColor,
  children,
}: CoachOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: overlayBg,
        borderRadius: "0 0 40px 40px",
        padding: "20px 20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
        {/* Avatar */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            ...avatarStyle,
          }}
        >
          {persona.emoji}
        </div>

        {/* Speech bubble */}
        <div
          style={{
            flex: 1,
            background: bubbleBg,
            borderRadius: "14px 14px 14px 4px",
            padding: "12px 14px",
            border: bubbleBorder,
          }}
        >
          <div
            style={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#f0eaff",
              lineHeight: 1.45,
            }}
          >
            {children}
          </div>

          {/* Wave bars */}
          {showWaveBars && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 3,
                height: 20,
                marginTop: 6,
              }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`wave-bar-${n}`}
                  style={{
                    width: 4,
                    borderRadius: 2,
                    background: waveBarColor,
                    minHeight: 4,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
