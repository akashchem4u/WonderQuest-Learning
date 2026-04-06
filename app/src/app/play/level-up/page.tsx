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

type LevelTab = "entry" | "perks" | "bands" | "spec";

const TABS: { id: LevelTab; label: string }[] = [
  { id: "entry", label: "Entry Animation" },
  { id: "perks", label: "Perks Panel" },
  { id: "bands", label: "Band Variants" },
  { id: "spec", label: "Spec" },
];

const PARTICLES = [
  { size: 5, bg: "#9b72ff", left: "12%", dur: "3.2s", delay: "0.1s" },
  { size: 4, bg: "#ffd166", left: "28%", dur: "2.8s", delay: "0.6s" },
  { size: 6, bg: "#58e8c1", left: "50%", dur: "3.5s", delay: "0.3s" },
  { size: 4, bg: "#ff7b6b", left: "70%", dur: "2.9s", delay: "0.9s" },
  { size: 5, bg: "#9b72ff", left: "85%", dur: "3.1s", delay: "0.2s" },
  { size: 3, bg: "#ffd166", left: "40%", dur: "2.6s", delay: "1.2s" },
];

export default function PlayLevelUpPage() {
  const [tab, setTab] = useState<LevelTab>("entry");

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @keyframes p-float { 0% { transform: translateY(700px) scale(0.5); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.5; } 100% { transform: translateY(-20px) scale(1.2); opacity: 0; } }
        @keyframes bump-in { from { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.2); } to { transform: scale(1); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes badge-drop { from { transform: translateY(-60px) scale(0.4); opacity: 0; } 70% { transform: translateY(6px) scale(1.05); } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes xp-surge { 0% { width: 0; } 40% { width: 100%; } 60% { width: 100%; } 100% { width: 22%; } }
        @keyframes xp-overflow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Nunito', system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 48px", gap: 20 }}>

        {/* Back nav */}
        <div style={{ width: "100%", maxWidth: 960, display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/play/session" style={{ fontSize: 13, fontWeight: 900, color: C.violet, textDecoration: "none" }}>← Back</Link>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#6050a0", letterSpacing: "0.04em" }}>play-level-up-overlay · WonderQuest</span>
        </div>

        {/* Dev tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${tab === t.id ? C.violet : "#2a2050"}`, background: tab === t.id ? C.violet : "#14102a", color: tab === t.id ? "#fff" : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', system-ui" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Entry Animation ── */}
        {tab === "entry" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6, maxWidth: 390, width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>Entry Animation — Badge Drops, XP Bar Surges</div>
              Badge drops from top with spring physics. Particles float upward. XP bar surges to 100% then resets to show progress in new level (22% shown). Previous level label shows progression. "See What's New →" CTA. No auto-dismiss — child must tap to proceed.
            </div>
            <div style={{ width: 390, height: 700, borderRadius: 40, background: C.base, border: "2.5px solid #2a1f60", boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.53)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              {/* Level-up overlay */}
              <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "radial-gradient(ellipse at 50% 40%, rgba(28,14,80,0.97) 0%, rgba(10,5,30,0.99) 70%)", display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 24px 32px", gap: 14 }}>
                {/* Particles */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
                  {PARTICLES.map((p, i) => (
                    <div key={i} style={{ position: "absolute", width: p.size, height: p.size, borderRadius: "50%", background: p.bg, left: p.left, animation: `p-float ${p.dur} ${p.delay} linear infinite`, opacity: 0 }} />
                  ))}
                </div>

                {/* Star counter */}
                <div style={{ position: "absolute", top: 22, right: 20, zIndex: 5, background: "rgba(10,5,30,0.8)", border: "1.5px solid rgba(155,114,255,0.4)", borderRadius: 20, padding: "5px 12px", fontSize: 14, fontWeight: 900, color: "#c0a8ff", animation: "bump-in 0.4s 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>⭐ 25</div>

                {/* Banner */}
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: C.violet, opacity: 0.8, zIndex: 2, animation: "fade-in 0.4s ease-out" }}>✨ Level Up!</div>

                {/* Badge */}
                <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #9b72ff, #5a28e8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 56, boxShadow: "0 0 0 10px rgba(155,114,255,0.12), 0 0 0 20px rgba(155,114,255,0.05), 0 0 40px rgba(155,114,255,0.3)", zIndex: 2, animation: "badge-drop 0.6s 0.1s cubic-bezier(0.34,1.56,0.64,1) both" }}>🌟</div>

                {/* Level name */}
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", textAlign: "center", zIndex: 2, animation: "fade-in 0.4s 0.5s ease-out both" }}>Star Explorer</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#b89eff", textAlign: "center", zIndex: 2, animation: "fade-in 0.4s 0.65s ease-out both" }}>You reached Level 3 — keep climbing!</div>

                {/* Previous level */}
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6050a0", textAlign: "center", zIndex: 2, animation: "fade-in 0.3s 0.6s ease-out both" }}>↑ From Trailblazer (Level 2)</div>

                {/* XP bar */}
                <div style={{ width: "100%", zIndex: 2, animation: "fade-in 0.4s 0.7s ease-out both" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#8070b0", marginBottom: 5 }}>
                    <span>Star Explorer</span>
                    <span>22 / 100 XP</span>
                  </div>
                  <div style={{ height: 10, background: "#1a1440", borderRadius: 5, overflow: "hidden", position: "relative" }}>
                    {/* Previous fill (dim) */}
                    <div style={{ height: "100%", background: "#2a2050", borderRadius: 5, position: "absolute", left: 0, width: "80%" }} />
                    {/* Surge fill */}
                    <div style={{ height: "100%", background: "linear-gradient(90deg, #9b72ff, #ffd166)", borderRadius: 5, width: 0, animation: "xp-surge 0.8s 0.8s ease-out forwards", position: "absolute", left: 0 }} />
                  </div>
                </div>

                {/* CTA */}
                <button style={{ width: "100%", height: 54, borderRadius: 27, border: "none", background: "linear-gradient(135deg, #9b72ff, #7248e8)", color: "#fff", fontSize: 16, fontWeight: 900, cursor: "pointer", zIndex: 2, marginTop: "auto", animation: "fade-in 0.4s 1s ease-out both", fontFamily: "'Nunito', system-ui" }}>
                  See What's New →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Perks Panel ── */}
        {tab === "perks" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6, maxWidth: 390, width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>Perks Panel — What the New Level Unlocks</div>
              Second screen after tapping "See What's New →". Shows 2–3 unlocked features/perks. Tap "Let's go!" to dismiss and continue session. Perks are motivational context — not critical path.
            </div>
            <div style={{ width: 390, height: 700, borderRadius: 40, background: C.base, border: "2.5px solid #2a1f60", boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.53)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              {/* Perks overlay */}
              <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "linear-gradient(180deg, #1a1040 0%, #100b2e 100%)", display: "flex", flexDirection: "column", padding: "28px 24px 32px", gap: 14 }}>
                {/* Header */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #9b72ff, #5a28e8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 0 0 4px rgba(155,114,255,0.15)" }}>🌟</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Star Explorer — Level 3</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.violet }}>Here's what you just unlocked!</div>
                    </div>
                  </div>
                </div>

                {/* Perk list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {[
                    { icon: "🗺️", title: "New World Region", desc: "The Enchanted Forest is now open — explore new quests!" },
                    { icon: "🎨", title: "New Avatar Outfit", desc: "The Explorer Cape is yours — check your avatar page!" },
                    { icon: "⚡", title: "Bonus Stars Unlocked", desc: "Boss questions now award +3 ⭐ instead of +2!" },
                  ].map((perk) => (
                    <div key={perk.title} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#1e1840", border: "1.5px solid rgba(155,114,255,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                      <span style={{ fontSize: 26, flexShrink: 0 }}>{perk.icon}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{perk.title}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#9080c0", lineHeight: 1.4 }}>{perk.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button style={{ height: 54, borderRadius: 27, border: "none", background: "linear-gradient(135deg, #9b72ff, #7248e8)", color: "#fff", fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "'Nunito', system-ui" }}>
                  Let's go! 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Band Variants ── */}
        {tab === "bands" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6, maxWidth: 760, width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>Band Variants — Level Name System</div>
              Each band has its own level name progression. Names are themed to the band's content world. XP thresholds are the same across bands — only names differ.
            </div>

            {/* Main band table */}
            <div style={{ width: "100%", maxWidth: 760, background: "#14102a", border: "1.5px solid #2a2050", borderRadius: 12, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", gap: 0, borderBottom: "1px solid #1e1850", padding: "10px 14px", background: "#1a1440" }}>
                <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6050a0" }}>Level</div>
                <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6050a0" }}>Pre-K (Gold)</div>
                <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6050a0" }}>K-1 (Violet)</div>
                <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6050a0" }}>G2-3 (Mint)</div>
              </div>
              {[
                { lvl: "1", cells: ["🌱 Seedling", "🔤 Letter Finder", "🔢 Number Cub"], em: [] },
                { lvl: "2", cells: ["🌸 Bloomer", "🔊 Sound Hunter", "✖️ Skip Counter"], em: [0] },
                { lvl: "3", cells: ["🌟 Shining Star", "🌟 Star Explorer", "📐 Pattern Seeker"], em: [1] },
                { lvl: "4", cells: ["🦋 Wonder Wings", "📚 Word Wizard", "🧮 Math Adventurer"], em: [2] },
                { lvl: "5", cells: ["🏆 Quest Champion", "🏆 Reading Champion", "🏆 Math Champion"], em: [] },
              ].map((row) => (
                <div key={row.lvl} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", gap: 0, borderBottom: "1px solid #1e1850", padding: "10px 14px", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#6050a0" }}>{row.lvl}</div>
                  {row.cells.map((cell, ci) => (
                    <div key={ci} style={{ fontSize: 12, fontWeight: row.em.includes(ci) ? 900 : 700, color: row.em.includes(ci) ? "#fff" : "#b0a0e0" }}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>

            {/* G4-5 table */}
            <div style={{ width: "100%", maxWidth: 760, background: "#14102a", border: "1.5px solid #2a2050", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", gap: 0, borderBottom: "1px solid #1e1850", padding: "10px 14px", background: "#1a1440" }}>
                <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6050a0" }}>Level</div>
                <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6050a0", gridColumn: "2 / 5" }}>G4-5 (Coral) — Level Names</div>
              </div>
              {[
                { lvl: "1", cells: ["📖 Story Starter", "🔍 Clue Finder", "✏️ Word Shaper"], em: [] },
                { lvl: "2", cells: ["🧩 Puzzle Solver", "🌟 Inference Master", "⚡ Deep Thinker"], em: [1] },
                { lvl: "5", cells: ["🏆 Quest Champion", "", ""], em: [] },
              ].map((row) => (
                <div key={row.lvl} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", gap: 0, borderBottom: "1px solid #1e1850", padding: "10px 14px", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#6050a0" }}>{row.lvl}</div>
                  {row.cells.map((cell, ci) => (
                    <div key={ci} style={{ fontSize: 12, fontWeight: row.em.includes(ci) ? 900 : 700, color: row.em.includes(ci) ? "#fff" : "#b0a0e0" }}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Spec ── */}
        {tab === "spec" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 760, width: "100%" }}>
            {[
              {
                title: "Trigger Logic",
                items: [
                  "Fires when XP total crosses level threshold",
                  "Thresholds: L1=0, L2=50XP, L3=150XP, L4=300XP, L5=500XP",
                  "XP per action: correct=10, boss=20, streak5=15, session=5 bonus",
                  "Level-up overlay is shown at END of session, not mid-session",
                  { text: "❌ Never interrupt active play for level-up", bad: true },
                  { text: "✅ Queue level-up to show after session-complete screen", good: true },
                ],
              },
              {
                title: "Flow",
                items: [
                  "Entry Animation → Perks Panel → Dismiss (3 taps max)",
                  'Entry: badge drop + XP surge + "See What\'s New" CTA',
                  'Perks: 2–3 unlock cards + "Let\'s go!" CTA',
                  "No auto-dismiss — child must engage",
                  "After dismiss: back to home hub or session complete",
                  "First level-up ever: extra confetti in particles",
                ],
              },
              {
                title: "Badge Dimensions",
                items: [
                  "Entry badge: 120px diameter",
                  "Perks panel badge: 48px (small row badge)",
                  "Shadow rings: 0 0 0 10px / 20px rgba(accent,0.12/0.05)",
                  "Gradient: band accent → darker shade",
                  "Animation: badge-drop — translateY(-60px)→0, 0.6s spring",
                  "Font inside: band emoji (🌟 for K-1 at L3)",
                ],
              },
              {
                title: "XP Bar Surge",
                items: [
                  "Bar surges to 100% then snaps back to start of new level",
                  "Surge keyframe: 0%→100% (0.8s) → 22% (overflow, 0.4s)",
                  "Overflow shows progress in new level immediately",
                  "Color: linear-gradient(90deg, band-accent, #ffd166)",
                  "Previous level track: #2a2050 (dim background fill)",
                ],
              },
            ].map((card) => (
              <div key={card.title} style={{ background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10, padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "#3a2800", lineHeight: 1.6 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#7a4800", marginBottom: 6 }}>{card.title}</div>
                <ul style={{ paddingLeft: 14 }}>
                  {card.items.map((item, i) => {
                    const isBad = typeof item === "object" && item.bad;
                    const isGood = typeof item === "object" && item.good;
                    const text = typeof item === "string" ? item : item.text;
                    return (
                      <li key={i} style={{ marginBottom: 3, color: isBad ? "#8a1010" : isGood ? "#1a6030" : undefined }}>
                        {text}
                      </li>
                    );
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
