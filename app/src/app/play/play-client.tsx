"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";
import { PlayBetaSupport, type AssistMode } from "./play-beta-support";
import { SpeakButton } from "@/components/speak-button";

// ── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  baseDeep: "#0a0820",
  surface: "#12103a",
  surface2: "#1a1540",
  border: "#2a2060",
  violet: "#9b72ff",
  mint: "#58e8c1",
  mintGreen: "#50e890",
  gold: "#ffd166",
  coral: "#ff7b6b",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  card: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.1)",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

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
  currentStreak: number;
  adaptiveQuestion: SessionQuestion | null;
  adaptiveAction: string | null;
  adaptiveMessage: string | null;
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

// ── Concept explainer ─────────────────────────────────────────────────────────
// Shown after a student exhausts retries on a question. The AI generates a
// grade-appropriate explanation + worked example + a check question, so the
// teacher can verify understanding before moving on.
type ConceptExplanation = {
  heading: string;
  explanation: string;
  workedExample: string;
  tip: string;
  checkQuestion: {
    text: string;
    options: string[];
    correctAnswer: string;
  };
};
type ExplainerPhase = "loading" | "reading" | "checking" | "understood" | "needs-help";

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    case "cat": return { icon: "🐱", helper: "cat" };
    case "bike": return { icon: "🚲", helper: "bike" };
    case "home": return { icon: "🏠", helper: "home" };
    case "goal": return { icon: "🥅", helper: "goal" };
    case "goat": return { icon: "🐐", helper: "goat" };
    case "gold": return { icon: "🥇", helper: "gold" };
    case "ball": return { icon: "⚽", helper: "ball" };
    case "bag": return { icon: "👜", helper: "bag" };
    case "bear": return { icon: "🐻", helper: "bear" };
    case "book": return { icon: "📘", helper: "book" };
    case "bell": return { icon: "🔔", helper: "bell" };
    case "bus": return { icon: "🚌", helper: "bus" };
    case "butterfly": return { icon: "🦋", helper: "butterfly" };
    case "bat": return { icon: "🦇", helper: "bat" };
    case "gap": return { icon: "🕳️", helper: "gap" };
    case "hat": return { icon: "🧢", helper: "hat" };
    case "jam": return { icon: "🍓", helper: "jam" };
    case "map": return { icon: "🗺️", helper: "map" };
    case "pan": return { icon: "🍳", helper: "pan" };
    case "sam": return { icon: "🧒", helper: "Sam" };
    case "cap": return { icon: "🧢", helper: "cap" };
    case "van": return { icon: "🚐", helper: "van" };
    case "net": return { icon: "🥅", helper: "net" };
    case "kick": return { icon: "🥾", helper: "kick" };
    case "team": return { icon: "👥", helper: "team" };
    case "time": return { icon: "⏰", helper: "time" };
    case "tent": return { icon: "⛺", helper: "tent" };
    case "planet": return { icon: "🪐", helper: "planet" };
    case "play": return { icon: "🎮", helper: "play" };
    case "earth": return { icon: "🌍", helper: "earth" };
    case "rocket": return { icon: "🚀", helper: "rocket" };
    case "run": return { icon: "🏃", helper: "run" };
    case "pass": return { icon: "🎯", helper: "pass" };
    default: return { icon: "✨", helper: answer };
  }
}

function isCountSkill(question: SessionQuestion) {
  return question.skill === "count-to-3" || question.skill === "count-to-5";
}

function isLetterSkill(question: SessionQuestion) {
  return question.skill === "letter-b-recognition" || question.skill === "letter-a-recognition";
}

function isShapeSkill(question: SessionQuestion) {
  return question.skill === "shape-circle" || question.skill === "shape-triangle";
}

function isShortASkill(question: SessionQuestion) {
  return (
    question.skill === "short-a-sound" ||
    question.skill === "short-e-sound" ||
    question.skill === "short-i-sound"
  );
}

function isAddToTenSkill(question: SessionQuestion) {
  return (
    question.skill === "add-to-10" ||
    question.skill === "subtract-from-10" ||
    question.skill === "number-bonds-to-5"
  );
}

function isReadSimpleWordSkill(question: SessionQuestion) {
  return (
    question.skill === "read-simple-word" ||
    question.skill === "decodable-cvc-word" ||
    question.skill === "sight-words-basic"
  );
}

function isBiggerSmallerSkill(question: SessionQuestion) {
  return question.skill === "bigger-smaller";
}

function isRhymeSkill(question: SessionQuestion) {
  return question.skill === "rhyme-match";
}

function isColorSkill(question: SessionQuestion) {
  return question.skill === "color-recognition";
}

function isComparisonSkill(question: SessionQuestion) {
  return question.skill === "compare-numbers";
}

function isSkipCountSkill(question: SessionQuestion) {
  return question.skill === "skip-count-by-5";
}

function isTimeSkill(question: SessionQuestion) {
  return question.skill === "time-to-hour";
}

function isCauseEffectSkill(question: SessionQuestion) {
  return (
    question.skill === "cause-effect" ||
    question.skill === "historical-cause-effect"
  );
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
          !["tap","the","letter","which","word","has","short","sound","pick","what","is","how","many","do","you","see","find","correct","a","an","of"].includes(word),
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
      helper: "Listen, then tap the matching letter.",
    } satisfies QuestionVisualScene;
  }

  if (isShapeSkill(question)) {
    const shapeName = question.skill === "shape-triangle" ? "triangle" : "circle";
    return {
      title: `Find the ${shapeName}`,
      helper: shapeName === "triangle" ? "Look for the shape with three points." : "Look for the round shape.",
    } satisfies QuestionVisualScene;
  }

  if (isShortASkill(question)) {
    const soundLabel =
      question.skill === "short-e-sound"
        ? "short e"
        : question.skill === "short-i-sound"
          ? "short i"
          : "short a";
    return {
      title: `Find the ${soundLabel} word`,
      helper: `Listen for the ${soundLabel} sound, then tap the match.`,
    } satisfies QuestionVisualScene;
  }

  if (isAddToTenSkill(question)) {
    const verbLabel =
      question.skill === "subtract-from-10"
        ? "Subtract and tap the answer"
        : question.skill === "number-bonds-to-5"
          ? "Find the pair that makes 5"
          : "Add and tap the total";
    return {
      title: verbLabel,
      helper: "Look at the numbers, then tap the answer.",
    } satisfies QuestionVisualScene;
  }

  if (isReadSimpleWordSkill(question)) {
    return {
      title: `Read the word ${question.correctAnswer}`,
      helper: "Look at each card, then tap the match.",
    } satisfies QuestionVisualScene;
  }

  if (isBiggerSmallerSkill(question)) {
    return {
      title: "Which is bigger?",
      helper: "Look at both groups and tap the bigger one.",
    } satisfies QuestionVisualScene;
  }

  if (isRhymeSkill(question)) {
    return {
      title: "Find the rhyme",
      helper: "Say the words out loud and tap the two that sound alike.",
    } satisfies QuestionVisualScene;
  }

  if (isColorSkill(question)) {
    return {
      title: "Find the color",
      helper: `Tap the card that shows ${question.correctAnswer.toLowerCase()}.`,
    } satisfies QuestionVisualScene;
  }

  if (isCauseEffectSkill(question)) {
    const isCausePrompt = /most likely cause|what caused|why did/i.test(question.prompt);
    return {
      title: isCausePrompt ? "Find the cause" : "Find the effect",
      helper: isCausePrompt
        ? "Ask what happened first, then choose what made it happen."
        : "Ask what happened because of the clue, then pick the result.",
    } satisfies QuestionVisualScene;
  }

  return null;
}

function buildSceneClass(question: SessionQuestion) {
  if (isCountSkill(question)) return "scene-count";
  if (isLetterSkill(question)) return "scene-letter";
  if (isShapeSkill(question)) return "scene-shape";
  if (isShortASkill(question)) return "scene-phonics";
  if (isAddToTenSkill(question)) return "scene-score";
  if (isReadSimpleWordSkill(question)) return "scene-reading";
  if (isBiggerSmallerSkill(question)) return "scene-count";
  if (isRhymeSkill(question)) return "scene-phonics";
  if (isColorSkill(question)) return "scene-shape";
  if (isCauseEffectSkill(question)) return "scene-reading";
  if (question.subject === "early-literacy") return "scene-letter";
  return "";
}

function buildQuestionTags(question: SessionQuestion, launchBandCode: string) {
  if (!isEarlyLearnerBand(launchBandCode)) {
    return [question.subject, question.skill, `difficulty ${question.difficulty}`, question.theme];
  }
  const tags = [];
  if (question.subject === "math" && question.skill.includes("count")) {
    tags.push("count together");
  } else if (question.subject === "early-literacy") {
    tags.push("letter time");
  } else {
    tags.push(question.subject.replace("-", " "));
  }
  if (question.theme === "animal-adventure") tags.push("animal adventure");
  tags.push(question.difficulty <= 1 ? "gentle start" : "next challenge");
  return tags;
}

function buildReadAloudText(question: SessionQuestion, scene: QuestionVisualScene | null) {
  const sceneLead = scene ? `${scene.title}. ${scene.helper}.` : "";
  const answers = question.answers.join(", ");
  return `${sceneLead} ${question.prompt} Let us go one step at a time. Choices are ${answers}.`;
}

function buildPromptCue(question: SessionQuestion, scene: QuestionVisualScene | null) {
  if (scene) return scene.helper;
  if (isCauseEffectSkill(question)) return "Look for what happened first and what happened because of it.";
  if (isShortASkill(question)) return "Say cat, then tap the word that sounds the same.";
  if (isAddToTenSkill(question)) return "Count up from six, then tap the total.";
  if (isReadSimpleWordSkill(question)) return `Read each card, then tap ${question.correctAnswer}.`;
  if (question.subject === "early-literacy") return "Listen first, then tap the right letter or word.";
  if (question.subject === "math") return "Look carefully and tap the answer you see.";
  return "Listen, look, and tap your choice.";
}

function buildCelebrationCopy(question: SessionQuestion) {
  if (question.subject === "math") {
    return { title: "Great counting!", body: "You found the right answer and kept your quest moving." };
  }
  if (question.subject === "early-literacy") {
    return { title: "Great listening!", body: "You heard the clue and tapped the right answer." };
  }
  return { title: "Great job!", body: "You got this one right and earned more quest points." };
}

function buildShortSupportLine(script: string) {
  const firstSentence = script.split(/[.!?]/).map((part) => part.trim()).find(Boolean);
  return firstSentence ? `${firstSentence}.` : script;
}

