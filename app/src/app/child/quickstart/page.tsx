"use client";

import Link from "next/link";
import { useState } from "react";
import AppFrame from "@/components/app-frame";

// ── Stub data ──────────────────────────────────────────────────────────────

const AVATARS = [
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "🦁", label: "Lion" },
  { emoji: "🐉", label: "Dragon" },
  { emoji: "🦊", label: "Fox" },
  { emoji: "🐬", label: "Dolphin" },
  { emoji: "🦅", label: "Eagle" },
];

const BANDS = [
  {
    id: "p0",
    icon: "🌈",
    name: "Pre-K Explorers",
    ages: "Ages 3–5",
    bg: "linear-gradient(135deg, #2a2010, #1a1408)",
    nameColor: "#ffd166",
  },
  {
    id: "p1",
    icon: "⚡",
    name: "K–1 Adventurers",
    ages: "Ages 5–7",
    bg: "linear-gradient(135deg, #1a1060, #0d0830)",
    nameColor: "#9b72ff",
  },
  {
    id: "p2",
    icon: "🌊",
    name: "G2–3 Questers",
    ages: "Ages 7–9",
    bg: "linear-gradient(135deg, #0a2a28, #061a18)",
    nameColor: "#58e8c1",
  },
  {
    id: "p3",
    icon: "🔥",
    name: "G4–5 Champions",
    ages: "Ages 9–11",
    bg: "linear-gradient(135deg, #2a1010, #1a0808)",
    nameColor: "#ff7b6b",
  },
];

const WORLDS = [
  {
    id: "forest",
    emoji: "🌲",
    name: "Enchanted Forest",
    desc: "Magical creatures & hidden paths",
  },
  {
    id: "ocean",
    emoji: "🌊",
    name: "Ocean Kingdom",
    desc: "Underwater treasures & sea friends",
  },
  {
    id: "crystal",
    emoji: "💎",
    name: "Crystal Caverns",
    desc: "Shining gems & sparkling secrets",
  },
];

// ── Shared styles ──────────────────────────────────────────────────────────

const font: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const cardStyle: React.CSSProperties = {
  ...font,
  width: "100%",
  maxWidth: 640,
  background: "linear-gradient(135deg, #1a1060 0%, #140e50 100%)",
  border: "2px solid #2a2060",
  borderRadius: 24,
  padding: "36px 40px",
  textAlign: "center",
};

const ctaBtnStyle: React.CSSProperties = {
  ...font,
  width: "100%",
  padding: "16px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
  color: "#fff",
  fontSize: 20,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
  transition: "transform 0.15s, box-shadow 0.15s",
};

const ctaNoteStyle: React.CSSProperties = {
  ...font,
  fontSize: 12,
  color: "#5a4080",
  fontWeight: 700,
  marginTop: 10,
};

// ── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const dotStyle = (idx: number): React.CSSProperties => {
    const done = idx < step;
    const active = idx === step;
    return {
      width: 36,
      height: 36,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 900,
      border: `3px solid ${done ? "#50e890" : active ? "#9b72ff" : "#2a2060"}`,
      background: done ? "#50e890" : active ? "#9b72ff" : "#1a1060",
      color: done ? "#0a2a15" : active ? "#fff" : "#5a4080",
      boxShadow: active ? "0 0 0 6px rgba(155,114,255,0.2)" : "none",
      transition: "all 0.3s",
      fontFamily: "'Nunito', system-ui, sans-serif",
    };
  };

  const lineStyle = (idx: number): React.CSSProperties => ({
    width: 60,
    height: 3,
    background: idx < step ? "#50e890" : "#2a2060",
    transition: "background 0.3s",
  });

  const LABELS = ["Who are you?", "Your level", "Pick a world"];
  const labelStyle = (idx: number): React.CSSProperties => ({
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    color: idx < step ? "#50e890" : idx === step ? "#9b72ff" : "#5a4080",
    fontFamily: "'Nunito', system-ui, sans-serif",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={dotStyle(i)}>{i < step ? "✓" : i + 1}</div>
            {i < 2 && <div style={lineStyle(i)} />}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 0, width: "100%", maxWidth: 260 }}>
        {LABELS.map((label, i) => (
          <div key={i} style={labelStyle(i)}>{label}</div>
        ))}
      </div>
    </div>
  );
}

