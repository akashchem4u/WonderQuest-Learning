"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";
import { ChildPicker } from "@/components/child-picker";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "rgba(255,255,255,0.04)",
  violet: "#9b72ff",
  violetDim: "rgba(155,114,255,0.12)",
  mint: "#22c55e",
  mintDim: "rgba(34,197,94,0.10)",
  mintBorder: "rgba(34,197,94,0.25)",
  coral: "#f87171",
  coralDim: "rgba(248,113,113,0.10)",
  coralBorder: "rgba(248,113,113,0.25)",
  gold: "#ffd166",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

type LinkedChild = {
  id: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
};

type RawSkill = {
  skillCode?: string;
  displayName?: string;
  skillName?: string;
  subjectCode?: string;
  launchBandCode?: string;
  masteryScore?: number;
  masteryPct?: number;
  attempts?: number;
};

type NormSkill = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  bandCode: string;
  masteryPct: number;
  attempts: number;
};

type DailyIdea = {
  icon: string;
  title: string;
  desc: string;
};

// ── Normalise ──────────────────────────────────────────────────────────────

function normalise(raw: RawSkill): NormSkill {
  return {
    skillCode: raw.skillCode ?? "",
    skillName: raw.displayName ?? raw.skillName ?? raw.skillCode ?? "Unknown skill",
    subjectCode: raw.subjectCode ?? "",
    bandCode: raw.launchBandCode ?? "",
    masteryPct: Math.round(raw.masteryScore ?? raw.masteryPct ?? 0),
    attempts: raw.attempts ?? 0,
  };
}

// ── Band thresholds ────────────────────────────────────────────────────────

function getFocusThreshold(bandCode: string): number {
  if (bandCode === "PREK") return 65;
  if (bandCode === "K1") return 70;
  if (bandCode === "G23") return 75;
  if (bandCode === "G45") return 80;
  return 70;
}

// ── Skill tier badge ───────────────────────────────────────────────────────

const ESSENTIAL_CODES = new Set([
  "color-recognition","shape-circle","count-to-3","bigger-smaller",
  "add-to-10","sight-words-basic","read-simple-word","short-a-sound",
  "add-3-digit","multiply-3x4","main-idea","cause-effect",
  "fraction-half","data-bar-chart","long-division",
]);

function getTierBadge(skillCode: string): { emoji: string; label: string; color: string } {
  if (ESSENTIAL_CODES.has(skillCode))
    return { emoji: "🎯", label: "Essential", color: C.coral };
  return { emoji: "📗", label: "On Track", color: C.mint };
}

// ── Practice tips (skill-specific, actionable, non-judgmental) ─────────────

const SKILL_TIPS: Record<string, string> = {
  "color-recognition": "Try an 'I spy' game with colors on your next walk — 'I spy something blue!' — and take turns.",
  "shape-circle": "Explore circles together: clocks, plates, coins, wheels. Challenge each other to find 5 in 2 minutes.",
  "count-to-3": "Count everyday things together — stairs climbed, grapes on a plate, fingers held up — to build natural fluency.",
  "bigger-smaller": "Hold up two objects and explore: 'Which feels bigger?' Then switch roles and let them ask you.",
  "add-to-10": "Use small objects — grapes, coins, blocks — to build addition stories: 'We have 3 here and 4 there. How many altogether?'",
  "subtract-to-10": "Start with 10 small objects. Remove some and ask how many remain. Let them lead the counting.",
  "sight-words-basic": "Place 3 sight word cards somewhere visible. Revisit them at natural moments — before meals, before bed.",
  "read-simple-word": "Sound out short words on everyday packaging together — c-a-t, d-o-g — keeping it playful and low-pressure.",
  "short-a-sound": "Say words with the short 'a' sound together: cat, bat, hat, map. Invite them to suggest the next one.",
  "short-e-sound": "Take turns building rhyme chains with short 'e': bed, red, fed. See how long the chain can grow.",
  "short-i-sound": "Spot short 'i' words around the room: bin, lip, fish, sit. Who can find the most?",
  "count-to-20": "Count together during active moments — jumping, clapping, stepping — making numbers feel physical and fun.",
  "add-3-digit": "Find two 3-digit numbers on a receipt, price tag, or book page and add them together as a team.",
  "multiply-3x4": "Arrange small objects into rows and columns — 3 rows of 4 — and count them together to explore arrays.",
  "main-idea": "After reading a page together, ask: 'What was that section mostly about?' in just one sentence.",
  "cause-effect": "While watching a programme together, pause and explore: 'Why did that happen?' or 'What might happen next?'",
  "skip-count-by-5": "Count groups of 5 together — tally marks, coins — working up to 50 and back.",
  "compare-numbers": "Write two numbers and ask which is greater. Gradually move to 3-digit comparisons as confidence grows.",
  "time-to-hour": "Check an analog clock together twice a day and read the hour aloud. Make it a brief, natural habit.",
  "fraction-half": "Cut a snack or sandwich in half and explore: 'This is one half — how many halves make a whole?'",
  "measurement-cm": "Measure household objects with a ruler together. Estimate first, then measure — celebrate close guesses.",
  "paragraph-sequence": "Read a short passage together and ask them to retell the events in order in their own words.",
  "pattern-next-item": "Build a repeating pattern with any objects — cups, coins, pens — leave a gap and invite them to complete it.",
  "life-cycle-basics": "Draw a simple life cycle together — egg, caterpillar, cocoon, butterfly — and talk through each stage.",
  "data-bar-chart": "Make a simple tally chart of family favorites: fruit, colors, shows. Then read the results together.",
  "long-division": "Share snacks equally — 12 crackers among 3 people — and explore how division works in real life.",
};