function buildCoachSteps(question: SessionQuestion) {
  if (isCountSkill(question)) {
    return ["Listen to the question.", "Count each picture one time.", "Tap the group that matches."];
  }
  if (isLetterSkill(question)) {
    return ["Listen for the letter sound.", `Look for the letter ${question.correctAnswer}.`, "Tap the matching card."];
  }
  if (isShapeSkill(question)) {
    return ["Look for the round shape.", "Find the one with no corners.", "Tap the circle card."];
  }
  if (isShortASkill(question)) {
    return ["Say cat with me.", "Listen for the short a sound.", "Tap the word that matches."];
  }
  if (isAddToTenSkill(question)) {
    return ["Start with six.", "Add four more.", "Tap the total."];
  }
  if (isReadSimpleWordSkill(question)) {
    return ["Look at the word cards.", `Find the word ${question.correctAnswer}.`, "Tap the matching card."];
  }
  if (isCauseEffectSkill(question)) {
    return ["Read the clue carefully.", "Decide what happened first.", "Tap the cause or effect that fits best."];
  }
  return ["Listen first.", "Look for the clue.", "Tap your best answer."];
}

function buildHintExplanation(question: SessionQuestion): { title: string; body: string } {
  if (isComparisonSkill(question)) {
    return {
      title: "Here's how to compare numbers 🔢",
      body: "Look at the biggest place first — hundreds, then tens, then ones. The number with more hundreds is bigger. If the hundreds match, check the tens!",
    };
  }
  if (isCountSkill(question)) {
    return {
      title: "Let's count together! 🐾",
      body: "Point to each picture and say one number as you go: 1, 2, 3… The last number you say is the answer!",
    };
  }
  if (isBiggerSmallerSkill(question)) {
    return {
      title: "Finding the bigger group 👀",
      body: "Count each group slowly. The group with more objects is the bigger one. Try counting out loud!",
    };
  }
  if (isLetterSkill(question)) {
    return {
      title: "Finding the right letter 🔤",
      body: "Say the letter sound out loud. Then look at each card and find the one that makes that same sound. You can do it!",
    };
  }
  if (isShapeSkill(question)) {
    return {
      title: "Shape detective time! 🔷",
      body: "Count the corners on each shape. A triangle has 3 corners, a square has 4, and a circle has zero. Which one fits?",
    };
  }
  if (isShortASkill(question)) {
    const soundLabel =
      question.skill === "short-e-sound" ? "short e (like in 'bed')"
      : question.skill === "short-i-sound" ? "short i (like in 'sit')"
      : "short a (like in 'cat')";
    return {
      title: "Listen for the vowel sound 👂",
      body: `Say each word slowly in your head. Listen for the ${soundLabel} sound. Which word has it?`,
    };
  }
  if (isAddToTenSkill(question)) {
    if (question.skill === "subtract-from-10") {
      return {
        title: "How to subtract 🧮",
        body: "Start with the bigger number and count backwards. Hold up fingers to help — take away one at a time!",
      };
    }
    return {
      title: "How to add numbers 🧮",
      body: "Start with the first number and count up by the second. You can use your fingers — each finger is one more!",
    };
  }
  if (isSkipCountSkill(question)) {
    return {
      title: "Skip counting by 5s 🖐",
      body: "Count by fives: 5, 10, 15, 20… Each jump is 5 more. Say them out loud with your hand!",
    };
  }
  if (isTimeSkill(question)) {
    return {
      title: "Reading a clock 🕐",
      body: "The short hand points to the hour. The long hand points to 12 for exactly on the hour. What hour does the short hand point to?",
    };
  }
  if (isReadSimpleWordSkill(question)) {
    return {
      title: "Sound it out! 📖",
      body: "Look at the first letter and say its sound. Then blend the sounds together slowly. Which card matches the word?",
    };
  }
  if (isRhymeSkill(question)) {
    return {
      title: "Finding rhymes 🎵",
      body: "Rhyming words end with the same sound — like 'cat' and 'hat'. Say each word out loud. Which two sound the same at the end?",
    };
  }
  if (isColorSkill(question)) {
    return {
      title: "Look for the color! 🎨",
      body: "Look at each card carefully. Which one shows the color you're looking for? Trust your eyes!",
    };
  }
  if (isCauseEffectSkill(question)) {
    const isCause = /most likely cause|what caused|why did/i.test(question.prompt);
    return {
      title: isCause ? "Finding the cause 🔍" : "Finding the effect 🔍",
      body: isCause
        ? "A cause is WHY something happened — it comes first. Read each choice and ask: 'Could this have made it happen?'"
        : "An effect is WHAT happened because of something. Read the story and ask: 'What would happen next because of this?'",
    };
  }
  if (question.subject === "math") {
    return {
      title: "Let's think through it 🧠",
      body: "Read the question slowly out loud — hearing it can help! Then look at each answer and ask yourself which one makes sense.",
    };
  }
  return {
    title: "Let's figure it out together 💡",
    body: "Read the question one more time, slowly. Look at each answer choice carefully. Which one feels right? Trust yourself!",
  };
}

function buildCoachCopy(
  question: SessionQuestion,
  scene: QuestionVisualScene | null,
  mode: "listen" | "clue" | "support",
) {
  if (mode === "clue") return buildHintExplanation(question);
  if (mode === "support") {
    return { title: "It is okay to need help.", body: "We can slow down, listen again, and do one small step at a time." };
  }
  return { title: "Let us listen together.", body: "Hear it slowly, then look carefully before you tap." };
}

