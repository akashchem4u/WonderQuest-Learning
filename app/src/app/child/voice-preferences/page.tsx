"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

type SpeedId = "slow" | "normal" | "fast";

const SPEEDS: { id: SpeedId; emoji: string; label: string; hint: string }[] = [
  { id: "slow",   emoji: "🐢", label: "Slow",   hint: "Great for new readers!" },
  { id: "normal", emoji: "🐇", label: "Normal", hint: "Just right for most" },
  { id: "fast",   emoji: "⚡", label: "Fast",   hint: "Speedy learner!" },
];

const C = {
  bg:      "#100b2e",
  surface: "#161b22",
  gold:    "#ffd166",
  violet:  "#9b72ff",
  mint:    "#22c55e",
  border:  "rgba(155,114,255,0.22)",
  text:    "#f0eaff",
  muted:   "#9b8ec4",
};

const FONT: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif" };

function Toggle({ checked, onChange, id, accentColor = C.gold }: {
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
        width: 60,
        height: 34,
        minHeight: 48,
        borderRadius: 17,
        border: `2px solid ${checked ? accentColor : "rgba(155,114,255,0.25)"}`,
        background: checked ? accentColor : "#13102a",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s, border-color 0.2s",
        padding: 0,
        alignSelf: "center",
      }}
    >
      <span style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        left: checked ? 30 : 4,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: checked ? "#fff" : C.muted,
        transition: "left 0.2s",
        display: "block",
      }} />
    </button>
  );
}

function SettingRow({ id, emoji, label, hint, checked, onChange }: {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "18px 20px",
      background: C.surface,
      borderRadius: 18,
      border: `1.5px solid ${checked ? C.gold + "55" : C.border}`,
      minHeight: 72,
    }}>
      <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{emoji}</span>
      <label htmlFor={id} style={{ flex: 1, cursor: "pointer" }}>
        <div style={{ ...FONT, fontSize: "1rem", fontWeight: 900, color: C.text, marginBottom: 2 }}>{label}</div>
        <div style={{ ...FONT, fontSize: "0.82rem", fontWeight: 700, color: C.muted, lineHeight: 1.4 }}>{hint}</div>
      </label>
      <Toggle id={id} checked={checked} onChange={onChange} accentColor={C.gold} />
    </div>
  );
}

export default function VoicePreferencesPage() {
  const router = useRouter();

  const [speed,  setSpeed]  = useState<SpeedId>("normal");
  const [sounds, setSounds] = useState(true);
  const [tts,    setTts]    = useState(true);
  const [saved,  setSaved]  = useState(false);

  // Auth check
  useEffect(() => {
    if (!document.cookie.includes("wonderquest-child-session")) {
      router.replace("/child");
    }
  }, [router]);

  // Load saved preferences
  useEffect(() => {
    try {
      const savedSpeed = localStorage.getItem("wq_voice_speed") as SpeedId | null;
      const savedSounds = localStorage.getItem("wq_sounds");
      const savedTts = localStorage.getItem("wq_tts");
      if (savedSpeed && (["slow", "normal", "fast"] as string[]).includes(savedSpeed)) {
        setSpeed(savedSpeed);
      }
      if (savedSounds !== null) setSounds(savedSounds === "true");
      if (savedTts !== null) setTts(savedTts === "true");
    } catch {
      // ignore
    }
  }, []);

  function handleSave() {
    try {
      localStorage.setItem("wq_voice_speed", speed);
      localStorage.setItem("wq_sounds", String(sounds));
      localStorage.setItem("wq_tts", String(tts));
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const pillBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "16px 8px",
    minHeight: 80,
    borderRadius: 16,
    border: `2px solid ${active ? C.gold : "rgba(155,114,255,0.18)"}`,
    background: active ? "rgba(255,209,102,0.14)" : C.surface,
    cursor: "pointer",
    textAlign: "center",
    transition: "border-color 0.15s, background 0.15s",
  });

  return (
    <AppFrame audience="kid">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
      `}</style>

      <div style={{
        ...FONT,
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        padding: "28px 20px 60px",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}>

        {/* Back link */}
        <div>
          <Link href="/child/hub" style={{
            color: C.gold,
            fontWeight: 900,
            fontSize: 14,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            minHeight: 48,
          }}>
            ← Back to Hub
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 50, lineHeight: 1, marginBottom: 8 }}>🎙️</div>
          <h1 style={{ ...FONT, fontSize: 26, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1.2 }}>
            How do you like to hear things?
          </h1>
          <p style={{ ...FONT, fontSize: 14, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
            Set how WonderQuest talks to you!
          </p>
        </div>

        {/* Voice Speed */}
        <div>
          <div style={{
            ...FONT,
            fontSize: 11, fontWeight: 900, color: C.muted,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>
            How fast should I talk?
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {SPEEDS.map((s) => {
              const isActive = speed === s.id;
              return (
                <div key={s.id} onClick={() => setSpeed(s.id)} role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSpeed(s.id)}
                  style={pillBtn(isActive)}>
                  <div style={{ fontSize: 30, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{ ...FONT, fontSize: 14, fontWeight: 900, color: isActive ? C.gold : C.text }}>{s.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{ ...FONT, fontSize: 12, color: C.gold, fontWeight: 700, textAlign: "center", marginTop: 8 }}>
            {SPEEDS.find((s) => s.id === speed)?.hint}
          </div>
        </div>

        {/* Sound effects toggle */}
        <SettingRow
          id="sounds"
          emoji="🎵"
          label="Sound Effects"
          hint="Fun sounds when you get answers right or earn badges"
          checked={sounds}
          onChange={setSounds}
        />

        {/* Read aloud toggle */}
        <SettingRow
          id="tts"
          emoji="📖"
          label="Read questions out loud for me"
          hint="WonderQuest will speak each question so you can hear it"
          checked={tts}
          onChange={setTts}
        />

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            ...FONT,
            width: "100%",
            minHeight: 64,
            borderRadius: 20,
            border: "none",
            background: saved
              ? `linear-gradient(135deg,${C.mint},#16a34a)`
              : `linear-gradient(135deg,${C.gold},#e09000)`,
            color: saved ? "#fff" : "#1a0800",
            fontSize: 18,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: saved
              ? `0 4px 20px rgba(34,197,94,0.35)`
              : `0 4px 20px rgba(255,209,102,0.35)`,
            transition: "background 0.2s, box-shadow 0.2s",
            letterSpacing: "0.01em",
          }}
        >
          {saved ? "Saved! ✓" : "Save my picks 🎉"}
        </button>

        <p style={{ ...FONT, textAlign: "center", fontSize: 12, color: C.muted, margin: 0 }}>
          You can always come back and change these!
        </p>
      </div>
    </AppFrame>
  );
}
