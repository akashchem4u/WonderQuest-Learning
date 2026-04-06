"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
  green: "#50e890",
};

// Dark-theme badge colours (never use red on this component)
function badgeStyle(variant: "green" | "amber" | "blue"): React.CSSProperties {
  const map = {
    green: { background: "rgba(34,197,94,0.15)", color: C.mint },
    amber: { background: "rgba(245,158,11,0.15)", color: C.amber },
    blue: { background: "rgba(56,189,248,0.15)", color: C.blue },
  };
  return { fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 8, ...map[variant] };
}

function segColor(variant: "blue" | "green" | "grey"): string {
  return variant === "blue" ? C.blue : variant === "green" ? C.mint : "rgba(255,255,255,0.12)";
}

type TabType = "mini" | "expanded" | "mobile";

interface SparkBarDef {
  height: number;
  active: boolean;
}

const SPARK_BARS: SparkBarDef[] = [
  { height: 8, active: false },
  { height: 12, active: false },
  { height: 10, active: true },
  { height: 15, active: false },
  { height: 18, active: true },
  { height: 16, active: true },
  { height: 20, active: true },
];

export default function ClassHealthPage() {
  const [tab, setTab] = useState<TabType>("mini");

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "system-ui",
    background: active ? "#2563eb" : "rgba(255,255,255,0.08)",
    color: active ? "#fff" : C.muted,
    transition: "all 0.18s",
  });

  return (
    <AppFrame audience="teacher">
      <div style={{ background: C.base, minHeight: "100vh", padding: 24, fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24, maxWidth: 960 }}>
          <button style={tabBtnStyle(tab === "mini")} onClick={() => setTab("mini")}>Mini Board</button>
          <button style={tabBtnStyle(tab === "expanded")} onClick={() => setTab("expanded")}>Expanded</button>
          <button style={tabBtnStyle(tab === "mobile")} onClick={() => setTab("mobile")}>Mobile Strip</button>
        </div>

        {/* ─── Mini Board ─── */}
        {tab === "mini" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>Class health mini board — right column panel</div>
            <div style={{ background: C.surface, borderRadius: 16, padding: "20px 22px", maxWidth: 480, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: C.text }}>📊 Class Health</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>This week</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer" }}>Full view</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Engagement */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>🏃</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>Engagement</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>22 of 28 students active this week <span style={{ fontSize: 10, fontWeight: 700, color: C.mint }}>↑3</span></div>
                  </div>
                  <span style={badgeStyle("green")}>Good</span>
                </div>

                {/* Mastery velocity */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>💪</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>Mastery velocity</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>12 skills mastered this week <span style={{ fontSize: 10, fontWeight: 700, color: C.amber }}>↓2 vs last week</span></div>
                  </div>
                  <span style={badgeStyle("amber")}>Watch</span>
                </div>

                {/* Support queue */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>Support queue</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>4 students need check-in</div>
                  </div>
                  <span style={badgeStyle("amber")}>4 open</span>
                </div>

                {/* Streak health */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>🔥</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>Streak health</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>16 students on active streak <span style={{ fontSize: 10, fontWeight: 700, color: C.mint }}>↑4</span></div>
                  </div>
                  <span style={badgeStyle("blue")}>Great</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Expanded Board ─── */}
        {tab === "expanded" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>Expanded class health board — command center / class overview</div>
            <div style={{ background: C.surface, borderRadius: 16, padding: 22, maxWidth: 860, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>📊 Class Health — This Week</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["This week", "Last week", "4 weeks"].map((label, i) => (
                    <button key={label} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: i === 0 ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)", color: i === 0 ? C.blue : C.muted, border: i === 0 ? "none" : `1px solid ${C.border}` }}>{label}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 18 }}>
                {/* Engagement card */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>🏃</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>Engagement</span>
                    </div>
                    <span style={badgeStyle("green")}>Good</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1, color: C.mint }}>22</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Active</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                      <strong style={{ color: C.text }}>22 of 28</strong> students active this week<br />
                      <span style={{ color: C.mint }}>↑3</span> vs last week<br />
                      Avg 3.2 sessions/student
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 20, marginTop: 4 }}>
                    {SPARK_BARS.map((bar, i) => (
                      <div key={i} style={{ width: 6, borderRadius: 2, background: bar.active ? C.blue : "rgba(255,255,255,0.1)", height: bar.height }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer", marginTop: 6 }}>View student activity →</div>
                </div>

                {/* Mastery velocity card */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>💪</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>Mastery Velocity</span>
                    </div>
                    <span style={badgeStyle("amber")}>Watch</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1, color: C.amber }}>12</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Skills</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                      <strong style={{ color: C.text }}>12 skills</strong> mastered this week<br />
                      <span style={{ color: C.amber }}>↓2</span> vs last week (14)<br />
                      Slight dip — typical mid-term
                    </div>
                  </div>
                  <div style={{ margin: "6px 0" }}>
                    <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ flex: 4, height: 8, background: C.mint }} />
                      <div style={{ flex: 2, height: 8, background: C.amber }} />
                      <div style={{ flex: 2, height: 8, background: "rgba(255,255,255,0.12)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                      {[{ dot: C.mint, label: "Strong (4)" }, { dot: C.amber, label: "Building (6)" }, { dot: "rgba(255,255,255,0.2)", label: "Just started (2)" }].map((leg) => (
                        <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.muted }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: leg.dot }} />
                          {leg.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer", marginTop: 4 }}>View skill breakdown →</div>
                </div>

                {/* Support queue card */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>⚠️</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>Support Queue</span>
                    </div>
                    <span style={badgeStyle("amber")}>4 open</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {[{ label: "Confidence floor", val: "2" }, { label: "Absence follow-up", val: "1" }, { label: "Band ceiling", val: "1" }].map((row) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{row.label}</span>
                          <span style={{ fontWeight: 700, color: C.text }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, cursor: "pointer" }}>Review queue →</div>
                </div>

                {/* Streak health card */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>🔥</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>Streak Health</span>
                    </div>
                    <span style={badgeStyle("blue")}>Great</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1, color: C.blue }}>16</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Active</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                      <strong style={{ color: C.text }}>16 of 28</strong> on active streak<br />
                      <span style={{ color: C.mint }}>↑4</span> vs last week<br />
                      Longest: Ethan (7 days)
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ flex: 2, height: 8, background: C.blue }} />
                    <div style={{ flex: 7, height: 8, background: C.mint }} />
                    <div style={{ flex: 4, height: 8, background: "rgba(255,255,255,0.12)" }} />
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[{ dot: C.blue, label: "7+ days (2)" }, { dot: C.mint, label: "3–6 days (7)" }, { dot: "rgba(255,255,255,0.2)", label: "No streak (12)" }].map((leg) => (
                      <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.muted }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: leg.dot }} />
                        {leg.label}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer", marginTop: 6 }}>View streak breakdown →</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Mobile Strip ─── */}
        {tab === "mobile" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>Mobile horizontal scroll strip</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, maxWidth: 960 }}>
              {[
                { icon: "🏃", label: "Engagement", val: "22", sub: "/28", delta: null, badge: "Good", badgeVariant: "green" as const },
                { icon: "💪", label: "Mastery", val: "12", sub: "", delta: { sign: "↓", val: "2", color: C.amber }, badge: "Watch", badgeVariant: "amber" as const },
                { icon: "⚠️", label: "Queue", val: "4", sub: "", delta: null, badge: "Open", badgeVariant: "amber" as const },
                { icon: "🔥", label: "Streaks", val: "16", sub: "", delta: { sign: "↑", val: "4", color: C.mint }, badge: "Great", badgeVariant: "blue" as const },
                { icon: "⭐", label: "Stars", val: "1,847", sub: "", delta: null, badge: "This week", badgeVariant: "amber" as const },
              ].map((tile) => (
                <div key={tile.label} style={{ background: C.surface, borderRadius: 12, padding: "12px 14px", flexShrink: 0, width: 110, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 18, marginBottom: 5 }}>{tile.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 3 }}>{tile.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>
                    {tile.val}
                    {tile.sub && <span style={{ fontSize: 11, color: C.muted }}>{tile.sub}</span>}
                    {tile.delta && <span style={{ fontSize: 10, color: tile.delta.color, marginLeft: 2 }}>{tile.delta.sign}{tile.delta.val}</span>}
                  </div>
                  <span style={{ ...badgeStyle(tile.badgeVariant), marginTop: 4, display: "inline-block" }}>{tile.badge}</span>
                </div>
              ))}
            </div>

            {/* Colour rule note */}
            <div style={{ marginTop: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", maxWidth: 480, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              <strong style={{ color: C.text }}>Colour rules:</strong> Green = healthy. Amber = attention needed (not alarming). Blue = informational/positive. <strong style={{ color: C.text }}>Red is never used here</strong> — red is reserved for system errors only. Down deltas (↓) are always amber, never red.
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
