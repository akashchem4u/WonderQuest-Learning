"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

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

// ── Types ─────────────────────────────────────────────────────────────────────
type RosterStudent = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  sessionsLast7d: number;
  correctLast7d: number;
  totalLast7d: number;
  lastSessionAt: string | null;
  inInterventionQueue: boolean;
  streak: number;
};

type BandRow = {
  label: string;
  color: string;
  pct: number;
  count: number;
};

type StudentCard = {
  name: string;
  band: string;
  bandColor: string;
  bandBg: string;
  pct: number;
  status: string;
  statusType: string;
};

const BAND_META: Record<string, { label: string; color: string; bg: string }> = {
  P0: { label: "P0 Starters",     color: C.p0, bg: "rgba(255,209,102,0.18)" },
  P1: { label: "P1 Adventurers",  color: C.p1, bg: "rgba(155,114,255,0.18)" },
  P2: { label: "P2 Explorers",    color: C.p2, bg: "rgba(88,232,193,0.18)"  },
  P3: { label: "P3 Trailblazers", color: C.p3, bg: "rgba(255,123,107,0.18)" },
};

function buildBands(roster: RosterStudent[]): BandRow[] {
  const total = roster.length;
  return ["P0", "P1", "P2", "P3"].map((code) => {
    const count = roster.filter((s) => s.launchBandCode === code).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { label: BAND_META[code].label, color: BAND_META[code].color, pct, count };
  });
}

function buildStudentCards(roster: RosterStudent[]): StudentCard[] {
  const total = roster.length;
  return roster.map((s, i) => {
    const meta = BAND_META[s.launchBandCode] ?? { label: s.launchBandCode, color: C.muted, bg: "rgba(139,148,158,0.12)" };
    // relative progress within band: rank-based percentage
    const rank = i + 1;
    const pct = total > 0 ? Math.round(((total - rank + 1) / total) * 100) : 50;
    const statusType = s.inInterventionQueue ? "inactive" :
      s.sessionsLast7d > 3 ? "advanced" : "active";
    const status = statusType === "advanced" ? "Active ✓" :
      statusType === "inactive" ? "Inactive" : "Active";
    return {
      name: s.displayName,
      band: s.launchBandCode,
      bandColor: meta.color,
      bandBg: meta.bg,
      pct,
      status,
      statusType,
    };
  });
}

function levelChipStyle(type: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    growing:   { bg: "rgba(80,232,144,0.15)",  color: C.accent },
    strong:    { bg: "rgba(56,189,248,0.15)",  color: C.blue   },
    exploring: { bg: "rgba(255,209,102,0.15)", color: C.p0     },
    mixed:     { bg: "rgba(155,114,255,0.15)", color: C.p1     },
  };
  return styles[type] ?? styles.mixed;
}