function getPracticeTip(skillCode: string, skillName: string, bandCode: string): string {
  if (SKILL_TIPS[skillCode]) return SKILL_TIPS[skillCode];
  const n = skillName.toLowerCase();
  if (n.includes("letter") || n.includes("phonics") || n.includes("sound"))
    return "Look for that letter or sound on packaging, street signs, and book covers together throughout the day.";
  if (n.includes("shape"))
    return "Explore that shape in everyday objects around the home — make it a casual ongoing discovery.";
  if (n.includes("add") || n.includes("sum"))
    return "Use fingers or small objects to build addition stories together — keep it playful and conversational.";
  if (n.includes("read") || n.includes("word"))
    return "Read a page or two of a favourite book together tonight and point to words as you go.";
  if (n.includes("pattern"))
    return "Create a repeating pattern together with household objects and take turns extending it.";
  if (n.includes("count"))
    return "Count something real and tangible together — stairs, steps to the car, bites of a snack.";
  if (n.includes("fraction"))
    return "Divide food into equal pieces and explore what fractions mean in everyday life.";
  if (n.includes("multiply"))
    return "Count in groups together — by 2s or 5s — during a walk or while doing something active.";
  if (bandCode === "PREK")
    return `Spend 5 minutes exploring ${skillName.toLowerCase()} through playful, hands-on discovery together.`;
  return `Spend 5 minutes on ${skillName.toLowerCase()} today — a quick friendly challenge works well.`;
}

// ── Dynamic daily ideas by subject ────────────────────────────────────────

const SUBJECT_IDEAS: Record<string, DailyIdea[]> = {
  math: [
    { icon: "🍎", title: "Kitchen numeracy", desc: "Count and add food items while preparing a snack or meal together." },
    { icon: "🔢", title: "Discovery walk", desc: "Count steps, vehicles, windows, or birds on your next walk outside." },
    { icon: "🛒", title: "Market maths", desc: "Explore adding prices or counting change during a shopping trip." },
    { icon: "📏", title: "Estimation challenge", desc: "Pick 5 objects, estimate their length, then measure — see who was closest." },
    { icon: "🎲", title: "Dice exploration", desc: "Roll two dice and add, subtract, or multiply — vary the operation each round." },
  ],
  reading: [
    { icon: "📖", title: "Evening story time", desc: "Read 2 pages of a favourite book together before bed and talk about what happened." },
    { icon: "🏷️", title: "Word detective", desc: "Spot and read words on labels, signs, and packaging around the home." },
    { icon: "✉️", title: "Family message", desc: "Compose a short note or message together addressed to a family member or friend." },
    { icon: "🗞️", title: "Story retell", desc: "After a programme or book, ask them to retell the story in 3 sentences." },
  ],
  phonics: [
    { icon: "🔤", title: "Sound detectives", desc: "Take turns sounding out words on packaging or street signs you pass together." },
    { icon: "🎵", title: "Rhyme challenge", desc: "Take turns rhyming — cat, bat, hat, mat — and keep the chain going as long as possible." },
    { icon: "🅰️", title: "Letter of the day", desc: "Choose a letter each morning and spot it on everything — books, signs, food labels." },
  ],
  science: [
    { icon: "🌿", title: "Nature observation", desc: "Step outside and describe or sketch 3 things you observe in the natural world." },
    { icon: "🧪", title: "Home experiment", desc: "Mix baking soda and vinegar together and discuss what you notice happening." },
    { icon: "🌤️", title: "Weather journal", desc: "Look outside each morning and describe the weather in your own words." },
  ],
  logic: [
    { icon: "🧩", title: "Pattern studio", desc: "Build a repeating pattern with any objects and invite them to continue it." },
    { icon: "❓", title: "What comes next?", desc: "Start a number or shape sequence and explore what should come next." },
    { icon: "🔍", title: "Spot the difference", desc: "Find a spot-the-difference puzzle and work through it together at your own pace." },
  ],
  "early-literacy": [
    { icon: "🅰️", title: "Alphabet adventure", desc: "Go through the alphabet together and think of one word for each letter." },
    { icon: "📖", title: "Picture book time", desc: "Read a short picture book together and point to words as you read." },
  ],
};

