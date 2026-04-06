"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surface2: "#1c2330",
  surface3: "#0d1117",
  border: "rgba(255,255,255,0.06)",
  border2: "rgba(255,255,255,0.08)",
  text: "#f0f6ff",
  muted: "#8b949e",
  muted2: "#c9d1d9",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  mintAlt: "#50e890",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  coral: "#ff7b6b",
  teal: "#58e8c1",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type Category = "ux" | "feature" | "content" | "accessibility" | "performance" | "compliance";
type Priority = "P0" | "P1" | "P2" | "P3";
type Status = "backlog" | "under_review" | "scoped" | "in_dev" | "in_qa" | "shipped";
type Tab = "board" | "metrics";

interface ECard {
  title: string;
  cat: Category;
  chips: { label: string; color: string; bg: string }[];
  foot: string;
}

interface PipelineCol {
  label: string;
  cards: ECard[];
}

// ── Chip helpers ──────────────────────────────────────────────────────────────
function catChip(cat: Category) {
  const map: Record<Category, { label: string; color: string; bg: string }> = {
    ux:            { label: "UX",            color: C.amber,   bg: "rgba(245,158,11,.15)" },
    feature:       { label: "Feature",       color: C.blue,    bg: "rgba(56,189,248,.15)" },
    content:       { label: "Content",       color: C.coral,   bg: "rgba(255,123,107,.15)" },
    accessibility: { label: "Accessibility", color: C.blue,    bg: "rgba(56,189,248,.15)" },
    performance:   { label: "Performance",   color: C.teal,    bg: "rgba(88,232,193,.15)" },
    compliance:    { label: "Compliance",    color: C.coral,   bg: "rgba(255,123,107,.15)" },
  };
  return map[cat];
}

function priChip(p: Priority) {
  const map: Record<Priority, { color: string; bg: string }> = {
    P0: { color: C.gold,    bg: "rgba(255,209,102,.15)" },
    P1: { color: C.violet,  bg: "rgba(155,114,255,.15)" },
    P2: { color: C.muted,   bg: "rgba(139,148,158,.15)" },
    P3: { color: C.muted,   bg: "rgba(139,148,158,.15)" },
  };
  return map[p];
}

function relChip(rel: string, shipped = false) {
  return shipped
    ? { color: C.mintAlt, bg: "rgba(80,232,144,.15)" }
    : { color: C.muted,   bg: "rgba(139,148,158,.15)" };
}

// ── Overview API shape ────────────────────────────────────────────────────────
interface OverviewCounts {
  students: number;
  guardians: number;
  sessions: number;
  feedbackItems: number;
  totalPoints: number;
  exampleItems: number;
  explainers: number;
}
interface FeedbackByCat { category: string; count: number }
interface Overview {
  counts: OverviewCounts;
  feedbackByCategory: FeedbackByCat[];
}

