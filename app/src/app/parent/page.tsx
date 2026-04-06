"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type ChildDashboard = {
  studentId: string;
  sessionCount: number;
  completedSessions: number;
  totalTimeSpentMs: number;
  effectiveTimeSpentMs: number;
  averageEffectiveness: number | null;
  completionRate: number | null;
  effectiveRatio: number | null;
  lastSessionAt: string | null;
  recommendedFocus: string;
  readinessLabel: string;
  strengths: {
    skillCode: string;
    displayName: string;
    masteryRate: number;
    attempts: number;
  }[];
  supportAreas: {
    skillCode: string;
    displayName: string;
    masteryRate: number;
    attempts: number;
  }[];
  recentSessions: {
    id: string;
    sessionMode: string;
    startedAt: string;
    endedAt: string | null;
    effectivenessScore: number | null;
    totalQuestions: number;
  }[];
};

type ParentAccessResponse = {
  guardian: {
    id: string;
    username: string;
    displayName: string;
  };
  linkedChild: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  } | null;
  linkedChildren: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  }[];
  childDashboards: ChildDashboard[];
  childDashboard: ChildDashboard | null;
};

type ParentAccessMode = "new" | "returning";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMinutes(ms: number) {
  return `${Math.round((ms / 60000) * 10) / 10} min`;
}

function formatPercent(value: number | null) {
  return value === null ? "n/a" : `${value}%`;
}

function formatSessionMode(value: string) {
  return value === "self-directed-challenge" ? "Self-directed" : "Guided";
}

