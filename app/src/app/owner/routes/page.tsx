import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Static mock data ────────────────────────────────────────────────────────
// In a real deployment these would come from infrastructure monitoring (Datadog/
// Grafana equivalent). Thresholds: p95 < 200ms, p99 < 500ms, uptime >= 99.5%.

const ROUTES = [
  {
    key: "child",
    name: "Child Portal",
    path: "/child",
    status: "healthy" as const,
    userCount: 42,
    p95: "88ms",
    p99: "120ms",
    errorRate: "0.00%",
    uptime: "100%",
    uptimeTone: "good" as const,
    lastDeploy: "2h ago",
    sparkHeights: [10, 14, 12, 16, 13, 11],
    sparkTone: "good" as const,
    keyMetric: "Avg. session 8.4 min",
    incidents: [] as string[],
  },
  {
    key: "parent",
    name: "Parent Hub",
    path: "/parent",
    status: "healthy" as const,
    userCount: 18,
    p95: "95ms",
    p99: "138ms",
    errorRate: "0.01%",
    uptime: "99.9%",
    uptimeTone: "good" as const,
    lastDeploy: "2h ago",
    sparkHeights: [9, 11, 10, 12, 11, 10],
    sparkTone: "good" as const,
    keyMetric: "3 households active today",
    incidents: [] as string[],
  },
  {
    key: "teacher",
    name: "Teacher Dashboard",
    path: "/teacher",
    status: "healthy" as const,
    userCount: 6,
    p95: "98ms",
    p99: "145ms",
    errorRate: "0.00%",
    uptime: "100%",
    uptimeTone: "good" as const,
    lastDeploy: "2h ago",
    sparkHeights: [8, 10, 9, 11, 10, 9],
    sparkTone: "good" as const,
    keyMetric: "Class view healthy",
    incidents: [] as string[],
  },
  {
    key: "owner",
    name: "Owner Console",
    path: "/owner",
    status: "healthy" as const,
    userCount: 1,
    p95: "72ms",
    p99: "105ms",
    errorRate: "0.00%",
    uptime: "100%",
    uptimeTone: "good" as const,
    lastDeploy: "2h ago",
    sparkHeights: [6, 8, 7, 9, 8, 7],
    sparkTone: "good" as const,
    keyMetric: "Auth gate active",
    incidents: [] as string[],
  },
  {
    key: "play",
    name: "Play Session",
    path: "/play",
    status: "watch" as const,
    userCount: 31,
    p95: "218ms",
    p99: "310ms",
    errorRate: "0.08%",
    uptime: "99.6%",
    uptimeTone: "warn" as const,
    lastDeploy: "4h ago",
    sparkHeights: [18, 22, 20, 25, 28, 24],
    sparkTone: "warn" as const,
    keyMetric: "p95 above 200ms threshold",
    incidents: ["Latency spike · 35 min · Apr 3"],
  },
] as const;

const STAT_TILES = [
  {
    label: "Routes Live",
    value: ROUTES.length.toString(),
    sub: "5 monitored",
    color: "#58e8c1",
    dot: "green",
  },
  {
    label: "Active Users",
    value: ROUTES.reduce((s, r) => s + r.userCount, 0).toString(),
    sub: "across all routes",
    color: "#9b72ff",
    dot: "green",
  },
  {
    label: "p50 Latency",
    value: "62ms",
    sub: "median across routes",
    color: "#ffd166",
    dot: "green",
  },
  {
    label: "Error Rate",
    value: "0.02%",
    sub: "global avg",
    color: "#58e8c1",
    dot: "green",
  },
] as const;

