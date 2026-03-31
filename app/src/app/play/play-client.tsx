"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";
import { PlayBetaSupport, type AssistMode } from "./play-beta-support";

type SessionQuestion = {
  questionKey: string;
  prompt: string;
  answers: string[];
  correctAnswer: string;
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

type QuestNodeState = "done" | "just-completed" | "current" | "locked";

type QuestNode = {
  key: string;
  label: string;
  icon: string;
  state: QuestNodeState;
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
    case "ball":
      return { icon: "⚽", helper: "ball" };
    case "bag":
      return { icon: "👜", helper: "bag" };
    case "bear":
      return { icon: "🐻", helper: "bear" };
    case "book":
      return { icon: "📘", helper: "book" };
    case "bell":
      return { icon: "🔔", helper: "bell" };
    case "bus":
      return { icon: "🚌", helper: "bus" };
    case "butterfly":
      return { icon: "🦋", helper: "butterfly" };
    case "bat":
      return { icon: "🦇", helper: "bat" };
    case "gap":
      return { icon: "🕳️", helper: "gap" };
    case "hat":
      return { icon: "🧢", helper: "hat" };
    case "jam":
      return { icon: "🍓", helper: "jam" };
    case "map":
      return { icon: "🗺️", helper: "map" };
    case "pan":
      return { icon: "🍳", helper: "pan" };
    case "sam":
      return { icon: "🧒", helper: "Sam" };
    case "cap":
      return { icon: "🧢", helper: "cap" };
    case "van":
      return { icon: "🚐", helper: "van" };
    case "net":
      return { icon: "🥅", helper: "net" };
    case "kick":
      return { icon: "🥾", helper: "kick" };
    case "team":
      return { icon: "👥", helper: "team" };
    case "time":
      return { icon: "⏰", helper: "time" };
    case "tent":
      return { icon: "⛺", helper: "tent" };
    case "planet":
      return { icon: "🪐", helper: "planet" };
    case "play":
      return { icon: "🎮", helper: "play" };
    case "earth":
      return { icon: "🌍", helper: "earth" };
    case "rocket":
      return { icon: "🚀", helper: "rocket" };
    case "run":
      return { icon: "🏃", helper: "run" };
    case "pass":
      return { icon: "🎯", helper: "pass" };
    default:
      return { icon: "✨", helper: answer };
  }
}

function isCountSkill(question: SessionQuestion) {
  return question.skill === "count-to-3";
}

function isLetterSkill(question: SessionQuestion) {
  return question.skill === "letter-b-recognition";
}

function isShapeSkill(question: SessionQuestion) {
  return question.skill === "shape-circle";
}

function isShortASkill(question: SessionQuestion) {
  return question.skill === "short-a-sound";
}

function isAddToTenSkill(question: SessionQuestion) {
  return question.skill === "add-to-10";
}

function isReadSimpleWordSkill(question: SessionQuestion) {
  return question.skill === "read-simple-word";
}

function getCountSceneToken(question: SessionQuestion) {
  const prompt = question.prompt.toLowerCase();

  if (prompt.includes("duck")) return "🦆";
  if (prompt.includes("fish")) return "🐟";
  if (prompt.includes("star")) return "⭐";
  if (prompt.includes("ball")) return "⚽";
  if (prompt.includes("bird")) return "🐦";
  if (prompt.includes("frog")) return "🐸";
  if (prompt.includes("apple")) return "🍎";
  if (prompt.includes("kite")) return "🪁";
  if (prompt.includes("tree")) return "🌳";
  return "✨";
}

function getSceneReferenceWord(question: SessionQuestion) {
  const words =
    question.prompt
      .toLowerCase()
      .match(/[a-z]+/g)
      ?.filter(
        (word) =>
          ![
            "tap",
            "the",
            "letter",
            "which",
            "word",
            "has",
            "short",
            "sound",
            "pick",
            "what",
            "is",
            "how",
            "many",
            "do",
            "you",
            "see",
            "find",
            "correct",
            "a",
            "an",
            "of",
          ].includes(word),
      ) ?? [];

  return words.at(-1) ?? question.correctAnswer.toLowerCase();
}

