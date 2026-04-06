"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReturnType = "same-day" | "two-day" | "seven-day" | "comeback";

type ChildSession = {
  displayName: string;
  avatarEmoji: string;
  streak: number;
  stars: number;
  worldName: string;
  worldEmoji: string;
  worldProgress: number;
  currentNode: number;
  totalNodes: number;
  returnType: ReturnType;
  recentWins: { icon: string; text: string; meta: string }[];
  bonusChips?: { label: string; variant: "gold" | "green" | "violet" }[];
};

// ─── Mock data helpers ────────────────────────────────────────────────────────

function getMockSession(returnType: ReturnType): ChildSession {
  const base: ChildSession = {
    displayName: "Zara",
    avatarEmoji: "🦋",
    streak: 5,
    stars: 42,
    worldName: "Crystal Caverns",
    worldEmoji: "💎",
    worldProgress: 58,
    currentNode: 7,
    totalNodes: 12,
    returnType,
    recentWins: [
      { icon: "⭐", text: "Earned 3 stars", meta: "today" },
      { icon: "🏅", text: "New badge!", meta: "today" },
      { icon: "🗝️", text: "Node 6 done", meta: "yesterday" },
    ],
  };

  if (returnType === "seven-day") {
    return {
      ...base,
      streak: 1,
      stars: 43,
      bonusChips: [
        { label: "⭐ +1 star — return bonus", variant: "gold" },
        { label: "✨ +30 XP — streak restored", variant: "green" },
        { label: "🎉 Welcome back!", variant: "violet" },
      ],
      recentWins: [
        { icon: "⭐", text: "42 stars → 43 now!", meta: "+1 bonus" },
        { icon: "🏅", text: "3 badges", meta: "safe" },
        { icon: "💎", text: "Node 7 waiting", meta: "ready" },
      ],
    };
  }

  if (returnType === "comeback") {
    return {
      ...base,
      streak: 1,
      stars: 44,
      bonusChips: [
        { label: "⭐ +2 stars", variant: "gold" },
        { label: "✨ +100 XP", variant: "green" },
        { label: "🏅 Legend Badge", variant: "violet" },
      ],
      recentWins: [
        { icon: "⭐", text: "44 stars (kept all!)", meta: "safe" },
        { icon: "🏅", text: "4 badges total", meta: "safe" },
        { icon: "💎", text: "Crystal Caverns ready", meta: "waiting" },
      ],
    };
  }

  return base;
}

// ─── PIN Gate ─────────────────────────────────────────────────────────────────

type PinGateProps = {
  onAuth: (session: ChildSession) => void;
};

