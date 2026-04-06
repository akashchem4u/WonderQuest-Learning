"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const VIOLET  = "#9b72ff";
const MINT    = "#58e8c1";
const GOLD    = "#ffd166";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(255,255,255,0.5)";
const SURFACE = "rgba(255,255,255,0.04)";
const BORDER  = "rgba(255,255,255,0.06)";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = "badge" | "levelup" | "weekly" | "streak" | "session" | "system";
type MainTab   = "all" | "badges" | "settings" | "empty";

type Notification = {
  id: string;
  type: NotifType;
  icon: string;
  title: string;
  body: string;
  timestamp: string;
  createdAt?: string;
  group: "today" | "this-week" | "older";
  unread: boolean;
  childName?: string;
  actionLabel?: string;
  actionHref?: string;
};

// ─── API helpers ──────────────────────────────────────────────────────────────

type ApiSession = {
  sessionId: string;
  startedAt: string;
  sessionMode: string;
  starsEarned: number;
  correctCount: number;
  totalQuestions: number;
  durationMinutes: number | null;
  skillNames: string[];
};

type ApiNotification = {
  id: string;
  type: string;
  title: string;
  description: string;
  value: string | null;
  read: boolean;
  createdAt: string;
};

function sessionToNotification(s: ApiSession, idx: number): Notification {
  const date = new Date(s.startedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400_000);

  let group: Notification["group"] = "older";
  if (diffDays === 0) group = "today";
  else if (diffDays <= 6) group = "this-week";

  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateLabel =
    diffDays === 0
      ? timeLabel
      : diffDays <= 6
        ? date.toLocaleDateString("en-US", { weekday: "short" }) + " " + timeLabel
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const skillList =
    s.skillNames.length > 0
      ? s.skillNames.slice(0, 3).join(", ")
      : s.sessionMode;

  const accuracy =
    s.totalQuestions > 0 ? Math.round((s.correctCount / s.totalQuestions) * 100) : 0;

  const durationStr =
    s.durationMinutes != null ? ` · ${s.durationMinutes}m` : "";

  return {
    id: `session-${s.sessionId}-${idx}`,
    type: "session",
    icon: "🎯",
    title: `Session completed${s.starsEarned > 0 ? ` — ⭐ ${s.starsEarned} stars` : ""}`,
    body: `${skillList} · ${accuracy}% accuracy · ${s.correctCount}/${s.totalQuestions} correct${durationStr}`,
    timestamp: dateLabel,
    createdAt: s.startedAt,
    group,
    unread: idx === 0,
    actionLabel: "View skills",
    actionHref: "/parent/skills",
  };
}

function milestoneTypeToNotifType(type: string): NotifType {
  if (type === "level-up") return "levelup";
  if (type === "badge-earned") return "badge";
  if (type === "streak-7" || type === "streak-30") return "streak";
  return "system";
}

function milestoneTypeToIcon(type: string): string {
  if (type === "level-up") return "⭐";
  if (type === "badge-earned") return "🏅";
  if (type === "streak-7" || type === "streak-30") return "🔥";
  if (type === "first-session") return "🎉";
  if (type === "sessions-10" || type === "sessions-50") return "🎯";
  if (type === "skill-mastered") return "🧠";
  return "🔔";
}

function apiNotifToNotification(n: ApiNotification): Notification {
  const date = new Date(n.createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400_000);

  let group: Notification["group"] = "older";
  if (diffDays === 0) group = "today";
  else if (diffDays <= 6) group = "this-week";

  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateLabel =
    diffDays === 0
      ? timeLabel
      : diffDays <= 6
        ? date.toLocaleDateString("en-US", { weekday: "short" }) + " " + timeLabel
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return {
    id: `milestone-${n.id}`,
    type: milestoneTypeToNotifType(n.type),
    icon: milestoneTypeToIcon(n.type),
    title: n.title,
    body: n.description,
    timestamp: dateLabel,
    createdAt: n.createdAt,
    group,
    unread: !n.read,
    actionLabel: n.type === "level-up" || n.type === "badge-earned" ? "View dashboard" : undefined,
    actionHref: n.type === "level-up" || n.type === "badge-earned" ? "/parent" : undefined,
  };
}

