"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const VIOLET  = "#9b72ff";
const GOLD    = "#ffd166";
const TEXT    = "#f0f6ff";
const MUTED   = "#8b949e";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = "session" | "badge" | "level" | "streak" | "skill_mastered" | "skill_started";

type FeedItem = {
  id: string;
  type: EventType;
  icon: string;
  title: string;
  meta?: string;
  stars?: number;
  time: string;
};

type DayGroup = {
  label: string;
  items: FeedItem[];
};

// ─── API shape ────────────────────────────────────────────────────────────────

type RecentSession = {
  sessionId: string;
  startedAt: string;
  sessionMode: string;
  starsEarned: number;
  correctCount: number;
  totalQuestions: number;
  durationMinutes: number | null;
  skillNames: string[];
};

// ─── Icon background map ──────────────────────────────────────────────────────

const ICON_BG: Record<EventType, string> = {
  session:        "rgba(155,114,255,0.18)",
  badge:          "rgba(255,209,102,0.18)",
  level:          "rgba(34,197,94,0.18)",
  streak:         "rgba(251,191,36,0.18)",
  skill_mastered: "rgba(34,197,94,0.18)",
  skill_started:  "rgba(56,189,248,0.18)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday))
    return `Yesterday · ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function sessionToFeedItem(s: RecentSession): FeedItem {
  const skills = s.skillNames.length > 0 ? s.skillNames.join(", ") : "General practice";
  const dur = s.durationMinutes != null ? `${s.durationMinutes} minutes` : null;
  const meta = [dur, skills].filter(Boolean).join(" · ");
  return {
    id: s.sessionId,
    type: "session",
    icon: "🎯",
    title: `Session complete — ${skills}`,
    meta,
    stars: s.starsEarned,
    time: formatTime(s.startedAt),
  };
}

function groupByDay(sessions: RecentSession[]): DayGroup[] {
  const map = new Map<string, FeedItem[]>();
  for (const s of sessions) {
    const label = formatDayLabel(s.startedAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(sessionToFeedItem(s));
  }
  const groups: DayGroup[] = [];
  map.forEach((items, label) => groups.push({ label, items }));
  return groups;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeedEntry({ item }: { item: FeedItem }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "17px",
          flexShrink: 0,
          background: ICON_BG[item.type],
        }}
      >
        {item.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.84rem",
            fontWeight: 700,
            color: TEXT,
            marginBottom: "2px",
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </div>
        {item.meta && (
          <div style={{ fontSize: "0.72rem", color: MUTED, fontWeight: 500 }}>{item.meta}</div>
        )}
        {item.stars !== undefined && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              background: "rgba(155,114,255,0.15)",
              borderRadius: "20px",
              padding: "2px 8px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: VIOLET,
              marginTop: "5px",
            }}
          >
            ⭐ {item.type === "badge" ? `+${item.stars} bonus stars` : `${item.stars} stars earned`}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.28)",
          flexShrink: 0,
          alignSelf: "flex-start",
          marginTop: "2px",
          whiteSpace: "nowrap",
        }}
      >
        {item.time}
      </div>
    </div>
  );
}

function DaySection({ group }: { group: DayGroup }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: MUTED,
          marginBottom: "4px",
          paddingBottom: "6px",
        }}
      >
        {group.label}
      </div>
      {group.items.map((item, i) => (
        <div key={item.id} style={i === group.items.length - 1 ? { borderBottom: "none" } : {}}>
          <FeedEntry item={item} />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentActivityPage() {
  const [groups, setGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const studentId =
      typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
    if (!studentId) {
      setLoading(false);
      return;
    }
    fetch(`/api/parent/activity?studentId=${encodeURIComponent(studentId)}&limit=30`)
      .then((r) => r.json())
      .then((data) => {
        const sessions: RecentSession[] = data.sessions ?? [];
        setGroups(groupByDay(sessions));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibleGroups = showAll ? groups : groups.slice(0, 2);

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: BASE,
          color: TEXT,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: "32px",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Page header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: VIOLET,
                  marginBottom: "4px",
                }}
              >
                Activity Feed
              </div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: TEXT,
                  margin: 0,
                }}
              >
                📋 Recent activity
              </h1>
            </div>
            <button
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: `1.5px solid rgba(155,114,255,0.3)`,
                borderRadius: "10px",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: VIOLET,
                cursor: "pointer",
              }}
            >
              See full history →
            </button>
          </div>

          {/* Privacy note */}
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(56,189,248,0.07)",
              border: "1px solid rgba(56,189,248,0.18)",
              borderRadius: "10px",
              fontSize: "0.75rem",
              color: "rgba(56,189,248,0.8)",
              lineHeight: 1.5,
              marginBottom: "24px",
            }}
          >
            🔒 This feed shows positive milestones only — sessions, badges, levels, and streaks. Wrong-answer details are never shown.
          </div>

          {/* Feed card */}
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: "0.88rem" }}>
                Loading activity…
              </div>
            )}

            {!loading && groups.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🌱</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
                  No sessions yet
                </div>
                <div style={{ fontSize: "0.8rem", color: MUTED }}>
                  Activity will appear here after your child completes their first session.
                </div>
              </div>
            )}

            {!loading && visibleGroups.map((group) => (
              <DaySection key={group.label} group={group} />
            ))}

            {/* Load more / collapse */}
            {!loading && groups.length > 2 && (
              <div
                style={{
                  textAlign: "center",
                  paddingTop: "14px",
                  borderTop: `1px solid ${BORDER}`,
                  marginTop: "4px",
                }}
              >
                <button
                  onClick={() => setShowAll((v) => !v)}
                  style={{
                    background: "transparent",
                    border: `1.5px solid rgba(155,114,255,0.25)`,
                    borderRadius: "10px",
                    padding: "9px 24px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: VIOLET,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                  }}
                >
                  {showAll ? "Show less" : "Load more"}
                </button>
              </div>
            )}
          </div>

          {/* Event legend */}
          <div
            style={{
              marginTop: "24px",
              padding: "18px 20px",
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: MUTED,
                marginBottom: "12px",
              }}
            >
              Event types
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { icon: "🎯", label: "Session complete", bg: ICON_BG.session },
                { icon: "🏅", label: "Badge earned",     bg: ICON_BG.badge   },
                { icon: "⬆️", label: "Level up",          bg: ICON_BG.level   },
                { icon: "🔥", label: "Streak milestone",  bg: ICON_BG.streak  },
                { icon: "⭐", label: "Skill mastered",    bg: ICON_BG.skill_mastered },
                { icon: "🌱", label: "Skill started",     bg: ICON_BG.skill_started  },
              ].map((e) => (
                <div
                  key={e.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 10px",
                    background: e.bg,
                    borderRadius: "20px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: TEXT,
                  }}
                >
                  <span>{e.icon}</span>
                  {e.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
