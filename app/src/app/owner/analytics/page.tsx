"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", gold: "#ffd166", coral: "#ff7b6b",
  amber: "#f59e0b",
};

type DailyPoint = { day: string; sessions: number; completed: number };
type BandRow = { code: string; displayName: string; studentCount: number };
type Session = {
  id: string;
  displayName: string;
  sessionMode: string;
  startedAt: string;
  endedAt: string | null;
  effectivenessScore: number | null;
};
type OverviewData = {
  counts: {
    students: number;
    sessions: number;
    exampleItems: number;
    explainers: number;
  };
  sessionActivity: {
    sessionsLast7d: number;
    sessionsLast30d: number;
    completedLast7d: number;
    completionRate7d: number;
    activeStudents7d: number;
  };
  dailyActivity: DailyPoint[];
  byBand: BandRow[];
  latestSessions: Session[];
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtScore(n: number | null) {
  // effectiveness_score is stored as 0–100 in the DB, not 0–1
  return n === null ? "\u2014" : `${Math.round(n)}%`;
}

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/overview")
      .then((r) => r.ok ? r.json() : null)
      .then((d: OverviewData | null) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 32px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/owner" style={{ fontSize: 12, color: "rgba(155,114,255,0.7)", textDecoration: "none", fontWeight: 600 }}>← Owner</Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Analytics</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>Platform activity snapshot — testers excluded</p>

        {loading && <div style={{ color: C.muted, fontSize: 14 }}>Loading…</div>}
        {!loading && !data && <div style={{ color: C.coral, fontSize: 14 }}>Failed to load data</div>}
        {!loading && data && (
          <>
            {/* Key metrics */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              {[
                { val: data.counts.sessions, lbl: "Total Sessions", color: C.violet },
                { val: data.counts.students, lbl: "Active Students", color: C.mint },
                { val: data.counts.exampleItems, lbl: "Question Bank Size", color: C.gold },
                { val: data.counts.explainers, lbl: "Explainer Assets", color: C.coral },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", flex: "1 1 140px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* 7d activity summary */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              {[
                { val: data.sessionActivity.sessionsLast7d, lbl: "Sessions (7d)", color: C.violet },
                { val: data.sessionActivity.sessionsLast30d, lbl: "Sessions (30d)", color: C.violet },
                { val: data.sessionActivity.completedLast7d, lbl: "Completed (7d)", color: C.mint },
                { val: `${data.sessionActivity.completionRate7d}%`, lbl: "Completion Rate (7d)", color: data.sessionActivity.completionRate7d >= 60 ? C.mint : C.amber },
                { val: data.sessionActivity.activeStudents7d, lbl: "Active Students (7d)", color: C.gold },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", flex: "1 1 120px" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Sessions chart (14d) */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                Daily Sessions (14d)
              </div>
              {(data.dailyActivity ?? []).length === 0 ? (
                <div style={{ fontSize: 13, color: C.muted }}>No session data yet</div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                    {data.dailyActivity.map((d) => {
                      const maxSessions = Math.max(...data.dailyActivity.map((x) => x.sessions), 1);
                      const barH = Math.max(4, (d.sessions / maxSessions) * 64);
                      const completedH = d.sessions > 0 ? Math.max(2, (d.completed / d.sessions) * barH) : 0;
                      return (
                        <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          <div style={{ width: "100%", position: "relative", height: barH, borderRadius: 3, overflow: "hidden", background: "rgba(155,114,255,0.2)" }}>
                            <div style={{ position: "absolute", bottom: 0, width: "100%", height: completedH, background: C.violet, borderRadius: 3 }} />
                          </div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                            {new Date(d.day).toLocaleDateString([], { weekday: "narrow" })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.muted }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: C.violet }} /> Completed
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.muted }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(155,114,255,0.2)" }} /> Total
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 10, color: C.muted }}>
                      {data.dailyActivity.reduce((sum, d) => sum + d.sessions, 0)} total sessions in period
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Band distribution */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Band Distribution</div>
              {(data.byBand ?? []).length === 0 ? (
                <div style={{ fontSize: 13, color: C.muted }}>No band data yet</div>
              ) : (
                (() => {
                  const totalStudents = data.byBand.reduce((sum, b) => sum + b.studentCount, 0);
                  return data.byBand.filter((b) => b.studentCount > 0).map((b) => {
                    const pct = totalStudents > 0 ? Math.round((b.studentCount / totalStudents) * 100) : 0;
                    return (
                      <div key={b.code} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{b.displayName ?? b.code}</span>
                          <span style={{ fontSize: 12, color: C.muted }}>{b.studentCount} students ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: C.violet, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Latest Sessions */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Latest Sessions</div>
              {(data.latestSessions ?? []).length === 0 && (
                <div style={{ fontSize: 13, color: C.muted }}>No sessions yet</div>
              )}
              {(data.latestSessions ?? []).map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.displayName}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {s.sessionMode} · {s.effectivenessScore != null ? `${fmtScore(s.effectivenessScore)} effective` : "in progress"}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{relativeTime(s.startedAt)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
