import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "./owner-gate";

export const dynamic = "force-dynamic";

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

// ── Stubbed data ──────────────────────────────────────────────────────────────
const STATS = [
  { label: "MAU (30d)", value: "4,820", delta: "+12% WoW", deltaColor: C.mint },
  { label: "MRR", value: "$18.4K", delta: "+$800", deltaColor: C.mint },
  { label: "Active schools", value: "142", delta: "+3 this week", deltaColor: C.mint },
  { label: "Uptime (30d)", value: "99.97%", delta: "SLA met", deltaColor: C.mint },
  { label: "Feedback open", value: "3", delta: "+1 new P1", deltaColor: C.amber },
];

const ROUTE_HEALTH = [
  { name: "Play session", uptime: "100%", p95: "p95 140ms", status: "healthy" as const },
  { name: "Adaptive engine", uptime: "100%", p95: "p95 88ms", status: "healthy" as const },
  { name: "Teacher portal", uptime: "100%", p95: "p95 112ms", status: "healthy" as const },
  { name: "Parent portal", uptime: "99.9%", p95: "p95 95ms", status: "healthy" as const },
  { name: "Auth / onboarding", uptime: "100%", p95: "p95 62ms", status: "healthy" as const },
];

const FEEDBACK_QUEUE = [
  { priority: "P1", priorityColor: C.amber, text: "Mastery bar not updating after session ends (teacher portal)", time: "2h ago" },
  { priority: "P2", priorityColor: "#2563eb", text: "Export PDF feature request — parent-teacher conference use", time: "Mar 18" },
  { priority: "P2", priorityColor: "#2563eb", text: "Ambiguous fractions diagram in P2 question set", time: "Mar 10" },
];

const RELEASE_CHECKS = [
  { label: "Test coverage >= 80%", score: "84%", status: "pass" as const },
  { label: "P0 bugs resolved", score: "0 open", status: "pass" as const },
  { label: "p95 latency <= 200ms", score: "210ms", status: "warn" as const },
  { label: "Stakeholder sign-off", score: "3/3", status: "pass" as const },
];

const SESSION_BARS = [
  { day: "M", value: "3.2K", height: 32, opacity: 0.7 },
  { day: "T", value: "3.5K", height: 36, opacity: 0.7 },
  { day: "W", value: "4.1K", height: 44, opacity: 0.7 },
  { day: "Th", value: "3.8K", height: 40, opacity: 0.7 },
  { day: "F", value: "2.9K", height: 28, opacity: 0.5 },
  { day: "Sa", value: "1.4K", height: 14, opacity: 0.4 },
  { day: "Su", value: "4.8K", height: 52, opacity: 1, today: true },
];

const dotColor = {
  healthy: C.mint,
  degraded: C.amber,
  down: C.red,
};

const checkDot = {
  pass: C.mint,
  warn: C.amber,
  fail: C.red,
};

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const SB_OPS = [
  { icon: "🏠", label: "Home", href: "/owner", active: true },
  { icon: "📡", label: "Route Health", href: "/owner/routes", badge: null },
  { icon: "🚀", label: "Release Gate", href: "/owner/release", badge: null },
  { icon: "💬", label: "Feedback", href: "/owner/feedback", badge: "3", badgeColor: C.amber },
];
const SB_ANALYTICS = [
  { icon: "📊", label: "Command Center", href: "/owner/analytics", badge: null },
  { icon: "👥", label: "Users", href: "/owner/users", badge: null },
  { icon: "🏫", label: "Schools", href: "/owner/schools", badge: null },
];
const SB_PRODUCT = [
  { icon: "🧪", label: "Experiments", href: "/owner/experiments", badge: null },
  { icon: "📋", label: "Content", href: "/owner/content", badge: null },
];

export default async function OwnerPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  if (!allowed) {
    return <OwnerGate configured={configured} />;
  }

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
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.mint, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: C.muted }}>All systems healthy</span>
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
                Good morning, Avi 👋
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                Sunday, April 6 · All systems healthy · Last updated 60s ago
              </div>
            </div>

            {/* Stat row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: "8px",
              }}
            >
              {STATS.map((stat) => (
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

              {/* Route health */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "10px" }}>
                  📡 Route Health
                </div>
                {ROUTE_HEALTH.map((route) => (
                  <div
                    key={route.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "5px 0",
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: dotColor[route.status],
                      }}
                    />
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", flex: 1 }}>{route.name}</div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{route.uptime}</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginLeft: "6px" }}>{route.p95}</div>
                  </div>
                ))}
                <div style={{ marginTop: "8px" }}>
                  <Link href="/owner/routes" style={{ fontSize: "10px", color: C.mint, fontWeight: 700, textDecoration: "none" }}>
                    Full route health →
                  </Link>
                </div>
              </div>

              {/* Feedback queue */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "10px" }}>
                  💬 Feedback Queue
                </div>
                {FEEDBACK_QUEUE.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      padding: "7px 0",
                      borderBottom: i < FEEDBACK_QUEUE.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        flexShrink: 0,
                        marginTop: "1px",
                        background: item.priorityColor,
                        color: item.priorityColor === C.amber ? "#1a1440" : "#fff",
                      }}
                    >
                      {item.priority}
                    </span>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 1.4 }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                      {item.time}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: "8px" }}>
                  <Link href="/owner/feedback" style={{ fontSize: "10px", color: C.mint, fontWeight: 700, textDecoration: "none" }}>
                    Open workbench →
                  </Link>
                </div>
              </div>

              {/* Release gate */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "10px" }}>
                  🚀 Release Gate — v2.5
                </div>
                {RELEASE_CHECKS.map((check) => (
                  <div
                    key={check.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "5px 0",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: checkDot[check.status],
                      }}
                    />
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", flex: 1 }}>{check.label}</div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{check.score}</div>
                  </div>
                ))}
                <div style={{ marginTop: "8px", fontSize: "11px", color: C.amber, fontWeight: 700 }}>
                  1 blocker — latency threshold exceeded. Gate: blocked.
                </div>
                <div style={{ marginTop: "6px" }}>
                  <Link href="/owner/release" style={{ fontSize: "10px", color: C.mint, fontWeight: 700, textDecoration: "none" }}>
                    View release gate →
                  </Link>
                </div>
              </div>

              {/* Daily active sessions chart */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: "10px" }}>
                  📈 Daily Active Sessions — Last 7 Days
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", marginBottom: "6px" }}>
                  {SESSION_BARS.map((bar) => (
                    <div
                      key={bar.day}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}
                    >
                      <div style={{ fontSize: "9px", color: bar.today ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)", fontWeight: bar.today ? 700 : 400 }}>
                        {bar.value}
                      </div>
                      <div
                        style={{
                          width: "20px",
                          height: `${bar.height}px`,
                          background: C.mint,
                          borderRadius: "3px 3px 0 0",
                          opacity: bar.opacity,
                        }}
                      />
                      <div style={{ fontSize: "9px", color: bar.today ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)", fontWeight: bar.today ? 700 : 400 }}>
                        {bar.day}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>
                  Today: 4,820 active users (MAU rolling 30d)
                </div>
              </div>
            </div>

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
