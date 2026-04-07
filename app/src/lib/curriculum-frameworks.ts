// Maps US states to their curriculum framework and relevant skill alignment codes.
// Used to show parents which standards their child is being measured against
// and to surface ISD/district benchmark context where public data is available.

export type CurriculumFramework = {
  code: string;           // e.g. "TEKS", "CCSS", "BEST", "NGLS"
  name: string;           // e.g. "Texas Essential Knowledge and Skills"
  shortName: string;      // e.g. "Texas TEKS"
  color: string;          // display color
  url: string;            // public reference URL
  description: string;    // one sentence description for parents
};

export const FRAMEWORKS: Record<string, CurriculumFramework> = {
  TEKS: {
    code: "TEKS",
    name: "Texas Essential Knowledge and Skills",
    shortName: "Texas TEKS",
    color: "#f97316",
    url: "https://tea.texas.gov/academics/curriculum-standards/teks-texas-essential-knowledge-and-skills",
    description: "The official state curriculum standards for Texas public schools, adopted by the State Board of Education.",
  },
  CCSS: {
    code: "CCSS",
    name: "Common Core State Standards",
    shortName: "Common Core",
    color: "#3b82f6",
    url: "http://www.corestandards.org",
    description: "A set of high-quality academic standards in mathematics and English language arts/literacy adopted by most US states.",
  },
  BEST: {
    code: "BEST",
    name: "Benchmarks for Excellent Student Thinking",
    shortName: "Florida BEST",
    color: "#10b981",
    url: "https://www.fldoe.org/academics/standards/",
    description: "Florida's state standards for English Language Arts and Mathematics, replacing Common Core in 2020.",
  },
  NGLS: {
    code: "NGLS",
    name: "New York Next Generation Learning Standards",
    shortName: "NY Next Gen",
    color: "#8b5cf6",
    url: "https://www.nysed.gov/curriculum-instruction/new-york-state-next-generation-learning-standards",
    description: "New York State's revised standards building on and improving the Common Core, adopted in 2017.",
  },
  VACS: {
    code: "VACS",
    name: "Virginia Standards of Learning",
    shortName: "Virginia SOL",
    color: "#06b6d4",
    url: "https://www.doe.virginia.gov/teaching-learning-assessment/k-12-standards-curriculum",
    description: "Virginia's state standards for academic content, assessed by the Virginia Department of Education.",
  },
  CCSS_GA: {
    code: "CCSS_GA",
    name: "Georgia Standards of Excellence",
    shortName: "Georgia GSE",
    color: "#ef4444",
    url: "https://www.gadoe.org/Curriculum-Instruction-and-Assessment/Curriculum-and-Instruction/Pages/default.aspx",
    description: "Georgia's academic standards, aligned with Common Core with state-specific modifications.",
  },
};

// Maps state abbreviation to framework code
export const STATE_FRAMEWORK: Record<string, string> = {
  TX: "TEKS",
  FL: "BEST",
  NY: "NGLS",
  VA: "VACS",
  GA: "CCSS_GA",
  // All other states default to CCSS
};

export function getFrameworkForState(stateCode: string | null | undefined): CurriculumFramework | null {
  if (!stateCode) return null;
  const key = STATE_FRAMEWORK[stateCode.toUpperCase()] ?? "CCSS";
  return FRAMEWORKS[key] ?? null;
}

