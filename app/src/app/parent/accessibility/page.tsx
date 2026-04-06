"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const SURFACE = "#161b22";
const VIOLET  = "#9b72ff";
const PARENT  = "#a78bfa";
const MINT    = "#22c55e";
const GOLD    = "#ffd166";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(240,246,255,0.5)";
const BORDER  = "rgba(255,255,255,0.06)";

// ─── Types ────────────────────────────────────────────────────────────────────

type Child = { id: string; name: string };

type ApiStudent = { studentId: string; displayName: string; launchBandCode: string };

type AccessibilitySettings = {
  displayMode: "dark" | "light" | "high-contrast";
  textSize: number; // 0=Small 1=Med 2=Large 3=XL
  boldText: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  readQuestionsAloud: boolean;
  backgroundMusic: boolean;
  soundEffects: boolean;
  celebrationSounds: boolean;
  voiceSpeed: "normal" | "slow";
  lockVoiceSpeed: boolean;
  largeAnswerButtons: boolean;
  highContrastAnswerButtons: boolean;
  showQuestionNumber: boolean;
};

const DEFAULT_SETTINGS: AccessibilitySettings = {
  displayMode: "dark",
  textSize: 1,
  boldText: false,
  reduceMotion: false,
  reduceTransparency: false,
  readQuestionsAloud: true,
  backgroundMusic: true,
  soundEffects: true,
  celebrationSounds: true,
  voiceSpeed: "normal",
  lockVoiceSpeed: false,
  largeAnswerButtons: false,
  highContrastAnswerButtons: false,
  showQuestionNumber: true,
};

const TEXT_SIZE_LABELS = ["Small", "Medium", "Large", "XL"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? PARENT : "rgba(255,255,255,0.14)",
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
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}

