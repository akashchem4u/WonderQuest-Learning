import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import { getTeacherSkillDetail } from "@/lib/prototype-service";
import TeacherGate from "@/app/teacher/teacher-gate";

export const dynamic = "force-dynamic";

type TeacherSkillDetailPageProps = {
  params?: Promise<{
    launchBandCode: string;
    skillCode: string;
  }>;
};

function formatSessionMode(value: string) {
  return value === "self-directed-challenge" ? "Self-directed" : "Guided";
}

function formatLastSeen(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TeacherSkillDetailPage({
  params,
}: TeacherSkillDetailPageProps) {
  const configured = isTeacherAccessConfigured();
  const unlocked = await hasTeacherAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Classroom</span>
              <h1>Unlock dashboard access.</h1>
              <p>
                This dashboard shows class-level insights only — it is separate
                from individual student and family views.
              </p>
            </div>
          </section>

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Teacher"
            title="Unlock teacher dashboard"
          >
            <TeacherGate configured={configured} />
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  const resolvedParams = params ? await params : undefined;
  const requestedSkillCode = resolvedParams?.skillCode ?? "";

  let detail: Awaited<ReturnType<typeof getTeacherSkillDetail>> | null = null;
  let error = "";

  try {
    detail = await getTeacherSkillDetail(requestedSkillCode);
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Teacher skill detail is not available.";
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <Link className="teacher-route-backlink" href="/teacher">
              ← Back to teacher dashboard
            </Link>
            <span className="eyebrow">Skill drilldown</span>
            <h1>
              {detail
                ? `${detail.skill.displayName} drilldown`
                : "Skill overview"}
            </h1>
            <p>
              One focused skill view with classwide support signals, recent
              movement, and a clear recommended next move.
            </p>
            {detail ? (
              <div className="summary-chip-row">
                <span className="summary-chip">{detail.skill.launchBandCode}</span>
                <span className="summary-chip">
                  {detail.skill.learnerCount} learners
                </span>
                <span className="summary-chip">
                  {detail.skill.attempts} attempts
                </span>
              </div>
            ) : null}
          </div>
          <div className="hero-route-summary">
            <StatTile
              detail="Class mastery"
              label="Accuracy"
              value={detail ? `${detail.skill.masteryRate}%` : "n/a"}
            />
            <StatTile
              detail="Without support"
              label="First try"
              value={detail ? `${detail.firstTryRate}%` : "n/a"}
            />
            <StatTile
              detail="Support triggers"
              label="Remediation"
              value={detail ? `${detail.skill.remediationCount}` : "n/a"}
            />
          </div>
        </section>

        {error ? (
          <ShellCard eyebrow="Teacher" title="Teacher skill detail is not available">
            <p>{error}</p>
          </ShellCard>
        ) : null}

        {detail ? (
          <>
            <section className="tracks owner-grid">
              <ShellCard
                className="shell-card-emphasis"
                eyebrow="Skill drilldown"
                title={detail.skill.displayName}
              >
                <div className="teacher-drilldown-stack">
                  <div className="teacher-drilldown-topline">
                    <div>
                      <span className="parent-insight-label">
                        {detail.skill.launchBandCode}
                      </span>
                      <strong>{detail.skill.masteryRate}% mastery</strong>
                      <p>{detail.trendLabel}</p>
                    </div>
                    <div className="summary-chip-row">
                      <span className="summary-chip">
                        {detail.skill.averageSeconds.toFixed(1)}s avg response
                      </span>
                      <span className="summary-chip">
                        {detail.skill.correctAttempts} correct
                      </span>
                      <span className="summary-chip">
                        {detail.skill.remediationCount} support moments
                      </span>
                    </div>
                  </div>

                  <div className="teacher-drilldown-banner">
                    <div className="teacher-drilldown-banner-icon" aria-hidden="true">
                      🎯
                    </div>
                    <div>
                      <strong>Suggested next move</strong>
                      <p>{detail.recommendedAction}</p>
                    </div>
                  </div>

                  <div className="teacher-drilldown-switcher">
                    <span className="teacher-drilldown-switcher-label">
                      Change focus
                    </span>
                    <div className="summary-chip-row">
                      {detail.peerSkills.map((skill) => (
                        <Link
                          className={`summary-chip teacher-skill-link ${skill.skillCode === detail.skill.skillCode ? "is-current" : ""}`}
                          href={`/teacher/skills/${skill.launchBandCode}/${skill.skillCode}`}
                          key={skill.skillCode}
                        >
                          {skill.displayName}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </ShellCard>
            </section>

            <section className="tracks owner-grid">
              <ShellCard
                className="shell-card-soft"
                eyebrow="Class distribution"
                title="Where learners are landing on this skill"
              >
                <div className="teacher-tier-grid">
                  <article className="teacher-tier-card is-support">
                    <span>Needs support</span>
                    <strong>{detail.tierCounts.support}</strong>
                    <p>Lower-confidence learners who likely need teacher-led examples.</p>
                  </article>
                  <article className="teacher-tier-card is-watch">
                    <span>Watch closely</span>
                    <strong>{detail.tierCounts.watch}</strong>
                    <p>Mixed performance that still needs short guided practice.</p>
                  </article>
                  <article className="teacher-tier-card is-track">
                    <span>On track</span>
                    <strong>{detail.tierCounts.onTrack}</strong>
                    <p>Learners showing enough consistency to keep moving.</p>
                  </article>
                  <article className="teacher-tier-card is-strong">
                    <span>Building confidence</span>
                    <strong>{detail.tierCounts.strong}</strong>
                    <p>Students who can be used as a confidence reference in class.</p>
                  </article>
                </div>
              </ShellCard>

              <ShellCard
                className="shell-card-soft"
                eyebrow="Recent movement"
                title="Latest class activity on this skill"
              >
                {detail.recentSkillActivity.length ? (
                  <div className="activity-list">
                    {detail.recentSkillActivity.map((item) => (
                      <article className="activity-card" key={`${item.id}-${item.startedAt}`}>
                        <div className="activity-card-row">
                          <strong>{formatSessionMode(item.sessionMode)}</strong>
                          <span>{formatLastSeen(item.startedAt)}</span>
                        </div>
                        <div className="summary-chip-row">
                          <span className="summary-chip">{item.launchBandCode}</span>
                          <span className="summary-chip">
                            {item.correct ? "Correct" : "Needs retry"}
                          </span>
                          <span className="summary-chip">
                            {item.firstTry ? "First try" : "After support"}
                          </span>
                          <span className="summary-chip">
                            {Math.round(item.timeSpentMs / 1000)}s
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="teacher-empty-state">
                    <strong>No activity yet</strong>
                    <p>
                      Students will appear here once they have attempted this skill.
                      Assign a session or run a guided quest to generate signal.
                    </p>
                  </div>
                )}
              </ShellCard>
            </section>
          </>
        ) : null}
      </main>
    </AppFrame>
  );
}
