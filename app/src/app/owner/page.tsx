"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  bg: "#0d1117",
  bgDeep: "#010409",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  faint: "rgba(255,255,255,0.04)",
} as const;

// ── API types ─────────────────────────────────────────────────────────────────
type OwnerOverview = {
  counts: {
    students: number;
    guardians: number;
    sessions: number;
    feedbackItems: number;
    totalPoints: number;
    exampleItems: number;
    explainers: number;
  };
  byBand: { code: string; displayName: string; studentCount: number }[];
  topLearners: {
    displayName: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  }[];
  latestSessions: {
    id: string;
    displayName: string;
    sessionMode: string;
    startedAt: string;
    endedAt: string | null;
    effectivenessScore: number | null;
  }[];
  feedbackByCategory: { category: string; count: number }[];
  feedbackByReviewStatus: { reviewStatus: string; count: number }[];
  recentFeedback: {
    id: string;
    submittedByRole: string;
    sourceChannel: string;
    message: string;
    createdAt: string;
    category: string;
    urgency: string;
    confidence: number | null;
    impactedArea: string | null;
    routingTarget: string;
    summary: string;
    reviewStatus: string;
  }[];
};

// ── Static nav ────────────────────────────────────────────────────────────────
const SB_OPS = [
  { icon: "🏠", label: "Home", href: "/owner", active: true },
  { icon: "📡", label: "Route Health", href: "/owner/routes", badge: null },
  { icon: "🚀", label: "Release Gate", href: "/owner/release", badge: null },
  { icon: "💬", label: "Feedback", href: "/owner/feedback", badge: null as string | null, badgeColor: C.amber },
];
const SB_ANALYTICS = [
  { icon: "📊", label: "Command Center", href: "/owner/analytics" },
  { icon: "👥", label: "Users", href: "/owner/users" },
  { icon: "🏫", label: "Schools", href: "/owner/schools" },
];
const SB_PRODUCT = [
  { icon: "🧪", label: "Experiments", href: "/owner/experiments" },
  { icon: "📋", label: "Content", href: "/owner/content" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtScore(n: number | null) {
  return n === null ? "—" : `${Math.round(n * 100)}%`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function urgencyColor(urgency: string) {
  if (urgency === "critical" || urgency === "high") return C.red;
  if (urgency === "medium") return C.amber;
  return C.mint;
}

export default function OwnerPage() {
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/owner/overview");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as OwnerOverview;
        if (!cancelled) setOverview(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  // Feedback badge from real count
  const feedbackBadgeCount = overview?.counts.feedbackItems ?? null;
  SB_OPS[3].badge = feedbackBadgeCount !== null && feedbackBadgeCount > 0 ? String(feedbackBadgeCount) : null;

  // Stat tiles derived from real data
  const stats = overview
    ? [
        { label: "Students", value: fmtNum(overview.counts.students), delta: `${overview.counts.guardians} guardians`, deltaColor: C.mint },
        { label: "Sessions", value: fmtNum(overview.counts.sessions), delta: `${fmtNum(overview.counts.totalPoints)} pts earned`, deltaColor: C.mint },
        { label: "Feedback items", value: fmtNum(overview.counts.feedbackItems), delta: overview.feedbackByReviewStatus.find(r => r.reviewStatus === "pending") ? `${overview.feedbackByReviewStatus.find(r => r.reviewStatus === "pending")!.count} pending` : "0 pending", deltaColor: C.amber },
        { label: "Examples", value: fmtNum(overview.counts.exampleItems), delta: `${overview.counts.explainers} explainers`, deltaColor: C.mint },
        { label: "Bands active", value: String(overview.byBand.filter(b => b.studentCount > 0).length), delta: `${overview.byBand.length} total bands`, deltaColor: C.mint },
      ]
    : null;

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── Shell ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 0,
            background: C.bg,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            minHeight: "620px",
          }}
        >
          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <aside
            style={{
              width: "220px",
              background: C.bgDeep,
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              borderRight: `1px solid ${C.border}`,
            }}
          >
            {/* Logo */}
            <div
              style={{
                padding: "18px 16px 14px",
                fontSize: "14px",
                fontWeight: 900,
                color: C.text,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              WQ <span style={{ color: C.mint }}>Console</span>
            </div>

            {/* Ops nav */}
            <div style={{ padding: "12px 12px 5px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)" }}>
              Ops
            </div>
            {SB_OPS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  margin: "1px 6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: item.active ? C.mint : "rgba(255,255,255,0.5)",
                  background: item.active ? "rgba(80,232,144,0.1)" : "transparent",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: "13px", width: "18px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
                {item.badge ? (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      background: item.badgeColor ?? C.red,
                      color: item.badgeColor === C.amber ? "#1a1440" : "#fff",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      marginLeft: "auto",
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}

            {/* Analytics nav */}
            <div style={{ padding: "12px 12px 5px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)" }}>
              Analytics
            </div>
            {SB_ANALYTICS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  margin: "1px 6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: "13px", width: "18px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Product nav */}
            <div style={{ padding: "12px 12px 5px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)" }}>
              Product
            </div>
            {SB_PRODUCT.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  margin: "1px 6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: "13px", width: "18px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div style={{ flex: 1 }} />

            {/* Footer */}
            <div style={{ padding: "10px 12px", borderTop: `1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: error ? C.red : C.mint, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: C.muted }}>{error ? "Error loading data" : loading ? "Loading…" : "Data loaded"}</span>
              </div>
              <div style={{ fontSize: "11px", color: C.muted }}>Avi M. · Owner</div>
            </div>
          </aside>

          {/* ── Main content ──────────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              background: C.bg,
              padding: "18px 20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Page title */}
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: C.text }}>
                Good morning 👋
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                {loading ? "Loading overview…" : error ? `Error: ${error}` : `${overview!.counts.students} students · ${overview!.counts.sessions} sessions total`}
              </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "8px" }}>
                {[0,1,2,3,4].map((i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: "10px", padding: "10px 12px", border: `1px solid ${C.border}`, height: "68px", opacity: 0.4 }} />
                ))}
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div style={{ background: "rgba(248,81,73,0.12)", border: `1px solid ${C.red}`, borderRadius: "10px", padding: "14px 16px", color: C.red, fontSize: "13px" }}>
                Failed to load overview: {error}
              </div>
            )}

            {/* ── Real data ───────────────────────────────────────────── */}
            {overview && !loading && (
              <>
                {/* Stat row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "8px" }}>
                  {stats!.map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        background: C.surface,
                        borderRadius: "10px",
                        padding: "10px 12px",
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <div style={{ fontSize: "18px", fontWeight: 900, color: C.text }}>{stat.value}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: stat.deltaColor, marginTop: "2px" }}>
                        {stat.delta}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2-col grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                  {/* Top Learners */}
                  <div style={{ background: C.surface, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "10px" }}>
                      🏆 Top Learners
                    </div>
                    {overview.topLearners.length === 0 && (
                      <div style={{ fontSize: "11px", color: C.muted }}>No learner data yet.</div>
                    )}
                    {overview.topLearners.slice(0, 6).map((learner, i) => (
                      <div
                        key={`${learner.displayName}-${i}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "5px 0",
                          borderBottom: i < Math.min(overview.topLearners.length, 6) - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                        }}
                      >
                        <div style={{ fontSize: "10px", fontWeight: 800, color: C.amber, width: "14px", textAlign: "center" }}>
                          {i + 1}
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", flex: 1 }}>{learner.displayName}</div>
                        <div style={{ fontSize: "10px", color: C.muted }}>{learner.launchBandCode}</div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: C.mint }}>{fmtNum(learner.totalPoints)} pts</div>
                        <div style={{ fontSize: "10px", color: C.muted }}>L{learner.currentLevel}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: "8px" }}>
                      <Link href="/owner/users" style={{ fontSize: "10px", color: C.mint, fontWeight: 700, textDecoration: "none" }}>
                        All learners →
                      </Link>
                    </div>
                  </div>

                  {/* Feedback by Category */}
                  <div style={{ background: C.surface, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "10px" }}>
                      💬 Feedback by Category
                    </div>
                    {overview.feedbackByCategory.length === 0 && (
                      <div style={{ fontSize: "11px", color: C.muted }}>No feedback data yet.</div>
                    )}
                    {overview.feedbackByCategory.slice(0, 6).map((row, i) => (
                      <div
                        key={row.category}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "5px 0",
                          borderBottom: i < Math.min(overview.feedbackByCategory.length, 6) - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                        }}
                      >
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", flex: 1 }}>{row.category}</div>
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            background: "rgba(245,158,11,0.15)",
                            color: C.amber,
                            padding: "1px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {row.count}
                        </div>
                      </div>
                    ))}
                    {overview.recentFeedback.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "6px" }}>
                          Recent
                        </div>
                        {overview.recentFeedback.slice(0, 3).map((fb) => (
                          <div key={fb.id} style={{ padding: "5px 0", borderBottom: `1px solid rgba(255,255,255,0.04)`, display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span
                              style={{
                                fontSize: "8px",
                                fontWeight: 800,
                                padding: "1px 5px",
                                borderRadius: "3px",
                                flexShrink: 0,
                                marginTop: "2px",
                                background: urgencyColor(fb.urgency),
                                color: urgencyColor(fb.urgency) === C.amber ? "#1a1440" : "#fff",
                              }}
                            >
                              {fb.urgency?.toUpperCase() ?? "?"}
                            </span>
                            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)", flex: 1, lineHeight: 1.4 }}>
                              {fb.summary ?? fb.message.slice(0, 80)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: "8px" }}>
                      <Link href="/owner/feedback" style={{ fontSize: "10px", color: C.mint, fontWeight: 700, textDecoration: "none" }}>
                        Open workbench →
                      </Link>
                    </div>
                  </div>

                  {/* Students by Band */}
                  <div style={{ background: C.surface, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "10px" }}>
                      📚 Students by Band
                    </div>
                    {overview.byBand.length === 0 && (
                      <div style={{ fontSize: "11px", color: C.muted }}>No band data yet.</div>
                    )}
                    {overview.byBand.map((band, i) => {
                      const maxCount = Math.max(...overview.byBand.map(b => b.studentCount), 1);
                      return (
                        <div
                          key={band.code}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "5px 0",
                            borderBottom: i < overview.byBand.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                          }}
                        >
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", width: "100px", flexShrink: 0 }}>{band.displayName}</div>
                          <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${(band.studentCount / maxCount) * 100}%`, height: "100%", background: C.violet, borderRadius: "3px" }} />
                          </div>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: C.muted, width: "24px", textAlign: "right" }}>{band.studentCount}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Latest Sessions */}
                  <div style={{ background: C.surface, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "10px" }}>
                      🎮 Latest Sessions
                    </div>
                    {overview.latestSessions.length === 0 && (
                      <div style={{ fontSize: "11px", color: C.muted }}>No session data yet.</div>
                    )}
                    {overview.latestSessions.slice(0, 6).map((session, i) => (
                      <div
                        key={session.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "5px 0",
                          borderBottom: i < Math.min(overview.latestSessions.length, 6) - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                        }}
                      >
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", flex: 1 }}>{session.displayName}</div>
                        <div style={{ fontSize: "9px", color: C.muted }}>
                          {session.sessionMode === "self-directed-challenge" ? "Self" : "Guided"}
                        </div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: session.effectivenessScore !== null && session.effectivenessScore >= 0.7 ? C.mint : session.effectivenessScore !== null ? C.amber : C.muted }}>
                          {fmtScore(session.effectivenessScore)}
                        </div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>{fmtTime(session.startedAt)}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: "8px" }}>
                      <Link href="/owner/analytics" style={{ fontSize: "10px", color: C.mint, fontWeight: 700, textDecoration: "none" }}>
                        Full analytics →
                      </Link>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* Footer nav */}
            <div style={{ display: "flex", gap: "14px", paddingTop: "4px", borderTop: `1px solid ${C.border}` }}>
              <Link href="/owner/content" style={{ fontSize: "12px", fontWeight: 700, color: C.mint, textDecoration: "none" }}>
                Content Health
              </Link>
              <Link href="/teacher" style={{ fontSize: "12px", fontWeight: 700, color: C.muted, textDecoration: "none" }}>
                Teacher view
              </Link>
              <Link href="/parent" style={{ fontSize: "12px", fontWeight: 700, color: C.muted, textDecoration: "none" }}>
                Parent hub
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
