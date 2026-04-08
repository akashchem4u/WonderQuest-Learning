"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  blue: "#38bdf8",
  coral: "#ff7b6b",
  text: "#f0f6ff",
  muted: "#8b949e",
} as const;

type TeacherWin = {
  id: string;
  type: string;
  title: string;
  description: string;
  value: string | null;
  createdAt: string;
  studentId: string;
  studentDisplayName: string;
  launchBandCode: string;
  launchBandLabel: string;
};

type WinsResponse = {
  teacherId: string;
  rangeDays: number;
  wins: TeacherWin[];
};

type FilterOption = {
  days: number;
  label: string;
  hint: string;
};

const FILTERS: FilterOption[] = [
  { days: 7, label: "7 days", hint: "Fresh momentum" },
  { days: 14, label: "14 days", hint: "Two-week arc" },
  { days: 30, label: "30 days", hint: "Monthly view" },
];

const WIN_LIMIT = 50;

function fetchJsonError(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const message = (payload as { error?: unknown }).error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return `HTTP ${status}`;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 2) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d ago`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function typeMeta(type: string) {
  switch (type) {
    case "level_up":
      return {
        icon: "⬆️",
        label: "Level up",
        bg: "rgba(34,197,94,0.14)",
        color: C.mint,
      };
    case "badge":
      return {
        icon: "🏅",
        label: "Badge",
        bg: "rgba(255,209,102,0.14)",
        color: C.gold,
      };
    case "streak":
      return {
        icon: "🔥",
        label: "Streak",
        bg: "rgba(255,123,107,0.12)",
        color: C.coral,
      };
    case "milestone-earned":
    default:
      return {
        icon: "🎉",
        label: "Milestone",
        bg: "rgba(155,114,255,0.12)",
        color: C.violet,
      };
  }
}

function bandMeta(code: string) {
  const normalized = code.trim().toUpperCase();
  if (normalized === "PREK" || normalized === "P0") {
    return { bg: "rgba(255,209,102,0.12)", color: C.gold };
  }
  if (normalized === "K1" || normalized === "P1") {
    return { bg: "rgba(155,114,255,0.12)", color: C.violet };
  }
  if (normalized === "G23" || normalized === "P2") {
    return { bg: "rgba(34,197,94,0.12)", color: C.mint };
  }
  if (normalized === "G45" || normalized === "P3") {
    return { bg: "rgba(56,189,248,0.12)", color: C.blue };
  }
  return { bg: "rgba(255,255,255,0.08)", color: C.text };
}

function countBy<T>(items: T[], pick: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = pick(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function StatCard({
  value,
  label,
  icon,
  tone,
}: {
  value: string;
  label: string;
  icon: string;
  tone: string;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: "18px 18px 16px",
        minHeight: 108,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 12,
          background: tone,
          marginBottom: 14,
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          fontWeight: 700,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: ".08em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "flex-start",
        padding: "11px 14px",
        minWidth: 116,
        borderRadius: 14,
        border: active ? `1px solid ${C.violet}` : `1px solid ${C.border}`,
        background: active ? "rgba(155,114,255,0.12)" : C.surface,
        color: C.text,
        cursor: "pointer",
        textAlign: "left",
        transition: "transform .15s ease, border-color .15s ease, background .15s ease",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 800 }}>{label}</span>
      <span style={{ fontSize: 11, color: active ? C.violet : C.muted }}>{hint}</span>
    </button>
  );
}

function WinCard({ win }: { win: TeacherWin }) {
  const type = typeMeta(win.type);
  const band = bandMeta(win.launchBandCode);

  return (
    <article
      style={{
        position: "relative",
        overflow: "hidden",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "auto -18px -18px auto",
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(155,114,255,0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: type.bg,
            color: type.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {type.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 900,
                color: C.text,
                lineHeight: 1.35,
                flex: "1 1 220px",
              }}
            >
              {win.title}
            </h3>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: type.bg,
                color: type.color,
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {type.label}
            </span>
          </div>

          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.6, color: C.muted }}>
            {win.description}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 14,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: band.bg,
                color: band.color,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {win.launchBandLabel}
            </span>
            {win.value ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  color: C.text,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {win.value}
              </span>
            ) : null}
            <span style={{ fontSize: 11, color: C.muted }}>{formatDate(win.createdAt)}</span>
            <span style={{ fontSize: 11, color: C.muted }}>•</span>
            <span style={{ fontSize: 11, color: C.muted }}>{timeAgo(win.createdAt)}</span>
          </div>
        </div>

        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.text,
            fontSize: 13,
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {initials(win.studentDisplayName)}
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
          Student
        </div>
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 800, color: C.text }}>
          {win.studentDisplayName}
        </div>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        minHeight: 168,
        opacity: 0.7,
      }}
    />
  );
}

function EmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: "34px 28px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 44, marginBottom: 12 }}>🌱</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>No wins surfaced yet</div>
      <p style={{ margin: "10px auto 0", maxWidth: 460, fontSize: 13, lineHeight: 1.7, color: C.muted }}>
        Once students start earning badges, streaks, and level-ups, they&apos;ll show up here. If you
        just changed filters, try a wider range.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: `1px solid ${C.violet}`,
            background: "rgba(155,114,255,0.12)",
            color: C.violet,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
        <Link
          href="/teacher/class"
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.surfaceAlt,
            color: C.text,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Open class roster
        </Link>
      </div>
    </div>
  );
}

export default function RecentWinsPage() {
  const [authed, setAuthed] = useState(false);
  const [days, setDays] = useState(7);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [wins, setWins] = useState<TeacherWin[]>([]);
  const [rangeDays, setRangeDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacherId().then(id => setAuthed(!!id));
  }, []);

  useEffect(() => { void (async () => {
    if (!authed) return;

    const teacherId = await fetchTeacherId();
    if (!teacherId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/teacher/wins?teacherId=${encodeURIComponent(teacherId)}&days=${days}&limit=${WIN_LIMIT}`,
    )
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(fetchJsonError(payload, response.status));
        }
        return payload as WinsResponse;
      })
      .then((payload) => {
        if (cancelled) return;
        setWins(Array.isArray(payload.wins) ? payload.wins : []);
        setRangeDays(payload.rangeDays ?? days);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) return;
        setWins([]);
        setError(caughtError instanceof Error ? caughtError.message : "Failed to load wins.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  })(); }, [authed, days, refreshNonce]);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/recent-wins">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: 24,
          }}
        >
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  const totalWins = wins.length;
  const uniqueStudents = new Set(wins.map((win) => win.studentId)).size;
  const uniqueBands = new Set(wins.map((win) => win.launchBandLabel)).size;
  const latestWin = wins[0] ?? null;
  const typeCounts = countBy(wins, (win) => win.type);
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0] ?? null;

  return (
    <AppFrame audience="teacher" currentPath="/teacher/recent-wins">
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          padding: "28px 24px 56px",
          color: C.text,
          background:
            "radial-gradient(circle at top left, rgba(155,114,255,0.18), transparent 28%), radial-gradient(circle at top right, rgba(56,189,248,0.14), transparent 26%), linear-gradient(180deg, #100b2e 0%, #0d0a22 100%)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.5), transparent 92%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.5fr) minmax(290px, 0.8fr)",
              gap: 16,
              alignItems: "stretch",
              marginBottom: 16,
            }}
          >
            <section
              style={{
                position: "relative",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, rgba(155,114,255,0.17), rgba(255,209,102,0.08) 48%, rgba(56,189,248,0.08))",
                border: `1px solid ${C.border}`,
                borderRadius: 22,
                padding: 24,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: "auto -60px -50px auto",
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 66%)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.08)`,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: C.text,
                  }}
                >
                  <span aria-hidden="true">🌟</span>
                  Recent Wins
                </div>
                <h1
                  style={{
                    margin: "14px 0 10px",
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 950,
                    color: C.text,
                    maxWidth: 680,
                  }}
                >
                  Celebrate the last {rangeDays} days of momentum in one glance.
                </h1>
                <p style={{ margin: 0, maxWidth: 700, fontSize: 14, lineHeight: 1.7, color: "rgba(240,246,255,0.8)" }}>
                  This feed pulls real milestone notifications from <code style={{ color: C.gold }}> /api/teacher/wins</code>, so teachers can quickly see who leveled up, earned a badge, or kept a streak alive.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
                  {FILTERS.map((filter) => (
                    <FilterChip
                      key={filter.days}
                      active={days === filter.days}
                      label={filter.label}
                      hint={filter.hint}
                      onClick={() => setDays(filter.days)}
                    />
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  <Link
                    href="/teacher/class-health"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      background: "rgba(255,255,255,0.04)",
                      color: C.text,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Class health
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href="/teacher/feedback-panel"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: `1px solid rgba(155,114,255,0.3)`,
                      background: "rgba(155,114,255,0.12)",
                      color: C.violet,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Support signals
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <StatCard
                value={loading ? "…" : String(totalWins)}
                label="Wins surfaced"
                icon="🎉"
                tone="rgba(255,209,102,0.12)"
              />
              <StatCard
                value={loading ? "…" : String(uniqueStudents)}
                label="Students represented"
                icon="👥"
                tone="rgba(56,189,248,0.12)"
              />
              <StatCard
                value={loading ? "…" : String(uniqueBands)}
                label="Bands touched"
                icon="📐"
                tone="rgba(155,114,255,0.12)"
              />
              <StatCard
                value={loading ? "…" : (topType ? typeMeta(topType[0]).label : "None")}
                label="Most common win"
                icon="✨"
                tone="rgba(34,197,94,0.12)"
              />
            </section>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
              gap: 16,
              alignItems: "start",
            }}
          >
            <section
              style={{
                background: "rgba(22,27,34,0.96)",
                border: `1px solid ${C.border}`,
                borderRadius: 22,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>
                    Recent wins feed
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: C.muted }}>
                    Sorted newest first · {rangeDays}-day window · {loading ? "loading…" : `${totalWins} item${totalWins === 1 ? "" : "s"}`}
                  </div>
                </div>
                {latestWin ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${C.border}`,
                      color: C.text,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Latest {timeAgo(latestWin.createdAt)}
                  </div>
                ) : null}
              </div>

              {error ? (
                <div
                  style={{
                    background: "rgba(255,123,107,0.09)",
                    border: "1px solid rgba(255,123,107,0.22)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    marginBottom: 16,
                    color: C.coral,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Could not load recent wins.</strong> {error}
                  <div style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setRefreshNonce((current) => current + 1)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: `1px solid rgba(255,123,107,0.35)`,
                        background: "rgba(255,123,107,0.12)",
                        color: C.coral,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <LoadingCard key={n} />
                  ))}
                </div>
              ) : totalWins > 0 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {wins.map((win) => (
                    <WinCard key={win.id} win={win} />
                  ))}
                </div>
              ) : (
                <EmptyState onRetry={() => setRefreshNonce((current) => current + 1)} />
              )}
            </section>

            <aside style={{ display: "grid", gap: 16 }}>
              <section
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 22,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 12 }}>
                  What counts as a win
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { icon: "⬆️", title: "Level up", text: "A student crossed a progress threshold and moved to a new level." },
                    { icon: "🏅", title: "Badge", text: "A badge was earned and added to the student profile." },
                    { icon: "🔥", title: "Streak", text: "Daily play kept the momentum alive." },
                    { icon: "🎉", title: "Milestone", text: "A broader milestone notification was recorded." },
                  ].map((item) => (
                    <div
                      key={item.title}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: "10px 0",
                        borderTop: `1px solid ${C.border}`,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{item.title}</div>
                        <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.6, color: C.muted }}>
                          {item.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 22,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 12 }}>
                  Quick links
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { href: "/teacher/class", label: "Open class roster" },
                    { href: "/teacher/class-health", label: "Check class health" },
                    { href: "/teacher/feedback-panel", label: "Review feedback signals" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: `1px solid ${C.border}`,
                        background: "rgba(255,255,255,0.03)",
                        color: C.text,
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {item.label}
                      <span aria-hidden="true" style={{ color: C.violet }}>
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
