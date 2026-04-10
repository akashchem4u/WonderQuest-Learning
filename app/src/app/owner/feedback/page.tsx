"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ── Palette ──────────────────────────────────────────────────────────────────
const BASE = "#100b2e";
const MINT = "#50e890";
const VIOLET = "#9b72ff";
const RED = "#f85149";
const AMBER = "#f59e0b";
const BLUE = "#2563eb";
const SURFACE = "#161b22";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#f0f6ff";
const MUTED = "rgba(255,255,255,0.4)";

// ── Types ─────────────────────────────────────────────────────────────────────
type FbStatus = "open" | "pending" | "resolved";

interface FeedbackItem {
  id: string;
  category: string;
  urgency: string;
  summary: string;
  message: string;
  context: Record<string, unknown>;
  submittedByRole: string;
  routingTarget: string;
  reviewerNote: string | null;
  createdAt: string;
  studentId: string | null;
  guardianId: string | null;
  resolved: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function urgencyStyle(u: string): React.CSSProperties {
  if (u === "high" || u === "critical")
    return { background: "rgba(248,81,73,0.2)", color: RED };
  if (u === "medium")
    return { background: "rgba(245,158,11,0.15)", color: AMBER };
  return { background: "rgba(37,99,235,0.15)", color: "#60a5fa" };
}

function resolvedStyle(s: string): React.CSSProperties {
  if (s === "resolved")
    return { background: "rgba(80,232,144,0.15)", color: MINT };
  if (s === "pending")
    return { background: "rgba(245,158,11,0.15)", color: AMBER };
  return { background: "rgba(37,99,235,0.2)", color: "#60a5fa" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  bug:             { icon: "🐛", color: RED },
  enhancement:     { icon: "💡", color: AMBER },
  "feature":       { icon: "✨", color: VIOLET },
  "product-insight": { icon: "💬", color: BLUE },
  content:         { icon: "📖", color: "#38bdf8" },
  safety:          { icon: "🛡️", color: "#f43f5e" },
  general:         { icon: "💬", color: MUTED },
  praise:          { icon: "🎉", color: MINT },
};

interface PublicFeedbackRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  rating: number | null;
  message: string;
  source: string;
  created_at: string;
}

// ── Inner component (uses useSearchParams) ────────────────────────────────────
function FeedbackPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = (searchParams.get("status") ?? "all") as "all" | "open" | "resolved";

  const [tab, setTab] = useState<"inapp" | "public">("inapp");

  // In-app feedback state
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">(statusParam);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [reviewNote, setReviewNote] = useState("");
  const [resolving, setResolving] = useState(false);

  // Public feedback state
  const [publicRows, setPublicRows] = useState<PublicFeedbackRow[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicActiveIdx, setPublicActiveIdx] = useState(0);

