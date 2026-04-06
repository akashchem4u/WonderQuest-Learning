import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Palette ──────────────────────────────────────────────────────────────────
const BASE = "#100b2e";
const MINT = "#50e890";
const VIOLET = "#9b72ff";
const RED = "#f85149";
const AMBER = "#f59e0b";
const SURFACE = "#161b22";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#f0f6ff";
const MUTED = "rgba(255,255,255,0.4)";

// ── Stub data ─────────────────────────────────────────────────────────────────

type RouteStatus = "healthy" | "warn" | "down";

interface RouteRow {
  name: string;
  path: string;
  status: RouteStatus;
  p95: string;
  p95Over: boolean;
  p99: string;
  errorRate: string;
  errorOver: boolean;
  uptime: string;
  uptimeWarn: boolean;
  sparkHeights: number[];
  sparkTone: "good" | "warn" | "over";
}

const ROUTES: RouteRow[] = [
  {
    name: "Play Session",
    path: "/play/session",
    status: "healthy",
    p95: "142ms",
    p95Over: false,
    p99: "188ms",
    errorRate: "0.02%",
    errorOver: false,
    uptime: "99.9%",
    uptimeWarn: false,
    sparkHeights: [14, 18, 12, 16, 20, 14],
    sparkTone: "good",
  },
  {
    name: "Adaptive Engine",
    path: "/api/adaptive/next",
    status: "healthy",
    p95: "178ms",
    p95Over: false,
    p99: "230ms",
    errorRate: "0.01%",
    errorOver: false,
    uptime: "99.8%",
    uptimeWarn: false,
    sparkHeights: [16, 22, 18, 20, 24, 18],
    sparkTone: "good",
  },
  {
    name: "Assignment Engine",
    path: "/api/assignments",
    status: "healthy",
    p95: "165ms",
    p95Over: false,
    p99: "210ms",
    errorRate: "0.03%",
    errorOver: false,
    uptime: "99.9%",
    uptimeWarn: false,
    sparkHeights: [15, 17, 14, 16, 19, 15],
    sparkTone: "good",
  },
  {
    name: "Teacher Dashboard",
    path: "/teacher/dashboard",
    status: "healthy",
    p95: "98ms",
    p95Over: false,
    p99: "145ms",
    errorRate: "0.00%",
    errorOver: false,
    uptime: "100%",
    uptimeWarn: false,
    sparkHeights: [8, 10, 9, 11, 10, 9],
    sparkTone: "good",
  },
  {
    name: "Parent Dashboard",
    path: "/parent/dashboard",
    status: "healthy",
    p95: "88ms",
    p95Over: false,
    p99: "120ms",
    errorRate: "0.00%",
    errorOver: false,
    uptime: "100%",
    uptimeWarn: false,
    sparkHeights: [8, 9, 8, 10, 9, 8],
    sparkTone: "good",
  },
  {
    name: "Auth / SSO",
    path: "/auth/sso",
    status: "healthy",
    p95: "110ms",
    p95Over: false,
    p99: "160ms",
    errorRate: "0.01%",
    errorOver: false,
    uptime: "99.7%",
    uptimeWarn: true,
    sparkHeights: [10, 12, 11, 13, 12, 11],
    sparkTone: "good",
  },
  {
    name: "Content Delivery",
    path: "/api/content",
    status: "healthy",
    p95: "55ms",
    p95Over: false,
    p99: "82ms",
    errorRate: "0.00%",
    errorOver: false,
    uptime: "100%",
    uptimeWarn: false,
    sparkHeights: [5, 7, 6, 7, 6, 5],
    sparkTone: "good",
  },
  {
    name: "Mastery Score",
    path: "/api/mastery",
    status: "healthy",
    p95: "130ms",
    p95Over: false,
    p99: "175ms",
    errorRate: "0.02%",
    errorOver: false,
    uptime: "99.9%",
    uptimeWarn: false,
    sparkHeights: [12, 15, 13, 14, 16, 13],
    sparkTone: "good",
  },
  {
    name: "Notification Delivery",
    path: "/api/notifications",
    status: "healthy",
    p95: "75ms",
    p95Over: false,
    p99: "110ms",
    errorRate: "0.00%",
    errorOver: false,
    uptime: "100%",
    uptimeWarn: false,
    sparkHeights: [7, 8, 7, 9, 8, 7],
    sparkTone: "good",
  },
  {
    name: "Reports / Export",
    path: "/api/reports",
    status: "warn",
    p95: "310ms",
    p95Over: true,
    p99: "420ms",
    errorRate: "0.01%",
    errorOver: false,
    uptime: "99.8%",
    uptimeWarn: false,
    sparkHeights: [22, 25, 20, 28, 24, 26],
    sparkTone: "warn",
  },
];

