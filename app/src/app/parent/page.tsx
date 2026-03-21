"use client";

import Link from "next/link";
import { useState } from "react";
import { ChoiceChip, FieldBlock, ShellCard, StatTile } from "@/components/ui";

const children = [
  "Ava - Animal Adventure",
  "Noah - Sports World",
  "Mia - Space Explorer",
];

export default function ParentAccessPage() {
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [selectedChild, setSelectedChild] = useState(children[0]);

  return (
    <main className="page-shell page-shell-split">
      <section className="page-hero parent-hero">
        <div>
          <span className="eyebrow">WonderQuest Learning</span>
          <h1>Parent quick access and child linkage.</h1>
          <p>
            Use the same lightweight access model, connect to your child, and
            choose the notifications you actually want.
          </p>
        </div>
        <div className="hero-route-summary">
          <StatTile label="Parent view" value="Linked" detail="Child-aware reporting" />
          <StatTile label="Notifications" value="Opt-in" detail="Quiet hours friendly" />
          <StatTile label="Signals" value="Time + effectiveness" detail="Not just points" />
        </div>
      </section>

      <section className="route-grid">
        <ShellCard eyebrow="Step 1" title="Parent access">
          <div className="field-grid">
            <FieldBlock label="Username" placeholder="parent username" />
            <FieldBlock label="4-digit PIN" placeholder="0000" type="password" helper="Quick access for setup and review." />
            <FieldBlock label="Display name" placeholder="Parent name" helper="Shown in summary views." />
          </div>
        </ShellCard>

        <ShellCard eyebrow="Step 2" title="Link your child">
          <div className="field-grid">
            <FieldBlock label="Child username" placeholder="child quest name" />
            <FieldBlock label="Child display name" placeholder="what you call them" />
            <FieldBlock label="Relationship" placeholder="parent, guardian, etc." />
          </div>
          <div className="choice-row">
            {children.map((child) => (
              <ChoiceChip
                key={child}
                label={child}
                selected={selectedChild === child}
                accent="#1f8f6a"
                onClick={() => setSelectedChild(child)}
              />
            ))}
          </div>
          <p className="soft-copy">
            Link the right child profile so points and progress stay connected.
          </p>
        </ShellCard>

        <ShellCard eyebrow="Step 3" title="Notification preferences">
          <div className="choice-column">
            <button className={`mode-card ${notifyWeekly ? "is-selected" : ""}`} onClick={() => setNotifyWeekly((value) => !value)} type="button">
              Weekly summary
              <span>Time spent, effectiveness, and next focus.</span>
            </button>
            <button className={`mode-card ${notifyMilestones ? "is-selected" : ""}`} onClick={() => setNotifyMilestones((value) => !value)} type="button">
              Milestones and badges
              <span>Celebrate progress without noisy reminders.</span>
            </button>
          </div>
        </ShellCard>

        <ShellCard eyebrow="Preview" title="What you will see">
          <ul className="route-list">
            <li>Subject and domain progress charts.</li>
            <li>Time spent versus learning effectiveness.</li>
            <li>Strengths, support areas, and challenge readiness.</li>
            <li>Feedback on bugs, enhancements, and content issues later.</li>
          </ul>
          <Link className="primary-link" href="/">
            Home
          </Link>
        </ShellCard>
      </section>
    </main>
  );
}
