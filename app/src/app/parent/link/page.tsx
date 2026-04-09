"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { UpgradePrompt } from "@/components/upgrade-prompt";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const VIOLET  = "#9b72ff";
const MINT    = "#58e8c1";
const GOLD    = "#ffd166";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(255,255,255,0.5)";
const SURFACE = "rgba(255,255,255,0.04)";
const BORDER  = "rgba(255,255,255,0.06)";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5; // 1=child details, 2=grade/age, 3=goals, 4=pin, 5=confirm

type BandKey = "prek" | "k1" | "g23" | "g45";

type Band = {
  key: BandKey;
  label: string;
  sub: string;
  dot: string;
  border: string;
  bg: string;
  selectedBg: string;
  textColor: string;
};

const BANDS: Band[] = [
  { key: "prek", label: "Pre-K Band",  sub: "Ages 4–5 · Letters, numbers, shapes",              dot: GOLD,     border: `rgba(255,209,102,0.5)`, bg: "rgba(255,209,102,0.06)", selectedBg: "rgba(255,209,102,0.12)", textColor: GOLD    },
  { key: "k1",   label: "K–1 Band",    sub: "Grades K–1 · Phonics, early reading, addition",    dot: VIOLET,   border: `rgba(155,114,255,0.5)`, bg: "rgba(155,114,255,0.06)", selectedBg: "rgba(155,114,255,0.12)", textColor: VIOLET  },
  { key: "g23",  label: "G2–3 Band",   sub: "Grades 2–3 · Reading, multiplication, comprehension", dot: MINT,  border: `rgba(88,232,193,0.5)`,  bg: "rgba(88,232,193,0.06)",  selectedBg: "rgba(88,232,193,0.12)",  textColor: MINT   },
  { key: "g45",  label: "G4–5 Band",   sub: "Grades 4–5 · Inference, fractions, word problems", dot: "#ff7b6b", border: "rgba(255,123,107,0.5)", bg: "rgba(255,123,107,0.06)", selectedBg: "rgba(255,123,107,0.12)", textColor: "#ff7b6b" },
];

const AVATARS = ["🦁", "🐼", "🦋", "🐸", "🦊", "🐳", "🦄", "🐢"];

const GRADES = [
  "Pre-K (Age 4–5)",
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
];

const GRADE_BAND: Record<string, BandKey> = {
  "Pre-K (Age 4–5)": "prek",
  "Kindergarten":    "k1",
  "Grade 1":         "k1",
  "Grade 2":         "g23",
  "Grade 3":         "g23",
  "Grade 4":         "g45",
  "Grade 5":         "g45",
};

type FocusArea = { id: string; icon: string; label: string; sub: string };

const FOCUS_AREAS: FocusArea[] = [
  { id: "reading",    icon: "📖", label: "Reading",    sub: "Phonics, comprehension"  },
  { id: "math",       icon: "➕", label: "Math",       sub: "Numbers, operations"      },
  { id: "spelling",   icon: "🔤", label: "Spelling",   sub: "Word building, patterns"  },
  { id: "vocabulary", icon: "🗣️", label: "Vocabulary", sub: "Word meaning, usage"      },
];

const SESSION_LIMITS = ["1 session", "2 sessions", "3 sessions", "4 sessions", "Unlimited"];

// ─── Step progress bar ────────────────────────────────────────────────────────

function StepBar({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const segs = [1, 2, 3, 4];
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 32 }}>
      {segs.map((seg) => {
        const done   = seg < current;
        const active = seg === current;
        return (
          <div
            key={seg}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              background: done ? MINT : active ? VIOLET : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        );
      })}
      <span
        style={{
          font: "600 0.7rem system-ui",
          color: MUTED,
          width: 50,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {current < 5 ? `${current} of 4` : "Done!"}
      </span>
    </div>
  );
}

// ─── Form field helpers ───────────────────────────────────────────────────────

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ font: "600 0.78rem system-ui", color: "rgba(200,190,240,0.75)", marginBottom: 7 }}>
      {children}
    </div>
  );
}

