import { ShellCard, StatTile } from "@/components/ui";
import styles from "./owner-beta-ops.module.css";

type ReleaseCheck = {
  detail: string;
  label: string;
  status: "fail" | "ok" | "warn";
};

type RouteHealthItem = {
  badge: string;
  detail: string;
  route: string;
  status: "alert" | "good" | "watch";
};

type BandSummary = {
  code: string;
  displayName: string;
  studentCount: number;
};

type MetricBucket = {
  label: string;
  target: number;
  value: number;
};

type FeedbackBucket = {
  category: string;
  count: number;
};

type ReviewBucket = {
  count: number;
  reviewStatus: string;
};

type RecentFeedbackItem = {
  id: string;
  category: string;
  routingTarget: string;
  reviewStatus: string;
  summary: string;
  urgency: string;
};

type OwnerBetaOpsProps = {
  counts: {
    exampleItems: number;
    feedbackItems: number;
    guardians: number;
    sessions: number;
    students: number;
  };
  releaseChecks: ReadonlyArray<ReleaseCheck>;
  routeHealth: ReadonlyArray<RouteHealthItem>;
  contentHealth: ReadonlyArray<MetricBucket>;
  feedbackByCategory: ReadonlyArray<FeedbackBucket>;
  feedbackByReviewStatus: ReadonlyArray<ReviewBucket>;
  recentFeedback: ReadonlyArray<RecentFeedbackItem>;
  readinessLabel: string;
  readinessScore: number;
  readinessTone: "alert" | "good" | "watch";
  pendingReviewCount: number;
  totalBandStudents: number;
  dominantBand: BandSummary | undefined;
  bands: ReadonlyArray<BandSummary>;
  blockerCount: number;
};

function getToneLabel(status: ReleaseCheck["status"]) {
  if (status === "ok") return "ready";
  if (status === "warn") return "watch";
  return "blocked";
}

