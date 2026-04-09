"use client";

import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  mint: "#50e890",
  violet: "#9b72ff",
  gold: "#ffd166",
  red: "#f85149",
  amber: "#f59e0b",
  surface: "#161b22",
  surface2: "#0d1117",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  faint: "rgba(255,255,255,0.07)",
} as const;

// ── Static gate data ──────────────────────────────────────────────────────────
const GATE_META = {
  version: "v2.5",
  codename: "Assignment Engine",
  score: 71,
  threshold: 90,
  target: "April 1, 2026",
  lastChecked: "8 minutes ago",
  build: "#247",
  blocked: true,
  blockerCount: 1,
  warningCount: 1,
};

type GateItemStatus = "pass" | "fail" | "warn";

type GateItem = {
  status: GateItemStatus;
  text: string;
  val: string;
};

type GateCategory = {
  icon: string;
  name: string;
  score: string;
  pillStatus: "pass" | "fail" | "warn";
  items: GateItem[];
  blockerMsg?: string;
  warnMsg?: string;
  borderColor?: string;
};

const CATEGORIES: GateCategory[] = [];

type SignoffPerson = {
  initial: string;
  name: string;
  role: string;
  date: string;
  avatarColor: string;
};

const SIGNOFFS: SignoffPerson[] = [];

// ── Sub-functions ─────────────────────────────────────────────────────────────
function pillStyle(status: "pass" | "fail" | "warn"): React.CSSProperties {
  if (status === "pass") {
    return {
      background: "rgba(80,232,144,0.15)",
      color: C.mint,
      fontSize: 10,
      fontWeight: 800,
      padding: "2px 8px",
      borderRadius: 6,
    };
  }
  if (status === "fail") {
    return {
      background: "rgba(248,81,73,0.15)",
      color: C.red,
      fontSize: 10,
      fontWeight: 800,
      padding: "2px 8px",
      borderRadius: 6,
    };
  }
  return {
    background: "rgba(245,158,11,0.15)",
    color: C.amber,
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 6,
  };
}

function itemCheckIcon(status: GateItemStatus): string {
  if (status === "pass") return "✅";
  if (status === "fail") return "❌";
  return "⚠️";
}

