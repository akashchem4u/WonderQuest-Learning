"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const SURFACE = "#161b22";
const PARENT  = "#a78bfa";
const MINT    = "#58e8c1";
const GOLD    = "#ffd166";
const CORAL   = "#ff7b6b";
const GREEN   = "#50e890";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(240,246,255,0.5)";
const BORDER  = "rgba(255,255,255,0.06)";
const CARD2   = "#1c2330";

// ─── Types ────────────────────────────────────────────────────────────────────

type Child = {
  id: string;
  name: string;
  initial: string;
  color: string;
  bgColor: string;
};

type ApiStudent = { studentId: string; displayName: string; launchBandCode: string };

type AudioSettings = {
  audioMaster: boolean;
  readoutEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  sfxEnabled: boolean;
  celebrationSounds: boolean;
  voiceSpeed: "normal" | "slow";
  voiceSpeedLocked: boolean;
  readingHighlight: boolean;
  voiceLocale: "en-GB" | "en-US" | "en-AU";
};

const CHILD_COLORS = [GOLD, MINT, CORAL, PARENT, "#38bdf8"];
const CHILD_BG_COLORS = [
  "rgba(255,209,102,0.2)",
  "rgba(88,232,193,0.2)",
  "rgba(255,123,107,0.2)",
  "rgba(167,139,250,0.2)",
  "rgba(56,189,248,0.2)",
];

function apiStudentToChild(s: ApiStudent, idx: number): Child {
  return {
    id: s.studentId,
    name: s.displayName,
    initial: s.displayName.charAt(0).toUpperCase(),
    color: CHILD_COLORS[idx % CHILD_COLORS.length],
    bgColor: CHILD_BG_COLORS[idx % CHILD_BG_COLORS.length],
  };
}

const DEFAULT_AUDIO: AudioSettings = {
  audioMaster: true,
  readoutEnabled: true,
  musicEnabled: true,
  musicVolume: 50,
  sfxEnabled: true,
  celebrationSounds: true,
  voiceSpeed: "normal",
  voiceSpeedLocked: false,
  readingHighlight: false,
  voiceLocale: "en-GB",
};

const LOCALE_LABELS: Record<string, string> = {
  "en-GB": "English UK 🇬🇧",
  "en-US": "English US 🇺🇸",
  "en-AU": "English AU 🇦🇺",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  green,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  green?: boolean;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 48,
        height: 27,
        borderRadius: 27,
        background: checked ? (green ? GREEN : PARENT) : "rgba(255,255,255,0.15)",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 24 : 3,
          width: 21,
          height: 21,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}

