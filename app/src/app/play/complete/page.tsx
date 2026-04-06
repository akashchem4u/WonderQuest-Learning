"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  muted: "#9080c0",
  text: "#e8e0ff",
  border: "#2a1f60",
  surface: "#0e0a28",
  surface2: "#1a1440",
} as const;

type CompletionState = "normal" | "perfect" | "badge" | "replay";

export default function PlayCompletePage() {
  const [state, setState] = useState<CompletionState>("normal");

  const STATES: { id: CompletionState; label: string }[] = [
    { id: "normal", label: "Normal Complete" },
    { id: "perfect", label: "Perfect Session" },
    { id: "badge", label: "With New Badge" },
    { id: "replay", label: "Star-Safe Replay" },
  ];

  const confettiDots = Array.from({ length: 16 }, (_, i) => ({
    left: `${5 + i * 6}%`,
    top: `${Math.random() * 20}%`,
    size: 6 + Math.floor(Math.random() * 8),
    color: [C.violet, C.gold, C.mint, "#ff7b6b", "#58e8c1"][i % 5],
    delay: `${i * 0.15}s`,
    duration: `${2 + Math.random() * 2}s`,
  }));

  const isPerfect = state === "perfect";
  const hasBadge = state === "badge";
  const isReplay = state === "replay";

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @keyframes c-fall { 0% { transform: translateY(-10px) rotate(0); opacity: 0.9; } 100% { transform: translateY(600px) rotate(720deg); opacity: 0; } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.4); } 50% { box-shadow: 0 0 0 12px rgba(155,114,255,0); } }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Nunito', system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 48px", gap: 20 }}>

        {/* Dev tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {STATES.map((s) => (
            <button key={s.id} onClick={() => setState(s.id)} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${state === s.id ? C.violet : "#2a2050"}`, background: state === s.id ? C.violet : "#14102a", color: state === s.id ? "#fff" : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', system-ui" }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Star-safe replay overlay */}
        {isReplay ? (
          <div style={{ width: "100%", maxWidth: 960, background: C.base, border: `2px solid ${C.border}`, borderRadius: 24, boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.5)", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(8,5,20,0.9)", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 40 }}>
              <div style={{ background: "#1a2a15", border: "2px solid #50e890", borderRadius: 20, padding: "16px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#50e890" }}>⭐ Stars are Safe!</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#a0e890", textAlign: "center" }}>Playing again won&apos;t change your star count.<br />Practice as much as you like!</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Link href="/play" style={{ height: 52, borderRadius: 26, background: `linear-gradient(135deg, ${C.violet}, #7248e8)`, color: "#fff", fontSize: 16, fontWeight: 900, padding: "0 24px", display: "flex", alignItems: "center", textDecoration: "none" }}>▶ Play Again</Link>
                <Link href="/child" style={{ height: 52, borderRadius: 26, background: C.surface2, border: `1.5px solid ${C.border}`, color: "#b89eff", fontSize: 15, fontWeight: 900, padding: "0 20px", display: "flex", alignItems: "center", textDecoration: "none" }}>Not now</Link>
              </div>
            </div>
            {/* Blurred background content */}
            <div style={{ filter: "blur(3px)", pointerEvents: "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", minHeight: 480 }}>
                <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20, borderRight: `1px solid #1e1850` }}>
                  <div style={{ fontSize: 38, fontWeight: 900, color: "#fff" }}>Session<br />Complete! 🎉</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 48 }}>⭐</span>
                    <div><div style={{ fontSize: 45, fontWeight: 900, color: C.gold }}>7</div><div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Stars earned today</div></div>
                  </div>
                </div>
                <div style={{ padding: "32px 28px", background: C.surface }} />
              </div>
            </div>
          </div>
        ) : (
          /* Normal complete frame */
          <div style={{ width: "100%", maxWidth: 960, background: C.base, border: `2px solid ${C.border}`, borderRadius: 24, boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.5)", overflow: "hidden", position: "relative" }}>
            {/* Confetti */}
            {(isPerfect || hasBadge) && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
                {confettiDots.map((d, i) => (
                  <div key={i} style={{ position: "absolute", left: d.left, top: d.top, width: d.size, height: d.size, borderRadius: "50%", background: d.color, animation: `c-fall ${d.duration} ${d.delay} linear infinite` }} />
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", minHeight: 480, position: "relative", zIndex: 2 }}>
              {/* Left hero */}
              <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 20, borderRight: `1px solid #1e1850` }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 20, padding: "4px 12px", background: isPerfect ? "rgba(255,209,102,0.15)" : "#221960", color: isPerfect ? C.gold : C.violet, border: `1px solid ${isPerfect ? "rgba(255,209,102,0.3)" : "rgba(155,114,255,0.26)"}` }}>
                  K-1 · Beginning Sounds
                </div>
                <div style={{ fontSize: isPerfect ? 38 : 34, fontWeight: 900, lineHeight: 1.15, color: "#fff" }}>
                  {isPerfect ? "PERFECT\nSession! 🌟" : hasBadge ? "Session\nComplete! 🎉" : "Session\nComplete! 🎉"}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#b0a0e0", lineHeight: 1.5 }}>
                  {isPerfect ? "All 5 correct! You're on fire — legendary run!" : "You finished all 5 questions today — great work!"}
                </div>

                {/* Perfect badge */}
                {isPerfect && (
                  <div style={{ background: "linear-gradient(135deg, #3a2000, #1a1000)", border: `2px solid ${C.gold}`, borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 0 16px rgba(255,209,102,0.2)" }}>
                    <span style={{ fontSize: 28 }}>⭐</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#ffe08a" }}>PERFECT SESSION!</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>+3 bonus stars · All 5 correct</div>
                    </div>
                  </div>
                )}

                {/* New badge */}
                {hasBadge && (
                  <div style={{ background: "linear-gradient(135deg, #1a1060, #2a1460)", border: `2px solid ${C.violet}`, borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, animation: "pulse-glow 2s ease-in-out infinite" }}>
                    <span style={{ fontSize: 28 }}>🎵</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>New Badge Unlocked!</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Rhyme Queen 🎵 — mastered rhyming sounds</div>
                    </div>
                  </div>
                )}

                {/* Stars */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 48 }}>⭐</span>
                  <div>
                    <div style={{ fontSize: 45, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{isPerfect ? "10" : "7"}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Stars earned today</div>
                  </div>
                </div>

                {/* Progress segs */}
                <div style={{ display: "flex", gap: 5, width: "100%" }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: isPerfect ? C.gold : C.violet }} />
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, width: "100%" }}>
                  <Link href="/child" style={{ height: 52, borderRadius: 26, background: `linear-gradient(135deg, ${C.violet}, #7248e8)`, color: "#fff", fontSize: 16, fontWeight: 900, padding: "0 24px", display: "flex", alignItems: "center", textDecoration: "none" }}>Continue →</Link>
                  <button onClick={() => setState("replay")} style={{ height: 52, borderRadius: 26, background: C.surface2, border: `1.5px solid ${C.border}`, color: "#b89eff", fontSize: 15, fontWeight: 900, cursor: "pointer", padding: "0 20px", fontFamily: "'Nunito', system-ui" }}>Play Again</button>
                </div>
              </div>

              {/* Right summary */}
              <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16, background: C.surface }}>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6050a0" }}>Session Summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["📝 Questions", "5 of 5"],
                    ["⭐ Stars Earned", isPerfect ? "+10" : "+7", isPerfect ? C.gold : C.gold],
                    ["⚡ XP Earned", isPerfect ? "+80 XP" : "+55 XP", C.violet],
                    ["🔥 Streak", "3 sessions 🔥", C.text],
                  ].map(([label, val, color]) => (
                    <div key={label as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: C.surface2, border: `1.5px solid ${C.border}`, borderRadius: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>{label}</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: (color as string) ?? C.text }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: "auto", background: C.surface2, border: `1.5px solid rgba(155,114,255,0.2)`, borderRadius: 12, padding: "12px 14px" }}>
                  <span style={{ fontSize: 24 }}>🦁</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: C.violet, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Coach Leo</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c8bef0", lineHeight: 1.4 }}>
                      {isPerfect ? "WOW — you got them ALL right! You&apos;re a beginning sounds superstar! 🌟" : "You&apos;re getting really good at beginning sounds! Keep it up tomorrow!"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/play" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>← Back to Play</Link>
          <Link href="/child" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </AppFrame>
  );
}