// ── Pipeline columns (static board data) ─────────────────────────────────────
const COLUMNS: PipelineCol[] = [
  {
    label: "Backlog",
    cards: [
      {
        title: "Parent dashboard dark mode",
        cat: "feature",
        chips: [
          { ...catChip("feature"), label: "Feature" },
          { ...priChip("P2"), label: "P2" },
        ],
        foot: "3 feedback items · No release yet",
      },
      {
        title: "Interest refresh auto-trigger on theme switch",
        cat: "feature",
        chips: [
          { ...catChip("feature"), label: "Feature" },
          { ...priChip("P1"), label: "P1" },
          { ...relChip("v2.7"), label: "v2.7" },
        ],
        foot: "2 feedback items",
      },
    ],
  },
  {
    label: "Under Review",
    cards: [
      {
        title: "Hint button 44px tap target — mobile",
        cat: "ux",
        chips: [
          { ...catChip("ux"), label: "UX" },
          { ...priChip("P0"), label: "P0" },
          { ...relChip("v2.5"), label: "v2.5" },
        ],
        foot: "5 feedback items · Accessibility team",
      },
      {
        title: "Quest celebration animation — iPad lag",
        cat: "performance",
        chips: [
          { ...catChip("performance"), label: "Performance" },
          { ...priChip("P1"), label: "P1" },
          { ...relChip("v2.6"), label: "v2.6" },
        ],
        foot: "4 feedback items",
      },
    ],
  },
  {
    label: "Scoped",
    cards: [
      {
        title: "P3 content gap — Social Studies",
        cat: "content",
        chips: [
          { ...catChip("content"), label: "Content" },
          { ...priChip("P0"), label: "P0" },
          { ...relChip("v2.6"), label: "v2.6" },
        ],
        foot: "7 feedback items · Content team",
      },
      {
        title: "Voice speed — persist across sessions",
        cat: "ux",
        chips: [
          { ...catChip("ux"), label: "UX" },
          { ...priChip("P1"), label: "P1" },
          { ...relChip("v2.6"), label: "v2.6" },
        ],
        foot: "6 feedback items",
      },
    ],
  },
  {
    label: "In Dev",
    cards: [
      {
        title: "High contrast mode — child play screen",
        cat: "accessibility",
        chips: [
          { ...catChip("accessibility"), label: "Accessibility" },
          { ...priChip("P0"), label: "P0" },
          { ...relChip("v2.6"), label: "v2.6" },
        ],
        foot: "3 feedback items · WCAG AAA target",
      },
      {
        title: "Theme rotation interest-tag match algorithm",
        cat: "feature",
        chips: [
          { ...catChip("feature"), label: "Feature" },
          { ...priChip("P1"), label: "P1" },
          { ...relChip("v2.6"), label: "v2.6" },
        ],
        foot: "4 feedback items",
      },
    ],
  },
  {
    label: "In QA",
    cards: [
      {
        title: "Benchmark disclaimer keyword auto-trigger",
        cat: "compliance",
        chips: [
          { ...catChip("compliance"), label: "Compliance" },
          { ...priChip("P0"), label: "P0" },
          { ...relChip("v2.5"), label: "v2.5" },
        ],
        foot: "2 items · Legal sign-off done",
      },
      {
        title: "Parent quiet hours enforcement log",
        cat: "ux",
        chips: [
          { ...catChip("ux"), label: "UX" },
          { ...priChip("P1"), label: "P1" },
          { ...relChip("v2.5"), label: "v2.5" },
        ],
        foot: "3 feedback items",
      },
    ],
  },
  {
    label: "Shipped ✓",
    cards: [
      {
        title: "Theme rotation — defer during active quest",
        cat: "ux",
        chips: [
          { ...catChip("ux"), label: "UX" },
          { ...priChip("P1"), label: "P1" },
          { ...relChip("v2.5", true), label: "v2.5 ✓" },
        ],
        foot: "Shipped Mar 10, 2026",
      },
      {
        title: "Touch targets ≥44px — all elements",
        cat: "accessibility",
        chips: [
          { ...catChip("accessibility"), label: "Accessibility" },
          { ...priChip("P0"), label: "P0" },
          { ...relChip("v2.5", true), label: "v2.5 ✓" },
        ],
        foot: "Shipped Mar 10, 2026",
      },
      {
        title: "P3 Arts theme — Painter's World",
        cat: "content",
        chips: [
          { ...catChip("content"), label: "Content" },
          { ...priChip("P1"), label: "P1" },
          { ...relChip("v2.5", true), label: "v2.5 ✓" },
        ],
        foot: "Shipped Mar 10, 2026",
      },
    ],
  },
];

const CAT_FILTERS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ux", label: "UX" },
  { key: "feature", label: "Feature" },
  { key: "content", label: "Content" },
  { key: "accessibility", label: "Accessibility" },
  { key: "performance", label: "Performance" },
  { key: "compliance", label: "Compliance" },
];