// ─── Seed notifications (badge/levelup/system items not from API) ─────────────

const STUB: Notification[] = [
  {
    id: "n1",
    type: "badge",
    icon: "🏅",
    title: 'Maya earned "Rhyme Queen" badge!',
    body: "She's been working on rhyming sounds all week and finally reached the mastery threshold. This is a Rare badge — only 9,999 ever awarded.",
    timestamp: "8:42 AM",
    group: "today",
    unread: true,
    childName: "Maya",
    actionLabel: "See badge",
    actionHref: "/parent/skills",
  },
  {
    id: "n2",
    type: "levelup",
    icon: "⭐",
    title: "Maya leveled up to Star Explorer!",
    body: "Maya reached Level 2 in the K–1 band! Her XP bar is growing fast. New perks unlocked: extended play hints and a new avatar option.",
    timestamp: "8:43 AM",
    group: "today",
    unread: true,
    childName: "Maya",
    actionLabel: "View dashboard",
    actionHref: "/parent",
  },
  {
    id: "n3",
    type: "weekly",
    icon: "📊",
    title: "Maya's weekly report is ready",
    body: "Great week! 42 stars, 14 sessions, and a new 5-day streak. Rhyming skills jumped from 76% → 88%.",
    timestamp: "Sunday 7:00 AM",
    group: "this-week",
    unread: true,
    childName: "Maya",
    actionLabel: "Read report",
    actionHref: "/parent/report",
  },
  {
    id: "n4",
    type: "badge",
    icon: "🏅",
    title: 'Maya earned "Letter Explorer" badge',
    body: "Awarded for completing 10 letter-sounds sessions. Common badge — unlimited supply.",
    timestamp: "Friday 3:15 PM",
    group: "this-week",
    unread: false,
    childName: "Maya",
    actionLabel: "See badge",
    actionHref: "/parent/skills",
  },
  {
    id: "n5",
    type: "streak",
    icon: "🔥",
    title: "Maya hit a 5-day streak!",
    body: "Maya has played every day this week — a new personal record. Keep the momentum going!",
    timestamp: "Thursday 6:00 PM",
    group: "this-week",
    unread: true,
    childName: "Maya",
  },
  {
    id: "n6",
    type: "system",
    icon: "💬",
    title: "Welcome to WonderQuest!",
    body: "Maya's account is set up and ready. Tap \"Start Playing\" on the dashboard to begin her first adventure.",
    timestamp: "March 17, 2026",
    group: "older",
    unread: false,
  },
];

// ─── Deep-link routing per notification type ─────────────────────────────────

function getNotificationLink(notif: Notification): string | null {
  const type = notif.type ?? "";
  switch (type) {
    case "session":
      return "/parent/activity";
    case "badge":
    case "levelup":
      return "/parent/activity";
    case "weekly":
      return "/parent/report";
    case "streak":
      return "/parent/report";
    case "system":
      return null;
    default:
      return null;
  }
}

// ─── Time-ago helper ──────────────────────────────────────────────────────────

function formatTimeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Icon background by type ──────────────────────────────────────────────────

const TYPE_BG: Record<NotifType, string> = {
  badge:   "rgba(255,209,102,0.15)",
  levelup: "rgba(155,114,255,0.15)",
  weekly:  "rgba(88,232,193,0.12)",
  streak:  "rgba(255,123,107,0.12)",
  session: "rgba(255,255,255,0.06)",
  system:  "rgba(255,255,255,0.06)",
};

const TYPE_DOT: Record<NotifType, string> = {
  badge:   GOLD,
  levelup: VIOLET,
  weekly:  MINT,
  streak:  "#ff7b6b",
  session: MUTED,
  system:  MUTED,
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: on ? VIOLET : "rgba(255,255,255,0.12)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: on ? 20 : 2,
          top: 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          display: "block",
        }}
      />
    </button>
  );
}

// ─── Notif item ───────────────────────────────────────────────────────────────