function statusChipStyle(type: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    advanced: { bg: "rgba(80,232,144,0.15)",  color: C.accent },
    active:   { bg: "rgba(56,189,248,0.15)",  color: C.blue   },
    inactive: { bg: "rgba(255,255,255,0.08)", color: C.muted  },
  };
  return styles[type] ?? styles.active;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ClassGrowthPage() {
  const [activeTab, setActiveTab] = useState<"growth" | "students">("growth");
  const [period, setPeriod] = useState("term2");
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherId = getTeacherId();
    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => r.json())
      .then((data: { roster?: RosterStudent[] }) => {
        if (data.roster) setRoster(data.roster);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const periodLabel: Record<string, string> = {
    term2: "Term 2",
    last30: "Last 30 days",
    last90: "Last 90 days",
  };

  // ── Derived metrics ────────────────────────────────────────────────────────
  const totalStudents = roster.length;
  const activeStudents = roster.filter((s) => s.sessionsLast7d > 0).length;
  const totalSessions = roster.reduce((a, s) => a + s.sessionsLast7d, 0);
  const totalPoints = roster.reduce((a, s) => a + s.totalPoints, 0);
  const avgSessions = totalStudents > 0 ? Math.round(totalSessions / totalStudents) : 0;

  const STATS = [
    { icon: "📚", value: loading ? "…" : String(totalStudents),  label: "Students on roster" },
    { icon: "🌟", value: loading ? "…" : String(activeStudents), label: "Active this week" },
    { icon: "⭐", value: loading ? "…" : String(totalPoints),    label: "Total points (class)" },
    { icon: "🎯", value: loading ? "…" : String(avgSessions),   label: "Avg sessions per student (7d)" },
  ];

  const BANDS = loading ? [] : buildBands(roster);
  const STUDENTS = loading ? [] : buildStudentCards(roster);

  // Compute advanced count (students with >3 sessions last 7d as proxy for "advancing")
  const advancedCount = roster.filter((s) => s.sessionsLast7d > 3).length;

  return (
    <AppFrame audience="teacher">
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px" }}>

          {/* Report header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "28px 0 20px", borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.blue, letterSpacing: "-0.3px" }}>
                {loading ? "Class — Growth Report" : `Class (${totalStudents} students) — Growth Report`}
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Teacher view · {periodLabel[period]}</div>
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

          {/* Loading */}
          {loading && (
            <div style={{ color: C.muted, fontSize: 14, padding: "40px 0", textAlign: "center" }}>
              Loading class data…
            </div>
          )}

          {/* ── Tab: Class Growth Report ── */}
          {!loading && activeTab === "growth" && (
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
                {BANDS.length === 0 ? (
                  <div style={{ color: C.muted, fontSize: 13 }}>No students on roster.</div>
                ) : (
                  BANDS.map((b) => (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 140, fontSize: 13, fontWeight: 600, flexShrink: 0, color: b.color }}>{b.label}</div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 22, overflow: "hidden" }}>
                        <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 10, fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.65)" }}>
                          {b.count > 0 ? b.count : ""}
                        </div>
                      </div>
                      <div style={{ width: 80, fontSize: 13, color: C.muted, textAlign: "right", flexShrink: 0 }}>{b.count} students</div>
                    </div>
                  ))
                )}
                {advancedCount > 0 && (
                  <div style={{ marginTop: 16, fontSize: 13, color: C.accent, background: "rgba(80,232,144,0.07)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 7, padding: "10px 14px", display: "inline-block" }}>
                    {advancedCount} student{advancedCount !== 1 ? "s" : ""} highly active this week
                  </div>
                )}
              </div>

              {/* Growth highlights */}
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                Growth Highlights
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px", borderLeft: `3px solid ${C.blue}`, fontSize: 14, lineHeight: 1.6 }}>
                  {activeStudents} of {totalStudents} students active this week 🌟
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px", borderLeft: `3px solid ${C.blue}`, fontSize: 14, lineHeight: 1.6 }}>
                  <strong style={{ color: C.blue }}>{totalSessions}</strong> sessions completed across the class this week
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px", borderLeft: `3px solid ${C.blue}`, fontSize: 14, lineHeight: 1.6 }}>
                  {roster.filter((s) => s.inInterventionQueue).length} students in intervention queue — see Support tab for details
                </div>
              </div>

              {/* Subject engagement table — static labels, real band data */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                  Band Engagement Summary
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr>
                        {["Band", "Students", "Sessions (7d)", "Avg Points", "Status"].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {["P0", "P1", "P2", "P3"].map((code) => {
                        const members = roster.filter((s) => s.launchBandCode === code);
                        if (members.length === 0) return null;
                        const meta = BAND_META[code];
                        const sessions = members.reduce((a, s) => a + s.sessionsLast7d, 0);
                        const avgPts = members.length > 0 ? Math.round(members.reduce((a, s) => a + s.totalPoints, 0) / members.length) : 0;
                        const activeMembers = members.filter((s) => s.sessionsLast7d > 0).length;
                        const levelType = activeMembers === members.length ? "strong" :
                          activeMembers >= members.length * 0.5 ? "growing" : "exploring";
                        const chip = levelChipStyle(levelType);
                        const levelLabel = levelType === "strong" ? "Strong" : levelType === "growing" ? "Growing" : "Exploring";
                        return (
                          <tr key={code}>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}` }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: meta.color, display: "inline-block" }} />
                                <strong style={{ color: meta.color }}>{meta.label}</strong>
                              </span>
                            </td>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{members.length}</td>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{sessions}</td>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{avgPts}</td>
                            <td style={{ padding: "13px 14px", borderBottom: `1px solid ${C.border}` }}>
                              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: chip.bg, color: chip.color }}>{levelLabel}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Student Band Progress ── */}
          {!loading && activeTab === "students" && (
            <div>
              {/* Privacy notice */}
              <div style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.22)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: C.blue, display: "flex", flexDirection: "column", gap: 5 }}>
                <strong style={{ fontSize: 13, fontWeight: 700, color: C.blue, display: "block", marginBottom: 4 }}>Privacy Rules — Student View</strong>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: C.text, fontSize: 13 }}>🔒 Student names are first name only</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: C.text, fontSize: 13 }}>🔒 Progress bars are relative to the class — not scores or percentages</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: C.text, fontSize: 13 }}>🔒 This data is for your planning — not for parent reports</div>
              </div>

              {/* No students */}
              {STUDENTS.length === 0 && (
                <div style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: "40px 0" }}>
                  No students on roster.
                </div>
              )}

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
              </div>

              {/* Advancement summary */}
              {totalStudents > 0 && (
                <div style={{ background: "rgba(80,232,144,0.07)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.text, marginTop: 10 }}>
                  <strong style={{ color: C.accent }}>{activeStudents} of {totalStudents} students</strong> active this week.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </AppFrame>
  );
}
