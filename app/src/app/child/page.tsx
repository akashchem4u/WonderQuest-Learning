"use client";

import Link from "next/link";
import { useState } from "react";
import { ChoiceChip, FieldBlock, ShellCard, StatTile } from "@/components/ui";

const avatars = [
  { key: "bunny-helper", label: "Bunny Helper", accent: "#f39c33" },
  { key: "lion-striker", label: "Lion Striker", accent: "#1f8f6a" },
  { key: "panda-pilot", label: "Panda Pilot", accent: "#5875e8" },
  { key: "owl-builder", label: "Owl Builder", accent: "#a96d32" },
];

export default function ChildAccessPage() {
  const [selectedAvatar, setSelectedAvatar] = useState("bunny-helper");
  const [selectedMode, setSelectedMode] = useState("guided-quest");

  return (
    <main className="page-shell page-shell-split">
      <section className="page-hero child-hero">
        <div>
          <span className="eyebrow">WonderQuest Learning</span>
          <h1>Child access and avatar setup.</h1>
          <p>
            Enter a username and 4-digit PIN, pick an avatar, and start your
            next quest without a heavy account flow.
          </p>
        </div>
        <div className="hero-route-summary">
          <StatTile label="Access" value="Lightweight" detail="Username + PIN" />
          <StatTile label="Progress" value="Persistent" detail="Tester safe" />
          <StatTile label="Teaching" value="Voice + video" detail="Age-specific" />
        </div>
      </section>

      <section className="route-grid">
        <ShellCard eyebrow="Step 1" title="Enter your name and PIN">
          <div className="field-grid">
            <FieldBlock label="Username" placeholder="your quest name" helper="Use the same username each time." />
            <FieldBlock label="4-digit PIN" placeholder="0000" type="password" helper="Simple recovery-first login." />
            <FieldBlock label="Display name" placeholder="what we call you" helper="Shown in the game world." />
          </div>
        </ShellCard>

        <ShellCard eyebrow="Step 2" title="Pick your avatar">
          <div className="choice-row">
            {avatars.map((avatar) => (
              <ChoiceChip
                key={avatar.key}
                label={avatar.label}
                selected={selectedAvatar === avatar.key}
                accent={avatar.accent}
                onClick={() => setSelectedAvatar(avatar.key)}
              />
            ))}
          </div>
          <p className="soft-copy">
            Avatars help kids recognize their profile quickly when they come back.
          </p>
        </ShellCard>

        <ShellCard eyebrow="Step 3" title="Choose how you want to play">
          <div className="choice-column">
              <button className={`mode-card ${selectedMode === "guided-quest" ? "is-selected" : ""}`} onClick={() => setSelectedMode("guided-quest")} type="button">
                Guided Quest
                <span>The system chooses the next best path.</span>
              </button>
            <button className={`mode-card ${selectedMode === "self-directed-challenge" ? "is-selected" : ""}`} onClick={() => setSelectedMode("self-directed-challenge")} type="button">
              Self-Directed Challenge
              <span>Ask for harder, easier, or more like this.</span>
            </button>
          </div>
        </ShellCard>

        <ShellCard eyebrow="Preview" title="What happens next">
          <ul className="route-list">
            <li>We remember points, badges, and progress.</li>
            <li>Wrong answers trigger quick voice or video help.</li>
            <li>Children can ask for more practice in a specific area.</li>
            <li>Parents can later see time spent and effectiveness.</li>
          </ul>
          <Link className="primary-link" href="/parent">
            Parent setup
          </Link>
        </ShellCard>
      </section>
    </main>
  );
}