function NotifItem({
  notif,
  onDismiss,
  onMarkRead,
}: {
  notif: Notification;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  const deepLink = getNotificationLink(notif);
  const timeAgo = notif.createdAt ? formatTimeAgo(notif.createdAt) : notif.timestamp;

  const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "16px 20px",
    borderBottom: `1px solid ${BORDER}`,
    position: "relative",
    cursor: "pointer",
    background: notif.unread ? "rgba(155,114,255,0.09)" : "rgba(255,255,255,0.03)",
    border: notif.unread ? "1px solid rgba(155,114,255,0.22)" : "1px solid rgba(255,255,255,0.06)",
    opacity: notif.unread ? 1 : 0.85,
    transition: "background 0.15s, opacity 0.15s",
    textDecoration: "none",
    color: "inherit",
  };

  const cardInner = (
    <>
      {notif.unread && (
        <span
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: VIOLET,
            flexShrink: 0,
          }}
        />
      )}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: TYPE_BG[notif.type],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          flexShrink: 0,
          border: `1px solid ${TYPE_DOT[notif.type]}30`,
        }}
      >
        {notif.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            font: `${notif.unread ? "700" : "600"} 0.86rem/1.35 system-ui`,
            color: notif.unread ? "#fff" : "rgba(240,246,255,0.8)",
            marginBottom: 3,
          }}
        >
          {notif.title}
        </div>
        <div
          style={{
            font: "400 0.8rem/1.5 system-ui",
            color: "rgba(180,170,220,0.7)",
            marginBottom: 6,
          }}
        >
          {notif.body}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ font: "400 0.7rem system-ui", color: "rgba(155,140,200,0.55)" }}>
            {timeAgo}
          </span>
          {notif.childName && (
            <span
              style={{
                font: "600 0.68rem system-ui",
                color: VIOLET,
                background: "rgba(155,114,255,0.15)",
                padding: "2px 8px",
                borderRadius: 10,
              }}
            >
              {notif.childName}
            </span>
          )}
        </div>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {notif.actionLabel && notif.actionHref && (
          <Link
            href={notif.actionHref}
            style={{
              padding: "5px 12px",
              border: `1.5px solid rgba(155,114,255,0.3)`,
              borderRadius: 8,
              font: "500 0.72rem system-ui",
              color: VIOLET,
              background: "rgba(155,114,255,0.1)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              textDecoration: "none",
            }}
          >
            {notif.actionLabel} →
          </Link>
        )}
        <button
          onClick={() => onDismiss(notif.id)}
          style={{
            border: "none",
            background: "none",
            color: MUTED,
            fontSize: "1.1rem",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 6,
            lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </>
  );

  if (deepLink) {
    return (
      <Link
        href={deepLink}
        onClick={() => onMarkRead(notif.id)}
        style={cardStyle}
      >
        {cardInner}
      </Link>
    );
  }

  return (
    <div
      onClick={() => onMarkRead(notif.id)}
      style={cardStyle}
    >
      {cardInner}
    </div>
  );
}

// ─── Day group ────────────────────────────────────────────────────────────────

