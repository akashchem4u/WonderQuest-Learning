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

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <span className="eyebrow">Teacher route</span>
            <h1>Classwide progress, support signals, and recent momentum.</h1>
            <p>
              Aggregate-only instructional visibility across launch bands, recent
              sessions, and support areas.
            </p>
            <div className="summary-chip-row">
              <span className="summary-chip">Aggregate only</span>
              <span className="summary-chip">No peer comparison</span>
              <span className="summary-chip">Classroom-ready signals</span>
              {selectedSkill ? (
                <span className="summary-chip">{selectedSkill.displayName}</span>
              ) : null}
            </div>
          </div>
          <div className="hero-route-summary">
            <StatTile
              detail="Learners in prototype"
              label="Students"
              value={`${overview?.counts.students ?? 0}`}
            />
            <StatTile
              detail="Practice sessions recorded"
              label="Sessions"
              value={`${overview?.counts.sessions ?? 0}`}
            />
            <StatTile
              detail="Finished session loops"
              label="Completion"
              value={`${overview?.counts.completedSessions ?? 0}`}
            />
          </div>
        </section>

        {error ? (
          <ShellCard eyebrow="Teacher" title="Teacher data is not available yet">
            <p>{error}</p>
          </ShellCard>
        ) : null}

        {overview ? (
          <>
            <section className="tracks owner-grid">
              <ShellCard className="shell-card-spotlight" eyebrow="Action lane" title="Where to focus next">
                <div className="parent-insight-grid">
                  <article className="parent-insight-card">
                    <span className="parent-insight-label">Primary support lane</span>
                    <strong>
                      {overview.supportAreas[0]?.displayName ?? "No support pattern yet"}
                    </strong>
                    <p>
                      {overview.supportAreas[0]
                        ? `${overview.supportAreas[0].launchBandCode} band · ${overview.supportAreas[0].masteryRate}% mastery · ${overview.supportAreas[0].attempts} attempts`
                        : "More learner sessions are needed before a clear support lane appears."}
                    </p>
                    {overview.supportAreas[0] ? (
                      <Link
                        className="secondary-link teacher-detail-link"
                        href={`/teacher/skills/${overview.supportAreas[0].launchBandCode}/${overview.supportAreas[0].skillCode}`}
                      >
                        Open skill drilldown
                      </Link>
                    ) : null}
                  </article>
                  <article className="parent-insight-card">
                    <span className="parent-insight-label">Suggested teacher move</span>
                    <strong>
                      {overview.supportAreas[0]
                        ? `Run a short guided practice block for ${overview.supportAreas[0].displayName}`
                        : "Keep reviewing class sessions"}
                    </strong>
                    <p>
                      Use the lowest-mastery skill as the next classroom support target,
                      then review the next session set for movement.
                    </p>
                  </article>
                </div>
              </ShellCard>
            </section>

            <section className="tracks owner-grid">
              <ShellCard className="shell-card-emphasis" eyebrow="Skill drilldown" title={selectedSkill ? selectedSkill.displayName : "Choose a skill to inspect"}>
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

              <ShellCard className="shell-card-soft" eyebrow="Band mix" title="Learners by launch band">
                <div className="summary-chip-row">
                  {overview.byBand.map((band) => (
                    <span className="summary-chip" key={band.code}>
                      {band.displayName}: {band.studentCount}
                    </span>
                  ))}
                </div>
              </ShellCard>

              <ShellCard className="shell-card-emphasis" eyebrow="Support areas" title="Skills needing attention">
                <div className="skill-list">
                  {overview.supportAreas.map((skill) => (
                    <article className="skill-meter" key={`${skill.skillCode}-${skill.launchBandCode}`}>
                      <div className="skill-meter-row">
                        <strong>{skill.displayName}</strong>
                        <span>{skill.masteryRate}%</span>
                      </div>
                      <div className="summary-chip-row">
                        <span className="summary-chip">{skill.launchBandCode}</span>
                        <span className="summary-chip">{skill.attempts} attempts</span>
                      </div>
                      <div className="progress-rail" aria-hidden="true">
                        <span style={{ width: `${skill.masteryRate}%` }} />
                      </div>
                      <Link
                        className="secondary-link teacher-detail-link"
                        href={`/teacher/skills/${skill.launchBandCode}/${skill.skillCode}`}
                      >
                        Inspect this skill
                      </Link>
                    </article>
                  ))}
                </div>
              </ShellCard>

              <ShellCard className="shell-card-soft" eyebrow="Strength areas" title="Skills showing confidence">
                <div className="skill-list">
                  {overview.strengthAreas.map((skill) => (
                    <article className="skill-meter" key={`${skill.skillCode}-${skill.launchBandCode}`}>
                      <div className="skill-meter-row">
                        <strong>{skill.displayName}</strong>
                        <span>{skill.masteryRate}%</span>
                      </div>
                      <div className="summary-chip-row">
                        <span className="summary-chip">{skill.launchBandCode}</span>
                        <span className="summary-chip">{skill.attempts} attempts</span>
                      </div>
                      <div className="progress-rail" aria-hidden="true">
                        <span style={{ width: `${skill.masteryRate}%` }} />
                      </div>
                      <Link
                        className="secondary-link teacher-detail-link"
                        href={`/teacher/skills/${skill.launchBandCode}/${skill.skillCode}`}
                      >
                        Inspect this skill
                      </Link>
                    </article>
                  ))}
                </div>
              </ShellCard>
            </section>

            <section className="tracks owner-grid">
              <ShellCard className="shell-card-soft" eyebrow="Recent activity" title="Latest practice movement">
                <div className="activity-list">
                  {overview.latestSessions.map((session) => (
                    <article className="activity-card" key={session.id}>
                      <div className="activity-card-row">
                        <strong>{session.launchBandCode}</strong>
                        <span>{session.sessionMode}</span>
                      </div>
                      <div className="summary-chip-row">
                        <span className="summary-chip">
                          {session.effectivenessScore === null
                            ? "in progress"
                            : `${session.effectivenessScore}% effective`}
                        </span>
                        {selectedSkill ? (
                          <span className="summary-chip">
                            Focus: {selectedSkill.displayName}
                          </span>
                        ) : null}
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
