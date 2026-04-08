"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

export const dynamic = "force-dynamic";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#06071a",
  bgDeep: "#010409",
  surface: "#12152e",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  muted2: "rgba(255,255,255,0.25)",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type RouteStatus = "healthy" | "degraded" | "down";

interface RouteHealth {
  path: string;
  label: string;
  status: RouteStatus;
  lastCheck: string;
  notes: string;
}

interface RouteHealthData {
  routes: RouteHealth[];
  activity: {
    sessionsLast1h: number;
    sessionsLast24h: number;
  };
  checkedAt: string;
}

// ── Runbooks (no external links — add real URLs in settings) ──────────────────
const RUNBOOK_LINKS = [
  {
    label: "Incident Response Runbook",
    desc: "Declare → page on-call → update status page → post-mortem",
  },
  {
    label: "Assignment Engine Recovery",
    desc: "Redis flush, queue drain, consumer restart steps",
  },
  {
    label: "Auth / SSO Troubleshooting",
    desc: "Clever / ClassLink / Google OAuth common failure modes",
  },
  {
    label: "Database Failover Procedure",
    desc: "RDS failover, replica promotion, connection string rotation",
  },
  {
    label: "Status Page Update Guide",
    desc: "How to post and resolve incidents on the teacher-facing status page",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(s: RouteStatus) {
  if (s === "healthy") return C.mint;
  if (s === "degraded") return C.amber;
  return C.red;
}

function statusLabel(s: RouteStatus) {
  if (s === "healthy") return "Healthy";
  if (s === "degraded") return "Degraded";
  return "Down";
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function overallStatus(routes: RouteHealth[]): RouteStatus {
  if (routes.some((r) => r.status === "down")) return "down";
  if (routes.some((r) => r.status === "degraded")) return "degraded";
  return "healthy";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 16 }: { w?: string | number; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: "rgba(255,255,255,0.07)",
        animation: "pulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function IncidentPage() {
  const [data, setData] = useState<RouteHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/route-health");
      if (res.status === 401) {
        setError("Owner access required. Please log in.");
      } else if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to load route health.");
      } else {
        const json = await res.json();
        setData(json as RouteHealthData);
        setLastRefreshed(new Date().toISOString());
      }
    } catch {
      setError("Network error — could not reach route health API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const timer = setInterval(fetchHealth, 60_000);
    return () => clearInterval(timer);
  }, [fetchHealth]);

  const overall = data ? overallStatus(data.routes) : null;
  const overallColor = overall ? statusColor(overall) : C.muted;
  const overallText =
    overall === "healthy"
      ? "All systems operational"
      : overall === "degraded"
      ? "Partial degradation detected"
      : overall === "down"
      ? "One or more systems are down"
      : "Checking…";

  return (
    <AppFrame audience="owner" currentPath="/owner/incident">
      <main
        style={{
          minHeight: "100vh",
          background: C.bg,
          padding: "24px 20px 56px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
        }}
      >
        <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`}</style>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* ── Header ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.muted, marginBottom: 4 }}>
              Owner · Operations
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>
                  Incident &amp; Route Health
                </h1>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                  Live monitoring · auto-refreshes every 60 seconds
                </p>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loading}
                style={{
                  background: "rgba(155,114,255,.15)",
                  border: "1px solid rgba(155,114,255,.3)",
                  borderRadius: 8,
                  padding: "7px 14px",
                  color: loading ? C.muted : C.violet,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  fontFamily: "inherit",
                  letterSpacing: ".04em",
                }}
              >
                {loading ? "Refreshing…" : "↻ Refresh"}
              </button>
            </div>
            {lastRefreshed && !loading && (
              <div style={{ fontSize: 11, color: C.muted2, marginTop: 4 }}>
                Last refreshed: {formatTime(lastRefreshed)}
              </div>
            )}
          </div>

          {/* ── Error state ──────────────────────────────────────────── */}
          {error && (
            <div
              style={{
                background: "rgba(248,81,73,.08)",
                border: "1px solid rgba(248,81,73,.25)",
                borderRadius: 10,
                padding: "10px 16px",
                marginBottom: 20,
                fontSize: 13,
                color: C.red,
              }}
            >
              {error}
            </div>
          )}

          {/* ── System status banner ─────────────────────────────────── */}
          <div
            style={{
              background: overall
                ? overall === "healthy"
                  ? "rgba(80,232,144,.08)"
                  : overall === "degraded"
                  ? "rgba(245,158,11,.08)"
                  : "rgba(248,81,73,.08)"
                : "rgba(255,255,255,.04)",
              border: `1px solid ${
                overall
                  ? overall === "healthy"
                    ? "rgba(80,232,144,.2)"
                    : overall === "degraded"
                    ? "rgba(245,158,11,.25)"
                    : "rgba(248,81,73,.25)"
                  : C.border
              }`,
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {loading && !data ? (
              <Skeleton w={320} h={14} />
            ) : (
              <>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: overallColor,
                    display: "inline-block",
                    flexShrink: 0,
                    boxShadow: `0 0 0 3px ${overallColor}40`,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: overallColor }}>{overallText}</span>
                {data && (
                  <span style={{ fontSize: 12, color: C.muted }}>
                    — Checked: {formatTime(data.checkedAt)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* ── Route health grid ────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 10 }}>
              Route Groups
            </div>

            {loading && !data ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skeleton w="60%" h={10} />
                    <Skeleton w="40%" h={20} />
                    <Skeleton w="80%" h={10} />
                  </div>
                ))}
              </div>
            ) : data ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {data.routes.map((route) => {
                  const col = statusColor(route.status);
                  return (
                    <div
                      key={route.path}
                      style={{
                        background: C.surface,
                        border: `1px solid ${route.status !== "healthy" ? col + "40" : C.border}`,
                        borderRadius: 12,
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: col,
                            flexShrink: 0,
                            boxShadow: route.status !== "healthy" ? `0 0 0 3px ${col}30` : undefined,
                          }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{route.label}</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: col, textTransform: "uppercase", letterSpacing: ".06em" }}>
                        {statusLabel(route.status)}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{route.notes}</div>
                      <div style={{ fontSize: 10, color: C.muted2, marginTop: 2 }}>
                        Checked {formatTime(route.lastCheck)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* ── Recent Activity pulse ─────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 10 }}>
              Activity Pulse
            </div>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                gap: 32,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {loading && !data ? (
                <>
                  <Skeleton w={120} h={14} />
                  <Skeleton w={120} h={14} />
                </>
              ) : data ? (
                <>
                  <div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: ".06em" }}>Last 1 hour</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.mint }}>{data.activity.sessionsLast1h}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>session results</div>
                  </div>
                  <div style={{ width: 1, height: 48, background: C.border, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: ".06em" }}>Last 24 hours</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.violet }}>{data.activity.sessionsLast24h}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>session results</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 11, color: C.muted2, alignSelf: "flex-end", paddingBottom: 4 }}>
                    from <code style={{ background: "rgba(255,255,255,.07)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>session_results</code>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: C.muted }}>No data available.</div>
              )}
            </div>
          </div>

          {/* ── Open Incidents (from feedback_triage) ─────────────────── */}
          <OpenIncidents />

          {/* ── Runbooks ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 10 }}>
              Runbooks &amp; Remediation
            </div>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {RUNBOOK_LINKS.map((link, i) => (
                <div
                  key={link.label}
                  style={{
                    padding: "13px 18px",
                    borderBottom:
                      i < RUNBOOK_LINKS.length - 1
                        ? "1px solid rgba(255,255,255,.04)"
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                      {link.label}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>{link.desc}</div>
                  </div>
                  <span style={{ fontSize: 11, color: C.muted2, fontStyle: "italic", flexShrink: 0 }}>
                    Runbook: add URL in settings
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer nav ───────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/owner/routes" style={{ fontSize: 13, color: C.mint, textDecoration: "none", fontWeight: 600 }}>
              ← Route Health
            </Link>
            <Link href="/owner/command" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Command Centre</Link>
            <Link href="/owner/kpi" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>KPI Dashboard</Link>
            <Link href="/owner/content-health" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Content Health</Link>
            <Link href="/owner/governance" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Governance</Link>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}

// ── Open Incidents sub-component ──────────────────────────────────────────────
interface IncidentItem {
  id: string;
  category: string;
  urgency: string;
  summary: string;
  createdAt: string;
}

function urgencyColor(u: string) {
  if (u === "critical" || u === "high") return C.red;
  if (u === "medium") return C.amber;
  return C.muted;
}

function OpenIncidents() {
  const [items, setItems] = useState<IncidentItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/owner/feedback?status=open&limit=20")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((body: { items: IncidentItem[] }) => {
        if (!cancelled) {
          // Filter to incident-like items by category
          const incidents = (body.items ?? []).filter(
            (it) =>
              it.category?.toLowerCase().includes("incident") ||
              it.category?.toLowerCase().includes("bug") ||
              it.urgency === "critical" ||
              it.urgency === "high",
          );
          setItems(incidents);
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 10 }}>
        Open Incidents
        {items && items.length > 0 && (
          <span
            style={{
              marginLeft: 8,
              background: C.red,
              color: "#fff",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 900,
              padding: "1px 7px",
              verticalAlign: "middle",
            }}
          >
            {items.length}
          </span>
        )}
      </div>
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton w="80%" h={12} />
            <Skeleton w="60%" h={12} />
          </div>
        ) : items && items.length > 0 ? (
          items.map((item, i) => (
            <div
              key={item.id}
              style={{
                padding: "12px 18px",
                borderBottom:
                  i < items.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: urgencyColor(item.urgency),
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                  {item.summary || "(no summary)"}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  {item.category} · urgency: {item.urgency} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Link
                href={`/owner/feedback`}
                style={{ fontSize: 11, color: C.violet, textDecoration: "none", fontWeight: 600, flexShrink: 0, marginTop: 2 }}
              >
                View →
              </Link>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, lineHeight: 1, color: C.mint }}>&#10003;</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.mint }}>No open incidents</div>
            <div style={{ fontSize: 12, color: C.muted }}>All triage items resolved or no high-urgency feedback.</div>
            <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link
                href="/owner/overview"
                style={{ fontSize: 12, color: C.violet, textDecoration: "none", fontWeight: 600 }}
              >
                System health overview
              </Link>
              <Link
                href="/owner/content-health"
                style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}
              >
                Content health
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
