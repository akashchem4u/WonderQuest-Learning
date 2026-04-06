import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { getOwnerOverview } from "@/lib/prototype-service";
import OwnerGate from "./owner-gate";

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
              <small>Protected console. Sign in with an existing owner code.</small>
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
          ? `${overview.counts.students} live child profiles`
          : "No live child profiles yet",
      route: "/child",
      status: overview.counts.students > 0 ? "good" : "watch",
    },
    {
      badge: overview.counts.guardians > 0 ? "Live" : "Watch",
      detail:
        overview.counts.guardians > 0
          ? `${overview.counts.guardians} linked parent accounts`
          : "Needs live households",
      route: "/parent",
      status: overview.counts.guardians > 0 ? "good" : "watch",
    },
    {
      badge: overview.counts.sessions >= 3 ? "Ready" : "Watch",
      detail:
        overview.counts.sessions >= 3
          ? "Enough data for class-level signals"
          : "Needs more session data",
      route: "/teacher",
      status: overview.counts.sessions >= 3 ? "good" : "watch",
    },
    {
      badge: primaryFeedback ? "Active" : "Quiet",
      detail: primaryFeedback
        ? `Latest item → ${primaryFeedback.routingTarget}`
        : "No recent feedback yet",
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
          : `${pendingReviewCount} items still need review.`,
      label: "Feedback queue under control",
      status:
        pendingReviewCount === 0 ? "ok" : pendingReviewCount <= 3 ? "warn" : "fail",
    },
    {
      detail:
        degradedRoutes.length === 0
          ? "All major product paths healthy."
          : `${degradedRoutes.length} areas need attention.`,
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
          ? `${overview.counts.exampleItems} questions live.`
          : `${overview.counts.exampleItems} of 100 baseline questions live.`,
      label: "Question bank beta-ready",
      status: overview.counts.exampleItems >= 100 ? "ok" : "warn",
    },
    {
      detail:
        overview.counts.guardians > 0
          ? `${overview.counts.guardians} parent accounts linked.`
          : "No family accounts linked yet.",
      label: "Parent-side signal present",
      status: overview.counts.guardians > 0 ? "ok" : "warn",
    },
    {
      detail:
        overview.counts.sessions >= 10
          ? `${overview.counts.sessions} sessions recorded.`
          : `${overview.counts.sessions} sessions so far — need 10+.`,
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
          title: "Feedback queue needs owner review",
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
          detail: `${contentGaps.length} content signals below target.`,
          severity: "p1",
          title: "Content density has gaps",
        }
      : null,
    overview.counts.guardians === 0
      ? {
          actionHref: "/parent",
          actionLabel: "Set up a parent household",
          detail: "Parent-side reporting incomplete until households are linked.",
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
  const recentFeedback = overview.recentFeedback.slice(0, 4);

  // Reviewed count for the feedback progress bar
  const reviewedCount =
    overview.feedbackByReviewStatus.find(
      (item) => item.reviewStatus === "reviewed" || item.reviewStatus === "resolved",
    )?.count ?? 0;
  const totalFeedback = overview.counts.feedbackItems;
  const reviewedPct = totalFeedback > 0 ? Math.round((reviewedCount / totalFeedback) * 100) : 0;

  // Category breakdown for center panel
  const categoryBreakdown = overview.feedbackByCategory.slice(0, 3);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main className="page-shell owner-command-shell">

        {/* ── Hero + KPI strip ─────────────────────────────────────── */}
        <section className="owner-command-hero">
          <div className="owner-command-copy">
            <span className="owner-panel-kicker">Operations</span>
            <h1>Release readiness, feedback pressure, and platform health.</h1>
            <div className="summary-chip-row">
              <span className="summary-chip">Release gate first</span>
              <span className="summary-chip">Feedback triage next</span>
              <span className="summary-chip">Platform health together</span>
            </div>
          </div>

          <div className="owner-command-kpis">
            <article className={`owner-kpi-card is-${readinessTone}`}>
              <span className="owner-kpi-label">Release readiness</span>
              <strong>{readinessScore}</strong>
              <small>{readinessLabel} for beta</small>
            </article>
            <article className="owner-kpi-card">
              <span className="owner-kpi-label">Feedback queue</span>
              <strong>{overview.counts.feedbackItems}</strong>
              <small>{pendingReviewCount} pending review</small>
            </article>
            <article className="owner-kpi-card">
              <span className="owner-kpi-label">Question bank</span>
              <strong>{overview.counts.exampleItems}</strong>
              <small>Live synced</small>
            </article>
            <article className="owner-kpi-card">
              <span className="owner-kpi-label">Active households</span>
              <strong>{overview.counts.guardians}</strong>
              <small>{overview.counts.sessions} sessions</small>
            </article>
          </div>
        </section>

        {/* ── Priority banner ──────────────────────────────────────── */}
        {topBanner ? (
          <section className={`owner-priority-banner is-${topBanner.severity}`}>
            <div>
              <span className="owner-panel-kicker">Needs attention now</span>
              <strong>{topBanner.title}</strong>
              <small>{topBanner.detail}</small>
            </div>
            <Link className="owner-inline-link" href={topBanner.actionHref}>
              {topBanner.actionLabel} →
            </Link>
          </section>
        ) : null}

        {/* ── 3-column main layout ─────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
            gap: "18px",
            alignItems: "start",
          }}
        >
          {/* ── LEFT: Launch readiness ──────────────────────────── */}
          <div style={{ display: "grid", gap: "18px" }}>
            <section className="owner-panel owner-release-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Launch readiness</span>
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
                  <strong>
                    {releaseChecks.filter((c) => c.status === "ok").length} of{" "}
                    {releaseChecks.length} ready
                  </strong>
                  <small>
                    {readinessScore >= 90
                      ? "Gate clear — confirm checklist before opening."
                      : `Needs 90 to unlock. ${blockers.length} signal${blockers.length === 1 ? "" : "s"} to fix.`}
                  </small>
                  <div className="owner-readiness-bar" aria-hidden="true">
                    <span
                      className={`is-${readinessTone}`}
                      style={{ width: `${readinessScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Numbered checklist */}
              <div className="owner-release-checks">
                {releaseChecks.map((check, idx) => (
                  <article
                    className={`owner-release-check is-${check.status}`}
                    key={check.label}
                  >
                    <span className="owner-release-status" aria-hidden="true">
                      {idx + 1}
                    </span>
                    <div className="owner-release-copy">
                      <strong>{check.label}</strong>
                      <small>{check.detail}</small>
                    </div>
                  </article>
                ))}
              </div>

              {blockers.length > 0 ? (
                <div className="owner-blocker-stack">
                  {blockers.map((blocker) => (
                    <article
                      className={`owner-blocker-card is-${blocker.severity}`}
                      key={`${blocker.severity}-${blocker.title}`}
                    >
                      <span className="owner-blocker-chip">
                        {blocker.severity.toUpperCase()}
                      </span>
                      <div>
                        <strong>{blocker.title}</strong>
                        <small>{blocker.detail}</small>
                        <Link className="secondary-link" href={blocker.actionHref}>
                          {blocker.actionLabel} →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          </div>

          {/* ── CENTER: Feedback queue ───────────────────────────── */}
          <div style={{ display: "grid", gap: "18px" }}>
            <section className="owner-panel owner-panel-priority">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Pending reviews</span>
                  <h2>What needs owner attention?</h2>
                </div>
                <Link
                  className="owner-inline-link"
                  href={
                    primaryFeedback
                      ? `/owner/triage/${primaryFeedback.id}`
                      : "/owner"
                  }
                >
                  Open queue
                </Link>
              </div>

              {/* Large pending count + progress bar */}
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  padding: "20px",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(180deg, rgba(18,26,39,0.96), rgba(12,18,27,0.94))",
                  border: "1px solid rgba(255,209,102,0.14)",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
                      fontWeight: 900,
                      lineHeight: 0.9,
                      color: pendingReviewCount > 0 ? "#ffd166" : "#7df0ac",
                    }}
                  >
                    {pendingReviewCount}
                  </span>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      color: "rgba(189,204,221,0.72)",
                      lineHeight: 1.4,
                    }}
                  >
                    items pending<br />owner review
                  </span>
                </div>

                {/* Reviewed progress bar */}
                <div style={{ display: "grid", gap: "6px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(132,157,183,0.7)",
                    }}
                  >
                    <span>Reviewed</span>
                    <span>{reviewedPct}%</span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        height: "100%",
                        borderRadius: "inherit",
                        background: reviewedPct >= 80 ? "#50e890" : reviewedPct >= 50 ? "#ffd166" : "#ff8b8b",
                        width: `${reviewedPct}%`,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Category breakdown */}
                {categoryBreakdown.length > 0 ? (
                  <div style={{ display: "grid", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(132,157,183,0.7)",
                      }}
                    >
                      By category
                    </span>
                    {categoryBreakdown.map((cat) => {
                      const catPct =
                        totalFeedback > 0
                          ? Math.round((cat.count / totalFeedback) * 100)
                          : 0;
                      return (
                        <div
                          key={cat.category}
                          style={{ display: "grid", gap: "4px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.78rem",
                              color: "rgba(189,204,221,0.8)",
                            }}
                          >
                            <span>{cat.category}</span>
                            <span style={{ fontWeight: 700 }}>
                              {cat.count}
                            </span>
                          </div>
                          <div
                            style={{
                              height: "5px",
                              borderRadius: "999px",
                              background: "rgba(255,255,255,0.08)",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                height: "100%",
                                borderRadius: "inherit",
                                background: "#9b72ff",
                                width: `${catPct}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {/* Recent feedback list */}
              {recentFeedback.length > 0 ? (
                <div className="owner-feedback-list">
                  {recentFeedback.map((item) => (
                    <article className="owner-feedback-item" key={item.id}>
                      <div className="owner-feedback-topline">
                        <strong>{item.summary}</strong>
                        <span className="summary-chip">{item.urgency}</span>
                      </div>
                      <small>
                        {item.category} · {item.routingTarget}
                      </small>
                      <div className="owner-feedback-status-row">
                        <span
                          className={`owner-review-status-chip is-${item.reviewStatus}`}
                        >
                          {item.reviewStatus}
                        </span>
                        <Link
                          className="owner-inline-link"
                          href={`/owner/triage/${item.id}`}
                        >
                          Detail
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "rgba(189,204,221,0.55)",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong style={{ display: "block", color: "#f4f8fd", marginBottom: "6px" }}>
                    Queue is empty
                  </strong>
                  Queue fills as feedback and testing volume rises.
                </div>
              )}
            </section>

            {/* Mini stats row */}
            <section className="owner-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Feedback mix</span>
                  <h2>Where is pressure clustering?</h2>
                </div>
              </div>
              <div className="owner-micro-grid">
                <article className="owner-mini-stat">
                  <span>Pending</span>
                  <strong>{pendingReviewCount}</strong>
                  <small>Needs action.</small>
                </article>
                <article className="owner-mini-stat">
                  <span>Top category</span>
                  <strong>{feedbackHotspot?.category ?? "Quiet"}</strong>
                  <small>
                    {feedbackHotspot
                      ? `${feedbackHotspot.count} items.`
                      : "Nothing yet."}
                  </small>
                </article>
                <article className="owner-mini-stat">
                  <span>Review status</span>
                  <strong>{reviewHotspot?.reviewStatus ?? "—"}</strong>
                  <small>
                    {reviewHotspot
                      ? `${reviewHotspot.count} items.`
                      : "No data yet."}
                  </small>
                </article>
              </div>
            </section>
          </div>

          {/* ── RIGHT: Route health + band adoption ─────────────── */}
          <div style={{ display: "grid", gap: "18px" }}>
            <section className="owner-panel" id="owner-route-health">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Route health</span>
                  <h2>Live status</h2>
                </div>
                <span className="owner-muted-meta">{routeHealth.length} routes</span>
              </div>

              <div className="owner-route-compact-list">
                {routeHealth.map((item) => (
                  <article
                    className={`owner-route-compact-row is-${item.status}`}
                    key={item.route}
                  >
                    <div className="owner-route-leading">
                      <span
                        className={`owner-status-dot is-${item.status}`}
                        aria-hidden="true"
                      />
                      <div>
                        <strong>{item.route}</strong>
                        <small>{item.detail}</small>
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: "26px",
                        padding: "0 10px",
                        borderRadius: "999px",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background:
                          item.status === "good"
                            ? "rgba(88,232,193,0.14)"
                            : "rgba(240,192,48,0.14)",
                        color:
                          item.status === "good" ? "#58e8c1" : "#ffd166",
                      }}
                    >
                      {item.badge}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            {/* Band adoption bars */}
            <section className="owner-panel" id="owner-band-adoption">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Band adoption</span>
                  <h2>Learners by band</h2>
                </div>
                <span className="owner-muted-meta">{totalBandStudents} total</span>
              </div>

              <div className="owner-band-summary">
                {overview.byBand.map((band) => {
                  const pct =
                    totalBandStudents > 0
                      ? (band.studentCount / totalBandStudents) * 100
                      : 0;
                  return (
                    <article className="owner-band-row" key={band.code}>
                      <div className="owner-band-copy">
                        <strong>{band.displayName}</strong>
                        <small>
                          {band.studentCount} · {formatShare(band.studentCount, totalBandStudents)}
                        </small>
                      </div>
                      <div
                        style={{
                          height: "8px",
                          borderRadius: "999px",
                          background: "rgba(255,255,255,0.08)",
                        }}
                        aria-hidden="true"
                      >
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            borderRadius: "inherit",
                            background: "#50e890",
                            width: `${pct}%`,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </article>
                  );
                })}
                {dominantBand ? (
                  <small className="owner-support-note">
                    Most active: {dominantBand.displayName}.
                  </small>
                ) : null}
              </div>
            </section>

            {/* Content health */}
            <section className="owner-panel" id="owner-content-health">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Content health</span>
                  <h2>Learning bank density</h2>
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
                        <small>
                          {item.value} live · target {item.target}
                        </small>
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

            {/* Quick actions */}
            <section className="owner-panel">
              <div className="owner-panel-header">
                <div>
                  <span className="owner-panel-kicker">Quick actions</span>
                  <h2>Where to move next</h2>
                </div>
              </div>
              <div className="owner-quick-actions">
                <Link
                  className="owner-quick-action"
                  href={
                    primaryFeedback
                      ? `/owner/triage/${primaryFeedback.id}`
                      : "/owner"
                  }
                >
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
          </div>
        </div>

        {/* ── Footer nav ──────────────────────────────────────────── */}
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
