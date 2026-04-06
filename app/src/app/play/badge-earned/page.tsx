"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg: "#100b2e",
  card: "#1e1840",
  border: "#2a2060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#50e890",
  text: "#e8e0ff",
  muted: "#9080c0",
  dimBorder: "#2a1f60",
};

type TabId = "reveal" | "detail" | "gallery";

// ─── Stub badge data ──────────────────────────────────────────────────────────
const BADGE = {
  emoji: "🦁",
  name: "Comeback Kid",
  rarity: "Legendary" as const,
  rarityColor: C.gold,
  serialNum: "042",
  serialTotal: "999",
  bonusXP: 50,
  desc: "Only the most determined learners earn this badge. You hit a tough question, asked for help, and kept going until you got it!",
  howEarned: `Used "I don't know yet" on a question, then correctly answered 5 questions in the same session.`,
  earnedChip: `🎯 You used "I don't know yet" and still got 5 right!`,
};

const GALLERY_ITEMS = [
  { emoji: "🦁", name: "Comeback\nKid", earned: true, isNew: true, isLegend: true },
  { emoji: "🔥", name: "On Fire", earned: true },
  { emoji: "⭐", name: "First Star", earned: true },
  { emoji: "🎯", name: "???", earned: false },
  { emoji: "🌟", name: "???", earned: false },
  { emoji: "🏆", name: "???", earned: false },
  { emoji: "🦋", name: "???", earned: false },
  { emoji: "⚡", name: "???", earned: false },
  { emoji: "🎪", name: "???", earned: false },
];

