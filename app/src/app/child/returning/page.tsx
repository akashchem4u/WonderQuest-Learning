"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReturnType = "same-day" | "two-day" | "seven-day" | "comeback";

// ─── Stub data ────────────────────────────────────────────────────────────────

const RETURN_LABELS: Record<ReturnType, string> = {
  "same-day": "Same Day",
  "two-day": "2-Day Gap",
  "seven-day": "7-Day Gap",
  comeback: "30-Day Return",
};

const TABS: ReturnType[] = ["same-day", "two-day", "seven-day", "comeback"];

// ─── Shared style tokens ──────────────────────────────────────────────────────

const BASE_BG = "#100b2e";
const VIOLET = "#9b72ff";
const GOLD = "#ffd166";
const MINT = "#50e890";
const MUTED = "#9b8ec4";

// ─── Sub-components ───────────────────────────────────────────────────────────

function MascotRow({
  emoji,
  gradFrom,
  gradTo,
  name,
  sub,
}: {
  emoji: string;
  gradFrom: string;
  gradTo: string;
  name: string;
  sub: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginBottom: 32,
        width: "100%",
        maxWidth: 680,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          flexShrink: 0,
          background: `radial-gradient(circle at 35% 35%, ${gradFrom}, ${gradTo})`,
          boxShadow: "0 4px 20px rgba(155,114,255,0.35)",
          animation: "mascotFloat 2.5s ease-in-out infinite",
        }}
      >
        {emoji}
      </div>
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 4,
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#b8a0e8",
            fontWeight: 700,
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