// Skill-level alignment codes per framework
// Structure: skillCode -> { frameworkCode -> standardCode }
export const SKILL_ALIGNMENTS: Record<string, Record<string, string>> = {
  // Math -- PREK
  "color-recognition":   { CCSS: "K.MD.3",   TEKS: "K.1B" },
  "shape-circle":        { CCSS: "K.G.2",    TEKS: "K.6A" },
  "count-to-3":          { CCSS: "K.CC.5",   TEKS: "K.2A" },
  "bigger-smaller":      { CCSS: "K.MD.2",   TEKS: "K.7A" },

  // K1
  "add-to-10":           { CCSS: "K.OA.2",   TEKS: "1.3B" },
  "subtract-to-10":      { CCSS: "K.OA.2",   TEKS: "1.3B" },
  "sight-words-basic":   { CCSS: "RF.K.3c",  TEKS: "K.4A" },
  "read-simple-word":    { CCSS: "RF.1.3",   TEKS: "1.2A" },
  "short-a-sound":       { CCSS: "RF.1.2a",  TEKS: "K.2A" },
  "short-e-sound":       { CCSS: "RF.1.2a",  TEKS: "1.2A" },
  "short-i-sound":       { CCSS: "RF.1.2a",  TEKS: "1.2A" },
  "count-to-20":         { CCSS: "K.CC.1",   TEKS: "K.2A" },

  // G23
  "add-3-digit":         { CCSS: "2.NBT.7",  TEKS: "2.4B" },
  "multiply-3x4":        { CCSS: "3.OA.7",   TEKS: "3.4F" },
  "main-idea":           { CCSS: "RI.2.2",   TEKS: "2.9E" },
  "cause-effect":        { CCSS: "RI.3.3",   TEKS: "3.9B" },
  "skip-count-by-5":     { CCSS: "2.NBT.2",  TEKS: "2.4C" },
  "compare-numbers":     { CCSS: "2.NBT.4",  TEKS: "2.2D" },
  "time-to-hour":        { CCSS: "2.MD.7",   TEKS: "2.9G" },
  "paragraph-sequence":  { CCSS: "RI.2.3",   TEKS: "2.9A" },
  "fraction-half":       { CCSS: "3.NF.1",   TEKS: "3.3A" },
  "measurement-cm":      { CCSS: "2.MD.1",   TEKS: "2.9A" },

  // G45
  "long-division":       { CCSS: "4.NBT.6",  TEKS: "4.4F" },
  "data-bar-chart":      { CCSS: "3.MD.3",   TEKS: "3.8A" },
  "pattern-next-item":   { CCSS: "4.OA.5",   TEKS: "4.5A" },
  "life-cycle-basics":   { CCSS: "3-LS1-1",  TEKS: "3.12B" },
  "earth-layers":        { CCSS: "4-ESS2-2", TEKS: "4.7A" },
};

export function getSkillAlignment(skillCode: string, frameworkCode: string): string | null {
  return SKILL_ALIGNMENTS[skillCode]?.[frameworkCode] ?? null;
}

// ─── Framework resolution ─────────────────────────────────────────────────────

export type FrameworkResolution = {
  framework: CurriculumFramework;
  source: "isd" | "state" | "national";
  sourceLabel: string; // e.g. "Austin ISD", "Texas", "National Standards"
};

export function resolveFramework(
  stateCode: string | null | undefined,
  isdName: string | null | undefined,
): FrameworkResolution {
  // Level 1: ISD available — use state framework but label it as ISD-sourced
  // (true ISD-level benchmarks will come from NCES in Phase 2)
  if (isdName?.trim() && stateCode?.trim()) {
    const framework = getFrameworkForState(stateCode) ?? FRAMEWORKS["CCSS"];
    return {
      framework,
      source: "isd",
      sourceLabel: isdName.trim(),
    };
  }

  // Level 2: State known — use state framework
  if (stateCode?.trim()) {
    const framework = getFrameworkForState(stateCode) ?? FRAMEWORKS["CCSS"];
    return {
      framework,
      source: "state",
      sourceLabel: US_STATES.find(s => s.code === stateCode.toUpperCase())?.name ?? stateCode,
    };
  }

  // Level 3: Nothing known — fall back to national Common Core standards
  return {
    framework: FRAMEWORKS["CCSS"],
    source: "national",
    sourceLabel: "National Standards",
  };
}

// List of all 50 US states for the dropdown
export const US_STATES: Array<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];