function buildWelcomeBackCopy(
  displayName: string,
  launchBandCode: string,
  progression: SessionPayload["progression"] | null,
) {
  if (launchBandCode === "PREK") {
    return { title: `Welcome back, ${displayName}!`, body: "Stars saved. Ready to go." };
  }
  if (launchBandCode === "K1") {
    return { title: `Welcome back, ${displayName}!`, body: "Points and badges are right where you left them." };
  }
  return {
    title: `Welcome back, ${displayName}.`,
    body: `${progression?.totalPoints ?? 0} pts · ${progression?.badgeCount ?? 0} badges · ${progression?.trophyCount ?? 0} trophies`,
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
      body: earlyLearnerMode ? `🏆 ×${progression?.trophyCount ?? 1}` : `${progression?.trophyCount ?? 1} trophies total`,
    } satisfies RewardOverlay;
  }
  if (answerState.milestones.badgeEarned) {
    return {
      tone: "violet",
      emoji: "🏅",
      title: "New badge!",
      body: earlyLearnerMode ? `🏅 ×${progression?.badgeCount ?? 1}` : `${progression?.badgeCount ?? 1} badges total`,
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
    return { tone: "mint", emoji: "⭐", title: "You got it!", body: "⭐ Keep going!" } satisfies RewardOverlay;
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

function pickChildVoice(voices: SpeechSynthesisVoice[], launchBandCode: string) {
  const soothingMatches = ["samantha","ava","allison","serena","karen","moira","fiona","tessa","ellie","jenny","aria","salli"];
  const roboticHints = ["google","fred","junior","news"];
  return [...voices].sort((left, right) => {
    function scoreVoice(voice: SpeechSynthesisVoice) {
      let score = /^en/i.test(voice.lang) ? 24 : 0;
      const lowerName = voice.name.toLowerCase();
      if (voice.localService) score += 8;
      if (voice.default) score += 2;
      if (soothingMatches.some((item) => lowerName.includes(item))) score += 30;
      if (roboticHints.some((item) => lowerName.includes(item))) score -= 12;
      if (launchBandCode === "PREK" && lowerName.includes("samantha")) score += 6;
      return score;
    }
    return scoreVoice(right) - scoreVoice(left);
  })[0];
}

function getVoiceSettings(launchBandCode: string, intent: "prompt" | "support") {
  if (launchBandCode === "PREK") return intent === "prompt" ? { rate: 0.78, pitch: 1.02 } : { rate: 0.74, pitch: 1.0 };
  if (launchBandCode === "K1") return intent === "prompt" ? { rate: 0.86, pitch: 1.0 } : { rate: 0.82, pitch: 0.98 };
  return intent === "prompt" ? { rate: 0.92, pitch: 1.0 } : { rate: 0.88, pitch: 0.98 };
}

function renderAnswerContent(question: SessionQuestion, answer: string, compact = false, preK = false) {
  if (isCountSkill(question) && /^\d+$/.test(answer)) {
    return (
      <>
        <div className="answer-visual-stack">
          <div className={preK ? "answer-token-row answer-token-row--prek" : "answer-token-row"} aria-hidden="true">
            {Array.from({ length: Number(answer) }, (_, index) => (
              <span className={preK ? "answer-token answer-token--prek" : "answer-token"} key={`${answer}-${index}`}>{getCountSceneToken(question)}</span>
            ))}
          </div>
          {!preK && <strong>{answer}</strong>}
        </div>
        {!compact && !preK ? <small>Count the pictures, then tap the matching group.</small> : null}
      </>
    );
  }
  if (isShapeSkill(question)) {
    return (
      <>
        <div className="answer-visual-stack">
          <span className={preK ? `shape-preview shape-preview--prek shape-${answer}` : `shape-preview shape-${answer}`} aria-hidden="true" />
          {!preK && <strong>{answer}</strong>}
        </div>
        {!compact && !preK ? <small>Tap the shape you hear.</small> : null}
      </>
    );
  }
  if (isLetterSkill(question)) {
    // Letter IS the visual — keep it, just make it larger for pre-K
    return (
      <>
        <div className="answer-visual-stack">
          <span className={preK ? "letter-preview letter-preview--prek" : "letter-preview"} aria-hidden="true">{answer}</span>
        </div>
        {!compact && !preK ? <small>Tap the letter you hear.</small> : null}
      </>
    );
  }
  if (isShortASkill(question) || isReadSimpleWordSkill(question)) {
    const preview = getWordPreview(answer);
    return (
      <>
        <div className="answer-visual-stack">
          <span className={preK ? "emoji-scene-token emoji-scene-token--prek" : "emoji-scene-token"} aria-hidden="true">{preview.icon}</span>
          {!preK && <strong>{answer}</strong>}
        </div>
        {!compact && !preK ? <small>{preview.helper}</small> : null}
      </>
    );
  }
  if (/^\d+$/.test(answer)) {
    return (
      <>
        <div className="answer-visual-stack">
          <span className={preK ? "number-preview number-preview--prek" : "number-preview"} aria-hidden="true">{answer}</span>
        </div>
        {!compact && !preK ? <small>Tap to lock in this answer.</small> : null}
      </>
    );
  }
  return (
    <>
      <strong>{answer}</strong>
      {!preK && <small>Tap to lock in this answer.</small>}
    </>
  );
}

function buildAnswerCardVariant(question: SessionQuestion) {
  if (isCountSkill(question) || isBiggerSmallerSkill(question) || isSkipCountSkill(question) || isComparisonSkill(question)) return "count";
  if (isAddToTenSkill(question) || isTimeSkill(question)) return "count";
  if (isLetterSkill(question)) return "letter";
  if (isShortASkill(question) || isRhymeSkill(question)) return "picture";
  if (isShapeSkill(question) || isColorSkill(question)) return "shape";
  if (isReadSimpleWordSkill(question)) return "picture";
  if (question.subject === "early-literacy") return "picture";
  if (/^\d+$/.test(question.answers[0] ?? "")) return "count";
  return "standard";
}

function buildAnswerTapCue(question: SessionQuestion) {
  if (isCountSkill(question)) return "Tap the group that matches.";
  if (isLetterSkill(question)) return "Tap the letter you hear.";
  if (isShortASkill(question)) {
    const sound = question.skill === "short-e-sound" ? "net" : question.skill === "short-i-sound" ? "sit" : "cat";
    return `Tap the word that sounds like ${sound}.`;
  }
  if (isShapeSkill(question)) {
    const shape = question.skill === "shape-triangle" ? "triangle" : "circle";
    return `Tap the ${shape}.`;
  }
  if (isAddToTenSkill(question)) {
    if (question.skill === "subtract-from-10") return "Tap the number left.";
    if (question.skill === "number-bonds-to-5") return "Tap the missing part.";
    return "Tap the total.";
  }
  if (isReadSimpleWordSkill(question)) return `Tap the word ${question.correctAnswer}.`;
  if (isBiggerSmallerSkill(question)) return "Tap the bigger group.";
  if (isRhymeSkill(question)) return "Tap the word that rhymes.";
  if (isColorSkill(question)) return `Tap ${question.correctAnswer.toLowerCase()}.`;
  if (isCauseEffectSkill(question)) {
    return /most likely cause|what caused|why did/i.test(question.prompt)
      ? "Tap the answer that explains why it happened."
      : "Tap the answer that shows what happened because of it.";
  }
  if (isSkipCountSkill(question)) return "Tap the next number in the pattern.";
  if (isComparisonSkill(question)) return "Tap the correct comparison.";
  if (isTimeSkill(question)) return "Tap the clock that shows the right time.";
  if (question.subject === "early-literacy") return "Tap the picture or letter that matches.";
  if (question.subject === "math") return "Tap the answer.";
  return "Tap your answer.";
}

function buildQuestNodeLabel(question: SessionQuestion) {
  if (isCountSkill(question)) return "Count";
  if (isLetterSkill(question)) return "Letter";
  if (isShapeSkill(question)) return "Shape";
  if (isShortASkill(question)) return "Sound";
  if (isAddToTenSkill(question)) return question.skill === "subtract-from-10" ? "Subtract" : "Add";
  if (isReadSimpleWordSkill(question)) return "Read";
  if (isBiggerSmallerSkill(question)) return "Compare";
  if (isRhymeSkill(question)) return "Rhyme";
  if (isColorSkill(question)) return "Color";
  if (isSkipCountSkill(question)) return "Count";
  if (isComparisonSkill(question)) return "Compare";
  if (isTimeSkill(question)) return "Time";
  if (isCauseEffectSkill(question)) return "Cause";
  if (question.subject === "math") return "Math";
  if (question.subject === "early-literacy") return "Word";
  if (question.subject === "reading") return "Read";
  return "Quest";
}

function buildQuestNodeIcon(question: SessionQuestion) {
  if (isCountSkill(question)) return getCountSceneToken(question);
  if (isLetterSkill(question)) return "🔤";
  if (isShapeSkill(question)) return question.skill === "shape-triangle" ? "🔺" : "⭕";
  if (isShortASkill(question)) return question.skill === "short-e-sound" ? "🦁" : question.skill === "short-i-sound" ? "🐝" : "🐱";
  if (isAddToTenSkill(question)) return question.skill === "subtract-from-10" ? "➖" : "⚽";
  if (isReadSimpleWordSkill(question)) return "📖";
  if (isBiggerSmallerSkill(question)) return "⚖️";
  if (isRhymeSkill(question)) return "🎵";
  if (isColorSkill(question)) return "🎨";
  if (isSkipCountSkill(question)) return "5️⃣";
  if (isComparisonSkill(question)) return "⚖️";
  if (isTimeSkill(question)) return "🕐";
  if (isCauseEffectSkill(question)) return "↪️";
  if (question.subject === "math") return "🔢";
  if (question.subject === "early-literacy") return "📚";
  if (question.subject === "reading") return "🪐";
  return "⭐";
}

function formatQuestLabel(value: string | null | undefined) {
  if (!value) return "Quest";
  return value.split(/[-_]+/).filter(Boolean).map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join(" ");
}

function buildQuestWorldLabel(launchBandCode: string) {
  switch (launchBandCode) {
    case "PREK": return "Animal Adventure";
    case "K1": return "Violet Trail";
    case "G23": return "Orbit Trail";
    case "G45": return "Builder Summit";
    default: return "WonderQuest";
  }
}

function buildSupportTone(launchBandCode: string) {
  switch (launchBandCode) {
    case "PREK": return "gold";
    case "K1": return "violet";
    case "G23": return "mint";
    case "G45": return "coral";
    default: return "violet";
  }
}

function buildQuestNodes(questions: SessionQuestion[], currentIndex: number, finished: boolean) {
  return questions.map((question, index) => {
    let state: QuestNodeState = "locked";
    if (finished) {
      state = index === questions.length - 1 ? "just-completed" : "done";
    } else if (index < currentIndex) {
      state = "done";
    } else if (index === currentIndex) {
      state = "current";
    }
    return { key: question.questionKey, label: buildQuestNodeLabel(question), icon: buildQuestNodeIcon(question), state } satisfies QuestNode;
  });
}

function buildNextQuestTeaser(launchBandCode: string) {
  switch (launchBandCode) {
    case "PREK": return { title: "Next: Number Garden", body: "More counting and letters." };
    case "K1": return { title: "Next: Violet Trail", body: "More words and quick wins." };
    case "G23": return { title: "Next: Orbit Trail", body: "Bigger reading and logic." };
    case "G45": return { title: "Next: Builder Summit", body: "Stronger puzzles ahead." };
    default: return { title: "Next quest ready", body: "Fresh challenge waiting." };
  }
}

function buildCompletionMoment(answerState: AnswerPayload | null, earlyLearnerMode: boolean) {
  if (answerState?.milestones.trophyEarned) {
    return { title: earlyLearnerMode ? "Big trophy moment!" : "Trophy unlocked.", body: earlyLearnerMode ? "🏆 Trophy earned!" : "Added to progression.", emoji: "🏆" };
  }
  if (answerState?.milestones.badgeEarned) {
    return { title: earlyLearnerMode ? "Badge earned!" : "New badge earned.", body: earlyLearnerMode ? "🏅 Badge earned!" : "Added to collection.", emoji: "🏅" };
  }
  return { title: earlyLearnerMode ? "Quest path complete!" : "Session path complete.", body: earlyLearnerMode ? "All steps done! ⭐" : "Next route is ready.", emoji: "⭐" };
}

function buildQuestionStageLabel(question: SessionQuestion, scene: QuestionVisualScene | null) {
  if (scene?.title) return scene.title;
  if (isReadSimpleWordSkill(question)) return "Which word matches the picture?";
  if (isCauseEffectSkill(question)) {
    return /most likely cause|what caused|why did/i.test(question.prompt)
      ? "Choose what caused it"
      : "Choose what happened next";
  }
  if (isShortASkill(question)) return "Which word has the matching sound?";
  if (isAddToTenSkill(question)) {
    if (question.skill === "subtract-from-10") return "Subtract and tap the answer";
    if (question.skill === "number-bonds-to-5") return "Find the pair that makes 5";
    return "Add and tap the total";
  }
  if (question.subject === "math") return "Solve the math problem";
  if (question.subject === "early-literacy") return "Look and tap the match";
  return "Choose the best answer";
}

function renderQuestionStageVisual(
  question: SessionQuestion,
  scene: QuestionVisualScene | null,
  isAnsweredCorrect: boolean,
) {
  const frameStyle = {
    ...s.questImage,
    ...(isAnsweredCorrect
      ? {
          borderColor: C.mintGreen,
          background: "linear-gradient(135deg, #1a3a20, #2a5a30)",
          boxShadow: "0 0 28px rgba(80,232,144,0.2)",
        }
      : {}),
  };

  if (scene?.tokens?.length) {
    return (
      <div style={frameStyle}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap" as const,
            gap: 6,
            alignItems: "center",
            justifyContent: "center",
            padding: 10,
            maxWidth: 104,
          }}
        >
          {scene.tokens.map((token, index) => (
            <span key={`${question.questionKey}-${index}`} style={{ fontSize: 20 }} aria-hidden="true">
              {token}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (isAddToTenSkill(question)) {
    const values = (question.prompt.match(/\d+/g) ?? [])
      .slice(0, 2)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value >= 0);
    const left = values[0] ?? 0;
    const right = values[1] ?? 0;
    const operator = question.skill === "subtract-from-10" ? "−" : "+";

    return (
      <div style={frameStyle}>
        <div
          style={{
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: 10,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, justifyContent: "center" }}>
            {Array.from({ length: left }, (_, index) => (
              <span key={`left-${index}`} style={{ fontSize: 15 }} aria-hidden="true">⭐</span>
            ))}
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: C.gold }} aria-hidden="true">{operator}</span>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, justifyContent: "center" }}>
            {Array.from({ length: right }, (_, index) => (
              <span key={`right-${index}`} style={{ fontSize: 15 }} aria-hidden="true">⭐</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isReadSimpleWordSkill(question) || isShortASkill(question)) {
    const preview = getWordPreview(question.correctAnswer);
    return (
      <div style={frameStyle}>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 52 }} aria-hidden="true">{preview.icon}</span>
          <small style={{ fontSize: 12, color: C.text, fontWeight: 800 }}>{preview.helper}</small>
        </div>
      </div>
    );
  }

  if (isCauseEffectSkill(question)) {
    const isCausePrompt = /most likely cause|what caused|why did/i.test(question.prompt);
    return (
      <div style={frameStyle}>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 44, lineHeight: 1 }} aria-hidden="true">{isCausePrompt ? "↩️" : "➡️"}</span>
          <small style={{ fontSize: 12, color: C.text, fontWeight: 800 }}>
            {isCausePrompt ? "find the cause" : "find the effect"}
          </small>
        </div>
      </div>
    );
  }

  if (isLetterSkill(question)) {
    return (
      <div style={frameStyle}>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 54, fontWeight: 900, color: "#fff" }} aria-hidden="true">
            {question.correctAnswer}
          </span>
          <small style={{ fontSize: 12, color: C.text, fontWeight: 800 }}>letter clue</small>
        </div>
      </div>
    );
  }

  return (
    <div style={frameStyle}>
      <span aria-hidden="true">{buildQuestNodeIcon(question)}</span>
    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────────────────────

const s = {
  shell: {
    background: C.base,
    borderRadius: 20,
    border: `2px solid ${C.border}`,
    overflow: "hidden" as const,
    minHeight: 600,
    display: "flex",
    flexDirection: "column" as const,
    position: "relative" as const,
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    flexShrink: 0,
    flexWrap: "wrap" as const,
  },
  backBtn: {
    background: "transparent",
    border: `2px solid ${C.border}`,
    borderRadius: 8,
    color: C.muted,
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 700,
    padding: "5px 12px",
    cursor: "pointer",
    flexShrink: 0,
  } as const,
  questName: {
    fontSize: 14,
    fontWeight: 900,
    color: C.text,
  },
  questSub: {
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },
  starCounter: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: C.surface2,
    border: `2px solid ${C.border}`,
    borderRadius: 10,
    padding: "6px 12px",
    fontSize: 14,
    fontWeight: 900,
    color: C.gold,
    flexShrink: 0,
  },
  pauseBtn: {
    background: "transparent",
    border: `2px solid ${C.border}`,
    borderRadius: 8,
    color: C.muted,
    fontSize: 16,
    width: 36,
    height: 36,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  } as const,
  progressStrip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flex: 1,
    flexWrap: "wrap" as const,
  },
  playMain: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: 0,
    minHeight: 400,
  },
  questionZone: {
    padding: "32px 32px 20px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    borderRight: `1px solid ${C.surface}`,
    overflowY: "auto" as const,
  },
  questLabel: {
    fontSize: 11,
    fontWeight: 900,
    color: C.muted,
    textTransform: "uppercase" as const,
    letterSpacing: "1.5px",
    marginBottom: 14,
    textAlign: "center" as const,
  },
  questImage: {
    width: 120,
    height: 120,
    background: `linear-gradient(135deg, #1e1470, #2a1060)`,
    borderRadius: 20,
    border: `3px solid ${C.violet}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 60,
    marginBottom: 16,
    boxShadow: `0 0 24px rgba(155,114,255,0.2)`,
    flexShrink: 0,
  },
  questPrompt: {
    fontSize: 20,
    fontWeight: 900,
    color: C.text,
    textAlign: "center" as const,
    marginBottom: 6,
  },
  questPromptSub: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center" as const,
    marginBottom: 20,
  },
  answerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    width: "100%",
    maxWidth: 440,
    marginTop: 4,
  },
  answerCard: (isSelected: boolean, isCorrect: boolean | null, isWrong: boolean) => ({
    background: isCorrect ? "#1a3a20" : isWrong ? "#2a1010" : "rgba(155,114,255,0.1)",
    border: `2.5px solid ${isCorrect ? C.mintGreen : isWrong ? C.coral : "rgba(155,114,255,0.35)"}`,
    borderRadius: 14,
    padding: "14px 12px",
    textAlign: "center" as const,
    cursor: isSelected ? "default" : "pointer",
    fontSize: 15,
    fontWeight: 900,
    color: isCorrect ? C.mintGreen : isWrong ? C.coral : "#e8e0ff",
    transition: "border-color 0.15s, transform 0.15s, background 0.15s",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
    minHeight: 72,
    justifyContent: "center" as const,
    fontFamily: "inherit",
    touchAction: "manipulation" as const,
    WebkitTapHighlightColor: "transparent",
  }),
  rail: {
    padding: "20px 16px",
    background: "#0e0c2a",
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
    overflowY: "auto" as const,
  },
  railSectionTitle: {
    fontSize: 10,
    fontWeight: 900,
    color: C.muted,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: 6,
  },
  mascotCard: {
    background: C.surface,
    border: `2px solid ${C.border}`,
    borderRadius: 14,
    padding: 12,
    textAlign: "center" as const,
  },
  mascotAvatar: {
    fontSize: 32,
    marginBottom: 6,
    display: "block",
  },
  mascotSpeech: (isWrong: boolean) => ({
    background: C.surface2,
    border: `2px solid ${isWrong ? `${C.coral}44` : C.border}`,
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 700,
    color: isWrong ? "#ff8888" : "#c4b0ff",
    textAlign: "left" as const,
    marginTop: 6,
  }),
  progressCard: {
    background: C.surface,
    border: `2px solid ${C.border}`,
    borderRadius: 14,
    padding: 12,
  },
  progressBar: {
    height: 8,
    background: C.surface2,
    borderRadius: 4,
    overflow: "hidden" as const,
    marginBottom: 6,
    marginTop: 6,
  },
  progressFill: (pct: number) => ({
    height: "100%",
    borderRadius: 4,
    background: `linear-gradient(90deg, ${C.violet}, ${C.mint})`,
    width: `${pct}%`,
    transition: "width 0.4s ease",
  }),
  starSafeBadge: {
    background: "#1a2a15",
    border: `2px solid ${C.mintGreen}`,
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 700,
    color: C.mintGreen,
    textAlign: "center" as const,
  },
  bottomBar: {
    padding: "10px 20px",
    paddingBottom: "env(safe-area-inset-bottom, 20px)",
    background: C.surface,
    borderTop: `1px solid ${C.surface2}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    gap: 8,
    flexWrap: "wrap" as const,
  },
  audioBtn: (active: boolean) => ({
    background: C.surface2,
    border: `2px solid ${active ? C.violet : C.border}`,
    borderRadius: 10,
    color: active ? C.violet : C.muted,
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    minHeight: 48,
    minWidth: 48,
    touchAction: "manipulation" as const,
  }),
  hintBtn: (highlighted: boolean) => ({
    background: "transparent",
    border: `2px solid ${highlighted ? C.violet : C.border}`,
    borderRadius: 10,
    color: highlighted ? C.violet : C.muted,
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 14px",
    cursor: "pointer",
    minHeight: 48,
    minWidth: 48,
    touchAction: "manipulation" as const,
  }),
  idkBtn: {
    background: "transparent",
    border: `2px solid ${C.coral}44`,
    borderRadius: 10,
    color: C.coral,
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 14px",
    cursor: "pointer",
    minHeight: 48,
    minWidth: 48,
    touchAction: "manipulation" as const,
  },
  // Correct answer panel
  correctPanel: {
    background: "radial-gradient(ellipse at 50% 0%, rgba(80,232,144,0.08) 0%, transparent 70%)",
    borderRadius: 14,
    border: `2px solid ${C.mintGreen}`,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    width: "100%",
    maxWidth: 440,
  },
  correctLabel: {
    fontSize: 14,
    fontWeight: 900,
    color: C.mintGreen,
    letterSpacing: "0.5px",
  },
  pointsBadge: {
    background: "#1a3a20",
    border: `2px solid ${C.mintGreen}`,
    borderRadius: 14,
    padding: "8px 18px",
    fontSize: 16,
    fontWeight: 900,
    color: C.mintGreen,
  },
  nextBtn: {
    background: `linear-gradient(135deg, ${C.violet}, #7c4dff)`,
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 900,
    padding: "12px 28px",
    cursor: "pointer",
    marginTop: 4,
  },
  // Wrong answer hint
  wrongHint: {
    background: "#2a1010",
    border: `2px solid ${C.coral}44`,
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    color: C.coral,
    fontWeight: 700,
    textAlign: "center" as const,
    width: "100%",
    maxWidth: 440,
    marginTop: 12,
  },
  // Session complete
  completeShell: {
    background: C.base,
    borderRadius: 20,
    border: `2px solid ${C.border}`,
    overflow: "hidden" as const,
    position: "relative" as const,
    minHeight: 480,
  },
  completeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    minHeight: 480,
  },
  completeHero: {
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 20,
    borderRight: `1px solid #1e1850`,
    justifyContent: "center",
  },
  completeSummary: {
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
    background: "#0e0a28",
  },
  statRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    background: C.surface2,
    border: `1.5px solid ${C.border}`,
    borderRadius: 12,
  },
  // Loading skeleton
  loadingShell: {
    background: C.base,
    borderRadius: 20,
    border: `2px solid ${C.border}`,
    padding: "32px 24px",
    minHeight: 400,
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    alignItems: "stretch",
  },
  skeletonLine: (w: string, h: number) => ({
    background: C.surface2,
    borderRadius: 8,
    width: w,
    height: h,
    animation: "none",
    opacity: 0.6,
  }),
  // Reward overlay
  rewardOverlay: (tone: "mint" | "gold" | "violet") => ({
    position: "fixed" as const,
    inset: 0,
    zIndex: 100,
    background:
      tone === "gold"
        ? "rgba(10,8,20,0.88)"
        : tone === "violet"
          ? "rgba(10,8,20,0.88)"
          : "rgba(10,8,20,0.88)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "none",
    width: "100%",
  }),
  rewardCard: (tone: "mint" | "gold" | "violet") => ({
    background:
      tone === "gold" ? "#1a1000" : tone === "violet" ? "#1a1040" : "#0d2a1a",
    border: `3px solid ${tone === "gold" ? C.gold : tone === "violet" ? C.violet : C.mintGreen}`,
    borderRadius: 24,
    padding: "32px 48px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 12,
    boxShadow: `0 0 60px ${tone === "gold" ? `${C.gold}33` : tone === "violet" ? `${C.violet}33` : `${C.mintGreen}33`}`,
  }),
};

