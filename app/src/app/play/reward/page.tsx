"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#50e890",
  muted: "#9080c0",
  text: "#e8e0ff",
  border: "#2a1f60",
  surface: "#1a1440",
} as const;

type RewardTab = "boss" | "streak" | "session" | "milestone" | "spec";

const TABS: { id: RewardTab; label: string }[] = [
  { id: "boss", label: "Boss Correct" },
  { id: "streak", label: "Streak 5" },
  { id: "session", label: "Session Bonus" },
  { id: "milestone", label: "Star Milestone" },
  { id: "spec", label: "Spec" },
];

const CONFETTI_DOTS = [
  { bg: "#ffd166", left: "8%", dur: "2.1s", delay: "0s" },
  { bg: "#9b72ff", left: "18%", dur: "1.8s", delay: "0.2s" },
  { bg: "#58e8c1", left: "30%", dur: "2.3s", delay: "0.1s" },
  { bg: "#ff7b6b", left: "45%", dur: "1.9s", delay: "0.35s" },
  { bg: "#ffd166", left: "60%", dur: "2.0s", delay: "0.05s" },
  { bg: "#9b72ff", left: "72%", dur: "2.2s", delay: "0.28s" },
  { bg: "#58e8c1", left: "85%", dur: "1.85s", delay: "0.15s" },
  { bg: "#ff7b6b", left: "92%", dur: "2.05s", delay: "0.4s" },
  { bg: "#ffd166", left: "25%", dur: "2.4s", delay: "0.6s", w: 8, h: 8 },
  { bg: "#9b72ff", left: "55%", dur: "1.7s", delay: "0.8s", w: 5, h: 5 },
  { bg: "#58e8c1", left: "70%", dur: "2.15s", delay: "0.3s", w: 7, h: 3 },
];