function buildQuestionVisualScene(question: SessionQuestion) {
  if (isCountSkill(question)) {
    return {
      title: "Count the pictures",
      helper: "Count once, then tap the match.",
      tokens: Array.from(
        { length: Number(question.correctAnswer) || 0 },
        () => getCountSceneToken(question),
      ),
    } satisfies QuestionVisualScene;
  }

  if (isLetterSkill(question)) {
    return {
      title: `Find the letter ${question.correctAnswer}`,
      helper: "Listen first, then tap the matching letter.",
    } satisfies QuestionVisualScene;
  }

  if (isShapeSkill(question)) {
    return {
      title: "Find the circle",
      helper: "Look for the round shape with no corners.",
    } satisfies QuestionVisualScene;
  }

  if (isShortASkill(question)) {
    return {
      title: "Find the short a word",
      helper: "Say the word, listen for the short a sound, then tap the match.",
    } satisfies QuestionVisualScene;
  }

  if (isAddToTenSkill(question)) {
    return {
      title: "Add and tap the total",
      helper: "Start with the first number, add more, then tap the answer.",
    } satisfies QuestionVisualScene;
  }

  if (isReadSimpleWordSkill(question)) {
    return {
      title: `Read the word ${question.correctAnswer}`,
      helper: "Look at each card, then tap the word that matches.",
    } satisfies QuestionVisualScene;
  }

  return null;
}

