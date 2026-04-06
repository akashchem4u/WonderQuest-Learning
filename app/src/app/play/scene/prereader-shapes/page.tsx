"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  surface: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  borderLight: "#2a2050",
  gold: "#ffd166",
  goldDark: "#1a0c00",
  goldDim: "#a07820",
  topbarBg1: "#2a1800",
  topbarBg2: "#1a0c00",
  topbarBorder: "#3a2000",
  violet: "#9b72ff",
  mint: "#58e8c1",
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

// ─── Session type ──────────────────────────────────────────────────────────────
type SessionData = {
  student: { displayName: string; launchBandCode: string };
  progression: { totalPoints: number; currentLevel: number; badgeCount: number; trophyCount: number };
};

// ─── Scene data ────────────────────────────────────────────────────────────────
const QUESTION = {
  questName: "Shapes Quest",
  totalSegs: 5,
  doneSegs: 2,
  stars: 4,
  targetShape: "Circle",
  coachActive: "Find the shape that goes round and round with no sides!",
  coachPhonics: "Circle! Circle!",
  coachCorrect: "Round all the way around — no corners, no sides! You got it!",
  wrongBannerText: "Not quite — look at the shape up top.",
  wrongBannerSub: "Does it have corners? Run your finger around it!",
  choices: [
    {
      id: "triangle",
      label: "Triangle",
      correct: false,
      svgHero: (color: string) => (
        <svg viewBox="0 0 100 100" fill="none" width={100} height={100}>
          <polygon points="50,10 90,85 10,85" fill={`${color}33`} stroke={color} strokeWidth="5" />
        </svg>
      ),
      svgChoice: (color: string) => (
        <svg viewBox="0 0 80 80" fill="none" width={42} height={42}>
          <polygon points="40,8 72,68 8,68" fill={`${color}44`} stroke={color} strokeWidth="4" />
        </svg>
      ),
    },
    {
      id: "circle",
      label: "Circle",
      correct: true,
      svgHero: (color: string) => (
        <svg viewBox="0 0 100 100" fill="none" width={100} height={100}>
          <circle cx="50" cy="50" r="42" fill={`${color}33`} stroke={color} strokeWidth="5" />
        </svg>
      ),
      svgChoice: (color: string) => (
        <svg viewBox="0 0 80 80" fill="none" width={42} height={42}>
          <circle cx="40" cy="40" r="30" fill={`${color}33`} stroke={color} strokeWidth="4" />
        </svg>
      ),
    },
    {
      id: "square",
      label: "Square",
      correct: false,
      svgHero: (color: string) => (
        <svg viewBox="0 0 100 100" fill="none" width={100} height={100}>
          <rect x="12" y="12" width="76" height="76" rx="6" fill={`${color}33`} stroke={color} strokeWidth="5" />
        </svg>
      ),
      svgChoice: (color: string) => (
        <svg viewBox="0 0 80 80" fill="none" width={42} height={42}>
          <rect x="12" y="12" width="56" height="56" rx="6" fill={`${color}33`} stroke={color} strokeWidth="4" />
        </svg>
      ),
    },
    {
      id: "star",
      label: "Star",
      correct: false,
      svgHero: (color: string) => (
        <svg viewBox="0 0 100 100" fill="none" width={100} height={100}>
          <polygon points="50,10 59,38 88,38 65,55 73,84 50,68 27,84 35,55 12,38 41,38" fill={`${color}33`} stroke={color} strokeWidth="4" />
        </svg>
      ),
      svgChoice: (color: string) => (
        <svg viewBox="0 0 80 80" fill="none" width={42} height={42}>
          <polygon points="40,8 47,30 70,30 52,44 58,67 40,54 22,67 28,44 10,30 33,30" fill={`${color}44`} stroke={color} strokeWidth="3" />
        </svg>
      ),
    },
  ],
};

// Color per shape for idle state
const SHAPE_COLORS: Record<string, string> = {
  triangle: "#9b72ff",
  circle: "#ffd166",
  square: "#58e8c1",
  star: "#ff7b6b",
};

