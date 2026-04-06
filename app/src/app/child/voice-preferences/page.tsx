"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

type VoiceId = "coach" | "buddy" | "whisper" | "zap";
type SpeedId  = "slow" | "normal" | "fast";
type TabId    = "default" | "preview" | "settings";

interface Voice {
  id: VoiceId;
  name: string;
  emoji: string;
  desc: string;
  avatarBg: string;
}

const VOICES: Voice[] = [
  { id: "coach",   name: "Coach Leo", emoji: "🦁", desc: "Warm and encouraging · deep voice",   avatarBg: "linear-gradient(135deg,#1e1470,#3b28cc)" },
  { id: "buddy",   name: "Buddy",     emoji: "🐧", desc: "Playful and silly · high energy",     avatarBg: "linear-gradient(135deg,#0a2a28,#1a4a40)" },
  { id: "whisper", name: "Whisper",   emoji: "🦉", desc: "Calm and gentle · soft voice",        avatarBg: "linear-gradient(135deg,#1a0820,#2a1040)" },
  { id: "zap",     name: "Zap",       emoji: "🤖", desc: "Fun robot voice · zingy energy",      avatarBg: "linear-gradient(135deg,#1a1000,#2a2010)" },
];

const SPEEDS: { id: SpeedId; emoji: string; label: string }[] = [
  { id: "slow",   emoji: "🐢", label: "Slow" },
  { id: "normal", emoji: "🐇", label: "Normal" },
  { id: "fast",   emoji: "⚡", label: "Fast" },
];

const TABS: { id: TabId; label: string }[] = [
  { id: "default",  label: "Default (Coach)" },
  { id: "preview",  label: "Preview Playing" },
  { id: "settings", label: "Speed + Volume" },
];

