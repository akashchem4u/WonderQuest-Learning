"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Types ──────────────────────────────────────────────────────────────────

type ParentAccessResponse = {
  guardian: { id: string; username: string; displayName: string };
  linkedChild: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  } | null;
  linkedChildren: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  }[];
  childDashboards: unknown[];
  childDashboard: unknown | null;
};

// ─── Component prop types ────────────────────────────────────────────────────

type StatTileProps = { label: string; value: string; color: string; delta: string; deltaUp: boolean | null };
type SkillProps = { name: string; subject: string; pct: number; bar: string; sessions: number; delta: string; deltaUp: boolean | null; status: string };
type HeatmapDayProps = { label: string; sessions: number; active: boolean };

// ─── Stubbed weekly data ─────────────────────────────────────────────────────

const WEEK_LABEL = "March 18 – March 24, 2026";

const STAT_TILES: StatTileProps[] = [
  { label: "Sessions", value: "14", color: "#9b72ff", delta: "+3 vs last week", deltaUp: true },
  { label: "Learning time", value: "3.2h", color: "#58e8c1", delta: "Same as last week", deltaUp: null },
  { label: "Accuracy", value: "74%", color: "#ffd166", delta: "+8% vs last week", deltaUp: true },
  { label: "Day streak", value: "5 days", color: "#ff7b6b", delta: "+2 days", deltaUp: true },
];

const SKILLS: SkillProps[] = [
  { name: "Rhyming words", subject: "Reading", pct: 88, bar: "#9b72ff", sessions: 6, delta: "+12%", deltaUp: true, status: "Strong" },
  { name: "Letter sounds", subject: "Phonics", pct: 74, bar: "#9b72ff", sessions: 4, delta: "+6%", deltaUp: true, status: "Strong" },
  { name: "Counting objects", subject: "Math", pct: 60, bar: "#ffd166", sessions: 2, delta: "—", deltaUp: null, status: "Building" },
  { name: "First words", subject: "Reading", pct: 45, bar: "#ffd166", sessions: 2, delta: "+8%", deltaUp: true, status: "Building" },
  { name: "Simple addition", subject: "Math", pct: 30, bar: "#9b72ff44", sessions: 1, delta: "New", deltaUp: null, status: "Just started" },
];

const HEATMAP_DAYS: HeatmapDayProps[] = [
  { label: "Mon", sessions: 2, active: true },
  { label: "Tue", sessions: 3, active: true },
  { label: "Wed", sessions: 3, active: true },
  { label: "Thu", sessions: 3, active: true },
  { label: "Fri", sessions: 2, active: true },
  { label: "Sat", sessions: 0, active: false },
  { label: "Sun", sessions: 0, active: false },
];

const SESSION_LOG = [
  { day: "Friday, Mar 21", stars: 9, skills: "Rhyming words, Letter sounds", duration: "14 min", perfect: true },
  { day: "Thursday, Mar 20", stars: 9, skills: "Rhyming words, Counting objects", duration: "12 min", perfect: false },
  { day: "Wednesday, Mar 19", stars: 9, skills: "Letter sounds, First words", duration: "15 min", perfect: false },
  { day: "Tuesday, Mar 18", stars: 8, skills: "Rhyming words, Simple addition", duration: "13 min", perfect: false },
  { day: "Monday, Mar 17", stars: 7, skills: "Letter sounds, First words", duration: "11 min", perfect: true },
  { day: "Friday, Mar 21 (2nd)", stars: 6, skills: "Counting objects", duration: "9 min", perfect: false },
  { day: "Wednesday, Mar 19 (2nd)", stars: 8, skills: "Rhyming words", duration: "10 min", perfect: false },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatTile({ label, value, color, delta, deltaUp }: StatTileProps) {
  const deltaColor = deltaUp === true ? "#58e8c1" : deltaUp === false ? "#ff7b6b" : "#9b8ec4";
  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(155,114,255,0.25)",
      borderRadius: 14,
      padding: "18px 20px",
      textAlign: "center",
      flex: 1,
      minWidth: 120,
    }}>
      <div style={{ fontWeight: 900, fontSize: "1.6rem", color, marginBottom: 4, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.7rem", color: "#9b8ec4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: "0.68rem", color: deltaColor, fontWeight: 600 }}>{delta}</div>
    </div>
  );
}

