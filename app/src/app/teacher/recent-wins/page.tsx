"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  blueDim: "rgba(56,189,248,0.12)",
  blueBorder: "rgba(56,189,248,0.28)",
  mint: "#22c55e",
  mintDim: "rgba(34,197,94,0.12)",
  gold: "#ffd166",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.12)",
  text: "#f0f6ff",
  muted: "#8b949e",
  faint: "rgba(255,255,255,0.08)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────
type WinType = "mastery" | "streak" | "band" | "stars" | "class_skill";

type Win = {
  id: string;
  icon: string;
  type: WinType;
  headline: string;
  detail: string;
  time: string;
  chipLabel: string;
  chipBg: string;
  chipColor: string;
};

// ── Stub Data ──────────────────────────────────────────────────────────────
const WINS: Win[] = [
  {
    id: "w1",
    icon: "💪",
    type: "mastery",
    headline: "Bella mastered Long Division!",
    detail: "Reached Strong on Long Division (P3 · G4–5). 8 sessions to get there.",
    time: "Today · 4:08pm",
    chipLabel: "Skill mastered",
    chipBg: C.mintDim,
    chipColor: "#4ade80",
  },
  {
    id: "w2",
    icon: "🔥",
    type: "streak",
    headline: "Ethan hit a 7-day streak!",
    detail: "Played every day this week. Longest streak in the class right now.",
    time: "Today · 3:45pm",
    chipLabel: "Streak milestone",
    chipBg: C.amberDim,
    chipColor: "#fbbf24",
  },
  {
    id: "w3",
    icon: "🚀",
    type: "band",
    headline: "Marcus ready for P3!",
    detail: "Consistently reaching P2 ceiling — system flagged for band advancement review.",
    time: "Today · 11:20am",
    chipLabel: "Band ceiling",
    chipBg: C.blueDim,
    chipColor: C.blue,
  },
  {
    id: "w4",
    icon: "⭐",
    type: "stars",
    headline: "Class hit 1,800 stars this week!",
    detail: "Best week so far this term. Class total: ⭐ 1,847.",
    time: "Today",
    chipLabel: "Class milestone",
    chipBg: "rgba(253,224,71,0.12)",
    chipColor: "#fbbf24",
  },
  {
    id: "w5",
    icon: "💪",
    type: "class_skill",
    headline: "8 students mastered Multiplication: Basic!",
    detail: "Class milestone — Aarav, Carlos, Divya and 5 others this week.",
    time: "This week",
    chipLabel: "Class skill milestone",
    chipBg: C.mintDim,
    chipColor: "#4ade80",
  },
];

const WIDE_WINS = [
  ...WINS,
  {
    id: "w6",
    icon: "💪",
    type: "mastery" as WinType,
    headline: "Luna mastered Fractions: Comparing",
    detail: "P3 · 5 sessions. Mastery: 82/100.",
    time: "Yesterday · Skill mastered",
    chipLabel: "Skill mastered",
    chipBg: C.mintDim,
    chipColor: "#4ade80",
  },
];

type Tab = "list" | "wide" | "empty";

export default function RecentWinsPage() {
  const [tab, setTab] = useState<Tab>("list");

  const tabs: { id: Tab; label: string }[] = [
    { id: "list", label: "List Panel" },
    { id: "wide", label: "Wide Grid" },
    { id: "empty", label: "Empty State" },
  ];

  return (
    <AppFrame audience="teacher">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        {/* Page header */}
        <div style={{ marginBottom: 24, maxWidth: 900 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>🎉 Recent Wins</div>
          <div style={{ fontSize: 14, color: C.muted }}>Positive class-level achievements — skills mastered, streaks, band advancements, and star milestones.</div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", maxWidth: 900 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: tab === t.id ? `1.5px solid ${C.blue}` : `1.5px solid ${C.border}`,
                background: tab === t.id ? C.blueDim : C.surfaceAlt,
                color: tab === t.id ? C.blue : C.muted,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui",
                transition: "all .15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── List Panel ────────────────────────────────────────────── */}
        {tab === "list" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: C.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${C.border}` }}>
              {/* Panel header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text }}>🎉 Recent wins</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer" }}>See all</div>
              </div>

              {WINS.map((win, i) => (
                <div key={win.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: i < WINS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{win.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 3, lineHeight: 1.35 }}>{win.headline}</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, marginBottom: 5 }}>{win.detail}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>{win.time}</div>
                    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 10, background: win.chipBg, color: win.chipColor }}>{win.chipLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Wide Grid ─────────────────────────────────────────────── */}
        {tab === "wide" && (
          <div style={{ maxWidth: 860 }}>
            <div style={{ background: C.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${C.border}` }}>
              {/* Panel header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text }}>🎉 Recent wins — this week</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer" }}>See all</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {WIDE_WINS.map((win) => (
                  <div key={win.id} style={{ background: C.surfaceAlt, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{win.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.text, lineHeight: 1.3 }}>{win.headline}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, marginBottom: 6 }}>{win.detail}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{win.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────── */}
        {tab === "empty" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: C.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text }}>🎉 Recent wins</div>
              </div>

              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>🌱</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 8 }}>Wins are on the way!</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                  When students master skills, hit streaks, or reach milestones, they'll appear here. Usually a few days after the week starts.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
