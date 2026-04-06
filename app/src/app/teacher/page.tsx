import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { FeedbackForm } from "@/components/feedback-form";
import { ShellCard, StatTile } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import { getTeacherOverview, getTeacherSkillDetail } from "@/lib/prototype-service";
import TeacherGate from "./teacher-gate";

export const dynamic = "force-dynamic";

type TeacherPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type TeacherQueueTier = "all" | "support" | "watch" | "strong";

function getSingleSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0];
}

function dedupeSkills<T extends { skillCode: string }>(skills: T[]) {
  const seen = new Set<string>();
  return skills.filter((skill) => {
    if (seen.has(skill.skillCode)) {
      return false;
    }

    seen.add(skill.skillCode);
    return true;
  });
}

function formatShortDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function formatDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function formatSessionModeLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getTeacherQueueTier(masteryRate: number): Exclude<TeacherQueueTier, "all"> {
  if (masteryRate >= 80) {
    return "strong";
  }

  if (masteryRate >= 60) {
    return "watch";
  }

  return "support";
}

function getTeacherQueueTierLabel(tier: Exclude<TeacherQueueTier, "all">) {
  if (tier === "strong") {
    return "Strong";
  }

  if (tier === "watch") {
    return "Watch";
  }

  return "Flag";
}

function buildTeacherQueueSummary(
  displayName: string,
  tier: Exclude<TeacherQueueTier, "all">,
  learnerCount: number,
  remediationCount: number,
) {
  if (tier === "strong") {
    return `${displayName} is a class confidence anchor. Reuse it as a warm-up before moving into the next support lane.`;
  }

  if (tier === "watch") {
    return `${learnerCount} learners are close, but ${displayName} still needs one guided pass to steady first-try success.`;
  }

  return `${learnerCount} learners are still building ${displayName}. ${remediationCount} support triggers show it needs slower modeling and retries.`;
}

function buildTeacherQueueAction(
  displayName: string,
  tier: Exclude<TeacherQueueTier, "all">,
) {
  if (tier === "strong") {
    return `Use ${displayName} as a quick confidence win.`;
  }

  if (tier === "watch") {
    return `Run a short guided block for ${displayName}.`;
  }

  return `Plan a teacher-led retry loop for ${displayName}.`;
}