function TextInput({
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "13px 16px",
        background: "rgba(255,255,255,0.04)",
        border: `1.5px solid ${focused ? VIOLET : "rgba(155,114,255,0.25)"}`,
        borderRadius: 10,
        font: "400 0.95rem system-ui",
        color: TEXT,
        outline: "none",
        boxShadow: focused ? `0 0 0 3px rgba(155,114,255,0.12)` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "13px 16px",
        background: BASE,
        border: `1.5px solid ${focused ? VIOLET : "rgba(155,114,255,0.25)"}`,
        borderRadius: 10,
        font: "400 0.95rem system-ui",
        color: TEXT,
        outline: "none",
        cursor: "pointer",
        boxShadow: focused ? `0 0 0 3px rgba(155,114,255,0.12)` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} style={{ background: BASE, color: TEXT }}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

function PrimaryBtn({
  children,
  onClick,
  disabled,
  fullWidth,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? "100%" : undefined,
        flex: fullWidth ? undefined : 2,
        padding: "14px 20px",
        background: disabled
          ? "rgba(255,255,255,0.06)"
          : `linear-gradient(135deg, ${VIOLET}, #5a30d0)`,
        color: disabled ? MUTED : "#fff",
        border: "none",
        borderRadius: 12,
        font: "700 0.95rem system-ui",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.2s, transform 0.1s",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </button>
  );
}

function BackBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "14px",
        background: "transparent",
        color: MUTED,
        border: `1.5px solid rgba(255,255,255,0.12)`,
        borderRadius: 12,
        font: "600 0.9rem system-ui",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      ← Back
    </button>
  );
}

// ─── Flow card shell ──────────────────────────────────────────────────────────

function FlowCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        background: "rgba(255,255,255,0.04)",
        borderRadius: 20,
        border: `1px solid rgba(155,114,255,0.18)`,
        padding: "40px 36px",
        boxShadow: "0 8px 60px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, color = VIOLET }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        font: "600 0.72rem system-ui",
        color,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ font: "700 1.5rem/1.2 system-ui", color: TEXT, margin: "0 0 8px" }}>
      {children}
    </h2>
  );
}

