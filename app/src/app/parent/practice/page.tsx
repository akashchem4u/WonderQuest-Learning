"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  faint: "rgba(255,255,255,0.07)",
  border: "rgba(155,114,255,0.18)",
  red: "#f87171",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

type LinkedChild = {
  id: string;
  displayName: string;
  avatarKey?: string;
  launchBandCode?: string;
};

type ParentSession = {
  linkedChildren: LinkedChild[];
  linkedChild?: LinkedChild;
  childDashboards?: { studentId: string; lastSessionAt: string | null }[];
};

type SkillRow = {
  skillCode?: string;
  skillName?: string;
  skillLabel?: string;
  skillId?: string;
  subject?: string;
  subjectCode?: string;
  masteryPct?: number;
  accuracy?: number;
  correctCount?: number;
  totalCount?: number;
  sessionsCount?: number;
  sessionCount?: number;
  lastPracticed?: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function skillDisplayName(s: SkillRow): string {
  return s.skillLabel ?? s.skillName ?? s.skillCode ?? "Unknown skill";
}

function skillMastery(s: SkillRow): number {
  if (typeof s.masteryPct === "number") return s.masteryPct;
  if (typeof s.accuracy === "number") return s.accuracy;
  if (s.correctCount != null && s.totalCount != null && s.totalCount > 0) {
    return Math.round((s.correctCount / s.totalCount) * 100);
  }
  return 0;
}

function subjectLabel(s: SkillRow): string {
  const raw = (s.subject ?? s.subjectCode ?? "").toLowerCase();
  if (raw.includes("read") || raw.includes("phonics") || raw.includes("spell")) return "Reading";
  if (raw.includes("math") || raw.includes("number")) return "Maths";
  return s.subject ?? s.subjectCode ?? "General";
}

function subjectColor(s: SkillRow): string {
  const sub = subjectLabel(s);
  if (sub === "Reading") return C.mint;
  if (sub === "Maths") return C.violet;
  return C.gold;
}

function subjectIcon(s: SkillRow): string {
  const sub = subjectLabel(s);
  if (sub === "Reading") return "📖";
  if (sub === "Maths") return "🔢";
  return "✨";
}

function prioritySort(skills: SkillRow[]): SkillRow[] {
  return [...skills].sort((a, b) => skillMastery(a) - skillMastery(b));
}

function hadSessionToday(lastSessionAt: string | null | undefined): boolean {
  if (!lastSessionAt) return false;
  const d = new Date(lastSessionAt);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MasteryBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 7, background: C.faint, borderRadius: 4, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
    </div>
  );
}

