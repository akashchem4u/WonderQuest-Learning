import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { getOwnerOverview } from "@/lib/prototype-service";
import OwnerGate from "./owner-gate";

export const dynamic = "force-dynamic";

export default async function OwnerPage() {
  const configured = isOwnerAccessConfigured();
  const unlocked = await hasOwnerAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Owner route</span>
              <h1>Owner console access.</h1>
              <p>
                This route is gated separately from child and parent access so the
                owner dashboard is not openly exposed.
              </p>
            </div>
          </section>

          <ShellCard className="shell-card-emphasis" eyebrow="Owner" title="Unlock owner console">
            <OwnerGate configured={configured} />
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  let overview:
    | Awaited<ReturnType<typeof getOwnerOverview>>
    | null = null;
  let error = "";

  try {
    overview = await getOwnerOverview();
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Owner view is not available.";
  }

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <span className="eyebrow">Owner route</span>
            <h1>Product health and launch readiness in one owner console.</h1>
            <p>
              Separate owner-facing visibility for launch bands, learner growth,
              content coverage, and recent play activity.
            </p>
            <div className="summary-chip-row">
              <span className="summary-chip">Adoption by band</span>
              <span className="summary-chip">Feedback triage</span>
              <span className="summary-chip">Content + growth pulse</span>
            </div>
          </div>
          <div className="hero-route-summary">
            <StatTile
              detail="Live child profiles"
              label="Students"
              value={`${overview?.counts.students ?? 0}`}
            />
            <StatTile
              detail="Challenge sessions started"
              label="Sessions"
              value={`${overview?.counts.sessions ?? 0}`}
            />
            <StatTile
              detail="Example items synced"
              label="Content"
              value={`${overview?.counts.exampleItems ?? 0}`}
            />
          </div>
        </section>

        {error ? (
          <ShellCard eyebrow="Owner" title="Owner data is not available yet">
            <p>{error}</p>
          </ShellCard>
        ) : null}

        {overview ? (
          <>
            <section className="tracks owner-grid">
              <ShellCard className="shell-card-spotlight" eyebrow="Owner queue" title="What needs owner attention next">
                <div className="parent-insight-grid">
                  <article className="parent-insight-card">
                    <span className="parent-insight-label">Priority category</span>
                    <strong>
                      {overview.feedbackByCategory[0]?.category ?? "No feedback yet"}
                    </strong>
                    <p>
                      {overview.feedbackByCategory[0]
                        ? `${overview.feedbackByCategory[0].count} recent items in this queue`
                        : "The feedback queue is still empty."}
                    </p>
                  </article>
                  <article className="parent-insight-card">
                    <span className="parent-insight-label">Suggested owner move</span>
                    <strong>
                      {overview.recentFeedback[0]?.routingTarget
                        ? `Route next to ${overview.recentFeedback[0].routingTarget}`
                        : "Watch the next feedback cycle"}
                    </strong>
                    <p>
                      Use the most common feedback category and the latest routing
                      target as the first product triage step.
                    </p>
                  </article>
                </div>
              </ShellCard>
            </section>

            <section className="tracks owner-grid">
              <ShellCard className="shell-card-emphasis" eyebrow="Counts" title="Platform totals">
                <ul className="route-list">
                  <li>{overview.counts.students} students</li>
                  <li>{overview.counts.guardians} guardians</li>
                  <li>{overview.counts.sessions} sessions</li>
                  <li>{overview.counts.feedbackItems} feedback items</li>
                  <li>{overview.counts.totalPoints} total learner points</li>
                  <li>{overview.counts.explainers} explainers synced</li>
                </ul>
              </ShellCard>

              <ShellCard className="shell-card-soft" eyebrow="Launch bands" title="Adoption by band">
                <div className="summary-chip-row">
                  {overview.byBand.map((band) => (
                    <span className="summary-chip" key={band.code}>
                      {band.displayName}: {band.studentCount}
                    </span>
                  ))}
                </div>
              </ShellCard>

              <ShellCard className="shell-card-soft" eyebrow="Leaders" title="Top learners">
                <div className="activity-list">
                  {overview.topLearners.map((learner) => (
                    <article
                      className="activity-card"
                      key={`${learner.displayName}-${learner.launchBandCode}`}
                    >
                      <div className="activity-card-row">
                        <strong>{learner.displayName}</strong>
                        <span>{learner.launchBandCode}</span>
                      </div>
                      <div className="summary-chip-row">
                        <span className="summary-chip">L{learner.currentLevel}</span>
                        <span className="summary-chip">{learner.totalPoints} pts</span>
                        <span className="summary-chip">
                          {learner.badgeCount} badges · {learner.trophyCount} trophies
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </ShellCard>
            </section>

            <section className="tracks owner-grid">
              <ShellCard className="shell-card-soft" eyebrow="Recent sessions" title="Latest play activity">
                <div className="activity-list">
                  {overview.latestSessions.map((session) => (
                    <article className="activity-card" key={session.id}>
                      <div className="activity-card-row">
                        <strong>{session.displayName}</strong>
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

              <ShellCard className="shell-card-soft" eyebrow="Feedback mix" title="Recent triage categories">
                <div className="summary-chip-row">
                  {overview.feedbackByCategory.map((item) => (
                    <span className="summary-chip" key={item.category}>
                      {item.category}: {item.count}
                    </span>
                  ))}
                </div>
              </ShellCard>

              <ShellCard className="shell-card-spotlight" eyebrow="Feedback queue" title="Latest product feedback">
                <div className="activity-list">
                  {overview.recentFeedback.map((item) => (
                    <article className="activity-card" key={item.id}>
                      <div className="activity-card-row">
                        <strong>{item.category}</strong>
                        <span>{item.urgency}</span>
                      </div>
                      <div className="summary-chip-row">
                        <span className="summary-chip">{item.routingTarget}</span>
                        <span className="summary-chip">{item.sourceChannel}</span>
                      </div>
                      <p>{item.summary}</p>
                    </article>
                  ))}
                </div>
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
        </section>
      </main>
    </AppFrame>
  );
}