// ── Progress dot component ────────────────────────────────────────────────────

function ProgressDot({
  state,
}: {
  state: "done" | "active" | "pending";
}) {
  const base: React.CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
    background:
      state === "done"
        ? C.mintGreen
        : state === "active"
          ? C.violet
          : C.border,
  };
  return <span style={base} />;
}

// ── Main component ────────────────────────────────────────────────────────────

function PlayClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionMode = searchParams.get("sessionMode") ?? "guided-quest";
  const chosenQuestId = searchParams.get("chosenQuestId") ?? undefined;
  const chosenQuestTable = searchParams.get("chosenQuestTable") ?? undefined;
  const entryMode = searchParams.get("entry") ?? "new";
  const returningEntry = entryMode === "returning";

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [progression, setProgression] = useState<SessionPayload["progression"] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [eliminatedAnswers, setEliminatedAnswers] = useState<string[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dailyLimitInfo, setDailyLimitInfo] = useState<{ childName: string; sessionsToday: number; limit: number; isGuest: boolean } | null>(null);
  const [answerState, setAnswerState] = useState<AnswerPayload | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [assistMode, setAssistMode] = useState<AssistMode>("voice");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachMode, setCoachMode] = useState<"listen" | "clue" | "support">("listen");
  const [playedWelcomeVoice, setPlayedWelcomeVoice] = useState(false);
  const [rewardOverlay, setRewardOverlay] = useState<RewardOverlay | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [sessionPointsEarned, setSessionPointsEarned] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  // Concept explainer state
  const [conceptExplanation, setConceptExplanation] = useState<ConceptExplanation | null>(null);
  const [explainerPhase, setExplainerPhase] = useState<ExplainerPhase | null>(null);
  const [checkAnswer, setCheckAnswer] = useState<string | null>(null);

  const voiceSupportRef = useRef(false);
  const assistModeRef = useRef<AssistMode>("voice");
  assistModeRef.current = assistMode;

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

    const syncVoices = () => { setAvailableVoices(window.speechSynthesis.getVoices()); };
    syncVoices();
    window.speechSynthesis.addEventListener("voiceschanged", syncVoices);
    return () => { window.speechSynthesis.removeEventListener("voiceschanged", syncVoices); };
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      setLoading(true);
      setError("");

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        let response: Response;
        try {
          response = await fetch("/api/play/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionMode, chosenQuestId, chosenQuestTable }),
            signal: controller.signal,
          });
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
          throw new Error(isTimeout ? "Session request timed out. Please go back and try again." : "Network error starting session.");
        }
        clearTimeout(timeoutId);

        const payload = (await response.json()) as SessionPayload & { error?: string; sessionsToday?: number; limit?: number; is_guest?: boolean };

        if (response.status === 403 && payload.error === "daily_limit_reached") {
          if (!active) return;
          setDailyLimitInfo({
            childName: "",
            sessionsToday: payload.sessionsToday ?? 3,
            limit: payload.limit ?? 3,
            isGuest: payload.is_guest ?? false,
          });
          setLoading(false);
          return;
        }
        if (!response.ok) throw new Error(payload.error ?? "Could not start session.");
        if (!active) return;

        setSession(payload);
        setProgression(payload.progression);
        // Pre-K kids can't read — always default to picture-only mode
        setAssistMode(payload.student.launchBandCode === "PREK" ? "visual" : voiceSupportRef.current ? "voice" : "visual");
        setIsSpeaking(false);
        setCoachMode("listen");
        setPlayedWelcomeVoice(false);
        setRewardOverlay(null);
        setQuestionStartedAt(Date.now());
        setCorrectCount(0);
        setTotalAnswered(0);
        setSessionPointsEarned(0);
      } catch (caughtError) {
        if (!active) return;
        setError(caughtError instanceof Error ? caughtError.message : "Could not start session.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrapSession();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionMode, sessionKey]);

  const currentQuestion = useMemo(() => session?.questions[currentIndex] ?? null, [currentIndex, session]);
  const currentScene = useMemo(() => (currentQuestion ? buildQuestionVisualScene(currentQuestion) : null), [currentQuestion]);

  function speakText(text: string, intent: "prompt" | "support" = "prompt") {
    if (!voiceEnabled || !session || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    const utterance = new window.SpeechSynthesisUtterance(text);
    const voice = pickChildVoice(availableVoices, session.student.launchBandCode);
    const settings = getVoiceSettings(session.student.launchBandCode, intent);
    if (voice) utterance.voice = voice;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 0.92;
    utterance.lang = "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    try { window.speechSynthesis.speak(utterance); } catch { setIsSpeaking(false); }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!session || !currentQuestion || !voiceEnabled) return;
    if (!isEarlyLearnerBand(session.student.launchBandCode)) return;
    if (assistModeRef.current === "visual") return;
    speakText(buildReadAloudText(currentQuestion, currentScene), assistModeRef.current === "slow" ? "support" : "prompt");
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, currentScene, session, voiceEnabled, availableVoices]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!answerState?.needsRetry || !answerState.explainer || !voiceEnabled) return;
    if (assistModeRef.current === "visual") return;
    speakText(answerState.explainer.script, "support");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerState, voiceEnabled, availableVoices]);

  useEffect(() => {
    if (!session || !answerState?.correct) return;
    const overlay = buildRewardOverlay(answerState, isEarlyLearnerBand(session.student.launchBandCode), progression);
    setRewardOverlay(overlay);
  }, [answerState, progression, session]);

  useEffect(() => {
    if (!rewardOverlay) return;
    const timeoutId = window.setTimeout(() => { setRewardOverlay(null); }, 2500);
    return () => window.clearTimeout(timeoutId);
  }, [rewardOverlay]);

  useEffect(() => {
    if (!session || !voiceEnabled || !returningEntry || playedWelcomeVoice) return;
    if (!isEarlyLearnerBand(session.student.launchBandCode)) return;
    if (assistModeRef.current === "visual") return;
    const welcomeBackCopy = buildWelcomeBackCopy(session.student.displayName, session.student.launchBandCode, progression);
    speakText(`${welcomeBackCopy.title} ${welcomeBackCopy.body}`, "support");
    setPlayedWelcomeVoice(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableVoices, playedWelcomeVoice, progression, returningEntry, session, voiceEnabled]);

  async function submitAnswer(answer: string) {
    if (!session || !currentQuestion) return;
    setSubmitting(true);
    setError("");
    setSelectedAnswer(answer);
    const sessionId = session.sessionId;
    const questionKey = currentQuestion.questionKey;

    function isRetryablePlayError(message: string) {
      const normalized = message.toLowerCase();

      return (
        normalized.includes("timeout") ||
        normalized.includes("connect") ||
        normalized.includes("network") ||
        normalized.includes("connection hiccup") ||
        normalized.includes("stale connection")
      );
    }

    // Kids sometimes take a long time on a question; the DB connection may
    // have gone stale. Retry the POST up to 2 times before showing an error.
    async function attemptPost(retriesLeft: number): Promise<AnswerPayload> {
      try {
        const response = await fetch("/api/play/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            questionKey,
            answer,
            attempt,
            timeSpentMs: Date.now() - questionStartedAt,
          }),
        });

        const payload = (await response.json()) as AnswerPayload & { error?: string };

        if (!response.ok) {
          const errorMessage = payload.error ?? "Could not submit answer.";

          if (retriesLeft > 0 && isRetryablePlayError(errorMessage)) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            return attemptPost(retriesLeft - 1);
          }

          throw new Error(errorMessage);
        }

        return payload;
      } catch (fetchErr) {
        if (retriesLeft <= 0) throw fetchErr;
        await new Promise((r) => setTimeout(r, 1200));
        return attemptPost(retriesLeft - 1);
      }
    }

    try {
      const payload = await attemptPost(2);

      setAnswerState(payload);
      setProgression(payload.progression);

      // Track session-level stats for the completion screen.
      if (payload.correct) {
        setCorrectCount((prev) => prev + 1);
        setTotalAnswered((prev) => prev + 1);
        setSessionPointsEarned((prev) => prev + (payload.pointsEarned ?? 0));
      } else if (!payload.needsRetry) {
        // Only increment totalAnswered on final wrong answer (not retry state)
        setTotalAnswered((prev) => prev + 1);
        // Trigger concept explanation — the AI teacher will explain the concept
        // and serve a check question before moving to the next (easier) question.
        void fetchConceptExplanation(currentQuestion, answer, payload.correctAnswer);
      }

      // If the server inserted an adaptive follow-up question, append it to
      // the client's question list so moveToNextQuestion can navigate to it.
      if (payload.correct && payload.adaptiveQuestion) {
        setSession((prev) => {
          if (!prev) return prev;
          // Only insert if not already present (idempotent)
          const alreadyPresent = prev.questions.some(
            (q) => q.questionKey === payload.adaptiveQuestion!.questionKey,
          );
          if (alreadyPresent) return prev;
          const insertAt = currentIndex + 1;
          const next = [...prev.questions];
          next.splice(insertAt, 0, payload.adaptiveQuestion!);
          return { ...prev, questions: next };
        });
      }

      if (payload.correct) {
        setAttempt(1);
        setCoachMode("listen");
      } else {
        setAttempt((value) => value + 1);
        setCoachMode("support");
        setQuestionStartedAt(Date.now());
        // Auto-hint: eliminate a wrong answer on the second wrong attempt
        if (attempt >= 2) {
          eliminateOneWrongAnswer(currentQuestion);
        }
        // Reset selected after a moment so they can retry
        setTimeout(() => setSelectedAnswer(null), 600);
      }
    } catch (caughtError) {
      // Never expose raw DB/network errors to kids — use a friendly message
      const msg = caughtError instanceof Error ? caughtError.message : "";
      const isNetworkError = msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("connect") || msg.toLowerCase().includes("network");
      setError(isNetworkError ? "Connection hiccup — tap an answer to try again! 🌟" : "Couldn't save your answer. Try again!");
      setSelectedAnswer(null);
    } finally {
      setSubmitting(false);
    }
  }

  function moveToNextQuestion() {
    if (!session) return;
    const isLastQuestion = currentIndex >= session.questions.length - 1;
    if (isLastQuestion) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentIndex((value) => value + 1);
    setAttempt(1);
    setAnswerState(null);
    setRewardOverlay(null);
    setCoachMode("listen");
    setSelectedAnswer(null);
    setQuestionStartedAt(Date.now());
    setEliminatedAnswers([]);
    // Clear any concept explainer state
    setConceptExplanation(null);
    setExplainerPhase(null);
    setCheckAnswer(null);
  }

  // ── Concept explainer helpers ──────────────────────────────────────────────

  async function fetchConceptExplanation(
    question: SessionQuestion,
    studentAnswer: string,
    correctAnswer: string,
  ) {
    if (!session) return;
    setExplainerPhase("loading");
    try {
      const res = await fetch("/api/play/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillCode: question.skill,
          subject: question.subject,
          bandCode: session.student.launchBandCode,
          questionText: question.prompt,
          studentAnswer,
          correctAnswer,
          studentFirstName: session.student.displayName.split(" ")[0],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { explanation?: ConceptExplanation | null };
        if (data.explanation) {
          setConceptExplanation(data.explanation);
          setExplainerPhase("reading");
          return;
        }
      }
    } catch { /* ignore — fall through */ }
    // Explanation unavailable — clear loading and let student continue normally
    setExplainerPhase(null);
  }

  function handleCheckAnswer(chosen: string) {
    if (!conceptExplanation || explainerPhase !== "checking") return;
    setCheckAnswer(chosen);
    const isCorrect = chosen === conceptExplanation.checkQuestion.correctAnswer;
    setExplainerPhase(isCorrect ? "understood" : "needs-help");
    // Auto-advance to next question after a moment
    setTimeout(() => { moveToNextQuestion(); }, isCorrect ? 2200 : 2800);
  }

  function replayQuestion(mode: Exclude<AssistMode, "visual">) {
    if (!session || !currentQuestion) return;
    setAssistMode(mode);
    const replayText =
      answerState?.needsRetry && answerState.explainer
        ? answerState.explainer.script
        : buildReadAloudText(currentQuestion, currentScene);
    const replayIntent = answerState?.needsRetry && answerState.explainer ? "support" : "prompt";
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.resume();
    speakText(replayText, mode === "slow" ? "support" : replayIntent);
  }

  // ── Daily limit reached ───────────────────────────────────────────────────

  if (dailyLimitInfo && !loading) {
    const isGuestLimit = dailyLimitInfo.isGuest;
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "24px 20px" }}>
          <div style={{ textAlign: "center", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 52 }}>{isGuestLimit ? "🌟" : "⭐"}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1.2 }}>
              {isGuestLimit ? "You're on a roll!" : `${dailyLimitInfo.sessionsToday} sessions today!`}
            </div>
            <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, maxWidth: 300 }}>
              {isGuestLimit
                ? "You've used up your guest sessions. Ask a parent to create a free account — your progress and quests will be saved forever!"
                : `You've played all ${dailyLimitInfo.limit} free sessions for today. Come back tomorrow, or ask a parent to upgrade to the Family plan for unlimited play.`}
            </div>
            <a
              href="/parent"
              style={{
                display: "inline-block", padding: "11px 24px",
                background: isGuestLimit
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #9b72ff, #7c4dff)",
                borderRadius: "12px", font: "700 0.9rem system-ui",
                color: "#fff", textDecoration: "none", marginTop: 8,
              }}
            >
              {isGuestLimit ? "Create a free account →" : "Upgrade to Family plan →"}
            </a>
            <Link href="/child" style={{ font: "600 0.8rem system-ui", color: C.muted, textDecoration: "none" }}>
              Back to home
            </Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "24px 20px" }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {/* Animated stars */}
            <div style={{ fontSize: 56, lineHeight: 1, animation: "none" }} className="quest-loader-icon">
              🚀
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {["⭐", "🌟", "✨"].map((star, i) => (
                <span key={i} className={`quest-loader-star quest-loader-star-${i}`} style={{ fontSize: 22 }}>{star}</span>
              ))}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.02em" }}>
              Your quest is loading!
            </div>
            <div style={{ fontSize: 15, color: C.muted, maxWidth: 280, lineHeight: 1.6 }}>
              Get ready, explorer — your next adventure is almost here! 🌟
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={`quest-loader-dot quest-loader-dot-${i}`} style={{ width: 10, height: 10, borderRadius: "50%", background: C.violet }} />
              ))}
            </div>
          </div>
        </div>
      </AppFrame>
    );
  }

  // ── Error / no session ────────────────────────────────────────────────────

  if (!session || !currentQuestion) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <main className="page-shell page-shell-split">
          <ShellCard eyebrow="Play" title="Something went wrong">
            <p>{error ? "Questions could not be loaded. Go back and try again." : "Your quest could not be prepared."}</p>
            {error && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                {error}
              </p>
            )}
            <div className="form-actions">
              {/* ?manual=1 forces the login form even if a session cookie exists */}
              <Link className="primary-link" href="/child?manual=1">Go back to setup</Link>
            </div>
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const finished =
    Boolean(answerState?.sessionCompleted) &&
    currentIndex === session.questions.length - 1 &&
    Boolean(answerState?.correct);

  const questionNumber = Math.min(currentIndex + 1, session.questions.length);
  const progressPercent = Math.round((questionNumber / Math.max(session.questions.length, 1)) * 100);
  const questionTags = buildQuestionTags(currentQuestion, session.student.launchBandCode);
  const earlyLearnerMode = isEarlyLearnerBand(session.student.launchBandCode);
  const visibleQuestionTags = earlyLearnerMode ? questionTags.slice(0, 1) : questionTags;
  const celebrationCopy = buildCelebrationCopy(currentQuestion);
  const welcomeBackCopy = buildWelcomeBackCopy(session.student.displayName, session.student.launchBandCode, progression);
  const promptCue = buildPromptCue(currentQuestion, currentScene);
  const coachCopy = buildCoachCopy(currentQuestion, currentScene, coachMode);

  function eliminateOneWrongAnswer(question: SessionQuestion) {
    const wrongAnswers = question.answers.filter(
      (a) => a !== question.correctAnswer && !eliminatedAnswers.includes(a)
    );
    if (wrongAnswers.length === 0) return;
    const pick = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    setEliminatedAnswers((prev) => [...prev, pick]);
  }
  const coachSteps = buildCoachSteps(currentQuestion);
  const answerCardVariant = buildAnswerCardVariant(currentQuestion);
  const answerTapCue = buildAnswerTapCue(currentQuestion);
  const questNodes = buildQuestNodes(session.questions, currentIndex, finished);
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
      ? { eyebrow: "Trophy unlocked", title: "A new trophy just landed on the shelf!", body: "You earned this by finishing strong — it's saved to your trophy shelf." }
      : answerState?.milestones.badgeEarned
        ? { eyebrow: "Badge earned", title: "New badge added to the collection.", body: "Saved to your badge collection — it will be there on your next visit." }
        : { eyebrow: "Next quest ready", title: nextQuestTeaser.title, body: nextQuestTeaser.body };
  const returnHighlights = returningEntry
    ? [
        { emoji: "⭐", title: `${progression?.totalPoints ?? 0} stars saved`, body: "Your progress stayed right here while you were away." },
        { emoji: "🧭", title: "Continue from where you left off", body: `${questWorldLabel} · ${Math.min(currentIndex + 1, session.questions.length)} of ${session.questions.length} questions ready.` },
        { emoji: "🎁", title: "Something new is waiting", body: nextQuestTeaser.body },
      ]
    : [];

  const isRetrying = Boolean(answerState?.needsRetry && !answerState?.correct);
  const isAnsweredCorrect = Boolean(answerState?.correct);
  const mascotMessage = isRetrying
    ? (answerState?.explainer ? buildShortSupportLine(answerState.explainer.script) : "Hmm, look again! Listen to the start sound and try once more 🎵")
    : isAnsweredCorrect
      ? "You got it! Great listening and thinking! 🎉"
      : "Look at the picture carefully and pick the best match! 👀";

  // ── Session complete screen ───────────────────────────────────────────────

  if (finished) {
    const total = session.questions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const accuracyColor = accuracy >= 80 ? C.mintGreen : accuracy >= 60 ? C.gold : C.violet;
    const encouragement =
      accuracy >= 90
        ? "Incredible! You're on fire! 🔥"
        : accuracy >= 80
          ? "Amazing work! Keep it up! ⭐"
          : accuracy >= 60
            ? "Good job! You're getting stronger! 💪"
            : "Nice try! Practice makes perfect! 🌱";

    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ padding: "24px 20px", maxWidth: 980, margin: "0 auto", fontFamily: "inherit" }}>
          {/* Reward overlay */}
          {rewardOverlay ? (
            <button
              aria-label="Reward moment"
              onClick={() => setRewardOverlay(null)}
              type="button"
              style={s.rewardOverlay(rewardOverlay.tone)}
            >
              <div style={s.rewardCard(rewardOverlay.tone)}>
                <div style={{ fontSize: 64 }} aria-hidden="true">{rewardOverlay.emoji}</div>
                <strong style={{ fontSize: 22, fontWeight: 900, color: rewardOverlay.tone === "gold" ? C.gold : rewardOverlay.tone === "violet" ? C.violet : C.mintGreen }}>
                  {rewardOverlay.title}
                </strong>
                <p style={{ fontSize: 14, color: C.muted }}>{rewardOverlay.body}</p>
              </div>
            </button>
          ) : null}

          <div style={s.completeShell}>
            <div style={s.completeGrid}>
              {/* Left hero */}
              <div style={s.completeHero}>
                <div style={{ fontSize: 11, fontWeight: 900, color: C.violet, letterSpacing: "0.1em", textTransform: "uppercase", background: "#221960", border: `1px solid ${C.violet}44`, borderRadius: 20, padding: "4px 12px", alignSelf: "flex-start" }}>
                  {session.student.launchBandCode} · {questSkillLabel}
                </div>

                {/* Celebration header */}
                <div style={{ fontSize: 64, lineHeight: 1, textAlign: "center" }} aria-hidden="true">🎉</div>
                <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15, color: "#fff" }}>
                  Quest Complete!
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: accuracyColor }}>
                  {encouragement}
                </div>

                {/* Score summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  {/* Correct answers */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 32 }}>✅</span>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                        {correctCount} <span style={{ fontSize: 16, color: C.muted, fontWeight: 700 }}>out of {total}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>correct answers</div>
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 32 }}>🎯</span>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: accuracyColor, lineHeight: 1 }}>
                        {accuracy}%
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>accuracy</div>
                    </div>
                  </div>

                  {/* Points earned */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 32 }}>⭐</span>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
                        +{sessionPointsEarned}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>stars earned</div>
                    </div>
                  </div>

                  {/* Streak counter */}
                  {(answerState?.currentStreak ?? 0) >= 2 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 32 }}>🔥</span>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
                          {answerState!.currentStreak} <span style={{ fontSize: 16, color: C.muted, fontWeight: 700 }}>days</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>day streak</div>
                      </div>
                    </div>
                  ) : null}

                  {/* Streak shield indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 32 }}>
                      {accuracy >= 70 ? "🔥" : accuracy >= 50 ? "🛡️" : "💙"}
                    </span>
                    <div>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: accuracy >= 70 ? C.mintGreen : accuracy >= 50 ? C.gold : C.coral,
                        lineHeight: 1.3,
                      }}>
                        {accuracy >= 70
                          ? "Streak — keep it up!"
                          : accuracy >= 50
                            ? "Streak protected! Play again tomorrow to keep your streak alive."
                            : "No worries! Your streak restarts tomorrow. Come back soon!"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session segs */}
                <div style={{ display: "flex", gap: 5, width: "100%" }}>
                  {session.questions.map((_, i) => (
                    <div
                      key={i}
                      style={{ flex: 1, height: 8, borderRadius: 4, background: i < completedNodeCount ? C.violet : C.border }}
                    />
                  ))}
                </div>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex(0);
                      setAnswerState(null);
                      setSelectedAnswer(null);
                      setRewardOverlay(null);
                      setAttempt(1);
                      setCorrectCount(0);
                      setTotalAnswered(0);
                      setSessionPointsEarned(0);
                      setCoachMode("listen");
                      setEliminatedAnswers([]);
                      setSessionKey((k) => k + 1);
                    }}
                    style={{ height: 50, borderRadius: 25, background: `linear-gradient(135deg, ${C.mintGreen}, #22c98a)`, color: "#0a1f15", fontSize: 15, fontWeight: 900, padding: "0 24px", display: "flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <span>🚀</span> Next Quest →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex(0);
                      setAnswerState(null);
                      setSelectedAnswer(null);
                      setRewardOverlay(null);
                      setAttempt(1);
                      setCorrectCount(0);
                      setTotalAnswered(0);
                      setSessionPointsEarned(0);
                      setCoachMode("listen");
                      setEliminatedAnswers([]);
                    }}
                    style={{ height: 50, borderRadius: 25, background: `linear-gradient(135deg, ${C.violet}, #7248e8)`, color: "#fff", fontSize: 14, fontWeight: 900, padding: "0 20px", display: "flex", alignItems: "center", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Play Again
                  </button>
                  <Link
                    href="/child/hub"
                    style={{ height: 50, borderRadius: 25, background: C.surface2, border: `1.5px solid ${C.border}`, color: "#b89eff", fontSize: 14, fontWeight: 900, padding: "0 20px", display: "flex", alignItems: "center", textDecoration: "none" }}
                  >
                    Go to Hub
                  </Link>
                </div>
              </div>

              {/* Right summary */}
              <div style={s.completeSummary}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6050a0" }}>Session Summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={s.statRow}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>📝 Questions</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{correctCount} of {total} correct</span>
                  </div>
                  <div style={{ ...s.statRow, borderColor: `${accuracyColor}55` }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>🎯 Accuracy</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: accuracyColor }}>{accuracy}%</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>⭐ Stars Earned</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: C.gold }}>+{sessionPointsEarned}</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>⚡ Level</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: C.violet }}>L{progression?.currentLevel ?? 1}</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>🏅 Badges</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{progression?.badgeCount ?? 0}</span>
                  </div>
                  {answerState?.milestones.trophyEarned ? (
                    <div style={{ ...s.statRow, borderColor: `${C.gold}55`, background: "#2a1800" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#ffe08a" }}>🏆 Trophy earned!</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: C.gold }}>New!</span>
                    </div>
                  ) : null}
                  {answerState?.milestones.badgeEarned ? (
                    <div style={{ ...s.statRow, borderColor: `${C.violet}55`, background: "#1a1040" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#c4b0ff" }}>🏅 Badge earned!</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: C.violet }}>New!</span>
                    </div>
                  ) : null}
                </div>

                {/* Coach bubble */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: "auto", background: C.surface2, border: `1.5px solid ${C.violet}33`, borderRadius: 12, padding: "12px 14px" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>🦁</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: C.violet, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Coach Leo</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#c8bef0", lineHeight: 1.4 }}>
                      {completionMoment.title} {completionHighlight.body}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppFrame>
    );
  }

  // ── Active session ────────────────────────────────────────────────────────

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{ padding: "20px 16px", maxWidth: 980, margin: "0 auto", fontFamily: "inherit" }}
      >
        {/* Global reward overlay */}
        {rewardOverlay ? (
          <button
            aria-label="Reward moment"
            onClick={() => setRewardOverlay(null)}
            type="button"
            style={s.rewardOverlay(rewardOverlay.tone)}
          >
            <div style={s.rewardCard(rewardOverlay.tone)}>
              <div style={{ fontSize: 64 }} aria-hidden="true">{rewardOverlay.emoji}</div>
              <strong style={{ fontSize: 22, fontWeight: 900, color: rewardOverlay.tone === "gold" ? C.gold : rewardOverlay.tone === "violet" ? C.violet : C.mintGreen }}>
                {rewardOverlay.title}
              </strong>
              <p style={{ fontSize: 14, color: C.muted }}>{rewardOverlay.body}</p>
            </div>
          </button>
        ) : null}

        {/* Play shell */}
        <div style={s.shell}>

          {/* ── Top bar ── */}
          <div style={s.topbar}>
            <Link href="/child" style={s.backBtn}>← Home</Link>
            <div style={{ flex: "0 0 auto" }}>
              <div style={s.questName}>{questWorldLabel}</div>
              <div style={s.questSub}>{questSkillLabel}</div>
            </div>

            {/* Progress dots */}
            <div style={s.progressStrip}>
              {session.questions.map((_, index) => (
                <ProgressDot
                  key={index}
                  state={
                    index < currentIndex ? "done" : index === currentIndex ? "active" : "pending"
                  }
                />
              ))}
              <span style={{ fontSize: 11, color: isAnsweredCorrect ? C.mintGreen : isRetrying ? C.coral : C.muted, fontWeight: 700, paddingLeft: 6, whiteSpace: "nowrap" }}>
                {isRetrying ? "Try again!" : isAnsweredCorrect ? `Q${questionNumber} ✓` : `Q${questionNumber}/${session.questions.length}`}
              </span>
            </div>

            {/* Star counter */}
            <div className="play-score" style={{ ...s.starCounter, ...(isAnsweredCorrect ? { borderColor: C.gold, background: "#1a1500" } : {}) }}>
              🌟 {progression?.totalPoints ?? 0}
            </div>

            {/* Child avatar + name + sign out */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }} className="play-player-chip">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("play-player-menu");
                  if (el) el.style.display = el.style.display === "none" ? "flex" : "none";
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: "rgba(155,114,255,0.12)", border: "1.5px solid rgba(155,114,255,0.3)",
                  borderRadius: 999, padding: "5px 12px 5px 7px",
                  cursor: "pointer", fontFamily: "inherit",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  minHeight: 36,
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "rgba(155,114,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, flexShrink: 0,
                }}>
                  {getAvatarSymbol(session.student.avatarKey)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.student.displayName}
                </span>
                <span style={{ fontSize: 10, color: C.muted }}>▾</span>
              </button>
              {/* Dropdown */}
              <div
                id="play-player-menu"
                style={{
                  display: "none", flexDirection: "column",
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#0e0c2a", border: "1.5px solid rgba(155,114,255,0.25)",
                  borderRadius: 12, padding: 6, minWidth: 160, zIndex: 200,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <Link href="/child?manual=1" onClick={() => { const el = document.getElementById("play-player-menu"); if (el) el.style.display = "none"; }} style={{ display: "block", padding: "9px 14px", fontSize: 13, fontWeight: 600, color: C.text, textDecoration: "none", borderRadius: 8 }}>
                  👦 Switch child
                </Link>
                <Link href="/parent" onClick={() => { const el = document.getElementById("play-player-menu"); if (el) el.style.display = "none"; }} style={{ display: "block", padding: "9px 14px", fontSize: 13, fontWeight: 600, color: C.text, textDecoration: "none", borderRadius: 8 }}>
                  👨‍👩‍👧 Parent view
                </Link>
                <a href="/api/child/logout" style={{ display: "block", padding: "9px 14px", fontSize: 13, fontWeight: 600, color: C.coral, textDecoration: "none", borderRadius: 8 }}>
                  🚪 Sign out
                </a>
              </div>
            </div>

            {/* Pause — navigate to pause screen with live session data */}
            <button
              type="button"
              style={s.pauseBtn}
              aria-label="Pause"
              onClick={() => {
                const stars = progression?.totalPoints ?? 0;
                const quest = session?.questions[currentIndex]?.skill ?? sessionMode;
                const total = session?.questions.length ?? 5;
                const current = currentIndex + 1;
                router.push(`/play/pause?stars=${stars}&quest=${encodeURIComponent(quest)}&current=${current}&total=${total}`);
              }}
            >⏸</button>
          </div>

          {/* ── Main area: question zone + right rail ── */}
          <div style={s.playMain} className="play-shell-inner">

            {/* Question zone */}
            <div style={{
              ...s.questionZone,
              ...(isAnsweredCorrect ? { background: "radial-gradient(ellipse at 50% 0%, rgba(80,232,144,0.06) 0%, transparent 70%)" } : {}),
              ...(isRetrying ? { background: "radial-gradient(ellipse at 50% 0%, rgba(255,123,107,0.05) 0%, transparent 70%)" } : {}),
            }}>

              {/* Question label */}
              <div style={{
                ...s.questLabel,
                ...(isAnsweredCorrect ? { color: C.mintGreen } : {}),
                ...(isRetrying ? { color: C.coral } : {}),
              }}>
                {isAnsweredCorrect
                  ? "✓ That's right!"
                  : isRetrying
                    ? "Not quite — give it another try!"
                    : buildQuestionStageLabel(currentQuestion, currentScene)}
              </div>

              {/* Visual / image area */}
              {renderQuestionStageVisual(currentQuestion, currentScene, isAnsweredCorrect)}

              {/* Prompt */}
              <div style={{ ...s.questPrompt, ...(isAnsweredCorrect ? { color: C.mintGreen } : {}), display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>
                  {isAnsweredCorrect
                    ? `🎉 "${answerState?.correctAnswer}" — yes!`
                    : currentQuestion.prompt}
                </span>
                {!isAnsweredCorrect && (
                  <SpeakButton text={currentQuestion.prompt} size="md" />
                )}
              </div>
              <div style={s.questPromptSub}>
                {isAnsweredCorrect
                  ? "Amazing! You earned a star for that one!"
                  : isRetrying
                    ? (inlineSupportMessage || "Listen again and try once more.")
                    : promptCue}
              </div>

              {!isAnsweredCorrect ? (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                  <button
                    type="button"
                    aria-pressed={assistMode === "voice"}
                    disabled={!voiceEnabled}
                    onClick={() => replayQuestion("voice")}
                    style={{ background: assistMode === "voice" ? C.surface2 : "transparent", border: `2px solid ${assistMode === "voice" ? C.violet : C.border}`, borderRadius: 10, color: assistMode === "voice" ? C.violet : C.muted, fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "7px 14px", cursor: "pointer" }}
                  >
                    {isSpeaking && assistMode === "voice" ? "🔊 Playing…" : "🔊 Replay"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={assistMode === "slow"}
                    disabled={!voiceEnabled}
                    onClick={() => replayQuestion("slow")}
                    style={{ background: assistMode === "slow" ? C.surface2 : "transparent", border: `2px solid ${assistMode === "slow" ? C.violet : C.border}`, borderRadius: 10, color: assistMode === "slow" ? C.violet : C.muted, fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "7px 14px", cursor: "pointer" }}
                  >
                    {isSpeaking && assistMode === "slow" ? "🔊 Playing…" : "🐢 Slow replay"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={assistMode === "visual"}
                    onClick={() => setAssistMode("visual")}
                    style={{ background: assistMode === "visual" ? C.surface2 : "transparent", border: `2px solid ${assistMode === "visual" ? C.mint : C.border}`, borderRadius: 10, color: assistMode === "visual" ? C.mint : C.muted, fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "7px 14px", cursor: "pointer" }}
                  >
                    🖼 Pictures only
                  </button>
                </div>
              ) : null}

              {/* Answer grid — hidden while concept explainer is active */}
              {!explainerPhase && (
                <div style={s.answerGrid}>
                  {currentQuestion.answers.map((answer) => {
                    const isThisSelected = selectedAnswer === answer;
                    const isThisCorrect = isAnsweredCorrect && answer === answerState?.correctAnswer;
                    const isThisWrong = isThisSelected && isRetrying;
                    const isEliminated = eliminatedAnswers.includes(answer) && !isThisCorrect && !isThisSelected;

                    return (
                      <button
                        key={answer}
                        type="button"
                        disabled={submitting || isAnsweredCorrect || isEliminated}
                        onClick={() => void submitAnswer(answer)}
                        style={{
                          ...s.answerCard(isThisSelected, isThisCorrect ? true : null, isThisWrong),
                          ...(isEliminated ? { opacity: 0.3, textDecoration: "line-through", cursor: "not-allowed" } : {}),
                        }}
                      >
                        {renderAnswerContent(currentQuestion, answer, true, session.student.launchBandCode === "PREK")}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Wrong hint */}
              {isRetrying && !explainerPhase ? (
                <div style={s.wrongHint}>
                  {eliminatedAnswers.length > 0
                    ? "One wrong answer is crossed out — try the others! 🔍"
                    : "That wasn\u2019t it — try again! You\u2019re getting closer 🌟"}
                </div>
              ) : null}

              {/* ── Concept Explainer Panel ────────────────────────────────── */}
              {explainerPhase === "loading" && (
                <div style={{
                  marginTop: 16, padding: "24px 20px", borderRadius: 16,
                  background: "rgba(155,114,255,0.06)", border: "1px solid rgba(155,114,255,0.18)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🎓</div>
                  <div style={{ fontSize: 14, color: "#c4b0ff", fontWeight: 600 }}>
                    Coach Leo is preparing an explanation…
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
                    You&apos;ll get to try a new question right after! 💪
                  </div>
                </div>
              )}

              {(explainerPhase === "reading" || explainerPhase === "checking" || explainerPhase === "understood" || explainerPhase === "needs-help") && conceptExplanation && (
                <div style={{
                  marginTop: 16, borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(155,114,255,0.22)",
                  background: "linear-gradient(160deg, rgba(155,114,255,0.07) 0%, rgba(22,27,34,0.98) 100%)",
                }}>
                  {/* Header */}
                  <div style={{
                    padding: "14px 18px 10px",
                    borderBottom: "1px solid rgba(155,114,255,0.12)",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 22 }}>🦁</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#c4b0ff" }}>
                        Coach Leo says
                      </div>
                      <div style={{ fontSize: 12, color: "#8b949e", marginTop: 1 }}>
                        {conceptExplanation.heading}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Explanation */}
                    <div style={{ fontSize: 13, color: "#dde1e7", lineHeight: 1.65 }}>
                      {conceptExplanation.explanation}
                    </div>

                    {/* Worked example */}
                    <div style={{
                      padding: "12px 14px", borderRadius: 10,
                      background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        ✍️ Let&apos;s work through it
                      </div>
                      {conceptExplanation.workedExample.split("\n").map((step, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.6, marginBottom: i < conceptExplanation.workedExample.split("\n").length - 1 ? 4 : 0 }}>
                          {step}
                        </div>
                      ))}
                    </div>

                    {/* Tip */}
                    <div style={{
                      padding: "8px 12px", borderRadius: 8,
                      background: "rgba(255,209,102,0.07)", border: "1px solid rgba(255,209,102,0.18)",
                      fontSize: 12, color: "#ffd166", fontWeight: 600,
                    }}>
                      💡 {conceptExplanation.tip}
                    </div>

                    {/* Check question — shown when phase is "checking" or after */}
                    {(explainerPhase === "checking" || explainerPhase === "understood" || explainerPhase === "needs-help") && (
                      <div style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#8b949e", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          🔍 Quick check — can you try this?
                        </div>
                        <div style={{ fontSize: 14, color: "#f0f6ff", fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>
                          {conceptExplanation.checkQuestion.text}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {conceptExplanation.checkQuestion.options.map((opt) => {
                            const isChosen = checkAnswer === opt;
                            const isCorrectOpt = opt === conceptExplanation.checkQuestion.correctAnswer;
                            const revealed = explainerPhase === "understood" || explainerPhase === "needs-help";
                            const bg = revealed && isCorrectOpt
                              ? "rgba(80,232,144,0.15)"
                              : revealed && isChosen && !isCorrectOpt
                              ? "rgba(239,68,68,0.12)"
                              : isChosen
                              ? "rgba(155,114,255,0.12)"
                              : "rgba(255,255,255,0.04)";
                            const border = revealed && isCorrectOpt
                              ? "1px solid rgba(80,232,144,0.4)"
                              : revealed && isChosen && !isCorrectOpt
                              ? "1px solid rgba(239,68,68,0.3)"
                              : isChosen
                              ? "1px solid rgba(155,114,255,0.35)"
                              : "1px solid rgba(255,255,255,0.08)";
                            const color = revealed && isCorrectOpt ? "#50e890"
                              : revealed && isChosen && !isCorrectOpt ? "#ff7b6b"
                              : "#dde1e7";

                            return (
                              <button
                                key={opt}
                                type="button"
                                disabled={explainerPhase !== "checking"}
                                onClick={() => handleCheckAnswer(opt)}
                                style={{
                                  padding: "10px 14px", borderRadius: 8, textAlign: "left",
                                  background: bg, border, color, fontSize: 13, fontWeight: 600,
                                  cursor: explainerPhase === "checking" ? "pointer" : "default",
                                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8,
                                  transition: "background 0.2s",
                                }}
                              >
                                {revealed && isCorrectOpt && <span>✓</span>}
                                {revealed && isChosen && !isCorrectOpt && <span>✗</span>}
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Phase CTAs */}
                    {explainerPhase === "reading" && (
                      <button
                        type="button"
                        onClick={() => setExplainerPhase("checking")}
                        style={{
                          padding: "10px 20px", borderRadius: 10, border: "none",
                          background: "#9b72ff", color: "#fff", fontSize: 13, fontWeight: 700,
                          cursor: "pointer", alignSelf: "center",
                        }}
                      >
                        Got it — try the check question! →
                      </button>
                    )}

                    {explainerPhase === "understood" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                        <div style={{
                          padding: "10px 14px", borderRadius: 10, textAlign: "center",
                          background: "rgba(80,232,144,0.1)", border: "1px solid rgba(80,232,144,0.25)",
                          fontSize: 13, fontWeight: 700, color: "#50e890", width: "100%",
                        }}>
                          🎉 You&apos;ve got it! Great work!
                        </div>
                        <button
                          type="button"
                          onClick={moveToNextQuestion}
                          style={{
                            padding: "10px 24px", borderRadius: 10, border: "none",
                            background: "#50e890", color: "#0a1f15", fontSize: 13, fontWeight: 900,
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                        >
                          Got it — next question! →
                        </button>
                      </div>
                    )}

                    {explainerPhase === "needs-help" && (
                      <div style={{
                        padding: "10px 14px", borderRadius: 10, textAlign: "center",
                        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                        fontSize: 13, color: "#fbbf24", lineHeight: 1.55,
                      }}>
                        <span style={{ fontWeight: 700 }}>That&apos;s okay!</span> This one&apos;s tricky — your teacher will help you practise more.
                        Moving on…
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Correct CTA */}
              {isAnsweredCorrect && !finished ? (
                <div style={s.correctPanel}>
                  <div style={s.correctLabel}>✓ Answer saved!</div>
                  <div style={s.pointsBadge}>+{answerState?.pointsEarned ?? 1} ⭐</div>
                  <p style={{ fontSize: 13, color: C.muted, textAlign: "center", margin: 0 }}>
                    {celebrationCopy.body}
                  </p>
                  <button type="button" onClick={moveToNextQuestion} style={s.nextBtn}>
                    Next Question →
                  </button>
                </div>
              ) : null}

              {error ? (
                <p style={{ color: C.coral, fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</p>
              ) : null}
            </div>

            {/* Right rail */}
            <div className="play-rail" style={s.rail}>

              {/* Mascot coach */}
              <div style={s.mascotCard}>
                <span style={s.mascotAvatar} aria-hidden="true">🦁</span>
                <div style={s.railSectionTitle}>Coach Leo</div>
                <div style={s.mascotSpeech(isRetrying)}>
                  {mascotMessage}
                </div>
              </div>

              {/* Progress card */}
              <div style={s.progressCard}>
                <div style={s.railSectionTitle}>This Quest</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Questions</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{questionNumber} / {session.questions.length}</span>
                </div>
                <div style={s.progressBar}>
                  <div style={s.progressFill(progressPercent)} />
                </div>
                <div style={{ fontSize: 14, textAlign: "center", color: C.gold, marginTop: 4 }}>
                  {"⭐".repeat(Math.min(Math.ceil(completedNodeCount / 2), 3))}
                  {"☆".repeat(Math.max(0, 3 - Math.ceil(completedNodeCount / 2)))}
                </div>
              </div>

              {/* Star safe */}
              <div style={s.starSafeBadge}>
                ⭐ {isRetrying ? "Stars safe — keep trying!" : "Your stars are safe!"}
              </div>

              {/* PlayBetaSupport rail — hidden visually, keeps logic */}
              <div style={{ display: "none" }}>
                <PlayBetaSupport
                  assistMode={assistMode}
                  badges={progression?.badgeCount ?? 0}
                  coachBody={answerState?.needsRetry && answerState.explainer ? buildShortSupportLine(answerState.explainer.script) : coachCopy.body}
                  coachSteps={coachSteps}
                  coachTitle={answerState?.needsRetry && answerState.explainer ? "Let's try together." : coachCopy.title}
                  currentLevel={progression?.currentLevel ?? 1}
                  currentQuestionLabel={questSkillLabel}
                  helperMessage={promptCue}
                  helperTone={buildSupportTone(session.student.launchBandCode) as "gold" | "violet" | "mint" | "coral"}
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
              </div>

              {/* Milestone badges */}
              {answerState?.milestones.leveledUp ? (
                <div style={{ ...s.starSafeBadge, borderColor: C.violet, color: C.violet, background: "#1a1040" }}>🚀 Level up!</div>
              ) : null}
              {answerState?.milestones.badgeEarned ? (
                <div style={{ ...s.starSafeBadge, borderColor: C.violet, color: C.violet, background: "#1a1040" }}>🏅 New badge!</div>
              ) : null}
              {answerState?.milestones.trophyEarned ? (
                <div style={{ ...s.starSafeBadge, borderColor: C.gold, color: C.gold, background: "#1a1000" }}>🏆 New trophy!</div>
              ) : null}

            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div style={s.bottomBar}>
            <button
              type="button"
              style={s.audioBtn(isSpeaking && assistMode === "voice")}
              disabled={!voiceEnabled}
              onClick={() => replayQuestion("voice")}
            >
              {isSpeaking && assistMode === "voice" ? "🔊" : "🔊"} Replay question
            </button>
            <button
              type="button"
              style={s.hintBtn(isRetrying)}
              onClick={() => { setCoachMode("clue"); }}
            >
              💡 {isRetrying ? "Get a hint" : "Give me a hint"}
            </button>
            <button
              type="button"
              style={s.idkBtn}
              onClick={() => {
                if (!answerState?.correct) {
                  void submitAnswer(currentQuestion.answers[0] ?? "");
                }
              }}
            >
              🤷 I don&apos;t know yet
            </button>
          </div>
        </div>

        {/* Below-shell support: early learner assist mode controls */}
        {earlyLearnerMode ? (
          <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              aria-pressed={assistMode === "voice"}
              disabled={!voiceEnabled}
              onClick={() => replayQuestion("voice")}
              style={{ background: assistMode === "voice" ? C.surface2 : "transparent", border: `2px solid ${assistMode === "voice" ? C.violet : C.border}`, borderRadius: 10, color: assistMode === "voice" ? C.violet : C.muted, fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "7px 14px", cursor: "pointer" }}
            >
              {isSpeaking && assistMode === "voice" ? "🔊 Playing…" : "🔊 Replay"}
            </button>
            <button
              type="button"
              aria-pressed={assistMode === "slow"}
              disabled={!voiceEnabled}
              onClick={() => replayQuestion("slow")}
              style={{ background: assistMode === "slow" ? C.surface2 : "transparent", border: `2px solid ${assistMode === "slow" ? C.violet : C.border}`, borderRadius: 10, color: assistMode === "slow" ? C.violet : C.muted, fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "7px 14px", cursor: "pointer" }}
            >
              {isSpeaking && assistMode === "slow" ? "🔊 Playing…" : "🐢 Slow replay"}
            </button>
            <button
              type="button"
              aria-pressed={assistMode === "visual"}
              onClick={() => setAssistMode("visual")}
              style={{ background: assistMode === "visual" ? C.surface2 : "transparent", border: `2px solid ${assistMode === "visual" ? C.mint : C.border}`, borderRadius: 10, color: assistMode === "visual" ? C.mint : C.muted, fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "7px 14px", cursor: "pointer" }}
            >
              🖼 Pictures only
            </button>
          </div>
        ) : null}

        {/* Visible question tags for non-early learners */}
        {!earlyLearnerMode ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            {visibleQuestionTags.map((tag) => (
              <span
                key={tag}
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: C.muted }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </AppFrame>
  );
}

export default function PlayClient() {
  return (
    <Suspense fallback={<div style={{ background: "#100b2e", minHeight: "100vh" }} />}>
      <PlayClientInner />
    </Suspense>
  );
}
