"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getActiveChildId } from "@/lib/active-child";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  faint: "rgba(255,255,255,0.1)",
  border: "rgba(155,114,255,0.2)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

type HeatmapDay = {
  dayLabel: string;
  date: string;
  sessionCount: number;
};

type ReportData = {
  displayName: string;
  launchBandCode: string;
  stats: {
    sessions: number;
    starsEarned: number;
    learningMinutes: number;
    streakDays: number;
  };
  heatmap: HeatmapDay[];
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getStudentIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("wonderquest-child-id="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

const WEEKLY_GOAL_OPTIONS = [3, 5, 7] as const;
type WeeklyGoal = (typeof WEEKLY_GOAL_OPTIONS)[number];

// Suggested session days based on goal
const SUGGESTED_DAYS: Record<WeeklyGoal, string[]> = {
  3: ["Mon", "Wed", "Fri"],
  5: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  7: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

function bandToDescription(band: string): string {
  const b = band?.toLowerCase() ?? "";
  if (b.includes("prep") || b.includes("found")) return "early learner (Foundation–Year 1)";
  if (b.includes("1") || b.includes("yr1")) return "Year 1 learner";
  if (b.includes("2") || b.includes("yr2")) return "Year 2 learner";
  if (b.includes("3") || b.includes("yr3")) return "Year 3 learner";
  return "learner";
}

// ── Toggle switch ──────────────────────────────────────────────────────────

function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        background: on ? C.violet : "rgba(255,255,255,0.15)",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

// ── Day dot ────────────────────────────────────────────────────────────────

function DayDot({
  label,
  active,
  suggested,
}: {
  label: string;
  active: boolean;
  suggested: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: active
            ? C.mint
            : suggested
            ? "rgba(155,114,255,0.2)"
            : C.faint,
          border: active
            ? "none"
            : suggested
            ? `2px dashed ${C.violet}`
            : `2px solid rgba(255,255,255,0.1)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: active ? 16 : 0,
          color: "#fff",
          transition: "all 0.2s",
        }}
      >
        {active ? "✓" : ""}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: active ? C.mint : suggested ? C.violet : C.muted,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label.slice(0, 2)}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ParentPlannerPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persisted preferences (client-side only — no backend needed for these)
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal>(5);
  const [remindersOn, setRemindersOn] = useState(false);

  useEffect(() => {
    // Restore goal from localStorage if present
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("wq_weekly_goal") : null;
    if (saved && WEEKLY_GOAL_OPTIONS.includes(Number(saved) as WeeklyGoal)) {
      setWeeklyGoal(Number(saved) as WeeklyGoal);
    }
    const savedReminder = typeof localStorage !== "undefined" ? localStorage.getItem("wq_reminders") : null;
    if (savedReminder === "1") setRemindersOn(true);
  }, []);

  useEffect(() => {
    const studentId = getStudentIdFromCookie() ?? (getActiveChildId() || null);
    if (!studentId) {
      setError("No child selected. Please select a child from your dashboard.");
      setLoading(false);
      return;
    }

    fetch(`/api/parent/report?studentId=${encodeURIComponent(studentId)}&weekOffset=0`)
      .then((r) => r.json())
      .then((data) => {
        if (data.report) {
          setReport(data.report as ReportData);
        } else {
          setError(data.error ?? "Could not load planner data.");
        }
      })
      .catch(() => setError("Could not load planner data."))
      .finally(() => setLoading(false));
  }, []);

  function handleGoalChange(g: WeeklyGoal) {
    setWeeklyGoal(g);
    if (typeof localStorage !== "undefined") localStorage.setItem("wq_weekly_goal", String(g));
  }

  function handleReminderToggle() {
    const next = !remindersOn;
    setRemindersOn(next);
    if (typeof localStorage !== "undefined") localStorage.setItem("wq_reminders", next ? "1" : "0");
  }

  const childName = report?.displayName ?? "your child";
  const band = report?.launchBandCode ?? "";
  const heatmap: HeatmapDay[] = report?.heatmap ?? [];
  const sessionsThisWeek = report?.stats?.sessions ?? 0;
  const suggestedDays = SUGGESTED_DAYS[weeklyGoal];

  // Which days had sessions?
  const completedDayLabels = new Set(
    heatmap.filter((d) => d.sessionCount > 0).map((d) => d.dayLabel),
  );

  // Progress pct
  const progressPct = weeklyGoal > 0 ? Math.min(100, Math.round((sessionsThisWeek / weeklyGoal) * 100)) : 0;
  const metGoal = sessionsThisWeek >= weeklyGoal;

  const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <AppFrame audience="parent" currentPath="/parent/planner">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "28px 20px 72px",
          fontFamily: "system-ui,-apple-system,sans-serif",
          color: C.text,
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        {/* Back nav */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/parent"
            style={{ color: C.violet, fontWeight: 700, fontSize: 13, textDecoration: "none" }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 4 }}>
            🗓 Practice Planner
          </h1>
          {!loading && !error && (
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Plan and track {childName}&apos;s weekly practice
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 32,
              textAlign: "center",
              color: C.muted,
              fontSize: 14,
            }}
          >
            Loading planner data…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 14,
              padding: "16px 20px",
              fontSize: 14,
              color: "#f87171",
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {/* Main content */}
        {!loading && !error && (
          <>
            {/* ── Section 1: Weekly goal ───────────────────────────────── */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px 20px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: C.muted,
                  marginBottom: 14,
                }}
              >
                Weekly session goal
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {WEEKLY_GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGoalChange(g)}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: 12,
                      border: weeklyGoal === g ? `2px solid ${C.violet}` : `2px solid ${C.faint}`,
                      background: weeklyGoal === g ? "rgba(155,114,255,0.15)" : "transparent",
                      color: weeklyGoal === g ? C.violet : C.muted,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "system-ui",
                      transition: "all 0.15s",
                    }}
                  >
                    {g}×
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
                {weeklyGoal === 3
                  ? "Light practice — great for busy weeks."
                  : weeklyGoal === 5
                  ? "Recommended for steady progress."
                  : "Daily practice — builds strong habits."}
              </div>
            </div>

            {/* ── Section 2: This week's progress ─────────────────────── */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px 20px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: C.muted,
                  marginBottom: 4,
                }}
              >
                This week
              </div>

              {/* Progress numbers */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12, marginTop: 8 }}>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: metGoal ? C.mint : C.text,
                    lineHeight: 1,
                  }}
                >
                  {sessionsThisWeek}
                </span>
                <span style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>
                  / {weeklyGoal} sessions
                </span>
                {metGoal && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: C.mint,
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      borderRadius: 20,
                      padding: "2px 10px",
                      marginLeft: 4,
                    }}
                  >
                    Goal met! 🎉
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 8,
                  background: C.faint,
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPct}%`,
                    background: metGoal ? C.mint : C.violet,
                    borderRadius: 6,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>

              {/* Day-by-day dots */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {DAY_ORDER.map((day) => {
                  const completed = completedDayLabels.has(day);
                  const suggested = suggestedDays.includes(day);
                  return (
                    <DayDot
                      key={day}
                      label={day}
                      active={completed}
                      suggested={!completed && suggested}
                    />
                  );
                })}
              </div>

              <div style={{ fontSize: 11, color: C.muted, marginTop: 12, lineHeight: 1.5 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: C.mint,
                    marginRight: 5,
                    verticalAlign: "middle",
                  }}
                />
                Done &nbsp;
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: `2px dashed ${C.violet}`,
                    marginRight: 5,
                    marginLeft: 8,
                    verticalAlign: "middle",
                  }}
                />
                Suggested
              </div>
            </div>

            {/* ── Section 3: Recommended schedule ─────────────────────── */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px 20px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: C.muted,
                  marginBottom: 14,
                }}
              >
                Recommended schedule
              </div>

              <div
                style={{
                  background: "rgba(155,114,255,0.08)",
                  borderLeft: `4px solid ${C.violet}`,
                  borderRadius: "0 10px 10px 0",
                  padding: "12px 14px",
                  fontSize: 13,
                  color: "#c4aaff",
                  lineHeight: 1.6,
                  marginBottom: 14,
                }}
              >
                {band
                  ? `As a${/^[aeiou]/i.test(bandToDescription(band)) ? "n" : ""} ${bandToDescription(band)}, ${childName} benefits most from short daily sessions.`
                  : `Short, frequent sessions work best for young learners.`}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {suggestedDays.map((day) => (
                  <div
                    key={day}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: completedDayLabels.has(day)
                        ? "rgba(34,197,94,0.08)"
                        : C.faint,
                      border: `1px solid ${completedDayLabels.has(day) ? "rgba(34,197,94,0.2)" : "transparent"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: completedDayLabels.has(day)
                            ? C.mint
                            : "rgba(155,114,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {completedDayLabels.has(day) ? "✓" : day.slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                        {day}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: C.muted }}>~12 min</span>
                      {completedDayLabels.has(day) && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.mint,
                          }}
                        >
                          Done ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 4: Reminder toggle ──────────────────────────── */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px 20px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: C.muted,
                  marginBottom: 14,
                }}
              >
                Notification preferences
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                    Daily practice reminder
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                    Remind me if {childName} hasn&apos;t practiced today
                  </div>
                </div>
                <Toggle on={remindersOn} onToggle={handleReminderToggle} />
              </div>

              {remindersOn && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "rgba(155,114,255,0.08)",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#c4aaff",
                    lineHeight: 1.5,
                  }}
                >
                  Reminders are saved. You&apos;ll be notified if {childName} misses a practice day.
                </div>
              )}
            </div>

            {/* Footer links */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link
                href="/parent/report"
                style={{ fontSize: 13, fontWeight: 700, color: C.violet, textDecoration: "none" }}
              >
                Full report →
              </Link>
              <Link
                href="/parent/notifications"
                style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}
              >
                Notifications →
              </Link>
              <Link
                href="/parent/practice"
                style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}
              >
                Practice home →
              </Link>
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
