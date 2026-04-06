"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

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
  coral: "#ff7b6b",
  p0: "#ffd166",
  p1: "#9b72ff",
  p2: "#58e8c1",
  p3: "#ff7b6b",
  accent: "#50e890",
};

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

const BAND_META: Record<string, { label: string; color: string; bg: string }> = {
  P0: { label: "P0 Starters", color: C.p0, bg: "rgba(255,209,102,0.18)" },
  P1: { label: "P1 Adventurers", color: C.p1, bg: "rgba(155,114,255,0.18)" },
  P2: { label: "P2 Explorers", color: C.p2, bg: "rgba(88,232,193,0.18)" },
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

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function trendLabel(lastSessionAt: string | null): { label: string; color: string; bg: string } {
  const days = daysSince(lastSessionAt);
  if (days === null) return { label: "🔴 Inactive", color: C.coral, bg: "rgba(255,123,107,0.12)" };
  if (days <= 2) return { label: "🟢 Active", color: C.mint, bg: "rgba(34,197,94,0.12)" };
  if (days <= 7) return { label: "🟡 Recent", color: C.gold, bg: "rgba(255,209,102,0.12)" };
  return { label: "🔴 Inactive", color: C.coral, bg: "rgba(255,123,107,0.12)" };
}

function accuracyColor(pct: number): string {
  if (pct >= 75) return C.mint;
  if (pct >= 60) return C.gold;
  return C.coral;
}

function levelChipStyle(type: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    growing: { bg: "rgba(80,232,144,0.15)", color: C.accent },
    strong: { bg: "rgba(56,189,248,0.15)", color: C.blue },
    exploring: { bg: "rgba(255,209,102,0.15)", color: C.p0 },
    mixed: { bg: "rgba(155,114,255,0.15)", color: C.p1 },
  };
  return styles[type] ?? styles.mixed;
}

export default function ClassGrowthPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

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

  const totalStudents = roster.length;
  const activeStudents = roster.filter((s) => {
    const days = daysSince(s.lastSessionAt);
    return days !== null && days <= 7;
  }).length;
  const totalSessions = roster.reduce((a, s) => a + s.sessionsLast7d, 0);
  const totalPoints = roster.reduce((a, s) => a + s.totalPoints, 0);
  const avgSessions = totalStudents > 0 ? Math.round(totalSessions / totalStudents) : 0;

  const studentsWithAnswers = roster.filter((s) => s.totalLast7d > 0);
  const classAvgAccuracy =
    studentsWithAnswers.length > 0
      ? Math.round(
          studentsWithAnswers.reduce((a, s) => a + (s.correctLast7d / s.totalLast7d) * 100, 0) /
            studentsWithAnswers.length,
        )
      : null;

  const STATS = [
    { icon: "📚", value: loading ? "…" : String(totalStudents), label: "Students on roster" },
    { icon: "🌟", value: loading ? "…" : String(activeStudents), label: "Active this week" },
    { icon: "⭐", value: loading ? "…" : String(totalPoints), label: "Total points (class)" },
    { icon: "🎯", value: loading ? "…" : String(avgSessions), label: "Avg sessions per student (7d)" },
  ];

  const BANDS = loading ? [] : buildBands(roster);

  const sortedRoster = [...roster].sort((a, b) => {
    const da = a.lastSessionAt ? new Date(a.lastSessionAt).getTime() : 0;
    const db2 = b.lastSessionAt ? new Date(b.lastSessionAt).getTime() : 0;
    return db2 - da;
  });

  const advancedCount = roster.filter((s) => s.sessionsLast7d > 3).length;

  if (!authed) {
    return (
      <AppFrame audience="teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher">
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px" }}>
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

          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
            {(["growth", "students"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ padding: "10px 20px", fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer", color: activeTab === tab ? C.blue : C.muted, borderBottom: activeTab === tab ? `2px solid ${C.blue}` : "2px solid transparent", marginBottom: -1 }}
              >
                {tab === "growth" ? "Class Growth Report" : "Student Activity Table"}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ color: C.muted, fontSize: 14, padding: "40px 0", textAlign: "center" }}>Loading class data…</div>
          )}

          {!loading && totalStudents === 0 && (
            <div style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: "60px 0" }}>
              Add students to your class to track their growth.
            </div>
          )}

          {!loading && totalStudents > 0 && activeTab === "growth" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                {STATS.map((s) => (
                  <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontSize: 22 }}>{s.icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: C.blue, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {classAvgAccuracy !== null && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                    Class Average Accuracy
                  </div>
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 24px", display: "inline-flex", alignItems: "center", gap: 20 }}>
                    <div style={{ fontSize: 56, fontWeight: 900, color: accuracyColor(classAvgAccuracy), lineHeight: 1 }}>
                      {classAvgAccuracy}%
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                      Class average accuracy
                      <br />
                      this week (students with answers)
                      <br />
                      <span style={{ color: accuracyColor(classAvgAccuracy), fontWeight: 700 }}>
                        {classAvgAccuracy >= 75 ? "Strong performance" : classAvgAccuracy >= 60 ? "Building momentum" : "Needs attention"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 3, height: 16, background: C.blue, borderRadius: 2 }} />
                Band Distribution
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32 }}>
                {BANDS.filter((b) => b.count > 0).length === 0 ? (
                  <div style={{ color: C.muted, fontSize: 13 }}>No students on roster.</div>
                ) : (
                  BANDS.map((b) => (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 140, fontSize: 13, fontWeight: 600, flexShrink: 0, color: b.color }}>{b.label}</div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 22, overflow: "hidden" }}>
                        <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 10, fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.65)", minWidth: b.count > 0 ? 24 : 0 }}>
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
                  {roster.filter((s) => s.inInterventionQueue).length} students in intervention queue — see Health tab for details
                </div>
              </div>

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
                        const levelType = activeMembers === members.length ? "strong" : activeMembers >= members.length * 0.5 ? "growing" : "exploring";
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

          {!loading && totalStudents > 0 && activeTab === "students" && (
            <div>
              <div style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.22)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: C.blue, display: "flex", flexDirection: "column", gap: 5 }}>
                <strong style={{ fontSize: 13, fontWeight: 700, color: C.blue, display: "block", marginBottom: 4 }}>Privacy Rules — Student View</strong>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: C.text, fontSize: 13 }}>🔒 Student names are first name only</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, color: C.text, fontSize: 13 }}>🔒 This data is for your planning — not for parent reports</div>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr>
                      {["Student", "Band", "Sessions (7d)", "Last Active", "Trend"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRoster.map((s) => {
                      const meta = BAND_META[s.launchBandCode] ?? { label: s.launchBandCode, color: C.muted, bg: "rgba(139,148,158,0.12)" };
                      const days = daysSince(s.lastSessionAt);
                      const lastActiveLabel = days === null ? "Never" : days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
                      const trend = trendLabel(s.lastSessionAt);
                      return (
                        <tr key={s.studentId}>
                          <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, color: C.text }}>{s.displayName}</td>
                          <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: meta.bg, color: meta.color }}>{s.launchBandCode}</span>
                          </td>
                          <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{s.sessionsLast7d}</td>
                          <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{lastActiveLabel}</td>
                          <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: trend.bg, color: trend.color }}>{trend.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ background: "rgba(80,232,144,0.07)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.text }}>
                <strong style={{ color: C.accent }}>{activeStudents} of {totalStudents} students</strong> active this week.
              </div>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
