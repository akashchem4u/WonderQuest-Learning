"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "../owner-gate";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surface2: "#0d1117",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  faint: "rgba(255,255,255,0.07)",
  mint: "#50e890",
  amber: "#f59e0b",
  red: "#f85149",
  violet: "#9b72ff",
  blue: "#38bdf8",
  gold: "#ffd166",
} as const;

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
interface Overview { counts: OverviewCounts }

// ── Types ──────────────────────────────────────────────────────────────────
type CheckStatus = "pass" | "fail" | "warn";

type CheckItem = {
  status: CheckStatus;
  title: string;
  detail: string;
};

type Category = {
  icon: string;
  name: string;
  score: number;
  max: number;
  barColor: string;
  status: CheckStatus;
  note: string;
};

type School = {
  name: string;
  band: string;
  bandColor: string;
  dotClass: "green" | "amber" | "red";
  statusLabel: string;
  statusClass: "ready" | "limited" | "blocked";
};

type Signoff = {
  icon: string;
  name: string;
  role: string;
  done: boolean;
};

// ── Stub data (Not-Ready state: score 74) ──────────────────────────────────
const BETA_META = {
  version: 'v2.6 "Band Expansion"',
  score: 74,
  threshold: 80,
  releaseThreshold: 90,
  pilotCount: 4,
  blockerCount: 2,
  ready: false,
} as const;

const CATEGORIES: Category[] = [
  {
    icon: "🧪",
    name: "Quality",
    score: 20,
    max: 25,
    barColor: C.mint,
    status: "warn",
    note: "1 blocker: crash on empty state",
  },
  {
    icon: "⚡",
    name: "Performance",
    score: 22,
    max: 25,
    barColor: C.mint,
    status: "pass",
    note: "✓ p95 < 180ms",
  },
  {
    icon: "📚",
    name: "Content",
    score: 13,
    max: 20,
    barColor: C.amber,
    status: "warn",
    note: "1 blocker: 7 skills under review",
  },
  {
    icon: "🔒",
    name: "Privacy",
    score: 19,
    max: 20,
    barColor: C.mint,
    status: "pass",
    note: "✓ FERPA/COPPA clear",
  },
  {
    icon: "✍️",
    name: "Sign-off",
    score: 0,
    max: 10,
    barColor: C.red,
    status: "fail",
    note: "0/3 approvals",
  },
];

const CHECKLIST: CheckItem[] = [
  {
    status: "fail",
    title: "Bulk assignment — empty state crash (P1)",
    detail:
      "Crash when teacher has zero existing assignments. Repro rate 100%. Fix in progress — ETA Apr 17.",
  },
  {
    status: "fail",
    title: "G4–5 content — 7 skills still under curriculum review",
    detail:
      "Skills will be locked (delivery_locked=true) during beta. Beta schools on P3 band will have reduced skill pool. Curriculum review ETA Apr 18.",
  },
  {
    status: "warn",
    title: "Parent PDF export — rendering gap on iOS Safari",
    detail:
      "PDF renders correctly on Chrome/desktop. iOS Safari shows clipped footer. Workaround: browser download instead of in-app. Tagged as known issue for beta notes.",
  },
  {
    status: "pass",
    title: "Performance: p95 < 200ms on all routes",
    detail:
      "Bulk assignment route p95 = 178ms on staging (load test: 200 concurrent). Assignment engine p95 = 142ms.",
  },
  {
    status: "pass",
    title: "Privacy review: no new PII fields in beta features",
    detail:
      "Bulk assignment and parent PDF export reviewed. No new PII collected. FERPA covered entity check passed.",
  },
  {
    status: "pass",
    title: "Beta school DPAs signed — 3 of 4 schools",
    detail:
      "Cedar Valley, Riverside, Maplewood signed. Lincoln Elementary DPA pending legal review (expected Apr 16).",
  },
];

const SCHOOLS: School[] = [
  { name: "Cedar Valley Prep", band: "P1–P2", bandColor: "#9b72ff", dotClass: "green", statusLabel: "Ready", statusClass: "ready" },
  { name: "Riverside Elementary", band: "P2", bandColor: "#2dd4bf", dotClass: "green", statusLabel: "Ready", statusClass: "ready" },
  { name: "Maplewood Academy", band: "P3", bandColor: "#f87171", dotClass: "amber", statusLabel: "Limited (P3 skills locked)", statusClass: "limited" },
  { name: "Lincoln Elementary", band: "P0–P1", bandColor: C.gold, dotClass: "red", statusLabel: "DPA pending", statusClass: "blocked" },
];

