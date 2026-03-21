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
                <ul className="route-list">
                  {overview.supportAreas.map((skill) => (
                    <li key={`${skill.skillCode}-${skill.launchBandCode}`}>
                      {skill.displayName} · {skill.launchBandCode} · {skill.masteryRate}%
                      mastery
                    </li>
                  ))}
                </ul>
              </ShellCard>

              <ShellCard className="shell-card-soft" eyebrow="Strength areas" title="Skills showing confidence">
                <ul className="route-list">
                  {overview.strengthAreas.map((skill) => (
                    <li key={`${skill.skillCode}-${skill.launchBandCode}`}>
                      {skill.displayName} · {skill.launchBandCode} · {skill.masteryRate}%
                      mastery
                    </li>
                  ))}
                </ul>
              </ShellCard>
            </section>

            <section className="tracks owner-grid">
              <ShellCard className="shell-card-soft" eyebrow="Recent activity" title="Latest practice movement">
                <ul className="route-list">
                  {overview.latestSessions.map((session) => (
                    <li key={session.id}>
                      {session.launchBandCode} · {session.sessionMode} ·{" "}
                      {session.effectivenessScore === null
                        ? "in progress"
                        : `${session.effectivenessScore}% effective`}
                    </li>
                  ))}
                </ul>
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
