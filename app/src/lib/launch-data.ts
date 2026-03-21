export type AvatarItem = {
  avatar_key: string;
  launch_band: string;
  theme: string;
  display_name: string;
};

export type ExplainerItem = {
  explainer_key: string;
  launch_band: string;
  subject: string;
  format: string;
  misconception: string;
  script: string;
  media_hint: string;
};

export type SampleQuestionItem = {
  question_key: string;
  launch_band: string;
  subject: string;
  skill: string;
  theme: string;
  prompt: string;
  correct_answer: string;
  distractors: string[];
  modality: string;
  difficulty: number;
  explainer_key: string;
};

export const avatars: AvatarItem[] = [
  {
    avatar_key: "lion-striker",
    launch_band: "K1",
    theme: "sports-world",
    display_name: "Lion Striker",
  },
  {
    avatar_key: "fox-runner",
    launch_band: "K1",
    theme: "sports-world",
    display_name: "Fox Runner",
  },
  {
    avatar_key: "panda-pilot",
    launch_band: "G23",
    theme: "space-explorer",
    display_name: "Panda Pilot",
  },
  {
    avatar_key: "owl-builder",
    launch_band: "G45",
    theme: "building-quest",
    display_name: "Owl Builder",
  },
  {
    avatar_key: "bunny-helper",
    launch_band: "PREK",
    theme: "animal-adventure",
    display_name: "Bunny Helper",
  },
  {
    avatar_key: "bear-explorer",
    launch_band: "PREK",
    theme: "animal-adventure",
    display_name: "Bear Explorer",
  },
];

export const explainers: ExplainerItem[] = [
  {
    explainer_key: "prek_letter_b",
    launch_band: "PREK",
    subject: "early-literacy",
    format: "voice-animation",
    misconception: "letter recognition",
    script: "This is the letter B. B makes the buh sound like ball.",
    media_hint: "big bouncing ball animation",
  },
  {
    explainer_key: "prek_count_3",
    launch_band: "PREK",
    subject: "math",
    format: "voice-animation",
    misconception: "counting mismatch",
    script: "Let us count slowly together. One, two, three.",
    media_hint: "three jumping animals",
  },
  {
    explainer_key: "k1_short_a",
    launch_band: "K1",
    subject: "phonics",
    format: "voice-video",
    misconception: "short vowel sound",
    script: "Cat has the short a sound. Say it with me: c-a-t.",
    media_hint: "sports card with cat mascot",
  },
  {
    explainer_key: "k1_addition_make_10",
    launch_band: "K1",
    subject: "math",
    format: "voice-video",
    misconception: "basic addition",
    script: "You had six and then got four more. Six plus four makes ten.",
    media_hint: "scoreboard filling to ten",
  },
  {
    explainer_key: "g23_main_idea",
    launch_band: "G23",
    subject: "reading",
    format: "voice-video",
    misconception: "main idea confusion",
    script: "The main idea is what the whole paragraph is mostly about.",
    media_hint: "planet mission briefing card",
  },
  {
    explainer_key: "g23_times_table",
    launch_band: "G23",
    subject: "math",
    format: "voice-video",
    misconception: "multiplication fact",
    script: "Three groups of four means four plus four plus four. That is twelve.",
    media_hint: "rocket rows of four",
  },
  {
    explainer_key: "g45_fraction_compare",
    launch_band: "G45",
    subject: "math",
    format: "video",
    misconception: "fraction comparison",
    script: "When the pieces are the same size, the fraction with more pieces shaded is greater.",
    media_hint: "builder tiles split into equal parts",
  },
  {
    explainer_key: "g45_context_clue",
    launch_band: "G45",
    subject: "reading",
    format: "video",
    misconception: "context clue usage",
    script: "Look at the sentence before and after the word to figure out what it most likely means.",
    media_hint: "construction blueprint highlight",
  },
];

