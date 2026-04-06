"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  p0: "#ffd166",
  p1: "#9b72ff",
  p2: "#58e8c1",
  p3: "#ff7b6b",
  accent: "#50e890",
};

// ── Stub data ─────────────────────────────────────────────────────────────────
const STATS = [
  { icon: "📚", value: "18", label: "Students active this term" },
  { icon: "🌟", value: "12", label: "Students advanced a band level" },
  { icon: "⭐", value: "847", label: "Total skills explored (class)" },
  { icon: "🎯", value: "3", label: "Average quests per student" },
];

const BANDS = [
  { label: "P0 Starters", color: C.p0, pct: 16.7, count: 3 },
  { label: "P1 Adventurers", color: C.p1, pct: 38.9, count: 7 },
  { label: "P2 Explorers", color: C.p2, pct: 27.8, count: 5 },
  { label: "P3 Trailblazers", color: C.p3, pct: 16.7, count: 3 },
];

const WEEKLY_TRENDS = [
  { week: "Wk 1", maths: 52, literacy: 68, science: 44 },
  { week: "Wk 2", maths: 58, literacy: 72, science: 51 },
  { week: "Wk 3", maths: 63, literacy: 75, science: 57 },
  { week: "Wk 4", maths: 70, literacy: 78, science: 62 },
  { week: "Wk 5", maths: 74, literacy: 82, science: 68 },
  { week: "Wk 6", maths: 79, literacy: 86, science: 71 },
];

type SubjectRow = {
  subject: string;
  avgLevel: string;
  levelType: string;
  mostActive: string;
  bandColor: string;
  bandLabel: string;
  attention: string[];
  attentionNote?: string;
};

const SUBJECTS: SubjectRow[] = [
  {
    subject: "Maths",
    avgLevel: "Growing",
    levelType: "growing",
    mostActive: "P1 Adventurers",
    bandColor: C.p1,
    bandLabel: "P1",
    attention: ["P0"],
    attentionNote: "(3 students exploring only)",
  },
  {
    subject: "Literacy",
    avgLevel: "Strong",
    levelType: "strong",
    mostActive: "P2 Explorers",
    bandColor: C.p2,
    bandLabel: "P2",
    attention: [],
  },
  {
    subject: "Science",
    avgLevel: "Exploring → Growing",
    levelType: "mixed",
    mostActive: "P1 Adventurers",
    bandColor: C.p1,
    bandLabel: "P1",
    attention: ["P0", "P3"],
  },
  {
    subject: "Social Studies",
    avgLevel: "Exploring",
    levelType: "exploring",
    mostActive: "All bands",
    bandColor: C.muted,
    bandLabel: "",
    attention: ["P2", "P3"],
    attentionNote: "(low engagement)",
  },
];

type StudentCard = {
  name: string;
  band: string;
  bandColor: string;
  bandBg: string;
  pct: number;
  status: string;
  statusType: string;
};

const STUDENTS: StudentCard[] = [
  { name: "Emma", band: "P2", bandColor: C.p2, bandBg: "rgba(88,232,193,0.18)", pct: 82, status: "Advanced ✓", statusType: "advanced" },
  { name: "Liam", band: "P1", bandColor: C.p1, bandBg: "rgba(155,114,255,0.18)", pct: 68, status: "Active", statusType: "active" },
  { name: "Sofia", band: "P2", bandColor: C.p2, bandBg: "rgba(88,232,193,0.18)", pct: 77, status: "Advanced ✓", statusType: "advanced" },
  { name: "Noah", band: "P0", bandColor: C.p0, bandBg: "rgba(255,209,102,0.18)", pct: 42, status: "Active", statusType: "active" },
  { name: "Amara", band: "P3", bandColor: C.p3, bandBg: "rgba(255,123,107,0.18)", pct: 91, status: "Advanced ✓", statusType: "advanced" },
  { name: "Oliver", band: "P1", bandColor: C.p1, bandBg: "rgba(155,114,255,0.18)", pct: 55, status: "Active", statusType: "active" },
  { name: "Mia", band: "P2", bandColor: C.p2, bandBg: "rgba(88,232,193,0.18)", pct: 72, status: "Advanced ✓", statusType: "advanced" },
  { name: "Caleb", band: "P0", bandColor: C.p0, bandBg: "rgba(255,209,102,0.18)", pct: 18, status: "Inactive", statusType: "inactive" },
  { name: "Isla", band: "P1", bandColor: C.p1, bandBg: "rgba(155,114,255,0.18)", pct: 63, status: "Advanced ✓", statusType: "advanced" },
  { name: "Ethan", band: "P3", bandColor: C.p3, bandBg: "rgba(255,123,107,0.18)", pct: 85, status: "Active", statusType: "active" },
  { name: "Priya", band: "P1", bandColor: C.p1, bandBg: "rgba(155,114,255,0.18)", pct: 49, status: "Active", statusType: "active" },
  { name: "Marcus", band: "P2", bandColor: C.p2, bandBg: "rgba(88,232,193,0.18)", pct: 66, status: "Active", statusType: "active" },
];

