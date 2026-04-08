"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  surface: "#1a1540",
  border: "#2a2060",
} as const;

const AVATARS = [
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "🦁", label: "Lion" },
  { emoji: "🐲", label: "Dragon" },
  { emoji: "🦊", label: "Fox" },
  { emoji: "🐬", label: "Dolphin" },
  { emoji: "🦅", label: "Eagle" },
];

const BANDS = [
  { id: "PREK", icon: "🌱", name: "Seedling Grove", desc: "Pre-K · Ages 3–5", bg: "linear-gradient(135deg, #2a2010, #1a1408)", nameColor: "#fbbf24" },
  { id: "K1",   icon: "⭐", name: "Star Valley",    desc: "K–1 · Ages 5–7",  bg: "linear-gradient(135deg, #1a1060, #0d0830)", nameColor: C.violet },
  { id: "G23",  icon: "🚀", name: "Explorer Ridge", desc: "Gr 2–3 · Ages 7–9", bg: "linear-gradient(135deg, #0a2a28, #061a18)", nameColor: "#2dd4bf" },
  { id: "G45",  icon: "⚡", name: "Lightning Peak", desc: "Gr 4–5 · Ages 9–11", bg: "linear-gradient(135deg, #1a1a30, #0d0d20)", nameColor: "#60a5fa" },
];

const INTERESTS = [
  { id: "dinos",    emoji: "🦕", label: "Dinos" },
  { id: "space",    emoji: "🚀", label: "Space" },
  { id: "animals",  emoji: "🐾", label: "Animals" },
  { id: "games",    emoji: "🎮", label: "Games" },
  { id: "sports",   emoji: "⚽", label: "Sports" },
  { id: "art",      emoji: "🎨", label: "Art" },
  { id: "food",     emoji: "🍕", label: "Food" },
  { id: "music",    emoji: "🎵", label: "Music" },
  { id: "stories",  emoji: "📖", label: "Stories" },
  { id: "science",  emoji: "🔬", label: "Science" },
  { id: "puzzles",  emoji: "🧩", label: "Puzzles" },
  { id: "ocean",    emoji: "🌊", label: "Ocean" },
];

const font: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif" };

const cardStyle: React.CSSProperties = {
  ...font,
  width: "100%",
  maxWidth: 520,
  background: "linear-gradient(135deg, #1a1060 0%, #140e50 100%)",
  border: `2px solid ${C.border}`,
  borderRadius: 24,
  padding: "36px 32px",
  textAlign: "center",
};

const ctaBtnStyle: React.CSSProperties = {
  ...font,
  width: "100%",
  padding: "16px",
  borderRadius: 16,
  border: "none",
  background: `linear-gradient(135deg, ${C.violet}, #7c4ddb)`,
  color: "#fff",
  fontSize: 18,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
};