function LoginPrompt() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
        Parent sign-in required
      </div>
      <div style={{ fontSize: "0.85rem", color: C.muted, marginBottom: 24 }}>
        Sign in to your parent account to view practice recommendations.
      </div>
      <Link
        href="/parent"
        style={{ display: "inline-block", padding: "12px 28px", background: C.violet, color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}
      >
        Sign in →
      </Link>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ParentPracticePage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [lastSessionAt, setLastSessionAt] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 1: session + children list
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
        const stored = typeof localStorage !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
        const chosen = stored && list.some((c) => c.id === stored) ? stored : (list[0]?.id ?? null);
        setActiveChildId(chosen);
        // Extract last session date for chosen child
        const dash = data.childDashboards?.find((d) => d.studentId === chosen);
        setLastSessionAt(dash?.lastSessionAt ?? null);
        setAuthed(true);
      })
      .catch(() => { setAuthed(false); setLoading(false); });
  }, []);

  // Step 2: fetch skills when child selected
  useEffect(() => {
    if (!activeChildId || authed !== true) return;
    setLoading(true);
    setError(null);
    fetch(`/api/parent/skills?childId=${encodeURIComponent(activeChildId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); }
        else { setSkills(data.skills ?? []); }
      })
      .catch(() => setError("Could not load skill data."))
      .finally(() => setLoading(false));
  }, [activeChildId, authed]);

  const sorted = prioritySort(skills);
  const inProgress = sorted.filter((s) => skillMastery(s) < 100);
  const mastered = sorted.filter((s) => skillMastery(s) >= 100);
  const focusSkills = inProgress.slice(0, 3);
  const child = children.find((c) => c.id === activeChildId);
  const childName = child?.displayName ?? "your child";
  const sessionToday = hadSessionToday(lastSessionAt);

  return (
    <AppFrame audience="parent" currentPath="/parent/practice">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui,-apple-system,sans-serif",
          color: C.text,
        }}
      >
        {/* Top bar */}
        <div style={{ background: "rgba(22,27,34,0.95)", borderBottom: `1px solid rgba(255,255,255,0.06)`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link href="/parent" style={{ fontSize: "0.8rem", fontWeight: 600, color: C.muted, textDecoration: "none" }}>
            ← Dashboard
          </Link>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: C.text }}>Practice Today</div>
          {children.length > 1 && (
            <select
              value={activeChildId ?? ""}
              onChange={(e) => {
                setActiveChildId(e.target.value);
                if (e.target.value) localStorage.setItem("wq_active_student_id", e.target.value);
              }}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: "0.8rem", padding: "5px 10px", cursor: "pointer" }}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          )}
          {children.length <= 1 && <div style={{ width: 80 }} />}
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 80px" }}>

          {authed === false && <LoginPrompt />}

          {authed !== false && loading && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, textAlign: "center", color: C.muted, fontSize: "0.88rem" }}>
              Loading practice data…
            </div>
          )}

          {authed !== false && !loading && error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "16px 20px", fontSize: "0.88rem", color: C.red, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {authed === true && !loading && !error && (
            <>
              {/* Page heading */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, marginBottom: 4 }}>
                  📚 Practice Today
                </h1>
                <p style={{ fontSize: "0.85rem", color: C.muted, margin: 0 }}>
                  {childName}&apos;s recommended practice session
                </p>
              </div>

              {/* Streak reminder */}
              {!sessionToday && (
                <div style={{ background: "rgba(255,209,102,0.08)", border: "1px solid rgba(255,209,102,0.2)", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.4rem" }}>🔥</span>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.text }}>No session today yet — keep the streak going!</div>
                    <div style={{ fontSize: "0.78rem", color: C.muted, marginTop: 2 }}>Encourage {childName} to play even a short session today.</div>
                  </div>
                </div>
              )}
              {sessionToday && (
                <div style={{ background: "rgba(80,232,144,0.08)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.4rem" }}>✅</span>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.text }}>Session done today!</div>
                    <div style={{ fontSize: "0.78rem", color: C.muted, marginTop: 2 }}>Great work — {childName} already practiced today.</div>
                  </div>
                </div>
              )}

              {/* Tip */}
              <div style={{ background: "rgba(155,114,255,0.07)", border: "1px solid rgba(155,114,255,0.15)", borderRadius: 14, padding: "12px 18px", marginBottom: 24, fontSize: "0.82rem", color: "#c4a8ff", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0 }}>💡</span>
                <span>Best time to practice: right after school for 15 minutes — memory consolidation is highest then.</span>
              </div>

              {/* Skills in progress */}
              {inProgress.length === 0 && skills.length === 0 ? (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, textAlign: "center", color: C.muted, fontSize: "0.88rem", marginBottom: 20 }}>
                  <div style={{ fontSize: "2rem", marginBottom: 10 }}>🌱</div>
                  No skill data yet. Skills appear after {childName} completes sessions.
                </div>
              ) : inProgress.length === 0 ? (
                <div style={{ background: "rgba(80,232,144,0.08)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 20, fontSize: "0.88rem", color: C.mint }}>
                  🌟 All skills mastered — amazing progress! New challenges are unlocking automatically.
                </div>
              ) : (
                <>
                  {/* Today's focus — top 3 skills */}
                  <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: C.muted, marginBottom: 10 }}>
                    Today&apos;s focus
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {focusSkills.map((skill, i) => {
                      const pct = skillMastery(skill);
                      const color = subjectColor(skill);
                      const icon = subjectIcon(skill);
                      const subj = subjectLabel(skill);
                      return (
                        <div
                          key={skill.skillCode ?? skill.skillId ?? i}
                          style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 14,
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                            {icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {skillDisplayName(skill)}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: C.muted, marginBottom: 1 }}>{subj}</div>
                            <MasteryBar pct={pct} color={color} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: pct < 50 ? C.amber : color }}>
                              {pct}%
                            </span>
                            <Link
                              href="/play"
                              style={{
                                display: "inline-block",
                                padding: "5px 14px",
                                background: C.violet,
                                color: "#fff",
                                borderRadius: 8,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Practice
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* All in-progress skills */}
                  {inProgress.length > 3 && (
                    <>
                      <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: C.muted, marginBottom: 10 }}>
                        All skills in progress
                      </div>
                      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
                        {inProgress.map((skill, i) => {
                          const pct = skillMastery(skill);
                          const color = subjectColor(skill);
                          return (
                            <div
                              key={skill.skillCode ?? skill.skillId ?? i}
                              style={{ padding: "12px 16px", borderBottom: i < inProgress.length - 1 ? `1px solid ${C.faint}` : "none", display: "flex", alignItems: "center", gap: 12 }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.84rem", fontWeight: 600, color: C.text, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {skillDisplayName(skill)}
                                </div>
                                <MasteryBar pct={pct} color={color} />
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: pct < 50 ? C.amber : color }}>{pct}%</span>
                                <Link
                                  href="/play"
                                  style={{ padding: "4px 12px", background: "rgba(155,114,255,0.15)", border: `1px solid rgba(155,114,255,0.3)`, borderRadius: 7, fontSize: "0.72rem", fontWeight: 700, color: C.violet, textDecoration: "none" }}
                                >
                                  Practice
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Mastered skills callout */}
              {mastered.length > 0 && (
                <div style={{ background: "rgba(80,232,144,0.07)", border: "1px solid rgba(80,232,144,0.15)", borderRadius: 14, padding: "14px 18px", marginBottom: 24 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: C.mint, marginBottom: 6 }}>
                    ✅ {mastered.length} skill{mastered.length !== 1 ? "s" : ""} mastered
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {mastered.map((sk, i) => (
                      <span key={sk.skillCode ?? sk.skillId ?? i} style={{ background: "rgba(80,232,144,0.12)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 8, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600, color: C.mint }}>
                        {skillDisplayName(sk)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary CTA */}
              <Link
                href="/play"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "15px 20px",
                  background: C.violet,
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  fontSize: "1rem",
                  fontWeight: 800,
                  textAlign: "center",
                  textDecoration: "none",
                  marginBottom: 14,
                  boxSizing: "border-box",
                }}
              >
                Start practice session ✨
              </Link>
              <div style={{ fontSize: "0.75rem", color: C.muted, textAlign: "center", marginBottom: 28 }}>
                {childName} needs to be signed in on the child device to play.
              </div>

              {/* Footer nav */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <Link href="/parent/weekly" style={{ fontSize: "0.84rem", fontWeight: 700, color: C.violet, textDecoration: "none" }}>
                  Weekly report →
                </Link>
                <Link href="/parent/benchmark" style={{ fontSize: "0.84rem", fontWeight: 700, color: C.muted, textDecoration: "none" }}>
                  Benchmarks →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
