"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "#1a2133",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  red: "#ff7b6b",
};

// ── Types ────────────────────────────────────────────────────────────────────
type RosterStudent = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  sessionsLast7d: number;
  correctLast7d: number;
  totalLast7d: number;
  lastSessionAt: string | null;
  inInterventionQueue: boolean;
  streak: number;
};

type Intervention = {
  id: string;
  status: string;
};

type Assignment = {
  id: string;
  status?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

// ── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  accent,
  icon,
}: {
  value: string;
  label: string;
  accent: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "20px 20px 16px",
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${accent}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ActionButton({
  emoji,
  label,
  href,
  accent,
}: {
  emoji: string;
  label: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "22px 16px",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        textDecoration: "none",
        transition: "all .18s",
      }}
    >
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: accent,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TeacherHomePage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(!!getTeacherId());
  }, []);

  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

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
      fetch(`/api/teacher/profile?teacherId=${encodeURIComponent(teacherId)}`).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([classData, interventionData, assignmentData, profileData]) => {
        const cd = classData as { roster?: RosterStudent[] };
        if (cd?.roster) setRoster(cd.roster);

        const iv = interventionData as Record<string, unknown>;
        const ivList: Intervention[] = (
          (iv?.interventions as Intervention[] | undefined) ??
          (iv?.items as Intervention[] | undefined) ??
          (Array.isArray(interventionData) ? (interventionData as Intervention[]) : [])
        );
        setInterventions(ivList);

        const as_ = assignmentData as Record<string, unknown>;
        const asList: Assignment[] = (
          (as_?.assignments as Assignment[] | undefined) ??
          (as_?.items as Assignment[] | undefined) ??
          (Array.isArray(assignmentData) ? (assignmentData as Assignment[]) : [])
        );
        setAssignments(asList);

        const pd = profileData as { profile?: { displayName?: string } } | null;
        const name = pd?.profile?.displayName;
        if (name && name !== "Teacher") setTeacherName(name);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [authed]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalStudents = roster.length;
  const nowMs = Date.now();
  const activeToday = roster.filter((s) => {
    if (!s.lastSessionAt) return false;
    return nowMs - new Date(s.lastSessionAt).getTime() < 24 * 60 * 60 * 1000;
  }).length;

  const activeInterventions = interventions.filter(
    (i) => i.status === "active" || i.status === "open" || i.status === "pending"
  ).length;

  const pendingAssignments = assignments.filter(
    (a) => !a.status || a.status === "active" || a.status === "pending"
  ).length;

  // ── Recent activity feed ───────────────────────────────────────────────────
  const recentActivity = [...roster]
    .filter((s) => s.lastSessionAt)
    .sort(
      (a, b) =>
        new Date(b.lastSessionAt!).getTime() - new Date(a.lastSessionAt!).getTime()
    )
    .slice(0, 5)
    .map((s) => {
      const ago = timeAgo(s.lastSessionAt!);
      const hadStreak = s.streak > 1;
      return {
        studentId: s.studentId,
        name: s.displayName,
        text: hadStreak
          ? `${s.displayName} is on a ${s.streak}-day streak`
          : `${s.displayName} played ${ago}`,
        ago,
        icon: hadStreak ? "🔥" : "🎮",
      };
    });

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/home">
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

  const greeting = getGreeting();

  return (
    <AppFrame audience="teacher" currentPath="/teacher/home">
      <div
        style={{
          fontFamily: "system-ui,-apple-system,sans-serif",
          color: C.text,
          minHeight: "100vh",
          padding: "28px 28px 60px",
          maxWidth: 960,
        }}
      >
        {/* ── Greeting header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 4,
            }}
          >
            Morning Briefing
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>
            {greeting}
            {teacherName ? `, ${teacherName}` : ""} 👋
          </h1>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>
            {loading
              ? "Loading class…"
              : `You have ${totalStudents} student${totalStudents === 1 ? "" : "s"} on your roster.`}
          </p>
        </div>

        {/* ── Error banner ──────────────────────────────────────────────────── */}
        {fetchError && (
          <div
            style={{
              background: "rgba(255,123,107,0.1)",
              border: "1px solid rgba(255,123,107,0.3)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 22,
              fontSize: 13,
              color: C.red,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ⚠️ Couldn&apos;t load some class data.{" "}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "none",
                border: "none",
                color: C.red,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "system-ui",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Quick stats ───────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <StatCard
            value={loading ? "…" : String(totalStudents)}
            label="Total students"
            accent={C.blue}
            icon="👥"
          />
          <StatCard
            value={loading ? "…" : String(activeToday)}
            label="Active today"
            accent={C.mint}
            icon="🟢"
          />
          <StatCard
            value={loading ? "…" : String(activeInterventions)}
            label="Active interventions"
            accent={C.amber}
            icon="⚠️"
          />
          <StatCard
            value={loading ? "…" : String(pendingAssignments)}
            label="Pending assignments"
            accent={C.violet}
            icon="📋"
          />
        </div>

        {/* ── Quick actions ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 12,
            }}
          >
            Quick Actions
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
            }}
          >
            <ActionButton
              emoji="📋"
              label="View class roster"
              href="/teacher/class"
              accent={C.blue}
            />
            <ActionButton
              emoji="📊"
              label="Check student reports"
              href="/teacher/skill-mastery"
              accent={C.violet}
            />
            <ActionButton
              emoji="⚠️"
              label="Review interventions"
              href="/teacher/intervention-overview"
              accent={C.amber}
            />
            <ActionButton
              emoji="✏️"
              label="Create assignment"
              href="/teacher/assignment"
              accent={C.mint}
            />
          </div>
        </div>

        {/* ── Two-column: recent activity + extra nav ────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          {/* Recent activity feed */}
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              padding: "20px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: C.text,
                  margin: 0,
                }}
              >
                Recent Student Activity
              </h2>
              <Link
                href="/teacher/class"
                style={{
                  fontSize: 12,
                  color: C.blue,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View all →
              </Link>
            </div>

            {loading && (
              <div style={{ color: C.muted, fontSize: 13, padding: "16px 0" }}>
                Loading activity…
              </div>
            )}

            {!loading && recentActivity.length === 0 && (
              <div
                style={{
                  color: C.muted,
                  fontSize: 13,
                  padding: "16px 0",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>💤</div>
                No recent activity yet. Students will appear here once they start playing.
              </div>
            )}

            {!loading &&
              recentActivity.map((item) => (
                <div
                  key={item.studentId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(155,114,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {item.ago}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* More links sidebar */}
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              padding: "20px",
              border: `1px solid ${C.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
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
              More pages
            </h2>
            {[
              { label: "⚡ Command Centre", href: "/teacher/command" },
              { label: "🔧 Support Queue",  href: "/teacher/support" },
              { label: "📊 Skills Report",  href: "/teacher/skills" },
              { label: "🗂 Small Groups",   href: "/teacher/small-group" },
              { label: "👀 Watchlist",      href: "/teacher/watchlist" },
              { label: "🏆 Class Growth",   href: "/teacher/class-growth" },
            ].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.blue,
                  textDecoration: "none",
                  background: "transparent",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