function formatShare(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

export function OwnerBetaOps({
  counts,
  releaseChecks,
  routeHealth,
  contentHealth,
  feedbackByCategory,
  feedbackByReviewStatus,
  recentFeedback,
  readinessLabel,
  readinessScore,
  readinessTone,
  pendingReviewCount,
  totalBandStudents,
  dominantBand,
  bands,
  blockerCount,
}: OwnerBetaOpsProps) {
  const resolvedCount = releaseChecks.filter((check) => check.status === "ok").length;
  const blockedCount = releaseChecks.filter((check) => check.status === "fail").length;
  const trustCount = routeHealth.filter((item) => item.status === "good").length;
  const pressurePercent = Math.round(
    (pendingReviewCount / Math.max(counts.feedbackItems, 1)) * 100,
  );

  return (
    <section className={styles.board}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className="shell-eyebrow">Beta ops</span>
          <h2>Readiness, pressure, and trust in one live view.</h2>
          <p>
            This panel turns the live owner data into an operational beta board:
            what is still blocking launch, where feedback is piling up, and which
            routes are healthy enough to trust.
          </p>
          <div className="summary-chip-row">
            <span className="summary-chip">Goal 90+ readiness</span>
            <span className="summary-chip">
              {pendingReviewCount} pending reviews
            </span>
            <span className="summary-chip">
              {dominantBand?.displayName ?? "No dominant band yet"}
            </span>
            <span className="summary-chip">{counts.exampleItems} live questions</span>
          </div>
        </div>

        <div className={styles.heroStats}>
          <StatTile
            label="Readiness"
            value={`${readinessScore}`}
            detail={`${readinessLabel} for beta opening`}
          />
          <StatTile
            label="Queue"
            value={`${pendingReviewCount}`}
            detail={`${counts.feedbackItems} total feedback items`}
          />
          <StatTile
            label="Content floor"
            value={`${counts.exampleItems}`}
            detail={`Target ${contentHealth[0]?.target ?? 100}+ live questions`}
          />
          <StatTile
            label="Route trust"
            value={`${trustCount}/${routeHealth.length}`}
            detail="Major routes marked healthy"
          />
        </div>
      </div>

      <div className={styles.panelGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className="shell-eyebrow">Milestone timeline</span>
              <h3>What still has to land before beta opens?</h3>
            </div>
            <span className={`${styles.pill} ${styles[`tone-${readinessTone}`]}`}>
              {resolvedCount} of {releaseChecks.length} ready
            </span>
          </div>

          <div className={styles.timeline}>
            {releaseChecks.map((check, index) => (
              <article className={styles.timelineRow} key={check.label}>
                <div className={styles.timelineRail}>
                  <span className={styles.timelineIndex}>{index + 1}</span>
                  <span
                    className={`${styles.timelineLine} ${
                      index < releaseChecks.length - 1 ? styles.timelineLineActive : ""
                    }`}
                  />
                </div>
                <div className={styles.timelineBody}>
                  <div className={styles.timelineTopline}>
                    <strong>{check.label}</strong>
                    <span className={`${styles.statusChip} ${styles[`status-${check.status}`]}`}>
                      {getToneLabel(check.status)}
                    </span>
                  </div>
                  <p>{check.detail}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.panelFooter}>
            <span className={styles.footerMetric}>
              {blockerCount} blocker{blockerCount === 1 ? "" : "s"} still active
            </span>
            <span className={styles.footerMetric}>
              {counts.guardians} live households
            </span>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className="shell-eyebrow">Queue pressure</span>
              <h3>How much triage work is still stacked up?</h3>
            </div>
            <span className={styles.kpiValue}>{pressurePercent}%</span>
          </div>

          <div className={styles.queueSummary}>
            <div className={styles.queueTrack}>
              <span
                className={styles.queueFill}
                style={{ width: `${Math.max(pressurePercent, 8)}%` }}
              />
            </div>
            <div className={styles.queueCopy}>
              <strong>{pendingReviewCount} items still need owner review</strong>
              <p>
                The fastest burn-down path is to clear the queue, then keep the
                highest-volume categories from rebuilding.
              </p>
            </div>
          </div>

          <div className={styles.bucketStack}>
            {feedbackByCategory.slice(0, 3).map((item) => (
              <div className={styles.bucketRow} key={item.category}>
                <div className={styles.bucketTopline}>
                  <strong>{item.category}</strong>
                  <span>{item.count}</span>
                </div>
                <div className={styles.bucketTrack}>
                  <span
                    className={styles.bucketFill}
                    style={{
                      width: formatShare(item.count, counts.feedbackItems),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.reviewStack}>
            {feedbackByReviewStatus.map((item) => (
              <div className={styles.reviewRow} key={item.reviewStatus}>
                <span className="summary-chip">{item.reviewStatus}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className="shell-eyebrow">Safety and trust</span>
              <h3>Which routes feel healthy enough to trust?</h3>
            </div>
            <span className={styles.kpiValue}>
              {trustCount}/{routeHealth.length}
            </span>
          </div>

          <div className={styles.routeList}>
            {routeHealth.map((item) => (
              <article className={styles.routeRow} key={item.route}>
                <div className={styles.routeLeading}>
                  <span className={`${styles.routeDot} ${styles[`route-${item.status}`]}`} />
                  <div>
                    <strong>{item.route}</strong>
                    <p>{item.detail}</p>
                  </div>
                </div>
                <span className={`${styles.routeBadge} ${styles[`route-${item.status}`]}`}>
                  {item.badge}
                </span>
              </article>
            ))}
          </div>

          <div className={styles.bandCard}>
            <div className={styles.panelHeaderCompact}>
              <strong>Band adoption</strong>
              <span>{totalBandStudents} learners</span>
            </div>
            <div className={styles.bandStack}>
              {bands.map((band) => (
                <div className={styles.bandRow} key={band.code}>
                  <div className={styles.bandTopline}>
                    <strong>{band.displayName}</strong>
                    <span>{formatShare(band.studentCount, totalBandStudents)}</span>
                  </div>
                  <div className={styles.bandTrack}>
                    <span
                      className={styles.bandFill}
                      style={{
                        width: formatShare(band.studentCount, totalBandStudents),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {dominantBand ? (
              <p className={styles.bandNote}>
                Most active band: {dominantBand.displayName}.
              </p>
            ) : null}
          </div>

          {recentFeedback[0] ? (
            <div className={styles.focusCallout}>
              <span className="summary-chip">{recentFeedback[0].urgency}</span>
              <div>
                <strong>{recentFeedback[0].summary}</strong>
                <p>
                  Routes to {recentFeedback[0].routingTarget} ·{" "}
                  {recentFeedback[0].reviewStatus}
                </p>
              </div>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
