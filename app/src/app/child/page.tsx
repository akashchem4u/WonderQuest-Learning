"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { FieldBlock, ShellCard, StatTile } from "@/components/ui";
import { getAvatarsForBand } from "@/lib/launch-data";
import { launchBands } from "@/lib/launch-plan";

type ChildAccessResponse = {
  created: boolean;
  student: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    preferredThemeCode: string | null;
  };
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
};

function getBandSymbol(bandCode: string) {
  switch (bandCode) {
    case "PREK":
      return "🌈";
    case "K1":
      return "⚽";
    case "G23":
      return "🚀";
    case "G45":
      return "🧱";
    default:
      return "⭐";
  }
}

function getBandProfile(bandCode: string) {
  switch (bandCode) {
    case "PREK":
      return {
        emoji: "🐣",
        title: "Tiny Explorer",
        ageLabel: "Ages 2–5",
      };
    case "K1":
      return {
        emoji: "⚽",
        title: "Super Starter",
        ageLabel: "Kinder – Grade 1",
      };
    case "G23":
      return {
        emoji: "🚀",
        title: "Space Adventurer",
        ageLabel: "Grades 2–3",
      };
    case "G45":
      return {
        emoji: "🏗️",
        title: "Master Builder",
        ageLabel: "Grades 4–5",
      };
    default:
      return {
        emoji: getBandSymbol(bandCode),
        title: bandCode,
        ageLabel: bandCode,
      };
  }
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

export default function ChildAccessPage() {
  const router = useRouter();
  const [accessMode, setAccessMode] = useState<"new" | "returning">("new");
  const [selectedBand, setSelectedBand] = useState("K1");
  const [selectedMode, setSelectedMode] = useState("guided-quest");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [recoveryHint, setRecoveryHint] = useState("");
  const [result, setResult] = useState<ChildAccessResponse | null>(null);

  const avatars = useMemo(() => getAvatarsForBand(selectedBand), [selectedBand]);
  const earlyLearnerBand = selectedBand === "PREK" || selectedBand === "K1";
  const returningMode = accessMode === "returning";
  const guidedOnlyMode = earlyLearnerBand || returningMode;
  const pinDigits = [0, 1, 2, 3];
  const selectedBandProfile = getBandProfile(selectedBand);
  const selectedAvatarSymbol = getAvatarSymbol(selectedAvatar);

  useEffect(() => {
    if (!avatars.some((item) => item.avatar_key === selectedAvatar)) {
      setSelectedAvatar(avatars[0]?.avatar_key ?? "");
    }
  }, [avatars, selectedAvatar]);

  useEffect(() => {
    if (guidedOnlyMode) {
      setSelectedMode("guided-quest");
    }
  }, [guidedOnlyMode]);

  function appendPinDigit(digit: string) {
    setPin((current) => (current.length >= 4 ? current : `${current}${digit}`));
  }

  function removePinDigit() {
    setPin((current) => current.slice(0, -1));
  }

  function clearPin() {
    setPin("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setRecoveryHint("");

    try {
      const response = await fetch("/api/child/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          pin,
          displayName,
          avatarKey: selectedAvatar,
          launchBandCode: selectedBand,
        }),
      });

      const payload = (await response.json()) as ChildAccessResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Child access failed.");
      }

      setResult(payload);

      router.push(
        `/play?sessionMode=${selectedMode}&entry=${returningMode ? "returning" : "new"}`,
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Child access failed.";

      if (returningMode && message === "Wrong username or PIN.") {
        setError("Oops, that PIN did not match.");
        setRecoveryHint(
          "Try the same 4 digits again, or switch to new adventurer if this is a first-time setup.",
        );
      } else if (
        returningMode &&
        message === "Display name and avatar are required for first-time setup."
      ) {
        setError("We could not find that adventurer yet.");
        setRecoveryHint(
          "Check the username again, or switch to new adventurer to create the child profile.",
        );
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main className="page-shell page-shell-split">
        <section className="page-hero child-hero child-hero-quickstart">
          <div>
            <div className="child-hero-brand">
              <span>Wonder</span>Quest
            </div>
            <span className="eyebrow">Child quickstart</span>
            <h1>
              {earlyLearnerBand
                ? "One big tap to start, one calm setup, then straight into play."
                : "Fast child setup now, real quest momentum right after."}
            </h1>
            <p>
              {earlyLearnerBand
                ? "Keep the grown-up step short. The child should recognize the path instantly, then the play flow can take over with visuals, voice, and quick retries."
                : "Use the same username, avatar, and PIN to keep badges, points, and world progress attached to one adventurer."}
            </p>
            <div className="summary-chip-row">
              <span className="summary-chip">
                {earlyLearnerBand ? "Quick grown-up setup" : "1 minute setup"}
              </span>
              <span className="summary-chip">Saved progression</span>
              <span className="summary-chip">
                {earlyLearnerBand ? "Voice + visual help" : "Explainers on misses"}
              </span>
            </div>
          </div>
          <div className="hero-route-summary hero-route-summary-kid">
            <StatTile label="Access" value="Quick" detail="Username + 4-digit PIN" />
            <StatTile
              label="Progress"
              value="Saved"
              detail="Badges, trophies, and points persist"
            />
            <StatTile
              label="Support"
              value="Adaptive"
              detail="Wrong answers trigger fast explainers"
            />
          </div>
        </section>

        <form className="route-grid route-grid-child" onSubmit={handleSubmit}>
          <ShellCard
            className="shell-card-soft"
            eyebrow="Access"
            title="Choose the quickest path"
          >
            <span className="step-chip">Step 1 · Access mode</span>
            <div className="child-entry-grid">
              <button
                className={`child-entry-card child-entry-card-new ${accessMode === "new" ? "is-selected" : ""}`}
                onClick={() => {
                  setAccessMode("new");
                  setError("");
                  setRecoveryHint("");
                }}
                type="button"
              >
                <span className="child-entry-icon" aria-hidden="true">
                  🌟
                </span>
                <span className="child-entry-copy">
                  <strong>New adventurer</strong>
                  <small>Create a child profile with a band, avatar, and quest name.</small>
                </span>
                <span className="child-entry-arrow" aria-hidden="true">
                  →
                </span>
              </button>
              <button
                className={`child-entry-card child-entry-card-returning ${accessMode === "returning" ? "is-selected" : ""}`}
                onClick={() => {
                  setAccessMode("returning");
                  setError("");
                  setRecoveryHint("");
                }}
                type="button"
              >
                <span className="child-entry-icon" aria-hidden="true">
                  ⚡
                </span>
                <span className="child-entry-copy">
                  <strong>Coming back</strong>
                  <small>Use the same username and 4-digit PIN to jump back in fast.</small>
                </span>
                <span className="child-entry-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
            <p className="soft-copy child-entry-hint">
              {earlyLearnerBand
                ? "Grown-up help starts here. After this step, the child should mostly follow pictures, worlds, and short prompts."
                : "Keep this step quick so returning kids get back to the quest without feeling like they hit a login wall."}
            </p>
          </ShellCard>

          {!returningMode ? (
          <ShellCard
            className="shell-card-soft"
            eyebrow="Band"
            title="Choose your age or grade band"
          >
            <span className="step-chip">Step 2 · Band</span>
            <div className="child-band-grid">
              {launchBands.map((band) => (
                (() => {
                  const profile = getBandProfile(band.code);

                  return (
                    <button
                      key={band.code}
                      className={`child-band-card ${selectedBand === band.code ? "is-selected" : ""}`}
                      onClick={() => setSelectedBand(band.code)}
                      type="button"
                    >
                      <span className="child-band-check" aria-hidden="true">
                        ✓
                      </span>
                      <span className="child-band-emoji" aria-hidden="true">
                        {profile.emoji}
                      </span>
                      <strong>{profile.title}</strong>
                      <small>{profile.ageLabel}</small>
                      <span className="child-band-theme">
                        {band.primaryTheme}
                      </span>
                    </button>
                  );
                })()
              ))}
            </div>
            <p className="soft-copy">
              {earlyLearnerBand
                ? "This sets the voice pace, support level, and visual style."
                : "This shapes question language, support level, and explainer style."}
            </p>
            <div className="status-banner">
              <strong>{selectedBandProfile.title}</strong>{" "}
              will get a setup flow and question tone tuned for{" "}
              {selectedBandProfile.ageLabel.toLowerCase()}.
            </div>
          </ShellCard>
          ) : null}

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Identity"
            title={returningMode ? "Welcome back" : "Set up the child profile"}
          >
            <span className="step-chip">
              {returningMode
                ? "Step 2 · Sign in"
                : earlyLearnerBand
                  ? "Step 3 · Name + PIN"
                  : "Step 3 · Identity"}
            </span>
            {returningMode ? (
              <div className="child-returning-card">
                <span className="child-returning-icon" aria-hidden="true">
                  {username ? "👋" : "✨"}
                </span>
                <div className="child-returning-copy">
                  <strong>
                    {username ? `Welcome back, ${username}` : "Return to your adventure"}
                  </strong>
                  <small>
                    {earlyLearnerBand
                      ? "Use the same name and 4-digit PIN so a grown-up can open the next quest fast."
                      : "Enter the same username and 4-digit PIN so progress, badges, and trophies stay with the same child."}
                  </small>
                </div>
              </div>
            ) : null}
            {earlyLearnerBand && !returningMode ? (
              <div className="child-guided-note">
                <strong>Quick start for little learners</strong>
                <p>
                  Pick the band, type a simple quest name, choose one picture,
                  and press start. The session will stay in guided mode.
                </p>
              </div>
            ) : null}
            <div className="field-grid">
              <FieldBlock
                autoComplete="username"
                helper={
                  returningMode
                    ? "Use the same username from the child&apos;s earlier setup."
                    : "Use the same username each time."
                }
                label="Username"
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your quest name"
                value={username}
              />
              {!returningMode ? (
                <FieldBlock
                  helper="Shown inside the game world."
                  label="Display name"
                  name="displayName"
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="what we call you"
                  value={displayName}
                />
              ) : null}
            </div>
            <div className="pin-panel">
              <div className="pin-panel-header">
                <strong>4-digit PIN</strong>
                <span>
                  {earlyLearnerBand
                    ? "Tap four numbers for the grown-up setup step."
                    : "Tap four numbers for quick sign-in next time."}
                </span>
              </div>
              <div className="pin-display" aria-label="PIN display">
                {pinDigits.map((index) => (
                  <span className={`pin-cell ${pin[index] ? "has-value" : ""}`} key={index}>
                    {pin[index] ? "★" : ""}
                  </span>
                ))}
              </div>
              <div className="numpad">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                  <button
                    className="numpad-btn"
                    key={digit}
                    onClick={() => appendPinDigit(digit)}
                    type="button"
                  >
                    {digit}
                  </button>
                ))}
                <button className="numpad-btn numpad-btn-quiet" onClick={clearPin} type="button">
                  Clear
                </button>
                <button className="numpad-btn" onClick={() => appendPinDigit("0")} type="button">
                  0
                </button>
                <button
                  className="numpad-btn numpad-btn-quiet"
                  onClick={removePinDigit}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
            {recoveryHint ? (
              <div className="child-recovery-card">
                <strong>Gentle recovery</strong>
                <p>{recoveryHint}</p>
              </div>
            ) : null}
          </ShellCard>

          {!returningMode ? (
          <ShellCard
            className="shell-card-soft"
            eyebrow="Avatar"
            title="Pick your guide"
          >
            <span className="step-chip">
              {earlyLearnerBand ? "Step 4 · Pick the picture" : "Step 4 · Avatar"}
            </span>
            <div className="child-avatar-preview">
              <span className="child-avatar-preview-icon" aria-hidden="true">
                {selectedAvatarSymbol}
              </span>
              <div className="child-avatar-preview-copy">
                <strong>You picked {selectedAvatarSymbol}</strong>
                <span>
                  {avatars.find((avatar) => avatar.avatar_key === selectedAvatar)?.display_name ??
                    "Choose a guide"}
                </span>
              </div>
            </div>
            <div className="selection-card-grid selection-card-grid-avatars">
              {avatars.map((avatar) => (
                <button
                  key={avatar.avatar_key}
                  className={`selection-card ${selectedAvatar === avatar.avatar_key ? "is-selected" : ""}`}
                  onClick={() => setSelectedAvatar(avatar.avatar_key)}
                  type="button"
                >
                  <span className="selection-card-icon" aria-hidden="true">
                    {getAvatarSymbol(avatar.avatar_key)}
                  </span>
                  <span className="selection-card-copy">
                    <strong>{avatar.display_name}</strong>
                    <small>{avatar.theme.replace("-", " ")}</small>
                  </span>
                </button>
              ))}
            </div>
            <p className="soft-copy">
              {earlyLearnerBand
                ? "Use the same picture each time so the child can spot the right profile fast."
                : "Avatars make it easy for younger kids to recognize their profile."}
            </p>
            <div className="status-banner">
              <strong>Quest tip:</strong>{" "}
              {earlyLearnerBand
                ? "little learners do best when the picture and PIN stay the same."
                : "choose the same avatar each time so younger learners can find their account faster."}
            </div>
          </ShellCard>
          ) : null}

          {!guidedOnlyMode ? (
            <ShellCard
              className="shell-card-emphasis"
              eyebrow="Mode"
              title="Choose how the next session feels"
            >
              <span className="step-chip">Step 5 · Session mode</span>
              <div className="choice-column">
                <button
                  className={`mode-card ${
                    selectedMode === "guided-quest" ? "is-selected" : ""
                  }`}
                  onClick={() => setSelectedMode("guided-quest")}
                  type="button"
                >
                  Guided Quest
                  <span>The system picks the next best sequence of questions.</span>
                </button>
                <button
                  className={`mode-card ${
                    selectedMode === "self-directed-challenge"
                      ? "is-selected"
                      : ""
                  }`}
                  onClick={() => setSelectedMode("self-directed-challenge")}
                  type="button"
                >
                  Self-Directed Challenge
                  <span>Start with more control and ask for harder or easier items.</span>
                </button>
              </div>
            </ShellCard>
          ) : null}

          <ShellCard
            className="shell-card-spotlight"
            eyebrow="Launch"
            title="Start the next adventure"
          >
            <span className="step-chip">
              {returningMode
                ? "Step 3 · Launch"
                : guidedOnlyMode
                  ? "Step 5 · Launch"
                  : "Step 6 · Launch"}
            </span>
            {guidedOnlyMode ? (
              <div className="child-launch-strip">
                <div className="child-launch-pill">
                  <span aria-hidden="true">{selectedBandProfile.emoji}</span>
                  <strong>{selectedBandProfile.title}</strong>
                  <small>{selectedBandProfile.ageLabel}</small>
                </div>
                <div className="child-launch-pill">
                  <span aria-hidden="true">{returningMode ? "🔐" : selectedAvatarSymbol}</span>
                  <strong>{returningMode ? "Same PIN" : "Same picture"}</strong>
                  <small>{returningMode ? "Fast sign-in" : "Easy to spot next time"}</small>
                </div>
                <div className="child-launch-pill">
                  <span aria-hidden="true">🧭</span>
                  <strong>Guided quest</strong>
                  <small>One calm question at a time</small>
                </div>
              </div>
            ) : null}
            <div className="summary-chip-row">
              <span className="summary-chip">
                {returningMode ? "Returning adventurer" : selectedBandProfile.title}
              </span>
              {!returningMode ? (
                <span className="summary-chip">{selectedAvatarSymbol} guide</span>
              ) : null}
              <span className="summary-chip">
                {selectedMode === "guided-quest" ? "Guided quest" : "Self-directed"}
              </span>
            </div>
            {guidedOnlyMode ? (
              <div className="status-banner child-launch-banner">
                <strong>Launch rule:</strong> younger and returning adventurers go straight
                into guided quest so the grown-up setup stays short.
              </div>
            ) : null}
            <ul className="route-list">
              <li>
                {earlyLearnerBand
                  ? "The child should get short, guided questions right away."
                  : "Points, badges, trophies, and progress stay attached to the profile."}
              </li>
              <li>
                {earlyLearnerBand
                  ? "Misses should lead to quick voice and visual help."
                  : "Wrong answers lead to quick explainers instead of dead ends."}
              </li>
              <li>
                {earlyLearnerBand
                  ? "Parents can come back later to review progress."
                  : "Parents can link later and review time spent and effectiveness."}
              </li>
            </ul>
            {error ? <p className="status-banner status-error">{error}</p> : null}
            {result ? (
              <div className="status-panel">
                <strong>{result.created ? "Profile created." : "Welcome back."}</strong>
                <p>
                  {result.student.displayName} is at level{" "}
                  {result.progression.currentLevel} with{" "}
                  {result.progression.totalPoints} points.
                </p>
              </div>
            ) : null}
            <div className="form-actions">
              <button
                className="primary-link button-link"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? "Starting..."
                  : returningMode
                    ? "Continue adventure"
                    : `Start as ${selectedBandProfile.title}`}
              </button>
              <Link className="secondary-link" href="/parent">
                Parent setup
              </Link>
            </div>
          </ShellCard>
        </form>
      </main>
    </AppFrame>
  );
}
