"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#3a3060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#58e8c1",
  correctGreen: "#50e890",
  wrong: "#ff7b6b",
  wrongBg: "#2a0e0e",
  text: "#f0eaff",
  muted: "#8b7fb8",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

type CoachState = "idle" | "speaking" | "celebrating" | "supporting";

const STATE_LABELS: { id: CoachState; label: string }[] = [
  { id: "idle", label: "Idle" },
  { id: "speaking", label: "Speaking" },
  { id: "celebrating", label: "Celebration" },
  { id: "supporting", label: "Wrong Support" },
];

const CHOICES = [
  { letter: "S", phoneme: "sss" },
  { letter: "B", phoneme: "buh" },
  { letter: "D", phoneme: "duh" },
  { letter: "R", phoneme: "rrr" },
];

function WaveBars({ color }: { color: string }) {
  const heights = [14, 20, 12, 18, 16];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 20, marginTop: 6 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 2, background: color,
          height: 4, minHeight: 4,
          animation: `waveDance${i} ${0.4 + i * 0.07}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.05}s`,
        }} />
      ))}
      <style>{`
        @keyframes waveDance0 { 0% { height: 4px; } 100% { height: 14px; } }
        @keyframes waveDance1 { 0% { height: 4px; } 100% { height: 20px; } }
        @keyframes waveDance2 { 0% { height: 4px; } 100% { height: 12px; } }
        @keyframes waveDance3 { 0% { height: 4px; } 100% { height: 18px; } }
        @keyframes waveDance4 { 0% { height: 4px; } 100% { height: 16px; } }
        @keyframes idlePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(155,114,255,0); }
        }
        @keyframes coachSpeak {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
        @keyframes coachCelebrate {
          0% { transform: scale(1) rotate(-5deg); }
          100% { transform: scale(1.12) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

export default function VoiceCoachPage() {
  const [coachState, setCoachState] = useState<CoachState>("idle");

  const isSpeaking = coachState === "speaking";
  const isCelebrating = coachState === "celebrating";
  const isSupporting = coachState === "supporting";
  const isIdle = coachState === "idle";

  // Avatar style per state
  let avatarBorder = C.violet;
  let avatarBg = "linear-gradient(135deg, #2a1858, rgba(155,114,255,0.27))";
  let avatarAnim: string | undefined = undefined;
  let avatarShadow: string | undefined = undefined;

  if (isSpeaking) {
    avatarBorder = C.correctGreen;
    avatarBg = "linear-gradient(135deg, #0d2a1a, rgba(80,232,144,0.2))";
    avatarAnim = "coachSpeak 0.4s ease-in-out infinite alternate";
  } else if (isCelebrating) {
    avatarBorder = C.gold;
    avatarBg = "linear-gradient(135deg, #2a1800, rgba(255,209,102,0.2))";
    avatarAnim = "coachCelebrate 0.6s ease-in-out infinite alternate";
    avatarShadow = "0 0 20px rgba(255,209,102,0.4)";
  }

  const overlayBg = isCelebrating
    ? "linear-gradient(180deg, rgba(18,16,58,0) 0%, rgba(26,18,10,0.93) 30%, #2a1800 100%)"
    : "linear-gradient(180deg, rgba(18,16,58,0) 0%, rgba(18,16,58,0.93) 20%, #1a1440 100%)";

  const bubbleBorder = isCelebrating ? "rgba(255,209,102,0.3)" : "rgba(155,114,255,0.25)";
  const bubbleBg = isCelebrating ? "#2a1800" : C.card;

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0820", minHeight: "100vh", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* State switcher tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
          {STATE_LABELS.map(({ id, label }) => (
            <button key={id} onClick={() => setCoachState(id)} style={{
              padding: "8px 16px", borderRadius: 20,
              border: `2px solid ${coachState === id ? C.violet : "#3a3060"}`,
              background: coachState === id ? C.violet : C.card,
              color: coachState === id ? "#fff" : C.muted,
              ...FONT, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>

        {/* Phone frame */}
        <div style={{
          width: 390, height: 780, background: C.bg,
          borderRadius: 40, border: `2px solid ${C.border}`,
          boxShadow: "0 0 0 2px rgba(155,114,255,0.13), 0 30px 80px rgba(0,0,0,0.7)",
          overflow: "hidden", display: "flex", flexDirection: "column",
          margin: "0 auto", position: "relative",
        }}>

          {/* Play backdrop */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            padding: 20, gap: 14, alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 900, color: C.text, textAlign: "center" }}>
              What sound does 🐝 start with?
            </div>

            {/* Hero */}
            <div style={{
              width: 140, height: 140, background: isCelebrating ? "#0d2a1a" : C.card2,
              borderRadius: 18,
              border: `2px solid ${isCelebrating ? C.correctGreen : C.violet}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 64,
            }}>🐝</div>

            {/* Answer grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
              {CHOICES.map(({ letter, phoneme }) => {
                const isWrongSelected = isSupporting && letter === "S";
                const isCorrectSelected = isCelebrating && letter === "B";
                const isDimmedByCoach = isSpeaking;
                const isDimmedByCorrect = isCelebrating && letter !== "B";

                let bg = C.card2;
                let borderColor = "#3a3060";
                let color = C.text;
                let opacity = 1;

                if (isDimmedByCoach || isDimmedByCorrect) { opacity = 0.35; }
                if (isWrongSelected) { bg = C.wrongBg; borderColor = C.wrong; color = C.wrong; }
                if (isCorrectSelected) { bg = "#0d2a1a"; borderColor = C.correctGreen; }

                return (
                  <div key={letter} style={{
                    background: bg, border: `2px solid ${borderColor}`,
                    borderRadius: 12, height: 80,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 4,
                    fontSize: isCorrectSelected ? "2.2rem" : "1.8rem",
                    fontWeight: 900,
                    color: isCorrectSelected ? C.correctGreen : color,
                    opacity, transition: "opacity 0.3s",
                  }}>
                    <span>{letter}</span>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 900,
                      color: isCorrectSelected ? C.correctGreen : C.muted,
                    }}>
                      {isCorrectSelected ? "buh ✓" : phoneme}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Idle: bottom rail with pulsing avatar dot */}
          {isIdle && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "12px 20px 22px",
              background: C.card,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderRadius: "0 0 40px 40px",
              zIndex: 5,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg, #2a1858, rgba(155,114,255,0.27))",
                border: `2px solid ${C.violet}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem",
                animation: "idlePulse 2.5s ease-in-out infinite",
              }}>🦁</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: "#2a2050", color: C.violet,
                  border: "1px solid #3a3060", ...FONT,
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                }}>🔊 Replay</button>
                <button style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: "rgba(155,114,255,0.1)", color: C.violet,
                  border: "1px solid rgba(155,114,255,0.25)", ...FONT,
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                }}>💡 Hint</button>
              </div>
            </div>
          )}

          {/* Non-idle: coach overlay bottom sheet */}
          {!isIdle && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: overlayBg,
              borderRadius: "0 0 40px 40px",
              padding: "20px 20px 24px",
              display: "flex", flexDirection: "column", gap: 12,
              zIndex: 10,
            }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                {/* Coach avatar */}
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem",
                  border: `3px solid ${avatarBorder}`,
                  background: avatarBg,
                  animation: avatarAnim,
                  boxShadow: avatarShadow,
                }}>🦁</div>

                {/* Speech bubble */}
                <div style={{
                  flex: 1, background: bubbleBg,
                  borderRadius: "14px 14px 14px 4px",
                  padding: "12px 14px",
                  border: `1px solid ${bubbleBorder}`,
                }}>
                  {isSpeaking && (
                    <>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.45 }}>
                        <span style={{ color: C.violet, fontWeight: 900 }}>Buh! Buh! Bee!</span><br />
                        Listen to the very beginning — what letter makes that sound?
                      </div>
                      <WaveBars color={C.correctGreen} />
                    </>
                  )}
                  {isCelebrating && (
                    <>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.45 }}>
                        <span style={{ color: C.gold, fontWeight: 900 }}>✨ Buh-buh-bee! YES!</span><br />
                        B makes that sound — you heard it perfectly! 🎉
                      </div>
                      <WaveBars color={C.gold} />
                    </>
                  )}
                  {isSupporting && (
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.text, lineHeight: 1.45 }}>
                      Not quite — <span style={{ color: C.violet, fontWeight: 900 }}>say "bee" slowly.</span><br />
                      What's the very first sound? Give it another try!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Annotation */}
        <p style={{ textAlign: "center", fontSize: "0.78rem", color: C.muted, marginTop: 12 }}>
          {isIdle && "Coach idle: 44px dot with gentle pulse ring, question is live"}
          {isSpeaking && "Answer cards dimmed during speech — child listens first, then responds"}
          {isCelebrating && "Celebration: gold borders, avatar bounces/rotates, wave bars turn gold"}
          {isSupporting && "Wrong support: coach looks encouraging, not disappointed. Violet border (not red)."}
        </p>
      </div>
    </AppFrame>
  );
}