function WorldResumeCard({
  label,
  labelColor,
  worldName,
  progress,
  progressGrad,
  metaLeft,
  metaRight,
  metaColor,
  btnText,
  btnStyle,
  borderColor,
  bgGrad,
}: {
  label: string;
  labelColor?: string;
  worldName: string;
  progress: number;
  progressGrad?: string;
  metaLeft: string;
  metaRight: string;
  metaColor?: string;
  btnText: string;
  btnStyle?: React.CSSProperties;
  borderColor?: string;
  bgGrad?: string;
}) {
  return (
    <div
      style={{
        background: bgGrad ?? "linear-gradient(135deg, #1a1060 0%, #2a1880 100%)",
        border: `2px solid ${borderColor ?? "#4a30b0"}`,
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: labelColor ?? VIOLET,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 6,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          color: "#fff",
          marginBottom: 12,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {worldName}
      </div>
      <div
        style={{
          height: 12,
          background: "#2a1880",
          borderRadius: 7,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            borderRadius: 7,
            background: progressGrad ?? "linear-gradient(90deg, #9b72ff, #c4a0ff)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          fontWeight: 700,
          color: metaColor ?? VIOLET,
          marginBottom: 16,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        <span>{metaLeft}</span>
        <span>{metaRight}</span>
      </div>
      <Link href="/play" style={{ textDecoration: "none", display: "block" }}>
        <button
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
            color: "#fff",
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: 18,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
            ...btnStyle,
          }}
        >
          {btnText}
        </button>
      </Link>
    </div>
  );
}

function AltWorldBtn() {
  return (
    <button
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 12,
        border: "2px solid #2a2060",
        background: "#1a1060",
        color: VIOLET,
        fontFamily: "'Nunito', system-ui, sans-serif",
        fontSize: 14,
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      Try a Different World 🌍
    </button>
  );
}

function StarSafe({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#1a2a15",
        border: "2px solid #50e890",
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 16,
      }}
    >
      <span style={{ fontSize: 22 }}>⭐</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: MINT,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function RPanel({
  title,
  children,
  borderColor,
}: {
  title: string;
  children: React.ReactNode;
  borderColor?: string;
}) {
  return (
    <div
      style={{
        background: "#1a1060",
        border: `1px solid ${borderColor ?? "#2a2060"}`,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: borderColor ?? VIOLET,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 12,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function WinRow({
  icon,
  text,
  time,
  color,
}: {
  icon: string;
  text: string;
  time: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 0",
        borderBottom: "1px solid #2a2060",
        fontSize: 13,
        fontWeight: 700,
        color: color ?? "#c4a0ff",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      {icon} {text}
      <span
        style={{
          marginLeft: "auto",
          fontSize: 10,
          color: "#5a4080",
        }}
      >
        {time}
      </span>
    </div>
  );
}

// ─── Screen components ────────────────────────────────────────────────────────

function SameDayScreen() {
  const nodes = [
    { emoji: "🌟", status: "done" },
    { emoji: "🔮", status: "done" },
    { emoji: "💎", status: "done" },
    { emoji: "🗝️", status: "done" },
    { emoji: "🌈", status: "done" },
    { emoji: "🔥", status: "done" },
    { emoji: "🏔️", status: "active" },
    { emoji: "🌙", status: "locked" },
  ];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 32px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <MascotRow
        emoji="🦋"
        gradFrom="#c4a0ff"
        gradTo="#9b72ff"
        name="Welcome back, Zara! ✨"
        sub="You were just here — ready to keep going?"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          width: "100%",
          maxWidth: 860,
        }}
      >
        <div>
          <WorldResumeCard
            label="Continue Where You Left Off"
            worldName="Crystal Caverns 💎"
            progress={58}
            metaLeft="Node 7 of 12"
            metaRight="58% explored"
            btnText="▶ Continue Adventure"
          />
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: VIOLET,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 10,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            {"Today's Nodes"}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {nodes.map((n, i) => (
              <div
                key={i}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  border:
                    n.status === "done"
                      ? "2px solid #50e890"
                      : n.status === "active"
                      ? "2px solid #9b72ff"
                      : "2px solid #2a2060",
                  background:
                    n.status === "done"
                      ? "#0a2a15"
                      : n.status === "active"
                      ? "#2a1880"
                      : "#1a1060",
                  opacity: n.status === "locked" ? 0.35 : 1,
                  position: "relative",
                  cursor: n.status === "locked" ? "default" : "pointer",
                  animation: n.status === "active" ? "ndPulse 1.5s ease-in-out infinite" : undefined,
                }}
              >
                {n.emoji}
                {n.status === "done" && (
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      background: MINT,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      color: "#0a2a15",
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
          <AltWorldBtn />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <RPanel title="Quest Streak 🔥">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 36 }}>🔥</span>
              <div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: GOLD,
                    lineHeight: 1,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  5
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#b8a0e8",
                    fontWeight: 700,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  days strong
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {[true, true, true, true, true, false, false].map((lit, i) => (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: lit ? GOLD : "#2a2060",
                    boxShadow: lit ? `0 0 6px ${GOLD}` : undefined,
                  }}
                />
              ))}
            </div>
          </RPanel>
          <RPanel title="Recent Wins 🎉">
            <WinRow icon="⭐" text="Earned 3 stars" time="today" />
            <WinRow icon="🏅" text="New badge!" time="today" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                fontSize: 13,
                fontWeight: 700,
                color: "#c4a0ff",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              🗝️ Node 6 done
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#5a4080" }}>yesterday</span>
            </div>
          </RPanel>
        </div>
      </div>
    </div>
  );
}

function TwoDayScreen() {
  const weekDays = [
    { label: "Mon", status: "played", sub: "✓" },
    { label: "Tue", status: "played", sub: "✓" },
    { label: "Wed", status: "gap", sub: "—" },
    { label: "Thu", status: "gap", sub: "—" },
    { label: "Fri", status: "today", sub: "NOW" },
  ];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 32px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <MascotRow
        emoji="🦁"
        gradFrom="#ffb060"
        gradTo="#ff8020"
        name="Zara is back! Let's quest! 🚀"
        sub="Your world has been waiting for you"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          width: "100%",
          maxWidth: 860,
        }}
      >
        <div>
          <StarSafe text="Your 42 stars are safe — they never go away!" />
          <WorldResumeCard
            label="Right Where You Left Off"
            worldName="Crystal Caverns 💎"
            progress={58}
            metaLeft="Node 7 — still yours"
            metaRight="58%"
            btnText="⚡ Jump Back In"
          />
          <AltWorldBtn />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <RPanel title="Your Week">
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {weekDays.map((d, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 900,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                    background:
                      d.status === "played"
                        ? "#1a2a15"
                        : d.status === "gap"
                        ? "#1e1a40"
                        : "#2a1880",
                    border:
                      d.status === "played"
                        ? "1px solid #50e890"
                        : d.status === "gap"
                        ? "1px dashed #4a30b0"
                        : "1px solid #9b72ff",
                    color:
                      d.status === "played"
                        ? "#50e890"
                        : d.status === "gap"
                        ? "#5a4080"
                        : "#c4a0ff",
                    animation: d.status === "today" ? "todayGlow 1.5s ease-in-out infinite" : undefined,
                    textAlign: "center",
                    flexDirection: "column" as const,
                  }}
                >
                  {d.label}
                  <br />
                  {d.sub}
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: VIOLET,
                marginTop: 8,
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Play today to keep going!
            </div>
          </RPanel>
          <RPanel title="Still Yours ⭐">
            <WinRow icon="⭐" text="42 stars collected" time="safe" />
            <WinRow icon="🏅" text="3 badges earned" time="safe" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                fontSize: 13,
                fontWeight: 700,
                color: "#c4a0ff",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              💎 Crystal Caverns · Node 7
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#5a4080" }}>waiting</span>
            </div>
          </RPanel>
        </div>
      </div>
    </div>
  );
}

