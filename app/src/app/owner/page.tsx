import Link from "next/link";
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
      <main className="page-shell page-shell-split">
        <section className="page-hero">
          <div>
            <span className="eyebrow">WonderQuest Learning</span>
            <h1>Owner console access.</h1>
            <p>
              This route is gated separately from child and parent access so the
              owner dashboard is not openly exposed.
            </p>
          </div>
        </section>

        <ShellCard eyebrow="Owner" title="Unlock owner console">
          <OwnerGate configured={configured} />
        </ShellCard>
      </main>
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
    <main className="page-shell">
      <section className="page-hero">
        <div>
          <span className="eyebrow">WonderQuest Learning</span>
          <h1>Owner console for the prototype build.</h1>
          <p>
            Separate owner-facing visibility for launch bands, learner growth,
            content coverage, and recent play activity.
          </p>
        </div>
        <div className="hero-route-summary">
          <StatTile
            label="Students"
            value={`${overview?.counts.students ?? 0}`}
            detail="Live child profiles"
          />
          <StatTile
            label="Sessions"
            value={`${overview?.counts.sessions ?? 0}`}
            detail="Challenge sessions started"
          />
          <StatTile
            label="Content"
            value={`${overview?.counts.exampleItems ?? 0}`}
            detail="Example items synced"
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
            <ShellCard eyebrow="Counts" title="Platform totals">
              <ul className="route-list">
                <li>{overview.counts.students} students</li>
                <li>{overview.counts.guardians} guardians</li>
                <li>{overview.counts.sessions} sessions</li>
                <li>{overview.counts.feedbackItems} feedback items</li>
                <li>{overview.counts.totalPoints} total learner points</li>
                <li>{overview.counts.explainers} explainers synced</li>
              </ul>
            </ShellCard>

            <ShellCard eyebrow="Launch bands" title="Adoption by band">
              <div className="summary-chip-row">
                {overview.byBand.map((band) => (
                  <span className="summary-chip" key={band.code}>
                    {band.displayName}: {band.studentCount}
                  </span>
                ))}
              </div>
            </ShellCard>

            <ShellCard eyebrow="Leaders" title="Top learners">
              <ul className="route-list">
                {overview.topLearners.map((learner) => (
                  <li key={`${learner.displayName}-${learner.launchBandCode}`}>
                    {learner.displayName} · {learner.launchBandCode} · L
                    {learner.currentLevel} · {learner.totalPoints} pts
                  </li>
                ))}
              </ul>
            </ShellCard>
          </section>

          <section className="tracks owner-grid">
            <ShellCard eyebrow="Recent sessions" title="Latest play activity">
              <ul className="route-list">
                {overview.latestSessions.map((session) => (
                  <li key={session.id}>
                    {session.displayName} · {session.sessionMode} ·{" "}
                    {session.effectivenessScore === null
                      ? "in progress"
                      : `${session.effectivenessScore}% effective`}
                  </li>
                ))}
              </ul>
            </ShellCard>

            <ShellCard eyebrow="Feedback mix" title="Recent triage categories">
              <div className="summary-chip-row">
                {overview.feedbackByCategory.map((item) => (
                  <span className="summary-chip" key={item.category}>
                    {item.category}: {item.count}
                  </span>
                ))}
              </div>
            </ShellCard>

            <ShellCard eyebrow="Feedback queue" title="Latest product feedback">
              <ul className="route-list">
                {overview.recentFeedback.map((item) => (
                  <li key={item.id}>
                    {item.category} · {item.urgency} · {item.routingTarget} ·{" "}
                    {item.summary}
                  </li>
                ))}
              </ul>
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
  );
}
