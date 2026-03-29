import styles from "./child-beta-panel.module.css";

type ChildBetaPanelProps = {
  accessMode: "new" | "returning";
  earlyLearnerBand: boolean;
  guidedOnlyMode: boolean;
  pinLength: number;
  returningMode: boolean;
  selectedAvatarLabel: string;
  selectedAvatarSymbol: string;
  selectedBandProfile: {
    emoji: string;
    title: string;
    ageLabel: string;
  };
  username: string;
  displayName: string;
};

function buildReadinessItems(props: ChildBetaPanelProps) {
  return [
    {
      done: props.username.trim().length > 0,
      detail: props.accessMode === "returning" ? "Same username is ready for the comeback path." : "Quest name is set for the first run.",
      label: "Username ready",
    },
    {
      done: props.pinLength >= 4,
      detail: "4-digit PIN is set — the child will use it to sign back in next time.",
      label: "PIN ready",
    },
    {
      done: props.returningMode || props.selectedAvatarLabel.trim().length > 0,
      detail: props.returningMode
        ? "Returning kids skip the avatar step and jump back in faster."
        : `${props.selectedAvatarLabel || "Pick one guide"} is standing by for the child.`,
      label: "Profile picture ready",
    },
    {
      done: true,
      detail: props.earlyLearnerBand
        ? "This band stays in guided quest mode with short prompts."
        : "This band can use the fuller child setup and still keep recovery calm.",
      label: "Quest mode ready",
    },
    {
      done: props.guidedOnlyMode,
      detail: "Younger and returning players launch into guided support automatically.",
      label: "Guided support ready",
    },
  ];
}

export function ChildBetaPanel(props: ChildBetaPanelProps) {
  const readinessItems = buildReadinessItems(props);
  const readyCount = readinessItems.filter((item) => item.done).length;
  const readinessPercent = Math.round((readyCount / readinessItems.length) * 100);
  const panelToneClass = props.earlyLearnerBand
    ? styles.panelGold
    : props.returningMode
      ? styles.panelViolet
      : styles.panelMint;

  return (
    <section className={`${styles.panel} ${panelToneClass}`}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <span className={styles.kicker}>
            {props.returningMode ? "Returning player" : "Setup guide"}
          </span>
          <h2>
            {props.returningMode
              ? "Get the child back into the quest fast."
              : "Set up the device so the child can take over smoothly."}
          </h2>
          <p>
            Check that the profile, PIN, and play mode are ready. When everything looks good,
            tap launch and hand the device to the child.
          </p>
        </div>
        <div className={styles.scoreCard} aria-label={`${readinessPercent} percent ready for handoff`}>
          <strong>{readyCount}</strong>
          <span>of {readinessItems.length} checks ready</span>
        </div>
      </div>

      <div className={styles.progressRail} aria-hidden="true">
        <span style={{ width: `${readinessPercent}%` }} />
      </div>

      <div className={styles.grid}>
        <div className={styles.checklist}>
          <div className={styles.sectionLabel}>Readiness checklist</div>
          {readinessItems.map((item) => (
            <article className={`${styles.checkRow} ${item.done ? styles.isDone : styles.isPending}`} key={item.label}>
              <span className={styles.checkIcon} aria-hidden="true">
                {item.done ? "✓" : "•"}
              </span>
              <div>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.sideStack}>
          <article className={styles.sideCard}>
            <div className={styles.sectionLabel}>Voice and audio</div>
            <strong>Audio gets a clean fallback.</strong>
            <p>
              If the browser can speak, the play flow will use voice cues. If it cannot,
              the next screen still works with visual prompts and calm retries.
            </p>
            <div className={styles.pillRow}>
              <span className={styles.pill}>Hear it again</span>
              <span className={styles.pill}>Visual fallback</span>
              <span className={styles.pill}>Slow read support</span>
            </div>
          </article>

          <article className={styles.sideCard}>
            <div className={styles.sectionLabel}>Accessibility</div>
            <strong>Big taps, steady contrast, less surprise.</strong>
            <p>
              The child route keeps the launch flow readable on small screens and leaves
              the heavy lifting to the play screen.
            </p>
            <div className={styles.featureGrid}>
              <div>
                <span>44px+</span>
                <small>Touch targets</small>
              </div>
              <div>
                <span>Low motion</span>
                <small>Friendly fallback</small>
              </div>
              <div>
                <span>{props.selectedBandProfile.title}</span>
                <small>{props.selectedBandProfile.ageLabel}</small>
              </div>
            </div>
          </article>

          <article className={styles.handoffCard}>
            <div className={styles.handoffTopline}>
              <span aria-hidden="true">{props.selectedBandProfile.emoji}</span>
              <div>
                <strong>{props.selectedBandProfile.title}</strong>
                <p>
                  {props.returningMode
                    ? "Hand the device back and use the same username and PIN."
                    : "Finish the setup, then let the child take the next step."}
                </p>
              </div>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewChip}>{props.selectedAvatarSymbol}</span>
              <span className={styles.previewChip}>{props.selectedAvatarLabel || "Pick a guide"}</span>
              <span className={styles.previewChip}>
                {props.guidedOnlyMode ? "Guided quest" : "Flexible launch"}
              </span>
            </div>
            <p className={styles.handoffNote}>
              Child-safe rule: if the device is handed over mid-flow, the next screen still
              keeps stars safe and continues from the chosen setup for {props.displayName || "the child"}.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