function BonusChips({
  chips,
}: {
  chips: { label: string; variant: "gold" | "green" | "violet" }[];
}) {
  const styles: Record<string, React.CSSProperties> = {
    gold: { background: "#2a2010", border: "2px solid #ffd166", color: GOLD },
    green: { background: "#0a2a15", border: "2px solid #50e890", color: MINT },
    violet: { background: "#1a1060", border: "2px solid #9b72ff", color: "#c4a0ff" },
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      {chips.map((c, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 14,
            fontWeight: 900,
            fontFamily: "'Nunito', system-ui, sans-serif",
            animation: `chipPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.1}s both`,
            ...styles[c.variant],
          }}
        >
          {c.label}
        </div>
      ))}
    </div>
  );
}

function SevenDayScreen() {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 32px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <MascotRow
        emoji="🐉"
        gradFrom="#80d0ff"
        gradTo="#2080c0"
        name="Zara returns! The dragons waited! 🐉"
        sub="Great news — your streak is restored!"
      />
      <BonusChips
        chips={[
          { label: "⭐ +1 star — return bonus", variant: "gold" },
          { label: "✨ +30 XP — streak restored", variant: "green" },
          { label: "🎉 Welcome back!", variant: "violet" },
        ]}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          width: "100%",
          maxWidth: 860,
        }}
      >
        <div>
          <StarSafe text="All 42 stars kept safe while you were away — nothing lost!" />
          <WorldResumeCard
            label="Still Right There For You"
            worldName="Crystal Caverns 💎"
            progress={58}
            metaLeft="Node 7 — unchanged"
            metaRight="58%"
            btnText="🔥 Start New Streak"
          />
          <AltWorldBtn />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <RPanel title="Fresh Streak Start 🔥">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 36 }}>🔥</span>
              <div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: GOLD,
                    lineHeight: 1,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  Day 1
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#b8a0e8",
                    fontWeight: 700,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  brand new streak!
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {[true, false, false, false, false, false, false].map((lit, i) => (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: lit ? GOLD : "#2a2060",
                    boxShadow: lit ? `0 0 6px ${GOLD}` : undefined,
                  }}
                />
              ))}
            </div>
          </RPanel>
          <RPanel title="All Still Yours ⭐">
            <WinRow icon="⭐" text="42 stars → 43 now!" time="+1 bonus" />
            <WinRow icon="🏅" text="3 badges" time="safe" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                fontSize: 13,
                fontWeight: 700,
                color: "#c4a0ff",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              💎 Node 7 waiting
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#5a4080" }}>ready</span>
            </div>
          </RPanel>
        </div>
      </div>
    </div>
  );
}

