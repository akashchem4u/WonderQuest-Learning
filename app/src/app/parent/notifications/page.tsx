"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type NotifType = "milestone" | "progress" | "alert" | "weekly";
type FilterTab = "all" | "milestones" | "progress" | "alerts";

type Notification = {
  id: string;
  type: NotifType;
  icon: string;
  title: string;
  body: string;
  timestamp: string;
  group: "today" | "this-week" | "older";
  unread: boolean;
  childName?: string;
  actionLabel?: string;
  actionHref?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Stub data
// ─────────────────────────────────────────────────────────────────────────────

const STUB_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "milestone",
    icon: "🏅",
    title: 'Maya earned "Rhyme Queen" badge!',
    body: "She mastered rhyming sounds all week and hit the mastery threshold. This is a Rare badge — only 9,999 ever awarded. #6,241 of 9,999.",
    timestamp: "8:42 AM",
    group: "today",
    unread: true,
    childName: "Maya",
    actionLabel: "See badge",
    actionHref: "/parent/skills",
  },
  {
    id: "n2",
    type: "milestone",
    icon: "⭐",
    title: "Maya leveled up to Star Explorer!",
    body: "Maya reached Level 2 in the K–1 band. Her XP bar is growing fast. New perks unlocked: extended play hints and a new avatar option.",
    timestamp: "8:43 AM",
    group: "today",
    unread: true,
    childName: "Maya",
    actionLabel: "View progress",
    actionHref: "/parent",
  },
  {
    id: "n3",
    type: "weekly",
    icon: "📊",
    title: "Maya's weekly report is ready",
    body: "Great week! 42 stars, 14 sessions, and a new 5-day streak. Rhyming skills jumped from 76% → 88%. Sight words are the clearest next focus.",
    timestamp: "Sunday 7:00 AM",
    group: "this-week",
    unread: true,
    childName: "Maya",
    actionLabel: "Read report",
    actionHref: "/parent/report",
  },
  {
    id: "n4",
    type: "milestone",
    icon: "🏅",
    title: 'Maya earned "Letter Explorer" badge',
    body: "Awarded for completing 10 letter-sounds sessions. Common badge — unlimited supply. Keep up the great work!",
    timestamp: "Friday 3:15 PM",
    group: "this-week",
    unread: false,
    childName: "Maya",
    actionLabel: "See badge",
    actionHref: "/parent/skills",
  },
  {
    id: "n5",
    type: "progress",
    icon: "🔥",
    title: "Maya hit a 5-day streak!",
    body: "Maya has played every day this week — a new personal record. Consistency like this builds lasting confidence. Keep the momentum going!",
    timestamp: "Thursday 6:00 PM",
    group: "this-week",
    unread: true,
    childName: "Maya",
  },
  {
    id: "n6",
    type: "progress",
    icon: "📈",
    title: "Counting skills up 12 points this week",
    body: "Maya's counting accuracy jumped from 64% to 76% — that's two full levels of growth in one week. Guided sessions are really paying off.",
    timestamp: "Wednesday 4:30 PM",
    group: "this-week",
    unread: false,
    childName: "Maya",
    actionLabel: "See skill detail",
    actionHref: "/parent/skills",
  },
  {
    id: "n7",
    type: "alert",
    icon: "⏰",
    title: "Maya hasn't played in 2 days",
    body: "No sessions since Tuesday — not a big deal, but a short 5-minute visit today could help keep the streak alive and the learning fresh.",
    timestamp: "Thursday 9:00 AM",
    group: "this-week",
    unread: false,
    childName: "Maya",
    actionLabel: "Open family hub",
    actionHref: "/parent",
  },
  {
    id: "n8",
    type: "weekly",
    icon: "📊",
    title: "Maya's weekly report — Week of Mar 10",
    body: "Solid week: 38 stars, 11 sessions, 4-day streak. Letter sounds improved most. Rhyming words are now the focus area to watch.",
    timestamp: "Mar 17, 2026",
    group: "older",
    unread: false,
    childName: "Maya",
    actionLabel: "Read report",
    actionHref: "/parent/report",
  },
  {
    id: "n9",
    type: "milestone",
    icon: "🏆",
    title: 'Maya earned "Quick Counter" trophy',
    body: "Awarded for completing 3 counting sessions in a row without hints. Trophies are permanent achievements — she can always revisit this one.",
    timestamp: "Mar 14, 2026",
    group: "older",
    unread: false,
    childName: "Maya",
    actionLabel: "View trophies",
    actionHref: "/parent/skills",
  },
  {
    id: "n10",
    type: "alert",
    icon: "💬",
    title: "Welcome to WonderQuest!",
    body: "Maya's account is set up and ready. Tap \"Start Playing\" on the family hub to begin her first adventure. We'll send you updates as she grows.",
    timestamp: "Mar 3, 2026",
    group: "older",
    unread: false,
    actionLabel: "Open family hub",
    actionHref: "/parent",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Color helpers
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<NotifType, { icon: string; dot: string; label: string }> = {
  milestone: { icon: "rgba(255,209,102,0.18)", dot: "#ffd166", label: "Milestone" },
  progress:  { icon: "rgba(88,232,193,0.15)",  dot: "#58e8c1", label: "Progress"  },
  alert:     { icon: "rgba(255,123,107,0.15)",  dot: "#ff7b6b", label: "Alert"     },
  weekly:    { icon: "rgba(155,114,255,0.15)",  dot: "#9b72ff", label: "Weekly"    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function NotifItem({
  notif,
  onDismiss,
  onMarkRead,
}: {
  notif: Notification;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  const colors = TYPE_COLORS[notif.type];

  return (
    <div
      onClick={() => onMarkRead(notif.id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        padding: "18px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        cursor: "pointer",
        background: notif.unread ? "rgba(155,114,255,0.05)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {/* Unread dot */}
      {notif.unread && (
        <span
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: colors.dot,
            flexShrink: 0,
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: colors.icon,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.15rem",
          flexShrink: 0,
          border: `1px solid ${colors.dot}30`,
        }}
      >
        {notif.icon}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            font: `${notif.unread ? "700" : "600"} 0.88rem system-ui`,
            color: notif.unread ? "#ffffff" : "rgba(232,228,248,0.85)",
            marginBottom: "4px",
            lineHeight: 1.35,
          }}
        >
          {notif.title}
        </div>
        <div
          style={{
            font: "400 0.8rem/1.5 system-ui",
            color: "rgba(180,170,220,0.75)",
            marginBottom: "6px",
          }}
        >
          {notif.body}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ font: "400 0.7rem system-ui", color: "rgba(155,140,200,0.6)" }}>
            {notif.timestamp}
          </span>
          {notif.childName && (
            <span
              style={{
                font: "600 0.68rem system-ui",
                color: "#9b72ff",
                background: "rgba(155,114,255,0.15)",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              {notif.childName}
            </span>
          )}
          <span
            style={{
              font: "600 0.65rem system-ui",
              color: colors.dot,
              background: `${colors.dot}18`,
              padding: "2px 8px",
              borderRadius: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {colors.label}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {notif.actionLabel && notif.actionHref && (
          <Link
            href={notif.actionHref}
            style={{
              padding: "6px 13px",
              border: "1.5px solid rgba(155,114,255,0.35)",
              borderRadius: "8px",
              font: "500 0.72rem system-ui",
              color: "#9b72ff",
              background: "rgba(155,114,255,0.1)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              textDecoration: "none",
              transition: "all 0.15s",
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
            color: "rgba(155,140,200,0.45)",
            fontSize: "1.1rem",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: "6px",
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

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
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          font: "600 0.7rem system-ui",
          color: "rgba(155,140,200,0.55)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "10px",
          paddingLeft: "2px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        {notifs.map((notif, idx) => (
          <div
            key={notif.id}
            style={
              idx < notifs.length - 1
                ? undefined
                : { borderBottom: "none" }
            }
          >
            <NotifItem
              notif={notif}
              onDismiss={onDismiss}
              onMarkRead={onMarkRead}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth gate (same pattern as parent/page.tsx)
// ─────────────────────────────────────────────────────────────────────────────

type ParentSession = {
  guardian: { id: string; username: string; displayName: string };
};

type AccessMode = "returning" | "new";

function AuthGate({ onAuth }: { onAuth: (session: ParentSession) => void }) {
  const [accessMode, setAccessMode] = useState<AccessMode>("returning");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [childUsername, setChildUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const returningAccessMode = accessMode === "returning";

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
          displayName: returningAccessMode ? "" : displayName,
          childUsername: returningAccessMode ? "" : childUsername,
          relationship: "parent",
          notifyWeekly: true,
          notifyMilestones: true,
        }),
      });
      const payload = (await response.json()) as ParentSession & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Parent access failed.");
      onAuth(payload);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Parent access failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "80px auto",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 32px rgba(100,60,200,0.12)",
        }}
      >
        <div
          style={{
            font: "600 0.68rem system-ui",
            color: "#9b72ff",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "6px",
          }}
        >
          NOTIFICATIONS
        </div>
        <h1
          style={{
            font: "700 1.5rem/1.2 system-ui",
            color: "#ffffff",
            marginBottom: "6px",
          }}
        >
          Sign in to continue
        </h1>
        <p
          style={{
            font: "400 0.84rem system-ui",
            color: "rgba(180,170,220,0.7)",
            marginBottom: "28px",
          }}
        >
          View your WonderQuest updates and milestones.
        </p>

        {/* Mode switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
          {(["returning", "new"] as AccessMode[]).map((mode) => (
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
                border: accessMode === mode ? "2px solid #9b72ff" : "1.5px solid rgba(255,255,255,0.12)",
                background: accessMode === mode ? "rgba(155,114,255,0.15)" : "rgba(255,255,255,0.04)",
                color: accessMode === mode ? "#c4a8ff" : "rgba(180,170,220,0.6)",
                transition: "all 0.15s",
              }}
            >
              <span style={{ display: "block", marginBottom: "2px" }}>
                {mode === "returning" ? "🔐" : "✨"}
              </span>
              {mode === "returning" ? "Existing parent" : "First-time setup"}
              <span style={{ display: "block", font: "400 0.7rem system-ui", marginTop: "2px", color: "rgba(155,140,200,0.5)" }}>
                {mode === "returning" ? "Username + PIN" : "Set name, PIN, link child"}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", font: "600 0.75rem system-ui", color: "rgba(200,190,240,0.7)", marginBottom: "6px" }}>
              Username
            </label>
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="parent username"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1.5px solid rgba(155,114,255,0.3)",
                background: "rgba(255,255,255,0.06)",
                color: "#ffffff",
                font: "400 0.88rem system-ui",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", font: "600 0.75rem system-ui", color: "rgba(200,190,240,0.7)", marginBottom: "6px" }}>
              4-digit PIN
            </label>
            <input
              autoComplete="current-password"
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="0000"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1.5px solid rgba(155,114,255,0.3)",
                background: "rgba(255,255,255,0.06)",
                color: "#ffffff",
                font: "400 0.88rem system-ui",
                outline: "none",
              }}
            />
          </div>
          {!returningAccessMode && (
            <>
              <div>
                <label style={{ display: "block", font: "600 0.75rem system-ui", color: "rgba(200,190,240,0.7)", marginBottom: "6px" }}>
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Parent name"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid rgba(155,114,255,0.3)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#ffffff",
                    font: "400 0.88rem system-ui",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", font: "600 0.75rem system-ui", color: "rgba(200,190,240,0.7)", marginBottom: "6px" }}>
                  Child username
                </label>
                <input
                  value={childUsername}
                  onChange={(e) => setChildUsername(e.target.value)}
                  placeholder="child quest name"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid rgba(155,114,255,0.3)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#ffffff",
                    font: "400 0.88rem system-ui",
                    outline: "none",
                  }}
                />
              </div>
            </>
          )}

          {error && (
            <p style={{ font: "500 0.82rem system-ui", color: "#ff7b6b", background: "rgba(255,123,107,0.1)", border: "1px solid rgba(255,123,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "13px 20px",
              background: "linear-gradient(135deg, #9b72ff, #6030c0)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              font: "700 0.9rem system-ui",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              transition: "all 0.15s",
              marginTop: "4px",
            }}
          >
            {submitting ? "Signing in…" : returningAccessMode ? "Sign in →" : "Create account →"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function ParentNotificationsPage() {
  const [session, setSession] = useState<ParentSession | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [notifications, setNotifications] = useState<Notification[]>(STUB_NOTIFICATIONS);

  // Attempt cookie-based session restore on first mount — same as parent/page.tsx
  useEffect(() => {
    let cancelled = false;
    async function trySessionRestore() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as ParentSession;
        if (cancelled) return;
        setSession(payload);
      } catch {
        // No valid session — show auth gate.
      }
    }
    void trySessionRestore();
    return () => { cancelled = true; };
  }, []);

  function handleDismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "milestones") return n.type === "milestone";
    if (activeFilter === "progress") return n.type === "progress" || n.type === "weekly";
    if (activeFilter === "alerts") return n.type === "alert";
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filterTabs: { key: FilterTab; label: string; icon: string }[] = [
    { key: "all",        label: "All",        icon: "🔔" },
    { key: "milestones", label: "Milestones", icon: "🏅" },
    { key: "progress",   label: "Progress",   icon: "📈" },
    { key: "alerts",     label: "Alerts",     icon: "⚠️" },
  ];

  const groups: { key: Notification["group"]; label: string }[] = [
    { key: "today",     label: "Today" },
    { key: "this-week", label: "This Week" },
    { key: "older",     label: "Older" },
  ];

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <main
        className="page-shell"
        style={{ background: "#100b2e", minHeight: "100vh" }}
      >
        {!session ? (
          <AuthGate onAuth={setSession} />
        ) : (
          <div
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              padding: "40px 24px 80px",
            }}
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "32px" }}>
              <Link
                href="/parent"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  font: "500 0.78rem system-ui",
                  color: "rgba(155,140,200,0.6)",
                  textDecoration: "none",
                  marginBottom: "16px",
                  transition: "color 0.15s",
                }}
              >
                ← Family Hub
              </Link>

              <div
                style={{
                  font: "600 0.68rem system-ui",
                  color: "#9b72ff",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: "6px",
                }}
              >
                NOTIFICATIONS
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h1
                    style={{
                      font: "700 1.9rem/1.15 system-ui",
                      color: "#ffffff",
                      margin: 0,
                    }}
                  >
                    Updates from WonderQuest
                  </h1>
                  {unreadCount > 0 && (
                    <p
                      style={{
                        font: "400 0.82rem system-ui",
                        color: "rgba(155,140,200,0.6)",
                        marginTop: "4px",
                      }}
                    >
                      {unreadCount} unread
                    </p>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      padding: "9px 16px",
                      background: "rgba(155,114,255,0.12)",
                      border: "1.5px solid rgba(155,114,255,0.3)",
                      borderRadius: "10px",
                      font: "600 0.78rem system-ui",
                      color: "#9b72ff",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                      flexShrink: 0,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* ── Filter tabs ──────────────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "28px",
                flexWrap: "wrap",
              }}
            >
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.key;
                const tabUnread =
                  tab.key === "all"
                    ? unreadCount
                    : notifications.filter((n) => {
                        if (tab.key === "milestones") return n.type === "milestone" && n.unread;
                        if (tab.key === "progress") return (n.type === "progress" || n.type === "weekly") && n.unread;
                        if (tab.key === "alerts") return n.type === "alert" && n.unread;
                        return false;
                      }).length;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: isActive ? "1.5px solid #9b72ff" : "1.5px solid rgba(255,255,255,0.1)",
                      background: isActive ? "rgba(155,114,255,0.18)" : "rgba(255,255,255,0.04)",
                      font: "600 0.8rem system-ui",
                      color: isActive ? "#c4a8ff" : "rgba(180,170,220,0.55)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tabUnread > 0 && (
                      <span
                        style={{
                          display: "inline-block",
                          background: isActive ? "#9b72ff" : "rgba(155,114,255,0.4)",
                          color: "#ffffff",
                          font: "700 0.6rem system-ui",
                          padding: "1px 6px",
                          borderRadius: "8px",
                          lineHeight: 1.6,
                        }}
                      >
                        {tabUnread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Notification list ────────────────────────────────────────── */}
            {filtered.length === 0 ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "56px 40px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
                <div style={{ font: "700 1.15rem system-ui", color: "#ffffff", marginBottom: "8px" }}>
                  All caught up!
                </div>
                <div style={{ font: "400 0.85rem/1.6 system-ui", color: "rgba(155,140,200,0.6)", maxWidth: "340px", margin: "0 auto 24px" }}>
                  No notifications in this category right now. We'll let you know when Maya earns a badge, levels up, or has a report ready.
                </div>
                <Link
                  href="/parent"
                  style={{
                    display: "inline-block",
                    padding: "10px 22px",
                    background: "linear-gradient(135deg, #9b72ff, #6030c0)",
                    color: "#ffffff",
                    borderRadius: "10px",
                    font: "600 0.85rem system-ui",
                    textDecoration: "none",
                  }}
                >
                  Back to Family Hub →
                </Link>
              </div>
            ) : (
              groups.map(({ key, label }) => {
                const groupNotifs = filtered.filter((n) => n.group === key);
                return (
                  <DayGroup
                    key={key}
                    label={label}
                    notifs={groupNotifs}
                    onDismiss={handleDismiss}
                    onMarkRead={handleMarkRead}
                  />
                );
              })
            )}

            {/* ── Privacy footer ───────────────────────────────────────────── */}
            <div
              style={{
                marginTop: "16px",
                padding: "14px 18px",
                background: "rgba(155,114,255,0.08)",
                borderRadius: "12px",
                border: "1px solid rgba(155,114,255,0.2)",
                font: "400 0.76rem/1.5 system-ui",
                color: "rgba(180,170,220,0.6)",
              }}
            >
              🔒 <strong style={{ color: "rgba(200,190,240,0.75)" }}>Privacy note:</strong> Notification content never reveals specific wrong answers or details that could embarrass your child. We celebrate what they've achieved, not what they're building toward.
            </div>
          </div>
        )}
      </main>
    </AppFrame>
  );
}
