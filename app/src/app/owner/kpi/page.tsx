"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#06071a",
  bgDeep: "#010409",
  surface: "#12152e",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  muted2: "rgba(255,255,255,0.25)",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
  teal: "#58e8c1",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface KpiData {
  fetchedAt: string;
  activeUsers: { last7d: number; last30d: number };
  sessions: {
    total30d: number;
    completed30d: number;
    completionRatePct: number;
    avgDurationMin: number;
  };
  weeklyGrowth: { week: string; newStudents: number }[];
  retention: { cohortSize: number; retained: number; ratePct: number };
  topSkills: { name: string; band: string; attempts: number; accuracyPct: number }[];
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20 }: { w?: string | number; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: "rgba(255,255,255,0.07)",
        animation: "pulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <Skeleton w="50%" h={10} />
      <Skeleton w="60%" h={32} />
      <Skeleton w="80%" h={10} />
    </div>
  );
}

// ── Freshness timestamp ───────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function KpiPage() {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);

  const fetchKpi = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsSample(false);
    try {
      const res = await fetch("/api/owner/kpi");
      if (res.status === 503) {
        setIsSample(true);
        setError(null);
        // Show sample data shape with zeros
        setData({
          fetchedAt: new Date().toISOString(),
          activeUsers: { last7d: 0, last30d: 0 },
          sessions: { total30d: 0, completed30d: 0, completionRatePct: 0, avgDurationMin: 0 },
          weeklyGrowth: [],
          retention: { cohortSize: 0, retained: 0, ratePct: 0 },
          topSkills: [],
        });
      } else if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to load KPI data.");
      } else {
        setData(await res.json());
      }
    } catch {
      setError("Network error — could not reach KPI API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpi();
  }, [fetchKpi]);

  const maxGrowth = data
    ? Math.max(...data.weeklyGrowth.map((r) => r.newStudents), 1)
    : 1;

  const maxSkillAttempts = data
    ? Math.max(...data.topSkills.map((s) => s.attempts), 1)
    : 1;

  return (
    <AppFrame audience="owner" currentPath="/owner/kpi">
      <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`}</style>
      <main
        style={{
          minHeight: "100vh",
          background: C.bg,
          padding: "24px 20px 56px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* ── Header ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.muted, marginBottom: 4 }}>
                Owner · Analytics
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>
                KPI Dashboard
              </h1>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                Live engagement, retention, and growth metrics
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              {data && !loading && (
                <span style={{ fontSize: 11, color: C.muted2 }}>
                  Last updated {formatTime(data.fetchedAt)}
                </span>
              )}
              <button
                onClick={fetchKpi}
                disabled={loading}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  background: loading ? "rgba(155,114,255,.15)" : C.violet,
                  color: loading ? C.muted : "#fff",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* ── Sample data banner ───────────────────────────────────── */}
          {isSample && (
            <div
              style={{
                background: "rgba(245,158,11,.08)",
                border: `1px solid rgba(245,158,11,.25)`,
                borderRadius: 10,
                padding: "10px 16px",
                fontSize: 12,
                color: C.amber,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>&#128202;</span>
              <span>Sample data — live queries unavailable. Database is not connected or unreachable.</span>
            </div>
          )}

          {/* ── Error state ──────────────────────────────────────────── */}
          {error && (
            <div
              style={{
                background: "rgba(248,81,73,.08)",
                border: `1px solid rgba(248,81,73,.25)`,
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 13, color: C.red }}>{error}</span>
              <button
                onClick={fetchKpi}
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 700,
                  background: "rgba(248,81,73,.15)",
                  color: C.red,
                  border: `1px solid rgba(248,81,73,.3)`,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Top KPI cards ────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : data ? (
              <>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 8 }}>Active Users (7d)</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.mint, lineHeight: 1, marginBottom: 4 }}>{data.activeUsers.last7d.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Unique students with sessions</div>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 8 }}>MAU (30d)</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1, marginBottom: 4 }}>{data.activeUsers.last30d.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Monthly active users</div>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 8 }}>Completion Rate</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: data.sessions.completionRatePct >= 70 ? C.mint : C.amber, lineHeight: 1, marginBottom: 4 }}>
                    {data.sessions.completionRatePct}%
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>Sessions completed · 30d</div>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 8 }}>Avg Duration</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.teal, lineHeight: 1, marginBottom: 4 }}>{data.sessions.avgDurationMin}m</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Per completed session</div>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 8 }}>Retention (7→14d)</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: data.retention.ratePct >= 40 ? C.mint : C.amber, lineHeight: 1, marginBottom: 4 }}>
                    {data.retention.ratePct}%
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {data.retention.retained}/{data.retention.cohortSize} returned
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* ── Weekly Growth + Retention ────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>

            {/* Weekly growth chart */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>New Students / Week</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Last 4 weeks</div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={14} />)}
                </div>
              ) : data && data.weeklyGrowth.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.weeklyGrowth.map((row) => (
                    <div key={row.week}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>
                          {new Date(row.week).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.mint }}>{row.newStudents}</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.round((row.newStudents / maxGrowth) * 100)}%`,
                            background: C.mint,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: C.muted2 }}>
                  No growth data in the last 4 weeks
                </div>
              )}
            </div>

            {/* Session stats */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>Session Summary</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>30-day window</div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={14} />)}
                </div>
              ) : data ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Total sessions", value: data.sessions.total30d.toLocaleString(), color: C.text },
                    { label: "Completed", value: data.sessions.completed30d.toLocaleString(), color: C.mint },
                    { label: "Completion rate", value: `${data.sessions.completionRatePct}%`, color: data.sessions.completionRatePct >= 70 ? C.mint : C.amber },
                    { label: "Avg duration", value: `${data.sessions.avgDurationMin} min`, color: C.teal },
                    { label: "Retention cohort", value: `${data.retention.retained} / ${data.retention.cohortSize}`, color: C.violet },
                    { label: "Retention rate", value: `${data.retention.ratePct}%`, color: data.retention.ratePct >= 40 ? C.mint : C.amber },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* ── Top 8 Skills ─────────────────────────────────────────── */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>Top Skills by Engagement</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Last 7 days · sorted by attempt count</div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={14} />)}
              </div>
            ) : data && data.topSkills.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Skill", "Band", "Attempts", "Accuracy", ""].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: h === "Attempts" || h === "Accuracy" ? "right" : "left",
                            padding: "0 10px 10px 0",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            color: C.muted2,
                            borderBottom: `1px solid rgba(255,255,255,.05)`,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.topSkills.map((skill, i) => (
                      <tr key={skill.name + i}>
                        <td style={{ padding: "9px 10px 9px 0", color: C.text, fontWeight: 600 }}>{skill.name}</td>
                        <td style={{ padding: "9px 10px 9px 0" }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: "rgba(155,114,255,.15)",
                              color: C.violet,
                            }}
                          >
                            {skill.band ?? "—"}
                          </span>
                        </td>
                        <td style={{ padding: "9px 10px 9px 0", textAlign: "right", fontWeight: 700, color: C.mint }}>{skill.attempts.toLocaleString()}</td>
                        <td style={{ padding: "9px 10px 9px 0", textAlign: "right", color: skill.accuracyPct >= 70 ? C.mint : C.amber, fontWeight: 600 }}>
                          {skill.accuracyPct}%
                        </td>
                        <td style={{ padding: "9px 0", width: 100 }}>
                          <div style={{ height: 5, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.round((skill.attempts / maxSkillAttempts) * 100)}%`,
                                background: C.violet,
                                borderRadius: 3,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: C.muted2 }}>
                No skill data in the last 7 days
              </div>
            )}
          </div>

          {/* ── Footer nav ───────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/owner/command" style={{ fontSize: 13, color: C.mint, textDecoration: "none", fontWeight: 600 }}>
              ← Command Centre
            </Link>
            <Link href="/owner/adoption" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Adoption</Link>
            <Link href="/owner/incident" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Incident Log</Link>
            <Link href="/owner/governance" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Governance</Link>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
