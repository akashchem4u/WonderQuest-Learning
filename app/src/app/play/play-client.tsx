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

type RewardOverlay = {
  tone: "mint" | "gold" | "violet";
  emoji: string;
  title: string;
  body: string;
};

type WordPreview = {
  icon: string;
  helper: string;
};

function isEarlyLearnerBand(launchBandCode: string) {
  return launchBandCode === "PREK" || launchBandCode === "K1";
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

function getWordPreview(answer: string): WordPreview {
  switch (answer.toLowerCase()) {
    case "cat":
      return { icon: "🐱", helper: "cat" };
    case "bike":
      return { icon: "🚲", helper: "bike" };
    case "home":
      return { icon: "🏠", helper: "home" };
    case "goal":
      return { icon: "🥅", helper: "goal" };
    case "goat":
      return { icon: "🐐", helper: "goat" };
    case "gold":
      return { icon: "🥇", helper: "gold" };
    default:
      return { icon: "✨", helper: answer };
  }
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
    case "k1_short_a_cat":
      return {
        title: "Find the short a word",
        helper: "Say cat. Listen for the short a sound.",
      } satisfies QuestionVisualScene;
    case "k1_add_6_4":
      return {
        title: "Add to ten",
        helper: "Start with six, add four more, then tap the total.",
      } satisfies QuestionVisualScene;
    case "k1_first_word_goal":
      return {
        title: "Read the word goal",
        helper: "Look at each word card, then tap goal.",
      } satisfies QuestionVisualScene;
    default:
      return null;
  }
}

