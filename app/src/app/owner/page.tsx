"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  bg:      "#08080f",
  panel:   "#0e0e18",
  card:    "#12121e",
  border:  "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.12)",
  text:    "#f0f0ff",
  sub:     "rgba(240,240,255,0.55)",
  muted:   "rgba(240,240,255,0.28)",
  faint:   "rgba(255,255,255,0.04)",
  mint:    "#4ade80",
  violet:  "#a78bfa",
  amber:   "#fbbf24",
  blue:    "#60a5fa",
  red:     "#f87171",
  pink:    "#f472b6",
} as const;

// ── API types ─────────────────────────────────────────────────────────────────
type OwnerOverview = {
  counts: {
    students: number; guardians: number; teachers: number; sessions: number;
    feedbackItems: number; totalPoints: number; exampleItems: number; explainers: number;
  };
  sessionActivity: {
    sessionsLast7d: number; sessionsLast30d: number; completedLast7d: number;
    activeStudents7d: number; completionRate7d: number;
  };
  dailyActivity: { day: string; sessions: number; completed: number }[];
  byBand: { code: string; displayName: string; studentCount: number }[];
  topLearners: {
    displayName: string; launchBandCode: string; totalPoints: number;
    currentLevel: number; badgeCount: number; trophyCount: number;
  }[];
  latestSessions: {
    id: string; displayName: string; sessionMode: string;
    startedAt: string; endedAt: string | null; effectivenessScore: number | null;
  }[];
  feedbackByCategory: { category: string; count: number }[];
  feedbackByReviewStatus: { reviewStatus: string; count: number }[];
  recentFeedback: {
    id: string; submittedByRole: string; sourceChannel: string; message: string;
    createdAt: string; category: string; urgency: string; confidence: number | null;
    impactedArea: string | null; routingTarget: string; summary: string; reviewStatus: string;
  }[];
};