// ── Page component ─────────────────────────────────────────────────────────

export default function ChildQuickstartPage() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setName] = useState("Zara");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [bandId, setBandId] = useState("p1");
  const [worldId, setWorldId] = useState("forest");

  const selectedBand = BANDS.find((b) => b.id === bandId) ?? BANDS[1];
  const selectedWorld = WORLDS.find((w) => w.id === worldId) ?? WORLDS[0];
  const displayName = name.trim() || "Explorer";

  const wrapperStyle: React.CSSProperties = {
    ...font,
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 32px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  // ── Step 0: Name & Avatar ────────────────────────────────────────────────
  if (step === 0) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`
          @keyframes qs-bounce {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
        <div style={wrapperStyle}>
          <StepIndicator step={0} />
          <div style={cardStyle}>
            <span style={{ fontSize: 72, marginBottom: 16, display: "block", animation: "qs-bounce 2s ease-in-out infinite" }}>🌟</span>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
              What&apos;s your name?
            </div>
            <div style={{ fontSize: 16, color: "#b8a0e8", fontWeight: 700, marginBottom: 28 }}>
              Tell us what to call you on your quest!
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name here..."
              style={{
                ...font,
                width: "100%",
                padding: "16px 20px",
                borderRadius: 14,
                border: "2px solid #4a30b0",
                background: "#0d0924",
                color: "#fff",
                fontSize: 20,
                fontWeight: 900,
                textAlign: "center",
                outline: "none",
                marginBottom: 20,
              }}
            />

            <div style={{ fontSize: 14, fontWeight: 700, color: "#9b72ff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Pick your explorer
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
              {AVATARS.map((av, i) => (
                <button
                  key={av.emoji}
                  onClick={() => setAvatarIdx(i)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: i === avatarIdx ? "#2a1880" : "#1a1460",
                    border: `3px solid ${i === avatarIdx ? "#9b72ff" : "#2a2060"}`,
                    boxShadow: i === avatarIdx ? "0 0 0 4px rgba(155,114,255,0.25)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    outline: "none",
                  }}
                  aria-label={av.label}
                >
                  {av.emoji}
                </button>
              ))}
            </div>

            <button
              style={ctaBtnStyle}
              onClick={() => {
                if (name.trim()) setStep(1);
              }}
            >
              That&apos;s me! Next →
            </button>
            <div style={ctaNoteStyle}>You can change this any time</div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Link href="/child" style={{ color: "#9b8ec4", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}>
              ← Home
            </Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // ── Step 1: Band ─────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`
          @keyframes qs-bounce {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
        <div style={wrapperStyle}>
          <StepIndicator step={1} />
          <div style={cardStyle}>
            <span style={{ fontSize: 72, marginBottom: 16, display: "block", animation: "qs-bounce 2s ease-in-out infinite" }}>⚡</span>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
              Hey {displayName}!<br />What kind of quester are you?
            </div>
            <div style={{ fontSize: 16, color: "#b8a0e8", fontWeight: 700, marginBottom: 28 }}>
              Pick the one that feels right — you can always change it
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24, width: "100%" }}>
              {BANDS.map((band) => (
                <button
                  key={band.id}
                  onClick={() => setBandId(band.id)}
                  style={{
                    ...font,
                    borderRadius: 16,
                    padding: "18px 16px",
                    cursor: "pointer",
                    border: `3px solid ${band.id === bandId ? "#fff" : "transparent"}`,
                    background: band.bg,
                    textAlign: "left",
                    transition: "all 0.2s",
                    outline: "none",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{band.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 2, color: band.nameColor }}>{band.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 700, color: "#fff" }}>{band.ages}</div>
                </button>
              ))}
            </div>

            <button style={ctaBtnStyle} onClick={() => setStep(2)}>
              {selectedBand.name} it is! →
            </button>
            <div style={ctaNoteStyle}>Your parent can also help you pick</div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Link href="/child" style={{ color: "#9b8ec4", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}>
              ← Home
            </Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // ── Step 2: World ─────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`
          @keyframes qs-bounce {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
        <div style={wrapperStyle}>
          <StepIndicator step={2} />
          <div style={cardStyle}>
            <span style={{ fontSize: 72, marginBottom: 16, display: "block", animation: "qs-bounce 2s ease-in-out infinite" }}>🗺️</span>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
              Pick your first world!
            </div>
            <div style={{ fontSize: 16, color: "#b8a0e8", fontWeight: 700, marginBottom: 28 }}>
              Every world has amazing quests and stars to collect
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24, width: "100%" }}>
              {WORLDS.map((world) => (
                <button
                  key={world.id}
                  onClick={() => setWorldId(world.id)}
                  style={{
                    ...font,
                    background: world.id === worldId ? "#2a1880" : "#1a1060",
                    border: `3px solid ${world.id === worldId ? "#9b72ff" : "#2a2060"}`,
                    borderRadius: 16,
                    padding: 16,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    outline: "none",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 6 }}>{world.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{world.name}</div>
                  <div style={{ fontSize: 11, color: "#7a6090", marginTop: 2 }}>{world.desc}</div>
                </button>
              ))}
            </div>

            <button style={ctaBtnStyle} onClick={() => setStep(3)}>
              Start in {selectedWorld.name}! {selectedWorld.emoji}
            </button>
            <div style={ctaNoteStyle}>More worlds unlock as you explore</div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Link href="/child" style={{ color: "#9b8ec4", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}>
              ← Home
            </Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // ── Step 3: Complete ──────────────────────────────────────────────────────
  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes trophy-spin {
          from { transform: scale(0) rotate(-20deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes chip-pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .reward-chip-1 { animation: chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .reward-chip-2 { animation: chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
        .reward-chip-3 { animation: chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
      `}</style>
      <div style={wrapperStyle}>
        <div style={{ ...cardStyle, maxWidth: 640 }}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <span style={{ fontSize: 96, display: "block", marginBottom: 16, animation: "trophy-spin 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>
              🏆
            </span>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
              You&apos;re all set, {displayName}!
            </div>
            <div style={{ fontSize: 18, color: "#b8a0e8", fontWeight: 700, marginBottom: 24 }}>
              Your adventure in the {selectedWorld.name} begins NOW!
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
              <div
                className="reward-chip-1"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#2a2010",
                  border: "2px solid #ffd166",
                  borderRadius: 24,
                  padding: "10px 18px",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#ffd166",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                ⭐ 3 starter stars
              </div>
              <div
                className="reward-chip-2"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#1e1a40",
                  border: "2px solid #4a30b0",
                  borderRadius: 24,
                  padding: "10px 18px",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {AVATARS[avatarIdx].emoji} Explorer avatar
              </div>
              <div
                className="reward-chip-3"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#1e1a40",
                  border: "2px solid #4a30b0",
                  borderRadius: 24,
                  padding: "10px 18px",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {selectedWorld.emoji} World unlocked
              </div>
            </div>

            <Link
              href="/child"
              style={{
                ...font,
                display: "block",
                width: "100%",
                padding: "16px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
                color: "#fff",
                fontSize: 22,
                fontWeight: 900,
                textDecoration: "none",
                textAlign: "center",
                boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
              }}
            >
              Let&apos;s Go! 🚀
            </Link>
            <div style={{ ...ctaNoteStyle, marginTop: 14 }}>
              Your parent will see your progress in their app
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <Link href="/child" style={{ color: "#9b8ec4", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}>
            ← Home
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
