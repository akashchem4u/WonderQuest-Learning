"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "./teacher-gate";

// ── Design tokens ───────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  surfaceHover: "rgba(255,255,255,0.04)",
  red: "#ff7b6b",
};

// ── Band code helpers ────────────────────────────────────────────────────────
function bandLabel(code: string): string {
  if (code === "PREK" || code === "P0") return "Pre-K (P0)";
  if (code === "K1" || code === "P1") return "K–1 (P1)";
  if (code === "G23" || code === "P2") return "G2–3 (P2)";
  if (code === "G45" || code === "P3") return "G4–5 (P3)";
  return code;
}

function bandColor(code: string): string {
  if (code === "PREK" || code === "P0") return C.gold;
  if (code === "K1" || code === "P1") return C.violet;
  if (code === "G23" || code === "P2") return C.mint;
  if (code === "G45" || code === "P3") return C.red;
  return C.muted;
}

function bandKey(code: string): string {
  if (code === "PREK" || code === "P0") return "P0";
  if (code === "K1" || code === "P1") return "P1";
  if (code === "G23" || code === "P2") return "P2";
  if (code === "G45" || code === "P3") return "P3";
  return code;
}

function triggerToIssue(triggerType: string): string {
  if (triggerType === "confidence_floor") return "Hit confidence floor repeatedly — same question type each time";
  if (triggerType === "no_sessions") return "No sessions in 5+ days — streak broken";
  if (triggerType === "repeated_hints") return "Repeated hint requests — may need a different approach";
  if (triggerType === "band_ceiling") return "Band placement may need review — consistently above ceiling";
  return triggerType;
}

function triggerToAction(triggerType: string): string {
  if (triggerType === "no_sessions") return "Reach out";
  if (triggerType === "band_ceiling") return "Review band";
  return "Check in";
}

// ── API types ────────────────────────────────────────────────────────────────
interface RosterStudent {
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
}

interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string;
  skillLabel: string;
  triggerType: string;
  status: string;
  createdAt: string;
}

