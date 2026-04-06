"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

type VoiceId   = "owl" | "fox" | "dragon" | "bear";
type SpeedId   = "slow" | "normal" | "fast";
type VolumeId  = "low" | "medium" | "high";

interface VoiceOption {
  id: VoiceId;
  name: string;
  emoji: string;
  desc: string;
  avatarBg: string;
}

const VOICES: VoiceOption[] = [
  { id: "owl",    name: "Wise Owl",      emoji: "🦉", desc: "Calm and clear · great for learning",  avatarBg: "linear-gradient(135deg,#1a0820,#3b1060)" },
  { id: "fox",    name: "Friendly Fox",  emoji: "🦊", desc: "Warm and cheerful · feels like a friend", avatarBg: "linear-gradient(135deg,#2a1000,#5a2800)" },
  { id: "dragon", name: "Magic Dragon",  emoji: "🐉", desc: "Bold and magical · full of adventure",  avatarBg: "linear-gradient(135deg,#002a1a,#005a38)" },
  { id: "bear",   name: "Cozy Bear",     emoji: "🐻", desc: "Gentle and soft · easy to listen to",   avatarBg: "linear-gradient(135deg,#1e1000,#3c2800)" },
];

const SPEEDS: { id: SpeedId; emoji: string; label: string; hint: string }[] = [
  { id: "slow",   emoji: "🐢", label: "Slow",   hint: "Great for new readers!" },
  { id: "normal", emoji: "🐇", label: "Normal", hint: "Just right for most" },
  { id: "fast",   emoji: "⚡", label: "Fast",   hint: "Speedy learner!" },
];

const VOLUMES: { id: VolumeId; emoji: string; label: string }[] = [
  { id: "low",    emoji: "🔈", label: "Low" },
  { id: "medium", emoji: "🔉", label: "Medium" },
  { id: "high",   emoji: "🔊", label: "High" },
];

const STORAGE_KEY = "wq_voice_prefs";

interface VoicePrefs {
  voice: VoiceId;
  speed: SpeedId;
  volume: VolumeId;
  readAloud: boolean;
}

function loadPrefs(): VoicePrefs {
  if (typeof window === "undefined") {
    return { voice: "owl", speed: "normal", volume: "medium", readAloud: true };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VoicePrefs;
  } catch {
    // ignore
  }
  return { voice: "owl", speed: "normal", volume: "medium", readAloud: true };
}

