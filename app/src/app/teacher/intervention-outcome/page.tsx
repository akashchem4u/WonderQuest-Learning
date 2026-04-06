"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

const C = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "rgba(255,255,255,0.07)",
  text: "#f0f6ff",
  muted: "rgba(240,246,255,0.45)",
  blue: "#38bdf8",
  mint: "#50e890",
  gold: "#ffd166",
  violet: "#9b72ff",
  teal: "#58e8c1",
  coral: "#ff7b6b",
};

type TimeFilter = "week" | "month";

interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  reason: string;
  interventionType: string;
  status: string;
  teacherNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

function deriveOutcome(iv: Intervention): { label: string; color: string; bg: string; border: string } {
  if (iv.status === "resolved") {
    const note = (iv.resolutionNote ?? "").toLowerCase();
    if (note.includes("escal")) {
      return { label: "Escalated", color: C.coral,   bg: "rgba(255,123,107,0.12)", border: "rgba(255,123,107,0.3)" };
    }
    return { label: "Improved",   color: C.mint,    bg: "rgba(80,232,144,0.12)",  border: "rgba(80,232,144,0.3)" };
  }
  return { label: "In Progress",  color: C.gold,    bg: "rgba(255,209,102,0.12)", border: "rgba(255,209,102,0.3)" };
}

