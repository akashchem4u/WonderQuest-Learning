"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { FeedbackForm } from "@/components/feedback-form";
import { ChoiceChip, FieldBlock, ShellCard, StatTile } from "@/components/ui";
import { launchBands } from "@/lib/launch-plan";

type ChildDashboard = {
  studentId: string;
  sessionCount: number;
  completedSessions: number;
  totalTimeSpentMs: number;
  effectiveTimeSpentMs: number;
  averageEffectiveness: number | null;
  completionRate: number | null;
  effectiveRatio: number | null;
  lastSessionAt: string | null;
  recommendedFocus: string;
  readinessLabel: string;
  strengths: {
    skillCode: string;
    displayName: string;
    masteryRate: number;
    attempts: number;
  }[];
  supportAreas: {
    skillCode: string;
    displayName: string;
    masteryRate: number;
    attempts: number;
  }[];
  recentSessions: {
    id: string;
    sessionMode: string;
    startedAt: string;
    endedAt: string | null;
    effectivenessScore: number | null;
    totalQuestions: number;
  }[];
};

type ParentAccessResponse = {
  guardian: {
    id: string;
    username: string;
    displayName: string;
  };
  linkedChild: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  } | null;
  linkedChildren: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  }[];
  childDashboards: ChildDashboard[];
  childDashboard: ChildDashboard | null;
};

function formatMinutes(totalTimeSpentMs: number) {
  return `${Math.round((totalTimeSpentMs / 60000) * 10) / 10} min`;
}

function formatPercent(value: number | null) {
  return value === null ? "n/a" : `${value}%`;
}

function formatSessionMode(value: string) {
  return value === "self-directed-challenge" ? "Self-directed" : "Guided";
}

