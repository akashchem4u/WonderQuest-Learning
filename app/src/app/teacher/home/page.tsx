"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  red: "#ff7b6b",
  surfaceHover: "rgba(255,255,255,0.04)",
};

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Band helpers ──────────────────────────────────────────────────────────────
const BAND_META: Record<string, { label: string; color: string }> = {
  P0: { label: "Pre-K (P0)", color: C.gold },
  P1: { label: "K–1 (P1)",   color: C.violet },
  P2: { label: "G2–3 (P2)",  color: C.mint },
  P3: { label: "G4–5 (P3)",  color: C.red },
};

function bandColor(code: string): string {
  return BAND_META[code]?.color ?? C.muted;
}

function bandLabel(code: string): string {
  return BAND_META[code]?.label ?? code;
}

// ── Sub-components ───────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.surface,
      borderRadius: 14,
      padding: 18,
      border: `1px solid ${C.border}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, link, href }: { title: React.ReactNode; link?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{title}</span>
      {link && href && (
        <Link href={href} style={{ fontSize: 12, color: C.blue, fontWeight: 600, textDecoration: "none" }}>
          {link}
        </Link>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TeacherHomePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "support">("overview");
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherId = getTeacherId();
    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => r.json())
      .then((data: { roster?: RosterStudent[] }) => {
        if (data.roster) setRoster(data.roster);
      })
      .catch(() => {/* fall through to empty roster */})
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalStudents = roster.length;
  const activeToday = roster.filter((s) => {
    if (!s.lastSessionAt) return false;
    const d = new Date(s.lastSessionAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const totalStars = roster.reduce((acc, s) => acc + s.totalPoints, 0);
  const sessionsToday = roster.reduce((acc, s) => acc + s.sessionsLast7d, 0);
  const interventionCount = roster.filter((s) => s.inInterventionQueue).length;

  const bandCodes = ["P0", "P1", "P2", "P3"];
  const bandCounts = bandCodes.map((code) => roster.filter((s) => s.launchBandCode === code).length);
  const coveredBands = bandCounts.filter((c) => c > 0).length;
  const bandsCovered = bandCodes
    .filter((_, i) => bandCounts[i] > 0)
    .join(" / ");

  const STATS = [
    { val: loading ? "…" : String(activeToday),    lbl: "Active today",    delta: `↑ ${totalStudents} total`,     up: true  },
    { val: loading ? "…" : `⭐ ${totalStars}`,      lbl: "Class stars",     delta: "↑ this week",                  up: true  },
    { val: loading ? "…" : String(sessionsToday),  lbl: "Sessions (7d)",   delta: "→ Typical",                    up: null  },
    { val: loading ? "…" : String(interventionCount), lbl: "Need check-in", delta: "⚠ Support queue",             up: false },
    { val: loading ? "…" : String(coveredBands),   lbl: "Bands covered",   delta: bandsCovered || "—",            up: null  },
  ];

  // active right now = sessions in last 7d, sorted by most recent
  const activeStudents = roster
    .filter((s) => s.sessionsLast7d > 0)
    .sort((a, b) => (b.lastSessionAt ?? "").localeCompare(a.lastSessionAt ?? ""))
    .slice(0, 4);

  // support queue = students in intervention
  const supportQueue = roster.filter((s) => s.inInterventionQueue).slice(0, 4);

  const BANDS = bandCodes.map((code, i) => {
    const count = bandCounts[i];
    const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
    return { name: bandLabel(code), count, pct, color: bandColor(code) };
  });

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "system-ui",
    background: activeTab === tab ? C.blue : C.surface,
    color: activeTab === tab ? "#0b1622" : C.muted,
    transition: "all .18s",
  });

  return (
    <AppFrame audience="teacher" currentPath="/teacher/home">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px" }}>

        {/* Page header */}
        <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Good morning, Ms Johnson 👋</h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 }}>
          {loading ? "Loading class…" : `${totalStudents} students`}
        </p>

        {/* Quick nav */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "⚡ Command Centre", href: "/teacher/command" },
            { label: "👥 Class",          href: "/teacher/class"   },
            { label: "📋 Assignments",    href: "/teacher/assignment" },
            { label: "🔧 Support Queue",  href: "/teacher/support" },
            { label: "📊 Skills Report",  href: "/teacher/skills"  },
            { label: "🗂 Small Groups",   href: "/teacher/small-group" },
          ].map((n) => (
            <Link key={n.href} href={n.href} style={{
              padding: "8px 16px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: C.blue,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              {n.label}
            </Link>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {(["overview", "students", "support"] as const).map((t) => (
            <button key={t} style={tabStyle(t)} onClick={() => setActiveTab(t)}>
              {t === "overview" ? "Class Overview" : t === "students" ? "Student List" : "Support Queue"}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ color: C.muted, fontSize: 14, padding: "40px 0", textAlign: "center" }}>
            Loading class data…
          </div>
        )}

        {/* ── TAB: Overview ────────────────────────────────────────────────── */}
        {!loading && activeTab === "overview" && (
          <>
            {/* Stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
              {STATS.map((s) => (
                <div key={s.lbl} style={{
                  background: C.surface,
                  borderRadius: 12,
                  padding: "14px 16px",
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 2, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.lbl}</div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 3,
                    color: s.up === true ? C.mint : s.up === false ? C.amber : C.muted,
                  }}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Two-col: active + support queue */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Card>
                <CardHeader title={`🟢 Active recently (${activeStudents.length})`} link="View all →" href="/teacher/class" />
                {activeStudents.length === 0 && (
                  <div style={{ fontSize: 12, color: C.muted, padding: "16px 0" }}>No recent activity.</div>
                )}
                {activeStudents.map((s) => (
                  <div key={s.studentId} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 0", borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: bandColor(s.launchBandCode) + "33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, flexShrink: 0,
                    }}>
                      {s.displayName.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                        {s.displayName}
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          background: C.mint + "22", color: C.mint,
                          padding: "2px 8px", borderRadius: 20, marginLeft: 6,
                        }}>Active</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{bandLabel(s.launchBandCode)}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>⭐ {s.totalPoints}</span>
                  </div>
                ))}
              </Card>

              <Card>
                <CardHeader title={`⚠️ Needs check-in (${supportQueue.length})`} link="View queue →" href="/teacher/support" />
                {supportQueue.length === 0 && (
                  <div style={{ fontSize: 12, color: C.muted, padding: "16px 0" }}>No students need check-in right now.</div>
                )}
                {supportQueue.map((q) => (
                  <div key={q.studentId} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: C.amber + "15",
                    borderLeft: `3px solid ${C.amber}`,
                    marginBottom: 8,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: C.amber + "33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, flexShrink: 0,
                    }}>💛</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{q.displayName}</div>
                      <div style={{ fontSize: 11, color: C.amber, lineHeight: 1.4, marginTop: 2 }}>
                        In support queue · {q.sessionsLast7d} sessions last 7d
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: C.blue, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginTop: 2 }}>Check in</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Three-col: bands + week summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <Card>
                <CardHeader title="🎯 Band coverage" />
                {BANDS.map((b) => (
                  <div key={b.name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0", borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, flex: 1 }}>{b.name}</div>
                    <div style={{ flex: 2, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: b.count === 0 ? C.muted : C.text, minWidth: 24, textAlign: "right" }}>{b.count}</div>
                  </div>
                ))}
              </Card>

              <Card>
                <CardHeader title="📅 Week to date" />
                {[
                  { lbl: "Sessions (7d)",       val: String(sessionsToday),            warn: false },
                  { lbl: "Stars (class)",        val: `⭐ ${totalStars}`,               warn: false },
                  { lbl: "Students w/ sessions", val: String(roster.filter((s) => s.sessionsLast7d > 0).length), warn: false },
                  { lbl: "Students not active",  val: String(totalStudents - roster.filter((s) => s.sessionsLast7d > 0).length), warn: true },
                ].map((w) => (
                  <div key={w.lbl} style={{
                    display: "flex", alignItems: "center",
                    padding: "6px 0", borderTop: `1px solid ${C.border}`,
                  }}>
                    <div style={{ flex: 1, fontSize: 12, color: C.muted, fontWeight: 600 }}>{w.lbl}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: w.warn ? C.amber : C.text }}>{w.val}</span>
                  </div>
                ))}
              </Card>

              <Card>
                <CardHeader title="📊 Class summary" />
                {[
                  { lbl: "Total students",    val: String(totalStudents) },
                  { lbl: "In intervention",   val: String(interventionCount) },
                  { lbl: "Bands active",      val: String(coveredBands) },
                  { lbl: "Avg points",        val: totalStudents > 0 ? String(Math.round(totalStars / totalStudents)) : "0" },
                ].map((w) => (
                  <div key={w.lbl} style={{
                    display: "flex", alignItems: "center",
                    padding: "6px 0", borderTop: `1px solid ${C.border}`,
                  }}>
                    <div style={{ flex: 1, fontSize: 12, color: C.muted, fontWeight: 600 }}>{w.lbl}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{w.val}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {/* ── TAB: Students ────────────────────────────────────────────────── */}
        {!loading && activeTab === "students" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {["All bands", "Pre-K", "K–1", "G2–3", "G4–5"].map((opt, i) => (
                <button key={opt} style={{
                  padding: "8px 14px",
                  background: i === 0 ? C.blue : C.surface,
                  border: `1px solid ${i === 0 ? C.blue : C.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: i === 0 ? "#0b1622" : C.muted,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                }}>{opt}</button>
              ))}
            </div>

            <Card style={{ padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Student", "Band", "Stars", "Sessions (7d)", "Streak", "Status"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s) => {
                    const statusLabel = s.inInterventionQueue ? "Support" : s.sessionsLast7d > 0 ? "Active" : "Idle";
                    const color = bandColor(s.launchBandCode);
                    return (
                      <tr key={s.studentId} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: color + "33",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 900, color, flexShrink: 0,
                            }}>{s.displayName.charAt(0)}</div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.displayName}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{bandLabel(s.launchBandCode)}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.text }}>⭐ {s.totalPoints}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{s.sessionsLast7d}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{s.streak > 0 ? `${s.streak}d` : "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                            background: statusLabel === "Active" ? C.mint + "22" : statusLabel === "Support" ? C.amber + "22" : "rgba(255,255,255,0.06)",
                            color: statusLabel === "Active" ? C.mint : statusLabel === "Support" ? C.amber : C.muted,
                          }}>{statusLabel}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {roster.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: C.muted, fontSize: 13 }}>
                        No students on roster.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {/* ── TAB: Support Queue ───────────────────────────────────────────── */}
        {!loading && activeTab === "support" && (
          <Card>
            <CardHeader title={`🔧 Support Queue (${supportQueue.length})`} link="Full view →" href="/teacher/support" />
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
              Students currently in the active intervention queue.
            </p>
            {supportQueue.length === 0 && (
              <div style={{ textAlign: "center", padding: "28px 16px" }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 5 }}>All clear</div>
                <div style={{ fontSize: 11, color: C.muted }}>No students currently need a check-in.</div>
              </div>
            )}
            {supportQueue.map((q, i) => (
              <div key={q.studentId} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                background: C.amber + "15",
                borderLeft: `3px solid ${C.amber}`,
                marginBottom: i < supportQueue.length - 1 ? 10 : 0,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: C.amber + "33",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, flexShrink: 0, fontWeight: 900, color: C.amber,
                }}>!</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{q.displayName}</div>
                  <div style={{ fontSize: 12, color: C.amber, lineHeight: 1.4 }}>
                    {bandLabel(q.launchBandCode)} · {q.sessionsLast7d} sessions last 7 days
                  </div>
                </div>
                <button style={{
                  padding: "6px 14px",
                  background: "transparent",
                  border: `1.5px solid ${C.blue}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.blue,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                  flexShrink: 0,
                }}>Check in</button>
              </div>
            ))}
          </Card>
        )}

      </div>
    </AppFrame>
  );
}
