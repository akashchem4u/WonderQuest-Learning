"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { FeedbackForm } from "@/components/feedback-form";
import { FieldBlock, ShellCard, StatTile } from "@/components/ui";
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

type AccessSection = "profile" | "notifications" | "relink";

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

function dedupeSkills<
  T extends {
    skillCode: string;
  },
>(skills: T[]) {
  const seen = new Set<string>();
  return skills.filter((skill) => {
    if (seen.has(skill.skillCode)) {
      return false;
    }

    seen.add(skill.skillCode);
    return true;
  });
}

function describeSkillInParentLanguage(skillCode: string, displayName: string) {
  const label = `${skillCode} ${displayName}`.toLowerCase();

  if (label.includes("count")) {
    return "This skill is about matching numbers to real groups of objects and counting one item at a time.";
  }

  if (label.includes("letter") || label.includes("phonics")) {
    return "This skill is about hearing a sound, noticing the matching letter, and connecting that sound to a familiar word.";
  }

  if (label.includes("shape")) {
    return "This skill is about noticing what makes a shape look the way it does, like corners, sides, and curved edges.";
  }

  if (label.includes("add")) {
    return "This skill is about putting small amounts together and noticing how numbers combine.";
  }

  if (label.includes("read") || label.includes("word")) {
    return "This skill is about recognizing a word quickly and understanding what it means in the moment.";
  }

  return "This skill is one of the current building blocks the app is using to judge comfort, accuracy, and growth.";
}

function buildParentSkillAction(skillCode: string, displayName: string) {
  const label = `${skillCode} ${displayName}`.toLowerCase();

  if (label.includes("count")) {
    return "Try one quick count-together moment with toys, snacks, or steps and keep the pace slow.";
  }

  if (label.includes("letter") || label.includes("phonics")) {
    return "Pick one familiar letter or sound and point it out in books, labels, or signs for a minute or two.";
  }

  if (label.includes("shape")) {
    return "Look for the same shape in the room and name it together before asking your child to point to it.";
  }

  if (label.includes("add")) {
    return "Use small groups of objects, like blocks or fruit, and let your child combine them physically.";
  }

  if (label.includes("read") || label.includes("word")) {
    return "Repeat one target word in a calm, familiar context and celebrate fast recognition instead of drilling.";
  }

  return `Keep the next practice short and calm, with one clear goal around ${displayName.toLowerCase()}.`;
}

function buildParentSkillSignal(masteryRate: number) {
  if (masteryRate >= 80) {
    return "This looks like a growing strength.";
  }

  if (masteryRate >= 60) {
    return "This is improving, but it still benefits from short guided practice.";
  }

  return "This still needs gentle support and slower repetition.";
}

function buildParentWeekSummary(
  childName: string,
  dashboard: ChildDashboard,
  skillCount: number,
) {
  const leadStrength = dashboard.strengths[0]?.displayName;
  const leadSupport = dashboard.supportAreas[0]?.displayName;

  if (leadStrength && leadSupport) {
    return {
      headline: `${childName} is making steady progress this week.`,
      body: `${leadStrength} is starting to feel more comfortable, and ${leadSupport.toLowerCase()} is the clearest place for one calm practice moment next.`,
      chips: [
        `${dashboard.strengths.length} strengths`,
        `${dashboard.supportAreas.length} building`,
        `${Math.min(Math.max(skillCount, 1), 3)} next ideas`,
      ],
    };
  }

  if (leadStrength) {
    return {
      headline: `${childName} had a strong week in the app.`,
      body: `${leadStrength} looks confident right now, and the next few short sessions can keep that momentum going.`,
      chips: [
        `${dashboard.strengths.length} strengths`,
        `${dashboard.completedSessions} finished sessions`,
        `${Math.min(Math.max(skillCount, 1), 3)} next ideas`,
      ],
    };
  }

  return {
    headline: `${childName} is building confidence one short session at a time.`,
    body: `The next step is to keep practice calm, short, and centered on ${dashboard.recommendedFocus.toLowerCase()}.`,
    chips: [
      `${dashboard.completedSessions} finished sessions`,
      `${dashboard.supportAreas.length} support lane`,
      `${Math.min(Math.max(skillCount, 1), 3)} next ideas`,
    ],
  };
}