function formatLastSeen(value: string | null) {
  if (!value) {
    return "Not yet started";
  }

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDay(value: string) {
  return new Date(value).toLocaleDateString([], {
    weekday: "short",
  });
}

function getSessionSparkHeight(effectivenessScore: number | null) {
  const normalized = effectivenessScore ?? 52;
  return `${Math.max(20, Math.round((normalized / 100) * 68))}px`;
}

function getAvatarSymbol(avatarKey: string) {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "✨";
}

function getBandLabel(bandCode: string) {
  return launchBands.find((band) => band.code === bandCode)?.label ?? bandCode;
}

export default function ParentAccessPage() {
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [childUsername, setChildUsername] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ParentAccessResponse | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const activeChildId =
    selectedChildId ??
    result?.linkedChild?.id ??
    result?.linkedChildren[0]?.id ??
    null;
  const activeChild =
    result?.linkedChildren.find((child) => child.id === activeChildId) ??
    result?.linkedChild ??
    result?.linkedChildren[0] ??
    null;
  const activeChildDashboard =
    result?.childDashboards.find((dashboard) => dashboard.studentId === activeChildId) ??
    result?.childDashboard ??
    null;
  const recentProgressSessions = activeChildDashboard?.recentSessions.slice(-6) ?? [];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/parent/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          pin,
          displayName,
          childUsername,
          relationship,
          notifyWeekly,
          notifyMilestones,
        }),
      });

      const payload = (await response.json()) as ParentAccessResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Parent access failed.");
      }

      setSelectedChildId(
        payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null,
      );
      setResult(payload);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Parent access failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <main className="page-shell page-shell-split">
        <section className="page-hero parent-hero">
          <div>
            <span className="eyebrow">Parent journey</span>
            <h1>Family learning snapshot with calm, actionable signals.</h1>
            <p>
              Use the same lightweight access model, connect to a child profile,
              and choose the notifications that matter.
            </p>
            <div className="summary-chip-row">
              <span className="summary-chip">Quiet-hour friendly updates</span>
              <span className="summary-chip">Strength + support split</span>
              <span className="summary-chip">Feedback built in</span>
            </div>
          </div>
          <div className="hero-route-summary">
            <StatTile
              detail="Child-aware reporting"
              label="Parent view"
              value="Linked"
            />
            <StatTile
              detail="Quiet-hours friendly"
              label="Notifications"
              value="Opt-in"
            />
            <StatTile
              detail="Time plus learning quality"
              label="Signals"
              value="Effectiveness"
            />
          </div>
        </section>

        <form
          className="route-grid route-grid-parent"
          id="parent-access-form"
          onSubmit={handleSubmit}
        >
          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Step 1"
            title="Parent access"
          >
            <span className="step-chip">Step 1 · Parent account</span>
            <div className="field-grid">
              <FieldBlock
                autoComplete="username"
                label="Username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="parent username"
                value={username}
              />
              <FieldBlock
                autoComplete="current-password"
                helper="Quick access for the prototype."
                label="4-digit PIN"
                maxLength={4}
                onChange={(event) => setPin(event.target.value)}
                placeholder="0000"
                type="password"
                value={pin}
              />
              <FieldBlock
                helper="Shown in summaries and notifications."
                label="Display name"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Parent name"
                value={displayName}
              />
            </div>
          </ShellCard>

          <ShellCard
            className="shell-card-soft"
            eyebrow="Step 2"
            title="Link a child profile"
          >
            <span className="step-chip">Step 2 · Child link</span>
            <div className="field-grid">
              <FieldBlock
                helper="Use the child username already created in the app."
                label="Child username"
                onChange={(event) => setChildUsername(event.target.value)}
                placeholder="child quest name"
                value={childUsername}
              />
              <FieldBlock
                label="Relationship"
                onChange={(event) => setRelationship(event.target.value)}
                placeholder="parent, guardian, etc."
                value={relationship}
              />
            </div>
            <p className="soft-copy">
              You can sign in without linking right away, or connect a child in the
              same step.
            </p>
          </ShellCard>

          <ShellCard
            className="shell-card-soft"
            eyebrow="Step 3"
            title="Notification preferences"
          >
            <span className="step-chip">Step 3 · Alerts</span>
            <div className="choice-column">
              <button
                className={`mode-card ${notifyWeekly ? "is-selected" : ""}`}
                onClick={() => setNotifyWeekly((value) => !value)}
                type="button"
              >
                Weekly summary
                <span>Time spent, effectiveness, and next focus areas.</span>
              </button>
              <button
                className={`mode-card ${notifyMilestones ? "is-selected" : ""}`}
                onClick={() => setNotifyMilestones((value) => !value)}
                type="button"
              >
                Milestones and badges
                <span>Celebrate progress without noisy reminders.</span>
              </button>
            </div>
          </ShellCard>

          <ShellCard
            className="shell-card-spotlight"
            eyebrow="Result"
            title="Parent dashboard"
          >
            <ul className="route-list">
              <li>Subject and domain progress charts.</li>
              <li>Time spent versus learning effectiveness.</li>
              <li>Strengths, support areas, and challenge readiness.</li>
              <li>Feedback capture for bugs, enhancements, and content issues.</li>
            </ul>
            {error ? <p className="status-banner status-error">{error}</p> : null}
            {result ? (
              <div className="status-panel">
                <strong>{result.guardian.displayName} is linked.</strong>
                <p>
                  {result.linkedChildren.length} child profile
                  {result.linkedChildren.length === 1 ? "" : "s"} available in
                  this parent view.
                </p>
                <div className="summary-chip-row">
                  {result.linkedChildren.map((child) => (
                    <ChoiceChip
                      key={child.id}
                      label={`${child.displayName} · ${getBandLabel(child.launchBandCode)}`}
                      onClick={() => setSelectedChildId(child.id)}
                      selected={activeChildId === child.id}
                      accent="#3e6cff"
                    />
                  ))}
                </div>
                {activeChild && activeChildDashboard ? (
                  <div className="parent-insight-grid">
                    <article className="parent-insight-card">
                      <span className="parent-insight-label">Readiness</span>
                      <strong>{activeChildDashboard.readinessLabel}</strong>
                      <p>
                        Last session: {formatLastSeen(activeChildDashboard.lastSessionAt)}
                      </p>
                    </article>
                    <article className="parent-insight-card">
                      <span className="parent-insight-label">Focus next</span>
                      <strong>{activeChildDashboard.recommendedFocus}</strong>
                      <p>
                        Best next support area based on the latest answered
                        questions.
                      </p>
                    </article>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="form-actions">
              <button className="primary-link button-link" disabled={submitting} type="submit">
                {submitting ? "Saving..." : "Save parent access"}
              </button>
              <Link className="secondary-link" href="/owner">
                Owner view
              </Link>
            </div>
          </ShellCard>
        </form>

        {result && activeChild && activeChildDashboard ? (
          <section className="parent-hub-layout">
            <div className="parent-hub-main">
              <div className="parent-hub-topbar">
                <div className="parent-hub-greeting">
                  <span className="eyebrow">Family hub</span>
                  <h2>
                    {result.guardian.displayName}, here is what {activeChild.displayName}
                    {" "}needs next.
                  </h2>
                  <p>
                    A calmer family view with child switching, recent learning,
                    and the clearest next action we can provide from current
                    session data.
                  </p>
                </div>
                <div className="parent-hub-actions">
                  <a className="secondary-link" href="#parent-access-form">
                    Manage access
                  </a>
                  <a className="secondary-link" href="#parent-feedback">
                    Send feedback
                  </a>
                </div>
              </div>

              <article className="parent-answer-box">
                <span className="parent-answer-eyebrow">
                  Answers for you right now
                </span>
                <div className="parent-answer-list">
                  <div className="parent-answer-row">
                    <span className="parent-answer-icon" aria-hidden="true">
                      📊
                    </span>
                    <div className="parent-answer-copy">
                      <strong>How is {activeChild.displayName} doing?</strong>
                      <p>
                        {activeChildDashboard.readinessLabel} with{" "}
                        {formatPercent(activeChildDashboard.averageEffectiveness)} average
                        effectiveness and {formatPercent(activeChildDashboard.completionRate)}
                        {" "}completion.
                      </p>
                    </div>
                  </div>
                  <div className="parent-answer-row">
                    <span className="parent-answer-icon" aria-hidden="true">
                      ✨
                    </span>
                    <div className="parent-answer-copy">
                      <strong>What changed recently?</strong>
                      <p>
                        Last active {formatLastSeen(activeChildDashboard.lastSessionAt)} with{" "}
                        {activeChild.badgeCount} badges, {activeChild.trophyCount} trophies,
                        and {activeChildDashboard.completedSessions} completed sessions.
                      </p>
                    </div>
                  </div>
                  <div className="parent-answer-row">
                    <span className="parent-answer-icon" aria-hidden="true">
                      🎯
                    </span>
                    <div className="parent-answer-copy">
                      <strong>What should we do next?</strong>
                      <p>
                        Spend a short session on {activeChildDashboard.recommendedFocus} and
                        keep the next practice calm and focused.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              <article className="parent-next-action-banner">
                <span className="parent-next-action-icon" aria-hidden="true">
                  💡
                </span>
                <div className="parent-next-action-copy">
                  <span>Recommended action</span>
                  <strong>{activeChildDashboard.recommendedFocus}</strong>
                  <p>
                    This is the clearest next support area based on the latest
                    answered prompts and session quality.
                  </p>
                </div>
                <a className="secondary-link" href="#parent-feedback">
                  Give context
                </a>
              </article>

              <div className="parent-linked-grid">
                {result.linkedChildren.map((child) => {
                  const dashboard = result.childDashboards.find(
                    (item) => item.studentId === child.id,
                  );

                  return (
                    <button
                      className={`parent-linked-card ${activeChildId === child.id ? "is-active" : ""}`}
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      type="button"
                    >
                      <span className="parent-linked-avatar" aria-hidden="true">
                        {getAvatarSymbol(child.avatarKey)}
                      </span>
                      <div className="parent-linked-copy">
                        <strong>{child.displayName}</strong>
                        <span>{getBandLabel(child.launchBandCode)}</span>
                        <small>
                          {child.totalPoints} pts · Level {child.currentLevel} ·{" "}
                          {dashboard
                            ? `${dashboard.completedSessions} completed sessions`
                            : "No sessions yet"}
                        </small>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="parent-kpi-row">
                <StatTile
                  label="Current level"
                  value={`${activeChild.currentLevel}`}
                  detail={`${activeChild.totalPoints} total points`}
                />
                <StatTile
                  label="This child"
                  value={`${activeChildDashboard.completedSessions}`}
                  detail="Completed sessions"
                />
                <StatTile
                  label="Effective time"
                  value={formatMinutes(activeChildDashboard.effectiveTimeSpentMs)}
                  detail={`${formatMinutes(activeChildDashboard.totalTimeSpentMs)} total`}
                />
                <StatTile
                  label="Learning quality"
                  value={formatPercent(activeChildDashboard.averageEffectiveness)}
                  detail={`Completion ${formatPercent(activeChildDashboard.completionRate)}`}
                />
              </div>

              <ShellCard
                className="shell-card-emphasis"
                eyebrow="Dashboard"
                title="Child learning snapshot"
              >
                <div className="summary-chip-row">
                  <span className="summary-chip">{activeChild.displayName}</span>
                  <span className="summary-chip">
                    {activeChild.badgeCount} badges
                  </span>
                  <span className="summary-chip">
                    {activeChild.trophyCount} trophies
                  </span>
                  <span className="summary-chip">
                    Last seen {formatLastSeen(activeChildDashboard.lastSessionAt)}
                  </span>
                </div>
                <div className="mini-grid">
                  <div className="parent-skill-card">
                    <strong>Strengths</strong>
                    <div className="skill-list">
                      {activeChildDashboard.strengths.map((item) => (
                        <article className="skill-meter" key={item.skillCode}>
                          <div className="skill-meter-row">
                            <strong>{item.displayName}</strong>
                            <span>{item.masteryRate}%</span>
                          </div>
                          <div className="progress-rail" aria-hidden="true">
                            <span style={{ width: `${item.masteryRate}%` }} />
                          </div>
                          <small>{item.attempts} answered prompts</small>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div className="parent-skill-card">
                    <strong>Support areas</strong>
                    <div className="skill-list">
                      {activeChildDashboard.supportAreas.map((item) => (
                        <article className="skill-meter" key={item.skillCode}>
                          <div className="skill-meter-row">
                            <strong>{item.displayName}</strong>
                            <span>{item.masteryRate}%</span>
                          </div>
                          <div className="progress-rail" aria-hidden="true">
                            <span style={{ width: `${item.masteryRate}%` }} />
                          </div>
                          <small>{item.attempts} answered prompts</small>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </ShellCard>

              <ShellCard
                className="shell-card-soft"
                eyebrow="Progress over time"
                title="How recent sessions are trending"
              >
                {recentProgressSessions.length ? (
                  <div className="parent-progress-card">
                    <div className="parent-progress-bars" aria-hidden="true">
                      {recentProgressSessions.map((session) => (
                        <span
                          className="parent-progress-bar"
                          key={session.id}
                          style={{ height: getSessionSparkHeight(session.effectivenessScore) }}
                        />
                      ))}
                    </div>
                    <div className="parent-progress-labels">
                      {recentProgressSessions.map((session) => (
                        <span key={session.id}>{formatShortDay(session.startedAt)}</span>
                      ))}
                    </div>
                    <p className="soft-copy">
                      Recent sessions show whether time spent is becoming more
                      effective over the week.
                    </p>
                  </div>
                ) : (
                  <p className="soft-copy">
                    Progress-over-time will appear once there are enough recent
                    sessions to compare.
                  </p>
                )}
              </ShellCard>

              <ShellCard
                className="shell-card-soft"
                eyebrow="Recent activity"
                title="Latest learning activity"
              >
                {activeChildDashboard.recentSessions.length ? (
                  <div className="activity-list">
                    {activeChildDashboard.recentSessions.map((session) => (
                      <article className="activity-card" key={session.id}>
                        <div className="activity-card-row">
                          <strong>{formatSessionMode(session.sessionMode)}</strong>
                          <span>{formatLastSeen(session.startedAt)}</span>
                        </div>
                        <div className="summary-chip-row">
                          <span className="summary-chip">
                            {session.totalQuestions} questions
                          </span>
                          <span className="summary-chip">
                            Score {formatPercent(session.effectivenessScore)}
                          </span>
                          <span className="summary-chip">
                            {session.endedAt ? "Finished" : "In progress"}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="soft-copy">
                    Recent activity will appear here once the child completes
                    more than one session.
                  </p>
                )}
              </ShellCard>
            </div>

            <aside className="parent-hub-side">
              <article className="parent-weekly-card">
                <span className="parent-weekly-label">Weekly snapshot</span>
                <strong>{activeChild.displayName}</strong>
                <p>
                  {activeChildDashboard.completedSessions} finished sessions,
                  {" "}
                  {formatMinutes(activeChildDashboard.totalTimeSpentMs)} of total
                  time, and {formatPercent(activeChildDashboard.averageEffectiveness)}
                  {" "}average effectiveness so far.
                </p>
                <div className="parent-weekly-stats">
                  <div>
                    <span>Points</span>
                    <strong>{activeChild.totalPoints}</strong>
                  </div>
                  <div>
                    <span>Badges</span>
                    <strong>{activeChild.badgeCount}</strong>
                  </div>
                  <div>
                    <span>Trophies</span>
                    <strong>{activeChild.trophyCount}</strong>
                  </div>
                </div>
              </article>

              <article className="parent-next-step-card">
                <span className="parent-insight-label">What to do next</span>
                <strong>{activeChildDashboard.recommendedFocus}</strong>
                <p>
                  Based on the latest answered prompts, this is the clearest next
                  support area to reinforce at home.
                </p>
                <div className="parent-action-list">
                  <div>
                    <span>Readiness</span>
                    <strong>{activeChildDashboard.readinessLabel}</strong>
                  </div>
                  <div>
                    <span>Quiet summary</span>
                    <strong>{notifyWeekly ? "On" : "Off"}</strong>
                  </div>
                  <div>
                    <span>Milestones</span>
                    <strong>{notifyMilestones ? "On" : "Off"}</strong>
                  </div>
                </div>
              </article>

              <article className="parent-settings-card">
                <span className="parent-insight-label">Family settings</span>
                <strong>Notifications and linked-child controls</strong>
                <p>
                  Keep family updates calm while staying clear on who is linked
                  and which alerts are enabled.
                </p>
                <div className="parent-settings-list">
                  <div className="parent-settings-row">
                    <div>
                      <strong>Weekly summary</strong>
                      <span>Time spent, effectiveness, and next focus</span>
                    </div>
                    <b>{notifyWeekly ? "On" : "Off"}</b>
                  </div>
                  <div className="parent-settings-row">
                    <div>
                      <strong>Milestones</strong>
                      <span>Badges, trophies, and level moments</span>
                    </div>
                    <b>{notifyMilestones ? "On" : "Off"}</b>
                  </div>
                  <div className="parent-settings-row">
                    <div>
                      <strong>Linked children</strong>
                      <span>{result.linkedChildren.length} available in this family view</span>
                    </div>
                    <b>Active</b>
                  </div>
                </div>
              </article>
            </aside>
          </section>
        ) : null}

        <section className="route-grid route-grid-parent">
          <ShellCard
            className="shell-card-soft"
            eyebrow="Feedback"
            title="Parent product feedback"
          >
            <div id="parent-feedback">
              <FeedbackForm
                guardianId={result?.guardian.id}
                helper="Report bugs, confusing flows, content issues, or ideas from the parent side."
                sourceChannel="parent-dashboard"
                studentId={activeChildId ?? undefined}
                submittedByRole="parent"
                title="Help improve the parent experience"
              />
            </div>
          </ShellCard>
        </section>
      </main>
    </AppFrame>
  );
}