const FALLBACK_IDEAS: DailyIdea[] = [
  { icon: "📖", title: "Evening story time", desc: "Read 2 pages of a favourite book together before bed." },
  { icon: "🔢", title: "Discovery walk", desc: "Count steps, vehicles, or birds on your next walk together." },
  { icon: "🧩", title: "Shape exploration", desc: "Name 5 shapes you can find around the home right now." },
  { icon: "🍎", title: "Kitchen numeracy", desc: "Count and add food items while preparing a meal together." },
];

function buildDailyIdeas(focusSkills: NormSkill[], bandCode: string): DailyIdea[] {
  const weakSubjects = [...new Set(focusSkills.map(s => s.subjectCode))].slice(0, 3);
  const ideas: DailyIdea[] = [];
  const usedTitles = new Set<string>();

  for (const subj of weakSubjects) {
    const pool = SUBJECT_IDEAS[subj] ?? [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (const idea of shuffled.slice(0, 2)) {
      if (!usedTitles.has(idea.title)) { ideas.push(idea); usedTitles.add(idea.title); }
    }
  }

  for (const idea of FALLBACK_IDEAS) {
    if (ideas.length >= 5) break;
    if (!usedTitles.has(idea.title)) { ideas.push(idea); usedTitles.add(idea.title); }
  }

  if ((bandCode === "PREK" || bandCode === "K1") && ideas.length < 5) {
    for (const idea of SUBJECT_IDEAS["early-literacy"] ?? []) {
      if (!usedTitles.has(idea.title)) { ideas.push(idea); usedTitles.add(idea.title); break; }
    }
  }

  return ideas.slice(0, 5);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function FocusSkillCard({ skill, childName }: { skill: NormSkill; childName: string }) {
  const tip = getPracticeTip(skill.skillCode, skill.skillName, skill.bandCode);
  const tier = getTierBadge(skill.skillCode);
  const pct = skill.masteryPct;
  const barColor = pct < 40 ? C.coral : pct < 65 ? C.gold : C.mint;

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 18px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{skill.skillName}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: `${tier.color}22`, color: tier.color, border: `1px solid ${tier.color}44` }}>
            {tier.emoji} {tier.label}
          </span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: barColor, flexShrink: 0 }}>{pct}%</span>
      </div>

      <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3 }} />
      </div>

      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: skill.attempts > 0 ? 10 : 0 }}>
        💡 {tip}
      </div>

      {skill.attempts > 0 && (
        <div style={{ fontSize: 11, color: C.muted }}>
          {childName} has explored this {skill.attempts} time{skill.attempts !== 1 ? "s" : ""} — continued practice builds lasting confidence.
        </div>
      )}
    </div>
  );
}