const SIGNOFFS: Signoff[] = [
  { icon: "👤", name: "Owner", role: "Final beta approval", done: false },
  { icon: "⚙️", name: "Eng Lead", role: "Technical sign-off", done: false },
  { icon: "📚", name: "Curriculum Lead", role: "Content sign-off", done: false },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function checkIcon(status: CheckStatus) {
  if (status === "pass") return { label: "✓", bg: "rgba(80,232,144,0.15)", color: C.mint };
  if (status === "fail") return { label: "✕", bg: "rgba(248,81,73,0.15)", color: C.red };
  return { label: "~", bg: "rgba(245,158,11,0.12)", color: C.amber };
}

function dotColor(cls: School["dotClass"]) {
  if (cls === "green") return C.mint;
  if (cls === "amber") return C.amber;
  return C.red;
}

function statusPill(cls: School["statusClass"]): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 4,
  };
  if (cls === "ready") return { ...base, background: "rgba(80,232,144,0.12)", color: C.mint };
  if (cls === "limited") return { ...base, background: "rgba(245,158,11,0.1)", color: C.amber };
  return { ...base, background: "rgba(248,81,73,0.1)", color: C.red };
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function OwnerBetaPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingOverview(false), 8000);
    fetch("/api/owner/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { clearTimeout(timer); if (data) setOverview(data as Overview); })
      .catch(() => { clearTimeout(timer); })
      .finally(() => setLoadingOverview(false));
  }, []);

  const ringCircumference = 2 * Math.PI * 40; // r=40 → ~251.3
  const ringOffset = ringCircumference * (1 - BETA_META.score / 100);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui,-apple-system,sans-serif",
          paddingBottom: 60,
        }}
      >
        {false ? (
          <div style={{ padding: "48px 24px" }}>
            <OwnerGate configured={true} />
          </div>
        ) : (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

            {/* ── Page header ── */}
            <div style={{ marginBottom: 6 }}>
              <Link
                href="/owner"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.muted,
                  textDecoration: "none",
                  marginBottom: 12,
                  letterSpacing: "0.04em",
                }}
              >
                &#8592; Owner Console
              </Link>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: C.muted,
                  marginBottom: 4,
                }}
              >
                Owner
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: C.text,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                🧪 Beta Readiness
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: BETA_META.ready
                      ? "rgba(80,232,144,0.15)"
                      : "rgba(245,158,11,0.15)",
                    color: BETA_META.ready ? C.mint : C.amber,
                    border: BETA_META.ready
                      ? "1px solid rgba(80,232,144,0.3)"
                      : "1px solid rgba(245,158,11,0.3)",
                  }}
                >
                  {BETA_META.ready ? "Ready for Beta" : "Not Ready"}
                </span>
              </h1>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
                {BETA_META.version} · Staged beta · {BETA_META.pilotCount} pilot schools
                {!loadingOverview && overview && (
                  <span style={{ marginLeft: 12, color: C.mint, fontWeight: 700 }}>
                    · {overview.counts.students.toLocaleString()} students · {overview.counts.sessions.toLocaleString()} sessions
                  </span>
                )}
                {loadingOverview && (
                  <span style={{ marginLeft: 12, color: C.muted }}>· loading…</span>
                )}
              </p>
            </div>

            {/* ── Shell card ── */}
            <div
              style={{
                background: C.surface2,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
                marginTop: 20,
              }}
            >

              {/* Shell header */}
              <div
                style={{
                  background: "#010409",
                  padding: "0 24px",
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                    🧪 Beta Readiness — {BETA_META.version}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    Staged beta · {BETA_META.pilotCount} pilot schools
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: BETA_META.ready ? C.mint : C.amber,
                    }}
                  />
                  <span style={{ color: BETA_META.ready ? C.mint : C.amber }}>
                    {BETA_META.ready ? "Ready for Beta" : "Not Ready"}
                  </span>
                </div>
              </div>

              {/* ── Hero readiness section ── */}
              <div
                style={{
                  padding: 24,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "grid",
                  gridTemplateColumns: "1fr 200px",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: 10,
                    }}
                  >
                    Beta Readiness Score
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: 52,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: C.text,
                      }}
                    >
                      {BETA_META.score}
                    </span>
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.3)",
                        alignSelf: "flex-end",
                        marginBottom: 4,
                      }}
                    >
                      / 100
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.amber,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    ⚠️ Below beta threshold (80). {BETA_META.blockerCount} blockers outstanding.
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      height: 8,
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 4,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${BETA_META.score}%`,
                        borderRadius: 4,
                        background: "linear-gradient(90deg, #f59e0b, #ffd166)",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    Beta threshold: {BETA_META.threshold} · Full release threshold: {BETA_META.releaseThreshold}
                  </div>
                </div>

                {/* SVG ring */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.07)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={C.amber}
                      strokeWidth="10"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="55"
                      textAnchor="middle"
                      fill={C.text}
                      fontSize="20"
                      fontWeight="800"
                      fontFamily="system-ui"
                    >
                      {BETA_META.score}
                    </text>
                  </svg>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    6 points to beta
                  </div>
                </div>
              </div>

              {/* ── Category scores row ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5,1fr)",
                  gap: 1,
                  background: "rgba(255,255,255,0.04)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {CATEGORIES.map((cat) => (
                  <div key={cat.name} style={{ background: "#010409", padding: "14px 16px" }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{cat.icon}</div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 6,
                      }}
                    >
                      {cat.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{cat.score}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>/{cat.max}</span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "rgba(255,255,255,0.07)",
                        borderRadius: 2,
                        marginTop: 6,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 2,
                          background: cat.barColor,
                          width: `${Math.round((cat.score / cat.max) * 100)}%`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        marginTop: 4,
                        fontWeight: 700,
                        color:
                          cat.status === "pass"
                            ? C.mint
                            : cat.status === "fail"
                            ? C.red
                            : C.amber,
                      }}
                    >
                      {cat.note}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Detail + sidebar grid ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 320px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Main checklist */}
                <div
                  style={{
                    padding: "20px 24px",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.25)",
                      marginBottom: 12,
                      paddingBottom: 6,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    Beta Readiness Checklist
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {CHECKLIST.map((item, i) => {
                      const icon = checkIcon(item.status);
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 7,
                            background: "rgba(255,255,255,0.02)",
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              flexShrink: 0,
                              marginTop: 1,
                              background: icon.bg,
                              color: icon.color,
                            }}
                          >
                            {icon.label}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.4)",
                                marginTop: 2,
                                lineHeight: 1.4,
                              }}
                            >
                              {item.detail}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar */}
                <div style={{ padding: "20px 24px" }}>
                  {/* Beta schools */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.25)",
                      marginBottom: 12,
                      paddingBottom: 6,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    Beta Pilot Schools
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                    {SCHOOLS.map((school) => (
                      <div
                        key={school.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 10px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 7,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: dotColor(school.dotClass),
                          }}
                        />
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.text, flex: 1 }}>
                          {school.name}
                        </div>
                        <div style={{ fontSize: 9, color: school.bandColor, marginRight: 4 }}>
                          {school.band}
                        </div>
                        <span style={statusPill(school.statusClass)}>{school.statusLabel}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sign-off */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.25)",
                      marginBottom: 12,
                      paddingBottom: 6,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    Sign-off Required
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {SIGNOFFS.map((so) => (
                      <div key={so.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "#161b22",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {so.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{so.name}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{so.role}</div>
                        </div>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: so.done ? "rgba(80,232,144,0.12)" : "rgba(245,158,11,0.1)",
                            color: so.done ? C.mint : C.amber,
                          }}
                        >
                          {so.done ? "Done" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Launch block ── */}
              <div
                style={{
                  padding: "16px 24px",
                  background: "#010409",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    Launch beta for {BETA_META.pilotCount} pilot schools → sets beta_flag=true, enables new features behind feature flag
                    {!loadingOverview && overview && (
                      <span style={{ marginLeft: 8, color: C.mint }}>
                        · {overview.counts.students.toLocaleString()} students · {overview.counts.sessions.toLocaleString()} sessions live
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginTop: 4 }}>
                    ⚠️ Score {BETA_META.score} / {BETA_META.threshold} minimum required · {BETA_META.blockerCount} blockers must be resolved first
                  </div>
                </div>
                <button
                  disabled
                  style={{
                    background: C.mint,
                    color: "#0d1117",
                    fontSize: 13,
                    fontWeight: 800,
                    padding: "10px 24px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "not-allowed",
                    fontFamily: "system-ui",
                    opacity: 0.4,
                  }}
                >
                  🚀 Launch Beta
                </button>
              </div>
            </div>

            {/* ── Context note ── */}
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "rgba(56,189,248,0.06)",
                border: "1px solid rgba(56,189,248,0.15)",
                borderRadius: 10,
                fontSize: 12,
                color: C.muted,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: C.blue, fontWeight: 700 }}>Beta vs Release Gate:</strong>{" "}
              Beta readiness threshold is {BETA_META.threshold} (staged rollout to {BETA_META.pilotCount} trusted pilot schools).
              Full release gate is {BETA_META.releaseThreshold} (GA rollout to all schools). Launch button remains disabled until
              score ≥ {BETA_META.threshold} AND 3/3 sign-offs collected.
            </div>

            {/* ── Footer nav ── */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 20,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              {[
                { href: "/owner", label: "← Console" },
                { href: "/owner/release", label: "Release Gate" },
                { href: "/owner/governance", label: "Governance" },
                { href: "/owner/feedback-summary", label: "Feedback" },
                { href: "/owner/routes", label: "All Routes" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.muted,
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
