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

type ParentAccessMode = "new" | "returning";
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
    headline: `${childName} is building confidence one short lesson at a time.`,
    body: `The next step is to keep practice calm, short, and centered on ${dashboard.recommendedFocus.toLowerCase()}.`,
    chips: [
      `${dashboard.completedSessions} finished sessions`,
      `${dashboard.supportAreas.length} skill to strengthen`,
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

const parentPreviewWeekly = {
  childName: "Maya",
  bandLabel: "Kinder – Grade 1",
  summary:
    "Maya had a calmer week with stronger counting confidence and one clear next step in sight words.",
  chips: ["3 strengths", "1 building", "2 next ideas"],
  kpis: [
    {
      label: "Days practiced",
      value: "4",
      detail: "short sessions",
    },
    {
      label: "Effective time",
      value: "18 min",
      detail: "steady engagement",
    },
    {
      label: "Badges earned",
      value: "2",
      detail: "this week",
    },
  ],
  strengths: ["Counting objects", "Matching shapes", "Quick number recognition"],
  support: "Sight words · List 2",
  teacherMessage:
    "Maya is looking more comfortable with counting. A short, playful sight-word check-in at home would be the best next step this week.",
  activities: [
    {
      icon: "📚",
      title: "Two-minute sight word warmup",
      body: "Pick one target word, say it together, then spot it once in a book or label nearby.",
      tag: "2 min",
    },
    {
      icon: "🍓",
      title: "Count small groups out loud",
      body: "Use snacks, blocks, or fruit and let Maya touch each item while counting slowly.",
      tag: "Confidence",
    },
    {
      icon: "🎉",
      title: "Stop after one clear win",
      body: "Leave the session while it still feels easy so the next return to WonderQuest feels positive.",
      tag: "Routine",
    },
  ],
};

export default function ParentAccessPage() {
  const [accessMode, setAccessMode] = useState<ParentAccessMode>("returning");
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
  const returningAccessMode = accessMode === "returning";
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
  const supportSkillCodes = new Set(
    activeChildDashboard?.supportAreas.map((skill) => skill.skillCode) ?? [],
  );
  const parentNextMilestoneSkills = activeSkillOptions.filter(
    (skill) =>
      !supportSkillCodes.has(skill.skillCode) &&
      skill.masteryRate >= 65 &&
      skill.masteryRate < 85,
  );
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
  const familyBadgeTotal = result
    ? result.linkedChildren.reduce((total, child) => total + child.badgeCount, 0)
    : 0;
  const familyTrophyTotal = result
    ? result.linkedChildren.reduce((total, child) => total + child.trophyCount, 0)
    : 0;
  const primaryStrength = activeChildDashboard?.strengths[0] ?? null;
  const primarySupport = activeChildDashboard?.supportAreas[0] ?? null;
  const parentNextMilestone =
    parentNextMilestoneSkills.find(
      (skill) => skill.skillCode !== primaryStrength?.skillCode,
    ) ??
    activeSkillOptions.find(
      (skill) =>
        !supportSkillCodes.has(skill.skillCode) &&
        skill.skillCode !== primaryStrength?.skillCode,
    ) ??
    null;
  const parentSkillSnapshot = [
    {
      accent: "strength" as const,
      detail: primaryStrength
        ? `${primaryStrength.displayName} is feeling steady right now. Keep it easy and let WonderQuest stretch it naturally.`
        : "Strength signals will appear after a few more sessions.",
      label: "Strength",
      skillCode: primaryStrength?.skillCode ?? null,
      value: primaryStrength?.displayName ?? "Confidence is building",
    },
    {
      accent: "support" as const,
      detail: primarySupport
        ? buildParentSkillAction(primarySupport.skillCode, primarySupport.displayName)
        : "Keep the next practice short, calm, and focused on one clear success.",
      label: "Building",
      skillCode: primarySupport?.skillCode ?? null,
      value: primarySupport?.displayName ?? activeChildDashboard?.recommendedFocus ?? "Next focus",
    },
    {
      accent: "next" as const,
      detail: parentNextMilestone
        ? `${parentNextMilestone.displayName} looks close to the next unlock. Two or three short sessions should help it stick.`
        : `A calmer run at ${activeChildDashboard?.recommendedFocus ?? "the next focus"} will set up the next milestone.`,
      label: "Next milestone",
      skillCode:
        parentNextMilestone?.skillCode ??
        primarySupport?.skillCode ??
        primaryStrength?.skillCode ??
        null,
      value: parentNextMilestone?.displayName ?? activeChildDashboard?.recommendedFocus ?? "Next unlock",
    },
  ];
  const parentQuickLinks = [
    {
      detail: notifyWeekly ? "Weekly summary on" : "Weekly summary off",
      href: "#parent-feedback",
      label: "Share feedback",
    },
    {
      detail: `${result?.linkedChildren.length ?? 0} linked children`,
      href: "#parent-family-hub",
      label: "Switch child focus",
    },
    {
      detail: `${familyBadgeTotal} badges · ${familyTrophyTotal} trophies`,
      href: "#parent-family-detail",
      label: "Open family detail",
    },
  ];
  const parentTopAnswers = [
    {
      detail: `${formatMinutes(activeChildDashboard?.effectiveTimeSpentMs ?? 0)} effective time · last active ${formatLastSeen(activeChildDashboard?.lastSessionAt ?? null)}`,
      label: "What happened",
      tone: "summary" as const,
      value: `${activeChildDashboard?.completedSessions ?? 0} lesson${
        activeChildDashboard?.completedSessions === 1 ? "" : "s"
      } finished`,
    },
    {
      detail: primaryStrength
        ? `${activeChild?.displayName ?? "Your child"} is looking steadier in this skill right now.`
        : "A stronger pattern will appear after a few more sessions.",
      label: "What is going well",
      tone: "strength" as const,
      value: primaryStrength?.displayName ?? "Confidence is building",
    },
    {
      detail: primarySupport
        ? buildParentSkillAction(primarySupport.skillCode, primarySupport.displayName)
        : `Keep the next practice short and calm around ${activeChildDashboard?.recommendedFocus?.toLowerCase() ?? "the next focus"}.`,
      label: "What to do next",
      tone: "next" as const,
      value: primarySupport?.displayName ?? activeChildDashboard?.recommendedFocus ?? "Next focus",
    },
  ];

  // Attempt cookie-based session restore on first mount.
  // If the parent already has a valid wonderquest-parent-session cookie,
  // skip the credential form and restore the family dashboard silently.
  useEffect(() => {
    let cancelled = false;

    async function trySessionRestore() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });

        if (!response.ok || cancelled) {
          return;
        }

        const payload = (await response.json()) as ParentAccessResponse;

        if (cancelled) {
          return;
        }

        setSelectedChildId(
          payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null,
        );
        setResult(payload);
        setShowAccessManager(false);
      } catch {
        // No valid session — stay on the credential form.
      }
    }

    void trySessionRestore();
    return () => {
      cancelled = true;
    };
  }, []);

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
          displayName: returningAccessMode ? "" : displayName,
          childUsername: returningAccessMode ? "" : childUsername,
          relationship: returningAccessMode ? "parent" : relationship,
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
                            Shown in family summaries — e.g. Mom, Dad, Grandma.
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
          <section className="parent-preview-layout" id="parent-access-form">
            <div className="parent-preview-main">
              <article className="parent-summary-hero is-single parent-preview-hero">
                <div className="parent-hub-greeting">
                  <span className="eyebrow">This week</span>
                  <h2>Family learning snapshot with calmer, actionable signals.</h2>
                  <p>{parentPreviewWeekly.summary}</p>
                  <div className="parent-week-chip-row">
                    {parentPreviewWeekly.chips.map((chip) => (
                      <span className="parent-week-chip" key={chip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="parent-preview-kpi-stack">
                  {parentPreviewWeekly.kpis.map((item) => (
                    <div className="parent-preview-kpi" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <small>{item.detail}</small>
                    </div>
                  ))}
                </div>
              </article>

              <div className="parent-preview-grid">
                <article className="parent-weekly-card parent-preview-card">
                  <span className="parent-weekly-label">Weekly summary</span>
                  <strong>{parentPreviewWeekly.childName}</strong>
                  <p>
                    {parentPreviewWeekly.bandLabel}. Each week you'll see your
                    child's strongest skill, the best area for practice, and
                    ready-to-use activity ideas.
                  </p>
                  <div className="parent-weekly-stats">
                    <div>
                      <span>Strengths</span>
                      <strong>3</strong>
                    </div>
                    <div>
                      <span>Building</span>
                      <strong>1</strong>
                    </div>
                    <div>
                      <span>Next ideas</span>
                      <strong>2</strong>
                    </div>
                  </div>
                </article>

                <article className="parent-next-step-card">
                  <span className="parent-insight-label">Strongest next step</span>
                  <strong>{parentPreviewWeekly.support}</strong>
                  <p>
                    Keep the next practice short, calm, and clear. One targeted
                    activity is more useful than a long session.
                  </p>
                  <div className="parent-action-list">
                    <div>
                      <span>Best practice window</span>
                      <strong>2–5 minutes</strong>
                    </div>
                    <div>
                      <span>Family mode</span>
                      <strong>Quiet + positive</strong>
                    </div>
                    <div>
                      <span>Next step</span>
                      <strong>Home practice</strong>
                    </div>
                  </div>
                </article>
              </div>

              <ShellCard
                className="shell-card-soft parent-preview-highlights"
                eyebrow="Family view"
                title="What parents should understand in seconds"
              >
                <div className="parent-answer-list">
                  <div className="parent-answer-row">
                    <span className="parent-answer-icon" aria-hidden="true">
                      ✅
                    </span>
                    <div className="parent-answer-copy">
                      <strong>What is going well right now?</strong>
                      <p>{parentPreviewWeekly.strengths.join(", ")} are reading as current strengths.</p>
                    </div>
                  </div>
                  <div className="parent-answer-row">
                    <span className="parent-answer-icon" aria-hidden="true">
                      🌱
                    </span>
                    <div className="parent-answer-copy">
                      <strong>What needs a little more support?</strong>
                      <p>{parentPreviewWeekly.support} is the clearest place for one calm home follow-up.</p>
                    </div>
                  </div>
                  <div className="parent-answer-row">
                    <span className="parent-answer-icon" aria-hidden="true">
                      🧭
                    </span>
                    <div className="parent-answer-copy">
                      <strong>What should we do next?</strong>
                      <p>Start with one tiny practice idea, then stop while it still feels easy.</p>
                    </div>
                  </div>
                </div>
              </ShellCard>

              <div className="parent-preview-grid">
                <article className="parent-teacher-strip-card">
                  <span className="parent-insight-label">From school</span>
                  <div className="parent-teacher-strip-header">
                    <span className="parent-teacher-avatar" aria-hidden="true">
                      JL
                    </span>
                    <div>
                      <strong>Teacher guidance</strong>
                      <p>Shared in plain family language</p>
                    </div>
                  </div>
                  <blockquote>{parentPreviewWeekly.teacherMessage}</blockquote>
                </article>

                <article className="parent-activity-card">
                  <span className="parent-insight-label">Try this week</span>
                  <div className="parent-activity-stack">
                    {parentPreviewWeekly.activities.map((activity) => (
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
              </div>
            </div>

            <aside className="parent-preview-side">
              <ShellCard
                className="shell-card-emphasis parent-access-manager-card"
                eyebrow="Parent access"
                title={
                  returningAccessMode
                    ? "Sign in to an existing parent account"
                    : "Create parent access"
                }
              >
                <p className="soft-copy">
                  {returningAccessMode
                    ? "Use the same parent username and 4-digit PIN. Linked children and family summaries appear right after sign-in."
                    : "Create parent access once, link the child profile, and later visits use the same username and PIN."}
                </p>
                <div className="parent-access-mode-row">
                  <button
                    className={`parent-access-mode-card ${returningAccessMode ? "is-current" : ""}`}
                    onClick={() => {
                      setAccessMode("returning");
                      setError("");
                    }}
                    type="button"
                  >
                    <span className="parent-access-mode-icon" aria-hidden="true">
                      🔐
                    </span>
                    <div>
                      <strong>Existing parent sign-in</strong>
                      <small>Use the same parent username and 4-digit PIN.</small>
                    </div>
                  </button>
                  <button
                    className={`parent-access-mode-card ${!returningAccessMode ? "is-current" : ""}`}
                    onClick={() => {
                      setAccessMode("new");
                      setError("");
                    }}
                    type="button"
                  >
                    <span className="parent-access-mode-icon" aria-hidden="true">
                      ✨
                    </span>
                    <div>
                      <strong>First-time parent setup</strong>
                      <small>Create access, add the adult name, and link the child profile once.</small>
                    </div>
                  </button>
                </div>
                <form className="parent-access-compact-form" onSubmit={handleSubmit}>
                  <div className="field-grid">
                    <FieldBlock
                      autoComplete="username"
                      helper={
                        returningAccessMode
                          ? "Use the same parent username from the earlier setup."
                          : "Create the username this adult will use for future sign-in."
                      }
                      label="Username"
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="parent username"
                      value={username}
                    />
                    <FieldBlock
                      autoComplete="current-password"
                      helper={
                        returningAccessMode
                          ? "Use the same 4-digit PIN from the parent account."
                          : "Create a 4-digit PIN for future sign-in."
                      }
                      label="4-digit PIN"
                      maxLength={4}
                      onChange={(event) => setPin(event.target.value)}
                      placeholder="0000"
                      type="password"
                      value={pin}
                    />
                    {!returningAccessMode ? (
                      <FieldBlock
                        helper="Shown in family summaries."
                        label="Display name"
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Parent name"
                        value={displayName}
                      />
                    ) : null}
                    {!returningAccessMode ? (
                      <FieldBlock
                        helper="Use the child username already created in the app."
                        label="Child username"
                        onChange={(event) => setChildUsername(event.target.value)}
                        placeholder="child quest name"
                        value={childUsername}
                      />
                    ) : null}
                  </div>

                  {returningAccessMode ? (
                    <div className="parent-access-inline-note">
                      <strong>Existing parent sign-in only needs username + PIN.</strong>
                      <p>
                        Display name, child linking, and notification choices are first-time setup steps,
                        not required every time you return.
                      </p>
                    </div>
                  ) : (
                    <div className="parent-preview-toggle-list">
                      <button
                        className={`parent-toggle-row ${notifyWeekly ? "is-on" : ""}`}
                        onClick={() => setNotifyWeekly((value) => !value)}
                        type="button"
                      >
                        <div>
                          <strong>Weekly summary</strong>
                          <span>Time spent, calm insights, and next focus.</span>
                        </div>
                        <b>{notifyWeekly ? "On" : "Off"}</b>
                      </button>
                      <button
                        className={`parent-toggle-row ${notifyMilestones ? "is-on" : ""}`}
                        onClick={() => setNotifyMilestones((value) => !value)}
                        type="button"
                      >
                        <div>
                          <strong>Milestones</strong>
                          <span>Badges, trophies, and level moments.</span>
                        </div>
                        <b>{notifyMilestones ? "On" : "Off"}</b>
                      </button>
                    </div>
                  )}

                  {error ? <p className="status-banner status-error">{error}</p> : null}

                  <div className="form-actions">
                    <button className="primary-link button-link" disabled={submitting} type="submit">
                      {submitting
                        ? returningAccessMode
                          ? "Signing in..."
                          : "Saving..."
                        : returningAccessMode
                          ? "Sign in to family view"
                          : "Create parent access"}
                    </button>
                    <Link className="secondary-link" href="/child">
                      Child access
                    </Link>
                  </div>
                </form>
              </ShellCard>

              <article className="parent-settings-card parent-preview-settings-card">
                <span className="parent-insight-label">What opens next</span>
                <strong>Linked children, weekly reports, and next-home-practice ideas</strong>
                <p>
                  After access is saved, the route switches into the calmer family hub with child switching,
                  activity history, and recommended next steps.
                </p>
                <div className="parent-settings-list">
                  <div className="parent-settings-row">
                    <div>
                      <strong>Child-aware reporting</strong>
                      <span>Every linked child stays visible.</span>
                    </div>
                    <b>Ready</b>
                  </div>
                  <div className="parent-settings-row">
                    <div>
                      <strong>Teacher-style guidance</strong>
                      <span>One plain-language message, not a wall of data.</span>
                    </div>
                    <b>Included</b>
                  </div>
                </div>
              </article>
            </aside>
          </section>
        ) : null}

        {result && activeChild && activeChildDashboard ? (
          <>
            <section className="parent-family-desk" id="parent-family-hub">
              <aside className="parent-family-left-rail">
                <article className="parent-family-panel parent-family-profile-card">
                  <div className="parent-family-panel-label">Family account</div>
                  <div className="parent-family-account-row">
                    <span className="parent-family-account-avatar" aria-hidden="true">
                      👨‍👩‍👧
                    </span>
                    <div>
                      <strong>{result.guardian.displayName}</strong>
                      <span>@{result.guardian.username}</span>
                    </div>
                  </div>
                  <div className="parent-family-mini-stats">
                    <div>
                      <span>Linked children</span>
                      <strong>{result.linkedChildren.length}</strong>
                    </div>
                    <div>
                      <span>Family sessions</span>
                      <strong>{familyTotals?.completedSessions ?? 0}</strong>
                    </div>
                    <div>
                      <span>Badges</span>
                      <strong>{familyBadgeTotal}</strong>
                    </div>
                  </div>
                  <div className="parent-family-profile-actions">
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
                </article>

                <article className="parent-family-panel">
                  <div className="parent-family-panel-label">Your learners</div>
                  <div className="parent-family-switcher-stack" role="tablist" aria-label="Linked children">
                    {result.linkedChildren.map((child) => {
                      const dashboard = result.childDashboards.find(
                        (item) => item.studentId === child.id,
                      );

                      return (
                        <button
                          aria-selected={activeChildId === child.id}
                          className={`parent-family-switch-card ${activeChildId === child.id ? "is-active" : ""}`}
                          key={child.id}
                          onClick={() => setSelectedChildId(child.id)}
                          role="tab"
                          type="button"
                        >
                          <span className="parent-family-switch-avatar" aria-hidden="true">
                            {getAvatarSymbol(child.avatarKey)}
                          </span>
                          <div className="parent-family-switch-copy">
                            <strong>{child.displayName}</strong>
                            <span>{getBandLabel(child.launchBandCode)}</span>
                            <small>
                              {dashboard
                                ? `${dashboard.readinessLabel} · ${dashboard.recommendedFocus}`
                                : "No activity yet — help your child complete their first lesson"}
                            </small>
                          </div>
                          {activeChildId === child.id ? (
                            <em>Active</em>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </article>

                <article className="parent-family-panel parent-family-quick-links">
                  <div className="parent-family-panel-label">Quick links</div>
                  <div className="parent-family-quick-link-stack">
                    {parentQuickLinks.map((link) => (
                      <a className="parent-family-quick-link" href={link.href} key={link.label}>
                        <div>
                          <strong>{link.label}</strong>
                          <span>{link.detail}</span>
                        </div>
                        <b>Open</b>
                      </a>
                    ))}
                  </div>
                </article>
              </aside>

              <div className="parent-family-center-rail">
                <article
                  className={`parent-family-week-hero ${
                    result.linkedChildren.length > 1 ? "is-family" : "is-single"
                  }`}
                >
                  <div className="parent-family-week-copy">
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

                  <div className="parent-family-week-metrics">
                    <div className="parent-family-week-metric">
                      <span>Effective time</span>
                      <strong>{formatMinutes(activeChildDashboard.effectiveTimeSpentMs)}</strong>
                      <small>{formatPercent(activeChildDashboard.averageEffectiveness)} productive play</small>
                    </div>
                    <div className="parent-family-week-metric">
                      <span>Sessions</span>
                      <strong>{activeChildDashboard.completedSessions}</strong>
                      <small>{formatMinutes(activeChildDashboard.totalTimeSpentMs)} total</small>
                    </div>
                    <div className="parent-family-week-metric">
                      <span>Points</span>
                      <strong>{activeChild.totalPoints}</strong>
                      <small>Level {activeChild.currentLevel}</small>
                    </div>
                    <div className="parent-family-week-metric">
                      <span>Next focus</span>
                      <strong>{activeChildDashboard.recommendedFocus}</strong>
                      <small>{activeChildDashboard.readinessLabel}</small>
                    </div>
                  </div>
                </article>

                <article className="parent-family-answer-strip" aria-label="Parent quick answers">
                  <div className="parent-family-answer-grid">
                    {parentTopAnswers.map((item) => (
                      <div className={`parent-family-answer-card is-${item.tone}`} key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <p>{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="parent-family-summary-card">
                  <div className="parent-family-summary-header">
                    <div>
                      <div className="parent-family-panel-label">Skills snapshot</div>
                      <h3>{activeChild.displayName}'s week at a glance</h3>
                    </div>
                    <a className="parent-family-summary-link" href="#parent-family-detail">
                      See full progress map
                    </a>
                  </div>

                  <div className="parent-family-sns-grid" aria-label="Selected child skills snapshot">
                    <div className="parent-family-sns-cell is-strength">
                      <span>Strengths</span>
                      <strong>{activeChildDashboard.strengths.length}</strong>
                      <small>Feeling steady</small>
                    </div>
                    <div className="parent-family-sns-cell is-support">
                      <span>Building</span>
                      <strong>{activeChildDashboard.supportAreas.length}</strong>
                      <small>Needs one short follow-up</small>
                    </div>
                    <div className="parent-family-sns-cell is-next">
                      <span>Almost there</span>
                      <strong>{parentNextMilestone ? "1" : "0"}</strong>
                      <small>Close to the next unlock</small>
                    </div>
                  </div>

                  <div className="parent-family-skill-highlight-list">
                    {parentSkillSnapshot.map((item) => (
                      <button
                        className={`parent-family-skill-highlight is-${item.accent}`}
                        key={item.label}
                        onClick={() => {
                          setSelectedSkillCode(item.skillCode);
                          document
                            .getElementById("parent-family-detail")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        type="button"
                      >
                        <span className="parent-family-skill-dot" aria-hidden="true" />
                        <div className="parent-family-skill-copy">
                          <small>{item.label}</small>
                          <strong>{item.value}</strong>
                          <p>{item.detail}</p>
                        </div>
                        <b>View</b>
                      </button>
                    ))}
                  </div>
                </article>

                <article className="parent-family-practice-card">
                  <div className="parent-family-panel-label">Try this next</div>
                  <div className="parent-family-practice-grid">
                    {parentWeekendActivities.map((activity) => (
                      <div className="parent-family-practice-row" key={activity.title}>
                        <span className="parent-family-practice-icon" aria-hidden="true">
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
              </div>

              <aside className="parent-family-right-rail">
                <article className="parent-family-panel parent-family-message-card">
                  <div className="parent-family-panel-label">From school</div>
                  <div className="parent-teacher-strip-header">
                    <span className="parent-teacher-avatar" aria-hidden="true">
                      JL
                    </span>
                    <div>
                      <strong>Teacher guidance</strong>
                      <p>Shared in plain family language</p>
                    </div>
                  </div>
                  <blockquote>{parentTeacherMessage}</blockquote>
                </article>

                <article className="parent-family-panel parent-family-settings-panel">
                  <div className="parent-family-panel-label">Signals and notifications</div>
                  <div className="parent-family-settings-row">
                    <div>
                      <strong>Weekly summary</strong>
                      <span>Time, effectiveness, and next focus</span>
                    </div>
                    <b>{notifyWeekly ? "On" : "Off"}</b>
                  </div>
                  <div className="parent-family-settings-row">
                    <div>
                      <strong>Milestones</strong>
                      <span>Badges, trophies, and level moments</span>
                    </div>
                    <b>{notifyMilestones ? "On" : "Off"}</b>
                  </div>
                  <div className="parent-family-settings-row">
                    <div>
                      <strong>Family view</strong>
                      <span>{result.linkedChildren.length} child profiles visible</span>
                    </div>
                    <b>Live</b>
                  </div>
                </article>

                <article className="parent-family-panel parent-family-snapshot-card">
                  <div className="parent-family-panel-label">Snapshot</div>
                  <strong>{activeChild.displayName}</strong>
                  <p>
                    Last active {formatLastSeen(activeChildDashboard.lastSessionAt)}.{" "}
                    {activeChild.badgeCount} badges and {activeChild.trophyCount} trophies earned so far.
                  </p>
                  <div className="parent-family-snapshot-grid">
                    <div>
                      <span>Comfort</span>
                      <strong>{formatPercent(activeChildDashboard.averageEffectiveness)}</strong>
                    </div>
                    <div>
                      <span>Completion</span>
                      <strong>{formatPercent(activeChildDashboard.completionRate)}</strong>
                    </div>
                    <div>
                      <span>Family time</span>
                      <strong>
                        {familyTotals ? formatMinutes(familyTotals.totalTimeSpentMs) : "0 min"}
                      </strong>
                    </div>
                    <div>
                      <span>Trophies</span>
                      <strong>{familyTrophyTotal}</strong>
                    </div>
                  </div>
                </article>
              </aside>
            </section>

            <section className="route-grid route-grid-parent parent-family-detail-grid" id="parent-family-detail">
              <ShellCard
                className="shell-card-emphasis"
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
                        <span>Progress so far</span>
                        <strong>{buildParentSkillSignal(activeSkill.masteryRate)}</strong>
                        <p>
                          {activeSkill.masteryRate}% correct across {activeSkill.attempts} questions answered.
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
                    Complete a few more sessions and we'll show your child's strongest skills, areas for practice, and specific activity ideas.
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
                    Activity will appear here after your child completes their first lesson.
                  </p>
                )}
              </ShellCard>
            </section>
          </>
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
