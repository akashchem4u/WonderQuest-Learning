"use client";

import styles from "./play-beta-support.module.css";

export type AssistMode = "voice" | "slow" | "visual";

type PlayBetaSupportProps = {
  assistMode: AssistMode;
  badges: number;
  coachBody: string;
  coachSteps: string[];
  coachTitle: string;
  currentLevel: number;
  currentQuestionLabel: string;
  helperMessage: string;
  helperTone: "gold" | "violet" | "mint" | "coral";
  isRetrying: boolean;
  progressPercent: number;
  questionNumber: number;
  stars: number;
  totalQuestions: number;
  trophies: number;
  voiceAvailable: boolean;
  onReplay: (mode: "voice" | "slow") => void;
  onVisualOnly: () => void;
};

function getAssistLabel(mode: AssistMode) {
  switch (mode) {
    case "slow":
      return "Slow replay";
    case "visual":
      return "Visual-only";
    default:
      return "Voice ready";
  }
}

export function PlayBetaSupport({
  assistMode,
  badges,
  coachBody,
  coachSteps,
  coachTitle,
  currentLevel,
  currentQuestionLabel,
  helperMessage,
  helperTone,
  isRetrying,
  progressPercent,
  questionNumber,
  stars,
  totalQuestions,
  trophies,
  voiceAvailable,
  onReplay,
  onVisualOnly,
}: PlayBetaSupportProps) {
  const voiceCopy = voiceAvailable
    ? "Tap replay to hear the clue again. Slow replay gives more thinking time, and visual-only keeps it quiet."
    : "Audio is not available right now - the pictures and buttons carry the whole quest.";

  return (
    <section className={styles.board} data-tone={helperTone}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <span className={styles.kicker}>Support</span>
          <h2>{voiceAvailable ? "Listen again, slow it down, or keep it visual." : "Visual fallback keeps the quest moving."}</h2>
          <p>{voiceCopy}</p>
        </div>
        <div className={styles.statusStack}>
          <span className={styles.statusPill}>Stars stay safe</span>
          <span className={styles.statusPill}>Retries are free</span>
          <span className={`${styles.statusPill} ${voiceAvailable ? styles.statusReady : styles.statusMuted}`}>
            {getAssistLabel(assistMode)}
          </span>
        </div>
      </div>

      <div className={styles.meterBlock}>
        <div className={styles.meterLabels}>
          <span>
            Step {questionNumber} of {totalQuestions}
          </span>
          <span>{progressPercent}% complete</span>
        </div>
        <div className={styles.meterTrack} aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className={styles.helperBlock}>
        <strong>{isRetrying ? coachTitle : currentQuestionLabel}</strong>
        <p>{isRetrying ? coachBody : helperMessage}</p>
      </div>

      <div className={styles.actionRow}>
        <button
          className={`${styles.actionButton} ${assistMode === "voice" ? styles.isActive : ""}`}
          data-interactive="true"
          disabled={!voiceAvailable}
          onClick={() => onReplay("voice")}
          type="button"
        >
          Replay
        </button>
        <button
          className={`${styles.actionButton} ${assistMode === "slow" ? styles.isActive : ""}`}
          data-interactive="true"
          disabled={!voiceAvailable}
          onClick={() => onReplay("slow")}
          type="button"
        >
          Slow replay
        </button>
        <button
          className={`${styles.actionButton} ${assistMode === "visual" ? styles.isActive : ""}`}
          data-interactive="true"
          onClick={onVisualOnly}
          type="button"
        >
          Pictures only
        </button>
      </div>

      <div className={styles.detailsGrid}>
        <article className={styles.detailCard}>
          <span className={styles.detailLabel}>Why this helps</span>
          <strong>{isRetrying ? "Retry without losing momentum." : "Keep the next step calm and clear."}</strong>
          <p>
            {isRetrying
              ? "A wrong answer can stay on screen with a short clue, a slow replay, or a quieter visual pass."
              : "The current prompt stays easy to read, and the child can always switch the support style before answering."}
          </p>
        </article>

        <article className={styles.detailCard}>
          <span className={styles.detailLabel}>Quest status</span>
          <strong>
            Level {currentLevel} · {stars} stars · {badges} badges · {trophies} trophies
          </strong>
          <p>
            The support rail stays separate from scoring, so stars do not shrink on retries.
          </p>
        </article>
      </div>

      <div className={styles.stepsBlock}>
        <div className={styles.detailLabel}>Next steps</div>
        {coachSteps.map((step, index) => (
          <div className={styles.stepRow} key={`${currentQuestionLabel}-${step}`}>
            <span className={styles.stepIndex}>{index + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <p className={styles.footerNote}>
        {voiceAvailable
          ? "Switch to visual-only if the room needs to be quiet. Return to voice whenever you want the helper to speak."
          : "The no-audio path is fully usable: the prompt, steps, and answer cards carry the whole session."}
      </p>
    </section>
  );
}
