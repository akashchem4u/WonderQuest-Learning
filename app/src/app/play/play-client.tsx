"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";

type SessionQuestion = {
  questionKey: string;
  prompt: string;
  answers: string[];
  explainerKey: string;
  subject: string;
  skill: string;
  difficulty: number;
  theme: string;
};

type SessionPayload = {
  sessionId: string;
  student: {
    id: string;
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
  questions: SessionQuestion[];
};

type AnswerPayload = {
  correct: boolean;
  pointsEarned: number;
  correctAnswer: string;
  needsRetry: boolean;
  sessionCompleted: boolean;
  explainer: {
    format: string;
    script: string;
    mediaHint: string;
  } | null;
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
  milestones: {
    leveledUp: boolean;
    badgeEarned: boolean;
    trophyEarned: boolean;
  };
};

type QuestionVisualScene = {
  title: string;
  helper: string;
  tokens?: string[];
};

function isEarlyLearnerBand(launchBandCode: string) {
  return launchBandCode === "PREK" || launchBandCode === "K1";
}

function buildQuestionVisualScene(question: SessionQuestion) {
  switch (question.questionKey) {
    case "prek_count_ducks_3":
      return {
        title: "Count the ducks",
        helper: "Point and count each duck one time.",
        tokens: ["🦆", "🦆", "🦆"],
      } satisfies QuestionVisualScene;
    case "prek_letter_b_ball":
      return {
        title: "Find the big letter B",
        helper: "Listen, then tap the matching letter.",
      } satisfies QuestionVisualScene;
    case "prek_shape_circle":
      return {
        title: "Find the circle",
        helper: "Look for the round shape with no corners.",
      } satisfies QuestionVisualScene;
    default:
      return null;
  }
}

function buildQuestionTags(question: SessionQuestion, launchBandCode: string) {
  if (!isEarlyLearnerBand(launchBandCode)) {
    return [
      question.subject,
      question.skill,
      `difficulty ${question.difficulty}`,
      question.theme,
    ];
  }

  const tags = [];

  if (question.subject === "math" && question.skill.includes("count")) {
    tags.push("count together");
  } else if (question.subject === "early-literacy") {
    tags.push("letter time");
  } else {
    tags.push(question.subject.replace("-", " "));
  }

  if (question.theme === "animal-adventure") {
    tags.push("animal adventure");
  }

  tags.push(question.difficulty <= 1 ? "gentle start" : "next challenge");

  return tags;
}

function buildReadAloudText(question: SessionQuestion, scene: QuestionVisualScene | null) {
  const sceneLead = scene ? `${scene.title}. ${scene.helper}.` : "";
  const answers = question.answers.join(", ");
  return `${sceneLead} ${question.prompt} Let us go one step at a time. Choices are ${answers}.`;
}

function buildPromptCue(question: SessionQuestion, scene: QuestionVisualScene | null) {
  if (scene) {
    return scene.helper;
  }

  if (question.subject === "math") {
    return "Look carefully and tap the answer you see.";
  }

  if (question.subject === "early-literacy") {
    return "Listen first, then tap the right letter or word.";
  }

  return "Listen, look, and tap your choice.";
}

function buildCelebrationCopy(question: SessionQuestion) {
  if (question.subject === "math") {
    return {
      title: "Great counting!",
      body: "You found the right answer and kept your quest moving.",
    };
  }

  if (question.subject === "early-literacy") {
    return {
      title: "Great listening!",
      body: "You heard the clue and tapped the right answer.",
    };
  }

  return {
    title: "Great job!",
    body: "You got this one right and earned more quest points.",
  };
}

function buildShortSupportLine(script: string) {
  const firstSentence = script
    .split(/[.!?]/)
    .map((part) => part.trim())
    .find(Boolean);

  return firstSentence ? `${firstSentence}.` : script;
}

function pickChildVoice(
  voices: SpeechSynthesisVoice[],
  launchBandCode: string,
) {
  const soothingMatches = [
    "samantha",
    "ava",
    "allison",
    "serena",
    "karen",
    "moira",
    "fiona",
    "tessa",
    "ellie",
    "jenny",
    "aria",
    "salli",
  ];
  const roboticHints = ["google", "fred", "junior", "news"];

  return [...voices].sort((left, right) => {
    function scoreVoice(voice: SpeechSynthesisVoice) {
      let score = /^en/i.test(voice.lang) ? 24 : 0;
      const lowerName = voice.name.toLowerCase();

      if (voice.localService) {
        score += 8;
      }

      if (voice.default) {
        score += 2;
      }

      if (soothingMatches.some((item) => lowerName.includes(item))) {
        score += 30;
      }

      if (roboticHints.some((item) => lowerName.includes(item))) {
        score -= 12;
      }

      if (launchBandCode === "PREK" && lowerName.includes("samantha")) {
        score += 6;
      }

      return score;
    }

    return scoreVoice(right) - scoreVoice(left);
  })[0];
}

function getVoiceSettings(launchBandCode: string, intent: "prompt" | "support") {
  if (launchBandCode === "PREK") {
    return intent === "prompt"
      ? { rate: 0.78, pitch: 1.02 }
      : { rate: 0.74, pitch: 1.0 };
  }

  if (launchBandCode === "K1") {
    return intent === "prompt"
      ? { rate: 0.86, pitch: 1.0 }
      : { rate: 0.82, pitch: 0.98 };
  }

  return intent === "prompt"
    ? { rate: 0.92, pitch: 1.0 }
    : { rate: 0.88, pitch: 0.98 };
}

function renderAnswerContent(question: SessionQuestion, answer: string) {
  if (question.questionKey === "prek_shape_circle") {
    return (
      <>
        <div className="answer-visual-stack">
          <span className={`shape-preview shape-${answer}`} aria-hidden="true" />
          <strong>{answer}</strong>
        </div>
        <small>Tap the shape you hear.</small>
      </>
    );
  }

  if (question.questionKey === "prek_letter_b_ball") {
    return (
      <>
        <div className="answer-visual-stack">
          <span className="letter-preview" aria-hidden="true">
            {answer}
          </span>
          <strong>{answer}</strong>
        </div>
        <small>Tap the letter you hear.</small>
      </>
    );
  }

  if (/^\d+$/.test(answer)) {
    return (
      <>
        <div className="answer-visual-stack">
          <span className="number-preview" aria-hidden="true">
            {answer}
          </span>
          <strong>{answer}</strong>
        </div>
        <small>Tap to lock in this answer.</small>
      </>
    );
  }

  return (
    <>
      <strong>{answer}</strong>
      <small>Tap to lock in this answer.</small>
    </>
  );
}

export default function PlayClient() {
  const searchParams = useSearchParams();
  const sessionMode = searchParams.get("sessionMode") ?? "guided-quest";

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [progression, setProgression] = useState<SessionPayload["progression"] | null>(
    null,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [answerState, setAnswerState] = useState<AnswerPayload | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const voiceSupported =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance !== "undefined";

    setVoiceEnabled(voiceSupported);

    if (!voiceSupported || typeof window === "undefined") {
      return;
    }

    const syncVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    syncVoices();
    window.speechSynthesis.addEventListener("voiceschanged", syncVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", syncVoices);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/play/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionMode,
          }),
        });

        const payload = (await response.json()) as SessionPayload & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not start session.");
        }

        if (!active) {
          return;
        }

        setSession(payload);
        setProgression(payload.progression);
        setQuestionStartedAt(Date.now());
      } catch (caughtError) {
        if (!active) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not start session.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      active = false;
    };
  }, [sessionMode]);

  const currentQuestion = useMemo(
    () => session?.questions[currentIndex] ?? null,
    [currentIndex, session],
  );

  const currentScene = useMemo(
    () => (currentQuestion ? buildQuestionVisualScene(currentQuestion) : null),
    [currentQuestion],
  );

  function speakText(text: string, intent: "prompt" | "support" = "prompt") {
    if (!voiceEnabled || !session || typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    const voice = pickChildVoice(availableVoices, session.student.launchBandCode);
    const settings = getVoiceSettings(session.student.launchBandCode, intent);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 0.92;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    if (!session || !currentQuestion || !voiceEnabled) {
      return;
    }

    if (!isEarlyLearnerBand(session.student.launchBandCode)) {
      return;
    }

    speakText(buildReadAloudText(currentQuestion, currentScene), "prompt");

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, currentScene, session, voiceEnabled, availableVoices]);

  useEffect(() => {
    if (!answerState?.needsRetry || !answerState.explainer || !voiceEnabled) {
      return;
    }

    speakText(answerState.explainer.script, "support");
  }, [answerState, voiceEnabled, availableVoices]);

  async function submitAnswer(answer: string) {
    if (!session || !currentQuestion) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/play/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          questionKey: currentQuestion.questionKey,
          answer,
          attempt,
          timeSpentMs: Date.now() - questionStartedAt,
        }),
      });

      const payload = (await response.json()) as AnswerPayload & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not submit answer.");
      }

      setAnswerState(payload);
      setProgression(payload.progression);

      if (payload.correct) {
        setAttempt(1);
      } else {
        setAttempt((value) => value + 1);
        setQuestionStartedAt(Date.now());
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not submit answer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function moveToNextQuestion() {
    if (!session) {
      return;
    }

    const isLastQuestion = currentIndex >= session.questions.length - 1;

    if (isLastQuestion) {
      return;
    }

    setCurrentIndex((value) => value + 1);
    setAttempt(1);
    setAnswerState(null);
    setQuestionStartedAt(Date.now());
  }

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Live challenge</span>
              <h1>Preparing your next challenge.</h1>
              <p>
                Loading the first playable question set from the live prototype.
              </p>
            </div>
          </section>
        </main>
      </AppFrame>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <main className="page-shell page-shell-split">
          <ShellCard eyebrow="Play" title="We could not start the session">
            <p>{error || "The session could not be prepared."}</p>
            <div className="form-actions">
              <Link className="primary-link" href="/child">
                Back to child setup
              </Link>
            </div>
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  const finished =
    Boolean(answerState?.sessionCompleted) &&
    currentIndex === session.questions.length - 1 &&
    Boolean(answerState?.correct);

  const questionNumber = Math.min(currentIndex + 1, session.questions.length);
  const progressPercent = Math.round(
    (questionNumber / Math.max(session.questions.length, 1)) * 100,
  );
  const questionTags = buildQuestionTags(
    currentQuestion,
    session.student.launchBandCode,
  );
  const earlyLearnerMode = isEarlyLearnerBand(session.student.launchBandCode);
  const visibleQuestionTags = earlyLearnerMode
    ? questionTags.slice(0, 2)
    : questionTags;
  const celebrationCopy = buildCelebrationCopy(currentQuestion);
  const promptCue = buildPromptCue(currentQuestion, currentScene);

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main className="page-shell page-shell-split">
        <section className="page-hero play-hero">
          <div>
            <span className="eyebrow">Live challenge</span>
            <h1>
              {earlyLearnerMode
                ? `${session.student.displayName}&apos;s quick quest is ready.`
                : `${session.student.displayName}&apos;s active quest loop.`}
            </h1>
            <p>
              {earlyLearnerMode
                ? "Short, guided questions with voice support, visuals, and fast wins."
                : "This is the first playable Supabase-backed session flow with retries, explainers, and persistent progression."}
            </p>
            <div className="summary-chip-row">
              <span className="summary-chip">{session.student.launchBandCode} band</span>
              <span className="summary-chip">
                {earlyLearnerMode
                  ? `Question ${questionNumber} of ${session.questions.length}`
                  : `Attempt ${attempt} on current question`}
              </span>
              <span className="summary-chip">
                {earlyLearnerMode ? "Listen, look, tap" : `${session.questions.length} total prompts`}
              </span>
            </div>
          </div>
          <div className={`hero-route-summary ${earlyLearnerMode ? "hero-route-summary-kid" : ""}`}>
            <StatTile
              label={earlyLearnerMode ? "Quest step" : "Session mode"}
              value={
                earlyLearnerMode
                  ? `${questionNumber}/${session.questions.length}`
                  : sessionMode === "guided-quest"
                    ? "Guided"
                    : "Challenge"
              }
              detail={
                earlyLearnerMode
                  ? "One tap answer at a time"
                  : `Question ${questionNumber} of ${session.questions.length}`
              }
            />
            {!earlyLearnerMode ? (
              <>
                <StatTile
                  label="Level"
                  value={`L${progression?.currentLevel ?? 1}`}
                  detail={`${progression?.totalPoints ?? 0} points`}
                />
                <StatTile
                  label="Rewards"
                  value={`${progression?.badgeCount ?? 0} badges`}
                  detail={`${progression?.trophyCount ?? 0} trophies`}
                />
              </>
            ) : null}
          </div>
        </section>

        <section className="play-layout">
          <ShellCard
            className="shell-card-spotlight question-stage"
            eyebrow="Question"
            title={
              finished
                ? earlyLearnerMode
                  ? "Quest complete"
                  : "Session complete"
                : earlyLearnerMode && currentScene
                  ? currentScene.title
                  : currentQuestion.prompt
            }
          >
            {finished ? (
              <div className="status-panel status-success celebration-panel">
                {earlyLearnerMode ? (
                  <div className="celebration-burst" aria-hidden="true">
                    <span>✨</span>
                    <span>🏆</span>
                    <span>✨</span>
                  </div>
                ) : null}
                <strong>{earlyLearnerMode ? "Quest complete!" : "Session complete."}</strong>
                <p>
                  {earlyLearnerMode
                    ? `${session.student.displayName} finished all ${session.questions.length} quick challenge steps.`
                    : `${session.student.displayName} finished the current loop with ${progression?.totalPoints ?? 0} total points and level ${progression?.currentLevel ?? 1}.`}
                </p>
                <div className="summary-chip-row">
                  <span className="summary-chip">
                    Level {progression?.currentLevel ?? 1}
                  </span>
                  <span className="summary-chip">
                    {progression?.totalPoints ?? 0} points
                  </span>
                  <span className="summary-chip">
                    {progression?.badgeCount ?? 0} badges ·{" "}
                    {progression?.trophyCount ?? 0} trophies
                  </span>
                </div>
                <div className="form-actions">
                  <Link className="primary-link" href="/child">
                    Play again
                  </Link>
                  <Link className="secondary-link" href="/parent">
                    Parent view
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="summary-chip-row">
                  {visibleQuestionTags.map((tag) => (
                    <span className="summary-chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                {earlyLearnerMode ? (
                  <div className="question-support-row question-support-row-early">
                    <div className="support-copy">
                      <strong>Listen, look, then tap</strong>
                      <p>{promptCue}</p>
                    </div>
                    {voiceEnabled ? (
                      <button
                        className="listen-button"
                        onClick={() =>
                          speakText(
                            buildReadAloudText(currentQuestion, currentScene),
                            "prompt",
                          )
                        }
                        type="button"
                      >
                        Hear it slowly
                      </button>
                    ) : (
                      <span className="listen-note">
                        Voice read-aloud is not available in this browser.
                      </span>
                    )}
                  </div>
                ) : null}
                <div className="progress-rail" aria-hidden="true">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
                <p className={`soft-copy progress-copy ${earlyLearnerMode ? "progress-copy-early" : ""}`}>
                  {earlyLearnerMode
                    ? `Step ${questionNumber} of ${session.questions.length}`
                    : `Quest progress: ${progressPercent}% complete`}
                </p>
                {earlyLearnerMode ? (
                  <div className="kid-prompt-bubble">
                    <span className="kid-prompt-label">Say it simply</span>
                    <strong>{currentQuestion.prompt}</strong>
                  </div>
                ) : null}
                {currentScene ? (
                  <div className="visual-scene" aria-label={currentScene.title}>
                    <div className="visual-scene-copy">
                      <strong>{currentScene.title}</strong>
                      <p>{currentScene.helper}</p>
                    </div>
                    {currentScene.tokens?.length ? (
                      <div className="visual-token-grid">
                        {currentScene.tokens.map((token, index) => (
                          <span
                            className="visual-token"
                            key={`${currentQuestion.questionKey}-${index}`}
                            aria-hidden="true"
                          >
                            {token}
                          </span>
                        ))}
                      </div>
                    ) : currentQuestion.questionKey === "prek_letter_b_ball" ? (
                      <div className="visual-token-grid letter-word-scene" aria-hidden="true">
                        <div className="visual-token visual-token-word">
                          <span className="letter-scene-token">B</span>
                          <small>starts like ball</small>
                        </div>
                        <div className="visual-token visual-token-word">
                          <span className="emoji-scene-token">⚽</span>
                          <small>ball</small>
                        </div>
                      </div>
                    ) : questionTags.includes("letter time") ? (
                      <div className="letter-scene" aria-hidden="true">
                        <span>B</span>
                      </div>
                    ) : currentQuestion.questionKey === "prek_shape_circle" ? (
                      <div className="shape-scene" aria-hidden="true">
                        <span className="shape-preview shape-circle" />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="answer-grid">
                  {currentQuestion.answers.map((answer, index) => (
                    <button
                      className={`answer-card ${earlyLearnerMode ? "answer-card-early" : ""}`}
                      disabled={submitting || Boolean(answerState?.correct)}
                      key={answer}
                      onClick={() => void submitAnswer(answer)}
                      type="button"
                    >
                      <span className="answer-index">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {renderAnswerContent(currentQuestion, answer)}
                    </button>
                  ))}
                </div>
              </>
            )}
            {error ? <p className="status-banner status-error">{error}</p> : null}
            {answerState?.correct && !finished ? (
              <div className={`status-panel status-success ${earlyLearnerMode ? "celebration-panel" : ""}`}>
                {earlyLearnerMode ? (
                  <div className="celebration-burst" aria-hidden="true">
                    <span>✨</span>
                    <span>⭐</span>
                    <span>✨</span>
                  </div>
                ) : null}
                <strong>{earlyLearnerMode ? celebrationCopy.title : "Nice work."}</strong>
                <p>
                  {earlyLearnerMode
                    ? celebrationCopy.body
                    : `+${answerState.pointsEarned} points. Correct answer locked in for this question.`}
                </p>
                <div className="summary-chip-row">
                  <span className="summary-chip">
                    Total points: {progression?.totalPoints ?? 0}
                  </span>
                  <span className="summary-chip">
                    Level {progression?.currentLevel ?? 1}
                  </span>
                  <span className="summary-chip">
                    {progression?.badgeCount ?? 0} badges ·{" "}
                    {progression?.trophyCount ?? 0} trophies
                  </span>
                </div>
                <div className="form-actions">
                  <button
                    className="primary-link button-link"
                    onClick={moveToNextQuestion}
                    type="button"
                  >
                    Next question
                  </button>
                </div>
              </div>
            ) : null}
          </ShellCard>

          <div className="play-side">
            <ShellCard
              className="shell-card-emphasis"
              eyebrow="Session"
              title="Progress right now"
            >
              <div className="reward-strip">
                <StatTile
                  label={earlyLearnerMode ? "Quest step" : "Question"}
                  value={`${questionNumber}/${session.questions.length}`}
                  detail={
                    earlyLearnerMode
                      ? "Short guided challenge"
                      : `${progressPercent}% through this loop`
                  }
                />
                {!earlyLearnerMode ? (
                  <StatTile
                    label="Points"
                    value={`${progression?.totalPoints ?? 0}`}
                    detail={`Level ${progression?.currentLevel ?? 1}`}
                  />
                ) : null}
              </div>
            </ShellCard>

            <ShellCard eyebrow="Support" title="Adaptive help and recovery">
              {answerState?.needsRetry && answerState.explainer ? (
                <div className={`status-panel ${earlyLearnerMode ? "guide-panel" : ""}`}>
                  {earlyLearnerMode ? (
                    <div className="guide-row">
                      <span className="guide-mascot" aria-hidden="true">
                        🦉
                      </span>
                      <div>
                        <strong>Let&apos;s try together.</strong>
                        <p>{buildShortSupportLine(answerState.explainer.script)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <strong>Quick explainer ready.</strong>
                      <p>{answerState.explainer.script}</p>
                      <p className="soft-copy">
                        Format: {answerState.explainer.format} · Media hint:{" "}
                        {answerState.explainer.mediaHint}
                      </p>
                      <p className="soft-copy">
                        Retry the same question after the explanation. Second-attempt
                        wins still earn recovery points.
                      </p>
                    </>
                  )}
                  {voiceEnabled && earlyLearnerMode ? (
                    <div className="form-actions">
                      <button
                        className="secondary-link button-link"
                        onClick={() =>
                          speakText(answerState.explainer?.script ?? "", "support")
                        }
                        type="button"
                      >
                        Hear the helper again
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  {earlyLearnerMode ? (
                    <div className="status-panel guide-panel">
                      <div className="guide-row">
                        <span className="guide-mascot" aria-hidden="true">
                          🌈
                        </span>
                        <div>
                          <strong>We help, then we try again.</strong>
                          <p>Misses are okay here. The next help step stays short and calm.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ul className="route-list">
                      <li>Wrong answers trigger explainers instead of dead ends.</li>
                      <li>Correct retries still earn points and keep motivation up.</li>
                      <li>Progression updates immediately after each correct answer.</li>
                    </ul>
                  )}
                </>
              )}
              {answerState?.milestones.leveledUp ? (
                <p className="status-banner status-success">Level up unlocked.</p>
              ) : null}
              {answerState?.milestones.badgeEarned ? (
                <p className="status-banner status-success">New badge earned.</p>
              ) : null}
              {answerState?.milestones.trophyEarned ? (
                <p className="status-banner status-success">New trophy earned.</p>
              ) : null}
              <div className="form-actions">
                <Link className="secondary-link" href="/child">
                  Switch child
                </Link>
                <Link className="secondary-link" href="/parent">
                  Parent view
                </Link>
              </div>
            </ShellCard>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
