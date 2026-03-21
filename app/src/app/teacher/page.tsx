import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { FeedbackForm } from "@/components/feedback-form";
import { ShellCard, StatTile } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import { getTeacherOverview } from "@/lib/prototype-service";
import TeacherGate from "./teacher-gate";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const configured = isTeacherAccessConfigured();
  const unlocked = await hasTeacherAccess();

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
