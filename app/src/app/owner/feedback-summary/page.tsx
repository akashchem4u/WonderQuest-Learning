"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ── Palette ───────────────────────────────────────────────────────────────────
const BASE    = "#100b2e";
const MINT    = "#50e890";
const VIOLET  = "#9b72ff";
const RED     = "#f85149";
const AMBER   = "#f59e0b";
const TEAL    = "#58e8c1";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(255,255,255,0.4)";
const MUTED2  = "rgba(255,255,255,0.25)";

// ── API types ──────────────────────────────────────────────────────────────────
interface FeedbackCategory {
  category: string;
  count: number;
}

interface FeedbackReviewStatus {
  reviewStatus: string;
  count: number;
}

interface OpenFeedbackItem {
  id: string;
  category: string;
  urgency: string;
  summary: string;
  createdAt: string;
  resolved: string;
}

interface OverviewData {
  counts: {
    students: number;
    feedbackItems: number;
  };
  feedbackByCategory: FeedbackCategory[];
  feedbackByReviewStatus: FeedbackReviewStatus[];
}

interface OpenFeedbackData {
  items: OpenFeedbackItem[];
  total: number;
}

// ── Static display data (unchanged from original) ─────────────────────────────
const SLA_ROWS: {
  priority: string;
  color: string;
  target: string;
  actual: string;
  met: string;
  missed: string;
  pct: string;
  pctGood: boolean;
}[] = [
  { priority: "P0 Critical", color: RED,   target: "4h",          actual: "3.2h", met: "8",  missed: "1", pct: "89%",  pctGood: true  },
  { priority: "P1 Major",    color: AMBER, target: "24h",         actual: "18h",  met: "12", missed: "0", pct: "100%", pctGood: true  },
  { priority: "P2 Moderate", color: TEAL,  target: "72h",         actual: "48h",  met: "10", missed: "1", pct: "91%",  pctGood: false },
  { priority: "P3 Minor",    color: TEXT,  target: "7d",          actual: "4.2d", met: "8",  missed: "0", pct: "100%", pctGood: true  },
  { priority: "Feature",     color: VIOLET,target: "Best effort", actual: "—",    met: "—",  missed: "—", pct: "N/A",  pctGood: false },
];

const TREND_BARS_90D: { h: number; color: string; label: string }[] = [
  { h: 35, color: MINT,  label: "W1" },
  { h: 28, color: MINT,  label: "W2" },
  { h: 40, color: RED,   label: "W3" },
  { h: 22, color: MINT,  label: "W4" },
  { h: 30, color: MINT,  label: "W5" },
  { h: 25, color: MINT,  label: "W6" },
  { h: 38, color: AMBER, label: "W7" },
  { h: 20, color: MINT,  label: "W8" },
  { h: 32, color: MINT,  label: "W9" },
  { h: 27, color: MINT,  label: "W10" },
  { h: 45, color: RED,   label: "W11" },
  { h: 55, color: RED,   label: "W12" },
  { h: 47, color: MINT,  label: "W13" },
];

