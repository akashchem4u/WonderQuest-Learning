"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChoiceChip, FieldBlock, ShellCard, StatTile } from "@/components/ui";
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

  useEffect(() => {
    if (!avatars.some((item) => item.avatar_key === selectedAvatar)) {
      setSelectedAvatar(avatars[0]?.avatar_key ?? "");
    }
  }, [avatars, selectedAvatar]);

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

      router.push(
        `/play?studentId=${payload.student.id}&sessionMode=${selectedMode}`,
      );
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
    <main className="page-shell page-shell-split">
      <section className="page-hero child-hero">
        <div>
          <span className="eyebrow">WonderQuest Learning</span>
          <h1>Child access and avatar setup.</h1>
          <p>
            Use a lightweight username and 4-digit PIN, choose a launch band,
            and jump straight into a guided quest or self-directed challenge.
          </p>
        </div>
        <div className="hero-route-summary">
          <StatTile
            label="Access"
            value="Lightweight"
            detail="Username + PIN"
          />
          <StatTile
            label="Progress"
            value="Persistent"
            detail="Points and badges stay saved"
          />
          <StatTile
            label="Teaching"
            value="Explainers"
            detail="Quick voice and video help"
          />
        </div>
      </section>

      <form className="route-grid" onSubmit={handleSubmit}>
        <ShellCard eyebrow="Step 1" title="Choose your age or grade band">
          <div className="choice-row">
            {launchBands.map((band) => (
              <ChoiceChip
                key={band.code}
                label={band.label}
                selected={selectedBand === band.code}
                accent="#1f8f6a"
                onClick={() => setSelectedBand(band.code)}
              />
            ))}
          </div>
          <p className="soft-copy">
            The band controls question style, language level, and explainer tone.
          </p>
        </ShellCard>

        <ShellCard eyebrow="Step 2" title="Enter your quest details">
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
              autoComplete="current-password"
              helper="Four digits only for the first prototype."
              label="4-digit PIN"
              maxLength={4}
              name="pin"
              onChange={(event) => setPin(event.target.value)}
              placeholder="0000"
              type="password"
              value={pin}
            />
            <FieldBlock
              helper="Shown in the game world."
              label="Display name"
              name="displayName"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="what we call you"
              value={displayName}
            />
          </div>
        </ShellCard>

        <ShellCard eyebrow="Step 3" title="Pick your avatar">
          <div className="choice-row">
            {avatars.map((avatar) => (
              <ChoiceChip
                key={avatar.avatar_key}
                label={avatar.display_name}
                selected={selectedAvatar === avatar.avatar_key}
                accent="#f39c33"
                onClick={() => setSelectedAvatar(avatar.avatar_key)}
              />
            ))}
          </div>
          <p className="soft-copy">
            Avatars stay linked to the child profile for quick return visits.
          </p>
        </ShellCard>

        <ShellCard eyebrow="Step 4" title="Choose how you want to play">
          <div className="choice-column">
            <button
              className={`mode-card ${
                selectedMode === "guided-quest" ? "is-selected" : ""
              }`}
              onClick={() => setSelectedMode("guided-quest")}
              type="button"
            >
              Guided Quest
              <span>The system chooses the next best set of questions.</span>
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

        <ShellCard eyebrow="Launch" title="Start the next session">
          <ul className="route-list">
            <li>Points, badges, trophies, and progress are saved.</li>
            <li>Wrong answers trigger quick explainers and retry support.</li>
            <li>Parents can link later and review time and effectiveness.</li>
          </ul>
          {error ? <p className="status-banner status-error">{error}</p> : null}
          {result ? (
            <div className="status-panel">
              <strong>
                {result.created ? "Profile created." : "Welcome back."}
              </strong>
              <p>
                {result.student.displayName} is at level{" "}
                {result.progression.currentLevel} with{" "}
                {result.progression.totalPoints} points.
              </p>
            </div>
          ) : null}
          <div className="form-actions">
            <button className="primary-link button-link" disabled={submitting} type="submit">
              {submitting ? "Starting..." : "Start play"}
            </button>
            <Link className="secondary-link" href="/parent">
              Parent setup
            </Link>
          </div>
        </ShellCard>
      </form>
    </main>
  );
}