function levelChipStyle(type: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    growing: { bg: "rgba(80,232,144,0.15)", color: C.accent },
    strong: { bg: "rgba(56,189,248,0.15)", color: C.blue },
    exploring: { bg: "rgba(255,209,102,0.15)", color: C.p0 },
    mixed: { bg: "rgba(155,114,255,0.15)", color: C.p1 },
  };
  return styles[type] || styles.mixed;
}

function statusChipStyle(type: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    advanced: { bg: "rgba(80,232,144,0.15)", color: C.accent },
    active: { bg: "rgba(56,189,248,0.15)", color: C.blue },
    inactive: { bg: "rgba(255,255,255,0.08)", color: C.muted },
  };
  return styles[type] || styles.active;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ClassGrowthPage() {
  const [activeTab, setActiveTab] = useState<"growth" | "students">("growth");
  const [period, setPeriod] = useState("term2");

  const periodLabel: Record<string, string> = {
    term2: "Term 2",
    last30: "Last 30 days",
    last90: "Last 90 days",
  };

  return (
    <AppFrame audience="teacher">
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px" }}>

          {/* Report header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "28px 0 20px", borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.blue, letterSpacing: "-0.3px" }}>Class 4B — Growth Report</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Teacher view · {periodLabel[period]} · Ms. Okafor</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ background: C.surface, color: C.text, border: `1px solid rgba(56,189,248,0.35)`, borderRadius: 7, padding: "7px 12px", fontSize: 13, cursor: "pointer", outline: "none" }}
              >
                <option value="term2">Term 2</option>
                <option value="last30">Last 30 days</option>
                <option value="last90">Last 90 days</option>
              </select>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${C.blue}`, background: "transparent", color: C.blue }}>
                ↓ Download CSV
              </button>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${C.blue}`, background: "transparent", color: C.blue }}>
                ↓ Download PDF
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
            {(["growth", "students"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === tab ? C.blue : C.muted,
                  borderBottom: activeTab === tab ? `2px solid ${C.blue}` : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {tab === "growth" ? "Class Growth Report" : "Student Band Progress"}
              </button>
            ))}
          </div>

          {/* ── Tab: Class Growth Report ── */}
          {activeTab === "growth" && (
            <div>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                {STATS.map((s) => (
                  <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontSize: 22 }}>{s.icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: C.blue, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Band distribution */}
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                Band Distribution
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32 }}>
                {BANDS.map((b) => (
                  <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 140, fontSize: 13, fontWeight: 600, flexShrink: 0, color: b.color }}>{b.label}</div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 22, overflow: "hidden" }}>
                      <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 10, fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.65)" }}>
                        {b.count}
                      </div>
                    </div>
                    <div style={{ width: 80, fontSize: 13, color: C.muted, textAlign: "right", flexShrink: 0 }}>{b.count} students</div>
                  </div>
                ))}
                <div style={{ marginTop: 16, fontSize: 13, color: C.accent, background: "rgba(80,232,144,0.07)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 7, padding: "10px 14px", display: "inline-block" }}>
                  4 students have advanced from P1 → P2 this term
                </div>
              </div>

              {/* Weekly trend bars */}
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                Weekly Skill Engagement Trend
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[{ color: C.blue, label: "Maths" }, { color: C.p2, label: "Literacy" }, { color: C.violet, label: "Science" }].map((leg) => (
                    <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 16, fontSize: 12, color: C.muted }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: leg.color, flexShrink: 0, display: "inline-block" }} />
                      {leg.label}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
                  {WEEKLY_TRENDS.map((wk) => (
                    <div key={wk.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 96 }}>
                        <div style={{ flex: 1, background: C.blue, borderRadius: "3px 3px 0 0", height: `${wk.maths}%`, opacity: 0.85 }} />
                        <div style={{ flex: 1, background: C.p2, borderRadius: "3px 3px 0 0", height: `${wk.literacy}%`, opacity: 0.85 }} />
                        <div style={{ flex: 1, background: C.violet, borderRadius: "3px 3px 0 0", height: `${wk.science}%`, opacity: 0.85 }} />
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{wk.week}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject engagement table */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                  Subject Engagement
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr>
                        {["Subject", "Class Average Level", "Most Active Band", "Needs Attention"].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SUBJECTS.map((row) => {
                        const chip = levelChipStyle(row.levelType);
                        return (
                          <tr key={row.subject}>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}` }}><strong>{row.subject}</strong></td>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}` }}>
                              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: chip.bg, color: chip.color }}>{row.avgLevel}</span>
                            </td>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}` }}>
                              {row.bandLabel ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: row.bandColor, display: "inline-block" }} />
                                  {row.mostActive}
                                </span>
                              ) : (
                                <span style={{ fontSize: 12, color: C.muted }}>{row.mostActive}</span>
                              )}
                            </td>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}` }}>
                              {row.attention.length === 0 ? (
                                <span style={{ color: C.muted, fontSize: 13 }}>None flagged</span>
                              ) : (
                                <span>
                                  {row.attention.map((a) => (
                                    <span key={a} style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "rgba(255,123,107,0.12)", color: C.p3, margin: "1px 2px" }}>{a}</span>
                                  ))}
                                  {row.attentionNote && <span style={{ fontSize: 12, color: C.muted }}> {row.attentionNote}</span>}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 10, paddingLeft: 4 }}>
                  "Needs Attention" identifies lowest-engagement band groups — not individual students.
                </p>
              </div>

              {/* Growth highlights */}
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                Growth Highlights
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px", borderLeft: `3px solid ${C.blue}`, fontSize: 14, lineHeight: 1.6 }}>
                  7 students moved from Exploring → Growing in Maths this term 🌟
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px", borderLeft: `3px solid ${C.blue}`, fontSize: 14, lineHeight: 1.6 }}>
                  Literacy engagement up <strong style={{ color: C.blue }}>34%</strong> vs last term across the class
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px", borderLeft: `3px solid ${C.blue}`, fontSize: 14, lineHeight: 1.6 }}>
                  4 students ready to advance band — see Interventions tab for details
                </div>
              </div>

              {/* Student skill gains */}
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                Top Skill Gains This Term
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32 }}>
                {[
                  { skill: "Fractions: Division", gains: 14, students: 6, color: C.blue },
                  { skill: "Reading Comprehension", gains: 21, students: 11, color: C.p2 },
                  { skill: "Forces & Motion", gains: 8, students: 4, color: C.violet },
                  { skill: "Number Sense: Place Value", gains: 18, students: 9, color: C.gold },
                ].map((item) => (
                  <div key={item.skill} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 220, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{item.skill}</div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 20, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(item.gains * 5, 100)}%`, height: "100%", background: item.color, borderRadius: 6, opacity: 0.8 }} />
                    </div>
                    <div style={{ width: 100, fontSize: 12, color: C.muted, textAlign: "right", flexShrink: 0 }}>+{item.gains} pts · {item.students} students</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Student Band Progress ── */}
          {activeTab === "students" && (
            <div>
              {/* Privacy notice */}
              <div style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.22)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: C.blue, display: "flex", flexDirection: "column", gap: 5 }}>
                <strong style={{ fontSize: 13, fontWeight: 700, color: C.blue, display: "block", marginBottom: 4 }}>Privacy Rules — Student View</strong>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: C.text, fontSize: 13 }}>🔒 Student names are first name only</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: C.text, fontSize: 13 }}>🔒 Progress bars are relative to the class — not scores or percentages</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: C.text, fontSize: 13 }}>🔒 This data is for your planning — not for parent reports</div>
              </div>

              {/* Student grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
                {STUDENTS.map((s) => {
                  const sc = statusChipStyle(s.statusType);
                  return (
                    <div key={s.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: "14px 14px 12px", minHeight: 90, display: "flex", flexDirection: "column", gap: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, background: s.bandBg, color: s.bandColor, flexShrink: 0 }}>{s.band}</div>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>{s.status}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.name}</div>
                      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                        <div style={{ width: `${s.pct}%`, height: "100%", background: s.bandColor, borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ background: C.surface, border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.muted, minHeight: 90, cursor: "pointer" }}>
                  +6 more
                </div>
              </div>

              {/* Advancement summary */}
              <div style={{ background: "rgba(80,232,144,0.07)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.text, marginTop: 10 }}>
                <strong style={{ color: C.accent }}>12 of 18 students</strong> advanced a band level this term — highest in 3 terms.
              </div>
            </div>
          )}

        </div>
      </div>
    </AppFrame>
  );
}