function SettingRow({
  label,
  sub,
  right,
}: {
  label: string;
  sub?: string;
  right: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: `1px solid ${BORDER}`,
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sub}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.08em",
          color: PARENT,
          padding: "14px 20px",
          borderBottom: `1px solid ${BORDER}`,
          background: "rgba(167,139,250,0.06)",
        }}
      >
        {title}
      </div>
      <div style={{ paddingTop: 2, paddingBottom: 2 }}>{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentAccessibilityPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Record<string, AccessibilitySettings>>({});

  useEffect(() => {
    fetch("/api/parent/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.students || !Array.isArray(data.students) || data.students.length === 0) return;
        const mapped: Child[] = (data.students as ApiStudent[]).map((s) => ({
          id: s.studentId,
          name: s.displayName,
        }));
        setChildren(mapped);
        const stored =
          typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
        const firstId =
          stored && mapped.find((c) => c.id === stored) ? stored : mapped[0].id;
        setActiveChild(firstId);
        setSettings(Object.fromEntries(mapped.map((c) => [c.id, { ...DEFAULT_SETTINGS }])));
      })
      .catch(() => {/* ignore */});
  }, []);

  const s = settings[activeChild] ?? DEFAULT_SETTINGS;

  function update(patch: Partial<AccessibilitySettings>) {
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

  const segOptions: Array<{ label: string; value: AccessibilitySettings["displayMode"] }> = [
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
    { label: "High Contrast", value: "high-contrast" },
  ];

  return (
    <AppFrame audience="parent">
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
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0, marginBottom: 6 }}>
              Accessibility Settings
            </h1>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
              Manage how WonderQuest looks and sounds for each child
            </p>
          </div>

          {/* Child selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" as const }}>
            {children.map((child) => {
              const active = child.id === activeChild;
              return (
                <button
                  key={child.id}
                  onClick={() => setActiveChild(child.id)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 20,
                    border: `1.5px solid ${active ? PARENT : BORDER}`,
                    background: active ? "rgba(167,139,250,0.15)" : "transparent",
                    color: active ? PARENT : MUTED,
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {child.name}
                </button>
              );
            })}
          </div>

          {/* ── Section 1: Visual Settings ── */}
          <SectionCard title="Visual Settings">
            {/* Display Mode */}
            <SettingRow
              label="Display Mode"
              sub="Parent sets the display theme for this child"
              right={
                <div
                  style={{
                    display: "flex",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    padding: 3,
                    gap: 2,
                  }}
                >
                  {segOptions.map((opt) => {
                    const active = s.displayMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update({ displayMode: opt.value })}
                        style={{
                          padding: "6px 14px",
                          border: "none",
                          background: active ? PARENT : "transparent",
                          color: active ? "#fff" : MUTED,
                          fontSize: 13,
                          fontWeight: active ? 600 : 500,
                          borderRadius: 6,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              }
            />

            {/* Text Size */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: `1px solid ${BORDER}`,
                gap: 16,
                flexWrap: "wrap" as const,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>Text Size</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  Adjusts font size across the child's UI
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    value={s.textSize}
                    onChange={(e) => update({ textSize: Number(e.target.value) })}
                    style={{
                      width: 160,
                      accentColor: PARENT,
                      cursor: "pointer",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      color: PARENT,
                      fontWeight: 500,
                      minWidth: 60,
                      textAlign: "right" as const,
                    }}
                  >
                    {TEXT_SIZE_LABELS[s.textSize]}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: 160,
                    marginTop: 4,
                  }}
                >
                  {["S", "M", "L", "XL"].map((l) => (
                    <span key={l} style={{ fontSize: 10, color: MUTED }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bold text */}
            <SettingRow
              label="Bold text"
              sub="Increases font weight across the child UI"
              right={<Toggle checked={s.boldText} onChange={(v) => update({ boldText: v })} />}
            />

            {/* Reduce Motion */}
            <SettingRow
              label="Reduce Motion"
              sub="Disables animations and transitions"
              right={
                <Toggle checked={s.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
              }
            />

            {/* Reduce Transparency */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>
                  Reduce transparency
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  Disables blur and glass effects
                </div>
              </div>
              <Toggle
                checked={s.reduceTransparency}
                onChange={(v) => update({ reduceTransparency: v })}
              />
            </div>
          </SectionCard>

          {/* ── Section 2: Audio Settings ── */}
          <SectionCard title="Audio Settings">
            <SettingRow
              label="Read questions aloud"
              sub="Master audio switch for question narration"
              right={
                <Toggle
                  checked={s.readQuestionsAloud}
                  onChange={(v) => update({ readQuestionsAloud: v })}
                />
              }
            />
            <SettingRow
              label="Background music"
              right={
                <Toggle
                  checked={s.backgroundMusic}
                  onChange={(v) => update({ backgroundMusic: v })}
                />
              }
            />
            <SettingRow
              label="Sound effects"
              right={
                <Toggle
                  checked={s.soundEffects}
                  onChange={(v) => update({ soundEffects: v })}
                />
              }
            />
            <SettingRow
              label="Celebration sounds"
              sub="Plays when a child completes a round"
              right={
                <Toggle
                  checked={s.celebrationSounds}
                  onChange={(v) => update({ celebrationSounds: v })}
                />
              }
            />

            {/* Voice Speed */}
            <SettingRow
              label="Voice Speed"
              sub="Narration playback rate"
              right={
                <div style={{ display: "flex", gap: 6 }}>
                  {(["normal", "slow"] as const).map((speed) => {
                    const active = s.voiceSpeed === speed;
                    return (
                      <button
                        key={speed}
                        onClick={() => update({ voiceSpeed: speed })}
                        style={{
                          padding: "6px 16px",
                          borderRadius: 20,
                          border: `1.5px solid ${active ? PARENT : BORDER}`,
                          background: active ? "rgba(167,139,250,0.15)" : "transparent",
                          color: active ? PARENT : MUTED,
                          fontSize: 13,
                          fontWeight: active ? 600 : 500,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          textTransform: "capitalize" as const,
                        }}
                      >
                        {speed.charAt(0).toUpperCase() + speed.slice(1)}
                      </button>
                    );
                  })}
                </div>
              }
            />

            {/* Lock voice speed */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>
                  Lock voice speed to Slow
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  Child cannot change narration speed
                </div>
              </div>
              <Toggle
                checked={s.lockVoiceSpeed}
                onChange={(v) => update({ lockVoiceSpeed: v })}
              />
            </div>
          </SectionCard>

          {/* ── Section 3: Play Settings ── */}
          <SectionCard title="Play Settings">
            <SettingRow
              label="Large answer buttons"
              sub="Forces largest button size regardless of band"
              right={
                <Toggle
                  checked={s.largeAnswerButtons}
                  onChange={(v) => update({ largeAnswerButtons: v })}
                />
              }
            />
            <SettingRow
              label="High contrast answer buttons"
              sub="Adds thick borders on answer buttons for visibility"
              right={
                <Toggle
                  checked={s.highContrastAnswerButtons}
                  onChange={(v) => update({ highContrastAnswerButtons: v })}
                />
              }
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>
                  Show question number
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  Displays "Question 3 of 10" as an orientation aid
                </div>
              </div>
              <Toggle
                checked={s.showQuestionNumber}
                onChange={(v) => update({ showQuestionNumber: v })}
              />
            </div>
          </SectionCard>

          {/* ── Save bar ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 4 }}>
            <button
              onClick={handleSave}
              style={{
                padding: "12px 28px",
                background: PARENT,
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              Save Settings
            </button>
            {saved && (
              <span style={{ fontSize: 13, color: "#50e890", fontWeight: 600 }}>
                ✓ Saved!
              </span>
            )}
            {!saved && (
              <span style={{ fontSize: 13, color: MUTED }}>
                Changes apply next session
              </span>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