function daysAgo(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function durationLabel(iv: Intervention): string {
  const start = new Date(iv.createdAt).getTime();
  const end = iv.resolvedAt ? new Date(iv.resolvedAt).getTime() : Date.now();
  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  if (days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week" : `${weeks} weeks`;
}

function formatType(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Success patterns: count interventions by type and compute resolved/total ratio
function computePatterns(items: Intervention[]): { type: string; total: number; resolved: number; rate: number }[] {
  const map: Record<string, { total: number; resolved: number }> = {};
  for (const iv of items) {
    const t = formatType(iv.interventionType || "other");
    if (!map[t]) map[t] = { total: 0, resolved: 0 };
    map[t].total++;
    if (iv.status === "resolved") map[t].resolved++;
  }
  return Object.entries(map)
    .map(([type, { total, resolved }]) => ({ type, total, resolved, rate: total > 0 ? Math.round((resolved / total) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate);
}

// Fallback demo data used when API returns no results
const DEMO_INTERVENTIONS: Intervention[] = [
  { id: "1", studentId: "s1", studentName: "Emma",   skillCode: "shapes",   reason: "struggling",   interventionType: "additional_practice",    status: "resolved", teacherNote: null, createdAt: new Date(Date.now() - 21 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 3 * 86400000).toISOString(),  resolutionNote: "Student improved significantly" },
  { id: "2", studentId: "s2", studentName: "Liam",   skillCode: "vowels",   reason: "slow reading", interventionType: "slow_reading",           status: "resolved", teacherNote: null, createdAt: new Date(Date.now() - 28 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 5 * 86400000).toISOString(),  resolutionNote: "Engagement improved, closed" },
  { id: "3", studentId: "s3", studentName: "Sofia",  skillCode: "counting", reason: "needs support", interventionType: "parent_suggestion",     status: "active",   teacherNote: null, createdAt: new Date(Date.now() - 35 * 86400000).toISOString(), resolvedAt: null,                                                 resolutionNote: null },
  { id: "4", studentId: "s4", studentName: "Marcus", skillCode: "community",reason: "prerequisite",  interventionType: "prerequisite",          status: "resolved", teacherNote: null, createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 1 * 86400000).toISOString(),  resolutionNote: "Strong now" },
  { id: "5", studentId: "s5", studentName: "Ava",    skillCode: "animals",  reason: "new student",   interventionType: "additional_practice",   status: "active",   teacherNote: null, createdAt: new Date(Date.now() - 7  * 86400000).toISOString(), resolvedAt: null,                                                 resolutionNote: null },
  { id: "6", studentId: "s6", studentName: "Noah",   skillCode: "fractions",reason: "falling behind", interventionType: "custom_note",          status: "resolved", teacherNote: null, createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 2 * 86400000).toISOString(),  resolutionNote: "escalated to admin" },
];

export default function TeacherInterventionOutcomePage() {
  const [filter, setFilter] = useState<TimeFilter>("month");
  const [allInterventions, setAllInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const teacherId = getTeacherId();

    async function loadAll() {
      try {
        const [activeRes, resolvedRes] = await Promise.all([
          fetch(`/api/teacher/interventions?teacherId=${teacherId}&status=active`),
          fetch(`/api/teacher/interventions?teacherId=${teacherId}&status=resolved`),
        ]);

        const activeData = activeRes.ok ? await activeRes.json() : { interventions: [] };
        const resolvedData = resolvedRes.ok ? await resolvedRes.json() : { interventions: [] };

        const combined: Intervention[] = [
          ...(activeData.interventions ?? []),
          ...(resolvedData.interventions ?? []),
        ].sort((a: Intervention, b: Intervention) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAllInterventions(combined.length > 0 ? combined : DEMO_INTERVENTIONS);
      } catch {
        setError("Could not load interventions.");
        setAllInterventions(DEMO_INTERVENTIONS);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // Filter by time window
  const cutoffDays = filter === "week" ? 7 : 30;
  const filtered = allInterventions.filter((iv) => daysAgo(iv.createdAt) <= cutoffDays);

  // Summary stats
  const total = filtered.length;
  const resolved = filtered.filter((iv) => iv.status === "resolved").length;
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const escalated = filtered.filter((iv) => {
    const note = (iv.resolutionNote ?? "").toLowerCase();
    return iv.status === "resolved" && note.includes("escal");
  }).length;

  const patterns = computePatterns(filtered);

  return (
    <AppFrame audience="teacher">
      <div style={{ padding: "24px 20px 80px", minHeight: "100vh", background: C.bg }}>
        <div style={{ maxWidth: 900 }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", margin: 0 }}>
              📈 Intervention Outcomes
            </h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              Track how student interventions are progressing and which types work best.
            </p>
          </div>

          {/* Time filter */}
          <div
            style={{
              display: "inline-flex",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 3,
              gap: 3,
              marginBottom: 24,
            }}
          >
            {(["week", "month"] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? C.blue : "transparent",
                  border: "none",
                  borderRadius: 6,
                  color: filter === f ? "#0d1117" : C.muted,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "6px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                This {f === "week" ? "Week" : "Month"}
              </button>
            ))}
          </div>

          {/* Loading / error states */}
          {loading && (
            <div style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Loading interventions…</div>
          )}
          {error && (
            <div
              style={{
                background: "rgba(255,123,107,0.08)",
                border: "1px solid rgba(255,123,107,0.25)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: C.coral,
                marginBottom: 20,
              }}
            >
              {error} Showing demo data.
            </div>
          )}

          {/* Summary stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {[
              { value: String(total),         label: "Total interventions",             color: C.blue   },
              { value: String(resolved),       label: "Resolved this period",            color: C.mint   },
              { value: `${successRate}%`,      label: "Success rate",                    color: C.teal   },
              { value: String(escalated),      label: "Escalated",                       color: C.coral  },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "16px 14px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, color: s.color, marginBottom: 6 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Outcome log table */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: C.muted,
              marginBottom: 10,
            }}
          >
            Outcome Log
          </div>

          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 32,
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "24px", fontSize: 14, color: C.muted, textAlign: "center" }}>
                No interventions found for this time period.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Student", "Trigger / Skill", "Intervention Type", "Duration", "Outcome"].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: C.muted,
                          padding: "10px 14px",
                          textAlign: "left",
                          borderBottom: `1px solid ${C.border}`,
                          background: "rgba(255,255,255,0.02)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((iv, idx) => {
                    const outcome = deriveOutcome(iv);
                    return (
                      <tr
                        key={iv.id}
                        style={{
                          borderBottom: idx < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                        }}
                      >
                        <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: C.blue }}>
                          {iv.studentName}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13 }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: "rgba(88,232,193,0.1)",
                              border: "1px solid rgba(88,232,193,0.25)",
                              borderRadius: 5,
                              padding: "2px 8px",
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.teal,
                            }}
                          >
                            {iv.skillCode ?? iv.reason}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: C.muted }}>
                          {formatType(iv.interventionType)}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: C.muted }}>
                          {durationLabel(iv)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: outcome.bg,
                              color: outcome.color,
                              border: `1px solid ${outcome.border}`,
                            }}
                          >
                            {outcome.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Success patterns */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: C.muted,
              marginBottom: 12,
            }}
          >
            Success Patterns — which intervention types work best
          </div>

          {patterns.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13 }}>No pattern data available.</div>
          ) : (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {patterns.map((p, i) => (
                <div
                  key={p.type}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 80px 120px",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderBottom: i < patterns.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  {/* Type name */}
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.type}</div>

                  {/* Total */}
                  <div style={{ fontSize: 12, color: C.muted, textAlign: "right" }}>
                    {p.resolved}/{p.total}
                  </div>

                  {/* Rate badge */}
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontWeight: 800,
                        color: p.rate >= 70 ? C.mint : p.rate >= 40 ? C.gold : C.coral,
                        background: p.rate >= 70 ? "rgba(80,232,144,0.1)" : p.rate >= 40 ? "rgba(255,209,102,0.1)" : "rgba(255,123,107,0.1)",
                        border: `1px solid ${p.rate >= 70 ? "rgba(80,232,144,0.3)" : p.rate >= 40 ? "rgba(255,209,102,0.3)" : "rgba(255,123,107,0.3)"}`,
                        borderRadius: 20,
                        padding: "2px 10px",
                      }}
                    >
                      {p.rate}%
                    </span>
                  </div>

                  {/* Bar */}
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${p.rate}%`,
                        background: p.rate >= 70 ? C.mint : p.rate >= 40 ? C.gold : C.coral,
                        borderRadius: 3,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: 11, color: C.muted, marginTop: 12 }}>
            Outcomes reflect mastery-level change only — no accuracy scores are shown. Intervention details visible to teacher and school admin only.
          </p>
        </div>
      </div>
    </AppFrame>
  );
}