function itemValColor(status: GateItemStatus): string {
  if (status === "fail") return C.red;
  if (status === "warn") return C.amber;
  return "rgba(255,255,255,0.4)";
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function OwnerReleaseView() {
  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "28px 24px 60px",
          fontFamily: "system-ui,-apple-system,sans-serif",
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: C.muted,
              marginBottom: 4,
            }}
          >
            Owner
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>
            🚀 Release Gate
          </h1>
        </div>

        {/* Score ring + summary */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: C.surface,
            borderRadius: 14,
            padding: "18px 20px",
            marginBottom: 16,
            border: `1px solid ${GATE_META.blocked ? "rgba(255,255,255,0.05)" : "rgba(80,232,144,0.2)"}`,
            flexWrap: "wrap",
          }}
        >
          {/* Ring */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              flexShrink: 0,
              border: `4px solid ${GATE_META.blocked ? C.amber : C.mint}`,
            }}
          >
            <span
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: GATE_META.blocked ? C.text : C.mint,
                lineHeight: 1,
              }}
            >
              {GATE_META.score}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
              / 100
            </span>
          </div>

          {/* Title + meta */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>
              Release Gate — {GATE_META.version} &quot;{GATE_META.codename}&quot;
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                marginTop: 3,
                lineHeight: 1.4,
              }}
            >
              Target release: {GATE_META.target} · Last checked: {GATE_META.lastChecked} · CI/CD build{" "}
              {GATE_META.build}
            </div>
            <div
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 12px",
                borderRadius: 8,
                marginTop: 6,
                background: GATE_META.blocked
                  ? "rgba(248,81,73,0.15)"
                  : "rgba(80,232,144,0.15)",
                color: GATE_META.blocked ? C.red : C.mint,
                border: GATE_META.blocked
                  ? "1px solid rgba(248,81,73,0.3)"
                  : "1px solid rgba(80,232,144,0.3)",
              }}
            >
              {GATE_META.blocked
                ? `🔒 BLOCKED — ${GATE_META.blockerCount} hard blocker · ${GATE_META.warningCount} warning`
                : "✅ GATE OPEN — Ready to launch"}
            </div>
          </div>

          {/* Score gap */}
          {GATE_META.blocked && (
            <div
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              Score threshold: {GATE_META.threshold}
              <br />
              Current: {GATE_META.score}
              <br />
              Gap: {GATE_META.threshold - GATE_META.score} points
            </div>
          )}
        </div>

        {/* Gate categories */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              style={{
                background: C.surface,
                borderRadius: 12,
                padding: "14px 16px",
                border: `1px solid ${cat.borderColor ?? C.border}`,
              }}
            >
              {/* Category header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: cat.items.length > 0 ? 8 : 0,
                }}
              >
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.text,
                    flex: 1,
                  }}
                >
                  {cat.name}
                </span>
                <span style={pillStyle(cat.pillStatus)}>{cat.score}</span>
              </div>

              {/* Category rows */}
              {cat.items.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {cat.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
                    >
                      <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>
                        {itemCheckIcon(item.status)}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.6)",
                          flex: 1,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.text}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: itemValColor(item.status),
                          flexShrink: 0,
                        }}
                      >
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Blocker card */}
              {cat.blockerMsg && (
                <div
                  style={{
                    background: "rgba(248,81,73,0.07)",
                    border: "1px solid rgba(248,81,73,0.25)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    marginTop: 8,
                    fontSize: 11,
                    color: C.red,
                    lineHeight: 1.4,
                  }}
                >
                  ⛔ {cat.blockerMsg}
                </div>
              )}

              {/* Warning card */}
              {cat.warnMsg && (
                <div
                  style={{
                    background: "rgba(245,158,11,0.07)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    marginTop: 8,
                    fontSize: 11,
                    color: C.amber,
                    lineHeight: 1.4,
                  }}
                >
                  ⚠ {cat.warnMsg}
                </div>
              )}

              {/* Sign-off rows (only for Stakeholder category) */}
              {cat.name === "Stakeholder Sign-off" && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {SIGNOFFS.map((person) => (
                    <div
                      key={person.initial}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: person.avatarColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 900,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {person.initial}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.65)",
                          flex: 1,
                        }}
                      >
                        {person.name} — {person.role}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.mint,
                        }}
                      >
                        ✓ Signed {person.date}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Launch button */}
        <div
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "system-ui,-apple-system,sans-serif",
            textAlign: "center",
            background: GATE_META.blocked ? C.surface : C.mint,
            color: GATE_META.blocked ? "rgba(255,255,255,0.2)" : "#010409",
            border: GATE_META.blocked
              ? "1px solid rgba(255,255,255,0.08)"
              : "none",
            cursor: GATE_META.blocked ? "not-allowed" : "pointer",
          }}
        >
          {GATE_META.blocked
            ? "🚀 Launch v2.5 — Blocked"
            : "🚀 Launch v2.5 — Trigger Production Deployment"}
        </div>

        <div
          style={{
            fontSize: 10,
            color: GATE_META.blocked
              ? "rgba(255,255,255,0.25)"
              : "rgba(80,232,144,0.5)",
            textAlign: "center",
            marginTop: 6,
          }}
        >
          {GATE_META.blocked
            ? "Fix the performance blocker, then re-run gate check. Gate re-checks automatically on next CI/CD build."
            : "Clicking will trigger the CI/CD production pipeline. Confirmation dialog will follow. Rollback available within 15 min."}
        </div>

        {/* Gate category weights info */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            padding: "14px 16px",
            marginTop: 20,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: C.muted,
              marginBottom: 10,
            }}
          >
            Gate Weights
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Quality", pts: 25 },
              { label: "Performance", pts: 25 },
              { label: "Content", pts: 20 },
              { label: "Privacy", pts: 20 },
              { label: "Sign-off", pts: 10 },
            ].map((w) => (
              <div
                key={w.label}
                style={{
                  background: C.surface2,
                  borderRadius: 8,
                  padding: "6px 10px",
                  border: `1px solid ${C.border}`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                  {w.label}
                </div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 800 }}>
                  {w.pts} pts
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              marginTop: 8,
            }}
          >
            Score threshold: {GATE_META.threshold} / 100 — Gate opens only when all blockers cleared and score &gt;= {GATE_META.threshold}.
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/owner"
            style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}
          >
            ← Dashboard
          </Link>
          <Link
            href="/owner/roadmap"
            style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}
          >
            Roadmap
          </Link>
          <Link
            href="/owner/command"
            style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}
          >
            Command
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
