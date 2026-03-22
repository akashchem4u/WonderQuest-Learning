import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { getOwnerOverview } from "@/lib/prototype-service";
import OwnerGate from "./owner-gate";

export const dynamic = "force-dynamic";

function formatShare(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

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

  const totalBandStudents = overview
    ? overview.byBand.reduce((sum, band) => sum + band.studentCount, 0)
    : 0;
  const dominantBand = overview
    ? [...overview.byBand].sort((left, right) => right.studentCount - left.studentCount)[0]
    : null;
  const primaryFeedback = overview?.recentFeedback[0] ?? null;
  const pendingReviewCount =
    overview?.feedbackByReviewStatus.find((item) => item.reviewStatus === "pending")
      ?.count ?? 0;
  const ownerAlerts = overview
    ? [
        pendingReviewCount > 0
          ? {
              tone: "amber",
              title: "Feedback still needs owner review",
              detail: `${pendingReviewCount} items are still marked pending in the triage queue.`,
            }
          : null,
        overview.counts.exampleItems < 12
          ? {
              tone: "red",
              title: "Content coverage is still thin",
              detail: `${overview.counts.exampleItems} example items are live. The alpha slice needs broader content density before heavier testing.`,
            }
          : null,
        overview.counts.guardians === 0
          ? {
              tone: "amber",
              title: "Parent adoption has not started yet",
              detail: "No guardian profiles are linked, so parent-side signal is still incomplete.",
            }
          : null,
        overview.counts.sessions >= 5 && pendingReviewCount === 0
          ? {
              tone: "green",
              title: "Recent product loop is healthy",
              detail: `${overview.counts.sessions} learner sessions have been recorded and the current triage queue is clear.`,
            }
          : null,
      ].filter(Boolean) as { tone: string; title: string; detail: string }[]
    : [];
  const routeHealth = overview
    ? [
        {
          route: "/child",
          status: overview.counts.students > 0 ? "good" : "watch",
          detail:
            overview.counts.students > 0
              ? `${overview.counts.students} live child profiles created`
              : "No live child profiles yet",
          badge: overview.counts.students > 0 ? "Live" : "Watch",
        },
        {
          route: "/parent",
          status: overview.counts.guardians > 0 ? "good" : "watch",
          detail:
            overview.counts.guardians > 0
              ? `${overview.counts.guardians} linked parent accounts`
              : "Parent linkage still needs live households",
          badge: overview.counts.guardians > 0 ? "Live" : "Watch",
        },
        {
          route: "/teacher",
          status: overview.counts.sessions >= 3 ? "good" : "watch",
          detail:
            overview.counts.sessions >= 3
              ? "Enough practice data exists to support class-level signals"
              : "Teacher route still needs more session data",
          badge: overview.counts.sessions >= 3 ? "Ready" : "Watch",
        },
        {
          route: "/owner",
          status: primaryFeedback ? "good" : "watch",
          detail: primaryFeedback
            ? `Latest queue item routes to ${primaryFeedback.routingTarget}`
            : "Owner console has no recent feedback to triage yet",
          badge: primaryFeedback ? "Triage live" : "Quiet",
        },
      ]
    : [];
  const contentHealth = overview
    ? [
        {
          label: "Example items",
          value: overview.counts.exampleItems,
          target: 12,
        },
        {
          label: "Explainers",
          value: overview.counts.explainers,
          target: 8,
        },
        {
          label: "Feedback coverage",
          value: overview.counts.feedbackItems,
          target: 3,
        },
      ]
    : [];

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
            {ownerAlerts.length ? (
              <section className="tracks owner-grid">
                <ShellCard className="shell-card-emphasis" eyebrow="Owner alerts" title="What is changing right now">
                  <div className="owner-alert-stack">
                    {ownerAlerts.map((alert) => (
                      <article className={`owner-alert owner-alert-${alert.tone}`} key={`${alert.tone}-${alert.title}`}>
                        <div className="owner-alert-icon" aria-hidden="true">
                          {alert.tone === "green" ? "✓" : alert.tone === "amber" ? "!" : "⚠"}
                        </div>
                        <div>
                          <strong>{alert.title}</strong>
                          <p>{alert.detail}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </ShellCard>
              </section>
            ) : null}

            <section className="tracks owner-grid">
              <ShellCard className="shell-card-spotlight" eyebrow="Owner queue" title="What needs owner attention next">
                {primaryFeedback ? (
                  <div className="owner-workbench">
                    <article className="owner-triage-card">
                      <div className="owner-triage-header">
                        <span className="parent-insight-label">
                          {primaryFeedback.category}
                        </span>
                        <div className="summary-chip-row">
                          <span className="summary-chip">
                            {primaryFeedback.urgency}
                          </span>
                          <span className="summary-chip">
                            {primaryFeedback.reviewStatus}
                          </span>
                        </div>
                      </div>
                      <strong>{primaryFeedback.summary}</strong>
                      <p>{primaryFeedback.message}</p>
                      <div className="summary-chip-row">
                        <span className="summary-chip">
                          Route to {primaryFeedback.routingTarget}
                        </span>
                        {primaryFeedback.impactedArea ? (
                          <span className="summary-chip">
                            Area: {primaryFeedback.impactedArea}
                          </span>
                        ) : null}
                        {primaryFeedback.confidence !== null ? (
                          <span className="summary-chip">
                            {primaryFeedback.confidence}% confidence
                          </span>
                        ) : null}
                      </div>
                    </article>

                    <div className="teacher-drilldown-metrics">
                      <article className="teacher-drilldown-card">
                        <span>Priority category</span>
                        <strong>
                          {overview.feedbackByCategory[0]?.category ?? "No feedback yet"}
                        </strong>
                        <p>
                          {overview.feedbackByCategory[0]
                            ? `${overview.feedbackByCategory[0].count} recent items in the busiest queue.`
                            : "The feedback queue is still empty."}
                        </p>
                      </article>
                      <article className="teacher-drilldown-card">
                        <span>Pending review</span>
                        <strong>{pendingReviewCount}</strong>
                        <p>Items that still need an owner decision or routing move.</p>
                      </article>
                      <article className="teacher-drilldown-card">
                        <span>Suggested owner move</span>
                        <strong>
                          {primaryFeedback.routingTarget
                            ? `Review ${primaryFeedback.routingTarget}`
                            : "Watch next feedback cycle"}
                        </strong>
                        <p>Use the latest routing target as the next product triage step.</p>
                      </article>
                    </div>
                  </div>
                ) : (
                  <div className="teacher-empty-state">
                    <strong>No owner triage item is active yet</strong>
                    <p>
                      As feedback and testing volume rises, the owner queue will show
                      the next item to route, review, and resolve.
                    </p>
                  </div>
                )}
              </ShellCard>
            </section>

            <section className="tracks owner-grid">
              <ShellCard className="shell-card-emphasis" eyebrow="Route health" title="Which product paths are healthy enough to trust">
                <div className="owner-route-list">
                  {routeHealth.map((item) => (
                    <article className="owner-route-row" key={item.route}>
                      <span className={`owner-status-dot is-${item.status}`} aria-hidden="true" />
                      <div className="owner-route-copy">
                        <strong>{item.route}</strong>
                        <p>{item.detail}</p>
                      </div>
                      <span className={`owner-route-badge is-${item.status}`}>
                        {item.badge}
                      </span>
                    </article>
                  ))}
                </div>
              </ShellCard>

              <ShellCard className="shell-card-soft" eyebrow="Content health" title="Where content density still needs work">
                <div className="owner-content-list">
                  {contentHealth.map((item) => {
                    const ratio = Math.min(item.value / Math.max(item.target, 1), 1);
                    const tone = item.value >= item.target ? "good" : item.value >= item.target * 0.66 ? "watch" : "alert";

                    return (
                      <article className="owner-content-row" key={item.label}>
                        <div className="owner-content-copy">
                          <strong>{item.label}</strong>
                          <p>
                            {item.value} live now · target {item.target}
                          </p>
                        </div>
                        <div className="owner-content-meter" aria-hidden="true">
                          <span className={`is-${tone}`} style={{ width: `${ratio * 100}%` }} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </ShellCard>

              <ShellCard className="shell-card-soft" eyebrow="Launch bands" title="Adoption by band">
                <div className="owner-adoption-list">
                  {overview.byBand.map((band) => (
                    <article className="owner-adoption-row" key={band.code}>
                      <div className="owner-adoption-header">
                        <strong>{band.displayName}</strong>
                        <span>
                          {band.studentCount} learners · {formatShare(band.studentCount, totalBandStudents)}
                        </span>
                      </div>
                      <div className="owner-adoption-track" aria-hidden="true">
                        <span style={{ width: `${totalBandStudents > 0 ? (band.studentCount / totalBandStudents) * 100 : 0}%` }} />
                      </div>
                    </article>
                  ))}
                  {dominantBand ? (
                    <p className="owner-adoption-note">
                      Most active band right now: {dominantBand.displayName}.
                    </p>
                  ) : null}
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
                <div className="owner-feedback-status-grid">
                  <article className="teacher-drilldown-card">
                    <span>By category</span>
                    <strong>{overview.feedbackByCategory[0]?.category ?? "Quiet"}</strong>
                    <p>
                      {overview.feedbackByCategory[0]
                        ? `${overview.feedbackByCategory[0].count} items in the largest category.`
                        : "No feedback has been triaged yet."}
                    </p>
                  </article>
                  <article className="teacher-drilldown-card">
                    <span>Review state</span>
                    <strong>
                      {overview.feedbackByReviewStatus[0]?.reviewStatus ?? "pending"}
                    </strong>
                    <p>
                      {overview.feedbackByReviewStatus[0]
                        ? `${overview.feedbackByReviewStatus[0].count} items currently share this review state.`
                        : "No review-state data yet."}
                    </p>
                  </article>
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
                        <span className="summary-chip">{item.reviewStatus}</span>
                        <Link className="summary-chip owner-detail-link" href={`/owner/triage/${item.id}`}>
                          Open detail
                        </Link>
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