function SkillBar({ skill }: { skill: SkillProps }) {
  const pctColor = skill.pct >= 70 ? "#9b72ff" : skill.pct >= 50 ? "#ffd166" : "#9b8ec4";
  const deltaColor = skill.deltaUp === true ? "#58e8c1" : skill.deltaUp === false ? "#ff7b6b" : "#9b8ec4";
  const statusBg = skill.status === "Strong" ? "rgba(88,232,193,0.15)" : skill.status === "Building" ? "rgba(255,209,102,0.15)" : "rgba(155,114,255,0.15)";
  const statusColor = skill.status === "Strong" ? "#58e8c1" : skill.status === "Building" ? "#ffd166" : "#9b72ff";

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#e8e4f8" }}>{skill.name}</span>
          <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "#9b8ec4" }}>{skill.subject}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: pctColor }}>{skill.pct}%</span>
          <span style={{ fontSize: "0.72rem", color: deltaColor, fontWeight: 600 }}>{skill.delta}</span>
          <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: "0.65rem", fontWeight: 700, background: statusBg, color: statusColor }}>{skill.status}</span>
        </div>
      </div>
      <div style={{ height: 7, background: "rgba(155,114,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${skill.pct}%`, background: skill.bar, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function HeatmapDot({ day }: { day: HeatmapDayProps }) {
  const intensity = day.sessions === 3 ? 1 : day.sessions === 2 ? 0.7 : day.sessions === 1 ? 0.4 : 0;
  const bg = day.active
    ? `rgba(155,114,255,${0.2 + intensity * 0.8})`
    : "rgba(255,255,255,0.05)";
  const border = day.active ? "1px solid rgba(155,114,255,0.5)" : "1px solid rgba(255,255,255,0.08)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: bg,
        border,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.72rem",
        fontWeight: 700,
        color: day.active ? "#e8e4f8" : "#4a3a7a",
      }}>
        {day.active ? day.sessions : "·"}
      </div>
      <span style={{ fontSize: "0.65rem", color: "#9b8ec4", fontWeight: 600 }}>{day.label}</span>
    </div>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <div style={{ textAlign: "center", color: "#9b8ec4" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>🌙</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Loading report…</div>
      </div>
    </div>
  );
}