interface IncidentItem {
  sev: "P0" | "P1";
  title: string;
  meta: string;
}

const INCIDENTS: IncidentItem[] = [
  { sev: "P0", title: "SSO token expiry", meta: "Auth · 3h 18m · Resolved · Mar 24" },
  { sev: "P0", title: "Assignment queue failure", meta: "Assignment · 5h 45m · Resolved · Mar 17" },
  { sev: "P1", title: "Mastery score lag spike", meta: "Mastery · 22h · Resolved · Mar 10" },
  { sev: "P1", title: "Content CDN cache miss spike", meta: "Content · 4h · Resolved · Feb 28" },
];

const UPTIME_30D = [
  { label: "Play Session", val: "99.9%", warn: false },
  { label: "Adaptive Engine", val: "99.8%", warn: false },
  { label: "Assignment", val: "99.9%", warn: false },
  { label: "Auth / SSO", val: "99.7%", warn: true },
  { label: "Content Delivery", val: "100%", warn: false },
  { label: "Notifications", val: "100%", warn: false },
  { label: "Reports", val: "99.8%", warn: false },
];

const LATENCY_SMALL = [
  { name: "Play Session", heights: [14, 18, 12, 16, 20, 14], p95: "142ms", tone: "good" },
  { name: "Adaptive Engine", heights: [16, 22, 18, 20, 24, 18], p95: "178ms", tone: "good" },
  { name: "Assignment", heights: [15, 17, 14, 16, 19, 15], p95: "165ms", tone: "good" },
  { name: "Auth / SSO", heights: [10, 12, 11, 13, 12, 11], p95: "110ms", tone: "good" },
  { name: "Reports", heights: [22, 25, 20, 28, 24, 26], p95: "310ms", tone: "warn" },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusDotColor(s: RouteStatus): string {
  if (s === "healthy") return MINT;
  if (s === "warn") return AMBER;
  return RED;
}

function sevStyle(sev: "P0" | "P1"): React.CSSProperties {
  return sev === "P0"
    ? { background: "rgba(248,81,73,0.2)", color: RED }
    : { background: "rgba(245,158,11,0.15)", color: AMBER };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function OwnerRoutesPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  if (!allowed) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <OwnerGate configured={configured} />
      </AppFrame>
    );
  }

  const healthyCt = ROUTES.filter((r) => r.status === "healthy").length;
  const warnCt = ROUTES.filter((r) => r.status === "warn").length;
  const downCt = ROUTES.filter((r) => r.status === "down").length;
  const totalRoutes = ROUTES.length;

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
        {/* ── Shell header ────────────────────────────────────────────────── */}
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
            <span
              style={{ fontSize: 14, fontWeight: 800, color: TEXT }}
            >
              📡 Route Health
            </span>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Refreshed 45s ago · Auto 60s
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span
              style={{ fontSize: 11, fontWeight: 700, color: MINT, cursor: "pointer" }}
            >
              Re-check now
            </span>
            <span
              style={{ fontSize: 11, fontWeight: 700, color: MINT, cursor: "pointer" }}
            >
              ↓ Export
            </span>
            <span
              style={{ fontSize: 11, fontWeight: 700, color: RED, cursor: "pointer" }}
            >
              + Declare Incident
            </span>
            <Link
              href="/owner"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: VIOLET,
                textDecoration: "none",
              }}
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* ── Status summary header ────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            background: BORDER,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          {(
            [
              {
                dot: MINT,
                value: healthyCt,
                label: "Healthy",
                valueColor: TEXT,
              },
              {
                dot: AMBER,
                value: warnCt,
                label: "Degraded",
                valueColor: warnCt > 0 ? AMBER : "rgba(255,255,255,0.3)",
              },
              {
                dot: RED,
                value: downCt,
                label: "Down",
                valueColor: downCt > 0 ? RED : "rgba(255,255,255,0.3)",
              },
              {
                dot: MINT,
                value: "99.8%",
                label: "30d Uptime",
                valueColor: MINT,
              },
            ] as const
          ).map((cell) => (
            <div
              key={cell.label}
              style={{
                background: "#0d1117",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: cell.dot,
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: cell.valueColor,
                    lineHeight: 1.1,
                  }}
                >
                  {cell.value}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {cell.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Body: main + sidebar ─────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {/* ── Main: route table + latency grid ────────────────────────── */}
          <div
            style={{
              padding: "20px 24px",
              borderRight: `1px solid ${BORDER}`,
            }}
          >
            {/* Route table */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.3)",
                marginBottom: 12,
                paddingBottom: 6,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              All Routes — {totalRoutes} monitored
            </div>

            <table
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  {["", "Route", "p95", "p99", "Error rate", "30d uptime", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "rgba(255,255,255,0.25)",
                          padding: "6px 10px",
                          textAlign: "left",
                          borderBottom: `1px solid ${BORDER}`,
                          ...(i === 0 ? { width: 12 } : {}),
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {ROUTES.map((route) => (
                  <tr
                    key={route.path}
                    style={{
                      background:
                        route.status === "down"
                          ? "rgba(248,81,73,0.04)"
                          : route.status === "warn"
                            ? "rgba(245,158,11,0.03)"
                            : "transparent",
                    }}
                  >
                    <td style={{ padding: "9px 10px", verticalAlign: "middle" }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: statusDotColor(route.status),
                        }}
                      />
                    </td>
                    <td style={{ padding: "9px 10px", verticalAlign: "middle" }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: TEXT,
                        }}
                      >
                        {route.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        {route.path}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 11,
                        verticalAlign: "middle",
                        color: route.p95Over ? RED : "rgba(255,255,255,0.6)",
                        fontWeight: route.p95Over ? 700 : 400,
                      }}
                    >
                      {route.p95}
                    </td>
                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 11,
                        verticalAlign: "middle",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {route.p99}
                    </td>
                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 11,
                        verticalAlign: "middle",
                        color: route.errorOver
                          ? RED
                          : "rgba(255,255,255,0.6)",
                        fontWeight: route.errorOver ? 700 : 400,
                      }}
                    >
                      {route.errorRate}
                    </td>
                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        verticalAlign: "middle",
                        color: route.uptimeWarn ? AMBER : MINT,
                      }}
                    >
                      {route.uptime}
                    </td>
                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.2)",
                        cursor: "pointer",
                        verticalAlign: "middle",
                      }}
                    >
                      ▸
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Latency small multiples */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.3)",
                marginTop: 24,
                marginBottom: 12,
                paddingBottom: 6,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              Latency Trend — p95 · Last 6 checks
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
              }}
            >
              {LATENCY_SMALL.map((route) => {
                const sparkColor =
                  route.tone === "good" ? MINT : route.tone === "warn" ? AMBER : RED;
                const p95Class =
                  route.tone === "good" ? MINT : route.tone === "warn" ? AMBER : RED;
                return (
                  <div
                    key={route.name}
                    style={{
                      background: SURFACE,
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: 6,
                      }}
                    >
                      {route.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-end",
                        height: 28,
                      }}
                    >
                      {route.heights.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: 6,
                            height: h,
                            borderRadius: "1px 1px 0 0",
                            background: sparkColor,
                            opacity: 0.5 + i * 0.03,
                            minHeight: 2,
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        marginTop: 4,
                        color: p95Class,
                      }}
                    >
                      {route.p95}{" "}
                      {route.tone === "good"
                        ? "✓"
                        : route.tone === "warn"
                          ? "⚠"
                          : "✕"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div style={{ padding: "18px 20px" }}>
            {/* Incident log */}
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
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                Incident Log — Last 30 days
              </div>
              {INCIDENTS.map((inc, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 0",
                    borderBottom:
                      i < INCIDENTS.length - 1
                        ? `1px solid rgba(255,255,255,0.04)`
                        : "none",
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
                        ...sevStyle(inc.sev),
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "1px 5px",
                        borderRadius: 3,
                      }}
                    >
                      {inc.sev}
                    </span>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.7)",
                        flex: 1,
                      }}
                    >
                      {inc.title}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    {inc.meta}
                  </div>
                </div>
              ))}
            </div>

            {/* 30-day uptime */}
            <div
              style={{
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
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                30-Day Uptime
              </div>
              {UPTIME_30D.map((row, i) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 0",
                    borderBottom:
                      i < UPTIME_30D.length - 1
                        ? `1px solid rgba(255,255,255,0.04)`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                      flex: 1,
                    }}
                  >
                    {row.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: row.warn ? AMBER : MINT,
                    }}
                  >
                    {row.val}
                  </div>
                </div>
              ))}
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.25)",
                  marginTop: 8,
                  lineHeight: 1.4,
                }}
              >
                SLA threshold: 99.5%. Auth/SSO and Reports are lowest — monitor closely.
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer nav ──────────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: 1100,
            margin: "32px auto 0",
            padding: "16px 28px 0",
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/owner"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: VIOLET,
              textDecoration: "none",
            }}
          >
            ← Dashboard
          </Link>
          <Link
            href="/owner/feedback"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: MUTED,
              textDecoration: "none",
            }}
          >
            Feedback Workbench
          </Link>
          <Link
            href="/owner/release"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: MUTED,
              textDecoration: "none",
            }}
          >
            Release Gate
          </Link>
          <Link
            href="/owner/analytics"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: MUTED,
              textDecoration: "none",
            }}
          >
            Command Center
          </Link>
        </div>
      </main>
    </AppFrame>
  );
}
