import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { FeedbackForm } from "@/components/feedback-form";
import { ShellCard, StatTile } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import { getTeacherOverview } from "@/lib/prototype-service";
import TeacherGate from "./teacher-gate";

export const dynamic = "force-dynamic";

type TeacherPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function TeacherPage({ searchParams }: TeacherPageProps) {
  const configured = isTeacherAccessConfigured();
  const unlocked = await hasTeacherAccess();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedSkillCode = getSingleSearchParam(resolvedSearchParams.skill);

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

  const selectedSkill = overview
    ? overview.skillSummary.find((skill) => skill.skillCode === selectedSkillCode) ??
      overview.supportAreas[0] ??
      overview.strengthAreas[0] ??
      overview.skillSummary[0] ??
      null
    : null;
  const skillChooser = overview
    ? dedupeSkills([
        ...overview.supportAreas.slice(0, 4),
        ...overview.strengthAreas.slice(0, 4),
      ]).slice(0, 8)
    : [];
  const selectedSkillFirstTryRate = selectedSkill
    ? Math.round(
        (selectedSkill.firstTryCount / Math.max(selectedSkill.attempts, 1)) * 100,
      )
    : 0;
  const selectedSkillTrendLabel = selectedSkill
    ? selectedSkill.masteryRate >= 80
      ? "class confidence is building"
      : selectedSkill.masteryRate >= 60
        ? "showing mixed consistency"
        : "still needs guided support"
    : "waiting for more practice";
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
  const supportQueue = overview ? overview.supportAreas.slice(0, 4) : [];
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
                    {overview.counts.students} learners in prototype
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
                  detail="Learners in prototype"
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
                    eyebrow="Support queue"
                    title="What needs attention first"
                  >
                    <div className="teacher-queue-list" id="teacher-support-queue">
                      {supportQueue.map((skill) => (
                        <article
                          className="teacher-queue-item"
                          key={`${skill.skillCode}-${skill.launchBandCode}`}
                        >
                          <div className="teacher-queue-copy">
                            <span className="parent-insight-label">
                              {skill.launchBandCode}
                            </span>
                            <strong>{skill.displayName}</strong>
                            <p>
                              {skill.masteryRate}% mastery · {skill.attempts} attempts ·{" "}
                              {skill.remediationCount} support moments
                            </p>
                          </div>
                          <Link
                            className="secondary-link teacher-detail-link"
                            href={`/teacher/skills/${skill.launchBandCode}/${skill.skillCode}`}
                          >
                            Inspect
                          </Link>
                        </article>
                      ))}
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
                          <span className="parent-insight-label">
                            {selectedSkill.launchBandCode}
                          </span>
                          <strong>{selectedSkill.masteryRate}% mastery</strong>
                          <p>{selectedSkillTrendLabel}</p>
                        </div>
                        <div className="summary-chip-row">
                          <span className="summary-chip">
                            {selectedSkill.learnerCount} learners
                          </span>
                          <span className="summary-chip">
                            {selectedSkill.attempts} attempts
                          </span>
                          <span className="summary-chip">
                            {selectedSkill.averageSeconds.toFixed(1)}s avg response
                          </span>
                        </div>
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
                            {selectedSkill.masteryRate >= 80
                              ? `Use ${selectedSkill.displayName} as a confidence-building warm-up and then shift to the next support lane.`
                              : selectedSkill.masteryRate >= 60
                                ? `Run a short guided block for ${selectedSkill.displayName} and watch first-try success in the next session cycle.`
                                : `Plan a slower teacher-led pass on ${selectedSkill.displayName} with one-step support and quick retries.`}
                          </p>
                        </div>
                      </div>

                      <div className="teacher-drilldown-switcher">
                        <span className="teacher-drilldown-switcher-label">
                          Change focus
                        </span>
                        <div className="summary-chip-row">
                          {skillChooser.map((skill) => (
                            <Link
                              className={`summary-chip teacher-skill-link ${skill.skillCode === selectedSkill.skillCode ? "is-current" : ""}`}
                              href={`/teacher/skills/${skill.launchBandCode}/${skill.skillCode}`}
                              key={skill.skillCode}
                            >
                              {skill.displayName}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="teacher-empty-state">
                      <strong>No skill drilldown is available yet</strong>
                      <p>
                        More learner sessions are needed before a selected-skill view
                        can show real classroom movement.
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
                      Review support queue
                    </Link>
                    {selectedSkill ? (
                      <Link
                        className="secondary-link"
                        href={`/teacher/skills/${selectedSkill.launchBandCode}/${selectedSkill.skillCode}`}
                      >
                        Open selected skill
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