function buildParentTeacherMessage(childName: string, dashboard: ChildDashboard) {
  if (dashboard.strengths[0]?.displayName) {
    return `"${childName} is showing growing comfort in ${dashboard.strengths[0].displayName.toLowerCase()}. A short follow-up around ${dashboard.recommendedFocus.toLowerCase()} would be the best next step at home."`;
  }

  return `"The best next step for ${childName} is a short, calm practice moment around ${dashboard.recommendedFocus.toLowerCase()}. Keep it light and stop while it still feels successful."`;
}

function buildParentWeekendActivities(
  primarySkill: { skillCode: string; displayName: string } | null,
  secondarySkill: { skillCode: string; displayName: string } | null,
) {
  const activities = [];

  if (primarySkill) {
    activities.push({
      icon: "🏠",
      title: `Try ${primarySkill.displayName} at home`,
      body: buildParentSkillAction(primarySkill.skillCode, primarySkill.displayName),
      tag: "5 min",
    });
  }

  if (secondarySkill) {
    activities.push({
      icon: "✨",
      title: `Keep ${secondarySkill.displayName} feeling easy`,
      body: `Let your child lead one quick moment around ${secondarySkill.displayName.toLowerCase()} so the app momentum feels familiar.`,
      tag: "Confidence",
    });
  }

  activities.push({
    icon: "🎒",
    title: "End while it still feels easy",
    body: "Stop after one or two wins. The goal is to keep the next return to WonderQuest feeling calm and inviting.",
    tag: "Routine",
  });

  return activities.slice(0, 3);
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
  const [showAccessManager, setShowAccessManager] = useState(true);
  const [openAccessSection, setOpenAccessSection] = useState<AccessSection | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedSkillCode, setSelectedSkillCode] = useState<string | null>(null);
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
  const familyTotals = result
    ? result.childDashboards.reduce(
        (summary, dashboard) => {
          summary.completedSessions += dashboard.completedSessions;
          summary.totalTimeSpentMs += dashboard.totalTimeSpentMs;
          summary.effectiveTimeSpentMs += dashboard.effectiveTimeSpentMs;
          return summary;
        },
        {
          completedSessions: 0,
          totalTimeSpentMs: 0,
          effectiveTimeSpentMs: 0,
        },
      )
    : null;
  const activeSkillOptions = activeChildDashboard
    ? dedupeSkills([
        ...activeChildDashboard.supportAreas,
        ...activeChildDashboard.strengths,
      ])
    : [];
  const activeSkill =
    activeSkillOptions.find((skill) => skill.skillCode === selectedSkillCode) ??
    activeChildDashboard?.supportAreas[0] ??
    activeChildDashboard?.strengths[0] ??
    null;
  const parentWeekSummary =
    activeChild && activeChildDashboard
      ? buildParentWeekSummary(
          activeChild.displayName,
          activeChildDashboard,
          activeSkillOptions.length,
        )
      : null;
  const parentTeacherMessage =
    activeChild && activeChildDashboard
      ? buildParentTeacherMessage(activeChild.displayName, activeChildDashboard)
      : "";
  const parentWeekendActivities = activeChildDashboard
    ? buildParentWeekendActivities(
        activeChildDashboard.supportAreas[0] ?? activeSkill,
        activeChildDashboard.strengths[0] ?? null,
      )
    : [];

  useEffect(() => {
    if (!result) {
      return;
    }

    const activeId = selectedChildId ?? result.linkedChild?.id ?? result.linkedChildren[0]?.id;
    const stillValid = activeId
      ? result.linkedChildren.some((child) => child.id === activeId)
      : false;

    if (!stillValid) {
      setSelectedChildId(result.linkedChild?.id ?? result.linkedChildren[0]?.id ?? null);
    }
  }, [result, selectedChildId]);

  useEffect(() => {
    if (!activeChildDashboard) {
      if (selectedSkillCode !== null) {
        setSelectedSkillCode(null);
      }
      return;
    }

    const fallbackSkillCode =
      activeChildDashboard.supportAreas[0]?.skillCode ??
      activeChildDashboard.strengths[0]?.skillCode ??
      null;

    if (
      selectedSkillCode &&
      activeSkillOptions.some((skill) => skill.skillCode === selectedSkillCode)
    ) {
      return;
    }

    if (fallbackSkillCode !== selectedSkillCode) {
      setSelectedSkillCode(fallbackSkillCode);
    }
  }, [activeChildDashboard, activeSkillOptions, selectedSkillCode]);

  function openAccessManager(section: AccessSection = "profile") {
    setShowAccessManager(true);
    setOpenAccessSection(section);
  }

  function closeAccessManager() {
    setShowAccessManager(false);
    setOpenAccessSection(null);
  }

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
      closeAccessManager();
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

        {result ? (
          <section className="route-grid route-grid-parent">
            <ShellCard
              className="shell-card-soft parent-access-ready-card"
              eyebrow="Access manager"
              title="Family access is ready"
            >
              <div className="parent-access-ready-banner">
                <span className="parent-access-ready-icon" aria-hidden="true">
                  ✓
                </span>
                <div className="parent-access-ready-copy">
                  <strong>{result.guardian.displayName} can see the family view.</strong>
                  <p>
                    {result.linkedChildren.length} linked child
                    {result.linkedChildren.length === 1 ? "" : "ren"} with calm
                    weekly summaries and milestone updates.
                  </p>
                </div>
              </div>

              <div className="parent-access-ready-grid">
                <article className="parent-access-identity-card">
                  {activeChild ? (
                    <div className="parent-access-person-row">
                      <span className="parent-access-avatar" aria-hidden="true">
                        {getAvatarSymbol(activeChild.avatarKey)}
                      </span>
                      <div>
                        <strong>{activeChild.displayName}</strong>
                        <span>{getBandLabel(activeChild.launchBandCode)}</span>
                      </div>
                      <em>Linked child</em>
                    </div>
                  ) : null}

                  <div className="parent-access-person-row">
                    <span className="parent-access-avatar parent-access-avatar-parent" aria-hidden="true">
                      👤
                    </span>
                    <div>
                      <strong>{result.guardian.displayName}</strong>
                      <span>@{result.guardian.username}</span>
                    </div>
                    <em>{relationship}</em>
                  </div>
                </article>

                <article className="parent-access-status-card">
                  <div className="parent-access-status-row">
                    <div className="parent-access-status-cell">
                      <strong>{notifyWeekly ? "On" : "Off"}</strong>
                      <span>Weekly summary</span>
                    </div>
                    <div className="parent-access-status-cell">
                      <strong>{notifyMilestones ? "On" : "Off"}</strong>
                      <span>Milestones</span>
                    </div>
                    <div className="parent-access-status-cell">
                      <strong>{result.linkedChildren.length}</strong>
                      <span>Linked children</span>
                    </div>
                  </div>

                  <div className="parent-access-cta-row">
                    <button
                      className="secondary-link button-link"
                      onClick={() =>
                        showAccessManager
                          ? closeAccessManager()
                          : openAccessManager("profile")
                      }
                      type="button"
                    >
                      {showAccessManager ? "Hide family access" : "Manage family access"}
                    </button>
                    <a className="primary-link" href="#parent-family-hub">
                      View family hub
                    </a>
                  </div>
                </article>
              </div>

              {showAccessManager ? (
                <form className="parent-access-inline-card" onSubmit={handleSubmit}>
                  <div className="parent-access-inline-tabs" role="tablist" aria-label="Family access sections">
                    <button
                      aria-pressed={openAccessSection === "profile"}
                      className={`parent-access-inline-tab ${openAccessSection === "profile" ? "is-current" : ""}`}
                      onClick={() =>
                        setOpenAccessSection((current) =>
                          current === "profile" ? null : "profile",
                        )
                      }
                      type="button"
                    >
                      Edit info
                    </button>
                    <button
                      aria-pressed={openAccessSection === "notifications"}
                      className={`parent-access-inline-tab ${openAccessSection === "notifications" ? "is-current" : ""}`}
                      onClick={() =>
                        setOpenAccessSection((current) =>
                          current === "notifications" ? null : "notifications",
                        )
                      }
                      type="button"
                    >
                      Notifications
                    </button>
                    <button
                      aria-pressed={openAccessSection === "relink"}
                      className={`parent-access-inline-tab ${openAccessSection === "relink" ? "is-current" : ""}`}
                      onClick={() =>
                        setOpenAccessSection((current) =>
                          current === "relink" ? null : "relink",
                        )
                      }
                      type="button"
                    >
                      Relink child
                    </button>
                  </div>

                  {openAccessSection === "profile" ? (
                    <div className="parent-access-inline-panel">
                      <div className="field-grid">
                        <FieldBlock
                          helper="Shown in family summaries and notifications."
                          label="Display name"
                          onChange={(event) => setDisplayName(event.target.value)}
                          placeholder="Parent name"
                          value={displayName}
                        />
                        <label className="field-block">
                          <span>Relationship</span>
                          <div className="summary-chip-row">
                            {["parent", "guardian", "grandparent", "other"].map((option) => (
                              <button
                                className={`summary-chip parent-access-chip ${relationship === option ? "is-current" : ""}`}
                                key={option}
                                onClick={() => setRelationship(option)}
                                type="button"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                          <small>
                            Use a calm, plain relationship label. This only affects how the family view is described.
                          </small>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {openAccessSection === "notifications" ? (
                    <div className="parent-access-inline-panel">
                      <div className="parent-toggle-list">
                        <button
                          className={`parent-toggle-row ${notifyWeekly ? "is-on" : ""}`}
                          onClick={() => setNotifyWeekly((value) => !value)}
                          type="button"
                        >
                          <div>
                            <strong>Weekly summary</strong>
                            <span>Time spent, productive time, and next support areas.</span>
                          </div>
                          <b>{notifyWeekly ? "On" : "Off"}</b>
                        </button>
                        <button
                          className={`parent-toggle-row ${notifyMilestones ? "is-on" : ""}`}
                          onClick={() => setNotifyMilestones((value) => !value)}
                          type="button"
                        >
                          <div>
                            <strong>Milestones and badges</strong>
                            <span>Celebrate progress without a noisy stream of alerts.</span>
                          </div>
                          <b>{notifyMilestones ? "On" : "Off"}</b>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {openAccessSection === "relink" ? (
                    <div className="parent-access-inline-panel">
                      <div className="parent-inline-warning">
                        <strong>Relinking is uncommon.</strong>
                        <p>
                          Use it only when the wrong child is connected or the family setup changed.
                        </p>
                      </div>
                      <FieldBlock
                        helper="Use the child username already created in the app."
                        label="Child username"
                        onChange={(event) => setChildUsername(event.target.value)}
                        placeholder="child quest name"
                        value={childUsername}
                      />
                      {activeChild ? (
                        <div className="parent-current-link-row">
                          <div>
                            <strong>Currently linked</strong>
                            <span>{activeChild.displayName}</span>
                          </div>
                          <em>{getBandLabel(activeChild.launchBandCode)}</em>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {error ? <p className="status-banner status-error">{error}</p> : null}

                  <div className="form-actions">
                    <button className="primary-link button-link" disabled={submitting} type="submit">
                      {submitting ? "Saving..." : "Save family changes"}
                    </button>
                    <button
                      className="secondary-link button-link"
                      onClick={closeAccessManager}
                      type="button"
                    >
                      Done
                    </button>
                  </div>
                </form>
              ) : null}
            </ShellCard>
          </section>
        ) : null}

        {!result ? (
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
                  <span>Time spent, productive time, and next focus areas.</span>
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
                <li>How is my child doing right now?</li>
                <li>What changed recently?</li>
                <li>What should we try next at home?</li>
                <li>How do I report a confusing flow or bug?</li>
              </ul>
              {error ? <p className="status-banner status-error">{error}</p> : null}
              <div className="status-panel">
                <strong>The calmer family dashboard appears right after access is saved.</strong>
                <p>
                  Once linked, the route switches into the family hub with child switching, recent activity,
                  and home practice guidance.
                </p>
              </div>
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
        ) : null}

        {result && activeChild && activeChildDashboard ? (
          <section className="parent-hub-layout" id="parent-family-hub">
            <div className="parent-hub-main">
              <article className="parent-summary-rail">
                <div
                  className={`parent-summary-hero ${
                    result.linkedChildren.length > 1 ? "is-family" : "is-single"
                  }`}
                >
                  <div className="parent-hub-greeting">
                    <span className="eyebrow">This week</span>
                    <h2>{parentWeekSummary?.headline}</h2>
                    <p>{parentWeekSummary?.body}</p>
                    <div className="parent-week-chip-row">
                      {parentWeekSummary?.chips.map((chip) => (
                        <span className="parent-week-chip" key={chip}>
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="parent-summary-actions">
                    <button
                      className="secondary-link button-link"
                      onClick={() => openAccessManager("profile")}
                      type="button"
                    >
                      Manage access
                    </button>
                    <a className="secondary-link" href="#parent-feedback">
                      Send feedback
                    </a>
                  </div>
                </div>

                <div className="parent-chip-strip" role="tablist" aria-label="Linked children">
                  {result.linkedChildren.map((child) => (
                    <button
                      aria-selected={activeChildId === child.id}
                      className={`parent-chip-button ${activeChildId === child.id ? "is-active" : ""}`}
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      role="tab"
                      type="button"
                    >
                      <span className="parent-chip-avatar" aria-hidden="true">
                        {getAvatarSymbol(child.avatarKey)}
                      </span>
                      <span className="parent-chip-copy">
                        <strong>{child.displayName}</strong>
                        <small>{getBandLabel(child.launchBandCode)}</small>
                      </span>
                    </button>
                  ))}
                </div>

                <article className="parent-kpi-card">
                  <div className="parent-kpi-compact-grid">
                    <div className="parent-kpi-compact-cell">
                      <span>Time playing</span>
                      <strong>{formatMinutes(activeChildDashboard.totalTimeSpentMs)}</strong>
                      <small>{activeChildDashboard.completedSessions} finished sessions</small>
                    </div>
                    <div className="parent-kpi-compact-cell">
                      <span>Effective time</span>
                      <strong>{formatMinutes(activeChildDashboard.effectiveTimeSpentMs)}</strong>
                      <small>{formatPercent(activeChildDashboard.averageEffectiveness)} productive play</small>
                    </div>
                    <div className="parent-kpi-compact-cell">
                      <span>Skills practiced</span>
                      <strong>{activeSkillOptions.length}</strong>
                      <small>{activeChildDashboard.strengths.length} growing strengths</small>
                    </div>
                    <div className="parent-kpi-compact-cell">
                      <span>Next up</span>
                      <strong>{activeChildDashboard.recommendedFocus}</strong>
                      <small>{activeChildDashboard.readinessLabel}</small>
                    </div>
                  </div>
                </article>

                <div className="parent-status-line-banner">
                  <span className="parent-status-line-dot" aria-hidden="true" />
                  <div>
                    <strong>{activeChild.displayName} is making progress this week.</strong>
                    <p>
                      Keep the next practice calm and short around {activeChildDashboard.recommendedFocus.toLowerCase()}.
                    </p>
                  </div>
                </div>

                <div className="parent-summary-grid">
                  <article className="parent-summary-card">
                    <span>How is {activeChild.displayName} doing?</span>
                    <strong>{activeChildDashboard.readinessLabel}</strong>
                    <p>
                      {formatPercent(activeChildDashboard.averageEffectiveness)} productive play and{" "}
                      {formatPercent(activeChildDashboard.completionRate)} finished sessions recently.
                    </p>
                  </article>
                  <article className="parent-summary-card">
                    <span>What changed recently?</span>
                    <strong>Last active {formatLastSeen(activeChildDashboard.lastSessionAt)}</strong>
                    <p>
                      {activeChild.badgeCount} badges, {activeChild.trophyCount} trophies, and{" "}
                      {activeChildDashboard.completedSessions} completed sessions so far.
                    </p>
                  </article>
                  <article className="parent-summary-card">
                    <span>What should we try next?</span>
                    <strong>{activeChildDashboard.recommendedFocus}</strong>
                    <p>Keep the next practice short, calm, and focused on one support area.</p>
                  </article>
                </div>

                <div className="parent-summary-signal-row">
                  <span className="summary-chip">
                    Weekly summary {notifyWeekly ? "on" : "off"}
                  </span>
                  <span className="summary-chip">
                    Milestones {notifyMilestones ? "on" : "off"}
                  </span>
                  <span className="summary-chip">
                    Productive time {formatMinutes(activeChildDashboard.effectiveTimeSpentMs)}
                  </span>
                </div>
              </article>

              <ShellCard
                className="shell-card-soft"
                eyebrow="Family center"
                title="Every linked child, one calmer family view"
              >
                <div className="parent-family-summary-row">
                  <article className="parent-family-summary-card">
                    <span>Linked children</span>
                    <strong>{result.linkedChildren.length}</strong>
                    <p>
                      {result.linkedChildren.length === 1
                        ? "One child is linked right now. This keeps the family view simple while you test the flow."
                        : "Switch children without leaving the parent route and keep the active child obvious."}
                    </p>
                  </article>
                  <article className="parent-family-summary-card">
                    <span>Family sessions</span>
                    <strong>{familyTotals?.completedSessions ?? 0}</strong>
                    <p>Finished sessions across all currently linked children.</p>
                  </article>
                  <article className="parent-family-summary-card">
                    <span>Family time</span>
                    <strong>
                      {familyTotals ? formatMinutes(familyTotals.totalTimeSpentMs) : "0 min"}
                    </strong>
                    <p>
                      {familyTotals
                        ? `${formatMinutes(familyTotals.effectiveTimeSpentMs)} effective time so far.`
                        : "Family time will appear here as sessions complete."}
                    </p>
                  </article>
                </div>

                <div className="parent-family-card-grid">
                  {result.linkedChildren.map((child) => {
                    const dashboard = result.childDashboards.find(
                      (item) => item.studentId === child.id,
                    );

                    return (
                      <button
                        className={`parent-family-card ${activeChildId === child.id ? "is-active" : ""}`}
                        key={child.id}
                        onClick={() => setSelectedChildId(child.id)}
                        type="button"
                      >
                        <div className="parent-family-card-top">
                          <span className="parent-linked-avatar" aria-hidden="true">
                            {getAvatarSymbol(child.avatarKey)}
                          </span>
                          <div className="parent-family-card-copy">
                            <strong>{child.displayName}</strong>
                            <span>{getBandLabel(child.launchBandCode)}</span>
                          </div>
                          {activeChildId === child.id ? (
                            <span className="parent-family-active-pill">Active</span>
                          ) : null}
                        </div>
                        <p>
                          {dashboard
                            ? `${dashboard.readinessLabel}. Next focus: ${dashboard.recommendedFocus}.`
                            : "No completed sessions yet, so recommendations will appear after the first play loop."}
                        </p>
                        <div className="summary-chip-row">
                          <span className="summary-chip">
                            Level {child.currentLevel}
                          </span>
                          <span className="summary-chip">
                            {child.totalPoints} pts
                          </span>
                          <span className="summary-chip">
                            {dashboard
                              ? `${dashboard.completedSessions} sessions`
                              : "Just linked"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="parent-relink-banner">
                  <div>
                    <strong>Wrong child linked or family changed?</strong>
                    <p>
                      Use the access form to relink calmly. This keeps the active
                      child clear without hiding the rest of the family view.
                    </p>
                  </div>
                  <button
                    className="secondary-link button-link"
                    onClick={() => setShowAccessManager(true)}
                    type="button"
                  >
                    Manage linkage
                  </button>
                </div>
              </ShellCard>

              <div className="parent-kpi-row">
                <StatTile
                  label="Current level"
                  value={`${activeChild.currentLevel}`}
                  detail={`${activeChild.totalPoints} total points`}
                />
                <StatTile
                  label="Finished sessions"
                  value={`${activeChildDashboard.completedSessions}`}
                  detail="Across recent play"
                />
                <StatTile
                  label="Productive time"
                  value={formatMinutes(activeChildDashboard.effectiveTimeSpentMs)}
                  detail={`${formatMinutes(activeChildDashboard.totalTimeSpentMs)} total`}
                />
                <StatTile
                  label="Comfort signal"
                  value={formatPercent(activeChildDashboard.averageEffectiveness)}
                  detail={`Finished ${formatPercent(activeChildDashboard.completionRate)}`}
                />
              </div>

              <ShellCard
                className="shell-card-emphasis"
                eyebrow="Dashboard"
                title={`For ${activeChild.displayName} right now`}
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
                    <strong>Getting more comfortable</strong>
                    <div className="skill-list">
                      {activeChildDashboard.strengths.map((item) => (
                        <button
                          className={`skill-meter skill-meter-button ${selectedSkillCode === item.skillCode ? "is-selected" : ""}`}
                          key={item.skillCode}
                          onClick={() => setSelectedSkillCode(item.skillCode)}
                          type="button"
                        >
                          <div className="skill-meter-row">
                            <strong>{item.displayName}</strong>
                            <span>{item.masteryRate}%</span>
                          </div>
                          <div className="progress-rail" aria-hidden="true">
                            <span style={{ width: `${item.masteryRate}%` }} />
                          </div>
                          <small>{item.attempts} answered prompts</small>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="parent-skill-card">
                    <strong>Needs more support</strong>
                    <div className="skill-list">
                      {activeChildDashboard.supportAreas.map((item) => (
                        <button
                          className={`skill-meter skill-meter-button ${selectedSkillCode === item.skillCode ? "is-selected" : ""}`}
                          key={item.skillCode}
                          onClick={() => setSelectedSkillCode(item.skillCode)}
                          type="button"
                        >
                          <div className="skill-meter-row">
                            <strong>{item.displayName}</strong>
                            <span>{item.masteryRate}%</span>
                          </div>
                          <div className="progress-rail" aria-hidden="true">
                            <span style={{ width: `${item.masteryRate}%` }} />
                          </div>
                          <small>{item.attempts} answered prompts</small>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ShellCard>

              <ShellCard
                className="shell-card-soft"
                eyebrow="Skill detail"
                title={activeSkill ? `${activeSkill.displayName}, explained simply` : "Skill detail"}
              >
                {activeSkill ? (
                  <div className="parent-skill-detail-layout">
                    <div className="summary-chip-row">
                      {activeSkillOptions.map((skill) => (
                        <button
                          className={`summary-chip parent-skill-switch ${selectedSkillCode === skill.skillCode ? "is-current" : ""}`}
                          key={skill.skillCode}
                          onClick={() => setSelectedSkillCode(skill.skillCode)}
                          type="button"
                        >
                          {skill.displayName}
                        </button>
                      ))}
                    </div>

                    <div className="parent-skill-detail-grid">
                      <article className="parent-skill-detail-card">
                        <span>What this means</span>
                        <strong>{describeSkillInParentLanguage(activeSkill.skillCode, activeSkill.displayName)}</strong>
                      </article>
                      <article className="parent-skill-detail-card">
                        <span>Current signal</span>
                        <strong>{buildParentSkillSignal(activeSkill.masteryRate)}</strong>
                        <p>
                          {activeSkill.masteryRate}% mastery across {activeSkill.attempts} answered prompts.
                        </p>
                      </article>
                      <article className="parent-skill-detail-card">
                        <span>What to try next at home</span>
                        <strong>{buildParentSkillAction(activeSkill.skillCode, activeSkill.displayName)}</strong>
                      </article>
                    </div>

                    <div className="parent-skill-detail-banner">
                      <span aria-hidden="true">🏠</span>
                      <div>
                        <strong>Keep it short and calm</strong>
                        <p>
                          Use one tiny practice moment, then stop while the child
                          is still feeling successful.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="soft-copy">
                    A plain-language skill explanation will appear here once a
                    child has enough activity to show a meaningful support or
                    strength area.
                  </p>
                )}
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
                  {" "}productive play so far.
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
                <span className="parent-insight-label">What to try next at home</span>
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

              <article className="parent-teacher-strip-card">
                <span className="parent-insight-label">From school</span>
                <div className="parent-teacher-strip-header">
                  <span className="parent-teacher-avatar" aria-hidden="true">
                    JL
                  </span>
                  <div>
                    <strong>Teacher guidance</strong>
                    <p>Shared for the current family summary lane</p>
                  </div>
                </div>
                <blockquote>{parentTeacherMessage}</blockquote>
              </article>

              <article className="parent-activity-card">
                <span className="parent-insight-label">Try this weekend</span>
                <div className="parent-activity-stack">
                  {parentWeekendActivities.map((activity) => (
                    <div className="parent-activity-row" key={activity.title}>
                      <span className="parent-activity-icon" aria-hidden="true">
                        {activity.icon}
                      </span>
                      <div>
                        <strong>{activity.title}</strong>
                        <p>{activity.body}</p>
                      </div>
                      <small>{activity.tag}</small>
                    </div>
                  ))}
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