  useEffect(() => {
    if (tab !== "public" || publicRows.length > 0) return;
    setPublicLoading(true);
    fetch("/api/owner/public-feedback")
      .then(r => r.json())
      .then((d: { feedback: PublicFeedbackRow[] }) => setPublicRows(d.feedback ?? []))
      .finally(() => setPublicLoading(false));
  }, [tab, publicRows.length]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/owner/feedback?status=${statusFilter}&limit=100`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { items: FeedbackItem[]; total: number; categoryCounts?: Record<string, number> }) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setCategoryCounts(data.categoryCounts ?? {});
        setActiveIdx(0);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filteredItems = categoryFilter === "all"
    ? items
    : items.filter((i) => i.category === categoryFilter);

  const activeItem = filteredItems[activeIdx] ?? null;
  const openCount = items.filter((i) => i.resolved !== "resolved").length;

  function handleFilterChange(f: "all" | "open" | "resolved") {
    setStatusFilter(f);
    setCategoryFilter("all");
    router.replace(`?status=${f}`, { scroll: false });
  }

  async function handleResolve(action: "resolve" | "reopen") {
    if (!activeItem) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/owner/feedback/${activeItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewerNote: reviewNote.trim() || undefined }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((item) =>
          item.id === activeItem.id
            ? { ...item, resolved: action === "resolve" ? "resolved" : "pending", reviewerNote: reviewNote.trim() || item.reviewerNote }
            : item,
        ));
        setReviewNote("");
      }
    } finally {
      setResolving(false);
    }
  }

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main
        style={{
          minHeight: "100vh",
          background: BASE,
          fontFamily: "system-ui,-apple-system,sans-serif",
          paddingBottom: 48,
        }}
      >
        {/* ── Top header bar ──────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(1,4,9,0.97)",
            borderBottom: `1px solid ${BORDER}`,
            padding: "0 28px",
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: TEXT }}>
              WQ <span style={{ color: MINT }}>Console</span>
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: TEXT, letterSpacing: "0.04em" }}>
              💬 Feedback Workbench
            </span>
            {/* Tab switcher */}
            <div style={{ display: "flex", gap: 4, marginLeft: 12 }}>
              {([
                { key: "inapp", label: "In-App" },
                { key: "public", label: `Public${publicRows.length ? ` (${publicRows.length})` : ""}` },
              ] as { key: "inapp" | "public"; label: string }[]).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 6,
                  cursor: "pointer", border: "none", fontFamily: "system-ui",
                  background: tab === t.key ? VIOLET : "rgba(255,255,255,0.07)",
                  color: tab === t.key ? "#fff" : MUTED,
                }}>{t.label}</button>
              ))}
            </div>
            {tab === "inapp" && !loading && (
              <span style={{ fontSize: 10, fontWeight: 800, background: AMBER, color: "#1a1440", borderRadius: 4, padding: "1px 6px" }}>
                {openCount} open
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link
              href="/owner"
              style={{ fontSize: 11, fontWeight: 700, color: VIOLET, textDecoration: "none" }}
            >
              ← Dashboard
            </Link>
            <Link
              href="/owner/routes"
              style={{ fontSize: 11, fontWeight: 700, color: MUTED, textDecoration: "none" }}
            >
              Route Health
            </Link>
            <Link
              href="/owner/release"
              style={{ fontSize: 11, fontWeight: 700, color: MUTED, textDecoration: "none" }}
            >
              Release Gate
            </Link>
          </div>
        </div>

        {/* ── Public feedback tab ─────────────────────────────────────────── */}
        {tab === "public" && (
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px 48px" }}>
            {publicLoading && <p style={{ color: MUTED, textAlign: "center", padding: 60 }}>Loading…</p>}
            {!publicLoading && publicRows.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: MUTED, border: `1px dashed ${BORDER}`, borderRadius: 14 }}>
                <p style={{ fontSize: 32, margin: "0 0 10px" }}>📭</p>
                <p style={{ margin: 0 }}>No public feedback yet</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              {/* List */}
              <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {publicRows.map((row, idx) => (
                  <div key={row.id} onClick={() => setPublicActiveIdx(idx)} style={{
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    background: idx === publicActiveIdx ? "rgba(155,114,255,0.12)" : SURFACE,
                    border: `1px solid ${idx === publicActiveIdx ? VIOLET + "55" : BORDER}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      {row.rating && <span style={{ color: AMBER, fontSize: 11 }}>{"★".repeat(row.rating)}</span>}
                      {row.role && <span style={{ fontSize: 9, fontWeight: 700, color: VIOLET, background: VIOLET + "22", padding: "1px 6px", borderRadius: 4, textTransform: "capitalize" }}>{row.role}</span>}
                      <span style={{ fontSize: 9, color: MUTED, marginLeft: "auto" }}>{timeAgo(row.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>
                      {row.message.slice(0, 70)}{row.message.length > 70 ? "…" : ""}
                    </div>
                    {row.name && <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>— {row.name}</div>}
                  </div>
                ))}
              </div>
              {/* Detail */}
              {publicRows[publicActiveIdx] && (
                <div style={{ flex: 1, background: SURFACE, borderRadius: 12, padding: "16px 20px", border: `1px solid ${BORDER}`, alignSelf: "flex-start" }}>
                  {(() => {
                    const r = publicRows[publicActiveIdx];
                    return (
                      <>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                          {r.rating && <span style={{ color: AMBER, fontSize: 16 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>}
                          {r.role && <span style={{ fontSize: 10, fontWeight: 700, color: VIOLET, background: VIOLET + "22", padding: "2px 8px", borderRadius: 6, textTransform: "capitalize" }}>{r.role}</span>}
                          <span style={{ fontSize: 10, color: MUTED, marginLeft: "auto" }}>{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: "0 0 14px" }}>{r.message}</p>
                        <div style={{ display: "flex", gap: 16, fontSize: 11, color: MUTED }}>
                          {r.name && <span>👤 {r.name}</span>}
                          {r.email && <a href={`mailto:${r.email}`} style={{ color: "#2dd4bf", textDecoration: "none" }}>✉ {r.email}</a>}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 2-panel workbench ────────────────────────────────────────────── */}
        {tab === "inapp" && <div
          style={{
            display: "flex",
            maxWidth: 1100,
            margin: "0 auto",
            minHeight: "calc(100vh - 52px)",
          }}
        >
          {/* ── Left: queue ─────────────────────────────────────────────── */}
          <div
            style={{
              width: 320,
              borderRight: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Queue header + filters */}
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TEXT, marginBottom: 8 }}>
                Feedback Queue{" "}
                <span style={{ color: MUTED, fontWeight: 400 }}>({loading ? "…" : `${total}`})</span>
              </div>
              {/* Status filter */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                {([
                  { key: "all", label: "All" },
                  { key: "open", label: "Open" },
                  { key: "resolved", label: "Resolved" },
                ] as { key: "all" | "open" | "resolved"; label: string }[]).map((f) => {
                  const active = statusFilter === f.key;
                  return (
                    <span key={f.key} onClick={() => handleFilterChange(f.key)} style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 8, cursor: "pointer",
                      background: active ? MINT : "rgba(255,255,255,0.07)", color: active ? "#010409" : MUTED,
                    }}>{f.label}</span>
                  );
                })}
              </div>
              {/* Category filter chips */}
              {!loading && Object.keys(categoryCounts).length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span onClick={() => setCategoryFilter("all")} style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, cursor: "pointer",
                    background: categoryFilter === "all" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                    color: categoryFilter === "all" ? TEXT : MUTED,
                  }}>All types</span>
                  {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, cnt]) => {
                    const meta = CATEGORY_META[cat] ?? { icon: "💬", color: MUTED };
                    const active = categoryFilter === cat;
                    return (
                      <span key={cat} onClick={() => { setCategoryFilter(cat); setActiveIdx(0); }} style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, cursor: "pointer",
                        background: active ? `${meta.color}30` : "rgba(255,255,255,0.05)",
                        color: active ? meta.color : MUTED,
                        border: active ? `1px solid ${meta.color}50` : "1px solid transparent",
                      }}>{meta.icon} {cat} ({cnt})</span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Feedback list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loading && (
                <div style={{ padding: "24px 16px", fontSize: 11, color: MUTED }}>
                  Loading feedback…
                </div>
              )}
              {error && (
                <div style={{ padding: "24px 16px", fontSize: 11, color: RED }}>
                  Error: {error}
                </div>
              )}
              {!loading && !error && items.length === 0 && (
                <div style={{ padding: "24px 16px", fontSize: 11, color: MUTED }}>
                  No feedback items found.
                </div>
              )}
              {!loading && !error && filteredItems.length === 0 && (
                <div style={{ padding: "20px 14px", fontSize: 11, color: MUTED }}>No items match this filter.</div>
              )}
              {!loading && !error && filteredItems.map((item, idx) => {
                const isActive = idx === activeIdx;
                const catMeta = CATEGORY_META[item.category] ?? { icon: "💬", color: MUTED };
                return (
                  <div key={item.id} onClick={() => { setActiveIdx(idx); setReviewNote(""); }} style={{
                    padding: "10px 13px",
                    borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    cursor: "pointer",
                    background: isActive ? "rgba(80,232,144,0.06)" : "transparent",
                    borderLeft: isActive ? `3px solid ${MINT}` : "3px solid transparent",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      <span style={{ fontSize: 11 }}>{catMeta.icon}</span>
                      <span style={{ ...urgencyStyle(item.urgency), fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 4, textTransform: "uppercase" }}>
                        {item.urgency}
                      </span>
                      {item.submittedByRole === "beta-tester" && (
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: "rgba(255,209,102,0.18)", color: AMBER }}>BETA</span>
                      )}
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>{timeAgo(item.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.3, marginBottom: 4 }}>
                      {item.summary || item.message.slice(0, 80) || "(no summary)"}
                    </div>
                    <span style={{ ...resolvedStyle(item.resolved), fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, textTransform: "capitalize" }}>
                      {item.resolved}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: detail panel ──────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              background: BASE,
            }}
          >
            {loading && (
              <div style={{ fontSize: 13, color: MUTED, padding: "32px 0" }}>
                Loading…
              </div>
            )}
            {!loading && !activeItem && !error && (
              <div style={{ fontSize: 13, color: MUTED, padding: "32px 0" }}>
                No item selected.
              </div>
            )}
            {!loading && activeItem && (
              <>
                {/* Detail header card */}
                <div
                  style={{
                    background: SURFACE,
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 14,
                    border: `1px solid rgba(255,255,255,0.05)`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        ...urgencyStyle(activeItem.urgency),
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 4,
                        flexShrink: 0,
                        marginTop: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      {activeItem.urgency} · {activeItem.category}
                    </span>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: TEXT,
                        lineHeight: 1.3,
                      }}
                    >
                      {activeItem.summary || "(no summary)"}
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    {[
                      {
                        label: `ID: ${activeItem.id.slice(0, 8)}…`,
                        bg: "rgba(255,255,255,0.08)",
                        color: MUTED,
                      },
                      {
                        label: activeItem.category,
                        bg: "rgba(37,99,235,0.15)",
                        color: "#60a5fa",
                      },
                      {
                        label: `Urgency: ${activeItem.urgency}`,
                        bg: "rgba(245,158,11,0.15)",
                        color: AMBER,
                      },
                      {
                        label: `Submitted ${timeAgo(activeItem.createdAt)}`,
                        bg: "rgba(255,255,255,0.06)",
                        color: MUTED,
                      },
                    ].map((chip) => (
                      <span
                        key={chip.label}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 5,
                          background: chip.bg,
                          color: chip.color,
                        }}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>

                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: MUTED }}>Status:</span>
                    <span
                      style={{
                        ...resolvedStyle(activeItem.resolved),
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 5,
                        textTransform: "capitalize",
                      }}
                    >
                      {activeItem.resolved}
                    </span>
                  </div>
                </div>

                {/* Full message */}
                {(() => {
                  const ctx = activeItem.context as Record<string, unknown>;
                  const area = ctx?.area ? String(ctx.area) : null;
                  const device = ctx?.deviceType ? String(ctx.deviceType) : null;
                  const browser = ctx?.browser ? String(ctx.browser) : null;
                  const testerName = ctx?.testerName ? String(ctx.testerName) : null;
                  const testerEmail = ctx?.testerEmail ? String(ctx.testerEmail) : null;
                  return (
                <div style={{ background: SURFACE, borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: `1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: 6 }}>Full message</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {activeItem.message || "(no message)"}
                  </div>
                  {area && (
                    <div style={{ marginTop: 8, fontSize: 10, color: MUTED }}>
                      Area: <strong style={{ color: "rgba(255,255,255,0.6)" }}>{area}</strong>
                      {device ? ` · ${device}` : ""}
                      {browser ? ` · ${browser}` : ""}
                    </div>
                  )}
                  {testerName && (
                    <div style={{ marginTop: 4, fontSize: 10, color: AMBER }}>
                      Tester: {testerName}{testerEmail ? ` · ${testerEmail}` : ""}
                    </div>
                  )}
                </div>
                  );
                })()}

                {/* Action row */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  {activeItem.resolved !== "resolved" ? (
                    <button onClick={() => void handleResolve("resolve")} disabled={resolving} style={{
                      padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      cursor: resolving ? "not-allowed" : "pointer", fontFamily: "system-ui",
                      background: MINT, color: "#010409", border: "none", opacity: resolving ? 0.7 : 1,
                    }}>
                      {resolving ? "Saving…" : "✓ Mark resolved"}
                    </button>
                  ) : (
                    <button onClick={() => void handleResolve("reopen")} disabled={resolving} style={{
                      padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      cursor: resolving ? "not-allowed" : "pointer", fontFamily: "system-ui",
                      background: "rgba(255,255,255,0.07)", color: MUTED, border: "none",
                    }}>
                      ↩ Reopen
                    </button>
                  )}
                </div>

                {/* Reviewer note */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: 6 }}>
                    Reviewer note (saved with resolution)
                  </div>
                  {activeItem.reviewerNote && !reviewNote && (
                    <div style={{ fontSize: 11, color: MINT, marginBottom: 6, fontStyle: "italic" }}>
                      Previous note: {activeItem.reviewerNote}
                    </div>
                  )}
                  <textarea
                    placeholder="e.g. Fixed in v2.1.4 — hint button tap target increased to 44px"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 10px", background: SURFACE,
                      border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8,
                      fontSize: 11, fontFamily: "system-ui", color: "rgba(255,255,255,0.7)",
                      resize: "none", minHeight: 64, outline: "none", display: "block", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Priority auto-triage spec callout */}
                <div
                  style={{
                    marginTop: 32,
                    background: SURFACE,
                    borderRadius: 10,
                    padding: "14px 16px",
                    border: `1px solid rgba(255,255,255,0.05)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: MUTED,
                      marginBottom: 10,
                    }}
                  >
                    Priority Auto-triage Rules
                  </div>
                  <table
                    style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}
                  >
                    <thead>
                      <tr>
                        {["Severity", "Auto P-level", "Slack alert", "SLA"].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "4px 8px",
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "rgba(255,255,255,0.25)",
                              borderBottom: `1px solid rgba(255,255,255,0.06)`,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ["Critical (platform unusable)", "P0", "#on-call immediate", "4h"],
                          ["Major (impacts teaching)", "P1", "#engineering", "24h"],
                          ["Moderate (workaround exists)", "P2", "None", "48h"],
                          ["Minor", "P3", "None", "1 week"],
                          ["Feature request", "Feature", "None", "Monthly review"],
                        ] as const
                      ).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              style={{
                                padding: "5px 8px",
                                fontSize: 10,
                                color: "rgba(255,255,255,0.5)",
                                borderBottom:
                                  i < 4 ? `1px solid rgba(255,255,255,0.04)` : "none",
                              }}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Footer nav */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 16,
                borderTop: `1px solid ${BORDER}`,
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <Link href="/owner" style={{ fontSize: 12, fontWeight: 700, color: VIOLET, textDecoration: "none" }}>
                ← Dashboard
              </Link>
              <Link href="/owner/routes" style={{ fontSize: 12, fontWeight: 700, color: MUTED, textDecoration: "none" }}>
                Route Health
              </Link>
              <Link href="/owner/release" style={{ fontSize: 12, fontWeight: 700, color: MUTED, textDecoration: "none" }}>
                Release Gate
              </Link>
              <Link href="/owner/analytics" style={{ fontSize: 12, fontWeight: 700, color: MUTED, textDecoration: "none" }}>
                Command Center
              </Link>
            </div>
          </div>
        </div>}
      </main>
    </AppFrame>
  );
}

// ── Page (wraps inner in Suspense for useSearchParams) ────────────────────────
export default function OwnerFeedbackPage() {
  return (
    <Suspense
      fallback={
        <AppFrame audience="owner" currentPath="/owner">
          <main
            style={{
              minHeight: "100vh",
              background: BASE,
              fontFamily: "system-ui,-apple-system,sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: MUTED, fontSize: 13 }}>Loading feedback…</span>
          </main>
        </AppFrame>
      }
    >
      <FeedbackPageInner />
    </Suspense>
  );
}