function PinGate({ onAuth }: PinGateProps) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pinDigits = [0, 1, 2, 3];

  function appendPinDigit(digit: string) {
    setPin((cur) => (cur.length >= 4 ? cur : `${cur}${digit}`));
  }

  function removePinDigit() {
    setPin((cur) => cur.slice(0, -1));
  }

  function handlePinFieldChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim() || pin.length < 4) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/child/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin }),
      });

      const payload = await response.json() as {
        student?: { displayName: string; avatarKey: string };
        progression?: { totalPoints: number; currentLevel: number; badgeCount: number };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Sign-in failed.");
      }

      // Determine return type from a future real API field;
      // for now derive from URL param or default to same-day
      const urlParams = new URLSearchParams(window.location.search);
      const returnParam = (urlParams.get("returnType") ?? "same-day") as ReturnType;
      const session = getMockSession(returnParam);
      session.displayName = payload.student?.displayName ?? session.displayName;
      onAuth(session);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed.";
      if (msg === "Wrong username or PIN.") {
        setError("Oops, that PIN did not match.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const numpadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["⌫", "0", "✓"],
  ];

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "linear-gradient(135deg, #1a1060 0%, #140e50 100%)",
            border: "2px solid #2a2060",
            borderRadius: "24px",
            padding: "36px 32px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0",
          }}
        >
          {/* Mascot */}
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #c4a0ff, #9b72ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              marginBottom: "16px",
              boxShadow: "0 4px 20px rgba(155,114,255,0.35)",
              animation: "mascotFloat 2.5s ease-in-out infinite",
            }}
          >
            🦋
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 900,
              color: "#fff",
              marginBottom: "4px",
              textAlign: "center",
            }}
          >
            Welcome back! ✨
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#b8a0e8",
              fontWeight: 700,
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            Sign in to continue your quest
          </div>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            {/* Username */}
            <input
              autoComplete="username"
              inputMode="text"
              placeholder="Your name"
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "14px",
                border: "2px solid #4a30b0",
                background: "#0d0924",
                color: "#fff",
                fontFamily: "'Nunito', 'Inter', sans-serif",
                fontSize: "18px",
                fontWeight: 900,
                textAlign: "center",
                outline: "none",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* PIN display */}
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              4-digit PIN
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
              aria-label="PIN display"
            >
              {pinDigits.map((index) => (
                <div
                  key={index}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    border: `2px solid ${pin[index] ? "#9b72ff" : "#2a2060"}`,
                    background: pin[index] ? "#2a1880" : "#1a1060",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    color: "#c4a0ff",
                    fontWeight: 900,
                    transition: "all 0.15s",
                  }}
                >
                  {pin[index] ? "★" : ""}
                </div>
              ))}
            </div>

            {/* Hidden keyboard input for accessibility */}
            <input
              autoComplete="one-time-code"
              id="child-pin-input"
              inputMode="numeric"
              maxLength={4}
              name="pin"
              pattern="[0-9]*"
              placeholder="1234"
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                width: 0,
                height: 0,
              }}
              type="password"
              value={pin}
              onChange={handlePinFieldChange}
            />

            {/* Numpad */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              {numpadRows.flat().map((key) => {
                const isAction = key === "⌫" || key === "✓";
                return (
                  <button
                    key={key}
                    type={key === "✓" ? "submit" : "button"}
                    disabled={key === "✓" && (pin.length < 4 || !username.trim())}
                    onClick={() => {
                      if (key === "⌫") removePinDigit();
                      else if (key !== "✓") appendPinDigit(key);
                    }}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: isAction ? "#2a2060" : "#1a1460",
                      color: key === "✓" ? "#58e8c1" : key === "⌫" ? "#ff7b6b" : "#fff",
                      fontFamily: "'Nunito', 'Inter', sans-serif",
                      fontSize: "20px",
                      fontWeight: 900,
                      cursor: "pointer",
                      opacity:
                        key === "✓" && (pin.length < 4 || !username.trim()) ? 0.4 : 1,
                      transition: "transform 0.1s, opacity 0.15s",
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {error && (
              <div
                style={{
                  background: "#2a1010",
                  border: "2px solid #ff7b6b",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#ff7b6b",
                  textAlign: "center",
                  marginBottom: "14px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || pin.length < 4 || !username.trim()}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                border: "none",
                background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
                color: "#fff",
                fontFamily: "'Nunito', 'Inter', sans-serif",
                fontSize: "18px",
                fontWeight: 900,
                cursor: "pointer",
                opacity: submitting || pin.length < 4 || !username.trim() ? 0.5 : 1,
                boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
                transition: "transform 0.15s, opacity 0.15s",
              }}
            >
              {submitting ? "Signing in…" : "Jump Back In ⚡"}
            </button>
          </form>

          <Link
            href="/child"
            style={{
              marginTop: "16px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#5a4080",
              textDecoration: "none",
            }}
          >
            New adventurer? Start fresh →
          </Link>
        </div>

        <style>{`
          @keyframes mascotFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}</style>
      </main>
    </AppFrame>
  );
}

// ─── Returning Player Hub ──────────────────────────────────────────────────────

function ReturningHub({ session }: { session: ChildSession }) {
  const { returnType } = session;
  const isComeback = returnType === "comeback";
  const isSevenDay = returnType === "seven-day";
  const isTwoDay = returnType === "two-day";
  const isSameDay = returnType === "same-day";

  const greetings: Record<ReturnType, { mascot: string; mascotBg: string; name: string; sub: string }> = {
    "same-day": {
      mascot: "🦋",
      mascotBg: "radial-gradient(circle at 35% 35%, #c4a0ff, #9b72ff)",
      name: `Welcome back, ${session.displayName}! ✨`,
      sub: "You were just here — ready to keep going?",
    },
    "two-day": {
      mascot: "🦁",
      mascotBg: "radial-gradient(circle at 35% 35%, #ffb060, #ff8020)",
      name: `${session.displayName} is back! Let's quest! 🚀`,
      sub: "Your world has been waiting for you",
    },
    "seven-day": {
      mascot: "🐉",
      mascotBg: "radial-gradient(circle at 35% 35%, #80d0ff, #2080c0)",
      name: `${session.displayName} returns! The dragons waited! 🐉`,
      sub: "Great news — your streak is restored!",
    },
    "comeback": {
      mascot: "🏆",
      mascotBg: "radial-gradient(circle at 35% 35%, #ffd166, #e09000)",
      name: `LEGENDARY COMEBACK, ${session.displayName.toUpperCase()}! 🎉`,
      sub: "You earned +2 stars + 100 XP + the Legend Badge!",
    },
  };

  const greeting = greetings[returnType];

  const weekDays = isTwoDay
    ? [
        { label: "Mon", state: "played" },
        { label: "Tue", state: "played" },
        { label: "Wed", state: "gap" },
        { label: "Thu", state: "gap" },
        { label: "Fri", state: "today" },
      ]
    : null;

  const todayChallenge = {
    skillName: "Counting to 20",
    skillEmoji: "🔢",
    description: "A quick 5-question challenge — earn a bonus star!",
  };

  const continueLabel =
    isComeback
      ? "Continue Legendary Quest 🏆"
      : isSevenDay
        ? "🔥 Start New Streak"
        : isTwoDay
          ? "⚡ Jump Back In"
          : "▶ Continue Adventure";

  const worldCardBorder = isComeback ? "#ffd166" : "#4a30b0";
  const worldCardBg = isComeback
    ? "linear-gradient(135deg, #2a2010, #1a1060)"
    : "linear-gradient(135deg, #1a1060 0%, #2a1880 100%)";
  const worldCardAccent = isComeback ? "#ffd166" : "#9b72ff";
  const playBtnBg = isComeback
    ? "linear-gradient(135deg, #ffd166, #e09000)"
    : "linear-gradient(135deg, #9b72ff, #7c4ddb)";
  const playBtnColor = isComeback ? "#1a1000" : "#fff";
  const playBtnShadow = isComeback
    ? "0 6px 20px rgba(255,209,102,0.35)"
    : "0 6px 20px rgba(155,114,255,0.4)";

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main
        style={{
          background: "#100b2e",
          minHeight: "100vh",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* ── Top nav bar ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#0d0924",
            borderBottom: "2px solid #1e1860",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            height: "56px",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#9b72ff" }}>
            Wonder<span style={{ color: "#ffd166" }}>Quest</span>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#ff9d3b",
            }}
          >
            🔥 {session.streak} {session.streak === 1 ? "day" : "days"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "16px",
              fontWeight: 900,
              color: "#ffd166",
            }}
          >
            ⭐ {session.stars}
          </div>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "radial-gradient(circle at 35% 35%, #c4a0ff, #7c4ddb)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            {session.avatarEmoji}
          </div>
        </div>

        {/* ── Page body ───────────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "40px 24px 64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >

          {/* ── Comeback banner (30-day only) ──────────────────────────── */}
          {isComeback && (
            <div
              style={{
                width: "100%",
                maxWidth: "860px",
                background: "linear-gradient(135deg, #2a2010 0%, #1a1460 100%)",
                border: "2px solid #ffd166",
                borderRadius: "20px",
                padding: "24px 28px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "52px",
                  flexShrink: 0,
                  animation: "trophyBounce 2s ease-in-out infinite",
                  display: "inline-block",
                }}
              >
                🏆
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffd166", marginBottom: "4px" }}>
                  LEGENDARY COMEBACK, {session.displayName.toUpperCase()}! 🎉
                </div>
                <div style={{ fontSize: "13px", color: "#b8a0a0", fontWeight: 700 }}>
                  You earned +2 stars + 100 XP + the Legend Badge just for coming back!
                </div>
              </div>
              <Link
                href="/play"
                style={{
                  padding: "12px 22px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ffd166, #e09000)",
                  color: "#1a1000",
                  fontFamily: "'Nunito', 'Inter', sans-serif",
                  fontSize: "15px",
                  fontWeight: 900,
                  textDecoration: "none",
                  flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(255,209,102,0.3)",
                }}
              >
                I&apos;m Back! 🚀
              </Link>
            </div>
          )}

          {/* ── Mascot + greeting ─────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "28px",
              width: "100%",
              maxWidth: "680px",
            }}
          >
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                background: greeting.mascotBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "44px",
                flexShrink: 0,
                boxShadow: "0 4px 20px rgba(155,114,255,0.35)",
                animation: "mascotFloat 2.5s ease-in-out infinite",
              }}
            >
              {greeting.mascot}
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>
                {greeting.name}
              </div>
              <div style={{ fontSize: "15px", color: "#b8a0e8", fontWeight: 700 }}>
                {greeting.sub}
              </div>
            </div>
          </div>

          {/* ── Bonus chips (7-day / comeback) ────────────────────────── */}
          {session.bonusChips && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "20px",
                width: "100%",
                maxWidth: "860px",
              }}
            >
              {session.bonusChips.map((chip, i) => {
                const chipColors: Record<string, { bg: string; border: string; color: string }> = {
                  gold: { bg: "#2a2010", border: "#ffd166", color: "#ffd166" },
                  green: { bg: "#0a2a15", border: "#50e890", color: "#50e890" },
                  violet: { bg: "#1a1060", border: "#9b72ff", color: "#c4a0ff" },
                };
                const cc = chipColors[chip.variant];
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      borderRadius: "20px",
                      padding: "8px 14px",
                      fontSize: "14px",
                      fontWeight: 900,
                      background: cc.bg,
                      border: `2px solid ${cc.border}`,
                      color: cc.color,
                      animation: `chipPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.1}s both`,
                    }}
                  >
                    {chip.label}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 2-col main grid ───────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: "20px",
              width: "100%",
              maxWidth: "860px",
            }}
          >
            {/* LEFT COLUMN */}
            <div>
              {/* Star-safe badge (gap states) */}
              {(isTwoDay || isSevenDay || isComeback) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#1a2a15",
                    border: "2px solid #50e890",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>⭐</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#50e890" }}>
                    {isComeback
                      ? `Every star you ever earned is still here — ${session.stars - 2} stars, all waiting!`
                      : `Your ${session.stars} stars are safe — they never go away!`}
                  </span>
                </div>
              )}

              {/* Jump back in — world resume card */}
              <div
                style={{
                  background: worldCardBg,
                  border: `2px solid ${worldCardBorder}`,
                  borderRadius: "20px",
                  padding: "22px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: worldCardAccent,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "6px",
                  }}
                >
                  {isSameDay
                    ? "Continue Where You Left Off"
                    : isTwoDay
                      ? "Right Where You Left Off"
                      : isSevenDay
                        ? "Still Right There For You"
                        : "Your World Is Still Here"}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 900,
                    color: "#fff",
                    marginBottom: "12px",
                  }}
                >
                  {session.worldName} {session.worldEmoji}
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: "12px",
                    background: "#2a1880",
                    borderRadius: "7px",
                    overflow: "hidden",
                    marginBottom: "6px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${session.worldProgress}%`,
                      borderRadius: "7px",
                      background: isComeback
                        ? "linear-gradient(90deg, #ffd166, #ffb020)"
                        : "linear-gradient(90deg, #9b72ff, #c4a0ff)",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: worldCardAccent,
                    marginBottom: "16px",
                  }}
                >
                  <span>Node {session.currentNode} of {session.totalNodes}</span>
                  <span>{session.worldProgress}% explored</span>
                </div>

                <Link
                  href="/play"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px",
                    borderRadius: "14px",
                    background: playBtnBg,
                    color: playBtnColor,
                    fontFamily: "'Nunito', 'Inter', sans-serif",
                    fontSize: "18px",
                    fontWeight: 900,
                    textAlign: "center",
                    textDecoration: "none",
                    boxShadow: playBtnShadow,
                    boxSizing: "border-box",
                  }}
                >
                  {continueLabel}
                </Link>
              </div>

              {/* Today's challenge card */}
              <div
                style={{
                  background: "#1a1060",
                  border: "2px solid #2a2060",
                  borderRadius: "16px",
                  padding: "18px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#58e8c1",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "10px",
                  }}
                >
                  Today&apos;s Challenge ⚡
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <span style={{ fontSize: "36px" }}>{todayChallenge.skillEmoji}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 900,
                        color: "#fff",
                        marginBottom: "4px",
                      }}
                    >
                      {todayChallenge.skillName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#7a6090", fontWeight: 700 }}>
                      {todayChallenge.description}
                    </div>
                  </div>
                  <Link
                    href="/play"
                    style={{
                      padding: "10px 16px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #58e8c1, #30c090)",
                      color: "#0a2020",
                      fontFamily: "'Nunito', 'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 900,
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    Go!
                  </Link>
                </div>
              </div>

              {/* Explore another world */}
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "2px solid #2a2060",
                  background: "#1a1060",
                  color: "#9b72ff",
                  fontFamily: "'Nunito', 'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {isSevenDay || isComeback
                  ? "Start Fresh in a New World 🌍"
                  : "Try a Different World 🌍"}
              </button>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Streak panel */}
              <div
                style={{
                  background: "#1a1060",
                  border: isComeback ? "1px solid #ffd166" : "1px solid #2a2060",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: isComeback ? "#ffd166" : "#9b72ff",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}
                >
                  {isComeback ? "Legend Status 🏆" : isSevenDay ? "Fresh Streak Start 🔥" : "Quest Streak 🔥"}
                </div>

                {!isTwoDay ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "32px" }}>🔥</span>
                      <div>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: 900,
                            color: "#ffd166",
                            lineHeight: 1,
                          }}
                        >
                          {isSevenDay ? "Day 1" : session.streak}
                        </div>
                        <div style={{ fontSize: "11px", color: "#b8a0e8", fontWeight: 700 }}>
                          {isSevenDay ? "brand new streak!" : "days strong"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                      {Array.from({ length: 7 }, (_, i) => (
                        <div
                          key={i}
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background:
                              (isSevenDay ? i < 1 : i < session.streak)
                                ? "#ffd166"
                                : "#2a2060",
                            boxShadow:
                              (isSevenDay ? i < 1 : i < session.streak)
                                ? "0 0 6px #ffd166"
                                : "none",
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  /* 2-day: week bar */
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginBottom: "8px",
                      }}
                    >
                      {weekDays!.map((day) => (
                        <div
                          key={day.label}
                          style={{
                            flex: 1,
                            height: "36px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: 900,
                            flexDirection: "column",
                            background:
                              day.state === "played"
                                ? "#1a2a15"
                                : day.state === "today"
                                  ? "#2a1880"
                                  : "#1e1a40",
                            border:
                              day.state === "played"
                                ? "1px solid #50e890"
                                : day.state === "today"
                                  ? "1px solid #9b72ff"
                                  : "1px dashed #4a30b0",
                            color:
                              day.state === "played"
                                ? "#50e890"
                                : day.state === "today"
                                  ? "#c4a0ff"
                                  : "#5a4080",
                          }}
                        >
                          <div>{day.label}</div>
                          <div>{day.state === "played" ? "✓" : day.state === "today" ? "NOW" : "—"}</div>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#9b72ff",
                      }}
                    >
                      Play today to keep going!
                    </div>
                  </>
                )}
              </div>

              {/* Recent wins strip */}
              <div
                style={{
                  background: "#1a1060",
                  border: "1px solid #2a2060",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#9b72ff",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}
                >
                  {isComeback ? "All Still Yours ⭐" : isTwoDay ? "Still Yours ⭐" : "Recent Wins 🎉"}
                </div>
                {session.recentWins.slice(0, 3).map((win, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "7px 0",
                      borderBottom: i < 2 ? "1px solid #2a2060" : "none",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: isComeback && i === 0 ? "#ffd166" : "#c4a0ff",
                    }}
                  >
                    <span>{win.icon}</span>
                    <span style={{ flex: 1 }}>{win.text}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#5a4080",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {win.meta}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick nav */}
              <div
                style={{
                  background: "#1a1060",
                  border: "1px solid #2a2060",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#9b72ff",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}
                >
                  Quick Nav
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { href: "/child", icon: "🏠", label: "Home" },
                    { href: "/child", icon: "🗺️", label: "Map" },
                    { href: "/child", icon: "🏅", label: "Badges" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        padding: "10px 6px",
                        borderRadius: "10px",
                        background: "#0d0924",
                        border: "1px solid #2a2060",
                        textDecoration: "none",
                        color: "#c4a0ff",
                        fontSize: "11px",
                        fontWeight: 900,
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes mascotFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes trophyBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
          }
          @keyframes chipPop {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </main>
    </AppFrame>
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function ChildReturningPage() {
  const [session, setSession] = useState<ChildSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Attempt silent session restore on mount
  useEffect(() => {
    let cancelled = false;
    async function tryRestore() {
      try {
        const response = await fetch("/api/child/session", { method: "GET" });
        if (!response.ok || cancelled) {
          setSessionChecked(true);
          return;
        }
        // Derive return type from URL param; API may later supply it
        const urlParams = new URLSearchParams(window.location.search);
        const returnParam = (urlParams.get("returnType") ?? "same-day") as ReturnType;
        const restored = getMockSession(returnParam);
        if (!cancelled) {
          setSession(restored);
          setSessionChecked(true);
        }
      } catch {
        if (!cancelled) setSessionChecked(true);
      }
    }
    void tryRestore();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show nothing until session check completes (prevents flash)
  if (!sessionChecked) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <main
          style={{
            minHeight: "100vh",
            background: "#100b2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              animation: "mascotFloat 1.5s ease-in-out infinite",
            }}
          >
            🌟
          </div>
          <style>{`
            @keyframes mascotFloat {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
        </main>
      </AppFrame>
    );
  }

  if (session) {
    return <ReturningHub session={session} />;
  }

  return <PinGate onAuth={setSession} />;
}
