"use client";

import { useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg: "#12103a",
  bgDeep: "#0a0820",
  border: "#2a2060",
  gold: "#ffd166",
  goldDim: "#c4a840",
  goldDark: "#1a1000",
  topbar1: "#2a1800",
  topbar2: "#1a0c00",
  topbarBorder: "#3a2400",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  coachText: "#c4b0ff",
  correct: "#50e890",
  correctBg: "#1a3a20",
  wrong: "#ff7b6b",
};

type SceneState = "ready" | "playing" | "correct";

const QUESTION = {
  questName: "Sound Quest!",
  questSub: "Forest Glen · Node 2 · Q4",
  totalSegs: 6,
  doneSegs: 3,
  stars: 7,
  phoneme: "B",
  phonemeSound: "buh-buh-buh",
  choices: [
    { letter: "A", correct: false },
    { letter: "B", correct: true },
    { letter: "D", correct: false },
    { letter: "S", correct: false },
  ],
};

const WAVE_BARS = [
  { dur: "0.6s", maxH: 20, delay: "0s" },
  { dur: "0.4s", maxH: 18, delay: "0.05s" },
  { dur: "0.8s", maxH: 22, delay: "0.1s" },
  { dur: "0.5s", maxH: 16, delay: "0.15s" },
  { dur: "0.7s", maxH: 20, delay: "0.2s" },
  { dur: "0.6s", maxH: 24, delay: "0.08s" },
  { dur: "0.9s", maxH: 18, delay: "0.12s" },
];

