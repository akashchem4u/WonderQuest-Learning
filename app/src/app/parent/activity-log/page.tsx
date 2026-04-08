"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getActiveChildId } from "@/lib/active-child";

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
  surfaceHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivitySession = {
  id: string;
  startedAt: string | null;
  endedAt: string | null;
  sessionMode: string | null;
  deviceHint: string | null;
  ipAddress: string | null;
  questionsAnswered: number;
  correctAnswers: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDevice(ua: string | null): string {
  if (!ua) return "Unknown";
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return "Mobile";
  }
  return "Desktop";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(startIso: string | null, endIso: string | null): string {
  if (!startIso || !endIso) return "—";
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (ms <= 0) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "<1 min";
  return `${mins} min`;
}

function formatAccuracy(questions: number, correct: number): string {
  if (questions === 0) return "—";
  return `${Math.round((correct / questions) * 100)}%`;
}

function accuracyColor(questions: number, correct: number): string {
  if (questions === 0) return C.muted;
  const pct = (correct / questions) * 100;
  if (pct >= 80) return C.mint;
  if (pct >= 60) return C.gold;
  return C.coral;
}

function modeLabel(mode: string | null): string {
  if (!mode) return "—";
  return mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
}

function modeColor(mode: string | null): string {
  if (!mode) return C.muted;
  const lower = mode.toLowerCase();
  if (lower === "guided") return "#38bdf8";
  return C.violet;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ActivityLogPage() {
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childName, setChildName] = useState<string>("");

  useEffect(() => {
    const studentId =
      typeof window !== "undefined"
        ? getActiveChildId() || localStorage.getItem("wq_active_student_id") || ""
        : "";

    if (!studentId) {
      setLoading(false);
      return;
    }

    // Fetch child name and activity log in parallel
    Promise.all([
      fetch("/api/parent/account-context").then((r) =>
        r.ok ? r.json() : Promise.resolve(null),
      ),
      fetch(
        `/api/parent/child-activity-log?studentId=${encodeURIComponent(studentId)}`,
      ).then((r) => r.json()),
    ])
      .then(([ctxData, logData]) => {
        const children: { id: string; displayName: string }[] =
          ctxData?.linkedChildren ?? ctxData?.children ?? [];
        const match = children.find((c) => c.id === studentId);
        if (match) setChildName(match.displayName);

        if (logData?.error) {
          setError(logData.error as string);
        } else {
          setSessions(logData?.sessions ?? []);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppFrame>
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          color: C.text,
          fontFamily: "'Inter', sans-serif",
          padding: "0 0 60px",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 20px 0",
            maxWidth: "740px",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "1.3rem" }}>🛡️</span>
            <h1
              style={{
                margin: 0,
                fontSize: "1.35rem",
                fontWeight: 800,
                color: C.text,
                lineHeight: 1.2,
              }}
            >
              Activity Log
            </h1>
          </div>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: "0.8rem",
              color: C.muted,
              lineHeight: 1.5,
            }}
          >
            {childName
              ? `Login sessions and quest activity for ${childName}.`
              : "Login sessions and quest activity for your child."}
          </p>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "740px", margin: "0 auto", padding: "0 20px" }}>
          {loading && (
            <div
              style={{
                textAlign: "center",
                color: C.muted,
                fontSize: "0.85rem",
                paddingTop: "60px",
              }}
            >
              Loading activity log…
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                background: "rgba(255,123,107,0.12)",
                border: `1px solid rgba(255,123,107,0.3)`,
                borderRadius: "12px",
                padding: "14px 16px",
                color: C.coral,
                fontSize: "0.83rem",
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: C.muted,
                fontSize: "0.88rem",
                lineHeight: 1.7,
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎮</div>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: "6px" }}>
                No sessions yet
              </div>
              <div>Play your first quest to see activity here!</div>
            </div>
          )}

          {!loading && !error && sessions.length > 0 && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.8fr 0.9fr 0.8fr 1fr 1fr 0.9fr 0.9fr",
                  gap: "4px",
                  padding: "10px 16px",
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <span>Date</span>
                <span>Time</span>
                <span>Duration</span>
                <span>Mode</span>
                <span>Questions</span>
                <span>Accuracy</span>
                <span>Device</span>
              </div>

              {/* Rows */}
              {sessions.map((s, i) => {
                const acc = formatAccuracy(s.questionsAnswered, s.correctAnswers);
                const accColor = accuracyColor(s.questionsAnswered, s.correctAnswers);
                const isLast = i === sessions.length - 1;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.8fr 0.9fr 0.8fr 1fr 1fr 0.9fr 0.9fr",
                      gap: "4px",
                      padding: "11px 16px",
                      borderBottom: isLast ? "none" : `1px solid ${C.border}`,
                      fontSize: "0.78rem",
                      alignItems: "center",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = C.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    {/* Date */}
                    <span style={{ color: C.text, fontWeight: 600 }}>
                      {formatDate(s.startedAt)}
                    </span>

                    {/* Time */}
                    <span style={{ color: C.muted }}>{formatTime(s.startedAt)}</span>

                    {/* Duration */}
                    <span style={{ color: C.muted }}>
                      {formatDuration(s.startedAt, s.endedAt)}
                    </span>

                    {/* Mode */}
                    <span
                      style={{
                        color: modeColor(s.sessionMode),
                        fontWeight: 600,
                        fontSize: "0.72rem",
                      }}
                    >
                      {modeLabel(s.sessionMode)}
                    </span>

                    {/* Questions answered */}
                    <span style={{ color: C.text }}>
                      {s.questionsAnswered > 0
                        ? `${s.correctAnswers} / ${s.questionsAnswered}`
                        : "—"}
                    </span>

                    {/* Accuracy */}
                    <span
                      style={{
                        color: accColor,
                        fontWeight: 700,
                      }}
                    >
                      {acc}
                    </span>

                    {/* Device */}
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: C.muted,
                        fontSize: "0.72rem",
                      }}
                    >
                      <span>{parseDevice(s.deviceHint) === "Mobile" ? "📱" : "💻"}</span>
                      <span>{parseDevice(s.deviceHint)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* COPPA note */}
          {!loading && !error && (
            <p
              style={{
                marginTop: "16px",
                fontSize: "0.68rem",
                color: C.muted,
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              Showing up to 30 most recent login sessions. Contact support to request full data
              export or deletion.
            </p>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