// BAR_ROWS is derived from live data when available; fallback provided below
const BAR_ROWS_FALLBACK = [
  { label: "UX",            pct: 29, count: 7,  color: C.amber  },
  { label: "Feature",       pct: 21, count: 5,  color: C.blue   },
  { label: "Content",       pct: 17, count: 4,  color: C.coral  },
  { label: "Accessibility", pct: 17, count: 4,  color: C.teal   },
  { label: "Performance",   pct: 8,  count: 2,  color: C.violet },
  { label: "Compliance",    pct: 8,  count: 2,  color: C.gold   },
];

const TIMELINE_ITEMS = [
  {
    ver: "v2.5",
    chipLabel: "Shipped",
    chipColor: C.mintAlt,
    chipBg: "rgba(80,232,144,.15)",
    n: 8,
    sub: "enhancements shipped\nMar 10, 2026",
  },
  {
    ver: "v2.6",
    chipLabel: "In Flight",
    chipColor: C.amber,
    chipBg: "rgba(245,158,11,.15)",
    n: 5,
    sub: "enhancements in dev/QA\nTarget: Apr 15, 2026",
  },
  {
    ver: "v2.7",
    chipLabel: "Planned",
    chipColor: C.muted,
    chipBg: "rgba(139,148,158,.15)",
    n: 4,
    sub: "scoped / backlog\nTarget: Jun 1, 2026",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EnhancementPipelinePage() {
  return (
    <AppFrame audience="owner">
      <EnhancementPipelineContent />
    </AppFrame>
  );
}

function EnhancementPipelineContent() {
  const [tab, setTab] = useState<Tab>("board");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    fetch("/api/owner/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setOverview(data as Overview); })
      .catch(() => {})
      .finally(() => setLoadingOverview(false));
  }, []);

  // Build live bar rows from feedbackByCategory if available
  const barRows = (() => {
    if (!overview || overview.feedbackByCategory.length === 0) return BAR_ROWS_FALLBACK;
    const catColorMap: Record<string, string> = {
      ux: C.amber, feature: C.blue, content: C.coral,
      accessibility: C.teal, performance: C.violet, compliance: C.gold,
    };
    const total = overview.feedbackByCategory.reduce((s, c) => s + c.count, 0);
    return overview.feedbackByCategory.slice(0, 6).map((c) => ({
      label: c.category.charAt(0).toUpperCase() + c.category.slice(1),
      pct: total > 0 ? Math.round((c.count / total) * 100) : 0,
      count: c.count,
      color: catColorMap[c.category.toLowerCase()] ?? C.muted,
    }));
  })();

  return (
    <main style={{ background: C.base, minHeight: "100vh", padding: "24px", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <h1 style={{ fontSize: "20px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
        Enhancement Pipeline
      </h1>
      <p style={{ fontSize: "14px", color: C.muted, marginBottom: "24px" }}>
        Item #282 — Owner · Track all feature requests and UX enhancements from backlog to shipped
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {(["board", "metrics"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 18px",
              borderRadius: "6px",
              border: `1px solid ${tab === t ? C.mintAlt : "rgba(255,255,255,.12)"}`,
              background: tab === t ? C.mintAlt : "transparent",
              color: tab === t ? "#0d1117" : C.muted,
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              minHeight: "44px",
              textTransform: "capitalize",
            }}
          >
            {t === "board" ? "Pipeline Board" : "Metrics"}
          </button>
        ))}
      </div>

      {/* ── Tab: Board ── */}
      {tab === "board" && (
        <div>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            {CAT_FILTERS.map((f) => {
              const active = catFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setCatFilter(f.key)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    border: `1px solid ${active ? C.mintAlt : "rgba(255,255,255,.12)"}`,
                    background: active ? "rgba(80,232,144,.12)" : "transparent",
                    color: active ? C.mintAlt : C.muted,
                    fontSize: "13px",
                    cursor: "pointer",
                    minHeight: "36px",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Pipeline board */}
          <div style={{ overflowX: "auto", paddingBottom: "12px" }}>
            <div style={{ display: "flex", gap: "12px", minWidth: "980px" }}>
              {COLUMNS.map((col) => (
                <div key={col.label} style={{ flex: 1, minWidth: "155px" }}>
                  <div style={{
                    fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: ".07em", color: C.muted,
                    padding: "6px 8px", background: "rgba(255,255,255,.04)",
                    borderRadius: "6px", textAlign: "center", marginBottom: "10px",
                  }}>
                    {col.label}
                  </div>
                  {col.cards
                    .filter((c) => catFilter === "all" || c.cat === catFilter)
                    .map((card, i) => (
                      <div key={i} style={{
                        background: C.surface2, border: `1px solid ${C.border2}`,
                        borderRadius: "8px", padding: "12px", marginBottom: "10px",
                      }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.4, marginBottom: "8px", color: C.text }}>
                          {card.title}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                          {card.chips.map((chip, ci) => (
                            <span key={ci} style={{
                              display: "inline-flex", alignItems: "center",
                              padding: "3px 10px", borderRadius: "20px",
                              fontSize: "12px", fontWeight: 600,
                              background: chip.bg, color: chip.color,
                            }}>
                              {chip.label}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: "11px", color: C.muted }}>{card.foot}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Metrics ── */}
      {tab === "metrics" && (
        <div>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "20px" }}>
            {[
              {
                n: loadingOverview ? "…" : (overview?.counts.feedbackItems.toLocaleString() ?? "—"),
                label: "Feedback Items",
                color: C.mintAlt,
              },
              {
                n: loadingOverview ? "…" : (overview?.counts.exampleItems.toLocaleString() ?? "—"),
                label: "Example Items",
                color: C.gold,
              },
              {
                n: loadingOverview ? "…" : (overview?.counts.explainers.toLocaleString() ?? "—"),
                label: "Explainer Assets",
                color: C.violet,
              },
              {
                n: loadingOverview ? "…" : (overview?.feedbackByCategory.length.toString() ?? "—"),
                label: "Feedback Categories",
                color: C.muted,
              },
            ].map((s) => (
              <div key={s.label} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: "8px", padding: "16px", textAlign: "center",
              }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: s.color }}>{s.n}</div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* By category */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: C.text }}>By Category</div>
            {barRows.map((row) => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ width: "120px", fontSize: "12px", color: C.muted, textAlign: "right", flexShrink: 0 }}>
                  {row.label}
                </span>
                <div style={{ flex: 1, background: "rgba(255,255,255,.06)", borderRadius: "4px", height: "20px", overflow: "hidden" }}>
                  <div style={{
                    width: `${row.pct}%`, height: "100%", borderRadius: "4px",
                    background: row.color, display: "flex", alignItems: "center",
                    paddingLeft: "8px", fontSize: "11px", fontWeight: 700, color: "#0d1117",
                  }}>
                    {row.label.slice(0, 4)}
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: C.muted, width: "20px", textAlign: "right", flexShrink: 0 }}>
                  {row.count}
                </span>
              </div>
            ))}
          </div>

          {/* Release timeline */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: C.text }}>Release Timeline</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {TIMELINE_ITEMS.map((tl) => (
                <div key={tl.ver} style={{
                  background: C.surface2, border: `1px solid ${C.border2}`,
                  borderRadius: "8px", padding: "14px",
                }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>{tl.ver}</div>
                  <span style={{
                    display: "inline-flex", padding: "3px 10px", borderRadius: "20px",
                    fontSize: "12px", fontWeight: 600, marginBottom: "8px",
                    background: tl.chipBg, color: tl.chipColor,
                  }}>
                    {tl.chipLabel}
                  </span>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: C.mintAlt }}>{tl.n}</div>
                  <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px", lineHeight: 1.5 }}>
                    {tl.sub.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Velocity */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "20px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px",
          }}>
            <div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>Avg. backlog → shipped</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: C.mintAlt }}>18 days</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>Feedback → feature rate</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: C.violet }}>34%</div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