// ─── Shimmer dots (static positions) ─────────────────────────────────────────
const SHIMMER_DOTS = [
  { color: C.gold, left: "10%", duration: "2.8s", delay: "0s" },
  { color: "#ff9b22", left: "30%", duration: "2.4s", delay: "0.4s" },
  { color: C.gold, left: "55%", duration: "3s", delay: "0.2s" },
  { color: "#ff9b22", left: "75%", duration: "2.6s", delay: "0.6s" },
  { color: C.gold, left: "88%", duration: "2.9s", delay: "0.1s" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlayBadgeEarnedPage() {
  const [activeTab, setActiveTab] = useState<TabId>("reveal");

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0a12", minHeight: "100vh", padding: "24px 16px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <style>{`
          @keyframes shimmer-rise {
            0%   { transform: translateY(700px); opacity: 0; }
            15%  { opacity: 0.9; }
            85%  { opacity: 0.6; }
            100% { transform: translateY(-20px); opacity: 0; }
          }
          @keyframes badge-flip {
            from { transform: rotateY(90deg) scale(0.6); opacity: 0; }
            60%  { transform: rotateY(-8deg) scale(1.05); opacity: 1; }
            to   { transform: rotateY(0) scale(1); }
          }
          @keyframes fade-slide {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: none; }
          }
          @keyframes chip-pop {
            from { transform: scale(0.4); opacity: 0; }
            60%  { transform: scale(1.15); }
            to   { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Page title */}
        <p style={{ fontSize: "1rem", fontWeight: 900, color: C.muted, letterSpacing: "0.04em" }}>
          play-badge-earned-overlay-v2 · WonderQuest Design System
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {(["reveal", "detail", "gallery"] as TabId[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "7px 14px", borderRadius: 20,
              border: `1.5px solid ${activeTab === tab ? C.violet : "#2a2050"}`,
              background: activeTab === tab ? C.violet : "#14102a",
              color: activeTab === tab ? "#fff" : C.muted,
              ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            }}>
              {tab === "reveal" ? "Badge Reveal" : tab === "detail" ? "Badge Detail" : "Badge Gallery"}
            </button>
          ))}
        </div>

        {/* ── Badge Reveal ── */}
        {activeTab === "reveal" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{
              background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10,
              padding: "12px 16px", fontSize: "0.78rem", fontWeight: 700, color: "#3a2800",
              lineHeight: 1.6, maxWidth: 390, width: "100%",
            }}>
              <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 700 }}>Badge Reveal — Legendary "Comeback Kid"</div>
              Badge card flips in with 3D perspective rotation. Rarity-based glow. Stars reflect rarity (⭐⭐⭐ = Legendary).
              Flow: Reveal → tap → Detail. Or tap "Skip to collection" to skip.
            </div>

            {/* Phone */}
            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              {/* Badge overlay */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 20,
                background: "radial-gradient(ellipse at 50% 40%, rgba(40,20,100,0.97) 0%, rgba(10,5,30,0.99) 70%)",
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "36px 24px 32px", gap: 16,
              }}>
                {/* Shimmer particles */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
                  {SHIMMER_DOTS.map((dot, i) => (
                    <div key={i} style={{
                      position: "absolute", width: 4, height: 4, borderRadius: "50%",
                      background: dot.color, left: dot.left,
                      animation: `shimmer-rise ${dot.duration} ${dot.delay} linear infinite`,
                      opacity: 0,
                    }} />
                  ))}
                </div>

                <div style={{
                  fontSize: "0.78rem", fontWeight: 900, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: C.gold, zIndex: 2,
                  animation: "fade-slide 0.4s ease-out",
                }}>
                  🏆 Legendary Badge Earned!
                </div>

                {/* Badge card */}
                <div style={{ perspective: 600, zIndex: 2 }}>
                  <div style={{
                    width: 160, height: 160, borderRadius: 24,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 6, position: "relative",
                    background: "linear-gradient(135deg, #3a2000, #1a1000)",
                    border: `2px solid ${C.gold}`,
                    boxShadow: `0 0 32px ${C.gold}88, 0 0 64px ${C.gold}33`,
                    animation: "badge-flip 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
                  }}>
                    <span style={{ fontSize: "4rem" }}>{BADGE.emoji}</span>
                    <div style={{
                      fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.1em",
                      textTransform: "uppercase", borderRadius: 8, padding: "2px 8px",
                      background: "#3a2000", color: C.gold,
                    }}>Legendary</div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {["⭐", "⭐", "⭐"].map((s, i) => (
                        <span key={i} style={{ fontSize: "0.7rem" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: "1.2rem", fontWeight: 900, color: "#fff", zIndex: 2, textAlign: "center",
                  animation: "fade-slide 0.4s 0.6s ease-out both",
                }}>
                  {BADGE.name}
                </div>
                <div style={{
                  fontSize: "0.84rem", fontWeight: 700, color: "#b0a0e0", zIndex: 2,
                  textAlign: "center", lineHeight: 1.4,
                  animation: "fade-slide 0.4s 0.75s ease-out both",
                }}>
                  Earned for getting 5 correct after using the I don't know yet button
                </div>

                <div style={{
                  background: "#1e1840", border: "1.5px solid rgba(155,114,255,0.27)", borderRadius: 12,
                  padding: "8px 14px", fontSize: "0.8rem", fontWeight: 700, color: "#c9a8ff",
                  display: "flex", alignItems: "center", gap: 7, zIndex: 2,
                  animation: "fade-slide 0.4s 0.9s ease-out both",
                }}>
                  {BADGE.earnedChip}
                </div>

                <button style={{
                  width: "100%", height: 54, borderRadius: 27, border: "none",
                  background: "linear-gradient(135deg, #9b72ff, #7248e8)", color: "#fff",
                  ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer", zIndex: 2,
                  marginTop: "auto",
                  animation: "fade-slide 0.4s 1.1s ease-out both",
                }}>
                  See Badge Details →
                </button>
                <button onClick={() => setActiveTab("gallery")} style={{
                  fontSize: "0.8rem", fontWeight: 700, color: "#6050a0", zIndex: 2,
                  background: "none", border: "none", cursor: "pointer", textDecoration: "underline",
                  animation: "fade-slide 0.4s 1.2s ease-out both",
                  ...FONT,
                }}>
                  Skip to collection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Badge Detail ── */}
        {activeTab === "detail" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{
              background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10,
              padding: "12px 16px", fontSize: "0.78rem", fontWeight: 700, color: "#3a2800",
              lineHeight: 1.6, maxWidth: 390, width: "100%",
            }}>
              <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 700 }}>Badge Detail — Name, Description, Stats, Rarity</div>
              Shows badge with description, how it was earned, rarity tier, and stats.
              "Keep" button dismisses. "Share" button opens native share sheet.
            </div>

            {/* Phone */}
            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", inset: 0, zIndex: 20,
                background: "linear-gradient(180deg, #1a1040 0%, #100b2e 100%)",
                display: "flex", flexDirection: "column", padding: "24px 22px 28px", gap: 14,
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 2,
                    background: "linear-gradient(135deg, #3a2000, #1a1000)",
                    border: `2px solid ${C.gold}`,
                    boxShadow: `0 0 16px ${C.gold}44`,
                  }}>
                    <span style={{ fontSize: "2.2rem" }}>{BADGE.emoji}</span>
                    <span style={{ fontSize: "0.55rem", fontWeight: 900, letterSpacing: "0.1em", color: C.gold, textTransform: "uppercase" }}>Legendary</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>{BADGE.name}</div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.gold }}>⭐⭐⭐ Legendary · #{BADGE.serialNum} / {BADGE.serialTotal}</div>
                  </div>
                </div>

                {/* About */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6050a0" }}>About</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#c8bef0", lineHeight: 1.5 }}>{BADGE.desc}</div>
                </div>

                {/* How earned */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6050a0" }}>How You Earned It</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#c8bef0", lineHeight: 1.5 }}>{BADGE.howEarned}</div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6050a0" }}>Badge Stats</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { val: BADGE.serialTotal, label: "Total in existence", color: C.gold },
                      { val: `0${BADGE.serialNum}`, label: "Your badge #", color: C.mint },
                      { val: `+${BADGE.bonusXP}`, label: "Bonus XP", color: C.text },
                    ].map((stat, i) => (
                      <div key={i} style={{
                        flex: 1, background: "#1e1840", border: "1.5px solid #2a2060",
                        borderRadius: 10, padding: "10px 12px",
                        display: "flex", flexDirection: "column", gap: 3,
                      }}>
                        <div style={{ fontSize: "1.2rem", fontWeight: 900, color: stat.color }}>{stat.val}</div>
                        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: C.muted }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <button style={{
                    flex: 2, height: 50, borderRadius: 25, border: "none",
                    background: "linear-gradient(135deg, #9b72ff, #7248e8)", color: "#fff",
                    ...FONT, fontSize: "0.95rem", fontWeight: 900, cursor: "pointer",
                  }}>
                    Keep it! 🎉
                  </button>
                  <button style={{
                    flex: 1, height: 50, borderRadius: 25,
                    background: "#1e1840", border: "1.5px solid #2a2060",
                    color: "#b89eff", ...FONT, fontSize: "0.88rem", fontWeight: 900, cursor: "pointer",
                  }}>
                    📤 Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Badge Gallery ── */}
        {activeTab === "gallery" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div style={{
              background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10,
              padding: "12px 16px", fontSize: "0.78rem", fontWeight: 700, color: "#3a2800",
              lineHeight: 1.6, maxWidth: 390, width: "100%",
            }}>
              <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 700 }}>Badge Gallery — Collection Preview</div>
              Child's earned badges in a 3×N grid. Locked badges shown dimmed.
              New badge has gold border + pip. Tapping any badge opens detail view.
            </div>

            {/* Phone */}
            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", inset: 0, zIndex: 20,
                background: "#100b2e",
                display: "flex", flexDirection: "column", padding: "20px 18px 28px", gap: 14,
              }}>
                <div style={{ fontSize: "1rem", fontWeight: 900, color: "#fff" }}>Your Badges 🏅</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: C.muted }}>3 earned · 6 to unlock</div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, flex: 1 }}>
                  {GALLERY_ITEMS.map((item, i) => (
                    <div key={i} style={{
                      borderRadius: 16,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 4, aspectRatio: "1", fontSize: "2.2rem", position: "relative",
                      background: item.earned
                        ? (item.isLegend ? "linear-gradient(135deg, #3a2000, #1a1000)" : "#1e1840")
                        : "#13102a",
                      border: `1.5px solid ${
                        item.earned
                          ? (item.isNew ? C.gold : "rgba(155,114,255,0.27)")
                          : "#1a1640"
                      }`,
                      boxShadow: item.isNew ? `0 0 12px ${C.gold}44` : "none",
                      opacity: item.earned ? 1 : 0.4,
                      cursor: item.earned ? "pointer" : "default",
                    }}>
                      <span style={{ filter: item.earned ? "none" : "grayscale(1)", opacity: item.earned ? 1 : 0.5 }}>
                        {item.emoji}
                      </span>
                      <div style={{ fontSize: "0.58rem", fontWeight: 700, color: C.muted, textAlign: "center", lineHeight: 1.2 }}>
                        {item.name.split("\n").map((line, j) => <span key={j}>{line}{j === 0 && item.name.includes("\n") ? <br /> : ""}</span>)}
                      </div>
                      {item.isNew && (
                        <div style={{
                          position: "absolute", top: -4, right: -4,
                          width: 14, height: 14, borderRadius: "50%", background: C.gold,
                          fontSize: "0.5rem", fontWeight: 900, color: "#1a0c00",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✨</div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={() => setActiveTab("reveal")} style={{
                  height: 50, borderRadius: 25, border: "none",
                  background: "linear-gradient(135deg, #9b72ff, #7248e8)", color: "#fff",
                  ...FONT, fontSize: "0.95rem", fontWeight: 900, cursor: "pointer",
                }}>
                  Play to unlock more →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