function formatLastSeen(value: string | null) {
  if (!value) return "Not yet started";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAvatarSymbol(avatarKey: string) {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "✨";
}

function getBandColor(bandCode: string) {
  if (bandCode.startsWith("pre")) return C.mint;
  if (bandCode.startsWith("k1")) return C.violet;
  if (bandCode.startsWith("g2") || bandCode.startsWith("g3")) return C.gold;
  return C.coral;
}

function getBandLabel(bandCode: string) {
  if (bandCode.startsWith("pre")) return "Pre-K Band";
  if (bandCode.startsWith("k1")) return "K–1 Band";
  if (bandCode.startsWith("g2")) return "Grades 2–3";
  if (bandCode.startsWith("g3")) return "Grades 2–3";
  if (bandCode.startsWith("g4") || bandCode.startsWith("g5")) return "Grades 4–5";
  return bandCode;
}

function buildParentSkillAction(skillCode: string, displayName: string) {
  const label = `${skillCode} ${displayName}`.toLowerCase();
  if (label.includes("count")) return "Count a few objects together once.";
  if (label.includes("letter") || label.includes("phonics")) return "Point to one familiar letter or sound.";
  if (label.includes("shape")) return "Find the same shape in the room.";
  if (label.includes("add")) return "Use small objects and let them combine.";
  if (label.includes("read") || label.includes("word")) return "Say one target word and spot it again.";
  return `Keep practice short around ${displayName.toLowerCase()}.`;
}

function deriveStreakDays(recentSessions: ChildDashboard["recentSessions"]) {
  if (!recentSessions.length) return 0;
  const days = new Set(recentSessions.map((s) => new Date(s.startedAt).toDateString()));
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ─── Stub preview data ────────────────────────────────────────────────────────

const STUB_PREVIEW_SKILLS = [
  { name: "Rhyming words", pct: 88, color: C.violet },
  { name: "Letter sounds", pct: 74, color: C.violet },
  { name: "Counting", pct: 60, color: C.gold },
];

const STUB_STATS = [
  { icon: "⭐", val: "42", label: "Stars" },
  { icon: "📚", val: "14", label: "Sessions" },
  { icon: "🔥", val: "5", label: "Streak" },
  { icon: "🏅", val: "2", label: "Badges" },
];

const TRUST_BADGES = ["🔒 COPPA-safe", "📵 No ads", "✅ Teacher-guided"];

// ─── Nav quick-links shown on authenticated dashboard ─────────────────────────

const DASHBOARD_NAV = [
  { href: "/parent/report", label: "Weekly Report", icon: "📊" },
  { href: "/parent/practice", label: "Practice Ideas", icon: "💡" },
  { href: "/parent/family", label: "Family Hub", icon: "👨‍👩‍👧" },
  { href: "/parent/benchmarks", label: "How it works", icon: "ℹ️" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentAccessPage() {
  const [accessMode, setAccessMode] = useState<ParentAccessMode>("returning");
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [childUsername, setChildUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ParentAccessResponse | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const returningMode = accessMode === "returning";

  const activeChildId =
    selectedChildId ??
    result?.linkedChild?.id ??
    result?.linkedChildren[0]?.id ??
    null;

  const activeChild =
    result?.linkedChildren.find((c) => c.id === activeChildId) ??
    result?.linkedChild ??
    result?.linkedChildren[0] ??
    null;

  const activeChildDashboard =
    result?.childDashboards.find((d) => d.studentId === activeChildId) ??
    result?.childDashboard ??
    null;

  const streakDays = activeChildDashboard
    ? deriveStreakDays(activeChildDashboard.recentSessions)
    : 0;

  const allSkills = activeChildDashboard
    ? [...activeChildDashboard.supportAreas, ...activeChildDashboard.strengths]
    : [];

  // Cookie-based session restore
  useEffect(() => {
    let cancelled = false;
    async function trySessionRestore() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as ParentAccessResponse;
        if (cancelled) return;
        const defaultId = payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null;
        setSelectedChildId(defaultId);
        if (defaultId) localStorage.setItem("wq_active_student_id", defaultId);
        // If landed here via middleware redirect, go back to the requested page
        const nextPath = new URLSearchParams(window.location.search).get("next");
        if (nextPath && nextPath.startsWith("/parent/")) {
          window.location.assign(nextPath);
          return;
        }
        setResult(payload);
      } catch {
        // No valid session — stay on the credential form.
      }
    }
    void trySessionRestore();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!result) return;
    const activeId = selectedChildId ?? result.linkedChild?.id ?? result.linkedChildren[0]?.id;
    const stillValid = activeId
      ? result.linkedChildren.some((c) => c.id === activeId)
      : false;
    if (!stillValid) {
      setSelectedChildId(result.linkedChild?.id ?? result.linkedChildren[0]?.id ?? null);
    }
  }, [result, selectedChildId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/parent/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          pin,
          displayName: returningMode ? "" : displayName,
          childUsername: returningMode ? "" : childUsername,
          relationship: "parent",
          notifyWeekly,
          notifyMilestones,
        }),
      });
      const payload = (await response.json()) as ParentAccessResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Parent access failed.");
      const defaultId = payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null;
      setSelectedChildId(defaultId);
      if (defaultId) localStorage.setItem("wq_active_student_id", defaultId);
      // Redirect to the originally requested page if present
      const nextPath = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
      if (nextPath && nextPath.startsWith("/parent/")) {
        window.location.assign(nextPath);
        return;
      }
      setResult(payload);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Parent access failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Shared style helpers ───────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid rgba(155,114,255,0.3)",
    borderRadius: "10px",
    font: "400 0.92rem system-ui",
    color: C.text,
    background: "rgba(155,114,255,0.08)",
    outline: "none",
    fontFamily: "system-ui",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    font: "600 0.78rem system-ui",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "6px",
    fontFamily: "system-ui",
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    font: "700 0.95rem system-ui",
    cursor: "pointer",
    fontFamily: "system-ui",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // UNAUTHENTICATED — 2-col hero sign-in
  // ─────────────────────────────────────────────────────────────────────────────

  if (!result) {
    return (
      <AppFrame audience="parent" currentPath="/parent">
        <div
          style={{
            minHeight: "100vh",
            background: C.base,
            fontFamily: "system-ui",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "48px 40px 80px",
              display: "grid",
              gridTemplateColumns: "1fr 420px",
              gap: "64px",
              alignItems: "center",
              minHeight: "100vh",
            }}
          >
            {/* ── Left hero ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Wordmark */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  🌟
                </div>
                <span
                  style={{
                    font: "900 1.5rem system-ui",
                    background: "linear-gradient(135deg, #c3aaff, #9b72ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  WonderQuest
                </span>
              </div>

              <h1
                style={{
                  font: "700 2.6rem/1.15 system-ui",
                  color: C.text,
                  maxWidth: "460px",
                  margin: 0,
                }}
              >
                Your child&apos;s{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #9b72ff, #58e8c1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  learning adventure
                </span>{" "}
                — in your hands
              </h1>

              <p
                style={{
                  font: "400 1.05rem/1.7 system-ui",
                  color: C.muted,
                  maxWidth: "420px",
                  margin: 0,
                }}
              >
                See what your child is exploring, celebrate their progress, and gently support their growth — all in one place.
              </p>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {TRUST_BADGES.map((badge) => (
                  <span
                    key={badge}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      font: "500 0.75rem system-ui",
                      color: "rgba(195,170,255,0.7)",
                      background: "rgba(155,114,255,0.12)",
                      border: "1px solid rgba(155,114,255,0.25)",
                      borderRadius: "20px",
                      padding: "5px 12px",
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Preview card */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "20px",
                  padding: "24px",
                  border: `1px solid rgba(155,114,255,0.2)`,
                  boxShadow: "0 4px 24px rgba(100,60,200,0.12)",
                  marginTop: "8px",
                  maxWidth: "440px",
                }}
              >
                <div
                  style={{
                    font: "600 0.7rem system-ui",
                    color: C.violet,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "4px",
                  }}
                >
                  Preview — what you&apos;ll see
                </div>
                <div
                  style={{
                    font: "700 0.95rem system-ui",
                    color: C.text,
                    marginBottom: "16px",
                  }}
                >
                  Maya&apos;s week at a glance
                </div>

                <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {STUB_STATS.map((s) => (
                    <div key={s.label}>
                      <span
                        style={{
                          font: "700 1.2rem system-ui",
                          color: C.text,
                          display: "block",
                        }}
                      >
                        {s.icon} {s.val}
                      </span>
                      <span
                        style={{
                          font: "400 0.68rem system-ui",
                          color: C.muted,
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {STUB_PREVIEW_SKILLS.map((skill) => (
                    <div
                      key={skill.name}
                      style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                      <span
                        style={{
                          font: "600 0.78rem system-ui",
                          color: C.text,
                          width: "110px",
                          flexShrink: 0,
                        }}
                      >
                        {skill.name}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "6px",
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${skill.pct}%`,
                            height: "100%",
                            background: skill.color,
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          font: "600 0.7rem system-ui",
                          color: C.muted,
                          width: "30px",
                          textAlign: "right",
                        }}
                      >
                        {skill.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right sign-in card ────────────────────────────────────────── */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "20px",
                padding: "40px 36px",
                boxShadow: "0 8px 40px rgba(100,60,200,0.15)",
                border: "1px solid rgba(155,114,255,0.2)",
                position: "sticky",
                top: "24px",
              }}
            >
              <div
                style={{
                  font: "600 0.75rem system-ui",
                  color: C.violet,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "6px",
                }}
              >
                Parent Portal
              </div>
              <div
                style={{
                  font: "700 1.5rem system-ui",
                  color: C.text,
                  marginBottom: "24px",
                }}
              >
                {returningMode ? "Welcome back" : "Create parent access"}
              </div>

              {/* Mode toggle */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "22px" }}>
                {(["returning", "new"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setAccessMode(mode); setError(""); }}
                    type="button"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      font: "600 0.8rem system-ui",
                      textAlign: "left",
                      border:
                        accessMode === mode
                          ? "2px solid #9b72ff"
                          : "1.5px solid rgba(155,114,255,0.2)",
                      background:
                        accessMode === mode
                          ? "rgba(155,114,255,0.18)"
                          : "rgba(255,255,255,0.04)",
                      color: accessMode === mode ? C.violet : C.muted,
                      fontFamily: "system-ui",
                    }}
                  >
                    <span style={{ display: "block", marginBottom: "2px" }}>
                      {mode === "returning" ? "🔐" : "✨"}
                    </span>
                    {mode === "returning" ? "Existing parent" : "First-time setup"}
                    <span
                      style={{
                        display: "block",
                        font: "400 0.7rem system-ui",
                        marginTop: "2px",
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      {mode === "returning" ? "Username + PIN" : "Set name, PIN, link child"}
                    </span>
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "14px" }}
              >
                <div>
                  <label style={labelStyle}>Username</label>
                  <input
                    autoComplete="username"
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="parent username"
                    style={inputStyle}
                    type="text"
                    value={username}
                  />
                </div>

                <div>
                  <label style={labelStyle}>4-digit PIN</label>
                  <input
                    autoComplete="current-password"
                    maxLength={4}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="0000"
                    style={inputStyle}
                    type="password"
                    value={pin}
                  />
                </div>

                {!returningMode && (
                  <>
                    <div>
                      <label style={labelStyle}>Display name</label>
                      <input
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Parent name"
                        style={inputStyle}
                        type="text"
                        value={displayName}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Child username</label>
                      <input
                        onChange={(e) => setChildUsername(e.target.value)}
                        placeholder="child quest name"
                        style={inputStyle}
                        type="text"
                        value={childUsername}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        {
                          key: "weekly",
                          label: "Weekly summary",
                          sub: "Time, insights, and next focus.",
                          val: notifyWeekly,
                          toggle: () => setNotifyWeekly((v) => !v),
                        },
                        {
                          key: "milestones",
                          label: "Milestones",
                          sub: "Badges, trophies, and level moments.",
                          val: notifyMilestones,
                          toggle: () => setNotifyMilestones((v) => !v),
                        },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={item.toggle}
                          type="button"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            border: `1.5px solid ${item.val ? "rgba(155,114,255,0.3)" : C.border}`,
                            background: item.val
                              ? "rgba(155,114,255,0.1)"
                              : C.surface,
                            textAlign: "left",
                            fontFamily: "system-ui",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                font: "600 0.82rem system-ui",
                                color: C.text,
                              }}
                            >
                              {item.label}
                            </div>
                            <div
                              style={{
                                font: "400 0.7rem system-ui",
                                color: C.muted,
                              }}
                            >
                              {item.sub}
                            </div>
                          </div>
                          <span
                            style={{
                              font: "700 0.72rem system-ui",
                              color: item.val ? C.violet : C.muted,
                              background: item.val
                                ? "rgba(155,114,255,0.15)"
                                : "rgba(255,255,255,0.06)",
                              padding: "3px 10px",
                              borderRadius: "10px",
                            }}
                          >
                            {item.val ? "On" : "Off"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {error && (
                  <p
                    style={{
                      font: "500 0.82rem system-ui",
                      color: "#ff6b6b",
                      background: "rgba(255,107,107,0.1)",
                      border: "1px solid rgba(255,107,107,0.25)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      margin: 0,
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  disabled={submitting}
                  type="submit"
                  style={{
                    ...primaryBtnStyle,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? "not-allowed" : "pointer",
                    marginTop: "4px",
                  }}
                >
                  {submitting
                    ? returningMode
                      ? "Signing in…"
                      : "Saving…"
                    : returningMode
                      ? "Sign in to Dashboard →"
                      : "Create parent access"}
                </button>

                <div style={{ textAlign: "center" }}>
                  <Link
                    href="/child"
                    style={{
                      font: "500 0.8rem system-ui",
                      color: C.violet,
                      textDecoration: "none",
                    }}
                  >
                    Child access →
                  </Link>
                </div>
              </form>

              {/* COPPA note */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  border: `1px solid ${C.border}`,
                  font: "400 0.71rem/1.6 system-ui",
                  color: "rgba(255,255,255,0.35)",
                  textAlign: "center",
                }}
              >
                🔒 This portal is for parents and guardians only. We comply with COPPA and never collect data from children without parental consent.
              </div>
            </div>
          </div>
        </div>
      </AppFrame>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────

  const childName = activeChild?.displayName ?? "your child";

  const statCardStyle: React.CSSProperties = {
    background: C.surface,
    borderRadius: "16px",
    padding: "20px",
    border: `1px solid ${C.border}`,
    fontFamily: "system-ui",
  };

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui",
          paddingBottom: "80px",
        }}
      >
        {/* ── Top nav bar ───────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderBottom: `1px solid ${C.border}`,
            padding: "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
              }}
            >
              🌟
            </div>
            <span
              style={{
                font: "800 1.1rem system-ui",
                background: "linear-gradient(135deg, #c3aaff, #9b72ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              WonderQuest
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {DASHBOARD_NAV.map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "rgba(155,114,255,0.08)",
                  border: "1px solid rgba(155,114,255,0.15)",
                  font: "600 0.78rem system-ui",
                  color: "rgba(195,170,255,0.8)",
                  textDecoration: "none",
                }}
              >
                <span>{nav.icon}</span>
                {nav.label}
              </Link>
            ))}
          </div>

          <div
            style={{
              font: "600 0.8rem system-ui",
              color: C.muted,
            }}
          >
            👋 {result.guardian.displayName}
          </div>
        </div>

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "32px 36px 0",
          }}
        >
          {/* ── Child selector (multi-child) ───────────────────────────────── */}
          {result.linkedChildren.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {result.linkedChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => {
                    setSelectedChildId(child.id);
                    localStorage.setItem("wq_active_student_id", child.id);
                  }}
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 16px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    border:
                      activeChildId === child.id
                        ? "2px solid #9b72ff"
                        : `1.5px solid ${C.border}`,
                    background:
                      activeChildId === child.id
                        ? "rgba(155,114,255,0.15)"
                        : C.surface,
                    font: "600 0.8rem system-ui",
                    color:
                      activeChildId === child.id ? C.violet : C.muted,
                    fontFamily: "system-ui",
                  }}
                >
                  <span>{getAvatarSymbol(child.avatarKey)}</span>
                  {child.displayName}
                </button>
              ))}
            </div>
          )}

          {/* ── Child hero card ────────────────────────────────────────────── */}
          {activeChild && (
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(155,114,255,0.1) 0%, rgba(88,232,193,0.06) 100%)",
                borderRadius: "20px",
                padding: "28px",
                border: "1px solid rgba(155,114,255,0.2)",
                marginBottom: "24px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "24px",
                alignItems: "center",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(155,114,255,0.3), rgba(88,232,193,0.2))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  flexShrink: 0,
                  border: "2px solid rgba(155,114,255,0.3)",
                }}
              >
                {getAvatarSymbol(activeChild.avatarKey)}
              </div>

              {/* Name + band + stats */}
              <div>
                <div
                  style={{
                    font: "700 1.3rem system-ui",
                    color: C.text,
                    marginBottom: "6px",
                  }}
                >
                  {activeChild.displayName}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 12px",
                    borderRadius: "16px",
                    marginBottom: "14px",
                    background: "rgba(155,114,255,0.12)",
                    border: `1.5px solid ${getBandColor(activeChild.launchBandCode)}`,
                    font: "700 0.72rem system-ui",
                    color: "rgba(195,170,255,0.9)",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: getBandColor(activeChild.launchBandCode),
                      flexShrink: 0,
                    }}
                  />
                  {getBandLabel(activeChild.launchBandCode)} · Level {activeChild.currentLevel}
                </div>
                <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                  {[
                    { val: `⭐ ${activeChild.totalPoints}`, label: "Stars earned" },
                    { val: `${activeChildDashboard?.completedSessions ?? 0}`, label: "Sessions" },
                    { val: `🔥 ${streakDays}`, label: "Day streak" },
                    { val: `${activeChild.badgeCount}`, label: "Badges" },
                  ].map((s) => (
                    <div key={s.label}>
                      <span
                        style={{
                          font: "900 1.25rem system-ui",
                          color: C.text,
                          display: "block",
                        }}
                      >
                        {s.val}
                      </span>
                      <span
                        style={{
                          font: "400 0.68rem system-ui",
                          color: C.muted,
                          display: "block",
                          marginTop: "1px",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link
                  href="/parent/report"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                    color: "#fff",
                    borderRadius: "10px",
                    font: "600 0.82rem system-ui",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  📊 Weekly Report →
                </Link>
                <Link
                  href="/parent/practice"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "9px 20px",
                    background: C.surface,
                    color: C.muted,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: "10px",
                    font: "600 0.78rem system-ui",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  💡 Practice Ideas
                </Link>
              </div>
            </div>
          )}

          {/* ── Quick stats ────────────────────────────────────────────────── */}
          {activeChildDashboard && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px",
                marginBottom: "24px",
              }}
            >
              {[
                {
                  icon: "⭐",
                  val: activeChild?.totalPoints ?? 0,
                  label: "Stars earned",
                  delta: `Level ${activeChild?.currentLevel ?? 1}`,
                  color: C.gold,
                },
                {
                  icon: "📚",
                  val: activeChildDashboard.completedSessions,
                  label: "Sessions completed",
                  delta: formatMinutes(activeChildDashboard.totalTimeSpentMs) + " total",
                  color: C.violet,
                },
                {
                  icon: "⏱️",
                  val: formatMinutes(activeChildDashboard.effectiveTimeSpentMs),
                  label: "Effective time",
                  delta: formatPercent(activeChildDashboard.averageEffectiveness) + " engagement",
                  color: C.mint,
                },
                {
                  icon: "🏅",
                  val: activeChild?.badgeCount ?? 0,
                  label: "Badges earned",
                  delta: `${activeChild?.trophyCount ?? 0} trophies`,
                  color: C.coral,
                },
              ].map((tile) => (
                <div key={tile.label} style={statCardStyle}>
                  <div style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{tile.icon}</div>
                  <span
                    style={{
                      font: "900 1.5rem system-ui",
                      color: C.text,
                      display: "block",
                      marginBottom: "2px",
                    }}
                  >
                    {tile.val}
                  </span>
                  <div
                    style={{
                      font: "400 0.72rem system-ui",
                      color: C.muted,
                    }}
                  >
                    {tile.label}
                  </div>
                  <div
                    style={{
                      font: "600 0.7rem system-ui",
                      marginTop: "6px",
                      color: tile.color,
                    }}
                  >
                    ↑ {tile.delta}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 2-col: skills + activity ───────────────────────────────────── */}
          {activeChildDashboard && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                marginBottom: "24px",
              }}
            >
              {/* Skills practiced */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "16px",
                  padding: "22px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ font: "700 0.95rem system-ui", color: C.text }}>
                    Skills practiced
                  </span>
                  <Link
                    href="/parent/report"
                    style={{
                      font: "500 0.75rem system-ui",
                      color: C.violet,
                      textDecoration: "none",
                    }}
                  >
                    See all →
                  </Link>
                </div>

                {allSkills.length > 0 ? (
                  <>
                    {allSkills.slice(0, 5).map((skill) => {
                      const barColor = skill.masteryRate >= 75 ? C.violet : C.gold;
                      return (
                        <div
                          key={skill.skillCode}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <span
                            style={{
                              font: "600 0.8rem system-ui",
                              color: C.text,
                              width: "120px",
                              flexShrink: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {skill.displayName}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: "6px",
                              background: "rgba(255,255,255,0.08)",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${skill.masteryRate}%`,
                                height: "100%",
                                background: barColor,
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              font: "600 0.7rem system-ui",
                              color: C.muted,
                              width: "32px",
                              textAlign: "right",
                              flexShrink: 0,
                            }}
                          >
                            {skill.masteryRate}%
                          </span>
                        </div>
                      );
                    })}

                    {activeChildDashboard.supportAreas[0] && (
                      <div
                        style={{
                          marginTop: "14px",
                          padding: "10px 12px",
                          background: "rgba(88,232,193,0.08)",
                          borderRadius: "8px",
                          border: "1px solid rgba(88,232,193,0.2)",
                          font: "400 0.76rem/1.4 system-ui",
                          color: C.mint,
                        }}
                      >
                        💡{" "}
                        {buildParentSkillAction(
                          activeChildDashboard.supportAreas[0].skillCode,
                          activeChildDashboard.supportAreas[0].displayName,
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p
                    style={{
                      font: "400 0.82rem system-ui",
                      color: C.muted,
                      margin: 0,
                    }}
                  >
                    Skills appear after a few sessions.
                  </p>
                )}
              </div>

              {/* Recent activity */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "16px",
                  padding: "22px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    font: "700 0.95rem system-ui",
                    color: C.text,
                    marginBottom: "14px",
                  }}
                >
                  Recent activity
                </div>
                {activeChildDashboard.recentSessions.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {activeChildDashboard.recentSessions.slice(0, 5).map((session) => {
                      const dotColor =
                        session.effectivenessScore && session.effectivenessScore >= 75
                          ? C.violet
                          : session.effectivenessScore && session.effectivenessScore >= 50
                            ? C.gold
                            : C.mint;
                      return (
                        <li
                          key={session.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            padding: "10px 0",
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: dotColor,
                              flexShrink: 0,
                              marginTop: "4px",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                font: "400 0.82rem/1.4 system-ui",
                                color: C.muted,
                              }}
                            >
                              <strong
                                style={{ fontWeight: 700, color: C.text }}
                              >
                                {childName}
                              </strong>{" "}
                              completed a {formatSessionMode(session.sessionMode).toLowerCase()} session
                              {session.effectivenessScore !== null
                                ? ` · ${session.effectivenessScore}% engagement`
                                : ""}
                            </div>
                            <div
                              style={{
                                font: "400 0.7rem system-ui",
                                color: "rgba(255,255,255,0.3)",
                                marginTop: "2px",
                              }}
                            >
                              {formatLastSeen(session.startedAt)}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p
                    style={{
                      font: "400 0.82rem system-ui",
                      color: C.muted,
                      margin: 0,
                    }}
                  >
                    Activity appears here after the first lesson.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation cards ──────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "14px",
              marginBottom: "32px",
            }}
          >
            {[
              {
                href: "/parent/report",
                icon: "📊",
                title: "Weekly Report",
                desc: "Full breakdown of sessions, skills, and time.",
                color: C.violet,
              },
              {
                href: "/parent/practice",
                icon: "💡",
                title: "Practice Ideas",
                desc: "Simple activities to try at home this week.",
                color: C.mint,
              },
              {
                href: "/parent/family",
                icon: "👨‍👩‍👧",
                title: "Family Hub",
                desc: "Manage children, settings, and notifications.",
                color: C.gold,
              },
              {
                href: "/parent/benchmarks",
                icon: "ℹ️",
                title: "How it works",
                desc: "Understand bands, mastery scores, and stars.",
                color: C.coral,
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                style={{
                  display: "block",
                  padding: "20px",
                  background: C.surface,
                  borderRadius: "16px",
                  border: `1px solid ${C.border}`,
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
                  {card.icon}
                </div>
                <div
                  style={{
                    font: "700 0.9rem system-ui",
                    color: card.color,
                    marginBottom: "4px",
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    font: "400 0.78rem/1.4 system-ui",
                    color: C.muted,
                  }}
                >
                  {card.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