function StrengthChip({ skill }: { skill: NormSkill }) {
  return (
    <div style={{ background: C.mintDim, border: `1px solid ${C.mintBorder}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
      <div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{skill.skillName}</span>
        <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{skill.subjectCode}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
          <div style={{ height: "100%", width: `${skill.masteryPct}%`, background: C.mint, borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.mint }}>{skill.masteryPct}%</span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ParentPracticePage() {
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>("");
  const [skills, setSkills] = useState<NormSkill[]>([]);
  const [childName, setChildName] = useState<string>("your child");
  const [bandCode, setBandCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback((childId: string, children: LinkedChild[]) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      setChildName(child.displayName.split(" ")[0]);
      setBandCode(child.launchBandCode);
    }
    setLoading(true);
    setError(null);

    fetch(`/api/parent/skills?childId=${encodeURIComponent(childId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Could not load skills (${res.status})`);
        }
        return res.json() as Promise<{ child?: { displayName?: string }; skills?: RawSkill[] }>;
      })
      .then((data) => {
        if (data.child?.displayName) setChildName(data.child.displayName.split(" ")[0]);
        setSkills((data.skills ?? []).map(normalise));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load skill data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/parent/session")
      .then(r => r.ok ? r.json() : null)
      .then((data: { linkedChildren?: LinkedChild[]; linkedChild?: LinkedChild } | null) => {
        if (!data) { setError("Please sign in to view practice ideas."); setLoading(false); return; }
        const children: LinkedChild[] = data.linkedChildren ?? (data.linkedChild ? [data.linkedChild] : []);
        setLinkedChildren(children);
        if (children.length === 0) { setError("No children are currently linked to this account."); setLoading(false); return; }
        const firstId = children[0].id;
        setActiveChildId(firstId);
        fetchSkills(firstId, children);
      })
      .catch(() => { setError("Could not load family data."); setLoading(false); });
  }, [fetchSkills]);

  const handleChildSwitch = (childId: string) => {
    setActiveChildId(childId);
    setSkills([]);
    fetchSkills(childId, linkedChildren);
  };

  const threshold = getFocusThreshold(bandCode);

  const focusSkills = skills
    .filter(s => s.masteryPct < threshold && s.attempts > 0)
    .sort((a, b) => a.masteryPct - b.masteryPct)
    .slice(0, 5);

  const strengthSkills = skills
    .filter(s => s.masteryPct >= threshold + 10 && s.masteryPct < 95)
    .sort((a, b) => b.masteryPct - a.masteryPct)
    .slice(0, 3);

  const dailyIdeas = buildDailyIdeas(focusSkills, bandCode);
  const hasData = skills.length > 0;

  return (
    <AppFrame audience="parent" currentPath="/parent/practice">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 20px 72px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, maxWidth: 600, margin: "0 auto" }}>

        <div style={{ marginBottom: 20 }}>
          <Link href="/parent" style={{ color: C.violet, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 4 }}>Practice Ideas</h1>
          {!loading && !error && (
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Personalised for {childName} based on their current progress
            </p>
          )}
        </div>

        {/* Child picker — reloads all content on switch */}
        {linkedChildren.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <ChildPicker children={linkedChildren} activeChildId={activeChildId} onSelect={handleChildSwitch} />
          </div>
        )}

        {loading && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, textAlign: "center", color: C.muted, fontSize: 14 }}>
            Preparing {childName}&apos;s personalised practice plan…
          </div>
        )}

        {!loading && error && (
          <div style={{ background: C.coralDim, border: `1px solid ${C.coralBorder}`, borderRadius: 14, padding: "16px 20px", fontSize: 14, color: C.coral, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {!loading && !error && !hasData && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>No sessions recorded yet for {childName}</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
              Once {childName} completes a few sessions, personalised practice ideas will appear here based on their real progress.
            </div>
            <Link href="/child" style={{ display: "inline-block", padding: "10px 24px", background: C.violet, color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Begin a session
            </Link>
          </div>
        )}

        {!loading && !error && hasData && focusSkills.length === 0 && (
          <div style={{ background: C.mintDim, border: `1px solid ${C.mintBorder}`, borderRadius: 14, padding: "16px 20px", fontSize: 14, color: C.mint, marginBottom: 24 }}>
            🎉 {childName} is showing strong performance across all practiced skills — no urgent focus areas at this time.
          </div>
        )}

        {!loading && !error && hasData && (
          <>
            {focusSkills.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <SectionHeading>Areas to develop this week</SectionHeading>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
                  Each card includes a specific, actionable tip for {childName}&apos;s current level.
                </div>
                {focusSkills.map(skill => <FocusSkillCard key={skill.skillCode} skill={skill} childName={childName} />)}
              </div>
            )}

            {strengthSkills.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <SectionHeading>Growing strengths</SectionHeading>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
                  {childName} is making excellent progress here — celebrate these milestones together.
                </div>
                {strengthSkills.map(skill => <StrengthChip key={skill.skillCode} skill={skill} />)}
              </div>
            )}

            <div style={{ marginBottom: 32 }}>
              <SectionHeading>5-minute daily activities</SectionHeading>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
                Simple, no-prep activities tied to {childName}&apos;s current focus areas.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {dailyIdeas.map((idea) => (
                  <div key={idea.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.violetDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {idea.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{idea.title}</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{idea.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link href="/parent/suggestions" style={{ fontSize: 13, fontWeight: 700, color: C.violet, textDecoration: "none" }}>🎯 Learning Plan</Link>
              <Link href="/parent/report" style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}>Full report</Link>
              <Link href="/parent/skills" style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}>All skills</Link>
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
