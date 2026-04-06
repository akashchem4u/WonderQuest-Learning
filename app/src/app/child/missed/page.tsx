"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Colors ──────────────────────────────────────────────────────────────────
// Base: #0a0820  Card: #12103a  Violet: #9b72ff  Amber: #f0a000
// Mint: #50e890  Gold: #ffd166  Muted: #9b8ec4

// ─── Types ───────────────────────────────────────────────────────────────────

type GapType = "gap2" | "gap7" | "gap30";

type DayStatus = "played" | "gap" | "today";

type WeekDay = {
  name: string;
  status: DayStatus;
  label?: string;
};

type ReturnCard = {
  gapType: GapType;
  mascot: string;
  mascotBadge: string;
  animateMascot: boolean;
  tagText: string;
  tagVariant: "amber" | "mint" | "gold";
  title: string;
  subtitle: string;
  weekDays: WeekDay[];
  starCount: number;
  starExtra?: string;
  showBoost: boolean;
  boostIcon: string;
  boostTitle: string;
  boostDesc: string;
  boostChip: string;
  message: string;
  primaryBtnText: string;
  primaryBtnVariant: "amber" | "primary" | "gold";
  ghostBtnText: string;
  isGoldTheme: boolean;
};

// ─── Card data ────────────────────────────────────────────────────────────────

const CARDS: Record<GapType, ReturnCard> = {
  gap2: {
    gapType: "gap2",
    mascot: "🦋",
    mascotBadge: "👋",
    animateMascot: true,
    tagText: "Welcome Back!",
    tagVariant: "amber",
    title: "Hey Emma, you're back!",
    subtitle: "You've been away for a couple of days",
    weekDays: [
      { name: "Mon", status: "played", label: "Played" },
      { name: "Tue", status: "played", label: "Played" },
      { name: "Wed", status: "gap",    label: "Away" },
      { name: "Thu", status: "gap",    label: "Away" },
      { name: "Fri", status: "today",  label: "Today!" },
    ],
    starCount: 18,
    starExtra: undefined,
    showBoost: false,
    boostIcon: "",
    boostTitle: "",
    boostDesc: "",
    boostChip: "",
    message: "Your adventure in Cosmic Castle is exactly where you left it. Ready to keep going?",
    primaryBtnText: "▶ Jump Back In!",
    primaryBtnVariant: "amber",
    ghostBtnText: "🗺️ See My Progress First",
    isGoldTheme: false,
  },
  gap7: {
    gapType: "gap7",
    mascot: "🦁",
    mascotBadge: "🌟",
    animateMascot: true,
    tagText: "Hey, it's been a week!",
    tagVariant: "mint",
    title: "Great to see you again, Emma!",
    subtitle: "A whole week of adventures waiting for you",
    weekDays: [
      { name: "Mon", status: "gap",   label: "Away" },
      { name: "Tue", status: "gap",   label: "Away" },
      { name: "Wed", status: "gap",   label: "Away" },
      { name: "Thu", status: "gap",   label: "Away" },
      { name: "Fri", status: "gap",   label: "Away" },
      { name: "Sat", status: "gap",   label: "Away" },
      { name: "Sun", status: "today", label: "Today!" },
    ],
    starCount: 18,
    starExtra: "All safe — they never go away, ever!",
    showBoost: true,
    boostIcon: "🔥",
    boostTitle: "Restore your streak today!",
    boostDesc: "Play once today and start a fresh streak. Your best was 5 days — can you beat it?",
    boostChip: "+1⭐ Bonus",
    message: "Cosmic Castle is waiting at Node 7. Everything's exactly as you left it — let's get back to exploring!",
    primaryBtnText: "🔥 Start Fresh Streak!",
    primaryBtnVariant: "primary",
    ghostBtnText: "🗺️ Just check my map",
    isGoldTheme: false,
  },
  gap30: {
    gapType: "gap30",
    mascot: "🦁",
    mascotBadge: "🏆",
    animateMascot: false,
    tagText: "🎉 Legend Returns!",
    tagVariant: "gold",
    title: "Welcome back, Emma!",
    subtitle: "It's been a whole month — this is huge!",
    weekDays: [
      { name: "Mon",   status: "gap" },
      { name: "Tue",   status: "gap" },
      { name: "Wed",   status: "gap" },
      { name: "Thu",   status: "gap" },
      { name: "Fri",   status: "gap" },
      { name: "Sat",   status: "gap" },
      { name: "Today", status: "today" },
    ],
    starCount: 18,
    starExtra: "Your stars waited the whole time — they're all here!",
    showBoost: true,
    boostIcon: "🎁",
    boostTitle: "Comeback Celebration!",
    boostDesc: "Big adventures need big rewards. Today you get a special bonus!",
    boostChip: "+2⭐ +100XP",
    message: "Cosmic Castle has been patiently waiting at Node 7. Everything's safe — let's make today legendary!",
    primaryBtnText: "👑 Claim My Comeback!",
    primaryBtnVariant: "gold",
    ghostBtnText: "🗺️ View my world first",
    isGoldTheme: true,
  },
};