// ── Nav ───────────────────────────────────────────────────────────────────────
const NAV = [
  {
    group: "Ops",
    items: [
      { icon: "⌂", label: "Overview",     href: "/owner",          active: true  },
      { icon: "⬡", label: "Route Health", href: "/owner/routes",   active: false },
      { icon: "⬆", label: "Release Gate", href: "/owner/release",  active: false },
      { icon: "◎", label: "Feedback", href: "/owner/feedback", active: false, badge: true },
    ],
  },
  {
    group: "Analytics",
    items: [
      { icon: "▦", label: "Command Center", href: "/owner/analytics", active: false },
      { icon: "◈", label: "Users",          href: "/owner/users",     active: false },
      { icon: "⬟", label: "Schools",        href: "/owner/schools",   active: false },
    ],
  },
  {
    group: "Product",
    items: [
      { icon: "⬡", label: "Experiments", href: "/owner/experiments", active: false },
      { icon: "▤", label: "Content",     href: "/owner/content",     active: false },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
function fmtPct(n: number | null) {
  // effectiveness_score is stored as 0–100 in the DB, not 0–1
  return n === null ? "—" : `${Math.round(n)}%`;
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
function urgencyColor(u: string) {
  if (u === "critical") return C.red;
  if (u === "high")     return C.pink;
  if (u === "medium")   return C.amber;
  return C.mint;
}
function bandColor(code: string) {
  const m: Record<string, string> = { PREK: C.pink, K1: C.violet, G23: C.blue, G45: C.mint };
  return m[code] ?? C.violet;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({
  value, label, sub, accent,
}: { value: string; label: string; sub?: string; accent: string }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderTop: `2px solid ${accent}`,
      borderRadius: "10px",
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}>
      <div style={{ fontSize: "26px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "11px", fontWeight: 600, color: C.sub, marginTop: "2px" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: accent, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.1em", color: C.muted, marginBottom: "12px",
    }}>
      {children}
    </div>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: "12px",
      padding: "18px 20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OwnerPage() {
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    (async () => {
      try {
        const res = await fetch("/api/owner/overview");
        if (!res.ok) {
          const j = await res.json().catch(() => ({})) as { error?: string; detail?: string };
          throw new Error(j.detail ?? j.error ?? `HTTP ${res.status}`);
        }
        const data = (await res.json()) as OwnerOverview;
        if (!cancelled) setOverview(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [retryKey]);

  const feedbackBadge = overview && overview.counts.feedbackItems > 0
    ? String(overview.counts.feedbackItems)
    : null;

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{
        display: "flex",
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: C.text,
      }}>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside style={{
          width: "230px",
          flexShrink: 0,
          background: C.panel,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}>
          {/* Brand */}
          <div style={{
            padding: "20px 18px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: `linear-gradient(135deg, ${C.violet}, ${C.mint})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 900, color: "#fff", flexShrink: 0,
            }}>W</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: C.text, lineHeight: 1 }}>WonderQuest</div>
              <div style={{ fontSize: "10px", color: C.violet, fontWeight: 700, marginTop: "2px" }}>Ops Console</div>
            </div>
          </div>

          {/* Nav groups */}
          <div style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
            {NAV.map((group) => (
              <div key={group.group} style={{ marginBottom: "4px" }}>
                <div style={{
                  padding: "10px 8px 5px",
                  fontSize: "9px", fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.12em", color: C.muted,
                }}>
                  {group.group}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "7px 10px",
                      borderRadius: "7px",
                      margin: "1px 0",
                      fontSize: "12.5px",
                      fontWeight: item.active ? 700 : 500,
                      color: item.active ? C.text : C.sub,
                      background: item.active ? "rgba(167,139,250,0.12)" : "transparent",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <span style={{
                      fontSize: "14px", width: "16px", textAlign: "center",
                      color: item.active ? C.violet : C.muted,
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && feedbackBadge && (
                      <span style={{
                        fontSize: "9px", fontWeight: 800,
                        background: C.amber, color: "#1a0e00",
                        padding: "1px 5px", borderRadius: "4px",
                      }}>
                        {feedbackBadge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 16px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <div style={{
              width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
              background: error ? C.red : loading ? C.amber : C.mint,
              boxShadow: `0 0 6px ${error ? C.red : loading ? C.amber : C.mint}`,
            }} />
            <div style={{ fontSize: "11px", color: C.muted }}>
              {error ? "Error" : loading ? "Loading…" : "Live"}
            </div>
            <div style={{ marginLeft: "auto", fontSize: "11px", color: C.muted }}>Owner</div>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Top bar */}
          <div style={{
            padding: "20px 28px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: C.panel,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: C.text, lineHeight: 1 }}>
                {greeting()}
              </div>
              <div style={{ fontSize: "12px", color: C.muted, marginTop: "4px" }}>{today}</div>
            </div>
            {overview && (
              <div style={{ display: "flex", gap: "20px" }}>
                {[
                  { label: "Students", val: overview.counts.students },
                  { label: "Sessions 7d", val: overview.sessionActivity.sessionsLast7d },
                  { label: "Completion", val: `${overview.sessionActivity.completionRate7d}%` },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: "10px", color: C.muted, marginTop: "2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Error */}
            {error && !loading && (
              <div style={{
                background: "rgba(248,113,113,0.08)", border: `1px solid rgba(248,113,113,0.3)`,
                borderRadius: "10px", padding: "14px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              }}>
                <div>
                  <div style={{ color: C.red, fontSize: "13px", fontWeight: 700 }}>Failed to load overview</div>
                  <div style={{ color: C.red, fontSize: "11px", opacity: 0.7, marginTop: 3, fontFamily: "monospace" }}>{error}</div>
                </div>
                <button
                  onClick={() => setRetryKey(k => k + 1)}
                  style={{
                    background: C.red, color: "#fff", border: "none",
                    borderRadius: "7px", padding: "7px 16px",
                    fontSize: "12px", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                {[0,1,2,3].map((i) => (
                  <div key={i} style={{
                    background: C.card, borderRadius: "10px", height: "80px",
                    border: `1px solid ${C.border}`, opacity: 0.5,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }} />
                ))}
              </div>
            )}

            {overview && !loading && (() => {
              const maxDaily = Math.max(...overview.dailyActivity.map(d => d.sessions), 1);
              const totalBand = overview.byBand.reduce((s, b) => s + b.studentCount, 0);
              const openFeedback = overview.feedbackByReviewStatus.find(r => r.reviewStatus !== "resolved")?.count ?? 0;

              return (
                <>
                  {/* ── Row 1: 4 primary KPIs ─────────────────────────────── */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                    <StatCard value={fmtNum(overview.counts.students)}    label="Total Students"     sub={`${overview.counts.guardians} parent accounts`}           accent={C.violet} />
                    <StatCard value={fmtNum(overview.sessionActivity.activeStudents7d)} label="Active Learners (7d)" sub="unique students"                        accent={C.mint}   />
                    <StatCard value={fmtNum(overview.sessionActivity.sessionsLast7d)}   label="Sessions (7d)"        sub={`${overview.sessionActivity.completedLast7d} completed`} accent={C.blue}   />
                    <StatCard value={`${overview.sessionActivity.completionRate7d}%`}   label="Completion Rate (7d)" sub={`${overview.sessionActivity.completedLast7d} of ${overview.sessionActivity.sessionsLast7d}`} accent={overview.sessionActivity.completionRate7d >= 60 ? C.mint : C.amber} />
                  </div>

                  {/* ── Row 2: 4 secondary stats ──────────────────────────── */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                    {[
                      { label: "Teachers",       val: fmtNum(overview.counts.teachers),           color: C.pink   },
                      { label: "Sessions (30d)", val: fmtNum(overview.sessionActivity.sessionsLast30d), color: C.blue   },
                      { label: "Content Items",  val: fmtNum(overview.counts.exampleItems),       color: C.violet },
                      { label: "Open Feedback",  val: String(openFeedback),                        color: openFeedback > 0 ? C.amber : C.mint },
                    ].map((s) => (
                      <div key={s.label} style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        borderRadius: "10px",
                        padding: "13px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                        <div style={{ fontSize: "12px", color: C.sub, fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Row 3: Activity chart + Band distribution ─────────── */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>

                    {/* Daily sessions chart */}
                    <Panel>
                      <SectionTitle>Daily Sessions — Last 14 Days</SectionTitle>
                      {overview.dailyActivity.length === 0 ? (
                        <div style={{ fontSize: "12px", color: C.muted }}>No session data yet.</div>
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "80px" }}>
                            {overview.dailyActivity.map((d) => {
                              const h = Math.max(4, (d.sessions / maxDaily) * 70);
                              const ch = d.sessions > 0 ? Math.max(2, (d.completed / d.sessions) * h) : 0;
                              return (
                                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                  <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "70px", position: "relative" }}>
                                    {/* total bar */}
                                    <div style={{
                                      width: "100%", height: `${h}px`,
                                      background: `rgba(167,139,250,0.25)`,
                                      borderRadius: "4px 4px 0 0",
                                      position: "absolute", bottom: 0,
                                    }} />
                                    {/* completed bar */}
                                    <div style={{
                                      width: "100%", height: `${ch}px`,
                                      background: C.violet,
                                      borderRadius: "4px 4px 0 0",
                                      position: "absolute", bottom: 0,
                                    }} />
                                  </div>
                                  <div style={{ fontSize: "9px", color: C.muted, textAlign: "center" }}>
                                    {new Date(d.day).toLocaleDateString([], { weekday: "narrow" })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: C.violet }} />
                              <span style={{ fontSize: "10px", color: C.muted }}>Completed</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "rgba(167,139,250,0.25)" }} />
                              <span style={{ fontSize: "10px", color: C.muted }}>Total started</span>
                            </div>
                            <div style={{ marginLeft: "auto", fontSize: "11px", color: C.sub, fontWeight: 600 }}>
                              {overview.dailyActivity.reduce((s, d) => s + d.sessions, 0)} sessions in period
                            </div>
                          </div>
                        </>
                      )}
                    </Panel>

                    {/* Band distribution */}
                    <Panel>
                      <SectionTitle>Students by Band</SectionTitle>
                      {overview.byBand.length === 0 ? (
                        <div style={{ fontSize: "12px", color: C.muted }}>No band data.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {overview.byBand.map((band) => {
                            const pct = totalBand > 0 ? Math.round((band.studentCount / totalBand) * 100) : 0;
                            const color = bandColor(band.code);
                            return (
                              <div key={band.code}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                  <span style={{ fontSize: "11px", color: C.sub }}>{band.displayName}</span>
                                  <span style={{ fontSize: "11px", fontWeight: 700, color }}>
                                    {band.studentCount} <span style={{ fontWeight: 400, color: C.muted }}>({pct}%)</span>
                                  </span>
                                </div>
                                <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "3px" }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Panel>
                  </div>

                  {/* ── Row 4: Top learners + Feedback + Latest sessions ─── */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>

                    {/* Top Learners */}
                    <Panel>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <SectionTitle>Top Learners</SectionTitle>
                        <Link href="/owner/users" style={{ fontSize: "11px", color: C.violet, fontWeight: 600, textDecoration: "none" }}>
                          All →
                        </Link>
                      </div>
                      {overview.topLearners.length === 0 ? (
                        <div style={{ fontSize: "12px", color: C.muted }}>No learner data yet.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {overview.topLearners.slice(0, 6).map((l, i) => (
                            <div key={`${l.displayName}-${i}`} style={{
                              display: "flex", alignItems: "center", gap: "10px",
                              padding: "7px 0",
                              borderBottom: i < Math.min(overview.topLearners.length, 6) - 1 ? `1px solid ${C.faint}` : "none",
                            }}>
                              <div style={{
                                width: "20px", height: "20px", borderRadius: "6px",
                                background: i === 0 ? "rgba(251,191,36,0.15)" : i === 1 ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.05)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "10px", fontWeight: 800,
                                color: i === 0 ? C.amber : i === 1 ? C.violet : C.muted,
                                flexShrink: 0,
                              }}>
                                {i + 1}
                              </div>
                              <div style={{ fontSize: "12px", color: C.text, flex: 1, fontWeight: 500 }}>{l.displayName}</div>
                              <div style={{
                                fontSize: "10px", fontWeight: 700, color: C.muted,
                                background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px",
                              }}>
                                {l.launchBandCode}
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 700, color: C.mint }}>{fmtNum(l.totalPoints)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Panel>

                    {/* Feedback */}
                    <Panel>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <SectionTitle>Feedback</SectionTitle>
                        <Link href="/owner/feedback" style={{ fontSize: "11px", color: C.violet, fontWeight: 600, textDecoration: "none" }}>
                          Workbench →
                        </Link>
                      </div>

                      {/* Status pills */}
                      {overview.feedbackByReviewStatus.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                          {overview.feedbackByReviewStatus.map((r) => (
                            <div key={r.reviewStatus} style={{
                              display: "flex", alignItems: "center", gap: "5px",
                              background: r.reviewStatus === "pending" ? "rgba(251,191,36,0.1)" : "rgba(74,222,128,0.1)",
                              border: `1px solid ${r.reviewStatus === "pending" ? "rgba(251,191,36,0.25)" : "rgba(74,222,128,0.25)"}`,
                              borderRadius: "6px", padding: "4px 8px",
                            }}>
                              <div style={{
                                width: "6px", height: "6px", borderRadius: "50%",
                                background: r.reviewStatus === "pending" ? C.amber : C.mint,
                              }} />
                              <span style={{ fontSize: "11px", color: C.sub, fontWeight: 600 }}>
                                {r.count} {r.reviewStatus}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Categories */}
                      {overview.feedbackByCategory.length === 0 ? (
                        <div style={{ fontSize: "12px", color: C.muted }}>No feedback yet.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {overview.feedbackByCategory.slice(0, 4).map((row, i) => (
                            <div key={row.category} style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "6px 0",
                              borderBottom: i < Math.min(overview.feedbackByCategory.length, 4) - 1 ? `1px solid ${C.faint}` : "none",
                            }}>
                              <div style={{ fontSize: "11px", color: C.sub, flex: 1 }}>{row.category}</div>
                              <div style={{
                                fontSize: "11px", fontWeight: 800, color: C.amber,
                                background: "rgba(251,191,36,0.1)", padding: "1px 7px", borderRadius: "5px",
                              }}>
                                {row.count}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recent urgent items */}
                      {overview.recentFeedback.filter(f => f.urgency === "critical" || f.urgency === "high").slice(0, 2).map((fb) => (
                        <div key={fb.id} style={{
                          marginTop: "10px", padding: "8px 10px", borderRadius: "7px",
                          background: "rgba(248,113,113,0.07)",
                          border: `1px solid rgba(248,113,113,0.2)`,
                          display: "flex", gap: "8px", alignItems: "flex-start",
                        }}>
                          <div style={{
                            fontSize: "9px", fontWeight: 800, color: "#fff",
                            background: urgencyColor(fb.urgency), padding: "2px 5px", borderRadius: "4px",
                            flexShrink: 0, marginTop: "1px",
                          }}>
                            {fb.urgency.toUpperCase()}
                          </div>
                          <div style={{ fontSize: "11px", color: C.sub, lineHeight: 1.4, flex: 1 }}>
                            {fb.summary || fb.message.slice(0, 70)}
                          </div>
                        </div>
                      ))}
                    </Panel>

                    {/* Latest Sessions */}
                    <Panel>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <SectionTitle>Latest Sessions</SectionTitle>
                        <Link href="/owner/analytics" style={{ fontSize: "11px", color: C.violet, fontWeight: 600, textDecoration: "none" }}>
                          Analytics →
                        </Link>
                      </div>
                      {overview.latestSessions.length === 0 ? (
                        <div style={{ fontSize: "12px", color: C.muted }}>No sessions yet.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {overview.latestSessions.slice(0, 7).map((s, i) => {
                            const score = s.effectivenessScore;
                            const scoreColor = score === null ? C.muted : score >= 70 ? C.mint : score >= 40 ? C.amber : C.red;
                            return (
                              <div key={s.id} style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "7px 0",
                                borderBottom: i < Math.min(overview.latestSessions.length, 7) - 1 ? `1px solid ${C.faint}` : "none",
                              }}>
                                <div style={{ fontSize: "12px", color: C.text, flex: 1, fontWeight: 500 }}>{s.displayName}</div>
                                <div style={{
                                  fontSize: "9px", color: C.muted, fontWeight: 600,
                                  background: "rgba(255,255,255,0.05)", padding: "2px 5px", borderRadius: "4px",
                                }}>
                                  {s.sessionMode === "self-directed-challenge" ? "Self" : "Guided"}
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: scoreColor, minWidth: "28px", textAlign: "right" }}>
                                  {score === null ? "—" : fmtPct(score)}
                                </div>
                                <div style={{ fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>
                                  {fmtTime(s.startedAt)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Panel>
                  </div>

                  {/* ── Row 5: Quick links ────────────────────────────────── */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "10px" }}>
                    {[
                      { label: "Users",         href: "/owner/users",       color: C.violet },
                      { label: "Teachers",      href: "/owner/teachers",    color: C.blue   },
                      { label: "Content",       href: "/owner/content",     color: C.mint   },
                      { label: "Experiments",   href: "/owner/experiments", color: C.pink   },
                      { label: "Admin Users",   href: "/owner/admins",      color: C.amber  },
                      { label: "AI Status",     href: "/owner/ai-status",   color: C.mint   },
                      { label: "Teacher View",  href: "/teacher",           color: C.muted  },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        style={{
                          display: "block", padding: "10px 14px",
                          background: C.card,
                          border: `1px solid ${C.border}`,
                          borderRadius: "8px",
                          fontSize: "12px", fontWeight: 600,
                          color: link.color,
                          textDecoration: "none",
                          textAlign: "center",
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </AppFrame>
  );
}
