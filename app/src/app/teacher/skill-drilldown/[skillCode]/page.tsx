"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../../teacher-gate";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#50e890",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  red: "#ff7b6b",
};

// ── API response type ─────────────────────────────────────────────────────────
type SkillDetailResponse = {
  skillCode: string;
  skillName: string;
  bandLabel: string;
  launchBandCode: string;
  totalStudents: number;
  mastered: number;
  building: number;
  started: number;
  avgAccuracy: number;
  weeklyTrend: { week: string; sessions: number; accuracy: number }[];
  studentBreakdown: {
    studentId: string;
    name: string;
    mastery: number;
    status: "Strong" | "Building" | "Started";
    sessions: number;
    lastActive: string;
  }[];
};

function statusColor(s: "Strong" | "Building" | "Started") {
  if (s === "Strong")   return { bg: C.mint + "22",   color: C.mint  };
  if (s === "Building") return { bg: C.blue + "22",   color: C.blue  };
  return                       { bg: "rgba(255,255,255,0.06)", color: C.muted };
}

function statusEmoji(s: "Strong" | "Building" | "Started") {
  if (s === "Strong")   return "💪";
  if (s === "Building") return "📈";
  return "🌱";
}

function weekLabel(isoDate: string, idx: number, total: number): string {
  if (idx === total - 1) return "This wk";
  return `Week ${idx + 1}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SkillDrilldownPage() {
  const params = useParams();
  const skillCode = typeof params.skillCode === "string" ? params.skillCode : "";

  const [authed, setAuthed] = useState(false);
  useEffect(() => { fetchTeacherId().then(id => setAuthed(!!id)); }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SkillDetailResponse | null>(null);

  useEffect(() => { void (async () => {
    if (!authed || !skillCode) return;
    const teacherId = await fetchTeacherId();

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/teacher/skill-detail/${encodeURIComponent(skillCode)}?teacherId=${encodeURIComponent(teacherId)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as SkillDetailResponse;
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load skill data.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  })(); }, [authed, skillCode]);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/skills">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/teacher" style={{ color: C.blue, textDecoration: "none" }}>Classroom</Link>
          <span style={{ color: C.border }}>›</span>
          <Link href="/teacher/class" style={{ color: C.blue, textDecoration: "none" }}>Skill Trends</Link>
          <span style={{ color: C.border }}>›</span>
          <span>{data?.skillName ?? skillCode}</span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.muted, fontSize: 14 }}>
            <div style={{
              display: "inline-block", width: 20, height: 20, borderRadius: "50%",
              border: `2px solid ${C.violet}`, borderTopColor: "transparent",
              animation: "spin 0.7s linear infinite", marginBottom: 10,
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div>Loading skill data…</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ background: C.surface, border: `1px solid ${C.red}`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.red, marginBottom: 8 }}>Could not load skill data</div>
            <div style={{ fontSize: 13, color: C.muted }}>{error}</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data && data.totalStudents === 0 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>No data yet for this skill</div>
            <div style={{ fontSize: 13, color: C.muted }}>
              No students on your roster have attempted <strong style={{ color: C.violet }}>{data.skillName}</strong> yet.
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && data.totalStudents > 0 && (
          <>
            {/* ── Skill header card ── */}
            <div style={{
              background: C.surface,
              borderRadius: 14,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              marginBottom: 16,
              flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 40, flexShrink: 0 }}>📚</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 4 }}>{data.skillName}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{data.bandLabel || data.skillCode}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {data.bandLabel && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: C.mint + "22", color: C.mint }}>{data.bandLabel}</span>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: C.violet + "22", color: C.violet }}>{data.skillCode}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { val: data.totalStudents, lbl: "Students on skill" },
                  { val: data.mastered,      lbl: "Strong"            },
                  { val: data.building,      lbl: "Building"          },
                  { val: `${data.avgAccuracy}%`, lbl: "Avg accuracy"  },
                ].map((s) => (
                  <div key={s.lbl} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Two-col: distribution + trend ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Distribution */}
              <div style={{ background: C.surface, borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text, marginBottom: 14 }}>
                  Class distribution — {data.skillName}
                </div>
                {[
                  { status: "Strong",   emoji: "💪", count: data.mastered,  pct: Math.round((data.mastered  / data.totalStudents) * 100), color: C.mint  },
                  { status: "Building", emoji: "📈", count: data.building,  pct: Math.round((data.building  / data.totalStudents) * 100), color: C.blue  },
                  { status: "Started",  emoji: "🌱", count: data.started,   pct: Math.round((data.started   / data.totalStudents) * 100), color: C.muted },
                ].map((d) => (
                  <div key={d.status} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "7px 0", borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, minWidth: 120, color: d.color }}>
                      {d.emoji} {d.status}
                    </div>
                    <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${d.pct}%`, height: "100%", background: d.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.text, minWidth: 24, textAlign: "right" }}>{d.count}</div>
                  </div>
                ))}
                <div style={{
                  marginTop: 14,
                  padding: "12px",
                  background: C.amber + "18",
                  borderRadius: 8,
                  fontSize: 12,
                  color: C.amber,
                  lineHeight: 1.5,
                }}>
                  📌 {data.started > 0
                    ? `${data.started} student${data.started !== 1 ? "s" : ""} ${data.started !== 1 ? "are" : "is"} just getting started — consider a guided intro session.`
                    : `All students are actively progressing on ${data.skillName}.`}
                </div>
              </div>

              {/* Trend */}
              <div style={{ background: C.surface, borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text, marginBottom: 14 }}>
                  Sessions trend — last 4 weeks
                </div>
                {data.weeklyTrend.length === 0 ? (
                  <div style={{ fontSize: 12, color: C.muted, padding: "12px 0" }}>No session data in the past 4 weeks.</div>
                ) : (
                  data.weeklyTrend.map((w, i) => {
                    const maxSessions = Math.max(...data.weeklyTrend.map((x) => x.sessions), 1);
                    const pct = Math.round((w.sessions / maxSessions) * 100);
                    return (
                      <div key={w.week} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, minWidth: 44 }}>
                          {weekLabel(w.week, i, data.weeklyTrend.length)}
                        </div>
                        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: C.blue, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 10, color: C.muted, minWidth: 52, textAlign: "right" }}>{w.sessions} sess.</div>
                      </div>
                    );
                  })
                )}
                <div style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  background: C.blue + "12",
                  borderRadius: 8,
                  fontSize: 12,
                  color: C.blue,
                  lineHeight: 1.4,
                }}>
                  ℹ️ Class accuracy is shown as a class-level average only — no individual comparison.
                </div>
              </div>
            </div>

            {/* ── Student table ── */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}` }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text }}>
                  Students on this skill
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Name", "Mastery", "Status", "Sessions", "Last active"].map((h) => (
                      <th key={h} style={{
                        textAlign: "left",
                        padding: "8px 16px",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        color: C.muted,
                        background: "rgba(255,255,255,0.02)",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.studentBreakdown.map((s) => {
                    const sc = statusColor(s.status);
                    return (
                      <tr key={s.studentId} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "10px 16px", fontWeight: 700, color: C.text }}>{s.name}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 80, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", display: "inline-block" }}>
                              <div style={{
                                width: `${s.mastery}%`,
                                height: "100%",
                                borderRadius: 3,
                                background: s.status === "Strong" ? C.mint : s.status === "Building" ? C.blue : C.muted,
                              }} />
                            </div>
                            <span style={{ fontSize: 11, color: C.muted }}>{s.mastery}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                            background: sc.bg, color: sc.color,
                          }}>
                            {statusEmoji(s.status)} {s.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 16px", color: C.muted }}>{s.sessions}</td>
                        <td style={{ padding: "10px 16px", color: C.muted }}>{s.lastActive}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{
                padding: "8px 16px",
                fontSize: 11,
                color: C.muted,
                borderTop: `1px solid ${C.border}`,
              }}>
                {data.studentBreakdown.length} student{data.studentBreakdown.length !== 1 ? "s" : ""} on this skill
              </div>
            </div>
          </>
        )}

      </div>
    </AppFrame>
  );
}
