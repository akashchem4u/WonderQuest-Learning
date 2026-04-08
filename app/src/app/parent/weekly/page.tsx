"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getActiveChildId, setActiveChildId } from "@/lib/active-child";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const VIOLET  = "#9b72ff";
const MINT    = "#50e890";
const GOLD    = "#ffd166";
const AMBER   = "#f59e0b";
const TEXT    = "#f0f6ff";
const MUTED   = "#8b949e";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";
const VBORDER = "rgba(155,114,255,0.2)";

// ─── Types ────────────────────────────────────────────────────────────────────

type LinkedChild = {
  id: string;
  displayName: string;
  avatarKey?: string;
  launchBandCode?: string;
};

type ParentSession = {
  linkedChildren: LinkedChild[];
  linkedChild?: LinkedChild;
};

type WeeklyReport = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  avatarKey: string;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  stats: {
    starsEarned: number;
    sessions: number;
    learningMinutes: number;
    newBadges: number;
    streakDays: number;
  };
  skills: {
    skillId: string;
    skillName: string;
    subject: string;
    correctCount: number;
    totalCount: number;
    masteryPct: number;
    sessionCount: number;
  }[];
  sessionLog: {
    sessionId: string;
    startedAt: string;
    sessionMode: string;
    starsEarned: number;
    correctCount: number;
    totalQuestions: number;
    durationMinutes: number | null;
    effectivenessScore: number | null;
  }[];
  heatmap: {
    dayLabel: string;
    date: string;
    sessionCount: number;
  }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function masteryStatus(pct: number): "Strong" | "Building" | "Just started" {
  if (pct >= 65) return "Strong";
  if (pct >= 40) return "Building";
  return "Just started";
}

function skillBarColor(pct: number) {
  if (pct >= 65) return VIOLET;
  if (pct >= 40) return GOLD;
  return "rgba(155,114,255,0.35)";
}

function skillPctColor(pct: number) {
  if (pct >= 65) return VIOLET;
  if (pct >= 40) return AMBER;
  return MUTED;
}

function subjectLabel(subject: string) {
  const s = subject?.toLowerCase() ?? "";
  if (s.includes("read") || s.includes("phonics") || s.includes("spell") || s.includes("vocab")) return "Reading";
  if (s.includes("math") || s.includes("number")) return "Maths";
  return subject || "General";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1rem", fontWeight: 700, color: TEXT, marginBottom: 16 }}>
      <span>{icon}</span>
      {children}
    </div>
  );
}

function SkillBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
      <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
  );
}

