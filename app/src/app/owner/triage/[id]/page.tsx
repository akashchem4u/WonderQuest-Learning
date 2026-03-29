import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { getOwnerOverview, getOwnerTriageDetail } from "@/lib/prototype-service";
import OwnerGate from "../../owner-gate";

export const dynamic = "force-dynamic";

type OwnerTriageDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function OwnerTriageDetailPage({
  params,
}: OwnerTriageDetailPageProps) {
  const configured = isOwnerAccessConfigured();
  const unlocked = await hasOwnerAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Owner route</span>
              <h1>Owner triage detail access.</h1>
              <p>
                Triage detail stays behind the same owner gate as the main
                console.
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

  const { id } = await params;
  let detail: Awaited<ReturnType<typeof getOwnerTriageDetail>> | null = null;
  let overview: Awaited<ReturnType<typeof getOwnerOverview>> | null = null;
  let error = "";

  try {
    [detail, overview] = await Promise.all([
      getOwnerTriageDetail(id),
      getOwnerOverview(),
    ]);
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Owner triage detail is not available.";
  }

  const routeContext =
    detail && overview
      ? [
          {
            label: "Current route",
            value: detail.routingTarget,
            detail:
              detail.routingTarget === "content"
                ? `${overview.counts.exampleItems} example items · ${overview.counts.explainers} explainers live`
                : `${overview.counts.sessions} sessions recorded`,
          },
          {
            label: "Review state",
            value: detail.reviewStatus,
            detail: detail.reviewerNote
              ? detail.reviewerNote
              : "No reviewer note has been captured yet.",
          },
        ]
      : [];

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <span className="eyebrow">Owner triage</span>
            <h1>Review one issue, route it clearly, and keep the alpha moving.</h1>
            <p>
              This detail view is for working a single feedback item or alert
              cluster without losing the product-health context around it.
            </p>
            <div className="summary-chip-row">
              <Link className="summary-chip" href="/owner">
                Back to owner console
              </Link>
            </div>
          </div>
          {detail ? (
            <div className="hero-route-summary">
              <StatTile
                label="Urgency"
                value={detail.urgency}
                detail={detail.category}
              />
              <StatTile
                label="Route"
                value={detail.routingTarget}
                detail={detail.impactedArea ?? "General product flow"}
              />
              <StatTile
                label="Signal"
                value={
                  detail.confidence === null ? "manual" : `${detail.confidence}%`
                }
                detail={formatShortDate(detail.createdAt)}
              />
            </div>
          ) : null}
        </section>

        {error ? (
          <ShellCard eyebrow="Owner" title="Triage detail is not available">
            <p>{error}</p>
            <div className="form-actions">
              <Link className="primary-link" href="/owner">
                Back to owner console
              </Link>
            </div>
          </ShellCard>
        ) : null}

        {detail && overview ? (
          <>
            <section className="tracks owner-grid">
              <ShellCard className="shell-card-spotlight" eyebrow="Issue summary" title={detail.summary}>
                <div className="owner-workbench">
                  <article className="owner-triage-card">
                    <div className="owner-triage-header">
                      <span className="parent-insight-label">{detail.category}</span>
                      <div className="summary-chip-row">
                        <span className="summary-chip">{detail.urgency}</span>
                        <span className="summary-chip">{detail.reviewStatus}</span>
                      </div>
                    </div>
                    <strong>{detail.studentDisplayName ?? "Student name not available"}</strong>
                    <p>{detail.message}</p>
                    <div className="summary-chip-row">
                      <span className="summary-chip">{detail.sourceChannel}</span>
                      {detail.impactedArea ? (
                        <span className="summary-chip">{detail.impactedArea}</span>
                      ) : null}
                    </div>
                  </article>

                  <div className="teacher-drilldown-banner">
                    <div className="teacher-drilldown-banner-icon" aria-hidden="true">
                      🧭
                    </div>
                    <div>
                      <strong>Suggested owner move</strong>
                      <p>
                        {detail.routingTarget === "content"
                          ? "Review the related content pack first, then decide whether this needs a content fix or a backlog note."
                          : detail.routingTarget === "engineering"
                            ? "Verify the affected route and decide whether this is a bug fix, regression, or alpha blocker."
                            : "Confirm the signal, capture an owner note, and route the next action clearly."}
                      </p>
                    </div>
                  </div>
                </div>
              </ShellCard>
            </section>

            <section className="tracks owner-grid">
              <ShellCard className="shell-card-emphasis" eyebrow="Route context" title="Related route health">
                <div className="teacher-drilldown-metrics">
                  {routeContext.map((item) => (
                    <article className="teacher-drilldown-card" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <p>{item.detail}</p>
                    </article>
                  ))}
                </div>
              </ShellCard>

              <ShellCard className="shell-card-soft" eyebrow="Content context" title="Current content health">
                <div className="owner-content-list">
                  <article className="owner-content-row">
                    <div className="owner-content-copy">
                      <strong>Example items</strong>
                      <p>{overview.counts.exampleItems} currently live</p>
                    </div>
                    <div className="owner-content-meter" aria-hidden="true">
                      <span
                        className={
                          overview.counts.exampleItems >= 12 ? "is-good" : "is-watch"
                        }
                        style={{
                          width: `${Math.min(
                            overview.counts.exampleItems / 12,
                            1,
                          ) * 100}%`,
                        }}
                      />
                    </div>
                  </article>
                  <article className="owner-content-row">
                    <div className="owner-content-copy">
                      <strong>Explainers</strong>
                      <p>{overview.counts.explainers} currently live</p>
                    </div>
                    <div className="owner-content-meter" aria-hidden="true">
                      <span
                        className={
                          overview.counts.explainers >= 8 ? "is-good" : "is-watch"
                        }
                        style={{
                          width: `${Math.min(
                            overview.counts.explainers / 8,
                            1,
                          ) * 100}%`,
                        }}
                      />
                    </div>
                  </article>
                </div>
              </ShellCard>

              <ShellCard className="shell-card-soft" eyebrow="Resolution notes" title="How this item should close">
                <div className="owner-resolution-note">
                  <strong>{detail.reviewStatus === "resolved" ? "Resolved item" : "Ready for owner note"}</strong>
                  <p>
                    {detail.reviewerNote
                      ? detail.reviewerNote
                      : "Add a note with what changed, who owns the next action, and current status — fixed, deferred, or still in review."}
                  </p>
                </div>
              </ShellCard>
            </section>
          </>
        ) : null}

        <section className="entry-links">
          <Link className="primary-link" href="/owner">
            Owner console
          </Link>
          <Link className="secondary-link" href="/teacher">
            Teacher route
          </Link>
        </section>
      </main>
    </AppFrame>
  );
}