function buildSceneClass(question: SessionQuestion) {
  if (question.questionKey === "prek_count_ducks_3") {
    return "scene-count";
  }

  if (question.questionKey === "prek_letter_b_ball") {
    return "scene-letter";
  }

  if (question.questionKey === "prek_shape_circle") {
    return "scene-shape";
  }

  if (question.questionKey === "k1_short_a_cat") {
    return "scene-phonics";
  }

  if (question.questionKey === "k1_add_6_4") {
    return "scene-score";
  }

  if (question.questionKey === "k1_first_word_goal") {
    return "scene-reading";
  }

  if (question.subject === "early-literacy") {
    return "scene-letter";
  }

  return "";
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

  if (question.questionKey === "k1_short_a_cat") {
    return "Say cat, then tap the word that sounds the same.";
  }

  if (question.questionKey === "k1_add_6_4") {
    return "Count up from six, then tap the total.";
  }

  if (question.questionKey === "k1_first_word_goal") {
    return "Read each card, then tap the word goal.";
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

function buildCoachSteps(question: SessionQuestion) {
  if (question.questionKey === "prek_count_ducks_3") {
    return [
      "Listen to the question.",
      "Count each duck one time.",
      "Tap the group that matches.",
    ];
  }

  if (question.questionKey === "prek_letter_b_ball") {
    return [
      "Listen for the letter sound.",
      "Look for the big letter B.",
      "Tap the matching card.",
    ];
  }

  if (question.questionKey === "prek_shape_circle") {
    return [
      "Look for the round shape.",
      "Find the one with no corners.",
      "Tap the circle card.",
    ];
  }

  if (question.questionKey === "k1_short_a_cat") {
    return [
      "Say cat with me.",
      "Listen for the short a sound.",
      "Tap the word that matches.",
    ];
  }

  if (question.questionKey === "k1_add_6_4") {
    return [
      "Start with six.",
      "Add four more.",
      "Tap the total.",
    ];
  }

  if (question.questionKey === "k1_first_word_goal") {
    return [
      "Look at the word cards.",
      "Find the word goal.",
      "Tap the matching card.",
    ];
  }

  return [
    "Listen first.",
    "Look for the clue.",
    "Tap your best answer.",
  ];
}

function buildCoachCopy(
  question: SessionQuestion,
  scene: QuestionVisualScene | null,
  mode: "listen" | "clue" | "support",
) {
  const helper = scene?.helper ?? buildPromptCue(question, scene);

  if (mode === "clue") {
    return {
      title: "Let me show the clue.",
      body: helper,
    };
  }

  if (mode === "support") {
    return {
      title: "It is okay to need help.",
      body: "We can slow down, listen again, and do one small step at a time.",
    };
  }

  return {
    title: "Let us listen together.",
    body: "Hear it slowly, then look carefully before you tap.",
  };
}

function buildWelcomeBackCopy(
  displayName: string,
  launchBandCode: string,
  progression: SessionPayload["progression"] | null,
) {
  if (launchBandCode === "PREK") {
    return {
      title: `Welcome back, ${displayName}!`,
      body: "Your helper is ready, your stars are saved, and we can do one small step at a time.",
    };
  }

  if (launchBandCode === "K1") {
    return {
      title: `Welcome back, ${displayName}!`,
      body: "Your points, badges, and quick wins are waiting right where you left them.",
    };
  }

  return {
    title: `Welcome back, ${displayName}.`,
    body: `Your progress is still here: ${progression?.totalPoints ?? 0} points, ${progression?.badgeCount ?? 0} badges, and ${progression?.trophyCount ?? 0} trophies.`,
  };
}

function buildRewardOverlay(
  answerState: AnswerPayload,
  earlyLearnerMode: boolean,
  progression: SessionPayload["progression"] | null,
) {
  if (answerState.milestones.trophyEarned) {
    return {
      tone: "gold",
      emoji: "🏆",
      title: "New trophy!",
      body: earlyLearnerMode
        ? "A shiny new trophy joined your collection."
        : `New trophy unlocked. You now have ${progression?.trophyCount ?? 0} trophies.`,
    } satisfies RewardOverlay;
  }

  if (answerState.milestones.badgeEarned) {
    return {
      tone: "violet",
      emoji: "🏅",
      title: "New badge!",
      body: earlyLearnerMode
        ? "You earned a brand-new badge for this quest."
        : `Badge earned. You now have ${progression?.badgeCount ?? 0} badges.`,
    } satisfies RewardOverlay;
  }

  if (answerState.milestones.leveledUp) {
    return {
      tone: "mint",
      emoji: "🚀",
      title: "Level up!",
      body: `You reached level ${progression?.currentLevel ?? 1}.`,
    } satisfies RewardOverlay;
  }

  if (answerState.correct && earlyLearnerMode) {
    return {
      tone: "mint",
      emoji: "⭐",
      title: "You got it!",
      body: "That was the right answer. Keep going one step at a time.",
    } satisfies RewardOverlay;
  }

  if (answerState.correct) {
    return {
      tone: "mint",
      emoji: "✨",
      title: "Nice work.",
      body: `+${answerState.pointsEarned} points added to this quest.`,
    } satisfies RewardOverlay;
  }

  return null;
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
  if (question.questionKey === "prek_count_ducks_3" && /^\d+$/.test(answer)) {
    return (
      <>
        <div className="answer-visual-stack">
          <div className="answer-token-row" aria-hidden="true">
            {Array.from({ length: Number(answer) }, (_, index) => (
              <span className="answer-token" key={`${answer}-${index}`}>
                🦆
              </span>
            ))}
          </div>
          <strong>{answer}</strong>
        </div>
        <small>Count the ducks, then tap the matching group.</small>
      </>
    );
  }

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

  if (
    question.questionKey === "k1_short_a_cat" ||
    question.questionKey === "k1_first_word_goal"
  ) {
    const preview = getWordPreview(answer);

    return (
      <>
        <div className="answer-visual-stack">
          <span className="word-preview" aria-hidden="true">
            {preview.icon}
          </span>
          <strong>{answer}</strong>
        </div>
        <small>{preview.helper}</small>
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

function buildAnswerCardVariant(question: SessionQuestion) {
  if (question.questionKey === "prek_count_ducks_3") {
    return "count";
  }

  if (question.questionKey === "k1_add_6_4") {
    return "count";
  }

  if (question.questionKey === "prek_letter_b_ball") {
    return "letter";
  }

  if (question.questionKey === "k1_short_a_cat") {
    return "picture";
  }

  if (question.questionKey === "prek_shape_circle") {
    return "shape";
  }

  if (question.questionKey === "k1_first_word_goal") {
    return "picture";
  }

  if (question.subject === "early-literacy") {
    return "picture";
  }

  if (/^\d+$/.test(question.answers[0] ?? "")) {
    return "count";
  }

  return "standard";
}

function buildAnswerTapCue(question: SessionQuestion) {
  if (question.questionKey === "prek_count_ducks_3") {
    return "Tap the duck group that matches.";
  }

  if (question.questionKey === "prek_letter_b_ball") {
    return "Tap the letter you hear.";
  }

  if (question.questionKey === "k1_short_a_cat") {
    return "Tap the word that sounds like cat.";
  }

  if (question.questionKey === "prek_shape_circle") {
    return "Tap the round shape.";
  }

  if (question.questionKey === "k1_add_6_4") {
    return "Tap the total after six and four more.";
  }

  if (question.questionKey === "k1_first_word_goal") {
    return "Tap the word that says goal.";
  }

  if (question.subject === "early-literacy") {
    return "Tap the picture or letter that matches.";
  }

  if (question.subject === "math") {
    return "Tap the group that matches.";
  }

  return "Tap the answer that matches.";
}

export default function PlayClient() {
  const searchParams = useSearchParams();
  const sessionMode = searchParams.get("sessionMode") ?? "guided-quest";
  const entryMode = searchParams.get("entry") ?? "new";
  const returningEntry = entryMode === "returning";

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
  const [coachMode, setCoachMode] = useState<"listen" | "clue" | "support">(
    "listen",
  );
  const [playedWelcomeVoice, setPlayedWelcomeVoice] = useState(false);
  const [rewardOverlay, setRewardOverlay] = useState<RewardOverlay | null>(null);

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
        setCoachMode("listen");
        setPlayedWelcomeVoice(false);
        setRewardOverlay(null);
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

  useEffect(() => {
    if (!session || !answerState?.correct) {
      return;
    }

    const overlay = buildRewardOverlay(
      answerState,
      isEarlyLearnerBand(session.student.launchBandCode),
      progression,
    );

    setRewardOverlay(overlay);
  }, [answerState, progression, session]);

  useEffect(() => {
    if (!rewardOverlay) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRewardOverlay(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [rewardOverlay]);

  useEffect(() => {
    if (!session || !voiceEnabled || !returningEntry || playedWelcomeVoice) {
      return;
    }

    if (!isEarlyLearnerBand(session.student.launchBandCode)) {
      return;
    }

    const welcomeBackCopy = buildWelcomeBackCopy(
      session.student.displayName,
      session.student.launchBandCode,
      progression,
    );

    speakText(`${welcomeBackCopy.title} ${welcomeBackCopy.body}`, "support");
    setPlayedWelcomeVoice(true);
  }, [
    availableVoices,
    playedWelcomeVoice,
    progression,
    returningEntry,
    session,
    voiceEnabled,
  ]);

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
        setCoachMode("listen");
      } else {
        setAttempt((value) => value + 1);
        setCoachMode("support");
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
    setRewardOverlay(null);
    setCoachMode("listen");
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
    ? questionTags.slice(0, 1)
    : questionTags;
  const celebrationCopy = buildCelebrationCopy(currentQuestion);
  const welcomeBackCopy = buildWelcomeBackCopy(
    session.student.displayName,
    session.student.launchBandCode,
    progression,
  );
  const promptCue = buildPromptCue(currentQuestion, currentScene);
  const coachCopy = buildCoachCopy(currentQuestion, currentScene, coachMode);
  const coachSteps = buildCoachSteps(currentQuestion);
  const answerCardVariant = buildAnswerCardVariant(currentQuestion);
  const answerTapCue = buildAnswerTapCue(currentQuestion);

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main className="page-shell page-shell-split">
        {rewardOverlay ? (
          <button
            aria-label="Reward moment"
            className={`reward-overlay reward-overlay-${rewardOverlay.tone}`}
            onClick={() => setRewardOverlay(null)}
            type="button"
          >
            <div className="reward-overlay-card">
              <div className="reward-overlay-emoji" aria-hidden="true">
                {rewardOverlay.emoji}
              </div>
              <strong>{rewardOverlay.title}</strong>
              <p>{rewardOverlay.body}</p>
            </div>
          </button>
        ) : null}
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
            className={`shell-card-spotlight question-stage ${earlyLearnerMode ? "question-stage-early" : ""}`}
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
                  <div className="finished-quest-hero">
                    <div className="finished-quest-mascot" aria-hidden="true">
                      {getAvatarSymbol(session.student.avatarKey)}
                    </div>
                    <div className="finished-quest-copy">
                      <span className="kid-prompt-label">
                        {returningEntry ? "Saved progress" : "Quest complete"}
                      </span>
                      <strong>{session.student.displayName} finished the quest!</strong>
                      <p>
                        {returningEntry
                          ? "The stars, badges, and trophies stayed right where they were. You can come back for another short quest any time."
                          : "That whole quest is done. The stars and rewards are saved, and you can do another short round whenever you are ready."}
                      </p>
                    </div>
                  </div>
                ) : null}
                <strong>{earlyLearnerMode ? "Quest complete!" : "Session complete."}</strong>
                <p>
                  {earlyLearnerMode
                    ? `${session.student.displayName} finished all ${session.questions.length} quick challenge steps${returningEntry ? " and kept the same saved rewards moving forward" : ""}.`
                    : `${session.student.displayName} finished the current loop with ${progression?.totalPoints ?? 0} total points and level ${progression?.currentLevel ?? 1}${returningEntry ? ", with progress picked up exactly where it was left" : ""}.`}
                </p>
                {earlyLearnerMode ? (
                  <div className="finished-quest-strip">
                    <div className="finished-quest-stat">
                      <span>Level</span>
                      <strong>{progression?.currentLevel ?? 1}</strong>
                    </div>
                    <div className="finished-quest-stat">
                      <span>Stars</span>
                      <strong>{progression?.totalPoints ?? 0}</strong>
                    </div>
                    <div className="finished-quest-stat">
                      <span>Rewards</span>
                      <strong>
                        {progression?.badgeCount ?? 0} badges · {progression?.trophyCount ?? 0} trophies
                      </strong>
                    </div>
                  </div>
                ) : (
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
                )}
                {earlyLearnerMode ? (
                  <div className="finished-quest-note">
                    <strong>Next step</strong>
                    <p>A grown-up can start one more short quest now or come back later with the same saved progress.</p>
                  </div>
                ) : null}
                <div className="form-actions">
                  <Link className="primary-link" href="/child">
                    {earlyLearnerMode ? "Start another short quest" : "Play again"}
                  </Link>
                  <Link className="secondary-link" href={earlyLearnerMode ? "/child" : "/parent"}>
                    {earlyLearnerMode ? "Take a break" : "Parent view"}
                  </Link>
                  {earlyLearnerMode ? (
                    <Link className="secondary-link" href="/parent">
                      Parent view
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {earlyLearnerMode ? (
                  <div className="play-early-topbar">
                    <div className="play-early-player">
                      <span className="play-early-avatar" aria-hidden="true">
                        {getAvatarSymbol(session.student.avatarKey)}
                      </span>
                      <div className="play-early-player-copy">
                        <strong>{session.student.displayName}</strong>
                        <span>Level {progression?.currentLevel ?? 1}</span>
                      </div>
                    </div>
                    <div className="play-early-stars">
                      <span aria-hidden="true">⭐</span>
                      {progression?.totalPoints ?? 0}
                    </div>
                  </div>
                ) : null}
                <div className="summary-chip-row">
                  {visibleQuestionTags.map((tag) => (
                    <span className="summary-chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                {returningEntry ? (
                  <div className={`returning-quest-banner ${earlyLearnerMode ? "is-early" : ""}`}>
                    <div className="returning-quest-copy">
                      <span className="kid-prompt-label">
                        {earlyLearnerMode ? "Welcome back" : "Saved progress"}
                      </span>
                      <strong>{welcomeBackCopy.title}</strong>
                      <p>{welcomeBackCopy.body}</p>
                    </div>
                    <div className="returning-quest-stats">
                      <span>{progression?.totalPoints ?? 0} pts</span>
                      <span>{progression?.badgeCount ?? 0} badges</span>
                      <span>{progression?.trophyCount ?? 0} trophies</span>
                    </div>
                  </div>
                ) : null}
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
                {earlyLearnerMode ? (
                  <div className={`voice-coach-card voice-coach-${coachMode}`}>
                    <div className="voice-coach-header">
                      <span className="voice-coach-icon" aria-hidden="true">
                        {coachMode === "support" ? "🦉" : coachMode === "clue" ? "💡" : "🎧"}
                      </span>
                      <div className="voice-coach-copy">
                        <span className="kid-prompt-label">
                          {coachMode === "support"
                            ? "Need a little help?"
                            : coachMode === "clue"
                              ? "Try the clue"
                              : "Listen first"}
                        </span>
                        <strong>{coachCopy.title}</strong>
                        <p>{coachCopy.body}</p>
                      </div>
                    </div>
                    <div className="voice-coach-steps">
                      {coachSteps.map((step, index) => (
                        <div className="voice-coach-step" key={`${currentQuestion.questionKey}-${step}`}>
                          <span className="voice-coach-step-index">{index + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="voice-coach-actions">
                      {voiceEnabled ? (
                        <button
                          className="secondary-link button-link"
                          onClick={() => {
                            setCoachMode("listen");
                            speakText(
                              buildReadAloudText(currentQuestion, currentScene),
                              "prompt",
                            );
                          }}
                          type="button"
                        >
                          Hear it again
                        </button>
                      ) : null}
                      <button
                        className="secondary-link button-link"
                        onClick={() => setCoachMode("clue")}
                        type="button"
                      >
                        Show the clue
                      </button>
                      <button
                        className="secondary-link button-link"
                        onClick={() => setCoachMode("support")}
                        type="button"
                      >
                        I don&apos;t know yet
                      </button>
                    </div>
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
                  <div
                    className={`visual-scene ${buildSceneClass(currentQuestion)}`.trim()}
                    aria-label={currentScene.title}
                  >
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
                    ) : currentQuestion.questionKey === "k1_short_a_cat" ? (
                      <div className="visual-token-grid letter-word-scene" aria-hidden="true">
                        <div className="visual-token visual-token-word">
                          <span className="emoji-scene-token">🐱</span>
                          <small>cat</small>
                        </div>
                        <div className="visual-token visual-token-word">
                          <span className="letter-scene-token">a</span>
                          <small>short a sound</small>
                        </div>
                      </div>
                    ) : currentQuestion.questionKey === "k1_add_6_4" ? (
                      <div className="score-scene" aria-hidden="true">
                        <div className="score-scene-row">
                          {Array.from({ length: 6 }, (_, index) => (
                            <span className="score-token" key={`score-six-${index}`}>
                              ⚽
                            </span>
                          ))}
                        </div>
                        <span className="score-scene-plus">+</span>
                        <div className="score-scene-row">
                          {Array.from({ length: 4 }, (_, index) => (
                            <span className="score-token" key={`score-four-${index}`}>
                              ⚽
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : currentQuestion.questionKey === "k1_first_word_goal" ? (
                      <div className="visual-token-grid letter-word-scene" aria-hidden="true">
                        <div className="visual-token visual-token-word">
                          <span className="emoji-scene-token">🥅</span>
                          <small>goal</small>
                        </div>
                        <div className="visual-token visual-token-word">
                          <span className="letter-scene-token">GOAL</span>
                          <small>read the whole word</small>
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
                {earlyLearnerMode ? (
                  <div className={`early-answer-cue early-answer-cue-${answerCardVariant}`}>
                    <strong>Tap the match</strong>
                    <span>{answerTapCue}</span>
                  </div>
                ) : null}
                <div className={`answer-grid ${earlyLearnerMode ? "answer-grid-early" : ""}`.trim()}>
                  {currentQuestion.answers.map((answer, index) => (
                    <button
                      className={`answer-card ${earlyLearnerMode ? "answer-card-early" : ""} answer-card-${answerCardVariant}`}
                      disabled={submitting || Boolean(answerState?.correct)}
                      key={answer}
                      onClick={() => void submitAnswer(answer)}
                      type="button"
                    >
                      {!earlyLearnerMode ? (
                        <span className="answer-index">
                          {String.fromCharCode(65 + index)}
                        </span>
                      ) : null}
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