export const sampleQuestions: SampleQuestionItem[] = [
  {
    question_key: "prek_letter_b_ball",
    launch_band: "PREK",
    subject: "early-literacy",
    skill: "letter-b-recognition",
    theme: "animal-adventure",
    prompt: "Tap the letter B.",
    correct_answer: "B",
    distractors: ["D", "P"],
    modality: "tap",
    difficulty: 1,
    explainer_key: "prek_letter_b",
  },
  {
    question_key: "prek_count_ducks_3",
    launch_band: "PREK",
    subject: "math",
    skill: "count-to-3",
    theme: "animal-adventure",
    prompt: "How many ducks do you see?",
    correct_answer: "3",
    distractors: ["2", "4"],
    modality: "tap",
    difficulty: 1,
    explainer_key: "prek_count_3",
  },
  {
    question_key: "prek_shape_circle",
    launch_band: "PREK",
    subject: "math",
    skill: "shape-circle",
    theme: "animal-adventure",
    prompt: "Which shape is a circle?",
    correct_answer: "circle",
    distractors: ["triangle", "square"],
    modality: "tap",
    difficulty: 1,
    explainer_key: "prek_count_3",
  },
  {
    question_key: "k1_short_a_cat",
    launch_band: "K1",
    subject: "phonics",
    skill: "short-a-sound",
    theme: "sports-world",
    prompt: "Which word has the short a sound?",
    correct_answer: "cat",
    distractors: ["bike", "home"],
    modality: "tap",
    difficulty: 2,
    explainer_key: "k1_short_a",
  },
  {
    question_key: "k1_add_6_4",
    launch_band: "K1",
    subject: "math",
    skill: "add-to-10",
    theme: "sports-world",
    prompt: "What is 6 + 4?",
    correct_answer: "10",
    distractors: ["9", "11"],
    modality: "tap",
    difficulty: 2,
    explainer_key: "k1_addition_make_10",
  },
  {
    question_key: "k1_first_word_goal",
    launch_band: "K1",
    subject: "reading",
    skill: "read-simple-word",
    theme: "sports-world",
    prompt: "Pick the word goal.",
    correct_answer: "goal",
    distractors: ["goat", "gold"],
    modality: "tap",
    difficulty: 2,
    explainer_key: "k1_short_a",
  },
  {
    question_key: "g23_main_idea_planets",
    launch_band: "G23",
    subject: "reading",
    skill: "main-idea",
    theme: "space-explorer",
    prompt: "What is this paragraph mostly about?",
    correct_answer: "planets in our solar system",
    distractors: ["one astronaut", "a soccer game"],
    modality: "tap",
    difficulty: 3,
    explainer_key: "g23_main_idea",
  },
  {
    question_key: "g23_mult_3x4",
    launch_band: "G23",
    subject: "math",
    skill: "multiply-3x4",
    theme: "space-explorer",
    prompt: "What is 3 x 4?",
    correct_answer: "12",
    distractors: ["10", "14"],
    modality: "tap",
    difficulty: 3,
    explainer_key: "g23_times_table",
  },
  {
    question_key: "g23_logic_pattern",
    launch_band: "G23",
    subject: "logic",
    skill: "pattern-next-item",
    theme: "space-explorer",
    prompt: "What comes next: star, moon, star, moon, ?",
    correct_answer: "star",
    distractors: ["moon", "planet"],
    modality: "tap",
    difficulty: 3,
    explainer_key: "g23_main_idea",
  },
  {
    question_key: "g45_fraction_half_vs_third",
    launch_band: "G45",
    subject: "math",
    skill: "compare-fractions",
    theme: "building-quest",
    prompt: "Which is greater: 1/2 or 1/3?",
    correct_answer: "1/2",
    distractors: ["1/3", "they are equal"],
    modality: "tap",
    difficulty: 4,
    explainer_key: "g45_fraction_compare",
  },
  {
    question_key: "g45_context_clue_rugged",
    launch_band: "G45",
    subject: "reading",
    skill: "use-context-clues",
    theme: "building-quest",
    prompt: "Using the sentence, what does rugged most likely mean?",
    correct_answer: "rough and strong",
    distractors: ["very shiny", "quiet and calm"],
    modality: "tap",
    difficulty: 4,
    explainer_key: "g45_context_clue",
  },
  {
    question_key: "g45_world_knowledge_bridge",
    launch_band: "G45",
    subject: "world-knowledge",
    skill: "engineering-basics",
    theme: "building-quest",
    prompt: "Why do engineers test a bridge design before building it?",
    correct_answer: "to make sure it is safe and strong",
    distractors: ["to change its color", "to make it heavier"],
    modality: "tap",
    difficulty: 4,
    explainer_key: "g45_fraction_compare",
  },
];

const avatarIndex = new Map(avatars.map((item) => [item.avatar_key, item]));
const explainerIndex = new Map(explainers.map((item) => [item.explainer_key, item]));
const questionIndex = new Map(sampleQuestions.map((item) => [item.question_key, item]));

export function getAvatarsForBand(launchBandCode?: string) {
  return avatars.filter(
    (item) => !launchBandCode || item.launch_band === launchBandCode,
  );
}

export function getAvatarByKey(avatarKey: string) {
  return avatarIndex.get(avatarKey) ?? null;
}

export function getExplainerByKey(explainerKey: string) {
  return explainerIndex.get(explainerKey) ?? null;
}

export function getQuestionByKey(questionKey: string) {
  return questionIndex.get(questionKey) ?? null;
}