// ─── Tag variant styles ───────────────────────────────────────────────────────

const TAG_STYLES: Record<"amber" | "mint" | "gold", React.CSSProperties> = {
  amber: {
    background: "#2a1800",
    border: "1px solid #f0a000",
    color: "#f0c060",
  },
  mint: {
    background: "#0a2a28",
    border: "1px solid #58e8c1",
    color: "#58e8c1",
  },
  gold: {
    background: "#2a2010",
    border: "1px solid #ffd166",
    color: "#ffd166",
  },
};

const BTN_STYLES: Record<"amber" | "primary" | "gold", React.CSSProperties> = {
  amber: {
    background: "linear-gradient(135deg, #f0a000, #d08000)",
    color: "#1a0a00",
  },
  primary: {
    background: "linear-gradient(135deg, #9b72ff, #7c4dff)",
    color: "#fff",
  },
  gold: {
    background: "linear-gradient(135deg, #ffd166, #f0a000)",
    color: "#1a1000",
  },
};

// ─── Return Card Component ────────────────────────────────────────────────────

function ReturnCardView({ card, onDismiss }: { card: ReturnCard; onDismiss: () => void }) {
  const isGold = card.isGoldTheme;

  const cardBg = isGold
    ? "linear-gradient(135deg, #1a1500, #2a2010)"
    : "#12103a";
  const cardBorder = isGold ? "2px solid #ffd166" : "2px solid #2a2060";
  const cardShadow = isGold
    ? "0 0 24px rgba(255,209,102,0.15)"
    : "none";
  const bandBg = isGold
    ? "linear-gradient(135deg, #2a2010, #1a1500)"
    : "transparent";
  const weekBarBg = isGold ? "#1a1500" : "#0e0c2a";
  const starCardBg = isGold ? "#1a1500" : "#1a2a15";
  const starCardBorder = isGold ? "#ffd166" : "#50e890";
  const starCardColor = isGold ? "#ffd166" : "#50e890";
  const msgColor = isGold ? "#c4a840" : "#c4b0ff";
  const msgStrongColor = isGold ? "#fff8e0" : "#e8e0ff";
  const dismissBorderColor = isGold ? "rgba(255,209,102,0.27)" : "#2a2060";
  const dismissColor = isGold ? "#ffd166" : "#9b8ec4";

  return (
    <div
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: cardShadow,
        animation: isGold
          ? "cardEnter 0.4s cubic-bezier(0.34,1.56,0.64,1) both, goldPulse 2s ease-in-out infinite"
          : "cardEnter 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      {/* Band (header) */}
      <div
        style={{
          padding: "18px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: bandBg,
        }}
      >
        {/* Mascot */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <span
            style={{
              fontSize: isGold ? "48px" : "40px",
              display: "block",
              animation: card.animateMascot ? "mascotWave 1.5s ease-in-out infinite" : "none",
            }}
          >
            {card.mascot}
          </span>
          <span
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-4px",
              fontSize: isGold ? "20px" : "16px",
            }}
          >
            {card.mascotBadge}
          </span>
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "inline-block",
              borderRadius: "8px",
              padding: "2px 10px",
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "5px",
              ...TAG_STYLES[card.tagVariant],
            }}
          >
            {card.tagText}
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 900,
              color: isGold ? "#fff8e0" : "#e8e0ff",
              lineHeight: 1.2,
            }}
          >
            {card.title}
          </div>
          <div style={{ fontSize: "12px", color: isGold ? "#c4a840" : "#9b8ec4", marginTop: "3px" }}>
            {card.subtitle}
          </div>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: "transparent",
            border: `2px solid ${dismissBorderColor}`,
            borderRadius: "8px",
            color: dismissColor,
            width: "30px",
            height: "30px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            flexShrink: 0,
            alignSelf: "flex-start",
            fontFamily: "inherit",
          }}
        >
          ✕
        </button>
      </div>

      {/* Week bar */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          padding: "10px 20px",
          background: weekBarBg,
        }}
      >
        {card.weekDays.map((day, i) => {
          const isFlame = day.status === "played";
          const isGap = day.status === "gap";
          const isToday = day.status === "today";

          const dotStyle: React.CSSProperties = isFlame
            ? {
                background: "linear-gradient(135deg, #3a1800, #5a2a00)",
                border: "2px solid #f0a000",
              }
            : isGap
            ? {
                background: "#1a1540",
                border: "2px solid #2a2060",
                color: "#555",
                fontSize: "10px",
              }
            : {
                background: "#2a2060",
                border: `2px solid ${isGold ? "#ffd166" : "#ffd166"}`,
              };

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#9b8ec4",
                }}
              >
                {day.name}
              </div>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  ...dotStyle,
                }}
              >
                {isFlame ? "🔥" : isGap ? "·" : isGold ? "👑" : "👾"}
              </div>
              {day.label && (
                <div style={{ fontSize: "8px", color: "#9b8ec4" }}>{day.label}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Star safe card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: "12px 20px 0",
          background: starCardBg,
          border: `2px solid ${starCardBorder}`,
          borderRadius: "12px",
          padding: "10px 14px",
          fontSize: "13px",
          fontWeight: 700,
          color: starCardColor,
        }}
      >
        <span>{isGold ? "🏆" : "⭐"}</span>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: starCardColor }}>
            {card.starCount} stars{isGold ? " + Legend Badge" : ""}
          </div>
          <div style={{ fontSize: "11px", marginTop: "1px" }}>
            {card.starExtra ?? "All safe — nothing changed while you were away"}
          </div>
        </div>
      </div>

      {/* Boost offer */}
      {card.showBoost && (
        <div
          style={{
            margin: isGold ? "14px 20px 0" : "0 20px",
            marginTop: isGold ? "14px" : "12px",
            background: isGold ? "#2a2010" : "#1e1470",
            border: `2px solid ${isGold ? "#ffd166" : "#9b72ff"}`,
            borderRadius: "12px",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "24px" }}>{card.boostIcon}</div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 900,
                color: isGold ? "#fff8e0" : "#e8e0ff",
                marginBottom: "2px",
              }}
            >
              {card.boostTitle}
            </div>
            <div style={{ fontSize: "11px", color: "#9b8ec4" }}>{card.boostDesc}</div>
          </div>
          <div
            style={{
              background: isGold ? "#2a2010" : "#2d1f80",
              border: `1px solid ${isGold ? "#ffd166" : "#9b72ff"}`,
              borderRadius: "8px",
              padding: "3px 9px",
              fontSize: "11px",
              fontWeight: 700,
              color: isGold ? "#ffd166" : "#c4b0ff",
              flexShrink: 0,
            }}
          >
            {card.boostChip}
          </div>
        </div>
      )}

      {/* Message */}
      <div
        style={{
          padding: "12px 20px",
          fontSize: "14px",
          color: msgColor,
          lineHeight: 1.5,
          borderTop: "1px solid #1a1540",
          marginTop: "12px",
        }}
      >
        <strong style={{ color: msgStrongColor }}>
          {card.gapType === "gap2" ? "Cosmic Castle" : ""}
        </strong>
        {card.gapType === "gap2"
          ? " is exactly where you left it. Ready to keep going?"
          : card.message}
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "0 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <Link
          href="/play"
          style={{
            width: "100%",
            border: "none",
            borderRadius: "12px",
            fontFamily: "inherit",
            fontSize: "15px",
            fontWeight: 900,
            padding: "13px",
            cursor: "pointer",
            textAlign: "center",
            textDecoration: "none",
            display: "block",
            ...BTN_STYLES[card.primaryBtnVariant],
          }}
        >
          {card.primaryBtnText}
        </Link>
        <Link
          href="/child"
          style={{
            width: "100%",
            background: "transparent",
            border: `2px solid ${isGold ? "rgba(255,209,102,0.25)" : "#2a2060"}`,
            borderRadius: "12px",
            color: isGold ? "#c4a840" : "#9b8ec4",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 900,
            padding: "9px",
            textAlign: "center",
            textDecoration: "none",
            display: "block",
          }}
        >
          {card.ghostBtnText}
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildMissedPage() {
  const [activeTab, setActiveTab] = useState<GapType>("gap2");
  const [dismissed, setDismissed] = useState(false);

  const card = CARDS[activeTab];

  const tabLabels: { id: GapType; label: string }[] = [
    { id: "gap2",  label: "2-Day Gap" },
    { id: "gap7",  label: "7-Day Gap" },
    { id: "gap30", label: "30-Day Comeback" },
  ];

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0820",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#e8e0ff",
          padding: "24px 16px 60px",
        }}
      >
        {/* ── Top nav ─────────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Link
            href="/child"
            style={{
              fontSize: "14px",
              fontWeight: 900,
              color: "#9b72ff",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <div style={{ width: "1px", height: "18px", background: "#2a2060" }} />
          <Link
            href="/play"
            style={{
              fontSize: "14px",
              fontWeight: 900,
              color: "#9b72ff",
              textDecoration: "none",
            }}
          >
            Play →
          </Link>
          <div style={{ flex: 1 }} />
          <div
            style={{
              fontSize: "16px",
              fontWeight: 900,
              color: "#e8e0ff",
            }}
          >
            Welcome Back!
          </div>
        </div>

        {/* ── Dev tab bar ──────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto 20px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {tabLabels.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setActiveTab(t.id); setDismissed(false); }}
              style={{
                background: activeTab === t.id ? "#9b72ff" : "#1a1540",
                border: `2px solid ${activeTab === t.id ? "#9b72ff" : "#2a2060"}`,
                borderRadius: "8px",
                color: activeTab === t.id ? "#fff" : "#9b8ec4",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Card ────────────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "520px",
            margin: "0 auto",
          }}
        >
          {dismissed ? (
            <div
              style={{
                background: "#12103a",
                border: "2px solid #2a2060",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✨</div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  color: "#e8e0ff",
                  marginBottom: "8px",
                }}
              >
                Card dismissed
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#9b8ec4",
                  fontWeight: 700,
                  marginBottom: "20px",
                }}
              >
                The return card has been dismissed for this session.
              </div>
              <button
                type="button"
                onClick={() => setDismissed(false)}
                style={{
                  background: "rgba(155,114,255,0.12)",
                  border: "2px solid #9b72ff",
                  borderRadius: "10px",
                  color: "#9b72ff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 900,
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
              >
                Show card again (dev)
              </button>
            </div>
          ) : (
            <ReturnCardView card={card} onDismiss={() => setDismissed(true)} />
          )}
        </div>

        {/* Animations */}
        <style>{`
          @keyframes cardEnter {
            from { opacity: 0; transform: scale(0.94) translateY(10px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
          @keyframes mascotWave {
            0%, 100% { transform: rotate(0deg); }
            25%      { transform: rotate(-8deg); }
            75%      { transform: rotate(8deg); }
          }
          @keyframes goldPulse {
            0%, 100% { box-shadow: 0 0 16px rgba(255,209,102,0.15); }
            50%      { box-shadow: 0 0 32px rgba(255,209,102,0.35); }
          }
        `}</style>
      </div>
    </AppFrame>
  );
}
