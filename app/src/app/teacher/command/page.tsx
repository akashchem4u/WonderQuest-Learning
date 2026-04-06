"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  red: "#ff7b6b",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface RosterStudent {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  totalPoints: number;
  sessionsLast7d: number;
  streak: number;
  inInterventionQueue: boolean;
  lastSessionAt: string | null;
}

// ── Quick-action config ───────────────────────────────────────────────────────
const QUICK_ACTIONS: {
  key: string;
  label: string;
  href: string;
  icon: string;
  accent: string;
  comingSoon?: boolean;
}[] = [
  { key: "R", label: "View roster",            href: "/teacher/class",                  icon: "👥", accent: C.blue },
  { key: "A", label: "Create assignment",       href: "/teacher/assignment",             icon: "✏️", accent: C.mint },
  { key: "I", label: "Review interventions",    href: "/teacher/intervention-overview",  icon: "⚠️", accent: C.amber },
  { key: "S", label: "Check skill mastery",     href: "/teacher/skill-mastery",          icon: "📊", accent: C.violet },
  { key: "E", label: "Export class data",       href: "#",                               icon: "📤", accent: C.muted, comingSoon: true },
];

const TIPS = [
  "💡 Tip: Check the Watchlist daily for students who need attention",
  "💡 Tip: Share your class code with parents to grow your roster",
  "💡 Tip: Assign targeted quests to students struggling with specific skills",
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TeacherCommandPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(!!getTeacherId());
  }, []);

  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [interventionCount, setInterventionCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;
    const teacherId = getTeacherId();
    if (!teacherId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`).then((r) =>
        r.ok ? r.json() : { roster: [] }
      ),
      fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}`).then((r) =>
        r.ok ? r.json() : {}
      ),
      fetch(`/api/teacher/assignments?teacherId=${encodeURIComponent(teacherId)}`).then((r) =>
        r.ok ? r.json() : {}
      ),
    ])
      .then(([classData, interventionData, assignmentData]) => {
        if (classData?.roster) setRoster(classData.roster);

        const ivList: unknown[] =
          interventionData?.interventions ??
          interventionData?.items ??
          (Array.isArray(interventionData) ? interventionData : []);
        setInterventionCount(ivList.length);

        const asList: unknown[] =
          assignmentData?.assignments ??
          assignmentData?.items ??
          (Array.isArray(assignmentData) ? assignmentData : []);
        setAssignmentCount(asList.length);
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setLoading(false));
  }, [authed]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalStudents = roster.length;
  const activeToday = roster.filter((s) => {
    if (!s.lastSessionAt) return false;
    return Date.now() - new Date(s.lastSessionAt).getTime() < 24 * 60 * 60 * 1000;
  }).length;

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      )
        return;

      const action = QUICK_ACTIONS.find(
        (a) => a.key.toLowerCase() === e.key.toLowerCase()
      );
      if (!action) return;

      if (action.comingSoon) {
        setToastMsg("Coming soon");
        setTimeout(() => setToastMsg(null), 2000);
        return;
      }
      window.location.href = action.href;
    },
    []
  );

  useEffect(() => {
    if (!authed) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [authed, handleKeyDown]);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/command">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
          }}
        >
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/command">
      <div
        style={{
          fontFamily: "system-ui,-apple-system,sans-serif",
          color: C.text,
          minHeight: "100vh",
          padding: "28px 28px 60px",
          maxWidth: 860,
        }}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              color: C.muted,
              marginBottom: 4,
            }}
          >
            Power user view
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>
            🎛️ Command Centre
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 5 }}>
            Quick access to everything. Use keyboard shortcuts to navigate.
          </p>
        </div>

        {/* ── Compact stat row ──────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Students", val: loading ? "…" : String(totalStudents), accent: C.blue },
            { label: "Active today", val: loading ? "…" : String(activeToday), accent: C.mint },
            { label: "Interventions", val: loading ? "…" : String(interventionCount), accent: C.amber },
            { label: "Assignments", val: loading ? "…" : String(assignmentCount), accent: C.violet },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderTop: `3px solid ${s.accent}`,
                borderRadius: 12,
                padding: "14px 20px",
                flex: 1,
                minWidth: 100,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: C.text }}>{s.val}</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Command palette ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              margin: "0 0 12px",
            }}
          >
            Quick Actions
          </h2>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {QUICK_ACTIONS.map((action, i) => {
              const isLast = i === QUICK_ACTIONS.length - 1;
              return action.comingSoon ? (
                <div
                  key={action.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: isLast ? "none" : `1px solid ${C.border}`,
                    opacity: 0.5,
                    cursor: "not-allowed",
                  }}
                >
                  <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>
                    {action.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.muted,
                    }}
                  >
                    {action.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.amber,
                      background: "rgba(245,158,11,0.12)",
                      padding: "2px 8px",
                      borderRadius: 6,
                      marginRight: 8,
                    }}
                  >
                    COMING SOON
                  </span>
                  <kbd
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 28,
                      height: 28,
                      borderRadius: 7,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.05)",
                      fontSize: 12,
                      fontWeight: 800,
                      color: C.muted,
                      fontFamily: "system-ui",
                    }}
                  >
                    {action.key}
                  </kbd>
                </div>
              ) : (
                <Link
                  key={action.key}
                  href={action.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: isLast ? "none" : `1px solid ${C.border}`,
                    textDecoration: "none",
                    transition: "background .14s",
                  }}
                >
                  <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>
                    {action.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 700,
                      color: action.accent,
                    }}
                  >
                    {action.label}
                  </span>
                  <kbd
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 28,
                      height: 28,
                      borderRadius: 7,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.06)",
                      fontSize: 12,
                      fontWeight: 800,
                      color: C.muted,
                      fontFamily: "system-ui",
                    }}
                  >
                    {action.key}
                  </kbd>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Teacher tips ──────────────────────────────────────────────────── */}
        <div>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              margin: "0 0 12px",
            }}
          >
            Shortcuts &amp; Tips
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {TIPS.map((tip, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 18px",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${C.violet}`,
                  borderRadius: 12,
                  fontSize: 13,
                  color: C.text,
                  lineHeight: 1.5,
                }}
              >
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer nav ────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 32 }}>
          {[
            { href: "/teacher/home",    label: "← Home" },
            { href: "/teacher",         label: "Dashboard" },
            { href: "/teacher/class",   label: "Full Roster" },
            { href: "/teacher/support", label: "Support Queue" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.violet,
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── Toast ─────────────────────────────────────────────────────────── */}
        {toastMsg && (
          <div
            style={{
              position: "fixed",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(30,30,50,0.96)",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px 22px",
              fontSize: 13,
              fontWeight: 700,
              color: C.text,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
          >
            {toastMsg}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
