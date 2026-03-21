export type LaunchBand = {
  code: string;
  label: string;
  audience: string;
  primaryTheme: string;
  focus: string[];
};

export type BuildTrack = {
  name: string;
  items: string[];
};

export const launchBands: LaunchBand[] = [
  {
    code: "PREK",
    label: "Ages 2 to 5",
    audience: "Pre-primary learners",
    primaryTheme: "Animal Adventure",
    focus: ["letters", "sounds", "counting", "shapes", "voice-led explainers"],
  },
  {
    code: "K1",
    label: "Kindergarten to Grade 1",
    audience: "Early readers",
    primaryTheme: "Sports World",
    focus: ["phonics", "first words", "simple addition", "guided retries", "badges"],
  },
  {
    code: "G23",
    label: "Grade 2 to Grade 3",
    audience: "Growing independent learners",
    primaryTheme: "Space Explorer",
    focus: ["reading practice", "math facts", "logic", "challenge choice", "recaps"],
  },
  {
    code: "G45",
    label: "Grade 4 to Grade 5",
    audience: "More strategic learners",
    primaryTheme: "Building Quest",
    focus: ["comprehension", "multi-step math", "self-directed challenges", "reports"],
  },
];

export const buildTracks: BuildTrack[] = [
  {
    name: "Identity and Progress",
    items: [
      "Username + 4-digit PIN + display name + avatar",
      "Parent linkage without full secure accounts",
      "Persistent points, badges, and tester progress",
    ],
  },
  {
    name: "Adaptive Learning Loop",
    items: [
      "Question bank driven by age band and subject",
      "Age-specific voice and video explainers",
      "Child-initiated harder/easier/more-like-this actions",
    ],
  },
  {
    name: "Parent and Teacher Visibility",
    items: [
      "Time spent and session effectiveness",
      "Support-needed and strength areas",
      "Feedback capture with AI triage later",
    ],
  },
];
