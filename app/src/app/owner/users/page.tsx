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

type BandRow = { code: string; displayName: string; studentCount: number };
type TopLearner = {
  displayName: string;
  launchBandCode: string;
  launchBandLabel: string;
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
};
type OverviewData = {
  counts: {
    students: number;
    guardians: number;
    teachers: number;
    sessions: number;
    totalPoints: number;
  };
  sessionActivity: {
    activeStudents7d: number;
    sessionsLast7d: number;
  };
  byBand: BandRow[];
  topLearners: TopLearner[];
};

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function OwnerUsersPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchData() {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setLoading(false);
      setError("Request timed out");
    }, 8000);
    fetch("/api/owner/overview")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: OverviewData) => { clearTimeout(timer); setData(d); setLoading(false); })
      .catch((e: Error) => { clearTimeout(timer); setLoading(false); setError(e.message ?? "Failed to load"); });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 32px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/owner" style={{ fontSize: 12, color: "rgba(155,114,255,0.7)", textDecoration: "none", fontWeight: 600 }}>← Owner</Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Users</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>Live counts from production — testers excluded</p>

        {loading && <div style={{ color: C.muted, fontSize: 14 }}>Loading…</div>}
        {!loading && error && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Failed to load</div>
            <div style={{ fontSize: 13, color: "rgba(241,245,249,0.5)", marginBottom: 20 }}>{error}</div>
            <button onClick={() => fetchData()}
              style={{ padding: "10px 20px", borderRadius: 8, background: "#9b72ff", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && !data && <div style={{ color: C.coral, fontSize: 14 }}>No data available</div>}
        {!loading && data && (
          <>
            {/* User breakdown */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              {[
                { val: data.counts.students, lbl: "Students", color: C.violet },
                { val: data.counts.guardians, lbl: "Parents / Guardians", color: C.mint },
                { val: data.counts.teachers, lbl: "Teachers", color: C.gold },
                { val: fmtNum(data.counts.totalPoints), lbl: "Stars Earned", color: C.coral },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", flex: "1 1 140px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Activity this week */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              {[
                { val: data.sessionActivity.activeStudents7d, lbl: "Active students (7d)", color: C.violet },
                { val: data.sessionActivity.sessionsLast7d, lbl: "Sessions (7d)", color: C.mint },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", flex: "1 1 200px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Students by Band */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Students by Band</div>
              {(data.byBand ?? []).length === 0 ? (
                <div style={{ fontSize: 13, color: C.muted }}>No band data yet</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {(data.byBand ?? []).map((b) => (
                    <div key={b.code} style={{ background: "rgba(155,114,255,0.08)", border: "1px solid rgba(155,114,255,0.2)", borderRadius: 10, padding: "10px 16px", minWidth: 100 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: C.violet }}>{b.studentCount}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{b.displayName ?? b.code}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Learners */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Top Learners</div>
              {(data.topLearners ?? []).length === 0 ? (
                <div style={{ fontSize: 13, color: C.muted }}>No learner data yet</div>
              ) : (
                (data.topLearners ?? []).map((l, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(155,114,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: C.violet, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{l.displayName}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{l.launchBandLabel || l.launchBandCode} · Level {l.currentLevel}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.gold }}>&#11088; {fmtNum(l.totalPoints)}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
