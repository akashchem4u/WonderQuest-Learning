"use client";

import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

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

const STUDENTS = [
  { name: "Bella", band: "P3", stars: 52, sessions: 14, streak: "🔥 7d", status: "Active", statusColor: C.mint },
  { name: "Marcus", band: "P2", stars: 48, sessions: 12, streak: "🔥 6d", status: "↑ Ceiling", statusColor: C.mint },
  { name: "Luna", band: "P3", stars: 44, sessions: 11, streak: "🔥 5d", status: "Active", statusColor: C.mint },
  { name: "Aarav", band: "P2", stars: 38, sessions: 10, streak: "🔥 4d", status: "Active", statusColor: C.mint },
  { name: "Jordan", band: "P2", stars: 14, sessions: 4, streak: "🔥 1d", status: "⚠ Queue", statusColor: C.amber },
  { name: "Priya", band: "P1", stars: 6, sessions: 1, streak: "—", status: "📅 Absent", statusColor: C.amber },
];

const QUEUE = [
  { name: "Jordan", reason: "Low sessions this week — check in recommended", type: "warn" },
  { name: "Sam", reason: "Blending sounds — repeated misses across 3 sessions", type: "blue" },
  { name: "Priya", reason: "3 days absent — may need catch-up plan", type: "warn" },
  { name: "Tyler", reason: "Skip counting — approaching support threshold", type: "blue" },
];

const SKILL_ALERTS = [
  "Blending sounds: 4 students repeated misses — consider small group session",
  "Skip counting: 3 students at support threshold — review this week",
  "Letter recognition: Jordan showing consistent gaps — 1:1 check recommended",
];

export default function TeacherCommandPage() {
  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div style={{ minHeight: "100vh", background: C.base, padding: "24px 24px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 4 }}>Teacher</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>🎛️ Command Center — Class 4B</h1>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Week of Apr 7–13, 2026 · 28 students</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "8px 16px", background: "rgba(255,255,255,0.06)", color: C.muted, border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>📤 Export week</button>
            <button style={{ padding: "8px 16px", background: C.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>+ New assignment</button>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "Total sessions", val: "218", delta: "↑ 14% vs last week", up: true },
            { label: "Class stars", val: "⭐ 1,847", delta: "↑ 9%", up: true },
            { label: "Active students", val: "24/28", delta: "4 not seen this week", up: false },
            { label: "Skills mastered", val: "31", delta: "this week, class total", up: true },
            { label: "Avg streak", val: "4.2d", delta: "↑ from 3.8d", up: true },
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
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: `${BAND_COLORS[s.band]}22`, color: BAND_COLORS[s.band] }}>{s.band}</span>
                    </td>
                    <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)`, color: C.gold }}>⭐ {s.stars}</td>
                    <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)`, color: C.muted }}>{s.sessions}</td>
                    <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)`, color: C.muted }}>{s.streak}</td>
                    <td style={{ padding: "6px 8px", borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: `${s.statusColor}22`, color: s.statusColor }}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Band coverage */}
            <div style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Band coverage</div>
              {[["P0 Pre-K", 7, C.gold, 2], ["P1 K–1", 25, C.violet, 7], ["P2 G2–3", 50, "#58e8c1", 14], ["P3 G4–5", 18, "#ff7b6b", 5]].map(([band, pct, color, n]) => (
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
                <span style={{ background: C.red, color: "#fff", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 8 }}>4</span>
              </div>
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