const DEPLOY_LOG = [
  {
    ts: "2026-04-05 14:22",
    route: "All routes",
    version: "v1.14.3",
    author: "ci-bot",
    status: "success",
    duration: "3m 41s",
  },
  {
    ts: "2026-04-05 10:08",
    route: "/play",
    version: "v1.14.2-hotfix",
    author: "eng",
    status: "success",
    duration: "1m 12s",
  },
  {
    ts: "2026-04-04 18:55",
    route: "All routes",
    version: "v1.14.1",
    author: "ci-bot",
    status: "success",
    duration: "3m 58s",
  },
  {
    ts: "2026-04-04 09:10",
    route: "/child",
    version: "v1.14.0-patch",
    author: "eng",
    status: "success",
    duration: "48s",
  },
  {
    ts: "2026-04-03 22:30",
    route: "All routes",
    version: "v1.14.0",
    author: "ci-bot",
    status: "partial",
    duration: "4m 02s",
  },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: "healthy" | "watch" | "down" }) {
  const color =
    status === "healthy" ? "#58e8c1" : status === "watch" ? "#ffd166" : "#ff7b6b";
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}88`,
      }}
    />
  );
}

function Sparkline({
  heights,
  tone,
}: {
  heights: readonly number[];
  tone: "good" | "warn" | "alert";
}) {
  const color =
    tone === "good" ? "#58e8c1" : tone === "warn" ? "#ffd166" : "#ff7b6b";
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        alignItems: "flex-end",
        height: 28,
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: h,
            borderRadius: "1px 1px 0 0",
            background: color,
            opacity: 0.55 + i * 0.02,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function OwnerRoutesPage() {
  const configured = isOwnerAccessConfigured();
  const unlocked = await hasOwnerAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Operations</span>
              <h1>Sign in to the owner console.</h1>
              <small>Route Health is a protected view. Sign in with an existing owner code.</small>
            </div>
          </section>
          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Owner"
            title="Existing owner sign-in"
          >
            <OwnerGate configured={configured} />
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  const healthyCt = ROUTES.filter((r) => (r.status as string) === "healthy").length;
  const watchCt = ROUTES.filter((r) => (r.status as string) === "watch").length;
  const downCt = ROUTES.filter((r) => (r.status as string) === "down").length;

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          padding: "0 0 48px",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(10,7,26,0.97)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "0 32px",
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link
              href="/owner"
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#9b72ff",
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              ← Owner Console
            </Link>
            <span
              style={{
                width: 1,
                height: 16,
                background: "rgba(255,255,255,0.12)",
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.05em",
              }}
            >
              Refreshed just now · Auto 60s
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#58e8c1",
                cursor: "default",
              }}
            >
              Re-check now
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                cursor: "default",
              }}
            >
              ↓ Export
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 0" }}>
          {/* ── Hero copy ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#9b72ff",
                display: "block",
                marginBottom: 6,
              }}
            >
              ROUTE HEALTH
            </span>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
                fontWeight: 900,
                color: "#f0f6ff",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Live status across all routes
            </h1>
            <p
              style={{
                fontSize: "0.88rem",
                color: "rgba(189,204,221,0.6)",
                marginTop: 6,
              }}
            >
              p95/p99 thresholds: 200ms / 500ms · Uptime SLA: 99.5% · 5 routes monitored
            </p>
          </div>

          {/* ── 4 stat tiles ──────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 28,
            }}
          >
            {STAT_TILES.map((tile) => (
              <div
                key={tile.label}
                style={{
                  background: "#0d1020",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <StatusDot
                  status={
                    tile.dot === "green"
                      ? "healthy"
                      : tile.dot === "amber"
                        ? "watch"
                        : "down"
                  }
                />
                <div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      color: tile.color,
                      lineHeight: 1,
                    }}
                  >
                    {tile.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "rgba(255,255,255,0.3)",
                      marginTop: 2,
                    }}
                  >
                    {tile.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(189,204,221,0.55)",
                      marginTop: 1,
                    }}
                  >
                    {tile.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Status summary chips ───────────────────────────────────── */}
          <div
            style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "rgba(88,232,193,0.12)",
                color: "#58e8c1",
                border: "1px solid rgba(88,232,193,0.2)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#58e8c1",
                }}
              />
              {healthyCt} Healthy
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background:
                  watchCt > 0
                    ? "rgba(255,209,102,0.12)"
                    : "rgba(255,255,255,0.05)",
                color: watchCt > 0 ? "#ffd166" : "rgba(255,255,255,0.3)",
                border: `1px solid ${watchCt > 0 ? "rgba(255,209,102,0.22)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: watchCt > 0 ? "#ffd166" : "rgba(255,255,255,0.2)",
                }}
              />
              {watchCt} Watch
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background:
                  downCt > 0
                    ? "rgba(255,123,107,0.12)"
                    : "rgba(255,255,255,0.05)",
                color: downCt > 0 ? "#ff7b6b" : "rgba(255,255,255,0.3)",
                border: `1px solid ${downCt > 0 ? "rgba(255,123,107,0.22)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: downCt > 0 ? "#ff7b6b" : "rgba(255,255,255,0.2)",
                }}
              />
              {downCt} Down
            </span>
          </div>

          {/* ── Main body: route cards + sidebar ──────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* ── LEFT: per-route cards ─────────────────────────────── */}
            <div style={{ display: "grid", gap: 14 }}>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.3)",
                  paddingBottom: 8,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                All Routes — {ROUTES.length} monitored
              </div>

              {ROUTES.map((route) => {
                const statusColor =
                  route.status === "healthy"
                    ? "#58e8c1"
                    : route.status === "watch"
                      ? "#ffd166"
                      : "#ff7b6b";
                const cardBorder =
                  route.status === "healthy"
                    ? "rgba(88,232,193,0.1)"
                    : route.status === "watch"
                      ? "rgba(255,209,102,0.15)"
                      : "rgba(255,123,107,0.2)";
                const cardBg =
                  route.status === "healthy"
                    ? "rgba(13,16,32,0.95)"
                    : route.status === "watch"
                      ? "rgba(20,16,10,0.95)"
                      : "rgba(22,10,10,0.95)";

                return (
                  <article
                    key={route.key}
                    style={{
                      background: cardBg,
                      border: `1px solid ${cardBorder}`,
                      borderRadius: 14,
                      padding: "18px 20px",
                    }}
                  >
                    {/* Card top row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 10 }}
                      >
                        <StatusDot status={route.status} />
                        <div>
                          <div
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 800,
                              color: "#f0f6ff",
                              lineHeight: 1.2,
                            }}
                          >
                            {route.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "rgba(255,255,255,0.3)",
                              marginTop: 1,
                              fontFamily: "monospace",
                            }}
                          >
                            {route.path}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            padding: "3px 10px",
                            borderRadius: 999,
                            background: `${statusColor}18`,
                            color: statusColor,
                            border: `1px solid ${statusColor}30`,
                          }}
                        >
                          {route.status === "healthy"
                            ? "Live"
                            : route.status === "watch"
                              ? "Watch"
                              : "Down"}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "rgba(255,255,255,0.28)",
                          }}
                        >
                          {route.userCount} users
                        </span>
                      </div>
                    </div>

                    {/* Metrics + sparkline row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                        gap: 12,
                        alignItems: "end",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: "rgba(255,255,255,0.28)",
                            marginBottom: 2,
                          }}
                        >
                          p95
                        </div>
                        <div
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color:
                              route.p95.replace("ms", "") > "200"
                                ? "#ffd166"
                                : "rgba(189,204,221,0.8)",
                          }}
                        >
                          {route.p95}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: "rgba(255,255,255,0.28)",
                            marginBottom: 2,
                          }}
                        >
                          p99
                        </div>
                        <div
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: "rgba(189,204,221,0.8)",
                          }}
                        >
                          {route.p99}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: "rgba(255,255,255,0.28)",
                            marginBottom: 2,
                          }}
                        >
                          Error rate
                        </div>
                        <div
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color:
                              parseFloat(route.errorRate) > 0.05
                                ? "#ff7b6b"
                                : "rgba(189,204,221,0.8)",
                          }}
                        >
                          {route.errorRate}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: "rgba(255,255,255,0.28)",
                            marginBottom: 2,
                          }}
                        >
                          30d uptime
                        </div>
                        <div
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color:
                              route.uptimeTone === "good"
                                ? "#58e8c1"
                                : "#ffd166",
                          }}
                        >
                          {route.uptime}
                        </div>
                      </div>
                      <Sparkline
                        heights={route.sparkHeights}
                        tone={route.sparkTone}
                      />
                    </div>

                    {/* Key metric + last deploy + incidents */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                        paddingTop: 10,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "rgba(189,204,221,0.6)",
                        }}
                      >
                        {route.keyMetric}
                      </span>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 10 }}
                      >
                        {route.incidents.length > 0 &&
                          route.incidents.map((inc) => (
                            <span
                              key={inc}
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                color: "#ff7b6b",
                                background: "rgba(255,123,107,0.1)",
                                padding: "2px 8px",
                                borderRadius: 4,
                                border: "1px solid rgba(255,123,107,0.2)",
                              }}
                            >
                              {inc}
                            </span>
                          ))}
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "rgba(255,255,255,0.25)",
                          }}
                        >
                          Deployed {route.lastDeploy}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ── RIGHT sidebar ────────────────────────────────────────── */}
            <div style={{ display: "grid", gap: 16 }}>
              {/* Incident log */}
              <div
                style={{
                  background: "#161b22",
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 12,
                  }}
                >
                  Incident Log — Last 30 days
                </div>
                {[
                  {
                    sev: "P1",
                    sevTone: "warn",
                    title: "Play latency spike",
                    meta: "Play · 35m · Resolved · Apr 3",
                  },
                  {
                    sev: "P1",
                    sevTone: "warn",
                    title: "Auth token refresh delay",
                    meta: "Owner · 12m · Resolved · Mar 28",
                  },
                  {
                    sev: "P2",
                    sevTone: "info",
                    title: "Parent hub 503 blip",
                    meta: "Parent · 4m · Resolved · Mar 20",
                  },
                  {
                    sev: "P2",
                    sevTone: "info",
                    title: "Child portal asset miss",
                    meta: "Child · 8m · Resolved · Mar 12",
                  },
                ].map((inc) => (
                  <div
                    key={inc.title}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 3,
                          background:
                            inc.sevTone === "warn"
                              ? "rgba(255,209,102,0.15)"
                              : "rgba(155,114,255,0.15)",
                          color:
                            inc.sevTone === "warn" ? "#ffd166" : "#9b72ff",
                        }}
                      >
                        {inc.sev}
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.7)",
                          flex: 1,
                        }}
                      >
                        {inc.title}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {inc.meta}
                    </div>
                  </div>
                ))}
              </div>

              {/* 30-day uptime list */}
              <div
                style={{
                  background: "#161b22",
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 12,
                  }}
                >
                  30-Day Uptime
                </div>
                {ROUTES.map((r) => (
                  <div
                    key={r.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "5px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "rgba(255,255,255,0.5)",
                        flex: 1,
                      }}
                    >
                      {r.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color:
                          r.uptimeTone === "good" ? "#58e8c1" : "#ffd166",
                      }}
                    >
                      {r.uptime}
                    </span>
                  </div>
                ))}
                <p
                  style={{
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.22)",
                    marginTop: 10,
                    lineHeight: 1.5,
                  }}
                >
                  SLA threshold: 99.5%. /play is lowest — monitor closely.
                </p>
              </div>

              {/* Quick nav */}
              <div
                style={{
                  background: "#161b22",
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 12,
                  }}
                >
                  Jump to route
                </div>
                {ROUTES.map((r) => (
                  <Link
                    key={r.key}
                    href={r.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "rgba(189,204,221,0.72)",
                      }}
                    >
                      {r.path}
                    </span>
                    <StatusDot status={r.status} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Deploy log table ─────────────────────────────────────────── */}
          <div style={{ marginTop: 32 }}>
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.3)",
                paddingBottom: 8,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 4,
              }}
            >
              Recent Deploy Log
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  {["Timestamp", "Route", "Version", "Author", "Status", "Duration"].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "rgba(255,255,255,0.25)",
                          padding: "8px 12px",
                          textAlign: "left",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {DEPLOY_LOG.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      background:
                        idx % 2 === 0
                          ? "rgba(255,255,255,0.015)"
                          : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "9px 12px",
                        fontSize: "0.75rem",
                        color: "rgba(189,204,221,0.55)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontFamily: "monospace",
                      }}
                    >
                      {row.ts}
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#f0f6ff",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontFamily: "monospace",
                      }}
                    >
                      {row.route}
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        fontSize: "0.75rem",
                        color: "#9b72ff",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontFamily: "monospace",
                      }}
                    >
                      {row.version}
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        fontSize: "0.75rem",
                        color: "rgba(189,204,221,0.55)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {row.author}
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: 4,
                          background:
                            row.status === "success"
                              ? "rgba(88,232,193,0.12)"
                              : "rgba(255,209,102,0.12)",
                          color:
                            row.status === "success" ? "#58e8c1" : "#ffd166",
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        fontSize: "0.75rem",
                        color: "rgba(189,204,221,0.55)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontFamily: "monospace",
                      }}
                    >
                      {row.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Footer nav ──────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 40,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Link
              href="/owner"
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#9b72ff",
                textDecoration: "none",
              }}
            >
              ← Owner Console
            </Link>
            <Link
              href="/child"
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "rgba(189,204,221,0.5)",
                textDecoration: "none",
              }}
            >
              Child Portal
            </Link>
            <Link
              href="/parent"
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "rgba(189,204,221,0.5)",
                textDecoration: "none",
              }}
            >
              Parent Hub
            </Link>
            <Link
              href="/teacher"
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "rgba(189,204,221,0.5)",
                textDecoration: "none",
              }}
            >
              Teacher Dashboard
            </Link>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