function StepSub({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ font: "400 0.85rem/1.5 system-ui", color: MUTED, margin: "0 0 28px" }}>
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentLinkPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 state — "quest name" is used as both displayName and username
  const [childName,  setChildName]  = useState("");
  const [nameAvailability, setNameAvailability] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [nameMessage, setNameMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [avatar,     setAvatar]     = useState("🦁");
  const [nickname,   setNickname]   = useState("");

  // Step 2 state
  const [age,        setAge]        = useState("5");
  const [grade,      setGrade]      = useState("Kindergarten");
  const [band,       setBand]       = useState<BandKey>("k1");

  // Step 3 state
  const [sessionLimit,  setSessionLimit]  = useState("3 sessions");
  const [notifBadge,    setNotifBadge]    = useState(true);
  const [notifLevel,    setNotifLevel]    = useState(true);
  const [notifSession,  setNotifSession]  = useState(false);
  const [notifInactive, setNotifInactive] = useState(false);
  const [focusAreas,    setFocusAreas]    = useState<string[]>(["reading", "math"]);

  // Step 4 — PIN state
  const [pin,         setPin]         = useState("");
  const [pinConfirm,  setPinConfirm]  = useState("");
  const [pinError,    setPinError]    = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState<{ limit: number; plan: string } | null>(null);

  function handleQuestNameChange(val: string) {
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
    setChildName(cleaned);
    setNameAvailability("idle");
    setNameMessage("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!cleaned || cleaned.length < 2) {
      return;
    }

    setNameAvailability("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/parent/check-child-name?username=${encodeURIComponent(cleaned)}`);
        const data = (await res.json()) as { available?: boolean; message?: string };
        if (data.available) {
          setNameAvailability("available");
          setNameMessage("Available!");
        } else {
          setNameAvailability("taken");
          setNameMessage(data.message ?? "That name is taken — try a different one!");
        }
      } catch {
        setNameAvailability("idle");
      }
    }, 500);
  }

  function handleGradeChange(g: string) {
    setGrade(g);
    const mapped = GRADE_BAND[g];
    if (mapped) setBand(mapped);
  }

  function toggleFocus(id: string) {
    setFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }

  const activeBand = BANDS.find((b) => b.key === band) ?? BANDS[1];
  const selectedBandLabel = activeBand.label;
  const selectedFocusLabels = FOCUS_AREAS
    .filter((f) => focusAreas.includes(f.id))
    .map((f) => f.label)
    .join(" & ") || "All areas (balanced)";
  const notifSummary = [
    notifBadge    && "Badges",
    notifLevel    && "Level-ups",
    notifSession  && "Sessions",
    notifInactive && "Reminders",
  ]
    .filter(Boolean)
    .join(", ") || "None";

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <main
        style={{
          minHeight: "100vh",
          background: BASE,
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 24px 80px",
        }}
      >
        {/* ── Back nav ── */}
        <div style={{ width: "100%", maxWidth: 520, marginBottom: 24 }}>
          <Link
            href="/parent"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              font: "500 0.78rem system-ui",
              color: MUTED,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            ← Home
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STEP 1: Child Details
        ══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <FlowCard>
            <StepBar current={1} />
            <Eyebrow>Add a child</Eyebrow>
            <StepTitle>Tell us about your child</StepTitle>
            <StepSub>
              We use this to personalise their learning adventure. First name only — we don&apos;t need a surname.
            </StepSub>

            {/* Quest name (used as both display name and username) */}
            <div style={{ marginBottom: 20 }}>
              <FormLabel>{"Child's quest name"}</FormLabel>
              <div style={{ position: "relative" }}>
                <TextInput
                  placeholder="e.g. stargazer42"
                  value={childName}
                  onChange={handleQuestNameChange}
                />
              </div>
              {nameAvailability === "checking" && (
                <div style={{ font: "500 0.75rem system-ui", color: MUTED, marginTop: 5 }}>Checking…</div>
              )}
              {nameMessage && nameAvailability !== "checking" && (
                <div style={{ font: "500 0.75rem system-ui", marginTop: 5, color: nameAvailability === "available" ? "#58e8c1" : "#ff7b6b" }}>
                  {nameMessage}
                </div>
              )}
              <div style={{ font: "400 0.72rem/1.5 system-ui", color: MUTED, marginTop: 6 }}>
                Letters and numbers only, 2–20 characters. This is how they sign in and how we cheer them on!
              </div>
            </div>

            {/* Avatar */}
            <div style={{ marginBottom: 20 }}>
              <FormLabel>
                Choose an avatar{" "}
                <span style={{ font: "400 0.72rem system-ui", color: MUTED, marginLeft: 4 }}>(optional)</span>
              </FormLabel>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                {AVATARS.map((em) => (
                  <button
                    key={em}
                    onClick={() => setAvatar(em)}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: avatar === em ? "rgba(155,114,255,0.2)" : SURFACE,
                      border: `2.5px solid ${avatar === em ? VIOLET : "rgba(255,255,255,0.1)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      transform: avatar === em ? "scale(1.06)" : "scale(1)",
                      boxShadow: avatar === em ? `0 0 0 3px rgba(155,114,255,0.2)` : "none",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname */}
            <div style={{ marginBottom: 28 }}>
              <FormLabel>
                Nickname for coach messages{" "}
                <span style={{ font: "400 0.72rem system-ui", color: MUTED, marginLeft: 4 }}>(optional)</span>
              </FormLabel>
              <TextInput
                placeholder="e.g. Little Lion (leave blank to use first name)"
                value={nickname}
                onChange={setNickname}
              />
              <div style={{ font: "400 0.72rem/1.5 system-ui", color: MUTED, marginTop: 6 }}>
                How the in-app coach will address them. Defaults to their first name.
              </div>
            </div>

            <PrimaryBtn
              onClick={() => setStep(2)}
              disabled={!childName.trim() || childName.length < 2 || nameAvailability === "taken" || nameAvailability === "invalid" || nameAvailability === "checking"}
              fullWidth
            >
              Continue →
            </PrimaryBtn>
          </FlowCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 2: Grade & Age
        ══════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <FlowCard>
            <StepBar current={2} />
            <Eyebrow>Grade &amp; Learning Level</Eyebrow>
            <StepTitle>What grade is {childName || "your child"} in?</StepTitle>
            <StepSub>
              This helps us choose the right questions — not too easy, not too hard. You can always adjust.
            </StepSub>

            {/* Age + Grade row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 8,
              }}
            >
              <div>
                <FormLabel>Age</FormLabel>
                <TextInput
                  type="number"
                  placeholder="5"
                  value={age}
                  onChange={setAge}
                />
              </div>
              <div>
                <FormLabel>Grade / Year</FormLabel>
                <SelectInput
                  value={grade}
                  onChange={handleGradeChange}
                  options={GRADES}
                />
              </div>
            </div>
            <div style={{ font: "400 0.72rem/1.5 system-ui", color: MUTED, marginBottom: 20 }}>
              Entering age will auto-select the matching grade. You can override either.
            </div>

            {/* Band selection */}
            <FormLabel>Learning band — auto-selected from grade</FormLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {BANDS.map((b) => {
                const selected = band === b.key;
                return (
                  <button
                    key={b.key}
                    onClick={() => setBand(b.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: `2px solid ${selected ? b.border : "rgba(255,255,255,0.1)"}`,
                      background: selected ? b.selectedBg : b.bg,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      transform: selected ? "scale(1.01)" : "scale(1)",
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: b.dot,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ font: "700 0.88rem system-ui", color: b.textColor }}>{b.label}</div>
                      <div style={{ font: "400 0.72rem system-ui", color: MUTED, marginTop: 1 }}>{b.sub}</div>
                    </div>
                    {selected && (
                      <span style={{ font: "600 0.85rem system-ui", color: b.dot }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: "rgba(155,114,255,0.08)",
                borderRadius: 10,
                font: "400 0.75rem/1.5 system-ui",
                color: "rgba(180,170,220,0.7)",
                marginBottom: 28,
              }}
            >
              💡 Not sure of the right level? Start here — WonderQuest will adapt as {childName || "your child"} plays. You can change this from settings.
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <BackBtn onClick={() => setStep(1)} />
              <PrimaryBtn onClick={() => setStep(3)}>Continue →</PrimaryBtn>
            </div>
          </FlowCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 3: Goals
        ══════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <FlowCard>
            <StepBar current={3} />
            <Eyebrow>Learning Goals</Eyebrow>
            <StepTitle>How do you want {childName || "your child"} to learn?</StepTitle>
            <StepSub>
              Set a healthy daily rhythm. You can change these any time from your dashboard.
            </StepSub>

            {/* Daily session limit */}
            <div style={{ marginBottom: 20 }}>
              <FormLabel>Daily session limit</FormLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {SESSION_LIMITS.map((opt) => {
                  const selected = sessionLimit === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setSessionLimit(opt)}
                      style={{
                        padding: "10px 18px",
                        border: `1.5px solid ${selected ? VIOLET : "rgba(255,255,255,0.12)"}`,
                        borderRadius: 20,
                        font: "600 0.85rem system-ui",
                        color: selected ? "#fff" : MUTED,
                        background: selected ? "rgba(155,114,255,0.25)" : SURFACE,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div style={{ font: "400 0.72rem/1.5 system-ui", color: MUTED, marginTop: 8 }}>
                Each session is about 10–15 minutes. 3/day = ~30–45 min total. Recommended for K–1.
              </div>
            </div>

            {/* Notification prefs */}
            <div style={{ marginBottom: 20 }}>
              <FormLabel>Notify me when {childName || "your child"}…</FormLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Earns a new badge 🏅",        checked: notifBadge,    set: setNotifBadge    },
                  { label: "Levels up ⭐",                 checked: notifLevel,   set: setNotifLevel    },
                  { label: "Completes each session 📊",    checked: notifSession, set: setNotifSession  },
                  { label: "Hasn't played for 2+ days 💬", checked: notifInactive, set: setNotifInactive },
                ].map(({ label, checked, set }) => (
                  <label
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      font: "400 0.84rem system-ui",
                      color: checked ? TEXT : "rgba(240,246,255,0.6)",
                      cursor: "pointer",
                      padding: "12px 14px",
                      background: checked ? "rgba(155,114,255,0.08)" : SURFACE,
                      borderRadius: 10,
                      border: `1.5px solid ${checked ? "rgba(155,114,255,0.25)" : BORDER}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => set(!checked)}
                      style={{ accentColor: VIOLET, width: 16, height: 16 }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Focus areas */}
            <div style={{ marginBottom: 28 }}>
              <FormLabel>
                Focus areas{" "}
                <span style={{ font: "400 0.72rem system-ui", color: MUTED, marginLeft: 4 }}>
                  (optional — we&apos;ll balance everything by default)
                </span>
              </FormLabel>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {FOCUS_AREAS.map((f) => {
                  const sel = focusAreas.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFocus(f.id)}
                      style={{
                        padding: "12px 14px",
                        border: `1.5px solid ${sel ? VIOLET : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 12,
                        background: sel ? "rgba(155,114,255,0.12)" : SURFACE,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{f.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ font: "600 0.8rem system-ui", color: sel ? TEXT : "rgba(240,246,255,0.65)" }}>{f.label}</div>
                        <div style={{ font: "400 0.68rem system-ui", color: MUTED, marginTop: 1 }}>{f.sub}</div>
                      </div>
                      <span
                        style={{
                          marginLeft: "auto",
                          color: VIOLET,
                          fontSize: "0.85rem",
                          opacity: sel ? 1 : 0,
                          transition: "opacity 0.15s",
                        }}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <BackBtn onClick={() => setStep(2)} />
              <PrimaryBtn onClick={() => setStep(4)}>Set PIN →</PrimaryBtn>
            </div>
            <button
              onClick={() => setStep(4)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                font: "500 0.78rem system-ui",
                color: VIOLET,
                background: "none",
                border: "none",
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              Skip for now — use defaults
            </button>
          </FlowCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 4: PIN setup
        ══════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <FlowCard>
            <StepBar current={4} />
            <Eyebrow>Account security</Eyebrow>
            <StepTitle>Choose a 4-digit passcode</StepTitle>
            <StepSub>
              {childName || "Your child"} will use this passcode to sign in on any device. Make it something they can remember!
            </StepSub>

            <FormLabel>Passcode (4 digits)</FormLabel>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setPinError(""); }}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 14,
                border: `1.5px solid ${pinError ? "#ff7b6b" : "rgba(255,255,255,0.12)"}`,
                background: "rgba(255,255,255,0.06)",
                color: TEXT,
                fontSize: 24,
                letterSpacing: 8,
                textAlign: "center",
                fontFamily: "system-ui",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 18,
              }}
            />

            <FormLabel>Confirm passcode</FormLabel>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pinConfirm}
              onChange={(e) => { setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4)); setPinError(""); }}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 14,
                border: `1.5px solid ${pinError ? "#ff7b6b" : "rgba(255,255,255,0.12)"}`,
                background: "rgba(255,255,255,0.06)",
                color: TEXT,
                fontSize: 24,
                letterSpacing: 8,
                textAlign: "center",
                fontFamily: "system-ui",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />

            {pinError && (
              <div style={{ color: "#ff7b6b", font: "400 0.78rem system-ui", marginBottom: 14 }}>
                {pinError}
              </div>
            )}

            <div style={{ font: "400 0.75rem/1.5 system-ui", color: MUTED, marginBottom: 24, padding: "10px 14px", background: "rgba(155,114,255,0.06)", borderRadius: 10 }}>
              💡 Tip: pick a number {childName ? `${childName} ` : ""}will remember but others won&apos;t guess easily — not &ldquo;1234&rdquo; or their age.
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <BackBtn onClick={() => setStep(3)} />
              <PrimaryBtn
                onClick={() => {
                  if (pin.length !== 4) { setPinError("PIN must be exactly 4 digits."); return; }
                  if (pin !== pinConfirm) { setPinError("PINs don\u2019t match — try again."); return; }
                  setStep(5);
                }}
              >
                Review &amp; confirm →
              </PrimaryBtn>
            </div>
          </FlowCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 5: Confirmation
        ══════════════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <FlowCard>
            {/* Avatar */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(155,114,255,0.15)",
                border: "2px solid rgba(155,114,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.2rem",
                margin: "0 auto 20px",
                boxShadow: "0 4px 20px rgba(155,114,255,0.18)",
              }}
            >
              {avatar}
            </div>

            <div
              style={{
                font: "700 1.4rem system-ui",
                color: TEXT,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              {childName || "Your child"}&apos;s Adventure
            </div>

            {/* Band chip */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 14px",
                  borderRadius: 20,
                  font: "700 0.78rem system-ui",
                  background: activeBand.selectedBg,
                  border: `1.5px solid ${activeBand.border}`,
                  color: activeBand.textColor,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: activeBand.dot,
                    display: "inline-block",
                  }}
                />
                {selectedBandLabel} · {grade}
              </span>
            </div>

            {/* Details */}
            <div
              style={{
                background: "rgba(155,114,255,0.06)",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 24,
              }}
            >
              {[
                { key: "Quest name",     val: childName || "—"                  },
                { key: "Avatar",         val: `${avatar} ${childName || "—"}` },
                { key: "Grade",          val: `${grade}${age ? ` (Age ${age})` : ""}` },
                { key: "Passcode",       val: "••••"                            },
                { key: "Daily sessions", val: `${sessionLimit} (~${sessionLimit === "Unlimited" ? "unlimited" : "30–45"} min)` },
                { key: "Focus areas",    val: selectedFocusLabels               },
                { key: "Notifications",  val: notifSummary                      },
              ].map(({ key, val }) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: `1px solid ${BORDER}`,
                    font: "400 0.82rem system-ui",
                  }}
                >
                  <span style={{ color: MUTED }}>{key}</span>
                  <span style={{ color: TEXT, fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Start note */}
            <div
              style={{
                textAlign: "center",
                padding: "14px 16px",
                background: "rgba(88,232,193,0.08)",
                borderRadius: 12,
                border: `1px solid rgba(88,232,193,0.25)`,
                font: "400 0.82rem/1.5 system-ui",
                color: "rgba(88,232,193,0.8)",
                marginBottom: 24,
              }}
            >
              <strong style={{ display: "block", fontSize: "0.85rem", marginBottom: 2, color: MINT }}>
                🌟 Ready to start!
              </strong>
              {childName || "Your child"}&apos;s first session will begin from the {selectedBandLabel}. WonderQuest will personalise as they play. They sign in with their quest name and passcode. You can always edit these settings from your dashboard.
            </div>

            {upgradeRequired && (
              <div style={{ marginBottom: 14 }}>
                <UpgradePrompt reason="child_limit" limit={upgradeRequired.limit} />
              </div>
            )}
            {submitError && !upgradeRequired && (
              <div style={{ color: "#ff7b6b", font: "400 0.8rem system-ui", marginBottom: 14, padding: "10px 14px", background: "rgba(255,123,107,0.08)", borderRadius: 10 }}>
                {submitError}
              </div>
            )}

            <PrimaryBtn
              fullWidth
              onClick={async () => {
                setSubmitting(true);
                setSubmitError("");
                try {
                  const birthYear = 2026 - parseInt(age || "6", 10);
                  const resp = await fetch("/api/parent/create-child", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      displayName: childName.trim() || "Explorer",
                      username: childName.trim().toLowerCase() || "explorer",
                      avatarKey: avatar,
                      birthYear,
                      pin,
                      launchBandCode: band.toUpperCase(),
                    }),
                  });
                  if (!resp.ok) {
                    const err = await resp.json().catch(() => ({})) as { error?: string; limit?: number; plan?: string };
                    if (resp.status === 403 && err.error === "upgrade_required") {
                      setUpgradeRequired({ limit: err.limit ?? 1, plan: err.plan ?? "free" });
                      setSubmitting(false);
                      return;
                    }
                    throw new Error(err.error ?? "Something went wrong. Please try again.");
                  }
                  router.push("/parent");
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Could not create account. Please try again.";
                  setSubmitError(msg);
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Creating account…" : `🚀 Start ${childName || "their"} adventure!`}
            </PrimaryBtn>

            <button
              onClick={() => setStep(4)}
              style={{
                width: "100%",
                padding: "14px",
                background: "transparent",
                color: MUTED,
                border: `1.5px solid rgba(255,255,255,0.1)`,
                borderRadius: 12,
                font: "600 0.9rem system-ui",
                cursor: "pointer",
                marginBottom: 20,
                marginTop: 10,
              }}
            >
              ← Change PIN
            </button>

            <div
              style={{
                textAlign: "center",
                font: "400 0.74rem/1.5 system-ui",
                color: "rgba(155,140,200,0.5)",
              }}
            >
              Adding another child? You can add more from your family dashboard after this setup.
            </div>
          </FlowCard>
        )}
      </main>
    </AppFrame>
  );
}
