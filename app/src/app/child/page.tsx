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
  const [selectedBand, setSelectedBand] = useState("K1");
  const [selectedMode, setSelectedMode] = useState("guided-quest");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ChildAccessResponse | null>(null);

  const avatars = useMemo(() => getAvatarsForBand(selectedBand), [selectedBand]);
  const earlyLearnerBand = selectedBand === "PREK" || selectedBand === "K1";
  const pinDigits = [0, 1, 2, 3];
  const selectedBandProfile = getBandProfile(selectedBand);
  const selectedAvatarSymbol = getAvatarSymbol(selectedAvatar);

  useEffect(() => {
    if (!avatars.some((item) => item.avatar_key === selectedAvatar)) {
      setSelectedAvatar(avatars[0]?.avatar_key ?? "");
    }
  }, [avatars, selectedAvatar]);

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

      router.push(`/play?sessionMode=${selectedMode}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Child access failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main className="page-shell page-shell-split">
        <section className="page-hero child-hero">
          <div>
            <span className="eyebrow">Child journey</span>
            <h1>
              {earlyLearnerBand
                ? "Pick a picture, tap start, and let the quest do the teaching."
                : "Pick your hero, press start, and jump into the next quest."}
            </h1>
            <p>
              {earlyLearnerBand
                ? "Keep this setup calm and quick. After that, the play flow should lead with visuals, audio, and fast retries."
                : "Lightweight access for children, with enough structure to keep progress, badges, and challenge history intact."}
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
            eyebrow="Band"
            title="Choose your age or grade band"
          >
            <span className="step-chip">Step 1 · Band</span>
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

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Identity"
            title="Set up the child profile"
          >
            <span className="step-chip">Step 2 · Identity</span>
            <div className="field-grid">
              <FieldBlock
                autoComplete="username"
                helper="Use the same username each time."
                label="Username"
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your quest name"
                value={username}
              />
              <FieldBlock
                helper="Shown inside the game world."
                label="Display name"
                name="displayName"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="what we call you"
                value={displayName}
              />
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
          </ShellCard>

          <ShellCard
            className="shell-card-soft"
            eyebrow="Avatar"
            title="Pick your guide"
          >
            <span className="step-chip">Step 3 · Avatar</span>
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

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Mode"
            title="Choose how the next session feels"
          >
            <span className="step-chip">Step 4 · Session mode</span>
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

          <ShellCard
            className="shell-card-spotlight"
            eyebrow="Launch"
            title="Start the next adventure"
          >
            <span className="step-chip">Step 5 · Launch</span>
            <div className="summary-chip-row">
              <span className="summary-chip">{selectedBandProfile.title}</span>
              <span className="summary-chip">{selectedAvatarSymbol} guide</span>
              <span className="summary-chip">
                {selectedMode === "guided-quest" ? "Guided quest" : "Self-directed"}
              </span>
            </div>
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
                {submitting ? "Starting..." : `Start as ${selectedBandProfile.title}`}
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