function DayGroup({
  label,
  notifs,
  onDismiss,
  onMarkRead,
}: {
  label: string;
  notifs: Notification[];
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  if (notifs.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          font: "600 0.72rem system-ui",
          color: "rgba(155,140,200,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
          paddingLeft: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: SURFACE,
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          overflow: "hidden",
        }}
      >
        {notifs.map((n, idx) => (
          <div
            key={n.id}
            style={idx === notifs.length - 1 ? { borderBottom: "none" } : undefined}
          >
            <NotifItem notif={n} onDismiss={onDismiss} onMarkRead={onMarkRead} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings toggles stub ────────────────────────────────────────────────────

type NotifSetting = {
  id: string;
  icon: string;
  iconBg: string;
  label: string;
  sub: string;
  on: boolean;
};

const INITIAL_SETTINGS: NotifSetting[] = [
  { id: "badge",   icon: "🏅", iconBg: "rgba(255,209,102,0.15)", label: "Earns a badge",           sub: "Any rarity — Common, Rare, Epic, Legendary",        on: true  },
  { id: "levelup", icon: "⭐", iconBg: "rgba(155,114,255,0.15)", label: "Levels up",               sub: "K–1 level milestones (Level 1 → Level 5)",           on: true  },
  { id: "weekly",  icon: "📊", iconBg: "rgba(88,232,193,0.12)",  label: "Weekly report ready",     sub: "Every Sunday morning at 7:00 AM",                    on: true  },
  { id: "session", icon: "🎯", iconBg: SURFACE,                  label: "Completes a session",     sub: "After each individual play session",                  on: false },
  { id: "streak",  icon: "🔥", iconBg: "rgba(255,123,107,0.1)", label: "Hits a streak milestone", sub: "3-day, 7-day, 14-day, 30-day streaks",               on: false },
  { id: "inact",   icon: "💬", iconBg: "rgba(255,209,102,0.1)", label: "Hasn't played in 2+ days", sub: "Gentle reminder — never a guilt-trip message",       on: false },
];

type DeliveryOption = {
  id: string;
  icon: string;
  label: string;
  sub: string;
};

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "email",  icon: "📧", label: "Email",        sub: "Sent to sarah.johnson@email.com. Batched to avoid spam." },
  { id: "inapp",  icon: "🔔", label: "In-app",       sub: "Bell icon in dashboard with badge count."               },
  { id: "push",   icon: "📱", label: "Push (mobile)", sub: "Requires WonderQuest mobile app installed."             },
  { id: "digest", icon: "🔕", label: "Digest only",  sub: "Single weekly summary email instead of individual notifications." },
];

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel() {
  const [settings, setSettings] = useState<NotifSetting[]>(INITIAL_SETTINGS);
  const [delivery, setDelivery] = useState<string[]>(["email", "inapp"]);

  function toggleSetting(id: string) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, on: !s.on } : s)),
    );
  }

  function toggleDelivery(id: string) {
    setDelivery((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }

  return (
    <div>
      {/* Per-type toggles */}
      <div
        style={{
          background: SURFACE,
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          padding: "20px 24px",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            font: "700 0.9rem system-ui",
            color: TEXT,
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          Notify me when Maya…
        </div>
        {settings.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "11px 0",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: s.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: "600 0.84rem system-ui", color: TEXT }}>{s.label}</div>
              <div style={{ font: "400 0.72rem system-ui", color: MUTED }}>{s.sub}</div>
            </div>
            <Toggle on={s.on} onToggle={() => toggleSetting(s.id)} />
          </div>
        ))}
      </div>

      {/* Delivery prefs */}
      <div
        style={{
          background: SURFACE,
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          padding: "20px 24px",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            font: "700 0.9rem system-ui",
            color: TEXT,
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          How to receive notifications
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {DELIVERY_OPTIONS.map((opt) => {
            const selected = delivery.includes(opt.id);
            return (
              <div
                key={opt.id}
                onClick={() => toggleDelivery(opt.id)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `1.5px solid ${selected ? VIOLET : "rgba(255,255,255,0.1)"}`,
                  background: selected ? "rgba(155,114,255,0.1)" : SURFACE,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    font: "700 0.84rem system-ui",
                    color: selected ? TEXT : "rgba(240,246,255,0.7)",
                    marginBottom: 3,
                  }}
                >
                  {opt.icon} {opt.label}
                </div>
                <div
                  style={{
                    font: "400 0.72rem/1.4 system-ui",
                    color: MUTED,
                  }}
                >
                  {opt.sub}
                </div>
                {selected && (
                  <div
                    style={{
                      font: "700 0.72rem system-ui",
                      color: MINT,
                      marginTop: 6,
                    }}
                  >
                    ✓ Enabled
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy note */}
      <div
        style={{
          padding: "14px 18px",
          background: "rgba(155,114,255,0.08)",
          borderRadius: 12,
          border: `1px solid rgba(155,114,255,0.2)`,
          font: "400 0.76rem/1.5 system-ui",
          color: "rgba(180,170,220,0.65)",
        }}
      >
        🔒 <strong style={{ color: "rgba(200,190,240,0.8)" }}>Privacy note:</strong> Notification content never reveals specific wrong answers or details that could embarrass your child. We celebrate what they&apos;ve achieved, not what they&apos;re building toward.
      </div>
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 16px",
        borderRadius: 20,
        border: `1.5px solid ${active ? VIOLET : "rgba(255,255,255,0.1)"}`,
        background: active ? "rgba(155,114,255,0.18)" : SURFACE,
        font: "600 0.8rem system-ui",
        color: active ? "#c4a8ff" : MUTED,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          style={{
            display: "inline-block",
            background: active ? VIOLET : "rgba(155,114,255,0.35)",
            color: "#fff",
            font: "700 0.6rem system-ui",
            padding: "1px 6px",
            borderRadius: 8,
            lineHeight: 1.6,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Main tab bar ─────────────────────────────────────────────────────────────

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        background: "transparent",
        border: "none",
        borderBottom: active ? `2px solid ${VIOLET}` : "2px solid transparent",
        font: `600 0.82rem system-ui`,
        color: active ? "#c4a8ff" : MUTED,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.18s",
        borderRadius: "6px 6px 0 0",
      }}
    >
      {label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentNotificationsPage() {
  const [mainTab, setMainTab]       = useState<MainTab>("all");
  const [filterChip, setFilterChip] = useState<"all" | "badges" | "levelups" | "reports" | "sessions" | "system">("all");
  const [notifications, setNotifs]  = useState<Notification[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(true);

  // Fetch real activity + milestone notifications from API
  useEffect(() => {
    const studentId =
      typeof window !== "undefined"
        ? localStorage.getItem("wq_active_student_id")
        : null;
    if (!studentId) { setNotifsLoading(false); return; }

    const activityFetch = fetch(
      `/api/parent/activity?studentId=${encodeURIComponent(studentId)}&limit=20`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    const notifsFetch = fetch(
      `/api/parent/notifications?studentId=${encodeURIComponent(studentId)}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    Promise.all([activityFetch, notifsFetch]).then(([activityData, notifsData]) => {
      const sessionNotifs: Notification[] =
        activityData?.sessions && Array.isArray(activityData.sessions)
          ? (activityData.sessions as ApiSession[]).map((s, i) => sessionToNotification(s, i))
          : [];

      const milestoneNotifs: Notification[] =
        notifsData?.notifications && Array.isArray(notifsData.notifications)
          ? (notifsData.notifications as ApiNotification[]).map(apiNotifToNotification)
          : [];

      // Milestones first, then sessions; fall back to STUB only if both are empty
      const live = [...milestoneNotifs, ...sessionNotifs];
      setNotifs(live.length > 0 ? live : STUB);
      setNotifsLoading(false);

      // Mark unread milestone notifications as read
      const unreadIds = (notifsData?.notifications as ApiNotification[] | undefined)
        ?.filter((n) => !n.read)
        .map((n) => n.id) ?? [];

      if (unreadIds.length > 0) {
        fetch("/api/parent/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: unreadIds }),
        }).catch(() => {
          // silently ignore mark-as-read errors
        });
      }
    });
  }, []);

  function dismiss(id: string) {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    // For real API notifications (milestone-<uuid>), call individual PATCH endpoint
    if (id.startsWith("milestone-")) {
      const apiId = id.replace(/^milestone-/, "");
      fetch(`/api/parent/notifications/${encodeURIComponent(apiId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }).catch(() => {/* silently ignore */});
    }
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    fetch("/api/parent/notifications/read-all", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    }).catch(() => {/* silently ignore */});
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Filtered list for "All" tab based on chip filter
  function chipFilter(n: Notification) {
    if (filterChip === "all")      return true;
    if (filterChip === "badges")   return n.type === "badge";
    if (filterChip === "levelups") return n.type === "levelup";
    if (filterChip === "reports")  return n.type === "weekly";
    if (filterChip === "sessions") return n.type === "session";
    if (filterChip === "system")   return n.type === "system" || n.type === "streak";
    return true;
  }

  // Filtered list for "Badges" tab
  const badgeNotifs = notifications.filter((n) => n.type === "badge");

  const GROUPS: { key: Notification["group"]; label: string }[] = [
    { key: "today",     label: "Today · April 6" },
    { key: "this-week", label: "This Week"        },
    { key: "older",     label: "Older"            },
  ];

  function renderNotifList(list: Notification[]) {
    if (list.length === 0) {
      return (
        <div
          style={{
            background: SURFACE,
            borderRadius: 20,
            border: `1px solid ${BORDER}`,
            padding: "56px 40px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
          <div style={{ font: "700 1.15rem system-ui", color: TEXT, marginBottom: 8 }}>All caught up!</div>
          <div style={{ font: "400 0.85rem/1.6 system-ui", color: MUTED, maxWidth: 340, margin: "0 auto 24px" }}>
            You have no notifications in this category right now. We&apos;ll let you know when Maya earns a badge, levels up, or has a weekly report ready.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/parent"
              style={{
                padding: "10px 20px",
                background: `linear-gradient(135deg, ${VIOLET}, #5a30d0)`,
                color: "#fff",
                borderRadius: 10,
                font: "600 0.85rem system-ui",
                textDecoration: "none",
              }}
            >
              View Maya&apos;s dashboard →
            </Link>
            <button
              onClick={() => setMainTab("settings")}
              style={{
                padding: "10px 20px",
                background: SURFACE,
                border: `1.5px solid rgba(255,255,255,0.12)`,
                borderRadius: 10,
                font: "600 0.82rem system-ui",
                color: MUTED,
                cursor: "pointer",
              }}
            >
              Notification settings
            </button>
          </div>
        </div>
      );
    }
    return GROUPS.map(({ key, label }) => (
      <DayGroup
        key={key}
        label={label}
        notifs={list.filter((n) => n.group === key)}
        onDismiss={dismiss}
        onMarkRead={markRead}
      />
    ));
  }

  return (
    <AppFrame audience="parent" currentPath="/parent/notifications">
      <main style={{ background: BASE, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {/* ── Tab bar ── */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "14px 24px 0",
            borderBottom: `1px solid ${BORDER}`,
            background: "rgba(255,255,255,0.02)",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <TabBtn label="🔔 All"          active={mainTab === "all"}      onClick={() => setMainTab("all")}      />
          <TabBtn label="🏅 Badges"       active={mainTab === "badges"}   onClick={() => setMainTab("badges")}   />
          <TabBtn label="⚙️ Settings"     active={mainTab === "settings"} onClick={() => setMainTab("settings")} />
          <TabBtn label="📭 Empty"        active={mainTab === "empty"}    onClick={() => setMainTab("empty")}    />
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* ── Back nav ── */}
          <Link
            href="/parent"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              font: "500 0.78rem system-ui",
              color: MUTED,
              textDecoration: "none",
              marginBottom: 20,
              transition: "color 0.15s",
            }}
          >
            ← Home
          </Link>

          {/* ══ ALL TAB ═══════════════════════════════════════════════════════ */}
          {mainTab === "all" && (
            <>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                <div>
                  <h1 style={{ font: "700 1.6rem/1.2 system-ui", color: TEXT, margin: 0 }}>
                    🔔 Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <div style={{ font: "400 0.82rem system-ui", color: MUTED, marginTop: 4 }}>
                      {unreadCount} unread
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        padding: "8px 16px",
                        background: SURFACE,
                        border: `1.5px solid rgba(155,114,255,0.3)`,
                        borderRadius: 8,
                        font: "600 0.78rem system-ui",
                        color: VIOLET,
                        cursor: "pointer",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setMainTab("settings")}
                    style={{
                      padding: "8px 14px",
                      background: "rgba(155,114,255,0.12)",
                      border: "none",
                      borderRadius: 8,
                      font: "600 0.78rem system-ui",
                      color: "#c4a8ff",
                      cursor: "pointer",
                    }}
                  >
                    ⚙️ Notification settings
                  </button>
                </div>
              </div>

              {/* Filter chips */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                <FilterChip label="All"        count={unreadCount}                                                                      active={filterChip === "all"}      onClick={() => setFilterChip("all")}      />
                <FilterChip label="🏅 Badges"  count={notifications.filter((n) => n.type === "badge"   && n.unread).length || undefined} active={filterChip === "badges"}   onClick={() => setFilterChip("badges")}   />
                <FilterChip label="⭐ Level-ups" count={notifications.filter((n) => n.type === "levelup" && n.unread).length || undefined} active={filterChip === "levelups"} onClick={() => setFilterChip("levelups")} />
                <FilterChip label="📊 Reports"  count={notifications.filter((n) => n.type === "weekly"  && n.unread).length || undefined} active={filterChip === "reports"}  onClick={() => setFilterChip("reports")}  />
                <FilterChip label="🎯 Sessions"                                                                                           active={filterChip === "sessions"} onClick={() => setFilterChip("sessions")} />
                <FilterChip label="💬 System"                                                                                             active={filterChip === "system"}   onClick={() => setFilterChip("system")}   />
              </div>

              {renderNotifList(notifications.filter(chipFilter))}
            </>
          )}

          {/* ══ BADGES TAB ════════════════════════════════════════════════════ */}
          {mainTab === "badges" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                <div>
                  <h1 style={{ font: "700 1.6rem/1.2 system-ui", color: TEXT, margin: 0 }}>
                    🏅 Badge Notifications
                  </h1>
                  <div style={{ font: "400 0.82rem system-ui", color: MUTED, marginTop: 4 }}>
                    {badgeNotifs.filter((n) => n.unread).length} unread · {badgeNotifs.length} total
                  </div>
                </div>
                {badgeNotifs.some((n) => n.unread) && (
                  <button
                    onClick={markAllRead}
                    style={{
                      padding: "8px 16px",
                      background: SURFACE,
                      border: `1.5px solid rgba(155,114,255,0.3)`,
                      borderRadius: 8,
                      font: "600 0.78rem system-ui",
                      color: VIOLET,
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                <FilterChip label="All"       active={false} onClick={() => setMainTab("all")} />
                <FilterChip label="🏅 Badges" count={badgeNotifs.filter((n) => n.unread).length || undefined} active={true}  onClick={() => {}} />
                <FilterChip label="⭐ Level-ups" active={false} onClick={() => { setMainTab("all"); setFilterChip("levelups"); }} />
                <FilterChip label="📊 Reports"   active={false} onClick={() => { setMainTab("all"); setFilterChip("reports");  }} />
              </div>

              {renderNotifList(badgeNotifs)}
            </>
          )}

          {/* ══ SETTINGS TAB ══════════════════════════════════════════════════ */}
          {mainTab === "settings" && (
            <>
              <h1 style={{ font: "700 1.6rem/1.2 system-ui", color: TEXT, margin: "0 0 24px" }}>
                ⚙️ Notification Settings
              </h1>
              <SettingsPanel />
            </>
          )}

          {/* ══ EMPTY TAB ═════════════════════════════════════════════════════ */}
          {mainTab === "empty" && (
            <>
              <h1 style={{ font: "700 1.6rem/1.2 system-ui", color: TEXT, margin: "0 0 24px" }}>
                🔔 Notifications
              </h1>
              <div
                style={{
                  background: SURFACE,
                  borderRadius: 20,
                  border: `1px solid ${BORDER}`,
                  padding: "56px 40px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
                <div style={{ font: "700 1.2rem system-ui", color: TEXT, marginBottom: 8 }}>All caught up!</div>
                <div
                  style={{
                    font: "400 0.85rem/1.6 system-ui",
                    color: MUTED,
                    maxWidth: 380,
                    margin: "0 auto 24px",
                  }}
                >
                  You have no new notifications. We&apos;ll let you know when Maya earns a badge, levels up, or has a weekly report ready.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <Link
                    href="/parent"
                    style={{
                      padding: "10px 20px",
                      background: `linear-gradient(135deg, ${VIOLET}, #5a30d0)`,
                      color: "#fff",
                      borderRadius: 10,
                      font: "600 0.85rem system-ui",
                      textDecoration: "none",
                    }}
                  >
                    View Maya&apos;s dashboard →
                  </Link>
                  <button
                    onClick={() => setMainTab("settings")}
                    style={{
                      padding: "10px 20px",
                      background: SURFACE,
                      border: `1.5px solid rgba(255,255,255,0.12)`,
                      borderRadius: 10,
                      font: "600 0.82rem system-ui",
                      color: MUTED,
                      cursor: "pointer",
                    }}
                  >
                    Notification settings
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </AppFrame>
  );
}
