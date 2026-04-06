"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type EarnedMilestone = {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

type SkillProgress = {
  masteryPct: number;
  totalCount: number;
};

// ─── Static milestone definitions ─────────────────────────────────────────────

type MilestoneDef = {
  key: string;
  icon: string;
  name: string;
  description: string;
  /** returns true when conditions are met from live data */
  check: (data: MilestoneData) => boolean;
  /** for ordering progress display — threshold value */
  threshold?: number;
  thresholdLabel?: string;
};

type MilestoneData = {
  sessionCount: number;
  masteredSkillCount: number;
  streakDays: number;
  badgeCount: number;
  totalStars: number;
  earnedTypes: Set<string>;
};

const MILESTONE_DEFS: MilestoneDef[] = [
  {
    key: "first_session",
    icon: "🚀",
    name: "First session completed",
    description: "Completed the very first learning session.",
    check: (d) => d.sessionCount >= 1,
    threshold: 1,
    thresholdLabel: "session",
  },
  {
    key: "sessions_5",
    icon: "🎯",
    name: "5 sessions completed",
    description: "Built a learning habit with 5 sessions.",
    check: (d) => d.sessionCount >= 5,
    threshold: 5,
    thresholdLabel: "sessions",
  },
  {
    key: "sessions_10",
    icon: "🏅",
    name: "10 sessions completed",
    description: "Dedicated learner — 10 sessions done!",
    check: (d) => d.sessionCount >= 10,
    threshold: 10,
    thresholdLabel: "sessions",
  },
  {
    key: "first_skill",
    icon: "💡",
    name: "First skill mastered",
    description: "Reached 70%+ mastery on a skill for the first time.",
    check: (d) => d.masteredSkillCount >= 1 || d.earnedTypes.has("badge") || d.earnedTypes.has("milestone-earned"),
    threshold: 1,
    thresholdLabel: "skill mastered",
  },
  {
    key: "streak_3",
    icon: "🔥",
    name: "3-day streak",
    description: "Practiced 3 days in a row.",
    check: (d) => d.streakDays >= 3 || d.earnedTypes.has("streak"),
    threshold: 3,
    thresholdLabel: "days",
  },
  {
    key: "streak_10",
    icon: "⚡",
    name: "10-day streak",
    description: "Incredible dedication — 10 days in a row!",
    check: (d) => d.streakDays >= 10,
    threshold: 10,
    thresholdLabel: "days",
  },
  {
    key: "first_badge",
    icon: "🏆",
    name: "First badge earned",
    description: "Unlocked the first achievement badge.",
    check: (d) => d.badgeCount >= 1 || d.earnedTypes.has("badge"),
    threshold: 1,
    thresholdLabel: "badge",
  },
  {
    key: "stars_100",
    icon: "⭐",
    name: "100 stars earned",
    description: "Collected 100 stars across all sessions.",
    check: (d) => d.totalStars >= 100,
    threshold: 100,
    thresholdLabel: "stars",
  },
  {
    key: "stars_500",
    icon: "🌟",
    name: "500 stars earned",
    description: "Star superstar — 500 stars collected!",
    check: (d) => d.totalStars >= 500,
    threshold: 500,
    thresholdLabel: "stars",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(iso);
}

// ─── Milestone card ───────────────────────────────────────────────────────────

function MilestoneCard({
  def,
  earned,
  earnedAt,
}: {
  def: MilestoneDef;
  earned: boolean;
  earnedAt: string | null;
}) {
  return (
    <div style={{
      background: earned
        ? "rgba(255,255,255,0.05)"
        : "rgba(255,255,255,0.02)",
      border: earned
        ? "1px solid rgba(255,209,102,0.28)"
        : "1px solid rgba(255,255,255,0.07)",
      borderRadius: "16px",
      padding: "18px",
      display: "flex",
      gap: "14px",
      alignItems: "flex-start",
      opacity: earned ? 1 : 0.55,
      transition: "opacity 0.15s, border-color 0.15s",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Icon */}
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: earned
          ? "rgba(255,209,102,0.15)"
          : "rgba(255,255,255,0.05)",
        border: earned
          ? "1px solid rgba(255,209,102,0.25)"
          : "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        flexShrink: 0,
        filter: earned ? "none" : "grayscale(1)",
      }}>
        {earned ? def.icon : "🔒"}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
          flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: "0.88rem",
            fontWeight: 700,
            color: earned ? "#f0f6ff" : "rgba(255,255,255,0.45)",
          }}>
            {def.name}
          </span>
          {earned && (
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "20px",
              background: "rgba(80,232,144,0.15)",
              color: "#50e890",
              border: "1px solid rgba(80,232,144,0.28)",
            }}>
              ✓ Earned
            </span>
          )}
        </div>
        <div style={{
          fontSize: "0.76rem",
          color: earned ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.28)",
          marginBottom: earnedAt ? "6px" : 0,
          lineHeight: 1.4,
        }}>
          {def.description}
        </div>
        {earnedAt && (
          <div style={{
            fontSize: "0.70rem",
            color: "#ffd166",
            fontWeight: 600,
          }}>
            {relativeDate(earnedAt)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentMilestonesPage() {
  const [earned, setEarned] = useState<EarnedMilestone[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const studentId =
      typeof window !== "undefined"
        ? (new URLSearchParams(window.location.search).get("studentId") ??
            localStorage.getItem("wq_active_student_id"))
        : null;

    if (!studentId) {
      setError("No child selected. Please go back to Family Hub and select a child.");
      setLoading(false);
      return;
    }

    // Fetch milestones, skills, and session data in parallel
    const milestoneFetch = fetch(`/api/parent/milestones?studentId=${encodeURIComponent(studentId)}`)
      .then(async (res) => {
        if (res.status === 401) throw new Error("Session expired. Please sign in again.");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Failed to load milestones.");
        }
        return res.json() as Promise<{ milestones: EarnedMilestone[] }>;
      })
      .then(({ milestones }) => setEarned(milestones ?? []));

    const skillsFetch = fetch(`/api/parent/skills?studentId=${encodeURIComponent(studentId)}`)
      .then(async (res) => {
        if (!res.ok) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await res.json() as { skills: any[] };
        const mapped: SkillProgress[] = (data.skills ?? []).map((s) => ({
          masteryPct: Number(s.masteryScore ?? s.masteryPct ?? 0),
          totalCount: Number(s.attempts ?? s.totalCount ?? 0),
        }));
        setSkills(mapped);
      })
      .catch(() => {});

    const sessionFetch = fetch("/api/parent/session")
      .then(async (res) => {
        if (!res.ok) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await res.json() as Record<string, any>;
        // restoreParentSession returns children array with stats
        const children: Record<string, unknown>[] = Array.isArray(data.children) ? data.children : [];
        const child = children.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => String(c.studentId ?? c.id ?? "") === studentId
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as Record<string, any> | undefined;
        if (child) {
          setSessionCount(Number(child.sessionCount ?? child.totalSessions ?? 0));
          setStreakDays(Number(child.currentStreakDays ?? child.streakDays ?? 0));
          setBadgeCount(Number(child.badgeCount ?? 0));
          setTotalStars(Number(child.totalStars ?? child.starsEarned ?? 0));
        }
      })
      .catch(() => {});

    Promise.all([milestoneFetch, skillsFetch, sessionFetch])
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load milestones.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Derive milestone state ──
  const earnedTypeSet = useMemo(
    () => new Set(earned.map((e) => e.type)),
    [earned],
  );

  const masteredSkillCount = skills.filter((s) => s.masteryPct >= 70).length;

  const milestoneData: MilestoneData = {
    sessionCount,
    masteredSkillCount,
    streakDays,
    badgeCount,
    totalStars,
    earnedTypes: earnedTypeSet,
  };

  // Map each def to earned status + earliest earned notification timestamp
  const milestoneRows = useMemo(() => {
    return MILESTONE_DEFS.map((def) => {
      const isEarned = def.check(milestoneData);
      // Best-effort: find matching earned notification by type
      const matchingNotif = earned.find((e) =>
        e.type === def.key ||
        (def.key === "first_badge" && e.type === "badge") ||
        (def.key === "streak_3" && e.type === "streak") ||
        (def.key === "first_skill" && (e.type === "badge" || e.type === "milestone-earned"))
      );
      return {
        def,
        earned: isEarned,
        earnedAt: matchingNotif?.createdAt ?? null,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earned, sessionCount, masteredSkillCount, streakDays, badgeCount, totalStars]);

  const earnedCount = milestoneRows.filter((r) => r.earned).length;
  const lockedRows  = milestoneRows.filter((r) => !r.earned);

  // ── Next milestone progress teaser ──
  const nextMilestone = useMemo(() => {
    // Find first locked milestone with a session-count based threshold
    const sessionMilestones = [
      { threshold: 1,  current: sessionCount, label: "session", name: "First session" },
      { threshold: 5,  current: sessionCount, label: "sessions", name: "5 sessions" },
      { threshold: 10, current: sessionCount, label: "sessions", name: "10 sessions" },
    ];
    for (const m of sessionMilestones) {
      if (sessionCount < m.threshold) {
        const remaining = m.threshold - sessionCount;
        return `${remaining} more session${remaining !== 1 ? "s" : ""} until the "${m.name}" milestone!`;
      }
    }
    if (masteredSkillCount === 0) return "Master your first skill to unlock the next milestone!";
    if (totalStars < 100) {
      const remaining = 100 - totalStars;
      return `${remaining} more stars until the "100 stars" milestone!`;
    }
    if (totalStars < 500) {
      const remaining = 500 - totalStars;
      return `${remaining} more stars until the "500 stars" milestone!`;
    }
    return null;
  }, [sessionCount, masteredSkillCount, totalStars]);

  return (
    <AppFrame audience="parent" currentPath="/parent/milestones">
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #100b2e 0%, #1a1248 55%, #0e1a38 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f0f6ff",
      }}>
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "24px 24px 60px" }}>

          {/* ── Top bar ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <Link href="/parent" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "#9b72ff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "13px",
              padding: "6px 12px",
              background: "rgba(155,114,255,0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(155,114,255,0.22)",
            }}>
              ← Home
            </Link>
            <Link href="/parent/skills" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "13px",
              padding: "6px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              📊 Skills
            </Link>
          </div>

          {/* ── Header ── */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{
              margin: "0 0 6px",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 900,
              color: "#f0f6ff",
              letterSpacing: "-0.01em",
            }}>
              🏆 Milestones
            </h1>
            {!loading && !error && (
              <p style={{ margin: 0, fontSize: "0.84rem", color: "rgba(255,255,255,0.42)" }}>
                <span style={{ color: "#ffd166", fontWeight: 700 }}>{earnedCount}</span>
                {" of "}
                <span style={{ fontWeight: 700 }}>{MILESTONE_DEFS.length}</span>
                {" milestones earned"}
                {sessionCount > 0 && (
                  <> · {sessionCount} session{sessionCount !== 1 ? "s" : ""} completed</>
                )}
              </p>
            )}
          </div>

          {/* ── Next milestone teaser ── */}
          {!loading && !error && nextMilestone && lockedRows.length > 0 && (
            <div style={{
              background: "rgba(155,114,255,0.10)",
              border: "1px solid rgba(155,114,255,0.22)",
              borderRadius: "14px",
              padding: "14px 18px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span style={{ fontSize: "1.2rem" }}>🎯</span>
              <span style={{ fontSize: "0.84rem", color: "#c4a8ff", fontWeight: 600 }}>
                {nextMilestone}
              </span>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              flexDirection: "column",
              gap: "12px",
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(155,114,255,0.2)",
                borderTop: "3px solid #9b72ff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>Loading milestones…</span>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={{
              background: "rgba(255,123,107,0.1)",
              border: "1px solid rgba(255,123,107,0.25)",
              borderRadius: "12px",
              padding: "20px",
              color: "#ff7b6b",
              fontSize: "0.88rem",
              fontWeight: 600,
              textAlign: "center",
            }}>
              {error}
              <br />
              <Link href="/parent" style={{ color: "#9b72ff", marginTop: "8px", display: "inline-block" }}>
                ← Go back to Family Hub
              </Link>
            </div>
          )}

          {/* ── Milestone list ── */}
          {!loading && !error && (
            <>
              {/* Earned section */}
              {earnedCount > 0 && (
                <div style={{ marginBottom: "32px" }}>
                  <h2 style={{
                    margin: "0 0 14px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#50e890",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    ✓ Earned ({earnedCount})
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {milestoneRows
                      .filter((r) => r.earned)
                      .map((r) => (
                        <MilestoneCard
                          key={r.def.key}
                          def={r.def}
                          earned={true}
                          earnedAt={r.earnedAt}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Locked section */}
              {lockedRows.length > 0 && (
                <div>
                  <h2 style={{
                    margin: "0 0 14px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    🔒 Locked ({lockedRows.length})
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {lockedRows.map((r) => (
                      <MilestoneCard
                        key={r.def.key}
                        def={r.def}
                        earned={false}
                        earnedAt={null}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All done */}
              {lockedRows.length === 0 && earnedCount === MILESTONE_DEFS.length && (
                <div style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#ffd166",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                }}>
                  🌟 All milestones unlocked! Amazing learner!
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </AppFrame>
  );
}