function StatusPill({ status }: { status: ReturnType<typeof masteryStatus> }) {
  const map = {
    Strong:         { bg: "rgba(34,197,94,0.15)",    color: "#4ade80" },
    Building:       { bg: "rgba(255,209,102,0.15)",  color: GOLD      },
    "Just started": { bg: "rgba(155,114,255,0.15)",  color: "#c4a8ff" },
  };
  const s = map[status];
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: "0.68rem", fontWeight: 700, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// Day-of-week grid: Mon–Sun filled/empty circles
function DayGrid({ heatmap }: { heatmap: WeeklyReport["heatmap"] }) {
  const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // Build a map: dayLabel → sessionCount
  const map: Record<string, number> = {};
  for (const d of heatmap) {
    const key = d.dayLabel?.slice(0, 3) ?? "";
    map[key] = (map[key] ?? 0) + d.sessionCount;
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {DAY_ORDER.map((day) => {
        const count = map[day] ?? 0;
        const active = count > 0;
        return (
          <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: active ? `linear-gradient(135deg, ${VIOLET}, ${MINT})` : "rgba(255,255,255,0.06)",
                border: active ? "none" : `1.5px solid rgba(255,255,255,0.1)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: active ? "0.75rem" : "0.65rem",
                fontWeight: 700,
                color: active ? "#fff" : MUTED,
                transition: "background 0.3s",
              }}
            >
              {active ? count : ""}
            </div>
            <span style={{ fontSize: "0.62rem", color: active ? TEXT : MUTED, fontWeight: active ? 700 : 400 }}>
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "80px 0", color: MUTED }}>
      <div style={{ fontSize: "2rem", marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: "0.9rem" }}>Loading weekly report…</div>
    </div>
  );
}

function LoginPrompt() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: TEXT, marginBottom: 8 }}>
        Parent sign-in required
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: 24 }}>
        Sign in to your parent account to view the weekly report.
      </div>
      <Link
        href="/parent"
        style={{
          display: "inline-block",
          padding: "12px 28px",
          background: VIOLET,
          color: "#fff",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: "0.9rem",
          textDecoration: "none",
        }}
      >
        Sign in →
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentWeeklyPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [prevStats, setPrevStats] = useState<WeeklyReport["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null); // null = unknown
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [activeCid, setActiveCid] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [digestSent, setDigestSent] = useState(false);
  const [digestError, setDigestError] = useState(false);

  // Step 1: Restore parent session to get children list
  useEffect(() => {
    fetch("/api/parent/session")
      .then((r) => {
        if (!r.ok) { setAuthed(false); setLoading(false); return null; }
        return r.json() as Promise<ParentSession>;
      })
      .then((data) => {
        if (!data) return;
        const list = data.linkedChildren ?? [];
        setChildren(list);
        const persisted = getActiveChildId();
        const chosen = (persisted && list.some((c) => c.id === persisted)) ? persisted : (list[0]?.id ?? null);
        setActiveCid(chosen);
        if (chosen) setActiveChildId(chosen);
        setAuthed(true);
      })
      .catch(() => { setAuthed(false); setLoading(false); });
  }, []);

  // Step 2: Fetch report whenever childId or weekOffset changes
  useEffect(() => {
    if (!activeCid || authed !== true) return;
    setLoading(true);
    fetch(`/api/parent/report?childId=${encodeURIComponent(activeCid)}&weekOffset=${weekOffset}`)
      .then((r) => r.json())
      .then((data) => { setReport(data.report ?? null); })
      .catch(() => { setReport(null); })
      .finally(() => setLoading(false));
  }, [activeCid, weekOffset, authed]);

  // Fetch previous week stats for comparison (only when viewing current week)
  useEffect(() => {
    if (!activeCid || authed !== true || weekOffset !== 0) {
      setPrevStats(null);
      return;
    }
    fetch(`/api/parent/report?childId=${encodeURIComponent(activeCid)}&weekOffset=1`)
      .then((r) => r.json())
      .then((data) => { setPrevStats(data.report?.stats ?? null); })
      .catch(() => setPrevStats(null));
  }, [activeCid, authed, weekOffset]);

  const stats = report?.stats;
  const skillRows = report?.skills ?? [];
  const heatmap = report?.heatmap ?? [];
  const daysActive = heatmap.filter((d) => d.sessionCount > 0).length;
  const accuracy = stats && stats.sessions > 0
    ? Math.round((skillRows.reduce((s, sk) => s + sk.correctCount, 0) /
        Math.max(1, skillRows.reduce((s, sk) => s + sk.totalCount, 0))) * 100)
    : null;

  const sessionDelta = prevStats != null && stats != null
    ? stats.sessions - prevStats.sessions
    : null;

  // band label
  const bandLabels: Record<string, string> = {
    PREK: "Pre-K", K1: "Kindergarten–Grade 1", G23: "Grades 2–3", G45: "Grades 4–5",
  };
  const bandLabel = report ? (bandLabels[report.launchBandCode] ?? report.launchBandCode) : "";

  // week label: prefer from API, fall back to local
  function localWeekLabel(offset: number) {
    if (offset === 0) return "This week";
    if (offset === 1) return "Last week";
    return `${offset} weeks ago`;
  }
  const weekLabel = report?.weekLabel ?? localWeekLabel(weekOffset);

  return (
    <AppFrame audience="parent" currentPath="/parent/weekly">
      <div
        style={{
          minHeight: "100vh",
          background: BASE,
          color: TEXT,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ background: "rgba(22,27,34,0.95)", borderBottom: `1px solid ${BORDER}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link href="/parent" style={{ fontSize: "0.8rem", fontWeight: 600, color: MUTED, textDecoration: "none" }}>
            ← Dashboard
          </Link>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: TEXT }}>
            Weekly Report
          </div>
          {/* Child selector */}
          {children.length > 1 && (
            <select
              value={activeCid ?? ""}
              onChange={(e) => { setActiveCid(e.target.value); setActiveChildId(e.target.value); }}
              style={{ background: SURFACE, border: `1px solid ${VBORDER}`, borderRadius: 8, color: TEXT, fontSize: "0.8rem", padding: "5px 10px", cursor: "pointer" }}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          )}
          {children.length <= 1 && <div style={{ width: 80 }} />}
        </div>

        {/* Content */}
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "32px 24px 80px" }}>

          {authed === false && <LoginPrompt />}

          {authed !== false && loading && <LoadingState />}

          {authed === true && !loading && !report && (
            <div style={{ textAlign: "center", padding: "60px 0", color: MUTED, fontSize: "0.9rem" }}>
              No data available for this week.
            </div>
          )}

          {authed === true && !loading && report && (
            <>
              {/* Header card */}
              <SectionCard style={{ border: `1px solid ${VBORDER}`, marginBottom: 24 }}>
                {/* Week nav */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                  <button
                    onClick={() => setWeekOffset((o) => o + 1)}
                    style={{
                      padding: "7px 16px", background: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`,
                      borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, color: TEXT, cursor: "pointer",
                    }}
                  >
                    ← Previous
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: VIOLET, marginBottom: 4 }}>
                      Weekly Learning Report
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: TEXT }}>{weekLabel}</div>
                    {report.weekStart && (
                      <div style={{ fontSize: "0.75rem", color: MUTED, marginTop: 2 }}>
                        {new Date(report.weekStart).toLocaleDateString([], { month: "short", day: "numeric" })}
                        {" – "}
                        {new Date(report.weekEnd).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </div>
                    )}
                  </div>
                  {weekOffset > 0 ? (
                    <button
                      onClick={() => setWeekOffset((o) => o - 1)}
                      style={{
                        padding: "7px 16px", background: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`,
                        borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, color: TEXT, cursor: "pointer",
                      }}
                    >
                      Next →
                    </button>
                  ) : (
                    <div style={{ width: 90 }} />
                  )}
                </div>

                {/* Child info row */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, rgba(155,114,255,0.3), rgba(155,114,255,0.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", border: `2px solid rgba(155,114,255,0.3)`, flexShrink: 0 }}>
                    🦁
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: TEXT, marginBottom: 4 }}>
                      {report.displayName}&apos;s week
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 10px", borderRadius: 12, background: "rgba(155,114,255,0.12)", border: `1px solid rgba(155,114,255,0.25)`, fontSize: "0.72rem", fontWeight: 700, color: "#c4a8ff" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: VIOLET, display: "inline-block" }} />
                      {bandLabel || report.launchBandCode}
                    </div>
                  </div>
                  {/* Comparison vs last week */}
                  {weekOffset === 0 && sessionDelta !== null && (
                    <div
                      style={{
                        padding: "10px 16px",
                        borderRadius: 12,
                        background: sessionDelta > 0 ? "rgba(80,232,144,0.1)" : sessionDelta < 0 ? "rgba(255,123,107,0.1)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${sessionDelta > 0 ? "rgba(80,232,144,0.25)" : sessionDelta < 0 ? "rgba(255,123,107,0.25)" : BORDER}`,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: sessionDelta > 0 ? MINT : sessionDelta < 0 ? "#ff7b6b" : MUTED,
                        textAlign: "center",
                      }}
                    >
                      {sessionDelta > 0 ? `↑ ${sessionDelta} more session${sessionDelta !== 1 ? "s" : ""}` : sessionDelta < 0 ? `↓ ${Math.abs(sessionDelta)} fewer session${Math.abs(sessionDelta) !== 1 ? "s" : ""}` : "Same sessions"}
                      <div style={{ fontSize: "0.65rem", fontWeight: 400, color: MUTED, marginTop: 2 }}>vs last week</div>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Summary stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { icon: "🎯", value: stats?.sessions ?? 0, label: "Sessions" },
                  { icon: "⏱️", value: `${stats?.learningMinutes ?? 0}m`, label: "Learning time" },
                  { icon: "✅", value: accuracy !== null ? `${accuracy}%` : "—", label: "Accuracy" },
                  { icon: "📖", value: skillRows.length, label: "Skills practiced" },
                ].map((s) => (
                  <div key={s.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, color: TEXT, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "0.65rem", color: MUTED, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Day-by-day breakdown */}
              <SectionCard>
                <SectionTitle icon="📅">Days this week</SectionTitle>
                <DayGrid heatmap={heatmap} />
                <div style={{ marginTop: 12, fontSize: "0.75rem", color: MUTED }}>
                  {daysActive} active day{daysActive !== 1 ? "s" : ""} this week.
                  {daysActive === 0 ? " Encourage a session today!" : daysActive >= 5 ? " Fantastic consistency! 🌟" : ""}
                </div>
              </SectionCard>

              {/* Skills practiced */}
              {skillRows.length > 0 && (
                <SectionCard>
                  <SectionTitle icon="📚">Skills practiced this week</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {skillRows.map((sk, i) => {
                      const status = masteryStatus(sk.masteryPct);
                      const barColor = skillBarColor(sk.masteryPct);
                      const pctColor = skillPctColor(sk.masteryPct);
                      const subj = subjectLabel(sk.subject);
                      return (
                        <div
                          key={sk.skillId}
                          style={{
                            padding: "14px 0",
                            borderBottom: i < skillRows.length - 1 ? `1px solid ${BORDER}` : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: TEXT }}>{sk.skillName}</span>
                              <span style={{ fontSize: "0.68rem", color: MUTED }}>{subj}</span>
                            </div>
                            <SkillBar pct={sk.masteryPct} color={barColor} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 800, color: pctColor }}>{sk.masteryPct}%</span>
                            <StatusPill status={status} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* No sessions placeholder */}
              {stats?.sessions === 0 && (
                <div
                  style={{
                    padding: "24px",
                    background: "rgba(155,114,255,0.07)",
                    border: `1px solid rgba(155,114,255,0.15)`,
                    borderRadius: 14,
                    textAlign: "center",
                    color: MUTED,
                    fontSize: "0.88rem",
                    marginBottom: 20,
                  }}
                >
                  No sessions this week yet. Check back after {report.displayName} plays!
                </div>
              )}

              {/* Stars + streak callout */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                <div style={{ background: "rgba(255,209,102,0.08)", border: "1px solid rgba(255,209,102,0.2)", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>⭐</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: GOLD }}>{stats?.starsEarned ?? 0}</div>
                  <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: 3, fontWeight: 600 }}>Stars earned this week</div>
                </div>
                <div style={{ background: "rgba(155,114,255,0.08)", border: "1px solid rgba(155,114,255,0.2)", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>🔥</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: VIOLET }}>{stats?.streakDays ?? 0}d</div>
                  <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: 3, fontWeight: 600 }}>Day streak</div>
                </div>
              </div>

              {/* Footer nav */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <Link href="/parent/practice" style={{ fontSize: "0.84rem", fontWeight: 700, color: VIOLET, textDecoration: "none" }}>
                  Practice today →
                </Link>
                <Link href="/parent/benchmark" style={{ fontSize: "0.84rem", fontWeight: 700, color: MUTED, textDecoration: "none" }}>
                  Skill benchmarks →
                </Link>
              </div>

              {/* Email digest button */}
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={async () => {
                    if (sending || digestSent) return;
                    setDigestError(false);
                    setSending(true);
                    try {
                      const body = activeCid ? JSON.stringify({ studentId: activeCid }) : undefined;
                      const r = await fetch("/api/parent/send-digest", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body,
                      });
                      if (r.ok) {
                        setDigestSent(true);
                      } else {
                        setDigestError(true);
                      }
                    } catch {
                      setDigestError(true);
                    } finally {
                      setSending(false);
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: digestSent ? "rgba(80,232,144,0.12)" : "rgba(155,114,255,0.12)",
                    border: `1px solid ${digestSent ? "rgba(80,232,144,0.3)" : VBORDER}`,
                    borderRadius: 10,
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    color: digestSent ? "#4ade80" : VIOLET,
                    cursor: sending || digestSent ? "default" : "pointer",
                    opacity: sending ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {sending ? "Sending…" : digestSent ? "✓ Sent to your email" : "📧 Email me this digest"}
                </button>
                {digestError && (
                  <div style={{ marginTop: 6, fontSize: "0.75rem", color: "#ff7b6b" }}>
                    Could not send email. Please try again.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