export default function VoicePreferencesPage() {
  const router = useRouter();

  const [voice,     setVoice]     = useState<VoiceId>("owl");
  const [speed,     setSpeed]     = useState<SpeedId>("normal");
  const [volume,    setVolume]    = useState<VolumeId>("medium");
  const [readAloud, setReadAloud] = useState(true);
  const [saved,     setSaved]     = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const prefs = loadPrefs();
    setVoice(prefs.voice);
    setSpeed(prefs.speed);
    setVolume(prefs.volume);
    setReadAloud(prefs.readAloud);
  }, []);

  function handleSave() {
    const prefs: VoicePrefs = { voice, speed, volume, readAloud };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => router.push("/child"), 900);
  }

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const BASE    = "#100b2e";
  const SURFACE = "#161b22";
  const VIOLET  = "#9b72ff";
  const MINT    = "#22c55e";
  const BORDER  = "rgba(155,114,255,0.22)";
  const TEXT     = "#f0eaff";
  const MUTED    = "#9b8ec4";

  // ── Sub-components ──────────────────────────────────────────────────────────

  const SectionHead = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      fontSize: 11,
      fontWeight: 900,
      color: MUTED,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: 10,
    }}>{children}</div>
  );

  const pillBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "12px 8px",
    borderRadius: 14,
    border: `2px solid ${active ? VIOLET : "rgba(155,114,255,0.18)"}`,
    background: active ? "rgba(155,114,255,0.18)" : SURFACE,
    cursor: "pointer",
    textAlign: "center",
    transition: "border-color 0.15s, background 0.15s",
  });

  const toggleTrack = (on: boolean): React.CSSProperties => ({
    width: 50,
    height: 28,
    borderRadius: 14,
    background: on ? VIOLET : "rgba(155,114,255,0.2)",
    position: "relative",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.2s",
  });

  const toggleKnob = (on: boolean): React.CSSProperties => ({
    position: "absolute",
    top: 4,
    left: on ? 24 : 4,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#fff",
    transition: "left 0.18s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
  });

  return (
    <AppFrame audience="kid">
      <div style={{
        background: BASE,
        minHeight: "100vh",
        fontFamily: "'Nunito', system-ui, sans-serif",
        color: TEXT,
        padding: "28px 20px 40px",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 8 }}>🎙️</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: TEXT, margin: 0, lineHeight: 1.2 }}>
            Voice Settings
          </h1>
          <p style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>
            Pick how your guide sounds when helping you learn!
          </p>
        </div>

        {/* Voice Coach Selection */}
        <div>
          <SectionHead>Choose your voice guide</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {VOICES.map((v) => {
              const isSelected = voice === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setVoice(v.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: `2px solid ${isSelected ? VIOLET : "rgba(155,114,255,0.18)"}`,
                    background: isSelected ? "rgba(155,114,255,0.14)" : SURFACE,
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: v.avatarBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                    border: isSelected ? `2px solid ${VIOLET}` : "2px solid transparent",
                  }}>
                    {v.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? "#d4bcff" : TEXT }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{v.desc}</div>
                  </div>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `2px solid ${isSelected ? VIOLET : "rgba(155,114,255,0.3)"}`,
                    background: isSelected ? VIOLET : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#fff",
                    flexShrink: 0,
                  }}>
                    {isSelected ? "✓" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Speed Control */}
        <div>
          <SectionHead>How fast should I talk?</SectionHead>
          <div style={{ display: "flex", gap: 8 }}>
            {SPEEDS.map((s) => {
              const isActive = speed === s.id;
              return (
                <div key={s.id} onClick={() => setSpeed(s.id)} style={pillBtn(isActive)}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? "#d4bcff" : TEXT }}>{s.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: VIOLET, fontWeight: 700, textAlign: "center", marginTop: 8 }}>
            {SPEEDS.find((s) => s.id === speed)?.hint}
          </div>
        </div>

        {/* Volume */}
        <div>
          <SectionHead>How loud?</SectionHead>
          <div style={{ display: "flex", gap: 8 }}>
            {VOLUMES.map((v) => {
              const isActive = volume === v.id;
              return (
                <div key={v.id} onClick={() => setVolume(v.id)} style={pillBtn(isActive)}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{v.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? "#d4bcff" : TEXT }}>{v.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Read aloud toggle */}
        <div style={{
          background: SURFACE,
          borderRadius: 16,
          padding: "16px 18px",
          border: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>
              📖 Read questions aloud
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
              Your guide will read each question to you
            </div>
          </div>
          <div onClick={() => setReadAloud(!readAloud)} style={toggleTrack(readAloud)}>
            <div style={toggleKnob(readAloud)} />
          </div>
        </div>

        {/* Current selection summary */}
        <div style={{
          background: "rgba(155,114,255,0.1)",
          borderRadius: 14,
          padding: "14px 18px",
          border: `1px solid rgba(155,114,255,0.25)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 6 }}>
            Your picks right now:
          </div>
          <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.7 }}>
            <span style={{ fontWeight: 800 }}>{VOICES.find((v) => v.id === voice)?.emoji} {VOICES.find((v) => v.id === voice)?.name}</span>
            {" · "}
            <span>{SPEEDS.find((s) => s.id === speed)?.emoji} {SPEEDS.find((s) => s.id === speed)?.label} speed</span>
            {" · "}
            <span>{VOLUMES.find((v) => v.id === volume)?.emoji} {volume} volume</span>
            {readAloud ? (
              <span style={{ display: "block", color: MINT, fontWeight: 700, marginTop: 2 }}>
                ✓ Questions will be read aloud
              </span>
            ) : (
              <span style={{ display: "block", color: MUTED, marginTop: 2 }}>
                Reading aloud is off
              </span>
            )}
          </div>
        </div>

        {/* Save / All Set button */}
        <button
          onClick={handleSave}
          disabled={saved}
          style={{
            width: "100%",
            padding: "18px 0",
            borderRadius: 18,
            border: "none",
            background: saved
              ? `linear-gradient(135deg,${MINT},#16a34a)`
              : `linear-gradient(135deg,${VIOLET},#7c4dff)`,
            color: "#fff",
            fontSize: 18,
            fontWeight: 900,
            fontFamily: "'Nunito', system-ui, sans-serif",
            cursor: saved ? "default" : "pointer",
            letterSpacing: "0.01em",
            boxShadow: saved
              ? "0 4px 20px rgba(34,197,94,0.35)"
              : "0 4px 20px rgba(155,114,255,0.4)",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        >
          {saved ? "✓ All set! Taking you back..." : "All set! Save my picks 🎉"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: MUTED, margin: 0 }}>
          You can always come back and change these later!
        </p>
      </div>
    </AppFrame>
  );
}