function ToggleRow({
  icon,
  iconBg,
  title,
  desc,
  checked,
  onChange,
  extra,
  noBorder,
}: {
  icon: string;
  iconBg: string;
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  extra?: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "16px 20px",
        gap: 16,
        borderBottom: noBorder ? "none" : `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
          {title}
        </div>
        {desc && <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{desc}</div>}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "flex-end",
          gap: 8,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Toggle checked={checked} onChange={onChange} />
        {extra}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentAudioSettingsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Record<string, AudioSettings>>({});

  useEffect(() => {
    fetch("/api/parent/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.students || !Array.isArray(data.students) || data.students.length === 0) return;
        const mapped: Child[] = (data.students as ApiStudent[]).map((s, i) =>
          apiStudentToChild(s, i),
        );
        setChildren(mapped);
        const stored =
          typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
        const firstId =
          stored && mapped.find((c) => c.id === stored) ? stored : mapped[0].id;
        setActiveChild(firstId);
        setSettings(Object.fromEntries(mapped.map((c) => [c.id, { ...DEFAULT_AUDIO }])));
      })
      .catch(() => {/* ignore */});
  }, []);

  const s = settings[activeChild] ?? DEFAULT_AUDIO;
  const childObj = children.find((c) => c.id === activeChild) ?? children[0];

  function update(patch: Partial<AudioSettings>) {
    setSettings((prev) => ({
      ...prev,
      [activeChild]: { ...prev[activeChild], ...patch },
    }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const audioOff = !s.audioMaster;
  const childName = childObj?.name ?? "your child";

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: BASE,
          padding: "32px 24px 80px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          color: TEXT,
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Page header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              🔊
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: TEXT }}>
                Audio Settings
              </h1>
              <p style={{ fontSize: 13, color: MUTED, margin: "2px 0 0" }}>
                Control sound, voice readout, and music for each child
              </p>
            </div>
          </div>

          {/* Child selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" as const }}>
            {children.map((child) => {
              const active = child.id === activeChild;
              return (
                <button
                  key={child.id}
                  onClick={() => setActiveChild(child.id)}
                  style={{
                    padding: "8px 20px",
                    border: `2px solid ${active ? PARENT : BORDER}`,
                    borderRadius: 20,
                    background: active ? "rgba(167,139,250,0.1)" : "transparent",
                    color: active ? PARENT : MUTED,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: child.bgColor,
                      color: child.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {child.initial}
                  </div>
                  {child.name}
                </button>
              );
            })}
          </div>

          {/* ── Master toggle card ── */}
          <div
            style={{
              background: SURFACE,
              border: `2px solid rgba(167,139,250,0.25)`,
              borderRadius: 14,
              padding: 20,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                Sound for {childName}
              </div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.4 }}>
                When off, {childName} can still play all questions using text and images. No
                content is hidden.
              </div>
            </div>
            <Toggle
              checked={s.audioMaster}
              onChange={(v) => update({ audioMaster: v })}
              green
            />
          </div>

          {/* Audio off banner */}
          {audioOff && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: "16px 20px",
                textAlign: "center" as const,
                color: MUTED,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              🔇 Audio is off — turn on above to adjust settings
            </div>
          )}

          {/* ── Individual audio controls ── */}
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              marginBottom: 16,
              overflow: "hidden",
              opacity: audioOff ? 0.38 : 1,
              transition: "opacity 0.2s",
              pointerEvents: audioOff ? "none" : "auto",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                background: "rgba(255,255,255,0.03)",
                borderBottom: `1px solid ${BORDER}`,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: 1,
                color: MUTED,
              }}
            >
              Individual Audio Controls
            </div>

            <ToggleRow
              icon="🔊"
              iconBg="rgba(167,139,250,0.12)"
              title="Question Readout"
              desc="Read questions and answers aloud"
              checked={s.readoutEnabled}
              onChange={(v) => update({ readoutEnabled: v })}
              extra={
                <button
                  style={{
                    padding: "6px 14px",
                    border: `1px solid ${PARENT}`,
                    background: "rgba(167,139,250,0.12)",
                    color: PARENT,
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  ▶ Preview voice
                </button>
              }
            />

            <ToggleRow
              icon="🎵"
              iconBg="rgba(255,209,102,0.12)"
              title="Background Music"
              desc="Gentle background music during play"
              checked={s.musicEnabled}
              onChange={(v) => update({ musicEnabled: v })}
            />

            {/* Music volume slider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "4px 20px 16px",
                opacity: s.musicEnabled ? 1 : 0.38,
                transition: "opacity 0.2s",
                pointerEvents: s.musicEnabled ? "auto" : "none",
              }}
            >
              <span style={{ fontSize: 12, color: MUTED, minWidth: 32 }}>🔈</span>
              <input
                type="range"
                min={0}
                max={100}
                value={s.musicVolume}
                onChange={(e) => update({ musicVolume: Number(e.target.value) })}
                style={{ flex: 1, accentColor: PARENT, cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: MUTED, minWidth: 32 }}>
                {s.musicVolume}%
              </span>
            </div>

            <ToggleRow
              icon="🎮"
              iconBg="rgba(88,232,193,0.12)"
              title="Sound Effects"
              desc="Button taps, transitions, and interactions"
              checked={s.sfxEnabled}
              onChange={(v) => update({ sfxEnabled: v })}
            />

            <ToggleRow
              icon="🎉"
              iconBg="rgba(255,123,107,0.12)"
              title="Celebration Sounds"
              desc="Sounds when completing skills and earning stars"
              checked={s.celebrationSounds}
              onChange={(v) => update({ celebrationSounds: v })}
              noBorder
            />
          </div>

          {/* ── Voice Settings ── */}
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              marginBottom: 16,
              overflow: "hidden",
              opacity: audioOff || !s.readoutEnabled ? 0.38 : 1,
              transition: "opacity 0.2s",
              pointerEvents: audioOff || !s.readoutEnabled ? "none" : "auto",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                background: "rgba(255,255,255,0.03)",
                borderBottom: `1px solid ${BORDER}`,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: 1,
                color: MUTED,
              }}
            >
              Voice Settings
            </div>

            {/* Voice Speed */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${BORDER}`,
                display: "flex",
                flexDirection: "column" as const,
                gap: 10,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Voice Speed</div>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  { id: "normal", label: "Normal (0.9×)" },
                  { id: "slow",   label: "Slow (0.75×)"  },
                ] as const).map(({ id, label }) => {
                  const active = s.voiceSpeed === id;
                  return (
                    <button
                      key={id}
                      onClick={() => update({ voiceSpeed: id })}
                      style={{
                        padding: "7px 16px",
                        border: `1px solid ${active ? PARENT : BORDER}`,
                        borderRadius: 20,
                        background: active ? "rgba(167,139,250,0.15)" : "transparent",
                        color: active ? PARENT : MUTED,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lock to Slow */}
            <ToggleRow
              icon="🔒"
              iconBg="rgba(255,209,102,0.1)"
              title="Lock to Slow"
              desc={`${childName} can't change this speed setting`}
              checked={s.voiceSpeedLocked}
              onChange={(v) => update({ voiceSpeedLocked: v })}
            />

            {/* Reading Highlight */}
            <ToggleRow
              icon="✨"
              iconBg="rgba(80,232,144,0.1)"
              title="Reading Highlight"
              desc="Highlight words as they're read"
              checked={s.readingHighlight}
              onChange={(v) => update({ readingHighlight: v })}
            />

            {/* Voice Language */}
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column" as const,
                gap: 8,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Voice Language</div>
              <div style={{ fontSize: 12, color: MUTED }}>
                Accent preference — all voices read in English
              </div>
              <select
                value={s.voiceLocale}
                onChange={(e) =>
                  update({ voiceLocale: e.target.value as AudioSettings["voiceLocale"] })
                }
                style={{
                  background: CARD2,
                  border: `1px solid ${BORDER}`,
                  color: TEXT,
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                  outline: "none",
                  minWidth: 160,
                  maxWidth: 220,
                }}
              >
                <option value="en-GB">English UK 🇬🇧</option>
                <option value="en-US">English US 🇺🇸</option>
                <option value="en-AU">English AU 🇦🇺</option>
              </select>
            </div>
          </div>

          {/* ── Save row ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap" as const,
              marginTop: 8,
            }}
          >
            <button
              onClick={handleSave}
              style={{
                padding: "13px 32px",
                background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              Save Settings
            </button>
            <span style={{ fontSize: 13, color: MUTED }}>Changes apply next session</span>
            {saved && (
              <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>✓ Saved!</span>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
