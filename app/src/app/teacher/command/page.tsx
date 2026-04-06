"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

const C = {
  base: "#100b2e",
  blue: "#2563eb",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

const BAND_COLORS: Record<string, string> = { P0: "#ffd166", P1: "#9b72ff", P2: "#58e8c1", P3: "#ff7b6b" };

function bandKey(code: string): string {
  if (code === "PREK" || code === "P0") return "P0";
  if (code === "K1" || code === "P1") return "P1";
  if (code === "G23" || code === "P2") return "P2";
  if (code === "G45" || code === "P3") return "P3";
  return code;
}

const SKILL_ALERTS = [
  "Blending sounds: 4 students repeated misses — consider small group session",
  "Skip counting: 3 students at support threshold — review this week",
  "Letter recognition: showing consistent gaps — 1:1 check recommended",
];

interface RosterStudent {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  totalPoints: number;
  sessionsLast7d: number;
  streak: number;
  inInterventionQueue: boolean;
  lastSessionAt: string | null;
}

export default function TeacherCommandPage() {
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherId = getTeacherId();
    fetch(`/api/teacher/class?teacherId=${teacherId}`)
      .then((r) => r.ok ? r.json() : { roster: [] })
      .then((data: { roster: RosterStudent[] }) => {
        setRoster(data.roster ?? []);
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, []);

  // Top 6 by totalPoints
  const STUDENTS = [...roster]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 6)
    .map((s) => {
      const bk = bandKey(s.launchBandCode);
      const color = BAND_COLORS[bk] ?? C.muted;
      const isInQueue = s.inInterventionQueue;
      const now = Date.now();
      const isActive = s.lastSessionAt && now - new Date(s.lastSessionAt).getTime() < 24 * 60 * 60 * 1000;
      const status = isInQueue ? "⚠ Queue" : isActive ? "Active" : "Idle";
      const statusColor = isInQueue ? C.amber : isActive ? C.mint : C.muted;
      return {
        name: s.displayName,
        band: bk,
        stars: s.totalPoints,
        sessions: s.sessionsLast7d,
        streak: s.streak > 0 ? `🔥 ${s.streak}d` : "—",
        status,
        statusColor,
      };
    });

  // Students in intervention queue
  const QUEUE = roster
    .filter((s) => s.inInterventionQueue)
    .map((s) => ({
      name: s.displayName,
      reason: "Flagged for check-in — review recent session activity",
      type: "warn" as const,
    }));

  // Band coverage counts
  const bandCounts: Record<string, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const s of roster) {
    const k = bandKey(s.launchBandCode);
    if (k in bandCounts) bandCounts[k]++;
  }
  const total = roster.length || 1;
  const bandRows: [string, number, string, number][] = [
    ["P0 Pre-K", Math.round((bandCounts.P0 / total) * 100), BAND_COLORS.P0, bandCounts.P0],
    ["P1 K–1", Math.round((bandCounts.P1 / total) * 100), BAND_COLORS.P1, bandCounts.P1],
    ["P2 G2–3", Math.round((bandCounts.P2 / total) * 100), BAND_COLORS.P2, bandCounts.P2],
    ["P3 G4–5", Math.round((bandCounts.P3 / total) * 100), BAND_COLORS.P3, bandCounts.P3],
  ];

  const totalSessions = roster.reduce((sum, s) => sum + s.sessionsLast7d, 0);
  const classStars = roster.reduce((sum, s) => sum + s.totalPoints, 0);
  const activeCount = roster.filter((s) => s.lastSessionAt && Date.now() - new Date(s.lastSessionAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;
  const avgStreak = roster.length > 0
    ? (roster.reduce((sum, s) => sum + s.streak, 0) / roster.length).toFixed(1)
    : "—";

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div style={{ minHeight: "100vh", background: C.base, padding: "24px 24px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 4 }}>Teacher</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>🎛️ Command Center</h1>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Week of Apr 7–13, 2026 · {loading ? "—" : `${roster.length} students`}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "8px 16px", background: "rgba(255,255,255,0.06)", color: C.muted, border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>📤 Export week</button>
            <button style={{ padding: "8px 16px", background: C.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>+ New assignment</button>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "Total sessions", val: loading ? "—" : String(totalSessions), delta: "last 7 days", up: true },
            { label: "Class stars", val: loading ? "—" : `⭐ ${classStars}`, delta: "all time", up: true },
            { label: "Active students", val: loading ? "—" : `${activeCount}/${roster.length}`, delta: `${roster.length - activeCount} not seen this week`, up: roster.length - activeCount === 0 },
            { label: "Avg streak", val: loading ? "—" : `${avgStreak}d`, delta: "days in a row", up: true },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", flex: 1, minWidth: 120, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{s.val}</div>
              <div style={{ fontSize: 11, color: s.up ? C.mint : C.amber, marginTop: 4 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Main grid: student table + right column */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
          {/* Student table */}
          <div style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>Top this week</span>
              <Link href="/teacher/class" style={{ fontSize: 11, fontWeight: 700, color: C.blue, textDecoration: "none" }}>Full roster →</Link>
            </div>
            {loading && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>Loading…</div>}
            {!loading && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Name", "Band", "Stars", "Sessions", "Streak", "Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, borderBottom: `2px solid rgba(255,255,255,0.05)` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STUDENTS.map((s) => (
                    <tr key={s.name}>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)`, color: C.text, fontWeight: 700 }}>{s.name}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: `${BAND_COLORS[s.band] ?? C.muted}22`, color: BAND_COLORS[s.band] ?? C.muted }}>{s.band}</span>
                      </td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)`, color: C.gold }}>⭐ {s.stars}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)`, color: C.muted }}>{s.sessions}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)`, color: C.muted }}>{s.streak}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: `${s.statusColor}22`, color: s.statusColor }}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                  {STUDENTS.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "10px 8px", color: C.muted, fontSize: 12 }}>No students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Band coverage */}
            <div style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Band coverage</div>
              {bandRows.map(([band, pct, color, n]) => (
                <div key={band as string} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, minWidth: 72, color: color as string }}>{band}</span>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color as string, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: C.muted, minWidth: 22, textAlign: "right" }}>{n}</span>
                </div>
              ))}
            </div>

            {/* Support queue */}
            <div style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}`, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>Support Queue</span>
                <span style={{ background: C.red, color: "#fff", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 8 }}>{loading ? "—" : QUEUE.length}</span>
              </div>
              {loading && <div style={{ fontSize: 12, color: C.muted }}>Loading…</div>}
              {!loading && QUEUE.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No students in queue</div>}
              {QUEUE.map((q) => (
                <div key={q.name} style={{ display: "flex", gap: 8, padding: "8px 10px", borderRadius: 8, marginBottom: 6, background: q.type === "warn" ? "rgba(245,158,11,0.08)" : "rgba(37,99,235,0.08)", borderLeft: `3px solid ${q.type === "warn" ? C.amber : C.blue}` }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{q.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{q.reason}</div>
                    <Link href={`/teacher/students/s-${q.name.toLowerCase()}`} style={{ fontSize: 11, fontWeight: 700, color: C.blue, marginTop: 4, display: "block", textDecoration: "none" }}>View student →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill alerts */}
        <div style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>⚠️ Skill Alerts</div>
          {SKILL_ALERTS.map((alert, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", background: "rgba(245,158,11,0.06)", borderRadius: 8, marginBottom: 6, fontSize: 11, color: "#d97706", lineHeight: 1.4 }}>
              <span>⚠</span><span>{alert}</span>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { href: "/teacher", label: "← Dashboard" },
            { href: "/teacher/class", label: "Full Roster" },
            { href: "/teacher/support", label: "Support Queue" },
            { href: "/teacher/assignment", label: "Assignments" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