type SceneState = "question" | "correct" | "wrong";

function ProgressStrip({ total, done }: { total: number; done: number }) {
  return (
    <div style={{
      display: "flex",
      gap: 3,
      padding: "10px 16px",
      background: `linear-gradient(135deg, ${C.topbarBg1}, ${C.topbarBg2})`,
      flexShrink: 0,
      paddingBottom: 10,
    }}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < done;
        const isActive = i === done;
        let bg = "rgba(255,209,102,0.2)";
        if (isDone) bg = C.gold;
        else if (isActive) bg = "rgba(255,209,102,0.7)";
        return (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: bg }} />
        );
      })}
    </div>
  );
}

// The hero shape shown in the center — always the target shape
function HeroShape({ state }: { state: SceneState }) {
  const heroColor = state === "correct" ? C.correctMint : C.gold;
  const heroBg = state === "correct" ? C.correctBg : C.card;
  const heroBorder = state === "correct" ? C.correctMint : C.gold;
  const glowAnim = state === "correct" ? "wq-correct-glow 0.6s ease-out" : "wq-letter-glow 2s ease-in-out infinite";

  return (
    <div style={{
      width: 160,
      height: 160,
      background: heroBg,
      borderRadius: 20,
      border: `3px solid ${heroBorder}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: glowAnim,
    }}>
      <svg viewBox="0 0 100 100" fill="none" width={100} height={100}>
        <circle cx="50" cy="50" r="42" fill={`${heroColor}33`} stroke={heroColor} strokeWidth="5" />
      </svg>
    </div>
  );
}

export default function PrereaderShapesScenePage() {
  const [sceneState, setSceneState] = useState<SceneState>("question");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stars, setStars] = useState(QUESTION.stars);
  const [displayName, setDisplayName] = useState("Explorer");

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        if (data?.student?.displayName) setDisplayName(data.student.displayName);
        if (typeof data?.progression?.totalPoints === "number") setStars(data.progression.totalPoints);
      })
      .catch(() => {});
  }, []);

  function handleChoice(id: string, correct: boolean) {
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
    if (s === "correct") {
      setSelectedId("circle");
      setStars(QUESTION.stars + 1);
    } else if (s === "wrong") {
      setSelectedId("triangle");
      setStars(QUESTION.stars);
    } else {
      setSelectedId(null);
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
        @keyframes wq-correct-glow {
          0% { box-shadow: 0 0 0 rgba(80,232,144,0); }
          50% { box-shadow: 0 0 40px rgba(80,232,144,0.6), 0 0 80px rgba(80,232,144,0.3); }
          100% { box-shadow: 0 0 20px rgba(80,232,144,0.3); }
        }
        @keyframes wq-obj-pop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes wq-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
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
                border: `2px solid ${sceneState === s ? C.gold : "#3a3060"}`,
                background: sceneState === s ? C.gold : C.card,
                color: sceneState === s ? C.goldDark : C.muted,
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {s === "question" ? "Active (Find the Circle)" : s === "correct" ? "Correct" : "Wrong"}
            </button>
          ))}
        </div>

        {/* Phone frame */}
        <div style={{
          width: 390,
          minHeight: 780,
          background: C.surface,
          borderRadius: 40,
          border: `2px solid #3a3060`,
          boxShadow: `0 0 0 1px rgba(155,114,255,0.13), 0 30px 80px rgba(0,0,0,0.7)`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          margin: "0 auto",
        }}>

          {/* Status bar */}
          <div style={{
            height: 36,
            background: `linear-gradient(135deg, ${C.topbarBg1}, ${C.topbarBg2})`,
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
            background: `linear-gradient(135deg, ${C.topbarBg1}, ${C.topbarBg2})`,
            padding: "10px 16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            borderBottom: `1px solid ${C.topbarBorder}`,
          }}>
            <Link
              href="/play"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,209,102,0.12)",
                color: C.gold,
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
            <span style={{ fontSize: "0.9rem", fontWeight: 900, color: C.gold }}>{`${displayName} · ${QUESTION.questName}`}</span>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(255,209,102,0.15)",
              padding: "4px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,209,102,0.3)",
              fontSize: "0.85rem",
              fontWeight: 900,
              color: C.gold,
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
            padding: "20px 20px 12px",
            gap: 16,
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
                alignItems: "center",
                gap: 10,
              }}>
                <span style={{ fontSize: "1.4rem" }}>🔷</span>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: C.coral, lineHeight: 1.3 }}>
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
                background: sceneState === "correct" ? C.correctBg : C.card,
                borderRadius: 14,
                padding: "12px 14px",
                border: `1px solid ${sceneState === "correct" ? C.correctMint : "#3a3060"}`,
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.topbarBg1}, rgba(255,209,102,0.27))`,
                  border: `2px solid ${sceneState === "correct" ? C.correctMint : C.gold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}>
                  🦁
                </div>
                <div style={{ flex: 1, fontSize: "0.9rem", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                  {sceneState === "correct" ? (
                    <span style={{ color: C.correctMint, fontSize: "1rem" }}>✨ Yes! Circle!<br /></span>
                  ) : (
                    <span style={{ color: C.gold, fontSize: "1rem", fontWeight: 900 }}>{QUESTION.coachPhonics}<br /></span>
                  )}
                  {sceneState === "correct" ? QUESTION.coachCorrect : QUESTION.coachActive}
                </div>
              </div>
            )}

            {/* Shape hero */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <HeroShape state={sceneState} />
            </div>

            {/* Prompt */}
            <div style={{ textAlign: "center", fontSize: "1.05rem", fontWeight: 900, color: C.text }}>
              {sceneState === "correct" ? (
                <span style={{ color: C.correctMint, fontSize: "1.3rem" }}>✓ That&apos;s a Circle!</span>
              ) : (
                <>Tap the <span style={{ color: C.gold, fontSize: "1.3rem" }}>{QUESTION.targetShape}</span></>
              )}
            </div>

            {/* Shape choices grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {QUESTION.choices.map((choice, i) => {
                const isSelected = selectedId === choice.id;
                const idleColor = SHAPE_COLORS[choice.id] || C.gold;

                let borderColor = "#3a3060";
                let bg = C.card2;
                let labelColor = C.muted;
                let opacity: number | undefined = undefined;
                let anim = `wq-obj-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.05 * (i + 1)}s backwards`;
                let svgColor = idleColor;

                if (sceneState === "correct") {
                  if (choice.correct) {
                    borderColor = C.correctMint;
                    bg = C.correctBg;
                    labelColor = C.correctMint;
                    svgColor = C.correctMint;
                    anim = "none";
                  } else {
                    opacity = 0.35;
                    anim = "none";
                  }
                } else if (sceneState === "wrong" && isSelected) {
                  borderColor = C.coral;
                  bg = C.wrongBg;
                  svgColor = C.coral;
                  anim = "wq-shake 0.5s ease-out";
                }

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice.id, choice.correct)}
                    style={{
                      ...FONT,
                      height: 90,
                      background: bg,
                      border: `3px solid ${borderColor}`,
                      borderRadius: 16,
                      cursor: sceneState === "question" ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.15s",
                      animation: anim,
                      opacity,
                    }}
                  >
                    {choice.svgChoice(svgColor)}
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      color: labelColor,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}>
                      {choice.correct && sceneState === "correct" ? `${choice.label} ✓` : choice.label}
                    </span>
                  </button>
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
                  background: "linear-gradient(135deg, #ffd166, #f0a000)",
                  color: C.goldDark,
                  fontSize: "1rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Next Shape ✨ +1⭐
              </button>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "🔊 Replay", bg: "#2a2050", color: C.violet, border: "1px solid #3a3060" },
                    { label: "💡 Hint", bg: "rgba(255,209,102,0.1)", color: C.gold, border: "1px solid rgba(255,209,102,0.25)" },
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