function StepIndicator({ step }: { step: number }) {
  const LABELS = ["Who are you?", "Your level", "Interests"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 900,
              border: `3px solid ${i < step ? C.mint : i === step ? C.violet : C.border}`,
              background: i < step ? C.mint : i === step ? C.violet : "#1a1060",
              color: i < step ? "#0a2a15" : i === step ? "#fff" : C.muted,
              boxShadow: i === step ? `0 0 0 5px rgba(155,114,255,0.2)` : "none",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}>
              {i < step ? "✓" : i + 1}
            </div>
            {i < 2 && <div style={{ width: 52, height: 3, background: i < step ? C.mint : C.border }} />}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 0, width: "100%", maxWidth: 260 }}>
        {LABELS.map((label, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, color: i < step ? C.mint : i === step ? C.violet : C.muted, fontFamily: "'Nunito', system-ui, sans-serif" }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChildQuickstartPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [name, setName] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [bandId, setBandId] = useState("K1");
  const [interests, setInterests] = useState<string[]>([]);
  const [loadingSession, setLoadingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const loadSession = useCallback(() => {
    setLoadingSession(true);
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.student?.displayName) setName(data.student.displayName);
        if (data?.student?.launchBandCode) {
          const code: string = data.student.launchBandCode;
          const valid = BANDS.map((b) => b.id);
          if (valid.includes(code)) setBandId(code);
        }
        setLoadingSession(false);
      })
      .catch(() => setLoadingSession(false));
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const displayName = name.trim() || "Explorer";

  const toggleInterest = (id: string) => {
    setInterests((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleFinish = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      const res = await fetch("/api/child/interests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      if (!res.ok) throw new Error("failed");
      router.push("/child");
    } catch {
      setSaveError(true);
      setSaving(false);
    }
  };

  const wrapperStyle: React.CSSProperties = {
    ...font,
    minHeight: "100vh",
    background: C.base,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px 60px",
  };

  if (loadingSession) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ ...wrapperStyle, justifyContent: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: `4px solid ${C.violet}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </AppFrame>
    );
  }

  // Step 0: Name & Avatar
  if (step === 0) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`@keyframes qs-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        <div style={wrapperStyle}>
          <StepIndicator step={0} />
          <div style={cardStyle}>
            <span style={{ fontSize: 72, marginBottom: 16, display: "block", animation: "qs-bounce 2s ease-in-out infinite" }}>🌟</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
              What&apos;s your name?
            </div>
            <div style={{ fontSize: 15, color: "#b8a0e8", fontWeight: 700, marginBottom: 24 }}>
              Tell us what to call you on your quest!
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name here..."
              style={{ ...font, width: "100%", padding: "14px 18px", borderRadius: 14, border: `2px solid ${name.trim() ? C.violet : C.border}`, background: "#0d0924", color: "#fff", fontSize: 18, fontWeight: 900, textAlign: "center", outline: "none", marginBottom: 20, boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Pick your explorer
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
              {AVATARS.map((av, i) => (
                <button key={av.emoji} onClick={() => setAvatarIdx(i)} aria-label={av.label} style={{ width: 68, height: 68, borderRadius: 18, background: i === avatarIdx ? "#2a1880" : "#1a1460", border: `3px solid ${i === avatarIdx ? C.violet : C.border}`, boxShadow: i === avatarIdx ? "0 0 0 4px rgba(155,114,255,0.25)" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, cursor: "pointer", outline: "none" }}>
                  {av.emoji}
                </button>
              ))}
            </div>
            <button style={{ ...ctaBtnStyle, opacity: name.trim() ? 1 : 0.45 }} onClick={() => { if (name.trim()) setStep(1); }}>
              That&apos;s me! Next →
            </button>
            {!name.trim() && <div style={{ ...font, fontSize: 12, color: C.muted, marginTop: 8, fontWeight: 700 }}>Enter your name to continue</div>}
          </div>
          <div style={{ marginTop: 24 }}>
            <Link href="/child" style={{ color: C.muted, fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}>← Home</Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // Step 1: Band
  if (step === 1) {
    const selectedBand = BANDS.find((b) => b.id === bandId) ?? BANDS[1];
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`@keyframes qs-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        <div style={wrapperStyle}>
          <StepIndicator step={1} />
          <div style={cardStyle}>
            <span style={{ fontSize: 72, marginBottom: 16, display: "block", animation: "qs-bounce 2s ease-in-out infinite" }}>⚡</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
              Hey {displayName}!<br />What kind of quester are you?
            </div>
            <div style={{ fontSize: 15, color: "#b8a0e8", fontWeight: 700, marginBottom: 24 }}>
              Pick the one that feels right — you can always change it
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24, width: "100%" }}>
              {BANDS.map((band) => (
                <button key={band.id} onClick={() => setBandId(band.id)} style={{ ...font, borderRadius: 16, padding: "16px 14px", cursor: "pointer", border: `3px solid ${band.id === bandId ? "#fff" : "transparent"}`, background: band.bg, textAlign: "left", outline: "none" }}>
                  <div style={{ fontSize: 30, marginBottom: 6 }}>{band.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 2, color: band.nameColor }}>{band.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ffffffaa" }}>{band.desc}</div>
                </button>
              ))}
            </div>
            <button style={ctaBtnStyle} onClick={() => setStep(2)}>
              {selectedBand.name} it is! →
            </button>
          </div>
          <div style={{ marginTop: 24 }}>
            <button onClick={() => setStep(0)} style={{ ...font, background: "none", border: "none", color: C.muted, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
          </div>
        </div>
      </AppFrame>
    );
  }

  // Step 2: Interests
  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`@keyframes qs-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
      <div style={wrapperStyle}>
        <StepIndicator step={2} />
        <div style={cardStyle}>
          <span style={{ fontSize: 72, marginBottom: 16, display: "block", animation: "qs-bounce 2s ease-in-out infinite" }}>🎯</span>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
            What do you love?
          </div>
          <div style={{ fontSize: 15, color: "#b8a0e8", fontWeight: 700, marginBottom: 24 }}>
            Pick at least one — we&apos;ll make quests just for you!
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            {INTERESTS.map((item) => {
              const selected = interests.includes(item.id);
              return (
                <button key={item.id} onClick={() => toggleInterest(item.id)} style={{ ...font, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 24, border: `2px solid ${selected ? C.violet : C.border}`, background: selected ? "rgba(155,114,255,0.15)" : "#1a1060", color: selected ? C.text : C.muted, fontSize: 14, fontWeight: 700, cursor: "pointer", outline: "none", boxShadow: selected ? "0 0 0 2px rgba(155,114,255,0.25)" : "none" }}>
                  <span style={{ fontSize: 18 }}>{item.emoji}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
          {saveError && (
            <div style={{ background: "#2a0a0a", border: "1px solid #ff6b6b", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ff9b9b", fontWeight: 700, marginBottom: 14 }}>
              Couldn&apos;t save. Check your connection and try again.
            </div>
          )}
          <button
            style={{ ...ctaBtnStyle, opacity: (interests.length > 0 && !saving) ? 1 : 0.45 }}
            onClick={() => { if (interests.length > 0 && !saving) handleFinish(); }}
            disabled={saving || interests.length === 0}
          >
            {saving ? "Saving..." : "Start my adventure! 🚀"}
          </button>
          {interests.length === 0 && <div style={{ ...font, fontSize: 12, color: C.muted, marginTop: 8, fontWeight: 700 }}>Pick at least one interest to continue</div>}
        </div>
        <div style={{ marginTop: 24 }}>
          <button onClick={() => setStep(1)} style={{ ...font, background: "none", border: "none", color: C.muted, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
        </div>
      </div>
    </AppFrame>
  );
}
