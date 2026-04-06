"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg: "#100b2e",
  card: "#1e1840",
  cardAlt: "#17133a",
  border: "#2a2060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#22c55e",
  text: "#e8e0ff",
  muted: "#9080c0",
  toggleOff: "#2a2060",
};

interface Prefs {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  readAloud: boolean;
  soundEffects: boolean;
}

const DEFAULT_PREFS: Prefs = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  readAloud: false,
  soundEffects: true,
};

const STORAGE_KEY = "wq_accessibility_prefs";

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

// ── Toggle component ──────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  id,
  accentColor = C.violet,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  accentColor?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      style={{
        ...FONT,
        width: 56,
        height: 30,
        borderRadius: 15,
        border: `2px solid ${checked ? accentColor : C.toggleOff}`,
        background: checked ? accentColor : "#13102a",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s, border-color 0.2s",
        padding: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 2,
        left: checked ? 26 : 2,
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: checked ? "#fff" : C.muted,
        transition: "left 0.2s",
        display: "block",
      }} />
    </button>
  );
}

// ── Setting row ───────────────────────────────────────────────────────────────

function SettingRow({
  id,
  emoji,
  label,
  hint,
  checked,
  onChange,
  accentColor,
}: {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accentColor?: string;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 18px",
      background: C.card,
      borderRadius: 16,
      border: `1.5px solid ${checked ? (accentColor ?? C.violet) + "55" : C.border}`,
    }}>
      <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{emoji}</span>
      <label htmlFor={id} style={{ flex: 1, cursor: "pointer" }}>
        <div style={{ fontSize: "1rem", fontWeight: 900, color: C.text, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: C.muted, lineHeight: 1.4 }}>
          {hint}
        </div>
      </label>
      <Toggle id={id} checked={checked} onChange={onChange} accentColor={accentColor} />
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 2,
    }}>
      <span style={{ fontSize: "1.3rem" }}>{emoji}</span>
      <span style={{
        fontSize: "0.78rem",
        fontWeight: 900,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: C.muted,
      }}>
        {title}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChildAccessibilityPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  function update<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    savePrefs(prefs);
    setSaved(true);
    setTimeout(() => router.push("/child"), 600);
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes saved-pop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        ...FONT,
        background: C.bg,
        minHeight: "100vh",
        padding: "32px 16px 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 28,
          animation: "fade-up 0.4s ease-out both",
        }}>

          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.8rem", marginBottom: 8 }}>♿</div>
            <h1 style={{
              fontSize: "1.8rem",
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              lineHeight: 1.2,
            }}>
              How do you like things to look?
            </h1>
            <p style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: C.muted,
              marginTop: 8,
              lineHeight: 1.5,
            }}>
              Change these to make WonderQuest feel just right for you!
            </p>
          </div>

          {/* Section: How things look */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionHeader emoji="👀" title="How things look" />
            <SettingRow
              id="high-contrast"
              emoji="🔲"
              label="High Contrast"
              hint="Makes borders bigger and colours easier to see"
              checked={prefs.highContrast}
              onChange={(v) => update("highContrast", v)}
              accentColor={C.gold}
            />
            <SettingRow
              id="large-text"
              emoji="🔡"
              label="Large Text"
              hint="Makes all the words bigger and easier to read"
              checked={prefs.largeText}
              onChange={(v) => update("largeText", v)}
              accentColor={C.violet}
            />
            <SettingRow
              id="reduce-motion"
              emoji="🧘"
              label="Reduce Motion"
              hint="Turns off spinning and bouncing animations"
              checked={prefs.reduceMotion}
              onChange={(v) => update("reduceMotion", v)}
              accentColor={C.mint}
            />
          </div>

          {/* Section: How things sound */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionHeader emoji="🔊" title="How things sound" />
            <SettingRow
              id="read-aloud"
              emoji="🗣️"
              label="Read Questions Aloud"
              hint="The app will speak each question out loud for you"
              checked={prefs.readAloud}
              onChange={(v) => update("readAloud", v)}
              accentColor={C.violet}
            />
            <SettingRow
              id="sound-effects"
              emoji="🎵"
              label="Sound Effects"
              hint="Fun sounds when you get answers right or earn badges"
              checked={prefs.soundEffects}
              onChange={(v) => update("soundEffects", v)}
              accentColor={C.mint}
            />
          </div>

          {/* Save button */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
            <button
              onClick={handleSave}
              style={{
                ...FONT,
                width: "100%",
                height: 60,
                borderRadius: 30,
                border: "none",
                background: saved
                  ? `linear-gradient(135deg, ${C.mint}, #16a34a)`
                  : `linear-gradient(135deg, ${C.violet}, #7248e8)`,
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: saved
                  ? `0 4px 20px ${C.mint}55`
                  : `0 4px 20px ${C.violet}55`,
                transition: "background 0.3s, box-shadow 0.3s",
                animation: saved ? "saved-pop 0.4s ease-out" : "none",
              }}
            >
              {saved ? "✅ All saved!" : "All set! ✨"}
            </button>

            <button
              onClick={() => router.push("/child")}
              style={{
                ...FONT,
                width: "100%",
                height: 48,
                borderRadius: 24,
                border: `2px solid ${C.border}`,
                background: "transparent",
                color: C.muted,
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ← Back without saving
            </button>
          </div>

          {/* Friendly note */}
          <div style={{
            background: C.cardAlt,
            border: `1.5px solid ${C.border}`,
            borderRadius: 14,
            padding: "14px 18px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: C.muted,
            lineHeight: 1.5,
            textAlign: "center",
          }}>
            💡 A grown-up can also help you change these settings any time!
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