export default function PrereaderSoundScenePage() {
  const [sceneState, setSceneState] = useState<SceneState>("ready");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [stars, setStars] = useState(QUESTION.stars);

  function handleChoice(idx: number, correct: boolean) {
    if (sceneState === "playing") return;
    setSelectedIdx(idx);
    if (correct) {
      setStars((s) => s + 1);
      setSceneState("correct");
    }
  }

  function switchState(s: SceneState) {
    setSceneState(s);
    if (s === "correct") {
      setSelectedIdx(1);
      setStars(QUESTION.stars + 1);
    } else {
      setSelectedIdx(null);
      setStars(QUESTION.stars);
    }
  }

  const doneSegs = sceneState === "correct" ? QUESTION.doneSegs + 1 : QUESTION.doneSegs;
  const isCorrect = sceneState === "correct";
  const isPlaying = sceneState === "playing";

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes wq-audio-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,209,102,0.3), 0 0 40px rgba(255,209,102,0.15); }
          50% { box-shadow: 0 0 40px rgba(255,209,102,0.6), 0 0 80px rgba(255,209,102,0.25); }
        }
        @keyframes wq-wave-dance {
          0%, 100% { height: 4px; }
          50% { height: var(--max-h); }
        }
        @keyframes wq-seg-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes wq-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>

      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "24px 16px", color: C.text }}>

        {/* Dev state switcher */}
        <div style={{ display: "flex", gap: 8, maxWidth: 900, margin: "0 auto 20px", flexWrap: "wrap" as const }}>
          {(["ready", "playing", "correct"] as SceneState[]).map((s) => (
            <button
              key={s}
              onClick={() => switchState(s)}
              style={{
                ...FONT,
                background: sceneState === s ? C.gold : "#1a1540",
                border: `2px solid ${sceneState === s ? C.gold : C.border}`,
                borderRadius: 8,
                color: sceneState === s ? C.goldDark : "#9b8ec4",
                fontSize: 13, fontWeight: 700,
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              {s === "ready" ? "Ready (Tap to Listen)" : s === "playing" ? "Playing Audio" : "Correct!"}
            </button>
          ))}
        </div>

        {/* Scene card */}
        <div style={{
          background: C.bg,
          border: `2px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
          maxWidth: 900,
          margin: "0 auto",
        }}>

          {/* Top bar */}
          <div style={{
            background: `linear-gradient(135deg, ${C.topbar1}, ${C.topbar2})`,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${C.topbarBorder}`,
          }}>
            <Link href="/play" style={{
              ...FONT,
              background: "rgba(255,209,102,0.15)",
              border: `1.5px solid ${C.gold}`,
              borderRadius: 8,
              color: C.gold,
              fontSize: 11, fontWeight: 700,
              padding: "4px 10px",
              textDecoration: "none",
            }}>
              ← Home
            </Link>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff8e0" }}>{QUESTION.questName}</div>
              <div style={{
                fontSize: 10, marginTop: 1,
                color: isCorrect ? C.correct : isPlaying ? C.gold : C.goldDim,
              }}>
                {isCorrect ? "Q4 ✓ You got it!" : isPlaying ? "Playing sound..." : QUESTION.questSub}
              </div>
            </div>
            <div style={{
              fontSize: 13, fontWeight: 900,
              color: isCorrect ? C.correct : C.gold,
            }}>
              🌟 {stars}{isCorrect ? " +1!" : ""}
            </div>
          </div>

          {/* Progress strip */}
          <div style={{
            display: "flex", gap: 3,
            padding: "8px 20px",
            background: C.topbar2,
            borderBottom: `1px solid ${C.topbar1}`,
          }}>
            {Array.from({ length: QUESTION.totalSegs }).map((_, i) => {
              const isDone = i < doneSegs;
              const isActiveSlot = i === doneSegs;
              let bg = "#2a1800";
              if (isDone) bg = C.gold;
              else if (isActiveSlot) bg = "#f0a000";
              return (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 6, borderRadius: 3, background: bg,
                    animation: isActiveSlot && !isCorrect ? "wq-seg-pulse 1.5s ease-in-out infinite" : "none",
                  }}
                />
              );
            })}
          </div>

          {/* Scene area */}
          <div style={{
            padding: "28px 40px 24px",
            textAlign: "center",
            background: isCorrect
              ? "radial-gradient(ellipse at 50% 30%, rgba(80,232,144,0.08) 0%, transparent 70%)"
              : "linear-gradient(180deg, #100b2e, #12103a)",
          }}>

            {/* Q label */}
            <div style={{
              fontSize: 11, fontWeight: 900,
              color: isCorrect ? C.correct : isPlaying ? C.gold : C.goldDim,
              textTransform: "uppercase" as const,
              letterSpacing: "1.5px",
              marginBottom: 14,
            }}>
              {isCorrect ? "✓ That's right!" : isPlaying ? "🎵 Listen carefully..." : "Listen to the sound — then pick the letter!"}
            </div>

            {/* Audio hero button */}
            <div
              onClick={() => !isCorrect && setSceneState("playing")}
              style={{
                width: 160, height: 160,
                background: isCorrect
                  ? "linear-gradient(135deg, #1a3a20, #2a5a30)"
                  : `linear-gradient(135deg, ${C.topbar1}, #3a2200)`,
                border: `4px solid ${isCorrect ? C.correct : C.gold}`,
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 60,
                margin: "0 auto 16px",
                cursor: isCorrect ? "default" : "pointer",
                boxShadow: isCorrect ? "none" : "0 0 30px rgba(255,209,102,0.2)",
                animation: isPlaying ? "wq-audio-pulse 0.8s ease-in-out infinite" : "none",
                position: "relative",
              }}
            >
              {isCorrect ? "🎵" : "🔊"}
              <div style={{
                fontSize: 11, fontWeight: 900,
                color: isCorrect ? C.correct : C.gold,
                marginTop: 4, letterSpacing: "0.5px",
              }}>
                {isCorrect ? "BUH-BUH-BUH!" : isPlaying ? "PLAYING..." : "TAP TO HEAR"}
              </div>
            </div>

            {/* Wave bars */}
            <div style={{
              display: "flex", gap: 4, alignItems: "center", justifyContent: "center",
              height: 24, marginBottom: 12,
              opacity: isPlaying || isCorrect ? 1 : 0.2,
            }}>
              {WAVE_BARS.slice(0, isCorrect ? 5 : 7).map((bar, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    borderRadius: 3,
                    background: isCorrect ? C.correct : C.gold,
                    height: isPlaying || isCorrect ? 4 : 6,
                    animation: isPlaying || isCorrect
                      ? `wq-wave-dance ${bar.dur} ease-in-out infinite ${bar.delay}`
                      : "none",
                    ["--max-h" as string]: `${bar.maxH}px`,
                  }}
                />
              ))}
            </div>

            {/* Prompt */}
            <div style={{
              fontSize: 20, fontWeight: 900,
              color: isCorrect ? C.correct : C.text,
              marginBottom: 4,
            }}>
              {isCorrect ? "🎉 B makes the buh-buh sound!" : "Which letter makes that sound?"}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              {isCorrect
                ? "You have amazing listening ears!"
                : isPlaying
                ? "The sound is playing — listen close! 👂"
                : "Tap 🔊 to hear the sound, then pick the right letter!"}
            </div>

            {/* Letter choices */}
            <div style={{
              display: "flex", gap: 14, justifyContent: "center", marginBottom: 16,
            }}>
              {QUESTION.choices.map((choice, idx) => {
                const isSelected = selectedIdx === idx;
                let borderColor = C.border;
                let bg = "#1a1540";
                let color = C.text;

                if (isCorrect) {
                  if (choice.correct) {
                    borderColor = C.correct;
                    bg = C.correctBg;
                    color = C.correct;
                  }
                }

                const dimmed = isCorrect && !choice.correct;

                return (
                  <div
                    key={idx}
                    onClick={() => !isPlaying && handleChoice(idx, choice.correct)}
                    style={{
                      width: 80, height: 80,
                      background: bg,
                      border: `3px solid ${borderColor}`,
                      borderRadius: 18,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 40, fontWeight: 900, color,
                      cursor: isPlaying || isCorrect ? "default" : "pointer",
                      opacity: isPlaying ? 0.5 : dimmed ? 0.35 : 1,
                    }}
                  >
                    {choice.letter}
                  </div>
                );
              })}
            </div>

            {/* Correct reward */}
            {isCorrect && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                <div style={{
                  background: C.correctBg,
                  border: `2px solid ${C.correct}`,
                  borderRadius: 12,
                  padding: "8px 18px",
                  fontSize: 14, fontWeight: 900, color: C.correct,
                }}>
                  +1 ⭐
                </div>
              </div>
            )}

            {/* Coach row */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: isCorrect ? C.correctBg : "#1a1540",
              border: isCorrect ? `1px solid ${C.correct}` : isPlaying ? `1px solid ${C.gold}` : "none",
              borderRadius: 12,
              padding: "10px 14px",
              maxWidth: 460, margin: "0 auto 8px",
            }}>
              <div style={{ fontSize: 26 }}>🦁</div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: isCorrect ? C.correct : isPlaying ? C.gold : C.coachText,
              }}>
                {isCorrect
                  ? "Buh-buh-buh = B! Your ears are superpower ears! 🌟"
                  : isPlaying
                  ? "Sshh — listen! What letter makes this sound? 🎵"
                  : "Tap the big sound button to hear the mystery sound! Then find its letter! 👂"}
              </div>
            </div>

            {/* Star safe */}
            {!isCorrect && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "#1a2a15", border: `1.5px solid ${C.correct}`,
                borderRadius: 14, padding: "4px 12px",
                fontSize: 11, fontWeight: 700, color: C.correct,
                marginBottom: 16,
              }}>
                ⭐ Your stars are safe!
              </div>
            )}

            {/* Correct CTA */}
            {isCorrect && (
              <button
                onClick={() => { setSceneState("ready"); setSelectedIdx(null); setStars(QUESTION.stars); }}
                style={{
                  ...FONT,
                  marginTop: 12,
                  background: "linear-gradient(135deg, #ffd166, #f0a000)",
                  border: "none",
                  borderRadius: 12,
                  color: C.goldDark,
                  fontSize: 14, fontWeight: 900,
                  padding: "12px 28px",
                  cursor: "pointer",
                }}
              >
                Next Sound →
              </button>
            )}
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "12px 20px",
            background: C.bg,
            borderTop: `1px solid #1a1540`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            {isCorrect ? (
              <div style={{ fontSize: 12, color: C.correct, fontWeight: 700 }}>✓ Saved!</div>
            ) : isPlaying ? (
              <div style={{
                fontSize: 12, color: C.gold, fontWeight: 700,
                animation: "wq-seg-pulse 1s ease-in-out infinite",
              }}>
                🎵 Listening...
              </div>
            ) : (
              <>
                <button style={{
                  ...FONT, background: "#1a1540",
                  border: `2px solid ${C.gold}`,
                  borderRadius: 10, color: C.gold,
                  fontSize: 12, fontWeight: 700, padding: "8px 14px", cursor: "pointer",
                }}>
                  🔊 Hear again
                </button>
                <button style={{
                  ...FONT, background: "#1a1540",
                  border: `2px solid ${C.border}`,
                  borderRadius: 10, color: C.muted,
                  fontSize: 12, fontWeight: 700, padding: "8px 14px", cursor: "pointer",
                }}>
                  💡 Hint
                </button>
                <button style={{
                  ...FONT, background: "transparent",
                  border: `2px solid rgba(255,123,107,0.27)`,
                  borderRadius: 10, color: C.wrong,
                  fontSize: 12, fontWeight: 700, padding: "8px 14px", cursor: "pointer",
                }}>
                  🤷 I don&apos;t know yet
                </button>
              </>
            )}
          </div>
        </div>

        {/* Back nav */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/play" style={{
            ...FONT,
            display: "inline-block",
            background: "#1a1540",
            border: `2px solid ${C.border}`,
            borderRadius: 10,
            color: C.muted,
            fontSize: 13, fontWeight: 700,
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