function buildSceneClass(question: SessionQuestion) {
  if (isCountSkill(question)) {
    return "scene-count";
  }

  if (isLetterSkill(question)) {
    return "scene-letter";
  }

  if (isShapeSkill(question)) {
    return "scene-shape";
  }

  if (isShortASkill(question)) {
    return "scene-phonics";
  }

  if (isAddToTenSkill(question)) {
    return "scene-score";
  }

  if (isReadSimpleWordSkill(question)) {
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

  if (isShortASkill(question)) {
    return "Say cat, then tap the word that sounds the same.";
  }

  if (isAddToTenSkill(question)) {
    return "Count up from six, then tap the total.";
  }

  if (isReadSimpleWordSkill(question)) {
    return `Read each card, then tap ${question.correctAnswer}.`;
  }

  if (question.subject === "early-literacy") {
    return "Listen first, then tap the right letter or word.";
  }

  if (question.subject === "math") {
    return "Look carefully and tap the answer you see.";
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
  if (isCountSkill(question)) {
    return [
      "Listen to the question.",
      "Count each picture one time.",
      "Tap the group that matches.",
    ];
  }

  if (isLetterSkill(question)) {
    return [
      "Listen for the letter sound.",
      `Look for the letter ${question.correctAnswer}.`,
      "Tap the matching card.",
    ];
  }

  if (isShapeSkill(question)) {
    return [
      "Look for the round shape.",
      "Find the one with no corners.",
      "Tap the circle card.",
    ];
  }

  if (isShortASkill(question)) {
    return [
      "Say cat with me.",
      "Listen for the short a sound.",
      "Tap the word that matches.",
    ];
  }

  if (isAddToTenSkill(question)) {
    return [
      "Start with six.",
      "Add four more.",
      "Tap the total.",
    ];
  }

  if (isReadSimpleWordSkill(question)) {
    return [
      "Look at the word cards.",
      `Find the word ${question.correctAnswer}.`,
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

function renderAnswerContent(
  question: SessionQuestion,
  answer: string,
  compact = false,
) {
  if (isCountSkill(question) && /^\d+$/.test(answer)) {
    return (
      <>
        <div className="answer-visual-stack">
          <div className="answer-token-row" aria-hidden="true">
            {Array.from({ length: Number(answer) }, (_, index) => (
              <span className="answer-token" key={`${answer}-${index}`}>
                {getCountSceneToken(question)}
              </span>
            ))}
          </div>
          <strong>{answer}</strong>
        </div>
        {!compact ? <small>Count the pictures, then tap the matching group.</small> : null}
      </>
    );
  }

  if (isShapeSkill(question)) {
    return (
      <>
        <div className="answer-visual-stack">
          <span className={`shape-preview shape-${answer}`} aria-hidden="true" />
          <strong>{answer}</strong>
        </div>
        {!compact ? <small>Tap the shape you hear.</small> : null}
      </>
    );
  }

  if (isLetterSkill(question)) {
    return (
      <>
        <div className="answer-visual-stack">
          <span className="letter-preview" aria-hidden="true">
            {answer}
          </span>
          <strong>{answer}</strong>
        </div>
        {!compact ? <small>Tap the letter you hear.</small> : null}
      </>
    );
  }

  if (isShortASkill(question) || isReadSimpleWordSkill(question)) {
    const preview = getWordPreview(answer);

    return (
      <>
        <div className="answer-visual-stack">
          <span className="word-preview" aria-hidden="true">
            {preview.icon}
          </span>
          <strong>{answer}</strong>
        </div>
        {!compact ? <small>{preview.helper}</small> : null}
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
        {!compact ? <small>Tap to lock in this answer.</small> : null}
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
  if (isCountSkill(question)) {
    return "count";
  }

  if (isAddToTenSkill(question)) {
    return "count";
  }

  if (isLetterSkill(question)) {
    return "letter";
  }

  if (isShortASkill(question)) {
    return "picture";
  }

  if (isShapeSkill(question)) {
    return "shape";
  }

  if (isReadSimpleWordSkill(question)) {
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
  if (isCountSkill(question)) {
    return "Tap the picture group that matches.";
  }

  if (isLetterSkill(question)) {
    return "Tap the letter you hear.";
  }

  if (isShortASkill(question)) {
    return "Tap the word that sounds like cat.";
  }

  if (isShapeSkill(question)) {
    return "Tap the round shape.";
  }

  if (isAddToTenSkill(question)) {
    return "Tap the total after six and four more.";
  }

  if (isReadSimpleWordSkill(question)) {
    return `Tap the word that says ${question.correctAnswer}.`;
  }

  if (question.subject === "early-literacy") {
    return "Tap the picture or letter that matches.";
  }

  if (question.subject === "math") {
    return "Tap the group that matches.";
  }

  return "Tap the answer that matches.";
}

function buildQuestNodeLabel(question: SessionQuestion) {
  if (isCountSkill(question)) return "Count";
  if (isLetterSkill(question)) return "Letter";
  if (isShapeSkill(question)) return "Shape";
  if (isShortASkill(question)) return "Sound";
  if (isAddToTenSkill(question)) return "Add";
  if (isReadSimpleWordSkill(question)) return "Read";

  if (question.subject === "math") return "Math";
  if (question.subject === "early-literacy") return "Word";
  if (question.subject === "reading") return "Read";
  return "Quest";
}

function buildQuestNodeIcon(question: SessionQuestion) {
  if (isCountSkill(question)) return getCountSceneToken(question);
  if (isLetterSkill(question)) return "🔤";
  if (isShapeSkill(question)) return "⭕";
  if (isShortASkill(question)) return "🐱";
  if (isAddToTenSkill(question)) return "⚽";
  if (isReadSimpleWordSkill(question)) return "📖";

  if (question.subject === "math") return "🔢";
  if (question.subject === "early-literacy") return "📚";
  if (question.subject === "reading") return "🪐";
  return "⭐";
}

function formatQuestLabel(value: string | null | undefined) {
  if (!value) {
    return "Quest";
  }

  return value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function buildQuestWorldLabel(launchBandCode: string) {
  switch (launchBandCode) {
    case "PREK":
      return "Animal Adventure";
    case "K1":
      return "Violet Trail";
    case "G23":
      return "Orbit Trail";
    case "G45":
      return "Builder Summit";
    default:
      return "WonderQuest";
  }
}

function buildSupportTone(launchBandCode: string) {
  switch (launchBandCode) {
    case "PREK":
      return "gold";
    case "K1":
      return "violet";
    case "G23":
      return "mint";
    case "G45":
      return "coral";
    default:
      return "violet";
  }
}

function buildQuestNodes(
  questions: SessionQuestion[],
  currentIndex: number,
  finished: boolean,
) {
  return questions.map((question, index) => {
    let state: QuestNodeState = "locked";

    if (finished) {
      state = index === questions.length - 1 ? "just-completed" : "done";
    } else if (index < currentIndex) {
      state = "done";
    } else if (index === currentIndex) {
      state = "current";
    }

    return {
      key: question.questionKey,
      label: buildQuestNodeLabel(question),
      icon: buildQuestNodeIcon(question),
      state,
    } satisfies QuestNode;
  });
}

function buildNextQuestTeaser(launchBandCode: string) {
  switch (launchBandCode) {
    case "PREK":
      return {
        title: "Next quest: Number Garden",
        body: "More tiny counting and letter adventures are waiting in the same friendly world.",
      };
    case "K1":
      return {
        title: "Next quest: Violet Trail",
        body: "A new short challenge is ready with more words, numbers, and quick wins.",
      };
    case "G23":
      return {
        title: "Next quest: Orbit Trail",
        body: "The next route opens with bigger reading and logic moments to explore.",
      };
    case "G45":
      return {
        title: "Next quest: Builder Summit",
        body: "The next stretch adds stronger puzzles, strategy, and world-building challenges.",
      };
    default:
      return {
        title: "Next quest is ready",
        body: "A fresh challenge is waiting whenever you want another short round.",
      };
  }
}

function buildCompletionMoment(
  answerState: AnswerPayload | null,
  earlyLearnerMode: boolean,
) {
  if (answerState?.milestones.trophyEarned) {
    return {
      title: earlyLearnerMode ? "Big trophy moment!" : "Trophy unlocked.",
      body: earlyLearnerMode
        ? "A shiny new trophy joined your shelf for finishing this quest."
        : "A new trophy was added to the progression shelf.",
      emoji: "🏆",
    };
  }

  if (answerState?.milestones.badgeEarned) {
    return {
      title: earlyLearnerMode ? "Badge earned!" : "New badge earned.",
      body: earlyLearnerMode
        ? "A new badge joined your collection for this quest."
        : "A new badge was earned from the current session.",
      emoji: "🏅",
    };
  }

  return {
    title: earlyLearnerMode ? "Quest path complete!" : "Session path complete.",
    body: earlyLearnerMode
      ? "You finished every step in this short quest."
      : "This loop is finished and the next route is ready when you are.",
    emoji: "⭐",
  };
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
  const [assistMode, setAssistMode] = useState<AssistMode>("voice");
  const [replayNonce, setReplayNonce] = useState(0);
  const [coachMode, setCoachMode] = useState<"listen" | "clue" | "support">(
    "listen",
  );
  const [playedWelcomeVoice, setPlayedWelcomeVoice] = useState(false);
  const [rewardOverlay, setRewardOverlay] = useState<RewardOverlay | null>(null);
  const voiceSupportRef = useRef(false);

  useEffect(() => {
    const voiceSupported =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance !== "undefined";

    voiceSupportRef.current = voiceSupported;
    setVoiceEnabled(voiceSupported);

    if (!voiceSupported || typeof window === "undefined") {
      setAssistMode("visual");
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
        setAssistMode(voiceSupportRef.current ? "voice" : "visual");
        setReplayNonce(0);
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

    if (assistMode === "visual") {
      return;
    }

    speakText(
      buildReadAloudText(currentQuestion, currentScene),
      assistMode === "slow" ? "support" : "prompt",
    );

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [
    assistMode,
    currentQuestion,
    currentScene,
    replayNonce,
    session,
    voiceEnabled,
    availableVoices,
  ]);

  useEffect(() => {
    if (!answerState?.needsRetry || !answerState.explainer || !voiceEnabled) {
      return;
    }

    if (assistMode === "visual") {
      return;
    }

    speakText(answerState.explainer.script, "support");
  }, [assistMode, answerState, voiceEnabled, availableVoices]);

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

    if (assistMode === "visual") {
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
    assistMode,
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

  function replayQuestion(mode: Exclude<AssistMode, "visual">) {
    if (!session || !currentQuestion) {
      return;
    }

    setAssistMode(mode);
    setReplayNonce((value) => value + 1);

    const replayText =
      answerState?.needsRetry && answerState.explainer
        ? answerState.explainer.script
        : buildReadAloudText(currentQuestion, currentScene);
    const replayIntent =
      answerState?.needsRetry && answerState.explainer ? "support" : "prompt";

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
    }

    speakText(replayText, mode === "slow" ? "support" : replayIntent);
  }

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Almost ready</span>
              <h1>Getting your quest ready.</h1>
              <p>
                Picking the right questions for your level.
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
          <ShellCard eyebrow="Play" title="Something went wrong">
            <p>{error ? "Questions could not be loaded. Go back and try again." : "Your quest could not be prepared."}</p>
            <div className="form-actions">
              <Link className="primary-link" href="/child">
                Go back to setup
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
  const questNodes = buildQuestNodes(
    session.questions,
    currentIndex,
    finished,
  );
  const completionMoment = buildCompletionMoment(answerState, earlyLearnerMode);
  const nextQuestTeaser = buildNextQuestTeaser(session.student.launchBandCode);
  const questWorldLabel = buildQuestWorldLabel(session.student.launchBandCode);
  const questSkillLabel = formatQuestLabel(currentQuestion?.skill);
  const inlineSupportMessage =
    answerState?.needsRetry && answerState.explainer
      ? buildShortSupportLine(answerState.explainer.script)
      : promptCue;
  const inlineSupportSteps = coachSteps.slice(0, 3);
  const completedNodeCount = questNodes.filter(
    (node) => node.state === "done" || node.state === "just-completed",
  ).length;
  const completionHighlight =
    answerState?.milestones.trophyEarned
      ? {
          eyebrow: "Trophy unlocked",
          title: "A new trophy just landed on the shelf!",
          body: "You earned this by finishing strong — it's saved to your trophy shelf.",
        }
      : answerState?.milestones.badgeEarned
        ? {
            eyebrow: "Badge earned",
            title: "New badge added to the collection.",
            body: "Saved to your badge collection — it will be there on your next visit.",
          }
        : {
            eyebrow: "Next quest ready",
            title: nextQuestTeaser.title,
            body: nextQuestTeaser.body,
          };
  const returnHighlights = returningEntry
    ? [
        {
          emoji: "⭐",
          title: `${progression?.totalPoints ?? 0} stars saved`,
          body: "Your progress stayed right here while you were away.",
        },
        {
          emoji: "🧭",
          title: "Continue from where you left off",
          body: `${questWorldLabel} · ${Math.min(currentIndex + 1, session.questions.length)} of ${session.questions.length} questions ready.`,
        },
        {
          emoji: "🎁",
          title: "Something new is waiting",
          body: nextQuestTeaser.body,
        },
      ]
    : [];

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main className="page-shell page-shell-split play-page-shell">
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
            <span className="eyebrow">
              {returningEntry ? "Welcome back" : "Quest time"}
            </span>
            <h1>
              {earlyLearnerMode
                ? `${session.student.displayName}'s quest is ready.`
                : `${session.student.displayName}'s quest loop.`}
            </h1>
            <p>
              {earlyLearnerMode
                ? "Short, guided questions with voice support, visuals, and fast wins."
                : "Answer questions, earn points, and keep the streak going. Retries and explainers are ready if you need them."}
            </p>
            <div className="summary-chip-row">
              <span className="summary-chip">{session.student.launchBandCode} band</span>
              <span className="summary-chip">
                {earlyLearnerMode
                  ? `Question ${questionNumber} of ${session.questions.length}`
                  : attempt > 1
                    ? `Try ${attempt}`
                    : `Question ${questionNumber} of ${session.questions.length}`}
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
                  ? "Quest complete!"
                  : "Quest complete!"
                : earlyLearnerMode && currentScene
                  ? currentScene.title
                  : currentQuestion.prompt
            }
          >
            {finished ? (
              <div className="status-panel status-success celebration-panel">
                {earlyLearnerMode ? (
                  <>
                    <div className="finished-quest-hero">
                      <div className="finished-quest-mascot" aria-hidden="true">
                        {completionMoment.emoji}
                      </div>
                      <div className="finished-quest-copy">
                        <span className="kid-prompt-label">
                          {returningEntry ? "Welcome back win" : "Quest complete"}
                        </span>
                        <strong>{session.student.displayName} finished the quest!</strong>
                        <p>
                          {returningEntry
                            ? "You jumped back in, kept your saved progress, and finished the whole quest."
                            : "That whole quest is done. Your stars and rewards are saved, and a new short adventure is ready next."}
                        </p>
                      </div>
                    </div>

                    {returningEntry ? (
                      <div className="return-journey-card">
                        <strong>{welcomeBackCopy.title}</strong>
                        <p>{welcomeBackCopy.body}</p>
                        <div className="return-journey-pillrow">
                          <span className="return-journey-pill">
                            ⭐ {progression?.totalPoints ?? 0} stars saved
                          </span>
                          <span className="return-journey-pill">
                            🏅 {progression?.badgeCount ?? 0} badges
                          </span>
                          <span className="return-journey-pill">
                            🏆 {progression?.trophyCount ?? 0} trophies
                          </span>
                        </div>
                        <div className="return-journey-grid">
                          {returnHighlights.map((highlight) => (
                            <div className="return-journey-highlight" key={highlight.title}>
                              <span aria-hidden="true">{highlight.emoji}</span>
                              <div>
                                <strong>{highlight.title}</strong>
                                <p>{highlight.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="finished-map-overlay">
                      <div className="finished-map-header">
                        <span className="kid-prompt-label">Quest map</span>
                        <strong>{completionMoment.title}</strong>
                        <p>{completionMoment.body}</p>
                      </div>
                      <div className="finished-map-world">
                        <span>{questWorldLabel}</span>
                        <strong>{questSkillLabel}</strong>
                        <small>
                          {completedNodeCount} of {session.questions.length} steps complete
                        </small>
                      </div>

                      <div className="finished-map-track" aria-hidden="true">
                        {questNodes.map((node, index) => (
                          <div className="finished-map-node-wrap" key={node.key}>
                            <div className={`finished-map-node is-${node.state}`}>
                              <span>{node.icon}</span>
                              {node.state === "done" || node.state === "just-completed" ? (
                                <em>{node.state === "just-completed" ? "★" : "✓"}</em>
                              ) : null}
                              {node.state === "just-completed" ? (
                                <small className="finished-map-callout">Just done!</small>
                              ) : null}
                            </div>
                            <small>{node.label}</small>
                            {index < questNodes.length - 1 ? (
                              <span
                                className={`finished-map-connector ${
                                  node.state === "done" || node.state === "just-completed"
                                    ? "is-done"
                                    : ""
                                }`}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="finished-map-teaser">
                        <div>
                          <span className="kid-prompt-label">Up next</span>
                          <strong>{completionHighlight.title}</strong>
                          <p>{completionHighlight.body}</p>
                        </div>
                        <span className="finished-map-teaser-badge">
                          {completionHighlight.eyebrow}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
                {!earlyLearnerMode ? (
                  <>
                    <strong>Quest complete!</strong>
                    <p>
                      {`${session.student.displayName} finished all ${session.questions.length} questions with ${progression?.totalPoints ?? 0} total points at level ${progression?.currentLevel ?? 1}${returningEntry ? ", picking up right where they left off" : ""}.`}
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
                    <div className="finished-quest-note">
                      <strong>Next step</strong>
                      <p>{nextQuestTeaser.body}</p>
                    </div>
                    <div className="form-actions">
                      <Link className="primary-link" href="/child">
                        Play again
                      </Link>
                      <Link className="secondary-link" href="/parent">
                        Parent view
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="quest-replay-row">
                    <Link className="quest-replay-cta" href="/child">
                      Play next quest ➜
                    </Link>
                    <Link className="quest-replay-secondary" href="/parent">
                      Parent view
                    </Link>
                  </div>
                )}
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
                    <div className="returning-quest-topline">
                      <div className="returning-quest-icon" aria-hidden="true">
                        {earlyLearnerMode ? "🌟" : "🧭"}
                      </div>
                      <div className="returning-quest-copy">
                        <span className="kid-prompt-label">
                          {earlyLearnerMode ? "Back again" : "Saved progress"}
                        </span>
                        <strong>{welcomeBackCopy.title}</strong>
                        <p>{welcomeBackCopy.body}</p>
                      </div>
                      {earlyLearnerMode ? (
                        <span className="returning-quest-pill">Pick up here</span>
                      ) : null}
                    </div>
                    {earlyLearnerMode ? (
                      <div className="returning-resume-card">
                        <span className="returning-resume-label">Continue here</span>
                        <div className="returning-resume-row">
                          <div>
                            <strong>
                              {questWorldLabel} · {questSkillLabel}
                            </strong>
                            <p>
                              Step {questionNumber} of {session.questions.length} is ready.
                            </p>
                          </div>
                          <span className="returning-resume-count">
                            {Math.min(currentIndex + 1, session.questions.length)}/{session.questions.length}
                          </span>
                        </div>
                        <div className="returning-resume-track" aria-hidden="true">
                          <span
                            className="returning-resume-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                    <div className="returning-quest-stats">
                      <span>{progression?.totalPoints ?? 0} pts</span>
                      <span>{progression?.badgeCount ?? 0} badges</span>
                      <span>{progression?.trophyCount ?? 0} trophies</span>
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
                    <span className="kid-prompt-label">Hear it once</span>
                    <strong>{currentQuestion.prompt}</strong>
                  </div>
                ) : null}
                {earlyLearnerMode ? (
                  <div
                    className={`play-inline-support ${
                      answerState?.needsRetry && !answerState.correct ? "is-retrying" : ""
                    }`.trim()}
                  >
                    <div className="play-inline-support-copy">
                      <span className="kid-prompt-label">
                        {answerState?.needsRetry && !answerState.correct
                          ? "Try again"
                          : "Need a replay?"}
                      </span>
                      <strong>
                        {answerState?.needsRetry && !answerState.correct
                          ? "Replay the clue, then take one small step."
                          : "Replay here and stay on the question."}
                      </strong>
                      <p>{inlineSupportMessage}</p>
                    </div>
                    <div className="play-inline-support-actions">
                      <button
                        aria-pressed={assistMode === "voice"}
                        className={`play-inline-support-btn ${
                          assistMode === "voice" ? "is-active" : ""
                        }`.trim()}
                        disabled={!voiceEnabled}
                        onClick={() => replayQuestion("voice")}
                        type="button"
                      >
                        Hear again
                      </button>
                      <button
                        aria-pressed={assistMode === "slow"}
                        className={`play-inline-support-btn ${
                          assistMode === "slow" ? "is-active" : ""
                        }`.trim()}
                        disabled={!voiceEnabled}
                        onClick={() => replayQuestion("slow")}
                        type="button"
                      >
                        Hear slowly
                      </button>
                      <button
                        aria-pressed={assistMode === "visual"}
                        className={`play-inline-support-btn ${
                          assistMode === "visual" ? "is-active" : ""
                        }`.trim()}
                        onClick={() => setAssistMode("visual")}
                        type="button"
                      >
                        Picture only
                      </button>
                    </div>
                    <div className="play-inline-support-visual" aria-hidden="true">
                      <span className="play-inline-support-visual-card">
                        <b>Hear</b>
                        <small>Voice clue</small>
                      </span>
                      <span className="play-inline-support-visual-card">
                        <b>Look</b>
                        <small>Picture cue</small>
                      </span>
                      <span className="play-inline-support-visual-card">
                        <b>Tap</b>
                        <small>Choose one</small>
                      </span>
                    </div>
                    <div className="play-inline-support-steps" aria-hidden="true">
                      {inlineSupportSteps.map((step, index) => (
                        <span className="play-inline-support-step" key={`${currentQuestion.questionKey}-${step}`}>
                          <b>{index + 1}</b>
                          <span>{step}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {currentScene ? (
                  <div
                    className={`visual-scene ${buildSceneClass(currentQuestion)}`.trim()}
                    aria-label={currentScene.title}
                  >
                    <div className="visual-scene-copy">
                      <strong>{currentScene.title}</strong>
                      {!earlyLearnerMode ? <p>{currentScene.helper}</p> : null}
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
                    ) : isLetterSkill(currentQuestion) ? (
                      <div className="visual-token-grid letter-word-scene" aria-hidden="true">
                        <div className="visual-token visual-token-word">
                          <span className="letter-scene-token">{currentQuestion.correctAnswer}</span>
                          <small>listen for the letter</small>
                        </div>
                        <div className="visual-token visual-token-word">
                          <span className="emoji-scene-token">
                            {getWordPreview(getSceneReferenceWord(currentQuestion)).icon}
                          </span>
                          <small>{getSceneReferenceWord(currentQuestion)}</small>
                        </div>
                      </div>
                    ) : isShortASkill(currentQuestion) ? (
                      <div className="visual-token-grid letter-word-scene" aria-hidden="true">
                        <div className="visual-token visual-token-word">
                          <span className="emoji-scene-token">
                            {getWordPreview(currentQuestion.correctAnswer).icon}
                          </span>
                          <small>{currentQuestion.correctAnswer}</small>
                        </div>
                        <div className="visual-token visual-token-word">
                          <span className="letter-scene-token">a</span>
                          <small>short a sound</small>
                        </div>
                      </div>
                    ) : isAddToTenSkill(currentQuestion) ? (
                      <div className="score-scene" aria-hidden="true">
                        <div className="score-scene-row">
                          {Array.from({ length: Number(currentQuestion.prompt.match(/\d+/)?.[0] ?? 0) }, (_, index) => (
                            <span className="score-token" key={`score-six-${index}`}>
                              ⚽
                            </span>
                          ))}
                        </div>
                        <span className="score-scene-plus">+</span>
                        <div className="score-scene-row">
                          {Array.from({ length: Number(currentQuestion.prompt.match(/\d+/g)?.[1] ?? 0) }, (_, index) => (
                            <span className="score-token" key={`score-four-${index}`}>
                              ⚽
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : isReadSimpleWordSkill(currentQuestion) ? (
                      <div className="visual-token-grid letter-word-scene" aria-hidden="true">
                        <div className="visual-token visual-token-word">
                          <span className="emoji-scene-token">
                            {getWordPreview(currentQuestion.correctAnswer).icon}
                          </span>
                          <small>{currentQuestion.correctAnswer}</small>
                        </div>
                        <div className="visual-token visual-token-word">
                          <span className="letter-scene-token">
                            {currentQuestion.correctAnswer.toUpperCase()}
                          </span>
                          <small>read the whole word</small>
                        </div>
                      </div>
                    ) : questionTags.includes("letter time") ? (
                      <div className="letter-scene" aria-hidden="true">
                        <span>B</span>
                      </div>
                    ) : isShapeSkill(currentQuestion) ? (
                      <div className="shape-scene" aria-hidden="true">
                        <span className="shape-preview shape-circle" />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {earlyLearnerMode ? (
                  <div className={`early-answer-cue early-answer-cue-${answerCardVariant}`}>
                    <strong>Find it and tap.</strong>
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
                      {renderAnswerContent(currentQuestion, answer, earlyLearnerMode)}
                    </button>
                  ))}
                </div>
              </>
            )}
            {answerState?.needsRetry && !answerState.correct ? (
              <p className="status-banner">Not quite! Check the hint and try a different answer.</p>
            ) : null}
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
                <strong>{earlyLearnerMode ? celebrationCopy.title : "Got it!"}</strong>
                <p>
                  {earlyLearnerMode
                    ? celebrationCopy.body
                    : `+${answerState.pointsEarned} points earned. Keep the streak going.`}
                </p>
                {!earlyLearnerMode ? (
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
                ) : null}
                <div className="form-actions">
                  <button
                    className={earlyLearnerMode ? "quest-next-btn" : "primary-link button-link"}
                    onClick={moveToNextQuestion}
                    type="button"
                  >
                    {earlyLearnerMode ? "Keep going ➜" : "Next question"}
                  </button>
                </div>
              </div>
            ) : null}
          </ShellCard>

          <div className="play-side">
            <ShellCard
              className="shell-card-emphasis play-progress-card"
              eyebrow="Quest"
              title="Progress right now"
            >
              <div className="reward-strip">
                <StatTile
                  label={earlyLearnerMode ? "Quest step" : "Question"}
                  value={`${questionNumber}/${session.questions.length}`}
                  detail={
                    earlyLearnerMode
                      ? "Short guided challenge"
                      : `${progressPercent}% through this quest`
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

            <>
              <PlayBetaSupport
                assistMode={assistMode}
                badges={progression?.badgeCount ?? 0}
                coachBody={
                  answerState?.needsRetry && answerState.explainer
                    ? buildShortSupportLine(answerState.explainer.script)
                    : coachCopy.body
                }
                coachSteps={coachSteps}
                coachTitle={
                  answerState?.needsRetry && answerState.explainer
                    ? "Let's try together."
                    : coachCopy.title
                }
                currentLevel={progression?.currentLevel ?? 1}
                currentQuestionLabel={questSkillLabel}
                helperMessage={promptCue}
                helperTone={buildSupportTone(session.student.launchBandCode)}
                isRetrying={Boolean(answerState?.needsRetry && answerState.explainer)}
                progressPercent={progressPercent}
                questionNumber={questionNumber}
                stars={progression?.totalPoints ?? 0}
                totalQuestions={session.questions.length}
                trophies={progression?.trophyCount ?? 0}
                voiceAvailable={voiceEnabled}
                onReplay={replayQuestion}
                onVisualOnly={() => setAssistMode("visual")}
              />
              {answerState?.milestones.leveledUp ? (
                <p className="status-banner status-success">Level up!</p>
              ) : null}
              {answerState?.milestones.badgeEarned ? (
                <p className="status-banner status-success">New badge!</p>
              ) : null}
              {answerState?.milestones.trophyEarned ? (
                <p className="status-banner status-success">New trophy!</p>
              ) : null}
              <div className="form-actions">
                <Link className="secondary-link" href="/child?manual=1">
                  Switch child
                </Link>
                <Link className="secondary-link" href="/parent">
                  Parent view
                </Link>
              </div>
            </>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