export default async function TeacherPage({ searchParams }: TeacherPageProps) {
  const configured = isTeacherAccessConfigured();
  const unlocked = await hasTeacherAccess();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedQueueTierParam = getSingleSearchParam(resolvedSearchParams.tier);
  const selectedSkillCode = getSingleSearchParam(resolvedSearchParams.skill);
  const selectedQueueTier: TeacherQueueTier =
    selectedQueueTierParam === "support" ||
    selectedQueueTierParam === "watch" ||
    selectedQueueTierParam === "strong"
      ? selectedQueueTierParam
      : "all";

  if (!unlocked) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Teacher dashboard</span>
              <h1>Access your class dashboard.</h1>
            </div>
          </section>

          <ShellCard className="shell-card-emphasis" eyebrow="Teacher" title="Unlock teacher dashboard">
            <TeacherGate configured={configured} />
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  let overview:
    | Awaited<ReturnType<typeof getTeacherOverview>>
    | null = null;
  let error = "";

  try {
    overview = await getTeacherOverview();
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Teacher dashboard is not available.";
  }

  const buildTeacherRouteHref = (
    skillCode?: string | null,
    tier: TeacherQueueTier = selectedQueueTier,
  ) => {
    const params = new URLSearchParams();

    if (tier !== "all") {
      params.set("tier", tier);
    }

    if (skillCode) {
      params.set("skill", skillCode);
    }

    const query = params.toString();
    return query ? `/teacher?${query}` : "/teacher";
  };
  const queueItems = overview
    ? [...overview.skillSummary]
        .map((skill) => {
          const tier = getTeacherQueueTier(skill.masteryRate);
          const urgencyScore =
            (100 - skill.masteryRate) * 2 +
            skill.remediationCount * 5 +
            skill.learnerCount * 4 +
            Math.min(skill.attempts, 12);

          return {
            ...skill,
            queueAction: buildTeacherQueueAction(skill.displayName, tier),
            queueSummary: buildTeacherQueueSummary(
              skill.displayName,
              tier,
              skill.learnerCount,
              skill.remediationCount,
            ),
            tier,
            tierLabel: getTeacherQueueTierLabel(tier),
            urgencyScore,
          };
        })
        .sort((left, right) => {
          if (right.urgencyScore !== left.urgencyScore) {
            return right.urgencyScore - left.urgencyScore;
          }

          if (left.masteryRate !== right.masteryRate) {
            return left.masteryRate - right.masteryRate;
          }

          return right.learnerCount - left.learnerCount;
        })
    : [];
  const filteredQueue = queueItems.filter(
    (skill) => selectedQueueTier === "all" || skill.tier === selectedQueueTier,
  );
  const selectedSkill =
    filteredQueue.find((skill) => skill.skillCode === selectedSkillCode) ??
    filteredQueue[0] ??
    (selectedQueueTier === "all"
      ? queueItems.find((skill) => skill.skillCode === selectedSkillCode) ??
        queueItems[0] ??
        null
      : null) ??
    null;
  let selectedSkillDetail:
    | Awaited<ReturnType<typeof getTeacherSkillDetail>>
    | null = null;

  if (selectedSkill) {
    try {
      selectedSkillDetail = await getTeacherSkillDetail(selectedSkill.skillCode);
    } catch {
      selectedSkillDetail = null;
    }
  }

  const queueNeighbors = dedupeSkills(
    selectedSkill
      ? [
          selectedSkill,
          ...filteredQueue.filter(
            (skill) => skill.skillCode !== selectedSkill.skillCode,
          ),
        ]
      : filteredQueue,
  ).slice(0, 6);
  const selectedSkillFirstTryRate = selectedSkill
    ? Math.round(
        (selectedSkill.firstTryCount / Math.max(selectedSkill.attempts, 1)) * 100,
      )
    : 0;
  const selectedSkillTier = selectedSkill
    ? getTeacherQueueTier(selectedSkill.masteryRate)
    : null;
  const selectedSkillTrendLabel = selectedSkill
    ? selectedSkillDetail?.trendLabel ??
      (selectedSkill.masteryRate >= 80
        ? "class confidence is building"
        : selectedSkill.masteryRate >= 60
          ? "showing mixed consistency"
          : "still needs guided support")
    : "waiting for more practice";
  const selectedSkillTierCounts = selectedSkillDetail?.tierCounts ?? {
    onTrack: 0,
    strong: 0,
    support: 0,
    watch: 0,
  };
  const selectedSkillRecentActivity = selectedSkillDetail?.recentSkillActivity ?? [];
  const selectedSkillPeer =
    selectedSkillDetail?.peerSkills.find(
      (skill) => skill.skillCode !== selectedSkill?.skillCode,
    ) ?? null;
  const selectedSkillNextActions = selectedSkill
    ? [
        {
          detail:
            selectedSkillDetail?.recommendedAction ?? selectedSkill.queueAction,
          icon: "🎯",
          kicker: "This cycle",
          title: "Run the next classroom move",
        },
        {
          detail: `Note how students respond to the next ${formatSessionModeLabel(selectedSkillRecentActivity[0]?.sessionMode ?? "guided-practice").toLowerCase()} session so you can adjust your approach.`,
          icon: "📝",
          kicker: "After class",
          title: "Capture an intervention note",
        },
        {
          detail: `Share one calm at-home follow-up for ${selectedSkill.displayName.toLowerCase()} so the practice signal stays consistent beyond the classroom.`,
          icon: "🏠",
          kicker: "Family handoff",
          title: "Prep the parent message",
        },
        {
          detail: selectedSkillPeer
            ? `Use ${selectedSkillPeer.displayName.toLowerCase()} as the confidence anchor before you return to ${selectedSkill.displayName.toLowerCase()}.`
            : `Lead with one stronger nearby skill before returning to ${selectedSkill.displayName.toLowerCase()}.`,
          icon: "👥",
          kicker: selectedSkillPeer?.displayName ?? "Warm-up",
          title: "Pair with a confidence anchor",
        },
      ]
    : [];
  const supportSignalCount = overview
    ? overview.skillSummary.filter((skill) => skill.masteryRate < 60).length
    : 0;
  const watchSignalCount = overview
    ? overview.skillSummary.filter(
        (skill) => skill.masteryRate >= 60 && skill.masteryRate < 80,
      ).length
    : 0;
  const strongSignalCount = overview
    ? overview.skillSummary.filter((skill) => skill.masteryRate >= 80).length
    : 0;
  const scoredSessions = overview
    ? overview.latestSessions.filter(
        (session) => session.effectivenessScore !== null,
      )
    : [];
  const averageEffectiveness = scoredSessions.length
    ? Math.round(
        scoredSessions.reduce(
          (total, session) => total + (session.effectivenessScore ?? 0),
          0,
        ) / scoredSessions.length,
      )
    : null;
  const averageSessionsPerLearner =
    overview && overview.counts.students > 0
      ? (overview.counts.sessions / overview.counts.students).toFixed(1)
      : "0.0";
  const queueTierCounts = {
    all: queueItems.length,
    strong: queueItems.filter((skill) => skill.tier === "strong").length,
    support: queueItems.filter((skill) => skill.tier === "support").length,
    watch: queueItems.filter((skill) => skill.tier === "watch").length,
  };
  const recentWins = overview ? overview.strengthAreas.slice(0, 3) : [];
  const recentSessions = overview ? overview.latestSessions.slice(0, 5) : [];
  const bandSnapshots = overview
    ? overview.byBand
        .filter((band) => band.studentCount > 0)
        .map((band) => {
          const bandSkills = overview.skillSummary.filter(
            (skill) => skill.launchBandCode === band.code,
          );
          const leadSkill = [...bandSkills].sort(
            (left, right) => right.masteryRate - left.masteryRate,
          )[0];
          const supportSkill = [...bandSkills].sort(
            (left, right) => left.masteryRate - right.masteryRate,
          )[0];

          return {
            ...band,
            leadSkill,
            supportSkill,
          };
        })
    : [];

  // Band coverage bar: % of total students in each band
  const totalStudents = overview?.counts.students ?? 1;

  // Sessions-this-week: bucket recent sessions by day-of-week label
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sessionsByDay: Record<string, number> = {};
  for (const label of DAY_LABELS) {
    sessionsByDay[label] = 0;
  }
  for (const session of recentSessions) {
    const d = new Date(session.startedAt);
    if (!Number.isNaN(d.getTime())) {
      const label = DAY_LABELS[d.getDay()];
      sessionsByDay[label] = (sessionsByDay[label] ?? 0) + 1;
    }
  }
  // Order Mon–Sun for display; use counts, fallback to illustrative spread if all zero
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxDayCount = Math.max(...weekDays.map((d) => sessionsByDay[d] ?? 0), 1);

  // Skill alerts from support queue top items
  const skillAlerts = queueItems
    .filter((skill) => skill.tier === "support")
    .slice(0, 4)
    .map((skill) => ({
      icon: "📌",
      text: `${skill.displayName} — ${skill.learnerCount} learner${skill.learnerCount !== 1 ? "s" : ""}, ${skill.remediationCount} support trigger${skill.remediationCount !== 1 ? "s" : ""}. ${skill.queueAction}`,
      skillCode: skill.skillCode,
    }));

  // Add strong skills as celebratory alerts
  const winAlerts = queueItems
    .filter((skill) => skill.tier === "strong")
    .slice(0, 2)
    .map((skill) => ({
      icon: "🎉",
      text: `${skill.displayName} — ${skill.learnerCount} learner${skill.learnerCount !== 1 ? "s" : ""} showing strong mastery (${skill.masteryRate}%).`,
      skillCode: skill.skillCode,
    }));

  const allAlerts = [...skillAlerts, ...winAlerts].slice(0, 4);

  // First-try rate across all skills
  const totalAttempts = overview
    ? overview.skillSummary.reduce((sum, s) => sum + s.attempts, 0)
    : 0;
  const totalFirstTry = overview
    ? overview.skillSummary.reduce((sum, s) => sum + s.firstTryCount, 0)
    : 0;
  const classFirstTryRate = totalAttempts > 0
    ? Math.round((totalFirstTry / totalAttempts) * 100)
    : null;

  // Mastery rate across all skills (average)
  const classMasteryRate = overview && overview.skillSummary.length > 0
    ? Math.round(
        overview.skillSummary.reduce((sum, s) => sum + s.masteryRate, 0) /
          overview.skillSummary.length,
      )
    : null;

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <main className="page-shell teacher-command-shell">
        {error ? (
          <ShellCard eyebrow="Teacher" title="Teacher data is not available yet">
            <p>{error}</p>
          </ShellCard>
        ) : null}

        {overview ? (
          <>
            {/* ── Hero + KPI strip ──────────────────────────── */}
            <section className="teacher-command-hero">
              <div className="teacher-command-copy shell-card shell-card-spotlight">
                <span className="shell-eyebrow">Teacher command</span>
                <h1>Class progress, intervention queue, and guided next steps.</h1>
                <div className="summary-chip-row">
                  <span className="summary-chip">Aggregate only</span>
                  <span className="summary-chip">
                    {overview.counts.students} active learners
                  </span>
                  <span className="summary-chip">
                    {averageSessionsPerLearner} sessions per learner
                  </span>
                  {selectedSkill ? (
                    <span className="summary-chip">
                      Focus: {selectedSkill.displayName}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="teacher-command-kpis">
                <StatTile
                  label="Students"
                  value={`${overview.counts.students}`}
                />
                <StatTile
                  label="Sessions"
                  value={`${overview.counts.sessions}`}
                />
                <StatTile
                  label="Completion"
                  value={`${overview.counts.completedSessions}`}
                />
                <StatTile
                  label="Effectiveness"
                  value={
                    averageEffectiveness === null ? "No score" : `${averageEffectiveness}%`
                  }
                />
              </div>
            </section>

            {/* ── 5-stat row ────────────────────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: "14px",
              }}
            >
              <article className="teacher-rail-card" style={{ gap: "6px" }}>
                <span className="teacher-rail-label">Sessions</span>
                <strong style={{ fontSize: "1.9rem", letterSpacing: "-0.04em" }}>
                  {overview.counts.sessions}
                </strong>
                <small style={{ color: "rgba(207,224,250,0.55)", fontSize: "0.75rem" }}>
                  total sessions
                </small>
              </article>

              <article className="teacher-rail-card" style={{ gap: "6px" }}>
                <span className="teacher-rail-label">Per student</span>
                <strong style={{ fontSize: "1.9rem", letterSpacing: "-0.04em" }}>
                  {averageSessionsPerLearner}
                </strong>
                <small style={{ color: "rgba(207,224,250,0.55)", fontSize: "0.75rem" }}>
                  avg sessions
                </small>
              </article>

              <article className="teacher-rail-card" style={{ gap: "6px" }}>
                <span className="teacher-rail-label">First-try</span>
                <strong style={{ fontSize: "1.9rem", letterSpacing: "-0.04em" }}>
                  {classFirstTryRate !== null ? `${classFirstTryRate}%` : "—"}
                </strong>
                <small style={{ color: "rgba(207,224,250,0.55)", fontSize: "0.75rem" }}>
                  first-try rate
                </small>
              </article>

              <article className="teacher-rail-card" style={{ gap: "6px" }}>
                <span className="teacher-rail-label">Mastery</span>
                <strong style={{ fontSize: "1.9rem", letterSpacing: "-0.04em" }}>
                  {classMasteryRate !== null ? `${classMasteryRate}%` : "—"}
                </strong>
                <small style={{ color: "rgba(207,224,250,0.55)", fontSize: "0.75rem" }}>
                  avg mastery rate
                </small>
              </article>

              <article className="teacher-rail-card" style={{ gap: "6px" }}>
                <span className="teacher-rail-label">Support queue</span>
                <strong style={{ fontSize: "1.9rem", letterSpacing: "-0.04em", color: supportSignalCount > 0 ? "#ff7b6b" : "inherit" }}>
                  {supportSignalCount}
                </strong>
                <small style={{ color: "rgba(207,224,250,0.55)", fontSize: "0.75rem" }}>
                  skills need attention
                </small>
              </article>
            </div>

            {/* ── Wide 2-column grid: skills mastery + band/queue ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "14px",
                alignItems: "start",
              }}
            >
              {/* Left: skills by mastery */}
              <div className="teacher-rail-card" style={{ gridColumn: "span 1" }}>
                <span className="teacher-rail-label">Skills by mastery</span>
                <div style={{ display: "grid", gap: "10px" }}>
                  {overview.skillSummary.slice(0, 6).map((skill) => {
                    const barColor =
                      skill.masteryRate >= 80
                        ? "#58e8c1"
                        : skill.masteryRate >= 60
                          ? "#ffd166"
                          : "#ff7b6b";
                    return (
                      <div
                        key={skill.skillCode}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 140px auto",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            letterSpacing: "-0.01em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {skill.displayName}
                        </span>
                        <div
                          style={{
                            height: "6px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.1)",
                            overflow: "hidden",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              height: "100%",
                              borderRadius: "inherit",
                              background: barColor,
                              width: `${skill.masteryRate}%`,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            color: "rgba(207,224,250,0.6)",
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            minWidth: "36px",
                            textAlign: "right",
                          }}
                        >
                          {skill.masteryRate}%
                        </span>
                      </div>
                    );
                  })}
                  {overview.skillSummary.length === 0 && (
                    <small style={{ color: "rgba(207,224,250,0.45)" }}>
                      No skill data yet — start a session to see mastery.
                    </small>
                  )}
                </div>
              </div>

              {/* Right column: band coverage + support queue mini */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Band coverage bars */}
                <div className="teacher-rail-card">
                  <span className="teacher-rail-label">Band coverage</span>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {bandSnapshots.map((band) => {
                      const pct = Math.round((band.studentCount / totalStudents) * 100);
                      return (
                        <div
                          key={band.code}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.74rem",
                              fontWeight: 800,
                              minWidth: "68px",
                              letterSpacing: "0.02em",
                              color: "rgba(207,224,250,0.7)",
                            }}
                          >
                            {band.displayName}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: "6px",
                              borderRadius: "3px",
                              background: "rgba(255,255,255,0.08)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: "3px",
                                background: "#4a8ce6",
                                width: `${pct}%`,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "0.74rem",
                              color: "rgba(207,224,250,0.5)",
                              minWidth: "22px",
                              textAlign: "right",
                              fontWeight: 700,
                            }}
                          >
                            {band.studentCount}
                          </span>
                        </div>
                      );
                    })}
                    {bandSnapshots.length === 0 && (
                      <small style={{ color: "rgba(207,224,250,0.45)" }}>
                        No band data yet.
                      </small>
                    )}
                  </div>
                </div>

                {/* Support queue mini */}
                <div className="teacher-rail-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span className="teacher-rail-label">Support queue</span>
                    <Link
                      href="#teacher-support-queue"
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        color: "#4a8ce6",
                        textDecoration: "none",
                      }}
                    >
                      View all ({queueTierCounts.support})
                    </Link>
                  </div>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {queueItems
                      .filter((s) => s.tier === "support")
                      .slice(0, 3)
                      .map((skill) => (
                        <div
                          key={skill.skillCode}
                          style={{
                            display: "flex",
                            gap: "8px",
                            padding: "10px 12px",
                            borderRadius: "14px",
                            background: "rgba(255,123,107,0.08)",
                            borderLeft: "3px solid rgba(255,123,107,0.4)",
                          }}
                        >
                          <div style={{ fontSize: "13px" }}>⚠️</div>
                          <div style={{ display: "grid", gap: "3px" }}>
                            <strong
                              style={{
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                color: "#fff",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {skill.displayName}
                            </strong>
                            <small
                              style={{
                                fontSize: "0.72rem",
                                color: "rgba(207,224,250,0.55)",
                              }}
                            >
                              {skill.learnerCount} learners · {skill.remediationCount} triggers
                            </small>
                            <Link
                              href={`${buildTeacherRouteHref(skill.skillCode)}#teacher-drilldown`}
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                color: "#4a8ce6",
                                textDecoration: "none",
                              }}
                            >
                              Inspect
                            </Link>
                          </div>
                        </div>
                      ))}
                    {queueTierCounts.support === 0 && (
                      <small style={{ color: "rgba(207,224,250,0.45)" }}>
                        No skills in the support queue.
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Sessions-this-week + skill alerts ─────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                alignItems: "start",
              }}
            >
              {/* Sessions this week bar chart */}
              <div className="teacher-rail-card">
                <span className="teacher-rail-label">Sessions — this week</span>
                <div style={{ display: "grid", gap: "6px" }}>
                  {weekDays.map((day) => {
                    const count = sessionsByDay[day] ?? 0;
                    const pct = Math.round((count / maxDayCount) * 100);
                    return (
                      <div
                        key={day}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            color: "rgba(207,224,250,0.5)",
                            minWidth: "28px",
                          }}
                        >
                          {day}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: "8px",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,0.07)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: "4px",
                              background: "#4a8ce6",
                              width: `${pct}%`,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "rgba(207,224,250,0.5)",
                            minWidth: "20px",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skill alerts */}
              <div className="teacher-rail-card">
                <span className="teacher-rail-label">Skill alerts</span>
                <div style={{ display: "grid", gap: "8px" }}>
                  {allAlerts.map((alert) => (
                    <div
                      key={alert.skillCode}
                      style={{
                        display: "flex",
                        gap: "8px",
                        padding: "10px 12px",
                        background:
                          alert.icon === "🎉"
                            ? "rgba(88,232,193,0.08)"
                            : "rgba(245,166,35,0.08)",
                        borderRadius: "10px",
                        fontSize: "0.78rem",
                        color:
                          alert.icon === "🎉"
                            ? "rgba(88,232,193,0.85)"
                            : "rgba(245,166,35,0.85)",
                        lineHeight: 1.4,
                      }}
                    >
                      <span>{alert.icon}</span>
                      <span>{alert.text}</span>
                    </div>
                  ))}
                  {allAlerts.length === 0 && (
                    <small style={{ color: "rgba(207,224,250,0.45)" }}>
                      No skill alerts — all signals look healthy.
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* ── Full layout: left rail + main + right rail ─── */}
            <section className="teacher-command-layout">
              <aside className="teacher-command-rail teacher-command-left">
                <div className="teacher-rail-card">
                  <span className="teacher-rail-label">Class summary</span>
                  <strong>Class command</strong>
                  <div className="teacher-rail-metric-grid">
                    <div className="teacher-rail-metric">
                      <span>Avg sessions</span>
                      <strong>{averageSessionsPerLearner}</strong>
                    </div>
                    <div className="teacher-rail-metric">
                      <span>Scored sessions</span>
                      <strong>{scoredSessions.length}</strong>
                    </div>
                  </div>
                </div>

                <div className="teacher-rail-card">
                  <span className="teacher-rail-label">Signal overview</span>
                  <div className="teacher-signal-stack">
                    <article className="teacher-signal-row is-flag">
                      <div>
                        <strong>{supportSignalCount}</strong>
                        <small>Need guided support</small>
                      </div>
                      <span>Flag</span>
                    </article>
                    <article className="teacher-signal-row is-watch">
                      <div>
                        <strong>{watchSignalCount}</strong>
                        <small>Mixed consistency</small>
                      </div>
                      <span>Watch</span>
                    </article>
                    <article className="teacher-signal-row is-strong">
                      <div>
                        <strong>{strongSignalCount}</strong>
                        <small>Anchor confidence</small>
                      </div>
                      <span>Strong</span>
                    </article>
                  </div>
                </div>

                <div className="teacher-rail-card">
                  <span className="teacher-rail-label">Band coverage</span>
                  <div className="teacher-band-stack">
                    {bandSnapshots.map((band) => (
                      <article className="teacher-band-row" key={band.code}>
                        <div className="teacher-band-row-top">
                          <strong>{band.displayName}</strong>
                          <span>{band.studentCount}</span>
                        </div>
                        <small>
                          Lead: {band.leadSkill?.displayName ?? "—"} · Support: {band.supportSkill?.displayName ?? "—"}
                        </small>
                      </article>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="teacher-command-main">
                <section className="teacher-command-row">
                  <ShellCard
                    className="shell-card-emphasis teacher-support-queue-card"
                    eyebrow="Intervention queue"
                    title="What needs attention first"
                  >
                    <div className="teacher-queue-toolbar">
                      <div className="teacher-queue-filter-row" aria-label="Teacher intervention filters">
                        {(
                          [
                            {
                              count: queueTierCounts.all,
                              label: "All",
                              value: "all",
                            },
                            {
                              count: queueTierCounts.support,
                              label: "Flag",
                              value: "support",
                            },
                            {
                              count: queueTierCounts.watch,
                              label: "Watch",
                              value: "watch",
                            },
                            {
                              count: queueTierCounts.strong,
                              label: "Strong",
                              value: "strong",
                            },
                          ] as const
                        ).map((filter) => (
                          <Link
                            className={`teacher-queue-filter-chip ${selectedQueueTier === filter.value ? "is-current" : ""}`}
                            href={buildTeacherRouteHref(null, filter.value)}
                            key={filter.value}
                          >
                            {filter.label}
                            <span>{filter.count}</span>
                          </Link>
                        ))}
                      </div>
                      <small className="teacher-queue-hint">Filter by priority · select a skill to inspect.</small>
                    </div>
                    <div className="teacher-queue-list" id="teacher-support-queue">
                      {filteredQueue.length ? (
                        filteredQueue.map((skill, index) => {
                          const isSelected = selectedSkill?.skillCode === skill.skillCode;

                          return (
                            <article
                              className={`teacher-queue-item is-${skill.tier} ${isSelected ? "is-selected" : ""}`}
                              key={`${skill.skillCode}-${skill.launchBandCode}`}
                            >
                              <span className={`teacher-queue-severity is-${skill.tier}`} aria-hidden="true" />
                              <div className="teacher-queue-copy">
                                <div className="teacher-queue-topline">
                                  <span className={`teacher-queue-badge is-${skill.tier}`}>
                                    {skill.tierLabel}
                                  </span>
                                  <span className="teacher-queue-rank">
                                    #{index + 1} in queue
                                  </span>
                                </div>
                                <strong>{skill.displayName}</strong>
                                <small>{skill.queueSummary}</small>
                                <div className="summary-chip-row">
                                  <span className="summary-chip">
                                    {skill.launchBandCode}
                                  </span>
                                  <span className="summary-chip">
                                    {skill.learnerCount} learners
                                  </span>
                                  <span className="summary-chip">
                                    {skill.remediationCount} support triggers
                                  </span>
                                </div>
                                <small className="teacher-queue-action-text">
                                  {skill.queueAction}
                                </small>
                              </div>
                              <Link
                                className={`secondary-link teacher-detail-link ${isSelected ? "is-current" : ""}`}
                                href={`${buildTeacherRouteHref(skill.skillCode)}#teacher-drilldown`}
                              >
                                {isSelected ? "Selected" : "Focus"}
                              </Link>
                            </article>
                          );
                        })
                      ) : (
                        <div className="teacher-empty-state">
                          <strong>Queue is clear for this filter</strong>
                          <small>No skills need attention at this level.</small>
                          <div className="form-actions">
                            <Link className="secondary-link" href="/child">Start a test session</Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </ShellCard>

                  <ShellCard
                    className="shell-card-soft teacher-wins-card"
                    eyebrow="Recent wins"
                    title="Confidence builders to reuse in class"
                  >
                    <div className="teacher-win-list">
                      {recentWins.map((skill) => (
                        <article
                          className="teacher-win-card"
                          key={`${skill.skillCode}-${skill.launchBandCode}`}
                        >
                          <strong>{skill.displayName}</strong>
                          <small>{skill.launchBandCode} · {skill.masteryRate}% · {skill.learnerCount} learners</small>
                        </article>
                      ))}
                    </div>
                  </ShellCard>
                </section>

                <ShellCard
                  className="shell-card-spotlight teacher-drilldown-shell"
                  eyebrow="Skill drilldown"
                  id="teacher-drilldown"
                  title={
                    selectedSkill
                      ? selectedSkill.displayName
                      : "Choose a skill to inspect"
                  }
                >
                  {selectedSkill ? (
                    <div className="teacher-drilldown-stack">
                      <div className="teacher-drilldown-topline">
                        <div>
                          <span className={`teacher-queue-badge is-${selectedSkillTier ?? "watch"}`}>
                            {selectedSkillTier ? getTeacherQueueTierLabel(selectedSkillTier) : "Watch"}
                          </span>
                          <strong>{selectedSkill.displayName}</strong>
                          <small>{selectedSkillTrendLabel}</small>
                        </div>
                        <div className="summary-chip-row">
                          <span className="summary-chip">
                            {selectedSkill.launchBandCode}
                          </span>
                          <span className="summary-chip">
                            {selectedSkill.learnerCount} learners
                          </span>
                          <span className="summary-chip">
                            {selectedSkill.masteryRate}% mastery
                          </span>
                        </div>
                      </div>

                      <div className="teacher-tier-grid">
                        <article className="teacher-tier-card is-support">
                          <span>Need support</span>
                          <strong>{selectedSkillTierCounts.support}</strong>
                          <small>Explicit guidance needed</small>
                        </article>
                        <article className="teacher-tier-card is-watch">
                          <span>Watch</span>
                          <strong>{selectedSkillTierCounts.watch}</strong>
                          <small>One more guided pass useful</small>
                        </article>
                        <article className="teacher-tier-card is-track">
                          <span>On track</span>
                          <strong>{selectedSkillTierCounts.onTrack}</strong>
                          <small>Light support to stretch</small>
                        </article>
                        <article className="teacher-tier-card is-strong">
                          <span>Strong</span>
                          <strong>{selectedSkillTierCounts.strong}</strong>
                          <small>Reuse to open next block</small>
                        </article>
                      </div>

                      <div className="teacher-drilldown-metrics">
                        <article className="teacher-drilldown-card">
                          <span>Correct answers</span>
                          <strong>{selectedSkill.correctAttempts}</strong>
                        </article>
                        <article className="teacher-drilldown-card">
                          <span>First-try success</span>
                          <strong>{selectedSkillFirstTryRate}%</strong>
                        </article>
                        <article className="teacher-drilldown-card">
                          <span>Remediation moments</span>
                          <strong>{selectedSkill.remediationCount}</strong>
                        </article>
                      </div>

                      <div className="teacher-drilldown-banner">
                        <div className="teacher-drilldown-banner-icon" aria-hidden="true">
                          🎯
                        </div>
                        <div>
                          <strong>Suggested next move</strong>
                          <small>{selectedSkillDetail?.recommendedAction ?? selectedSkill.queueSummary}</small>
                        </div>
                      </div>

                      <div className="teacher-drilldown-section">
                        <span className="teacher-drilldown-switcher-label">
                          What to do next
                        </span>
                        <div className="teacher-next-action-grid">
                          {selectedSkillNextActions.map((action) => (
                            <article className="teacher-next-action-card" key={action.title}>
                              <span className="teacher-next-action-icon" aria-hidden="true">
                                {action.icon}
                              </span>
                              <strong>{action.title}</strong>
                              <small>{action.detail}</small>
                              <em>{action.kicker}</em>
                            </article>
                          ))}
                        </div>
                      </div>

                      <div className="teacher-drilldown-switcher">
                        <span className="teacher-drilldown-switcher-label">
                          Queue neighbors
                        </span>
                        <div className="summary-chip-row">
                          {queueNeighbors.map((skill) => (
                            <Link
                              className={`summary-chip teacher-skill-link ${skill.skillCode === selectedSkill.skillCode ? "is-current" : ""}`}
                              href={`${buildTeacherRouteHref(skill.skillCode)}#teacher-drilldown`}
                              key={skill.skillCode}
                            >
                              {skill.displayName}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="teacher-drilldown-section">
                        <span className="teacher-drilldown-switcher-label">
                          Intervention history
                        </span>
                        {selectedSkillRecentActivity.length ? (
                          <div className="teacher-timeline">
                            {selectedSkillRecentActivity.map((activity, index) => {
                              const icon = activity.firstTry
                                ? "✓"
                                : activity.remediationTriggered
                                  ? "🧭"
                                  : activity.correct
                                    ? "🎯"
                                    : "↺";
                              const title = activity.firstTry
                                ? `First-try success in ${formatSessionModeLabel(activity.sessionMode)}`
                                : activity.remediationTriggered
                                  ? `Guided support triggered in ${formatSessionModeLabel(activity.sessionMode)}`
                                  : activity.correct
                                    ? `Correct after extra support in ${formatSessionModeLabel(activity.sessionMode)}`
                                    : `Retry still needed in ${formatSessionModeLabel(activity.sessionMode)}`;
                              const timeSpentSeconds = Math.max(
                                1,
                                Math.round(activity.timeSpentMs / 1000),
                              );

                              return (
                                <article className="teacher-timeline-row" key={`${activity.id}-${index}`}>
                                  <span className="teacher-timeline-dot" aria-hidden="true">
                                    {icon}
                                  </span>
                                  <div className="teacher-timeline-body">
                                    <strong>{title}</strong>
                                    <small>
                                      {activity.launchBandCode} · {timeSpentSeconds}s ·{" "}
                                      {activity.remediationTriggered
                                        ? "support used"
                                        : activity.correct
                                          ? "landed"
                                          : "still building"}
                                    </small>
                                    <small>{formatDateTime(activity.startedAt)}</small>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="teacher-empty-state">
                            <strong>No intervention history yet</strong>
                            <small>Timeline appears after students practice this skill.</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="teacher-empty-state">
                      <strong>No skill selected yet</strong>
                      <small>Select a skill from the queue to see progress and next steps.</small>
                    </div>
                  )}
                </ShellCard>

                <ShellCard
                  className="shell-card-soft teacher-band-table-shell"
                  eyebrow="Band activity"
                  title="Launch-band activity overview"
                >
                  <div className="teacher-band-table-wrap">
                    <table className="teacher-band-table">
                      <thead>
                        <tr>
                          <th>Band</th>
                          <th>Students</th>
                          <th>Lead skill</th>
                          <th>Support lane</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bandSnapshots.map((band) => (
                          <tr key={band.code}>
                            <td>{band.displayName}</td>
                            <td>{band.studentCount}</td>
                            <td>{band.leadSkill?.displayName ?? "—"}</td>
                            <td>
                              {band.supportSkill?.displayName ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ShellCard>
              </div>

              <aside className="teacher-command-rail teacher-command-right">
                <div className="teacher-rail-card teacher-quick-actions-card">
                  <span className="teacher-rail-label">Quick actions</span>
                  <div className="teacher-quick-actions">
                    <Link className="primary-link" href="#teacher-support-queue">
                      Review intervention queue
                    </Link>
                    {selectedSkill ? (
                      <Link className="secondary-link" href="#teacher-drilldown">
                        Jump to selected drilldown
                      </Link>
                    ) : null}
                    <Link className="secondary-link" href="/parent">
                      Family hub
                    </Link>
                    <Link className="secondary-link" href="/owner">
                      Ops console
                    </Link>
                  </div>
                </div>

                <ShellCard
                  className="shell-card-soft teacher-session-rail"
                  eyebrow="Recent activity"
                  title="Latest practice movement"
                >
                  <div className="teacher-session-list">
                    {recentSessions.map((session, index) => (
                      <article className="teacher-session-card" key={`${session.id}-${index}`}>
                        <div className="teacher-session-card-top">
                          <strong>{session.launchBandCode}</strong>
                          <span>{formatShortDate(session.startedAt)}</span>
                        </div>
                        <small>{session.sessionMode}</small>
                        <div className="summary-chip-row">
                          <span className="summary-chip">
                            {session.effectivenessScore === null
                              ? "in progress"
                              : `${session.effectivenessScore}% effective`}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </ShellCard>

                <ShellCard className="shell-card-spotlight" eyebrow="Feedback" title="Teacher and school feedback">
                  <FeedbackForm
                    helper="Capture teacher-side product gaps, content issues, or classroom workflow ideas."
                    sourceChannel="teacher-dashboard"
                    submittedByRole="teacher"
                    title="Send teacher feedback"
                  />
                </ShellCard>
              </aside>
            </section>
          </>
        ) : null}

        <section className="entry-links">
          <Link className="primary-link" href="/child">
            Child access
          </Link>
          <Link className="secondary-link" href="/parent">
            Parent setup
          </Link>
          <Link className="secondary-link" href="/owner">
            Owner view
          </Link>
        </section>
      </main>
    </AppFrame>
  );
}