export default function PlayRewardPage() {
  const [tab, setTab] = useState<RewardTab>("boss");

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @keyframes burst-out { 0% { transform: scale(0.3); opacity: 0.7; } 100% { transform: scale(2.8); opacity: 0; } }
        @keyframes hero-pop { from { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } to { transform: scale(1); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes chip-pop { from { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); } to { transform: scale(1); opacity: 1; } }
        @keyframes star-bump { from { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.3); } to { transform: scale(1); opacity: 1; } }
        @keyframes tap-hint-pulse { 0%,100% { opacity: 0.45; } 50% { opacity: 0.8; } }
        @keyframes dot-pop { from { transform: scale(0); } 60% { transform: scale(1.3); } to { transform: scale(1); } }
        @keyframes confetti-fall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(700px) rotate(720deg); opacity: 0; } }
        @keyframes xp-grow { from { width: 0; } to { width: 78%; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Nunito', system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 48px", gap: 20 }}>

        {/* Back nav */}
        <div style={{ width: "100%", maxWidth: 960, display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/play/session" style={{ fontSize: 13, fontWeight: 900, color: C.violet, textDecoration: "none" }}>← Back</Link>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#6050a0", letterSpacing: "0.04em" }}>play-reward-pulse-overlay · WonderQuest</span>
        </div>

        {/* Dev tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${tab === t.id ? C.violet : "#2a2050"}`, background: tab === t.id ? C.violet : "#14102a", color: tab === t.id ? "#fff" : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', system-ui" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Boss Correct ── */}
        {tab === "boss" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6, maxWidth: 390, width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>Boss Correct — Gold Burst</div>
              Shown when child answers the boss question (last question, hard/milestone). Gold radial gradient bg, 3 burst rings, big ⭐ hero emoji. "+2 ⭐ Boss!" chip (boss earns double stars). Coach celebrates inline. Auto-dismiss after 2.5s or on tap.
            </div>
            <div style={{ width: 390, height: 700, borderRadius: 40, background: C.base, border: "2.5px solid #2a1f60", boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.53)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              {/* Dimmed question behind */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "20px 16px 16px", gap: 14, filter: "brightness(0.3) blur(1px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 4, flex: 1 }}>
                    {[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: C.violet }} />)}
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.gold }} />
                  </div>
                  <div style={{ background: "#1a1440", border: "1.5px solid rgba(155,114,255,0.33)", borderRadius: 20, padding: "4px 10px", fontSize: 13, fontWeight: 900, color: "#c0a8ff", marginLeft: 10 }}>⭐ 8</div>
                </div>
                <div style={{ background: "#1a1440", border: "2px solid rgba(155,114,255,0.4)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 40 }}>🐝</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "auto" }}>
                  <div style={{ background: "#0d2018", border: "2px solid #50e890", borderRadius: 14, height: 76, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 29, fontWeight: 900, color: C.text }}>B</div>
                  {["S","D","R"].map(l => <div key={l} style={{ background: "#1a1440", border: "2px solid #2a1f60", borderRadius: 14, height: 76, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 29, fontWeight: 900, color: C.text }}>{l}</div>)}
                </div>
              </div>

              {/* Gold overlay */}
              <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 20, background: "radial-gradient(ellipse at center, rgba(60,40,0,0.95) 0%, rgba(16,11,46,0.98) 70%)" }}>
                {/* Burst rings */}
                {[
                  { color: "#ffd16688", delay: "0s" },
                  { color: "#ff9b2044", delay: "0.15s" },
                  { color: "#ffd16633", delay: "0.3s" },
                ].map((r, i) => (
                  <div key={i} style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", border: `2px solid ${r.color}`, animation: `burst-out 0.8s ${r.delay} ease-out forwards`, opacity: 0, pointerEvents: "none" }} />
                ))}

                {/* Star counter */}
                <div style={{ position: "absolute", top: 24, right: 20, background: "rgba(10,5,30,0.75)", border: "1.5px solid rgba(255,209,102,0.4)", borderRadius: 20, padding: "5px 12px", fontSize: 14, fontWeight: 900, color: "#ffe08a", animation: "star-bump 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>⭐ 10</div>

                <div style={{ fontSize: 80, position: "relative", zIndex: 2, animation: "hero-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>⭐</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.gold, textAlign: "center", position: "relative", zIndex: 2, animation: "fade-up 0.4s 0.2s ease-out both" }}>Boss Complete!</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#ffe8a0", textAlign: "center", position: "relative", zIndex: 2, animation: "fade-up 0.4s 0.35s ease-out both" }}>That was the hardest one — you nailed it!</div>
                <div style={{ background: "linear-gradient(135deg, #ffd166, #f0a000)", color: "#1a0c00", borderRadius: 24, padding: "8px 24px", fontSize: 16, fontWeight: 900, position: "relative", zIndex: 2, animation: "chip-pop 0.45s 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>+2 ⭐ Boss Bonus!</div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(26,16,64,0.85)", border: "1.5px solid rgba(255,209,102,0.2)", borderRadius: 14, padding: "10px 14px", position: "relative", zIndex: 2, width: "100%", animation: "fade-up 0.4s 0.55s ease-out both" }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>🦁</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#ffe8a0", lineHeight: 1.4 }}>You were amazing on that one! 🎉</span>
                </div>

                <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", animation: "tap-hint-pulse 1.5s ease-in-out infinite" }}>Tap to continue</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Streak 5 ── */}
        {tab === "streak" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6, maxWidth: 390, width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>Streak 5 — "On Fire!" Violet Burst</div>
              5 correct answers in a row. Violet radial gradient. 5-dot chain animates in (last dot gold). Flame hero emoji. "+1 ⭐ Streak!" chip. No extra stars beyond normal — chip is motivational. Coach: "You're on a roll!" Auto-dismiss 2.5s or tap.
            </div>
            <div style={{ width: 390, height: 700, borderRadius: 40, background: C.base, border: "2.5px solid #2a1f60", boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.53)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              {/* Dimmed question behind */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "20px 16px 16px", gap: 14, filter: "brightness(0.3) blur(1px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 4, flex: 1 }}>
                    {[0,1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: C.violet }} />)}
                  </div>
                  <div style={{ background: "#1a1440", border: "1.5px solid rgba(155,114,255,0.33)", borderRadius: 20, padding: "4px 10px", fontSize: 13, fontWeight: 900, color: "#c0a8ff", marginLeft: 10 }}>⭐ 9</div>
                </div>
                <div style={{ background: "#1a1440", border: "2px solid rgba(155,114,255,0.4)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 40 }}>🔢</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "auto" }}>
                  {["6","7","8","5"].map((n, i) => (
                    <div key={n} style={{ background: i === 1 ? "#0d2018" : "#1a1440", border: `2px solid ${i === 1 ? "#50e890" : "#2a1f60"}`, borderRadius: 14, height: 76, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 29, fontWeight: 900, color: C.text }}>{n}</div>
                  ))}
                </div>
              </div>

              {/* Streak overlay */}
              <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 20, background: "radial-gradient(ellipse at center, rgba(30,10,80,0.95) 0%, rgba(16,11,46,0.98) 70%)" }}>
                {[
                  { color: "#9b72ff88", delay: "0s" },
                  { color: "#9b72ff44", delay: "0.15s" },
                ].map((r, i) => (
                  <div key={i} style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", border: `2px solid ${r.color}`, animation: `burst-out 0.8s ${r.delay} ease-out forwards`, opacity: 0, pointerEvents: "none" }} />
                ))}

                <div style={{ position: "absolute", top: 24, right: 20, background: "rgba(10,5,30,0.75)", border: "1.5px solid rgba(155,114,255,0.4)", borderRadius: 20, padding: "5px 12px", fontSize: 14, fontWeight: 900, color: "#c0a8ff", animation: "star-bump 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>⭐ 10</div>

                {/* 5-dot streak chain */}
                <div style={{ display: "flex", gap: 6, zIndex: 2, animation: "fade-up 0.4s 0.1s ease-out both" }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i === 4 ? C.gold : C.violet, animation: `dot-pop 0.3s ${0.05 + i * 0.07}s cubic-bezier(0.34,1.56,0.64,1) both` }} />
                  ))}
                </div>

                <div style={{ fontSize: 80, position: "relative", zIndex: 2, animation: "hero-pop 0.5s 0.15s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>🔥</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", textAlign: "center", position: "relative", zIndex: 2, animation: "fade-up 0.4s 0.2s ease-out both" }}>On Fire!</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#c9a8ff", textAlign: "center", position: "relative", zIndex: 2, animation: "fade-up 0.4s 0.35s ease-out both" }}>5 in a row — you're unstoppable!</div>
                <div style={{ background: "linear-gradient(135deg, #9b72ff, #7248e8)", borderRadius: 24, padding: "8px 24px", fontSize: 16, fontWeight: 900, color: "#fff", position: "relative", zIndex: 2, animation: "chip-pop 0.45s 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>🔥 Streak Bonus!</div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(26,16,64,0.85)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "10px 14px", position: "relative", zIndex: 2, width: "100%", animation: "fade-up 0.4s 0.55s ease-out both" }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>🦁</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#d0c8f8", lineHeight: 1.4 }}>You're on a roll! Keep it going! 🚀</span>
                </div>

                <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", animation: "tap-hint-pulse 1.5s ease-in-out infinite" }}>Tap to continue</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Session Bonus ── */}
        {tab === "session" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6, maxWidth: 390, width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>Session Bonus — All 5 Questions Complete</div>
              Shown after completing all 5 session questions (not every session — only when a bonus condition is met). Confetti particles, trophy emoji, green "Session Complete!" chip. Usually leads directly to session complete screen after 2.5s. Stars counter shows final tally.
            </div>
            <div style={{ width: 390, height: 700, borderRadius: 40, background: C.base, border: "2.5px solid #2a1f60", boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.53)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              {/* Dimmed question behind */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "20px 16px 16px", gap: 14, filter: "brightness(0.3) blur(1px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 4, flex: 1 }}>
                    {[0,1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: C.violet }} />)}
                  </div>
                  <div style={{ background: "#1a1440", border: "1.5px solid rgba(155,114,255,0.33)", borderRadius: 20, padding: "4px 10px", fontSize: 13, fontWeight: 900, color: "#c0a8ff", marginLeft: 10 }}>⭐ 12</div>
                </div>
              </div>

              {/* Session overlay */}
              <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 20, background: "radial-gradient(ellipse at center, rgba(10,30,50,0.95) 0%, rgba(16,11,46,0.98) 70%)" }}>
                {/* Confetti */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
                  {CONFETTI_DOTS.map((d, i) => (
                    <div key={i} style={{ position: "absolute", width: d.w ?? 6, height: d.h ?? 6, borderRadius: "50%", background: d.bg, left: d.left, animation: `confetti-fall ${d.dur} ${d.delay} linear infinite` }} />
                  ))}
                </div>

                <div style={{ position: "absolute", top: 24, right: 20, background: "rgba(10,5,30,0.75)", border: "1.5px solid rgba(80,232,144,0.27)", borderRadius: 20, padding: "5px 12px", fontSize: 14, fontWeight: 900, color: "#50e890", animation: "star-bump 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both", zIndex: 5 }}>⭐ 12</div>

                <div style={{ fontSize: 80, position: "relative", zIndex: 2, animation: "hero-pop 0.5s 0.05s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>🏆</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", textAlign: "center", position: "relative", zIndex: 2, animation: "fade-up 0.4s 0.2s ease-out both" }}>Session Complete!</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#b0e8d0", textAlign: "center", position: "relative", zIndex: 2, animation: "fade-up 0.4s 0.35s ease-out both" }}>You finished all 5 questions — amazing!</div>
                <div style={{ background: "linear-gradient(135deg, #50e890, #30b060)", color: "#051a10", borderRadius: 24, padding: "8px 24px", fontSize: 16, fontWeight: 900, position: "relative", zIndex: 2, animation: "chip-pop 0.45s 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>✓ All 5 Done!</div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(10,30,20,0.85)", border: "1.5px solid rgba(80,232,144,0.2)", borderRadius: 14, padding: "10px 14px", position: "relative", zIndex: 2, width: "100%", animation: "fade-up 0.4s 0.55s ease-out both" }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>🦁</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#a0e8b8", lineHeight: 1.4 }}>Awesome session! See you next time! 🎊</span>
                </div>

                <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", animation: "tap-hint-pulse 1.5s ease-in-out infinite", zIndex: 5 }}>Tap to see your results</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Star Milestone ── */}
        {tab === "milestone" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6, maxWidth: 390, width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>Star Milestone — First 10 Stars / Level Up</div>
              Triggered when child crosses a star milestone (10, 25, 50, 100…). Level badge with emoji, XP bar fills in. "You leveled up!" message. Chip shows new level name. XP bar animation: width 0 → 78% (partial next level). Leads to level-up overlay screen after tap.
            </div>
            <div style={{ width: 390, height: 700, borderRadius: 40, background: C.base, border: "2.5px solid #2a1f60", boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.53)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              {/* Dimmed question behind */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "20px 16px 16px", gap: 14, filter: "brightness(0.3) blur(1px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 4, flex: 1 }}>
                    {[0,1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: C.violet }} />)}
                  </div>
                  <div style={{ background: "#1a1440", border: "1.5px solid rgba(155,114,255,0.33)", borderRadius: 20, padding: "4px 10px", fontSize: 13, fontWeight: 900, color: "#c0a8ff", marginLeft: 10 }}>⭐ 10</div>
                </div>
              </div>

              {/* Level milestone overlay */}
              <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 20, background: "radial-gradient(ellipse at center, rgba(20,20,60,0.95) 0%, rgba(16,11,46,0.98) 70%)" }}>
                {[
                  { color: "#9b72ff66", delay: "0s", size: 140 },
                  { color: "#ffd16633", delay: "0.2s", size: 140 },
                ].map((r, i) => (
                  <div key={i} style={{ position: "absolute", width: r.size, height: r.size, borderRadius: "50%", border: `2px solid ${r.color}`, animation: `burst-out 0.8s ${r.delay} ease-out forwards`, opacity: 0, pointerEvents: "none" }} />
                ))}

                <div style={{ position: "absolute", top: 24, right: 20, background: "rgba(10,5,30,0.75)", border: "1.5px solid rgba(155,114,255,0.4)", borderRadius: 20, padding: "5px 12px", fontSize: 14, fontWeight: 900, color: "#c0a8ff", animation: "star-bump 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>⭐ 10</div>

                {/* Level badge */}
                <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #9b72ff, #7248e8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: "0 0 0 8px rgba(155,114,255,0.15), 0 0 0 16px rgba(155,114,255,0.06)", animation: "hero-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards", position: "relative", zIndex: 2 }}>🌟</div>

                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", textAlign: "center", position: "relative", zIndex: 2, animation: "fade-up 0.4s 0.2s ease-out both" }}>Level Up!</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#c9a8ff", textAlign: "center", position: "relative", zIndex: 2, animation: "fade-up 0.4s 0.35s ease-out both" }}>You reached <strong style={{ color: C.gold }}>Star Explorer</strong>!</div>
                <div style={{ background: "linear-gradient(135deg, #9b72ff, #7248e8)", borderRadius: 24, padding: "8px 24px", fontSize: 16, fontWeight: 900, color: "#fff", position: "relative", zIndex: 2, animation: "chip-pop 0.45s 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>⭐ 10 Stars Earned!</div>

                {/* XP bar */}
                <div style={{ width: "100%", zIndex: 2, animation: "fade-up 0.4s 0.4s ease-out both" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#8070b0", marginBottom: 4 }}>
                    <span>Explorer → Adventurer</span>
                    <span style={{ color: C.violet }}>78 / 100 XP</span>
                  </div>
                  <div style={{ height: 10, background: "#1a1440", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "linear-gradient(90deg, #9b72ff, #ffd166)", borderRadius: 5, animation: "xp-grow 0.6s 0.5s ease-out both", width: "78%" }} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(26,16,64,0.85)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "10px 14px", position: "relative", zIndex: 2, width: "100%", animation: "fade-up 0.4s 0.55s ease-out both" }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>🦁</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#d0c8f8", lineHeight: 1.4 }}>You're a Star Explorer now! Next: Adventurer! ⚔️</span>
                </div>

                <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", animation: "tap-hint-pulse 1.5s ease-in-out infinite" }}>Tap to see your badge</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Spec ── */}
        {tab === "spec" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 760, width: "100%" }}>
            {[
              {
                title: "Trigger Conditions",
                items: [
                  "Boss correct: last question of session was boss type and answered correctly",
                  "Streak 5: 5 correct answers in a row (session-scoped)",
                  "Session bonus: all 5 done + any bonus condition (boss/streak/milestone)",
                  "Star milestone: star count crosses 10/25/50/100/250…",
                  { text: "❌ Never show on normal correct answers", bad: true },
                  { text: "❌ Never stack two overlays back-to-back", bad: true },
                ],
              },
              {
                title: "Dismiss Rules",
                items: [
                  "Auto-dismiss: 2.5s after animation peak (not from start)",
                  "Safety cap: always dismiss ≤3s regardless",
                  "Tap-to-dismiss: fires immediately on any tap",
                  '"Tap to continue" hint: pulsing, appears after 0.8s delay',
                  "On dismiss: transition to next screen (session complete / next Q)",
                  { text: "❌ Never block child longer than 3s", bad: true },
                ],
              },
              {
                title: "Star Counter",
                items: [
                  "Always visible at top-right of overlay",
                  "Shows POST-reward total (already incremented)",
                  "star-bump animation at 0.2s delay",
                  "Background: semi-transparent dark pill",
                  "Boss node star badge: gold border + gold text",
                  { text: "❌ Never shows decremented or old count", bad: true },
                ],
              },
              {
                title: "Animations",
                items: [
                  "Hero emoji: hero-pop — scale 0.3→1.15→1, 0.5s spring",
                  "Burst rings: burst-out — scale 0.3→2.8, opacity 0.7→0, 0.8s",
                  "Chip: chip-pop — scale 0.4→1.15→1, 0.45s spring, 0.4s delay",
                  "Coach row: fade-up — 0.4s, 0.55s delay",
                  "Confetti: confetti-fall — 1.7–2.4s per dot, infinite",
                  "XP bar: xp-grow — width 0→target, 0.6s, 0.5s delay",
                ],
              },
              {
                title: "Boss Star Award",
                items: [
                  "Boss correct = +2 ⭐ (double the normal +1)",
                  'Chip reads "+2 ⭐ Boss Bonus!" — explicit about amount',
                  "XP also doubled for boss completion",
                  "Streak bonus chip is motivational — no extra stars (still +1)",
                  "Session complete chip: no extra stars — celebrates completion",
                  "Star milestone: no extra stars — celebrates cumulative total",
                ],
              },
              {
                title: "Coach in Overlay",
                items: [
                  "Coach: speech bubble + emoji only — NO TTS during overlay",
                  "TTS would clash with transition animation + be too long",
                  "After overlay: normal coach behavior resumes",
                  "4 personas: same text different emoji (Leo/Buddy/Whisper/Zap)",
                  "Coach row: semi-transparent bg, glass-morphism feel",
                ],
              },
            ].map((card) => (
              <div key={card.title} style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>{card.title}</div>
                <ul style={{ paddingLeft: 14 }}>
                  {card.items.map((item, i) => {
                    const isBad = typeof item === "object" && item.bad;
                    const text = typeof item === "string" ? item : item.text;
                    return <li key={i} style={{ marginBottom: 3, color: isBad ? "#8a1010" : undefined }}>{text}</li>;
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

      </div>
    </AppFrame>
  );
}