function ComebackScreen() {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 32px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Gold comeback banner */}
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: "linear-gradient(135deg, #2a2010 0%, #1a1460 100%)",
          border: `2px solid ${GOLD}`,
          borderRadius: 20,
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontSize: 56,
            flexShrink: 0,
            animation: "trophyBounce 2s ease-in-out infinite",
          }}
        >
          🏆
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: GOLD,
              marginBottom: 4,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            LEGENDARY COMEBACK, ZARA! 🎉
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#b8a0a0",
              fontWeight: 700,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            You earned +2 stars + 100 XP + the Legend Badge just for coming back!
          </div>
        </div>
        <Link href="/play" style={{ textDecoration: "none", flexShrink: 0 }}>
          <button
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${GOLD}, #e09000)`,
              color: "#1a1000",
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(255,209,102,0.3)",
            }}
          >
            {"I'm Back! 🚀"}
          </button>
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          width: "100%",
          maxWidth: 860,
        }}
      >
        <div>
          <StarSafe text="Every star you ever earned is still here — 42 stars, all waiting!" />
          <BonusChips
            chips={[
              { label: "⭐ +2 stars", variant: "gold" },
              { label: "✨ +100 XP", variant: "green" },
              { label: "🏅 Legend Badge", variant: "violet" },
            ]}
          />
          <WorldResumeCard
            label="Your World Is Still Here"
            labelColor={GOLD}
            worldName="Crystal Caverns 💎"
            progress={58}
            progressGrad={`linear-gradient(90deg, ${GOLD}, #ffb020)`}
            metaLeft="Node 7 — untouched"
            metaRight="58%"
            metaColor={GOLD}
            btnText="Continue Legendary Quest 🏆"
            borderColor={GOLD}
            bgGrad="linear-gradient(135deg, #2a2010, #1a1060)"
            btnStyle={{
              background: `linear-gradient(135deg, ${GOLD}, #e09000)`,
              color: "#1a1000",
              boxShadow: "0 6px 20px rgba(255,209,102,0.35)",
            }}
          />
          <AltWorldBtn />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <RPanel title="Legend Status 🏆" borderColor={GOLD}>
            <WinRow icon="🏅" text="Legend Badge earned" time="now" color={GOLD} />
            <WinRow icon="⭐" text="Stars: 42 → 44" time="+2" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                fontSize: 13,
                fontWeight: 700,
                color: "#c4a0ff",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              ✨ XP boost +100
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#5a4080" }}>now</span>
            </div>
          </RPanel>
          <RPanel title="All Still Yours ⭐">
            <WinRow icon="⭐" text="44 stars (kept all!)" time="safe" />
            <WinRow icon="🏅" text="4 badges total" time="safe" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                fontSize: 13,
                fontWeight: 700,
                color: "#c4a0ff",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              💎 Crystal Caverns ready
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#5a4080" }}>waiting</span>
            </div>
          </RPanel>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildReturningPage() {
  const [activeTab, setActiveTab] = useState<ReturnType>("same-day");

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ndPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(155,114,255,0); }
        }
        @keyframes todayGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(155,114,255,0); }
        }
        @keyframes chipPop {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes trophyBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>

      <div
        style={{
          background: BASE_BG,
          minHeight: "100vh",
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#fff",
        }}
      >
        {/* Nav */}
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "20px 32px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/child"
            style={{
              color: MUTED,
              fontWeight: 900,
              fontSize: 14,
              textDecoration: "none",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            ← Home
          </Link>
          {/* Dev tab switcher */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 12px",
                  background: activeTab === tab ? VIOLET : "#1e1a40",
                  border: `2px solid ${activeTab === tab ? VIOLET : "#2e2a50"}`,
                  borderRadius: 8,
                  color: activeTab === tab ? "#fff" : "#aaa",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {RETURN_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Screen content */}
        {activeTab === "same-day" && <SameDayScreen />}
        {activeTab === "two-day" && <TwoDayScreen />}
        {activeTab === "seven-day" && <SevenDayScreen />}
        {activeTab === "comeback" && <ComebackScreen />}
      </div>
    </AppFrame>
  );
}