function AuthGate({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      maxWidth: 420,
      margin: "60px auto",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(155,114,255,0.25)",
      borderRadius: 20,
      padding: "36px 32px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔒</div>
      <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#e8e4f8", marginBottom: 8 }}>Sign in to view this report</div>
      <div style={{ fontSize: "0.85rem", color: "#9b8ec4", marginBottom: 28, lineHeight: 1.5 }}>
        Your weekly report is ready. Sign into Family Hub to see Maya&apos;s progress.
      </div>
      <Link
        href="/parent"
        style={{
          display: "inline-block",
          padding: "12px 28px",
          background: "#9b72ff",
          color: "#fff",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: "0.88rem",
          textDecoration: "none",
        }}
      >
        Go to Family Hub
      </Link>
      <div style={{ marginTop: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#9b8ec4", fontSize: "0.8rem", cursor: "pointer" }}>
          ← Back
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentWeeklyReportPage() {
  const [session, setSession] = useState<ParentAccessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function trySessionRestore() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });
        if (!response.ok || cancelled) {
          setLoading(false);
          return;
        }
        const payload = (await response.json()) as ParentAccessResponse;
        if (cancelled) return;
        setSession(payload);
        setAuthed(true);
      } catch {
        // No valid session — show auth gate.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void trySessionRestore();
    return () => { cancelled = true; };
  }, []);

  const childName = session?.linkedChild?.displayName ?? session?.linkedChildren[0]?.displayName ?? "Maya";
  const avatarKey = session?.linkedChild?.avatarKey ?? session?.linkedChildren[0]?.avatarKey ?? "";
  const bandCode = session?.linkedChild?.launchBandCode ?? session?.linkedChildren[0]?.launchBandCode ?? "k1";
  const level = session?.linkedChild?.currentLevel ?? session?.linkedChildren[0]?.currentLevel ?? 2;

  function getAvatarSymbol(key: string) {
    if (key.includes("bunny")) return "🐰";
    if (key.includes("bear")) return "🐻";
    if (key.includes("lion")) return "🦁";
    if (key.includes("fox")) return "🦊";
    if (key.includes("panda")) return "🐼";
    if (key.includes("owl")) return "🦉";
    return "🦁";
  }

  function getBandLabel(code: string) {
    if (code.startsWith("pre")) return "Pre-K";
    if (code.startsWith("k1")) return "K–1";
    if (code.startsWith("g2")) return "Grade 2";
    if (code.startsWith("g3")) return "Grade 3";
    return "K–1";
  }

  const BASE = "#100b2e";
  const MINT = "#58e8c1";
  const VIOLET = "#9b72ff";
  const GOLD = "#ffd166";
  const CORAL = "#ff7b6b";

  // Suppress unused var warnings for palette constants used inline
  void MINT; void CORAL;

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div style={{
        background: `linear-gradient(160deg, ${BASE} 0%, #1a1248 50%, #0e1a38 100%)`,
        minHeight: "100vh",
        padding: "0 0 60px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e8e4f8",
      }}>

        {/* ── Page header ── */}
        <div style={{
          padding: "24px 32px 0",
          maxWidth: 1100,
          margin: "0 auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Link
              href="/parent"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: VIOLET,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "6px 12px",
                background: "rgba(155,114,255,0.12)",
                borderRadius: 8,
                border: "1px solid rgba(155,114,255,0.25)",
              }}
            >
              ← Family Hub
            </Link>
          </div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: VIOLET, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, marginTop: 16 }}>
            Weekly Report
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#fff", margin: 0, marginBottom: 4 }}>
            {loading ? "Loading…" : `${childName}'s week — great progress! 🌟`}
          </h1>
          <div style={{ fontSize: "0.85rem", color: "#9b8ec4", marginBottom: 24 }}>
            {WEEK_LABEL} · Generated Sunday, March 24, 2026
          </div>
        </div>

        {/* ── Auth / loading gate ── */}
        {loading && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
            <LoadingState />
          </div>
        )}

        {!loading && !authed && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
            <AuthGate onBack={() => window.history.back()} />
          </div>
        )}

        {!loading && authed && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>

            {/* ── Child identity strip ── */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              background: "rgba(155,114,255,0.1)",
              border: "1px solid rgba(155,114,255,0.25)",
              borderRadius: 14,
              marginBottom: 24,
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2a1e5e, #3d2a8a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                flexShrink: 0,
                border: `2px solid ${VIOLET}`,
              }}>
                {getAvatarSymbol(avatarKey)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{childName}</div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "2px 10px",
                  borderRadius: 12,
                  background: "rgba(155,114,255,0.2)",
                  border: "1px solid rgba(155,114,255,0.35)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#c8b0ff",
                  marginTop: 4,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: VIOLET, display: "inline-block" }} />
                  {getBandLabel(bandCode)} · Level {level} Star Explorer
                </div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: "0.82rem", color: "#9b8ec4" }}>
                Week of {WEEK_LABEL}
              </div>
            </div>

            {/* ── 4 Stat tiles ── */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
              {STAT_TILES.map((tile) => (
                <StatTile key={tile.label} label={tile.label} value={tile.value} color={tile.color} delta={tile.delta} deltaUp={tile.deltaUp} />
              ))}
            </div>

            {/* ── 2-col main layout ── */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 20, marginBottom: 24 }}>

              {/* LEFT column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Skills practiced */}
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(155,114,255,0.2)",
                  borderRadius: 16,
                  padding: "22px 24px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <span style={{ fontSize: "1.1rem" }}>📚</span>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8" }}>Skills practiced this week</span>
                  </div>
                  {SKILLS.map((skill) => (
                    <SkillBar key={skill.name} skill={skill} />
                  ))}
                  <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(155,114,255,0.1)", borderRadius: 8, fontSize: "0.72rem", color: "#9b8ec4" }}>
                    Accuracy % shown for parent context only — children see stars.
                  </div>
                </div>

                {/* Day-by-day heatmap */}
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(155,114,255,0.2)",
                  borderRadius: 16,
                  padding: "22px 24px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <span style={{ fontSize: "1.1rem" }}>📅</span>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8" }}>Day-by-day activity</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#9b8ec4" }}>Mon – Sun · number = sessions</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
                    {HEATMAP_DAYS.map((day) => (
                      <HeatmapDot key={day.label} day={day} />
                    ))}
                  </div>
                  <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "#9b8ec4" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(155,114,255,0.9)" }} />
                      3 sessions (full day)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "#9b8ec4" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(155,114,255,0.55)" }} />
                      2 sessions
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "#9b8ec4" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
                      No session
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Highlights card */}
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(88,232,193,0.2)",
                  borderRadius: 16,
                  padding: "22px 24px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <span style={{ fontSize: "1.1rem" }}>🌟</span>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8" }}>Highlights</span>
                  </div>

                  {/* Top skill */}
                  <div style={{
                    padding: "12px 14px",
                    background: "rgba(155,114,255,0.12)",
                    border: "1px solid rgba(155,114,255,0.25)",
                    borderRadius: 12,
                    marginBottom: 10,
                  }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: VIOLET, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Top skill
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e8e4f8" }}>Rhyming words</div>
                    <div style={{ fontSize: "0.78rem", color: "#9b8ec4", marginTop: 3 }}>
                      Jumped from 76% → 88% — a big milestone for Kindergarten!
                    </div>
                  </div>

                  {/* Best day */}
                  <div style={{
                    padding: "12px 14px",
                    background: "rgba(255,209,102,0.1)",
                    border: "1px solid rgba(255,209,102,0.2)",
                    borderRadius: 12,
                    marginBottom: 10,
                  }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Best day
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e8e4f8" }}>Wednesday</div>
                    <div style={{ fontSize: "0.78rem", color: "#9b8ec4", marginTop: 3 }}>
                      3 sessions completed · 15 min total learning time
                    </div>
                  </div>

                  {/* Milestone */}
                  <div style={{
                    padding: "12px 14px",
                    background: "rgba(255,123,107,0.1)",
                    border: "1px solid rgba(255,123,107,0.2)",
                    borderRadius: 12,
                  }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Milestone
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e8e4f8" }}>5-day streak 🔥</div>
                    <div style={{ fontSize: "0.78rem", color: "#9b8ec4", marginTop: 3 }}>
                      New personal record! Completed every school day this week.
                    </div>
                  </div>
                </div>

                {/* What to try next */}
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(155,114,255,0.2)",
                  borderRadius: 16,
                  padding: "22px 24px",
                  flex: 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <span style={{ fontSize: "1.1rem" }}>💡</span>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8" }}>What to try next</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      {
                        icon: "🎵",
                        title: "Keep the rhyming going",
                        body: `Rhyming jumped to 88%! Try rhyme games in the car — "I say cat, you say a word that rhymes!"`,
                        tag: "High impact",
                        tagBg: "rgba(155,114,255,0.2)",
                        tagColor: VIOLET,
                      },
                      {
                        icon: "🔢",
                        title: "Make counting hands-on",
                        body: "Counting is at 60% and stable. Real-world counting helps — try counting stairs, apples, or steps.",
                        tag: "Building",
                        tagBg: "rgba(255,209,102,0.15)",
                        tagColor: GOLD,
                      },
                      {
                        icon: "📚",
                        title: "Point to words in books",
                        body: "Point to simple words like \"the\", \"is\", \"on\" while reading aloud together.",
                        tag: "First words",
                        tagBg: "rgba(88,232,193,0.15)",
                        tagColor: "#58e8c1",
                      },
                    ].map((item) => (
                      <div key={item.title} style={{
                        display: "flex",
                        gap: 12,
                        padding: "12px 14px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(155,114,255,0.12)",
                        borderRadius: 12,
                      }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: "rgba(155,114,255,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1rem",
                          flexShrink: 0,
                        }}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#e8e4f8", marginBottom: 3 }}>{item.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9b8ec4", lineHeight: 1.5 }}>{item.body}</div>
                          <span style={{
                            display: "inline-block",
                            marginTop: 6,
                            padding: "2px 9px",
                            borderRadius: 10,
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            background: item.tagBg,
                            color: item.tagColor,
                          }}>
                            {item.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Full session log ── */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(155,114,255,0.2)",
              borderRadius: 16,
              padding: "22px 24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <span style={{ fontSize: "1.1rem" }}>🗓️</span>
                <span style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8" }}>Full session log</span>
                <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#9b8ec4" }}>{SESSION_LOG.length} sessions this week</span>
              </div>

              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1.8fr 70px 1fr 60px 40px",
                gap: 8,
                padding: "8px 14px",
                background: "rgba(155,114,255,0.08)",
                borderRadius: 8,
                marginBottom: 6,
                fontSize: "0.67rem",
                fontWeight: 700,
                color: "#9b8ec4",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                <span>Date</span>
                <span>Stars</span>
                <span>Skills practiced</span>
                <span style={{ textAlign: "right" }}>Time</span>
                <span style={{ textAlign: "center" }}>Perf.</span>
              </div>

              {/* Rows */}
              {SESSION_LOG.map((session, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.8fr 70px 1fr 60px 40px",
                    gap: 8,
                    padding: "11px 14px",
                    borderRadius: 9,
                    background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    borderBottom: i < SESSION_LOG.length - 1 ? "1px solid rgba(155,114,255,0.08)" : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.8rem", color: "#c8b8f0" }}>{session.day}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.82rem", color: GOLD }}>⭐ {session.stars}</span>
                  <span style={{ fontSize: "0.78rem", color: "#9b8ec4" }}>{session.skills}</span>
                  <span style={{ fontSize: "0.75rem", color: "#9b8ec4", textAlign: "right" }}>{session.duration}</span>
                  <span style={{ textAlign: "center", fontSize: "0.85rem" }}>{session.perfect ? "⭐" : ""}</span>
                </div>
              ))}

              <div style={{ marginTop: 12, padding: "8px 14px", background: "rgba(155,114,255,0.08)", borderRadius: 8, fontSize: "0.72rem", color: "#9b8ec4" }}>
                ⭐ in Perf. column = perfect session (every question correct)
              </div>
            </div>

          </div>
        )}
      </div>
    </AppFrame>
  );
}
