"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const VIOLET  = "#9b72ff";
const GOLD    = "#ffd166";
const MINT    = "#22c55e";
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

// ─── Stub data ────────────────────────────────────────────────────────────────

const FEED_DATA: DayGroup[] = [
  {
    label: "Today",
    items: [
      {
        id: "f1",
        type: "badge",
        icon: "🏅",
        title: 'Earned "Word Wizard" badge',
        meta: "Mastered 20 sight words in a row",
        stars: 3,
        time: "3:42 PM",
      },
      {
        id: "f2",
        type: "session",
        icon: "🎯",
        title: "Session complete — Reading & Spelling",
        meta: "18 minutes · Sight words + CVC spelling",
        stars: 9,
        time: "3:22 PM",
      },
    ],
  },
  {
    label: "Yesterday · Mon Mar 23",
    items: [
      {
        id: "f3",
        type: "level",
        icon: "⬆️",
        title: "Reached Level 5!",
        meta: "Mint Band · Unlocked harder spelling challenges",
        time: "4:55 PM",
      },
      {
        id: "f4",
        type: "session",
        icon: "🎯",
        title: "Session complete — Math",
        meta: "14 minutes · Addition facts + Skip counting",
        stars: 7,
        time: "4:40 PM",
      },
      {
        id: "f5",
        type: "skill_started",
        icon: "🌱",
        title: "Started learning: Skip counting",
        meta: "New Math skill unlocked",
        time: "4:41 PM",
      },
    ],
  },
  {
    label: "Sun Mar 22",
    items: [
      {
        id: "f6",
        type: "streak",
        icon: "🔥",
        title: "5-day streak milestone!",
        meta: "Maya has played 5 days in a row",
        time: "5:10 PM",
      },
      {
        id: "f7",
        type: "session",
        icon: "🎯",
        title: "Session complete — Vocabulary",
        meta: "12 minutes · Rhyming words",
        stars: 5,
        time: "5:00 PM",
      },
    ],
  },
  {
    label: "Sat Mar 21",
    items: [
      {
        id: "f8",
        type: "skill_mastered",
        icon: "⭐",
        title: "Mastered: Rhyming words",
        meta: "Reading skill — Strong status reached",
        time: "11:14 AM",
      },
      {
        id: "f9",
        type: "session",
        icon: "🎯",
        title: "Session complete — Reading",
        meta: "16 minutes · Rhyming words + Letter sounds",
        stars: 8,
        time: "11:00 AM",
      },
    ],
  },
];

// ─── Icon background map ──────────────────────────────────────────────────────

const ICON_BG: Record<EventType, string> = {
  session:        "rgba(155,114,255,0.18)",
  badge:          "rgba(255,209,102,0.18)",
  level:          "rgba(34,197,94,0.18)",
  streak:         "rgba(251,191,36,0.18)",
  skill_mastered: "rgba(34,197,94,0.18)",
  skill_started:  "rgba(56,189,248,0.18)",
};

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
  const [showAll, setShowAll] = useState(false);

  const visibleGroups = showAll ? FEED_DATA : FEED_DATA.slice(0, 2);

  return (
    <AppFrame audience="parent">
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
                📋 Maya's recent activity
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
            {visibleGroups.map((group) => (
              <DaySection key={group.label} group={group} />
            ))}

            {/* Load more / collapse */}
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