export default function VoicePreferencesPage() {
  const [activeTab,      setActiveTab]      = useState<TabId>("default");
  const [selectedVoice,  setSelectedVoice]  = useState<VoiceId>("coach");
  const [selectedSpeed,  setSelectedSpeed]  = useState<SpeedId>("normal");
  const [previewPlaying, setPreviewPlaying] = useState<VoiceId | null>(null);
  const [voiceOn,        setVoiceOn]        = useState(true);
  const [sfxOn,          setSfxOn]          = useState(true);
  const [musicOn,        setMusicOn]        = useState(false);

  const violet = "#9b72ff";
  const surface = "#100b2e";
  const border  = "#2a2060";
  const text    = "#e8e0ff";
  const muted   = "#9b8ec4";

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? violet : "#1a1540",
    border: `2px solid ${active ? violet : "#2a2060"}`,
    borderRadius: 8, color: active ? "#fff" : muted,
    fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 13, fontWeight: 700,
    padding: "7px 16px", cursor: "pointer",
  });

  const toggleStyle = (on: boolean): React.CSSProperties => ({
    width: 44, height: 24, borderRadius: 12, background: on ? violet : "#2a2060",
    position: "relative", cursor: "pointer", flexShrink: 0, display: "inline-block",
  });

  const toggleKnob = (on: boolean): React.CSSProperties => ({
    content: "", position: "absolute", top: 3,
    left: on ? "auto" : 3, right: on ? 3 : "auto",
    width: 18, height: 18, background: "#fff", borderRadius: "50%",
  });

  const WaveAnimation = () => (
    <>
      <style>{`
        @keyframes wave-bounce { 0%,100%{height:4px} 50%{height:14px} }
      `}</style>
      <div style={{ display: "flex", gap: 2, alignItems: "center", height: 16 }}>
        {[
          { dur: "0.6s", delay: "0s" },
          { dur: "0.4s", delay: "0.1s" },
          { dur: "0.8s", delay: "0.2s" },
          { dur: "0.5s", delay: "0.05s" },
          { dur: "0.7s", delay: "0.15s" },
        ].map((bar, i) => (
          <div key={i} style={{ width: 3, borderRadius: 2, background: violet, animationName: "wave-bounce", animationDuration: bar.dur, animationDelay: bar.delay, animationTimingFunction: "ease-in-out", animationIterationCount: "infinite" }} />
        ))}
      </div>
    </>
  );

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} style={toggleStyle(on)}>
      <div style={toggleKnob(on)} />
    </div>
  );

  const PhoneShell = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: surface, borderRadius: 40, border: `2px solid ${border}`, boxShadow: "inset 0 0 0 2px rgba(155,114,255,0.13), 0 20px 50px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px 4px", fontSize: 11, color: muted, fontWeight: 700 }}>
          <span>9:41</span><span>Voice Settings</span><span>🔋</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 14px" }}>
          <button style={{ background: "transparent", border: `2px solid ${border}`, borderRadius: 8, color: muted, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 12, fontWeight: 700, padding: "5px 10px", cursor: "pointer" }}>← Back</button>
          <div style={{ fontSize: 19, fontWeight: 900, color: text }}>Voice</div>
          <div style={{ width: 52 }} />
        </div>
        {children}
      </div>
    </div>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 10, fontWeight: 900, color: muted, textTransform: "uppercase", letterSpacing: 1, padding: "0 20px 8px" }}>{children}</div>
  );

  const Divider = () => (
    <div style={{ height: 1, background: "#1a1540", margin: "0 16px 14px" }} />
  );

  const VoiceCard = ({ voice, isSelected, isPlaying, showPreview }: { voice: Voice; isSelected: boolean; isPlaying: boolean; showPreview: boolean }) => (
    <div
      onClick={() => setSelectedVoice(voice.id)}
      style={{ background: isPlaying ? "#1a1540" : isSelected ? "#1e1470" : "#1a1540", border: `3px solid ${isPlaying || isSelected ? violet : border}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, background: voice.avatarBg }}>
        {voice.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: isPlaying ? "#c4b0ff" : text, marginBottom: 2 }}>{voice.name}</div>
        <div style={{ fontSize: 11, color: isPlaying ? violet : muted }}>{isPlaying ? "Playing sample..." : voice.desc}</div>
      </div>
      {isPlaying ? (
        <WaveAnimation />
      ) : showPreview ? (
        <button
          onClick={(e) => { e.stopPropagation(); setPreviewPlaying(previewPlaying === voice.id ? null : voice.id); }}
          style={{ background: "transparent", border: `2px solid ${border}`, borderRadius: 8, color: muted, fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 11, fontWeight: 700, padding: "4px 9px", cursor: "pointer", flexShrink: 0 }}
        >
          ▶ Try
        </button>
      ) : null}
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${isSelected ? violet : border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, background: isSelected ? violet : "transparent", color: isSelected ? "#fff" : "transparent" }}>
        {isSelected ? "✓" : ""}
      </div>
    </div>
  );

  const SpeedRow = ({ selected, onSelect }: { selected: SpeedId; onSelect: (s: SpeedId) => void }) => (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {SPEEDS.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{ flex: 1, background: selected === s.id ? "#1e1470" : "#1a1540", border: `2px solid ${selected === s.id ? violet : border}`, borderRadius: 10, padding: "10px 6px", textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ fontSize: 18 }}>{s.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: selected === s.id ? "#c4b0ff" : muted, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const SaveBtn = () => (
    <button style={{ margin: "0 16px 20px", width: "calc(100% - 32px)", background: "linear-gradient(135deg,#9b72ff,#7c4dff)", border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 900, padding: 12, cursor: "pointer" }}>
      ✓ Save Voice Settings
    </button>
  );

  const ToggleRow = ({ label, sub, on, onToggle }: { label: string; sub: string; on: boolean; onToggle: () => void }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 12px" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: text }}>{label}</div>
        <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>{sub}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );

  return (
    <AppFrame audience="kid">
      <div style={{ background: "#0a0820", fontFamily: "'Nunito', system-ui, sans-serif", minHeight: "100vh", padding: "24px 16px", color: text, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 820, width: "100%" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={tabBtnStyle(activeTab === t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ── TAB 1: DEFAULT ── */}
        {activeTab === "default" && (
          <PhoneShell>
            <SectionLabel>Choose your voice guide</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px 16px" }}>
              {VOICES.map((v) => (
                <VoiceCard key={v.id} voice={v} isSelected={selectedVoice === v.id} isPlaying={false} showPreview />
              ))}
            </div>
            <Divider />
            <SectionLabel>Speaking speed</SectionLabel>
            <SpeedRow selected={selectedSpeed} onSelect={setSelectedSpeed} />
            <Divider />
            <ToggleRow label="Voice guide on" sub="Reads questions aloud" on={voiceOn} onToggle={() => setVoiceOn(!voiceOn)} />
            <ToggleRow label="Sound effects" sub="Star sounds, click sounds" on={sfxOn} onToggle={() => setSfxOn(!sfxOn)} />
            <SaveBtn />
          </PhoneShell>
        )}

        {/* ── TAB 2: PREVIEW PLAYING ── */}
        {activeTab === "preview" && (
          <PhoneShell>
            <SectionLabel>Choose your voice guide</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px 16px" }}>
              {VOICES.map((v) => (
                <VoiceCard key={v.id} voice={v} isSelected={selectedVoice === v.id} isPlaying={v.id === "buddy"} showPreview={v.id !== "buddy"} />
              ))}
            </div>
            <div style={{ margin: "0 16px 16px", padding: 12, background: "#1a1540", borderRadius: 12, border: `2px solid ${violet}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#c4b0ff", marginBottom: 4 }}>📣 Now playing Buddy's voice</div>
              <div style={{ fontSize: 11, color: muted }}>"Great job! You're a star! Let's try this next one!"</div>
            </div>
            <SaveBtn />
          </PhoneShell>
        )}

        {/* ── TAB 3: SETTINGS (Speed + Volume) ── */}
        {activeTab === "settings" && (
          <PhoneShell>
            <SectionLabel>Choose your voice guide</SectionLabel>
            <div style={{ margin: "0 16px 14px", background: "#1e1470", border: `2px solid ${violet}`, borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 22 }}>🦁</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: text }}>Coach Leo selected</div>
                <div style={{ fontSize: 10, color: muted }}>Tap to change</div>
              </div>
              <span style={{ background: "#2d1f80", border: `1px solid ${violet}`, borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#c4b0ff" }}>✓ Active</span>
            </div>
            <Divider />
            <SectionLabel>Speaking speed</SectionLabel>
            <SpeedRow selected={selectedSpeed} onSelect={setSelectedSpeed} />
            <div style={{ fontSize: 10, color: muted, textAlign: "center", margin: "-8px 0 12px" }}>Slow is great for new readers 🌟</div>
            <Divider />
            <SectionLabel>Audio settings</SectionLabel>
            <ToggleRow label="Voice guide"        sub="Reads questions aloud"      on={voiceOn} onToggle={() => setVoiceOn(!voiceOn)} />
            <ToggleRow label="Sound effects"      sub="Star sounds, click sounds"  on={sfxOn}   onToggle={() => setSfxOn(!sfxOn)} />
            <ToggleRow label="Background music"   sub="Quiet adventure music"      on={musicOn} onToggle={() => setMusicOn(!musicOn)} />
            <Divider />
            <div style={{ padding: "0 16px 8px" }}>
              <div style={{ background: "#1a2a15", border: "2px solid #50e890", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: "#50e890" }}>
                ⭐ These settings don't affect your stars or progress
              </div>
            </div>
            <SaveBtn />
          </PhoneShell>
        )}
      </div>
    </AppFrame>
  );
}