// ── Category color map ────────────────────────────────────────────────────────
function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    "bug": RED,
    "feature-request": VIOLET,
    "content-issue": TEAL,
    "question": AMBER,
    "product-insight": MINT,
    "praise": MINT,
    "other": MUTED,
  };
  return map[cat?.toLowerCase()] ?? MUTED;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OwnerFeedbackSummaryPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [openFeedback, setOpenFeedback] = useState<OpenFeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setLoading(false);
      setError("Request timed out");
    }, 8000);
    Promise.all([
      fetch("/api/owner/overview").then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch("/api/owner/feedback?status=open&limit=50").then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
    ])
      .then(([ov, fb]) => {
        clearTimeout(timer);
        setOverview(ov as OverviewData);
        setOpenFeedback(fb as OpenFeedbackData);
        setLoading(false);
      })
      .catch((err: Error) => {
        clearTimeout(timer);
        setError(err.message ?? String(err));
        setLoading(false);
      });
  }, [retryCount]);

  // Derived stats from real data
  const totalFeedback = overview?.counts.feedbackItems ?? 0;
  const openCount = openFeedback?.total ?? 0;

  const resolvedCount = overview?.feedbackByReviewStatus?.find((r) => r.reviewStatus === "resolved")?.count ?? 0;
  const pendingCount  = overview?.feedbackByReviewStatus?.find((r) => r.reviewStatus === "pending")?.count ?? 0;

  const resolvedPct = totalFeedback > 0 ? Math.round((resolvedCount / totalFeedback) * 100) : 0;
  const openPct     = totalFeedback > 0 ? Math.round((openCount / totalFeedback) * 100) : 0;
  const otherPct    = Math.max(0, 100 - resolvedPct - openPct);

  // Top category from real data
  const topCategoryRow = overview?.feedbackByCategory?.[0];

  const STATS = [
    { n: totalFeedback.toLocaleString(), label: "Total Items",   good: false },
    { n: openCount.toLocaleString(),     label: "Open Items",    good: false },
    { n: resolvedCount.toLocaleString(), label: "Resolved",      good: true  },
    { n: pendingCount.toLocaleString(),  label: "Pending Triage",good: false },
    { n: topCategoryRow ? topCategoryRow.category : "—", label: "Top Category", good: true },
  ];

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", background: BASE, minHeight: "100vh", padding: "24px 20px", color: TEXT }}>

        {/* Page title */}
        <div style={{ maxWidth: 1100, margin: "0 auto 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 6 }}>Owner · Feedback</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: TEXT, margin: 0 }}>Feedback Summary</h1>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 0 }}>Aggregate product health — volume trends, SLA performance, NPS, and top schools.</p>
        </div>

        {/* Loading / error */}
        {loading && (
          <div style={{ maxWidth: 1100, margin: "0 auto 16px", fontSize: 13, color: MUTED }}>
            Loading feedback data…
          </div>
        )}
        {!loading && error && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Failed to load</div>
            <div style={{ fontSize: 13, color: "rgba(241,245,249,0.5)", marginBottom: 20 }}>{error}</div>
            <button onClick={() => setRetryCount((n) => n + 1)}
              style={{ padding: "10px 20px", borderRadius: 8, background: "#9b72ff", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}

        {/* ── 30-day summary shell ─────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto 32px", background: "#0d1117", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>

          {/* Shell header */}
          <div style={{ background: "#010409", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Feedback Summary</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["7d", "30d", "90d"].map((p) => (
                  <span key={p} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: p === "30d" ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)", color: p === "30d" ? TEXT : MUTED }}>{p}</span>
                ))}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: MINT }}>&#8595; Export CSV</span>
          </div>

          {/* Top stats row — live data */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: BORDER, borderBottom: `1px solid ${BORDER}` }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ background: "#0d1117", padding: "18px 20px" }}>
                {loading ? (
                  <div style={{ height: 22, width: 48, background: "rgba(255,255,255,.06)", borderRadius: 4, marginBottom: 6 }} />
                ) : (
                  <div style={{ fontSize: 22, fontWeight: 900, color: TEXT }}>{s.n}</div>
                )}
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED2, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Main body: left + right */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px" }}>

            {/* LEFT */}
            <div style={{ padding: 24, borderRight: `1px solid ${BORDER}` }}>

              {/* Section: By Category (live) */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` }}>Feedback by AI Category</div>

              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", marginBottom: 16, border: "1px solid rgba(255,255,255,.05)" }}>
                {loading ? (
                  <div style={{ fontSize: 12, color: MUTED }}>Loading…</div>
                ) : overview?.feedbackByCategory && overview.feedbackByCategory.length > 0 ? (
                  <>
                    {/* Stacked bar */}
                    <div style={{ display: "flex", gap: 3, height: 16, borderRadius: 5, overflow: "hidden", marginBottom: 12 }}>
                      {overview.feedbackByCategory.map((row) => (
                        <div
                          key={row.category}
                          style={{
                            flex: row.count,
                            background: categoryColor(row.category),
                            opacity: 0.8,
                          }}
                        />
                      ))}
                    </div>
                    {overview.feedbackByCategory.map((row) => (
                      <div key={row.category} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: categoryColor(row.category), flexShrink: 0 }} />
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", flex: 1, textTransform: "capitalize" }}>{row.category}</div>
                        <div style={{ flex: 1, background: "rgba(255,255,255,.07)", borderRadius: 3, height: 5 }}>
                          <div style={{
                            height: 5,
                            borderRadius: 3,
                            width: totalFeedback > 0 ? `${Math.round((row.count / totalFeedback) * 100)}%` : "0%",
                            background: categoryColor(row.category),
                          }} />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.45)", width: 32, textAlign: "right" }}>{row.count}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: MUTED }}>No category data.</div>
                )}
              </div>

              {/* Section: SLA Performance (static) */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` }}>SLA Performance</div>
              <div style={{ background: SURFACE, borderRadius: 12, marginBottom: 16, border: "1px solid rgba(255,255,255,.05)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Priority", "Target", "Avg Actual", "Met", "Missed", "% Met"].map((h) => (
                        <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: MUTED2, padding: "5px 8px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.07)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLA_ROWS.map((r) => (
                      <tr key={r.priority}>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: r.color, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.priority}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: "rgba(255,255,255,.6)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.target}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: "rgba(255,255,255,.6)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.actual}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: MINT, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.met}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: "rgba(255,255,255,.6)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.missed}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: r.priority === "Feature" ? MUTED : r.pctGood ? MINT : AMBER, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section: NPS (static) */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` }}>NPS &amp; Satisfaction</div>
              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>Net Promoter Score — Post-Resolution</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", border: `3px solid ${MINT}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: MINT }}>+42</div>
                    <div style={{ fontSize: 8, color: MUTED2, fontWeight: 700 }}>NPS</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[
                      { label: "Promoters (9–10)", pct: 62, color: MINT },
                      { label: "Passives (7–8)",   pct: 20, color: AMBER },
                      { label: "Detractors (0–6)", pct: 18, color: "rgba(248,81,73,.6)" },
                    ].map((r) => (
                      <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", width: 110 }}>{r.label}</div>
                        <div style={{ flex: 1, background: "rgba(255,255,255,.06)", borderRadius: 2, height: 4 }}>
                          <div style={{ height: 4, borderRadius: 2, width: `${r.pct}%`, background: r.color }} />
                        </div>
                        <div style={{ fontSize: 10, color: MUTED2, width: 28, textAlign: "right" }}>{r.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: MUTED2, marginTop: 10 }}>Based on 34 post-resolution surveys (NPS sent 24h after resolution). Suppressed 14d after previous NPS.</div>
              </div>
            </div>

            {/* RIGHT sidebar */}
            <div style={{ padding: 20 }}>

              {/* Open feedback items — live */}
              <div style={{ background: SURFACE, borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 10 }}>
                  Open Feedback Items
                  {openFeedback && (
                    <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 4, background: "rgba(248,81,73,.15)", color: RED, fontSize: 9, fontWeight: 800 }}>
                      {openFeedback.total}
                    </span>
                  )}
                </div>
                {loading ? (
                  <div style={{ fontSize: 12, color: MUTED }}>Loading…</div>
                ) : openFeedback?.items && openFeedback.items.length > 0 ? (
                  openFeedback.items.slice(0, 6).map((item, i) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < Math.min(openFeedback.items.length, 6) - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.7)", marginBottom: 2 }}>
                          {item.summary || item.category}
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,.06)", color: MUTED2, textTransform: "capitalize" }}>{item.category}</span>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 3,
                            background: item.urgency === "high" || item.urgency === "critical" ? "rgba(248,81,73,.12)" : "rgba(245,158,11,.1)",
                            color: item.urgency === "high" || item.urgency === "critical" ? RED : AMBER,
                          }}>{item.urgency}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: MUTED2, flexShrink: 0 }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: MUTED }}>No open items.</div>
                )}
              </div>

              {/* Resolution breakdown — live */}
              <div style={{ background: SURFACE, borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 10 }}>Resolution Breakdown</div>
                {loading ? (
                  <div style={{ height: 12, background: "rgba(255,255,255,.06)", borderRadius: 4 }} />
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 3, height: 12, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ flex: resolvedPct, background: MINT, opacity: 0.7 }} />
                      <div style={{ flex: otherPct, background: "rgba(255,255,255,.2)" }} />
                      <div style={{ flex: openPct, background: AMBER, opacity: 0.6 }} />
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ fontSize: 10, color: MUTED }}><span style={{ color: MINT }}>■</span> Resolved {resolvedPct}%</div>
                      <div style={{ fontSize: 10, color: MUTED }}><span style={{ color: "rgba(255,255,255,.4)" }}>■</span> Other {otherPct}%</div>
                      <div style={{ fontSize: 10, color: MUTED }}><span style={{ color: AMBER }}>■</span> Open {openPct}%</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 90-day trends shell ───────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto 32px", background: "#0d1117", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ background: "#010409", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Feedback Trends</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["7d", "30d", "90d"].map((p) => (
                  <span key={p} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: p === "90d" ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)", color: p === "90d" ? TEXT : MUTED }}>{p}</span>
                ))}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: MINT }}>&#8595; Export PDF</span>
          </div>

          <div style={{ padding: 24 }}>
            {/* 90-day volume (static trend chart) */}
            <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", marginBottom: 16, border: "1px solid rgba(255,255,255,.05)", maxWidth: 740 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>90-Day Submission Volume (Weekly)</div>
              <div style={{ height: 100, display: "flex", gap: 3, alignItems: "flex-end" }}>
                {TREND_BARS_90D.map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: "100%", borderRadius: "2px 2px 0 0", height: b.h, minHeight: 3, background: b.color, opacity: b.color === RED ? 0.65 : 0.5 }} />
                    <div style={{ fontSize: 8, color: MUTED2, fontWeight: 600 }}>{b.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: MUTED2, marginTop: 8 }}>Spikes at W3 (SSO incident) · W7 (Assignment engine failure) · W11–W12 (Fractions content bug cluster)</div>
            </div>

            {/* NPS trend + Avg resolution */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 740 }}>
              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>NPS Trend (Monthly)</div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 60, marginBottom: 6 }}>
                  {[{ h: 30, label: "Jan" }, { h: 34, label: "Feb" }, { h: 42, label: "Mar" }].map((b) => (
                    <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ width: 24, height: b.h, background: MINT, opacity: 0.5 + b.h * 0.004, borderRadius: "2px 2px 0 0" }} />
                      <div style={{ fontSize: 9, color: MUTED2 }}>{b.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: MUTED }}>Jan: +32 → Feb: +37 → Mar: +42</div>
              </div>

              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>Avg Resolution Time</div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 60, marginBottom: 6 }}>
                  {[{ h: 50, color: AMBER, label: "Jan" }, { h: 42, color: AMBER, label: "Feb" }, { h: 28, color: MINT, label: "Mar" }].map((b) => (
                    <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ width: 24, height: b.h, background: b.color, opacity: 0.6 + (b.color === MINT ? 0.1 : 0), borderRadius: "2px 2px 0 0" }} />
                      <div style={{ fontSize: 9, color: MUTED2 }}>{b.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: MUTED }}>Jan: 7.1h → Feb: 5.4h → Mar: 4.2h</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer nav ───────────────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", borderTop: `1px solid ${BORDER}`, paddingTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/owner" style={{ fontSize: 13, color: MINT, textDecoration: "none", fontWeight: 600 }}>&#8592; Dashboard</Link>
          <Link href="/owner/feedback" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Feedback Workbench</Link>
          <Link href="/owner/triage" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Triage</Link>
          <Link href="/owner/content" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Content</Link>
          <Link href="/owner/release" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Release</Link>
          <Link href="/owner/roadmap" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Roadmap</Link>
          <Link href="/owner/governance" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Governance Log</Link>
          <Link href="/owner/command" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Command</Link>
        </div>
      </div>
    </AppFrame>
  );
}
