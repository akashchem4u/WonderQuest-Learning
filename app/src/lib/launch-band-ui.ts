export type LaunchBandTone = "gold" | "violet" | "mint" | "coral";

type LaunchBandUiConfig = {
  symbol: string;
  profileEmoji: string;
  profileTitle: string;
  ageLabel: string;
  worldLabel: string;
  supportTone: LaunchBandTone;
  teaserTitle: string;
  teaserBody: string;
  promptVoice: {
    rate: number;
    pitch: number;
  };
  supportVoice: {
    rate: number;
    pitch: number;
  };
};

const DEFAULT_UI: LaunchBandUiConfig = {
  symbol: "⭐",
  profileEmoji: "⭐",
  profileTitle: "WonderQuest Learner",
  ageLabel: "All launch bands",
  worldLabel: "WonderQuest",
  supportTone: "violet",
  teaserTitle: "Next quest ready",
  teaserBody: "Fresh challenge waiting.",
  promptVoice: {
    rate: 0.92,
    pitch: 1,
  },
  supportVoice: {
    rate: 0.88,
    pitch: 0.98,
  },
};

export const EARLY_LEARNER_BANDS = new Set(["PREK", "K1"]);

export const launchBandUi: Record<string, LaunchBandUiConfig> = {
  PREK: {
    symbol: "🌈",
    profileEmoji: "🐣",
    profileTitle: "Tiny Explorer",
    ageLabel: "Ages 2-5",
    worldLabel: "Animal Adventure",
    supportTone: "gold",
    teaserTitle: "Next: Number Garden",
    teaserBody: "More counting and letters.",
    promptVoice: {
      rate: 0.78,
      pitch: 1.02,
    },
    supportVoice: {
      rate: 0.74,
      pitch: 1,
    },
  },
  K1: {
    symbol: "⚽",
    profileEmoji: "⚽",
    profileTitle: "Super Starter",
    ageLabel: "Kindergarten - Grade 1",
    worldLabel: "Violet Trail",
    supportTone: "violet",
    teaserTitle: "Next: Violet Trail",
    teaserBody: "More words and quick wins.",
    promptVoice: {
      rate: 0.86,
      pitch: 1,
    },
    supportVoice: {
      rate: 0.82,
      pitch: 0.98,
    },
  },
  G23: {
    symbol: "🚀",
    profileEmoji: "🚀",
    profileTitle: "Space Adventurer",
    ageLabel: "Grades 2-3",
    worldLabel: "Orbit Trail",
    supportTone: "mint",
    teaserTitle: "Next: Orbit Trail",
    teaserBody: "Bigger reading and logic.",
    promptVoice: {
      rate: 0.92,
      pitch: 1,
    },
    supportVoice: {
      rate: 0.88,
      pitch: 0.98,
    },
  },
  G45: {
    symbol: "🧱",
    profileEmoji: "🏗️",
    profileTitle: "Master Builder",
    ageLabel: "Grades 4-5",
    worldLabel: "Builder Summit",
    supportTone: "coral",
    teaserTitle: "Next: Builder Summit",
    teaserBody: "Stronger puzzles ahead.",
    promptVoice: {
      rate: 0.92,
      pitch: 1,
    },
    supportVoice: {
      rate: 0.88,
      pitch: 0.98,
    },
  },
  G6: {
    symbol: "🧠",
    profileEmoji: "🧠",
    profileTitle: "Strategy Scholar",
    ageLabel: "Age 11-12 · Grade 6",
    worldLabel: "Innovation Lab",
    supportTone: "coral",
    teaserTitle: "Next: Innovation Lab",
    teaserBody: "Advanced reasoning and cross-subject challenges.",
    promptVoice: {
      rate: 0.95,
      pitch: 0.98,
    },
    supportVoice: {
      rate: 0.9,
      pitch: 0.96,
    },
  },
};

export function getLaunchBandUi(launchBandCode: string) {
  return launchBandUi[launchBandCode] ?? DEFAULT_UI;
}

export function isEarlyLearnerBand(launchBandCode: string) {
  return EARLY_LEARNER_BANDS.has(launchBandCode);
}
