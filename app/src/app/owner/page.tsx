import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { getOwnerOverview } from "@/lib/prototype-service";
import OwnerGate from "./owner-gate";
import { OwnerBetaOps } from "./owner-beta-ops";

export const dynamic = "force-dynamic";

type ReleaseCheck = {
  detail: string;
  label: string;
  status: "fail" | "ok" | "warn";
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatShare(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

function getToneLabel(status: "alert" | "good" | "watch") {
  if (status === "good") {
    return "Healthy";
  }

  if (status === "watch") {
    return "Watch";
  }

  return "Attention";
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
              <span className="eyebrow">Operations</span>
              <h1>Sign in to the owner console.</h1>
              <p>
                This protected console is separate from the child and family experience.
                Sign in with an existing owner code to view operational data.
              </p>
            </div>
          </section>

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Owner"
            title="Existing owner sign-in"
          >
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

  if (!overview) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <main className="page-shell owner-command-shell">
          <ShellCard eyebrow="Owner" title="Dashboard data is not available">
            <p>{error || "Owner console data is not available yet."}</p>
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  const totalBandStudents = overview.byBand.reduce(
    (sum, band) => sum + band.studentCount,
    0,
  );
  const dominantBand = [...overview.byBand].sort(
    (left, right) => right.studentCount - left.studentCount,
  )[0];
  const primaryFeedback = overview.recentFeedback[0] ?? null;
  const feedbackHotspot = overview.feedbackByCategory[0] ?? null;
  const reviewHotspot = overview.feedbackByReviewStatus[0] ?? null;
  const pendingReviewCount =
    overview.feedbackByReviewStatus.find(
      (item) => item.reviewStatus === "pending",
    )?.count ?? 0;

  const routeHealth = [
    {
      badge: overview.counts.students > 0 ? "Live" : "Watch",
      detail:
        overview.counts.students > 0
          ? `${overview.counts.students} live child profiles created`
          : "No live child profiles yet",
      route: "/child",
      status: overview.counts.students > 0 ? "good" : "watch",
    },
    {
      badge: overview.counts.guardians > 0 ? "Live" : "Watch",
      detail:
        overview.counts.guardians > 0
          ? `${overview.counts.guardians} linked parent accounts`
          : "Parent linkage still needs live households",
      route: "/parent",
      status: overview.counts.guardians > 0 ? "good" : "watch",
    },
    {
      badge: overview.counts.sessions >= 3 ? "Ready" : "Watch",
      detail:
        overview.counts.sessions >= 3
          ? "Enough practice data exists to support class-level signals"
          : "Classroom view needs more session data",
      route: "/teacher",
      status: overview.counts.sessions >= 3 ? "good" : "watch",
    },
    {
      badge: primaryFeedback ? "Active" : "Quiet",
      detail: primaryFeedback
        ? `Latest item assigned to ${primaryFeedback.routingTarget}`
        : "No recent feedback to review yet",
      route: "/owner",
      status: primaryFeedback ? "good" : "watch",
    },
  ] as const;

  const contentHealth = [
    {
      label: "Question bank",
      target: 100,
      value: overview.counts.exampleItems,
    },
    {
      label: "Explainers",
      target: 12,
      value: overview.counts.explainers,
    },
    {
      label: "Feedback coverage",
      target: 8,
      value: overview.counts.feedbackItems,
    },
  ];

  const degradedRoutes = routeHealth.filter((item) => item.status !== "good");
  const contentGaps = contentHealth.filter((item) => item.value < item.target);

  const releaseChecks: ReleaseCheck[] = [
    {
      detail:
        pendingReviewCount === 0
          ? "Queue is fully reviewed."
          : `${pendingReviewCount} items still need owner review.`,
      label: "Feedback queue under control",
      status:
        pendingReviewCount === 0 ? "ok" : pendingReviewCount <= 3 ? "warn" : "fail",
    },
    {
      detail:
        degradedRoutes.length === 0
          ? "All major product paths are currently healthy."
          : `${degradedRoutes.length} areas still need attention.`,
      label: "Core areas healthy enough to trust",
      status:
        degradedRoutes.length === 0
          ? "ok"
          : degradedRoutes.length === 1
            ? "warn"
            : "fail",
    },
    {
      detail:
        overview.counts.exampleItems >= 100
          ? `${overview.counts.exampleItems} questions are live.`
          : `${overview.counts.exampleItems} questions live against the 100-question baseline.`,
      label: "Question bank has beta-ready density",
      status: overview.counts.exampleItems >= 100 ? "ok" : "warn",
    },
    {
      detail:
        overview.counts.guardians > 0
          ? `${overview.counts.guardians} parent accounts are linked.`
          : "No family accounts linked yet.",
      label: "Parent-side signal is present",
      status: overview.counts.guardians > 0 ? "ok" : "warn",
    },
    {
      detail:
        overview.counts.sessions >= 10
          ? `${overview.counts.sessions} sessions recorded so far.`
          : `${overview.counts.sessions} sessions recorded so far.`,
      label: "Enough session activity",
      status: overview.counts.sessions >= 10 ? "ok" : "warn",
    },
  ];

  const blockers = [
    pendingReviewCount > 0
      ? {
          actionHref: "/owner#owner-triage-queue",
          actionLabel: "Open triage queue",
          detail: `${pendingReviewCount} items still need routing or a decision.`,
          severity: pendingReviewCount > 3 ? "p0" : "p1",
          title: "Feedback queue still needs owner review",
        }
      : null,
    degradedRoutes[0]
      ? {
          actionHref: "/owner#owner-route-health",
          actionLabel: "Review platform health",
          detail: degradedRoutes[0].detail,
          severity: degradedRoutes.length > 1 ? "p0" : "p1",
          title: `${degradedRoutes.length} product area${degradedRoutes.length === 1 ? "" : "s"} need attention`,
        }
      : null,
    contentGaps[0]
      ? {
          actionHref: "/owner#owner-content-health",
          actionLabel: "Check content gaps",
          detail: `${contentGaps.length} content signals are still below target.`,
          severity: "p1",
          title: "Content density still has gaps",
        }
      : null,
    overview.counts.guardians === 0
      ? {
          actionHref: "/parent",
          actionLabel: "Set up a parent household",
          detail: "Parent-side reporting remains incomplete until households are linked.",
          severity: "p2",
          title: "No live parent households yet",
        }
      : null,
  ].filter(Boolean) as {
    actionHref: string;
    actionLabel: string;
    detail: string;
    severity: "p0" | "p1" | "p2";
    title: string;
  }[];

  const readinessScore = clamp(
    100 -
      pendingReviewCount * 7 -
      degradedRoutes.length * 16 -
      contentGaps.length * 10 -
      (overview.counts.guardians === 0 ? 8 : 0) -
      (overview.counts.sessions < 10 ? 6 : 0),
    42,
    100,
  );

  const readinessTone =
    readinessScore >= 90 && blockers.length === 0
      ? "good"
      : readinessScore >= 75
        ? "watch"
        : "alert";
  const readinessLabel =
    readinessTone === "good"
      ? "Ready"
      : readinessTone === "watch"
        ? "Needs work"
        : "Blocked";
  const topBanner = blockers[0] ?? null;
  const recentSessions = overview.latestSessions.slice(0, 4);
  const recentFeedback = overview.recentFeedback.slice(0, 4);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main className="page-shell owner-command-shell">
        <section className="owner-command-hero">
          <div className="owner-command-copy">
            <span className="shell-eyebrow">Operations</span>
            <h1>Release readiness, feedback pressure, and platform health in one command center.</h1>
            <p>
              This dashboard shows whether beta is safe to open, what still
              needs attention, and where the next product decision belongs.
            </p>
            <div className="summary-chip-row">
              <span className="summary-chip">Release gate first</span>
              <span className="summary-chip">Feedback triage next</span>
              <span className="summary-chip">Platform + content health together</span>
            </div>
          </div>

          <div className="owner-command-kpis">
            <article className={`owner-kpi-card is-${readinessTone}`}>
              <span className="owner-kpi-label">Release readiness</span>
              <strong>{readinessScore}</strong>
              <p>{readinessLabel} for beta opening</p>
            </article>
            <article className="owner-kpi-card">
              <span className="owner-kpi-label">Feedback queue</span>
              <strong>{overview.counts.feedbackItems}</strong>
              <p>{pendingReviewCount} pending owner reviews</p>
            </article>
            <article className="owner-kpi-card">
              <span className="owner-kpi-label">Question bank</span>
              <strong>{overview.counts.exampleItems}</strong>
              <p>Live synced questions</p>
            </article>
            <article className="owner-kpi-card">
              <span className="owner-kpi-label">Active households</span>
              <strong>{overview.counts.guardians}</strong>
              <p>{overview.counts.sessions} learner sessions recorded</p>
            </article>
          </div>
        </section>

        <OwnerBetaOps
          counts={overview.counts}
          releaseChecks={releaseChecks}
          routeHealth={routeHealth}
          contentHealth={contentHealth}
          feedbackByCategory={overview.feedbackByCategory}
          feedbackByReviewStatus={overview.feedbackByReviewStatus}
          recentFeedback={recentFeedback}
          readinessLabel={readinessLabel}
          readinessScore={readinessScore}
          readinessTone={readinessTone}
          pendingReviewCount={pendingReviewCount}
          totalBandStudents={totalBandStudents}
          dominantBand={dominantBand}
          bands={overview.byBand}
          blockerCount={blockers.length}
        />

        {topBanner ? (
          <section className={`owner-priority-banner is-${topBanner.severity}`}>
            <div>
              <span className="owner-panel-kicker">Needs attention now</span>
              <strong>{topBanner.title}</strong>
              <p>{topBanner.detail}</p>
            </div>
            <Link className="owner-inline-link" href={primaryFeedback ? `/owner/triage/${primaryFeedback.id}` : "/owner"}>
              Review now
            </Link>
          </section>
        ) : null}

        <section className="owner-command-layout">
          <aside className="owner-command-rail owner-command-left">
            <section className="owner-panel owner-release-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Release gate</span>
                  <h2>Should beta open yet?</h2>
                </div>
                <span className={`owner-readiness-badge is-${readinessTone}`}>
                  {readinessLabel}
                </span>
              </div>

              <div className="owner-readiness-score">
                <div className={`owner-readiness-ring is-${readinessTone}`}>
                  {readinessScore}
                </div>
                <div className="owner-readiness-copy">
                  <strong>{blockers.length} open blocker{blockers.length === 1 ? "" : "s"}</strong>
                  <p>
                    {readinessScore >= 90
                      ? "Release gate is clear. Confirm the checklist before opening to testers."
                      : `Score needs to reach 90 to unlock. Fix the ${blockers.length} blocking signal${blockers.length === 1 ? "" : "s"} below to move the needle.`}
                  </p>
                  <div className="owner-readiness-bar" aria-hidden="true">
                    <span
                      className={`is-${readinessTone}`}
                      style={{ width: `${readinessScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="owner-release-checks">
                {releaseChecks.map((check) => (
                  <article className={`owner-release-check is-${check.status}`} key={check.label}>
                    <span className="owner-release-status" aria-hidden="true">
                      {check.status === "ok" ? "✓" : check.status === "warn" ? "!" : "×"}
                    </span>
                    <div className="owner-release-copy">
                      <strong>{check.label}</strong>
                      <p>{check.detail}</p>
                    </div>
                  </article>
                ))}
              </div>

              {blockers.length ? (
                <div className="owner-blocker-stack">
                  {blockers.map((blocker) => (
                    <article className={`owner-blocker-card is-${blocker.severity}`} key={`${blocker.severity}-${blocker.title}`}>
                      <span className="owner-blocker-chip">{blocker.severity.toUpperCase()}</span>
                      <div>
                        <strong>{blocker.title}</strong>
                        <p>{blocker.detail}</p>
                        <Link className="secondary-link" href={blocker.actionHref}>{blocker.actionLabel} →</Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="owner-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Route health</span>
                  <h2>Platform health summary</h2>
                </div>
                <span className="owner-muted-meta">{routeHealth.length} major routes</span>
              </div>
              <div className="owner-route-compact-list">
                {routeHealth.map((item) => (
                  <article className={`owner-route-compact-row is-${item.status}`} key={item.route}>
                    <div className="owner-route-leading">
                      <span className={`owner-status-dot is-${item.status}`} aria-hidden="true" />
                      <div>
                        <strong>{item.route}</strong>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                    <span className={`owner-route-badge is-${item.status}`}>
                      {item.badge}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="owner-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Adoption by band</span>
                  <h2>Learner participation by band</h2>
                </div>
                <span className="owner-muted-meta">{totalBandStudents} learners</span>
              </div>
              <div className="owner-band-summary">
                {overview.byBand.map((band) => (
                  <article className="owner-band-row" key={band.code}>
                    <div className="owner-band-copy">
                      <strong>{band.displayName}</strong>
                      <p>
                        {band.studentCount} learners ·{" "}
                        {formatShare(band.studentCount, totalBandStudents)}
                      </p>
                    </div>
                    <div className="owner-adoption-track" aria-hidden="true">
                      <span
                        style={{
                          width: `${
                            totalBandStudents > 0
                              ? (band.studentCount / totalBandStudents) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </article>
                ))}
                {dominantBand ? (
                  <p className="owner-support-note">
                    Most active band right now: {dominantBand.displayName}.
                  </p>
                ) : null}
              </div>
            </section>
          </aside>

          <section className="owner-command-main">
            <section className="owner-panel owner-panel-priority">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Feedback triage</span>
                  <h2>What needs owner attention next?</h2>
                </div>
                <Link className="owner-inline-link" href={primaryFeedback ? `/owner/triage/${primaryFeedback.id}` : "/owner"}>
                  Open detail
                </Link>
              </div>

              {primaryFeedback ? (
                <>
                  <article className="owner-triage-focus">
                    <div className="owner-triage-meta">
                      <span className="summary-chip">{primaryFeedback.category}</span>
                      <span className="summary-chip">{primaryFeedback.urgency}</span>
                      <span className="summary-chip">{primaryFeedback.reviewStatus}</span>
                    </div>
                    <strong>{primaryFeedback.summary}</strong>
                    <p>{primaryFeedback.message}</p>
                    <div className="summary-chip-row">
                      <span className="summary-chip">
                        Assigned to {primaryFeedback.routingTarget}
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

                  <div className="owner-micro-grid">
                    <article className="owner-mini-stat">
                      <span>Pending review</span>
                      <strong>{pendingReviewCount}</strong>
                      <p>Still waiting on owner action.</p>
                    </article>
                    <article className="owner-mini-stat">
                      <span>Hottest category</span>
                      <strong>{feedbackHotspot?.category ?? "Quiet"}</strong>
                      <p>
                        {feedbackHotspot
                          ? `${feedbackHotspot.count} items in the busiest lane.`
                          : "No category pressure yet."}
                      </p>
                    </article>
                    <article className="owner-mini-stat">
                      <span>Review status</span>
                      <strong>{reviewHotspot?.reviewStatus ?? "quiet"}</strong>
                      <p>
                        {reviewHotspot
                          ? `${reviewHotspot.count} items currently share this status.`
                          : "No review status data yet."}
                      </p>
                    </article>
                  </div>
                </>
              ) : (
                <div className="teacher-empty-state">
                  <strong>No triage items yet</strong>
                  <p>
                    As feedback and testing volume rises, the queue will show items
                    to route, review, and resolve.
                  </p>
                  <div className="form-actions">
                    <Link className="secondary-link" href="/child">
                      Start a test session
                    </Link>
                    <Link className="secondary-link" href="/parent">
                      Submit test feedback
                    </Link>
                  </div>
                </div>
              )}

              <div className="owner-feedback-list">
                {recentFeedback.map((item) => (
                  <article className="owner-feedback-item" key={item.id}>
                    <div className="owner-feedback-topline">
                      <strong>{item.summary}</strong>
                      <span className="summary-chip">{item.urgency}</span>
                    </div>
                    <p>{item.category} · assigned to {item.routingTarget} · {item.reviewStatus}</p>
                    <Link className="owner-inline-link" href={`/owner/triage/${item.id}`}>
                      Open detail
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <div className="owner-main-grid">
              <section className="owner-panel">
                <div className="owner-panel-header">
                  <div>
                    <span className="owner-panel-kicker">Recent sessions</span>
                    <h2>What happened in the latest play loops?</h2>
                  </div>
                </div>
                <div className="owner-feedback-list">
                  {recentSessions.map((session) => (
                    <article className="owner-feedback-item" key={session.id}>
                      <div className="owner-feedback-topline">
                        <strong>{session.displayName}</strong>
                        <span className="summary-chip">{session.sessionMode}</span>
                      </div>
                      <p>
                        {session.effectivenessScore === null
                          ? "Still in progress"
                          : `${session.effectivenessScore}% effective`}{" "}
                        · recorded during session
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="owner-panel">
                <div className="owner-panel-header">
                  <div>
                    <span className="owner-panel-kicker">Feedback mix</span>
                    <h2>Where is the product pressure clustering?</h2>
                  </div>
                </div>
                <div className="owner-micro-grid">
                  <article className="owner-mini-stat">
                    <span>Top category</span>
                    <strong>{feedbackHotspot?.category ?? "Quiet"}</strong>
                    <p>
                      {feedbackHotspot
                        ? `${feedbackHotspot.count} recent items in the largest category.`
                        : "No feedback has been triaged yet."}
                    </p>
                  </article>
                  <article className="owner-mini-stat">
                    <span>Top review status</span>
                    <strong>{reviewHotspot?.reviewStatus ?? "Quiet"}</strong>
                    <p>
                      {reviewHotspot
                        ? `${reviewHotspot.count} items share this status.`
                        : "No review status data yet."}
                    </p>
                  </article>
                </div>
              </section>
            </div>
          </section>

          <aside className="owner-command-rail owner-command-right">
            <section className="owner-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Content health</span>
                  <h2>How dense is the learning bank?</h2>
                </div>
              </div>
              <div className="owner-content-list">
                {contentHealth.map((item) => {
                  const ratio = Math.min(item.value / Math.max(item.target, 1), 1);
                  const tone =
                    item.value >= item.target
                      ? "good"
                      : item.value >= item.target * 0.66
                        ? "watch"
                        : "alert";

                  return (
                    <article className="owner-content-row" key={item.label}>
                      <div className="owner-content-copy">
                        <strong>{item.label}</strong>
                        <p>
                          {item.value} live now · target {item.target}
                        </p>
                      </div>
                      <div className="owner-content-meter" aria-hidden="true">
                        <span
                          className={`is-${tone}`}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="owner-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Quick actions</span>
                  <h2>Where should the owner move next?</h2>
                </div>
              </div>
              <div className="owner-quick-actions">
                <Link className="owner-quick-action" href={primaryFeedback ? `/owner/triage/${primaryFeedback.id}` : "/owner"}>
                  Review latest triage item
                </Link>
                <Link className="owner-quick-action" href="/teacher">
                  Check classroom view
                </Link>
                <Link className="owner-quick-action" href="/parent">
                  Review family hub
                </Link>
                <Link className="owner-quick-action" href="/child">
                  Verify child access
                </Link>
              </div>
            </section>

            <section className="owner-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Launch note</span>
                  <h2>Current beta opening posture</h2>
                </div>
              </div>
              <p className="owner-support-note">
                Keep beta closed until: readiness score reaches 90+, pending
                feedback is cleared, and real parent households are linked.
              </p>
            </section>
          </aside>
        </section>

        <section className="entry-links">
          <Link className="primary-link" href="/child">
            Child access
          </Link>
          <Link className="secondary-link" href="/parent">
            Parent setup
          </Link>
          <Link className="secondary-link" href="/teacher">
            Teacher view
          </Link>
        </section>
      </main>
    </AppFrame>
  );
}
