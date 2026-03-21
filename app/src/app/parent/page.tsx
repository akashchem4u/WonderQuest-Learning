"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { FeedbackForm } from "@/components/feedback-form";
import { ChoiceChip, FieldBlock, ShellCard, StatTile } from "@/components/ui";

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
  childDashboard: {
    studentId: string;
    sessionCount: number;
    completedSessions: number;
    totalTimeSpentMs: number;
    averageEffectiveness: number | null;
    lastSessionAt: string | null;
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
  } | null;
};

function formatMinutes(totalTimeSpentMs: number) {
  return `${Math.round((totalTimeSpentMs / 60000) * 10) / 10} min`;
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

        <form className="route-grid route-grid-parent" onSubmit={handleSubmit}>
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
            title="Parent summary preview"
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
                      label={`${child.displayName} · L${child.currentLevel} · ${child.totalPoints} pts`}
                      selected={result.linkedChild?.id === child.id}
                      accent="#3e6cff"
                    />
                  ))}
                </div>
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

          <ShellCard
            className="shell-card-soft"
            eyebrow="Feedback"
            title="Parent product feedback"
          >
            <FeedbackForm
              guardianId={result?.guardian.id}
              helper="Report bugs, confusing flows, content issues, or ideas from the parent side."
              sourceChannel="parent-dashboard"
              studentId={result?.linkedChild?.id ?? result?.linkedChildren[0]?.id}
              submittedByRole="parent"
              title="Help improve the parent experience"
            />
          </ShellCard>

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Dashboard"
            title="Child learning snapshot"
          >
            {result?.childDashboard ? (
              <>
                <div className="summary-chip-row">
                  <span className="summary-chip">
                    Sessions: {result.childDashboard.sessionCount}
                  </span>
                  <span className="summary-chip">
                    Completed: {result.childDashboard.completedSessions}
                  </span>
                  <span className="summary-chip">
                    Time: {formatMinutes(result.childDashboard.totalTimeSpentMs)}
                  </span>
                  <span className="summary-chip">
                    Effectiveness:{" "}
                    {result.childDashboard.averageEffectiveness === null
                      ? "n/a"
                      : `${result.childDashboard.averageEffectiveness}%`}
                  </span>
                </div>
                <div className="mini-grid">
                  <div>
                    <strong>Strengths</strong>
                    <ul className="route-list">
                      {result.childDashboard.strengths.map((item) => (
                        <li key={item.skillCode}>
                          {item.displayName} · {item.masteryRate}%
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Support areas</strong>
                    <ul className="route-list">
                      {result.childDashboard.supportAreas.map((item) => (
                        <li key={item.skillCode}>
                          {item.displayName} · {item.masteryRate}%
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <p className="soft-copy">
                Link a child and complete a few sessions to start seeing progress
                patterns here.
              </p>
            )}
          </ShellCard>
        </form>
      </main>
    </AppFrame>
  );
}
