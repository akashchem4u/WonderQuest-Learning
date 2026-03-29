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
              <span className="eyebrow">Teacher route</span>
              <h1>Teacher and school dashboard access.</h1>
              <p>
                This route is separate from the child and parent experience and is
                limited to aggregate class-style visibility.
              </p>
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
          detail: `Log what changed after the next ${formatSessionModeLabel(selectedSkillRecentActivity[0]?.sessionMode ?? "guided-practice").toLowerCase()} block so the queue shows whether support is working.`,
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
            <section className="teacher-command-hero">
              <div className="teacher-command-copy shell-card shell-card-spotlight">
                <span className="shell-eyebrow">Teacher command</span>
                <h1>Classwide visibility, support queues, and calmer next-step signals.</h1>
                <p>
                  This route is built for classroom action, not peer comparison.
                  Review support lanes, watch class momentum, and move into a skill
                  drilldown without leaving the route.
                </p>
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
                  detail="Active learners"
                  label="Students"
                  value={`${overview.counts.students}`}
                />
                <StatTile
                  detail="Practice sessions recorded"
                  label="Sessions"
                  value={`${overview.counts.sessions}`}
                />
                <StatTile
                  detail="Finished session loops"
                  label="Completion"
                  value={`${overview.counts.completedSessions}`}
                />
                <StatTile
                  detail="Average scored session quality"
                  label="Effectiveness"
                  value={
                    averageEffectiveness === null ? "No score" : `${averageEffectiveness}%`
                  }
                />
              </div>
            </section>

            <section className="teacher-command-layout">
              <aside className="teacher-command-rail teacher-command-left">
                <div className="teacher-rail-card">
                  <span className="teacher-rail-label">Class summary</span>
                  <strong>Prototype class command</strong>
                  <p>
                    Keep attention on support lanes, class readiness, and next
                    practice decisions.
                  </p>
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
                        <p>Flag skills need guided support</p>
                      </div>
                      <span>Flag</span>
                    </article>
                    <article className="teacher-signal-row is-watch">
                      <div>
                        <strong>{watchSignalCount}</strong>
                        <p>Watch skills show mixed consistency</p>
                      </div>
                      <span>Watch</span>
                    </article>
                    <article className="teacher-signal-row is-strong">
                      <div>
                        <strong>{strongSignalCount}</strong>
                        <p>Strong skills can anchor confidence</p>
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
                        <p>
                          Lead: {band.leadSkill?.displayName ?? "Waiting for wins"} ·
                          Support: {band.supportSkill?.displayName ?? "No support lane yet"}
                        </p>
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
                      <p className="teacher-queue-hint">
                        Filter by urgency, then keep the drilldown on this same route.
                      </p>
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
                                <p>{skill.queueSummary}</p>
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
                          <p>Switch tiers to see other priority levels, or run a session to generate new signal.</p>
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
                          <p>
                            {skill.launchBandCode} band · {skill.masteryRate}% mastery ·{" "}
                            {skill.learnerCount} learners confident
                          </p>
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
                          <p>{selectedSkillTrendLabel}</p>
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
                          <p>Learners still need explicit guidance on this skill.</p>
                        </article>
                        <article className="teacher-tier-card is-watch">
                          <span>Watch</span>
                          <strong>{selectedSkillTierCounts.watch}</strong>
                          <p>Mixed consistency means one more guided pass is useful.</p>
                        </article>
                        <article className="teacher-tier-card is-track">
                          <span>On track</span>
                          <strong>{selectedSkillTierCounts.onTrack}</strong>
                          <p>These learners are close enough to stretch with light support.</p>
                        </article>
                        <article className="teacher-tier-card is-strong">
                          <span>Strong</span>
                          <strong>{selectedSkillTierCounts.strong}</strong>
                          <p>Confidence anchors you can reuse to open the next block.</p>
                        </article>
                      </div>

                      <div className="teacher-drilldown-metrics">
                        <article className="teacher-drilldown-card">
                          <span>Correct answers</span>
                          <strong>{selectedSkill.correctAttempts}</strong>
                          <p>Questions landed correctly across the current dataset.</p>
                        </article>
                        <article className="teacher-drilldown-card">
                          <span>First-try success</span>
                          <strong>{selectedSkillFirstTryRate}%</strong>
                          <p>How often learners get it right before support is needed.</p>
                        </article>
                        <article className="teacher-drilldown-card">
                          <span>Remediation moments</span>
                          <strong>{selectedSkill.remediationCount}</strong>
                          <p>Support was triggered this many times for the selected skill.</p>
                        </article>
                      </div>

                      <div className="teacher-drilldown-banner">
                        <div className="teacher-drilldown-banner-icon" aria-hidden="true">
                          🎯
                        </div>
                        <div>
                          <strong>Suggested next move</strong>
                          <p>
                            {selectedSkillDetail?.recommendedAction ?? selectedSkill.queueSummary}
                          </p>
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
                              <p>{action.detail}</p>
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
                            {selectedSkillRecentActivity.map((activity) => {
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
                                <article className="teacher-timeline-row" key={activity.id}>
                                  <span className="teacher-timeline-dot" aria-hidden="true">
                                    {icon}
                                  </span>
                                  <div className="teacher-timeline-body">
                                    <strong>{title}</strong>
                                    <p>
                                      {activity.launchBandCode} band · {timeSpentSeconds}s response ·{" "}
                                      {activity.remediationTriggered
                                        ? "support used"
                                        : activity.correct
                                          ? "landed"
                                          : "still building"}
                                    </p>
                                    <small>{formatDateTime(activity.startedAt)}</small>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="teacher-empty-state">
                            <strong>No intervention history yet</strong>
                            <p>The timeline will populate after more sessions touch this skill.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="teacher-empty-state">
                      <strong>No skill selected yet</strong>
                      <p>
                        Pick a skill from the intervention queue above to see classroom movement and plan your next move.
                      </p>
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
                            <td>{band.leadSkill?.displayName ?? "Waiting for data"}</td>
                            <td>
                              {band.supportSkill?.displayName ?? "No support lane yet"}
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
                      Family setup path
                    </Link>
                    <Link className="secondary-link" href="/owner">
                      Owner release view
                    </Link>
                  </div>
                </div>

                <ShellCard
                  className="shell-card-soft teacher-session-rail"
                  eyebrow="Recent activity"
                  title="Latest practice movement"
                >
                  <div className="teacher-session-list">
                    {recentSessions.map((session) => (
                      <article className="teacher-session-card" key={session.id}>
                        <div className="teacher-session-card-top">
                          <strong>{session.launchBandCode}</strong>
                          <span>{formatShortDate(session.startedAt)}</span>
                        </div>
                        <p>{session.sessionMode}</p>
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
