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

// ── Inner component (uses useSearchParams) ────────────────────────────────────
function FeedbackPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = (searchParams.get("status") ?? "all") as "all" | "open" | "resolved";

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">(statusParam);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/owner/feedback?status=${statusFilter}&limit=50`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setActiveIdx(0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const activeItem = items[activeIdx] ?? null;
  const openCount = items.filter((i) => i.resolved !== "resolved").length;

  function handleFilterChange(f: "all" | "open" | "resolved") {
    setStatusFilter(f);
    router.replace(`?status=${f}`, { scroll: false });
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
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: TEXT,
                letterSpacing: "0.04em",
              }}
            >
              💬 Feedback Workbench
            </span>
            {!loading && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  background: AMBER,
                  color: "#1a1440",
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
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

        {/* ── 2-panel workbench ────────────────────────────────────────────── */}
        <div
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
            <div
              style={{
                padding: "14px 16px",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: TEXT,
                  marginBottom: 10,
                }}
              >
                Feedback Queue{" "}
                <span style={{ color: MUTED, fontWeight: 400 }}>
                  ({loading ? "…" : `${total} total`})
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "open", label: "Open" },
                    { key: "resolved", label: "Resolved" },
                  ] as { key: "all" | "open" | "resolved"; label: string }[]
                ).map((f) => {
                  const active = statusFilter === f.key;
                  return (
                    <span
                      key={f.key}
                      onClick={() => handleFilterChange(f.key)}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: active ? MINT : "rgba(255,255,255,0.07)",
                        color: active ? "#010409" : MUTED,
                      }}
                    >
                      {f.label}
                    </span>
                  );
                })}
              </div>
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
              {!loading &&
                !error &&
                items.map((item, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveIdx(idx)}
                      style={{
                        padding: "11px 14px",
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                        cursor: "pointer",
                        background: isActive ? "rgba(80,232,144,0.06)" : "transparent",
                        borderLeft: isActive ? `3px solid ${MINT}` : "3px solid transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            ...urgencyStyle(item.urgency),
                            fontSize: 9,
                            fontWeight: 800,
                            padding: "1px 5px",
                            borderRadius: 4,
                            textTransform: "uppercase",
                          }}
                        >
                          {item.urgency}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            color: "rgba(255,255,255,0.3)",
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        >
                          {item.category}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            color: "rgba(255,255,255,0.2)",
                            marginLeft: "auto",
                          }}
                        >
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.7)",
                          lineHeight: 1.3,
                          marginBottom: 4,
                        }}
                      >
                        {item.summary || "(no summary)"}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.25)",
                          marginBottom: 5,
                        }}
                      >
                        {item.guardianId ? `Guardian ${item.guardianId.slice(0, 8)}…` : ""}
                        {item.studentId ? ` · Student ${item.studentId.slice(0, 8)}…` : ""}
                      </div>
                      <span
                        style={{
                          ...resolvedStyle(item.resolved),
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          textTransform: "capitalize",
                        }}
                      >
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

                {/* Action row */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {(
                    [
                      { label: "✓ Mark resolved", bg: MINT, color: "#010409", border: "none" },
                      { label: "↑ Bump priority", bg: BLUE, color: "#fff", border: "none" },
                      {
                        label: "🔔 Escalate",
                        bg: "rgba(248,81,73,0.15)",
                        color: RED,
                        border: `1px solid rgba(248,81,73,0.3)`,
                      },
                      { label: "✕ Dismiss", bg: "rgba(255,255,255,0.07)", color: MUTED, border: "none" },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.label}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "system-ui",
                        background: btn.bg,
                        color: btn.color,
                        border: btn.border ?? "none",
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Reply to reporter */}
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: MUTED,
                      marginBottom: 6,
                    }}
                  >
                    Reply to reporter (delivered via platform notification)
                  </div>
                  <textarea
                    placeholder="Type your reply here…"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: SURFACE,
                      border: `1px solid rgba(255,255,255,0.1)`,
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: "system-ui",
                      color: "rgba(255,255,255,0.7)",
                      resize: "none",
                      minHeight: 72,
                      outline: "none",
                      display: "block",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    style={{
                      marginTop: 6,
                      padding: "6px 14px",
                      background: MINT,
                      color: "#010409",
                      border: "none",
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "system-ui",
                    }}
                  >
                    Send reply
                  </button>
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
        </div>
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