// ── Shared sub-components ───────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.surface,
      borderRadius: 14,
      padding: 18,
      border: `1px solid ${C.border}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, link, href }: { title: React.ReactNode; link?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{title}</span>
      {link && href && (
        <Link href={href} style={{ fontSize: 12, color: C.blue, fontWeight: 600, textDecoration: "none" }}>
          {link}
        </Link>
      )}
    </div>
  );
}

// ── Page component ──────────────────────────────────────────────────────────
export default function TeacherPage() {
  // Auth gate — resolved client-side to avoid hydration mismatch
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  const [activeTab, setActiveTab] = useState<"overview" | "students" | "support">("overview");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileSchool, setProfileSchool] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    const teacherId = getTeacherId();
    if (!teacherId) return;
    fetch(`/api/teacher/profile?teacherId=${teacherId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { profile?: { displayName: string; schoolName: string | null; isIncomplete?: boolean } } | null) => {
        if (data?.profile) {
          setTeacherName(data.profile.displayName === "Teacher" ? "" : data.profile.displayName);
          if (data.profile.displayName === "Teacher") {
            setShowProfileSetup(true);
          } else if (data.profile.isIncomplete) {
            setShowProfileBanner(true);
          }
        }
      })
      .catch(() => {/* ignore */});
  }, []);

  useEffect(() => {
    const teacherId = getTeacherId();
    Promise.all([
      fetch(`/api/teacher/class?teacherId=${teacherId}`).then((r) => r.ok ? r.json() : { roster: [] }),
      fetch(`/api/teacher/interventions?teacherId=${teacherId}`).then((r) => r.ok ? r.json() : { interventions: [] }),
    ])
      .then(([classData, intData]) => {
        setRoster(classData.roster ?? []);
        // Normalise API field names: interventionType → triggerType, skillCode → skillLabel
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawInts: any[] = intData.interventions ?? [];
        setInterventions(rawInts.map((i) => ({
          ...i,
          triggerType: i.triggerType ?? i.interventionType ?? i.reason ?? "check_in",
          skillLabel: i.skillLabel ?? i.skillCode ?? null,
        })));
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const activeToday = roster.filter(
    (s) => s.lastSessionAt && now - new Date(s.lastSessionAt).getTime() < oneDayMs
  );
  const classStars = roster.reduce((sum, s) => sum + s.totalPoints, 0);
  const sessionsToday = Math.round(roster.reduce((sum, s) => sum + s.sessionsLast7d, 0) / 7);
  const needCheckIn = roster.filter((s) => s.inInterventionQueue);

  // Band breakdown
  const bandCounts: Record<string, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const s of roster) {
    const k = bandKey(s.launchBandCode);
    if (k in bandCounts) bandCounts[k]++;
  }
  const totalStudents = roster.length || 1;
  const BANDS = [
    { name: "Pre-K (P0)", count: bandCounts.P0, pct: Math.round((bandCounts.P0 / totalStudents) * 100), color: C.gold },
    { name: "K–1 (P1)", count: bandCounts.P1, pct: Math.round((bandCounts.P1 / totalStudents) * 100), color: C.violet },
    { name: "G2–3 (P2)", count: bandCounts.P2, pct: Math.round((bandCounts.P2 / totalStudents) * 100), color: C.mint },
    { name: "G4–5 (P3)", count: bandCounts.P3, pct: Math.round((bandCounts.P3 / totalStudents) * 100), color: C.red },
  ];
  const bandsWithStudents = BANDS.filter((b) => b.count > 0).map((b) => b.name.split(" (")[1].replace(")", "")).join(" / ");

  const STATS = [
    { val: loading ? "—" : String(activeToday.length), lbl: "Active today", delta: "vs yesterday", up: true },
    { val: loading ? "—" : `⭐ ${classStars}`, lbl: "Class stars", delta: "this week", up: true },
    { val: loading ? "—" : String(sessionsToday), lbl: "Sessions today", delta: "→ Typical", up: null },
    { val: loading ? "—" : String(needCheckIn.length), lbl: "Need check-in", delta: "⚠ Support queue", up: needCheckIn.length > 0 ? false : null },
    { val: loading ? "—" : String(BANDS.filter((b) => b.count > 0).length), lbl: "Bands covered", delta: bandsWithStudents || "—", up: null },
  ];

  // Active students: top 4 by sessionsLast7d
  const ACTIVE_STUDENTS = [...roster]
    .sort((a, b) => b.sessionsLast7d - a.sessionsLast7d)
    .slice(0, 4)
    .map((s) => ({
      initial: s.displayName.charAt(0).toUpperCase(),
      name: s.displayName,
      band: `${bandLabel(s.launchBandCode)}`,
      stars: s.totalPoints,
      color: bandColor(s.launchBandCode),
    }));

  // Support queue: first 4 active interventions
  const SUPPORT_QUEUE = interventions
    .filter((i) => i.status === "active")
    .slice(0, 4)
    .map((i) => ({
      name: i.studentName,
      issue: triggerToIssue(i.triggerType),
      action: triggerToAction(i.triggerType),
    }));

  // Week stats derived from roster
  const totalSessions7d = roster.reduce((sum, s) => sum + s.sessionsLast7d, 0);
  const inactiveStudents = roster.filter((s) => !s.lastSessionAt || now - new Date(s.lastSessionAt).getTime() > 7 * oneDayMs).length;
  const WEEK_STATS = [
    { lbl: "Sessions completed", val: String(totalSessions7d) },
    { lbl: "Stars earned (class)", val: `⭐ ${classStars}` },
    { lbl: "Badges earned", val: "🏅 —" },
    { lbl: "Students not active", val: String(inactiveStudents), warn: true },
  ];

  const SKILL_GAPS = [
    { label: "Blending sounds", count: 6 },
    { label: "Skip counting", count: 4 },
    { label: "CVC spelling", count: 3 },
  ];

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profileName.trim()) return;
    setProfileSaving(true);
    fetch("/api/teacher/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: profileName.trim(), schoolName: profileSchool.trim() || null }),
    })
      .then(() => {
        setTeacherName(profileName.trim());
        setShowProfileSetup(false);
        setShowProfileBanner(false);
      })
      .catch(() => {/* ignore */})
      .finally(() => setProfileSaving(false));
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "system-ui",
    background: activeTab === tab ? C.blue : C.surface,
    color: activeTab === tab ? "#0b1622" : C.muted,
    transition: "all .18s",
  });

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      {showProfileSetup && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: "32px 36px",
            width: "100%",
            maxWidth: 440,
          }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 6 }}>Welcome to WonderQuest</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, lineHeight: 1.5 }}>
              Set up your teacher profile to get started.
            </div>
            <form onSubmit={handleProfileSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                  Your name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Ms Johnson"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                  School name (optional)
                </label>
                <input
                  type="text"
                  value={profileSchool}
                  onChange={(e) => setProfileSchool(e.target.value)}
                  placeholder="e.g. Lincoln Elementary"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: C.blue,
                  border: "none",
                  borderRadius: 10,
                  color: "#0b1622",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: profileSaving ? "default" : "pointer",
                  fontFamily: "system-ui,-apple-system,sans-serif",
                  opacity: profileSaving ? 0.7 : 1,
                }}
              >
                {profileSaving ? "Saving…" : "Save and continue"}
              </button>
            </form>
          </div>
        </div>
      )}
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px" }}>

        {/* Profile completion banner */}
        {showProfileBanner && (
          <div style={{
            background: "rgba(155,114,255,0.12)",
            border: "1px solid rgba(155,114,255,0.35)",
            borderRadius: 12,
            padding: "12px 18px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 13, color: C.text, flex: 1 }}>
              Complete your profile — add your display name and school to personalise your dashboard.
            </span>
            <button
              onClick={() => setShowProfileSetup(true)}
              style={{
                background: C.violet,
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 14px",
                cursor: "pointer",
                fontFamily: "system-ui,-apple-system,sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Complete profile
            </button>
            <button
              onClick={() => setShowProfileBanner(false)}
              style={{
                background: "transparent",
                border: "none",
                color: C.muted,
                fontSize: 16,
                cursor: "pointer",
                padding: "0 4px",
                lineHeight: 1,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Page header */}
        <div style={{ marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>
            {teacherName ? `Good morning, ${teacherName} 👋` : "Good morning 👋"}
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {loading ? "Loading your classroom…" : `${roster.length} student${roster.length !== 1 ? "s" : ""} · WonderQuest Classroom`}
          </p>
        </div>

        {/* Quick nav links */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, marginTop: 16 }}>
          {[
            { label: "⚡ Command Centre", href: "/teacher/command" },
            { label: "👥 Class", href: "/teacher/class" },
            { label: "📋 Assignments", href: "/teacher/assignment" },
            { label: "🔧 Support Queue", href: "/teacher/support" },
          ].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                padding: "8px 16px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: C.blue,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "background .15s",
              }}
            >
              {n.label}
            </Link>
          ))}
        </div>

        {/* Empty roster onboarding */}
        {!loading && roster.length === 0 && (
          <div style={{
            background: "rgba(155,114,255,0.07)",
            border: `1px solid rgba(155,114,255,0.25)`,
            borderRadius: 16,
            padding: "28px 24px",
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            <div style={{ fontSize: 22 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Your classroom is ready</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 480 }}>
              Share your teacher code with students to get started. Once they log in, their progress will appear here automatically.
            </div>
            <Link href="/teacher/class" style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              marginTop: 4,
              padding: "9px 18px",
              background: "rgba(155,114,255,0.18)",
              border: "1px solid rgba(155,114,255,0.35)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: "#c4a8ff",
              textDecoration: "none",
            }}>
              Go to Class →
            </Link>
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {(["overview", "students", "support"] as const).map((t) => (
            <button key={t} style={tabStyle(t)} onClick={() => setActiveTab(t)}>
              {t === "overview" ? "Class Overview" : t === "students" ? "Student List" : "Support Queue"}
            </button>
          ))}
        </div>

        {/* ── TAB: Overview ── */}
        {activeTab === "overview" && (
          <>
            {/* Stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
              {STATS.map((s) => (
                <div key={s.lbl} style={{
                  background: C.surface,
                  borderRadius: 12,
                  padding: "14px 16px",
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: loading ? C.muted : C.text, marginBottom: 2, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.lbl}</div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 3,
                    color: s.up === true ? C.mint : s.up === false ? C.amber : C.muted,
                  }}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Two-col: active students + support queue preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Active students */}
              <Card>
                <CardHeader title={`🟢 Active right now (${activeToday.length})`} link="View all →" href="/teacher/class" />
                {ACTIVE_STUDENTS.map((s) => (
                  <div key={s.name} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: s.color + "33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: s.color, flexShrink: 0,
                    }}>{s.initial}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.name}
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          background: C.mint + "22", color: C.mint,
                          padding: "2px 8px", borderRadius: 20, marginLeft: 6,
                        }}>Active</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{s.band}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>⭐ {s.stars}</span>
                  </div>
                ))}
                {loading && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>Loading…</div>}
                {!loading && ACTIVE_STUDENTS.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>No active students</div>}
                {!loading && activeToday.length > 4 && (
                  <div style={{ fontSize: 12, color: C.blue, cursor: "pointer", marginTop: 10, fontWeight: 700 }}>+ {activeToday.length - 4} more active →</div>
                )}
              </Card>

              {/* Support queue preview */}
              <Card>
                <CardHeader title={`⚠️ Needs check-in (${SUPPORT_QUEUE.length})`} link="View queue →" href="/teacher/support" />
                {SUPPORT_QUEUE.map((q) => (
                  <div key={q.name} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: C.amber + "15",
                    borderLeft: `3px solid ${C.amber}`,
                    marginBottom: 8,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: C.amber + "33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, flexShrink: 0,
                    }}>💛</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{q.name}</div>
                      <div style={{ fontSize: 11, color: C.amber, lineHeight: 1.4, marginTop: 2 }}>{q.issue}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.blue, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginTop: 2 }}>{q.action}</span>
                  </div>
                ))}
                {loading && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>Loading…</div>}
                {!loading && SUPPORT_QUEUE.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>No students in support queue</div>}
              </Card>
            </div>

            {/* Three-col: band coverage + skill gaps + week summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {/* Band coverage */}
              <Card>
                <CardHeader title="🎯 Band coverage" />
                {BANDS.map((b) => (
                  <div key={b.name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0", borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, flex: 1 }}>{b.name}</div>
                    <div style={{ flex: 2, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: b.count === 0 ? C.muted : C.text, minWidth: 24, textAlign: "right" }}>{b.count}</div>
                  </div>
                ))}
              </Card>

              {/* Skill gaps */}
              <Card>
                <CardHeader title="⚡ Common skill gaps" />
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.4 }}>Skills where 3+ students are struggling. Tap to drilldown.</div>
                <div>
                  {SKILL_GAPS.map((g) => (
                    <span key={g.label} style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: C.amber + "22",
                      border: `1px solid ${C.amber}44`,
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.amber,
                      margin: 4,
                      cursor: "pointer",
                    }}>
                      {g.label} ({g.count})
                    </span>
                  ))}
                </div>
              </Card>

              {/* Week summary */}
              <Card>
                <CardHeader title="📅 Week to date" />
                {WEEK_STATS.map((w) => (
                  <div key={w.lbl} style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 0",
                    borderTop: `1px solid ${C.border}`,
                  }}>
                    <div style={{ flex: 1, fontSize: 12, color: C.muted, fontWeight: 600 }}>{w.lbl}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: w.warn ? C.amber : C.text }}>{loading ? "—" : w.val}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {/* ── TAB: Students ── */}
        {activeTab === "students" && (
          <Card>
            <CardHeader title={`👥 All Students (${loading ? "—" : roster.length})`} link="Class settings →" href="/teacher/class" />
            {loading && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>Loading…</div>}
            {!loading && roster.map((s) => {
              const color = bandColor(s.launchBandCode);
              const isInQueue = s.inInterventionQueue;
              const isActive = s.lastSessionAt && now - new Date(s.lastSessionAt).getTime() < oneDayMs;
              const status = isInQueue ? "Support" : isActive ? "Active" : "Idle";
              return (
                <div key={s.studentId} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: color + "33",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 900, color, flexShrink: 0,
                  }}>{s.displayName.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.displayName}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{bandLabel(s.launchBandCode)}</div>
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background:
                      status === "Active" ? C.mint + "22" :
                      status === "Support" ? C.amber + "22" :
                      "rgba(255,255,255,0.06)",
                    color:
                      status === "Active" ? C.mint :
                      status === "Support" ? C.amber :
                      C.muted,
                  }}>{status}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 60, textAlign: "right" }}>⭐ {s.totalPoints}</span>
                </div>
              );
            })}
          </Card>
        )}

        {/* ── TAB: Support Queue ── */}
        {activeTab === "support" && (
          <Card>
            <CardHeader title={`🔧 Support Queue (${loading ? "—" : SUPPORT_QUEUE.length})`} link="Full view →" href="/teacher/support" />
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
              System-flagged students who may need a teacher check-in. Different from your personal watchlist.
            </p>
            {loading && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>Loading…</div>}
            {!loading && SUPPORT_QUEUE.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>No students in support queue</div>}
            {SUPPORT_QUEUE.map((q, i) => (
              <div key={q.name} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                background: C.amber + "15",
                borderLeft: `3px solid ${C.amber}`,
                marginBottom: i < SUPPORT_QUEUE.length - 1 ? 10 : 0,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: C.amber + "33",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, flexShrink: 0, fontWeight: 900, color: C.amber,
                }}>!</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{q.name}</div>
                  <div style={{ fontSize: 12, color: C.amber, lineHeight: 1.4 }}>{q.issue}</div>
                </div>
                <button style={{
                  padding: "6px 14px",
                  background: "transparent",
                  border: `1.5px solid ${C.blue}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.blue,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                  flexShrink: 0,
                }}>{q.action}</button>
              </div>
            ))}
          </Card>
        )}

      </div>
    </AppFrame>
  );
}
