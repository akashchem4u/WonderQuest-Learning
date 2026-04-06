"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg: "#100b2e",
  card: "#1a1440",
  border: "#2a2060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#58e8c1",
  mintDark: "#30b090",
  correct: "#50e890",
  text: "#e8e0ff",
  muted: "#9080c0",
  dimBorder: "#2a1f60",
};

type Mode = "bonus" | "limit" | "tomorrow" | "default";

const MODE_CONFIG: Record<Mode, { headline: string; emoji: string; subtext: string; cardBorder: string; cardBg: string }> = {
  bonus: {
    headline: "Great session! 🎉",
    emoji: "🚀",
    subtext: "Want one more challenge? There's a bonus star waiting!",
    cardBorder: `${C.violet}55`,
    cardBg: "linear-gradient(180deg, #1a1040 0%, #221960 100%)",
  },
  limit: {
    headline: "Amazing work today!",
    emoji: "🌙",
    subtext: "You've hit your adventure goal for today. See you tomorrow!",
    cardBorder: `${C.violet}33`,
    cardBg: "linear-gradient(180deg, #1a1040 0%, #14102a 100%)",
  },
  tomorrow: {
    headline: "Come back tomorrow!",
    emoji: "👋",
    subtext: "More adventures are waiting for you tomorrow!",
    cardBorder: `${C.violet}44`,
    cardBg: "linear-gradient(180deg, #1a1040 0%, #221960 100%)",
  },
  default: {
    headline: "Session complete! 🌟",
    emoji: "🌟",
    subtext: "You did an amazing job today. Keep up the great work!",
    cardBorder: `${C.violet}44`,
    cardBg: "linear-gradient(180deg, #1a1040 0%, #14102a 100%)",
  },
};

function StarSafeNote({ stars }: { stars: number }) {
  return (
    <div style={{
      width: "100%", background: "#1a2a15", border: "1.5px solid rgba(80,232,144,0.27)",
      borderRadius: 12, padding: "10px 14px",
      display: "flex", alignItems: "center", gap: 9, flexShrink: 0,
    }}>
      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>🛡</span>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#90e890", lineHeight: 1.4 }}>
        Your {stars > 0 ? `⭐ ${stars} stars are` : "stars are"} saved and waiting for you!
      </div>
    </div>
  );
}

function CoachRow({ message }: { message: string }) {
  return (
    <div style={{
      width: "100%", display: "flex", alignItems: "flex-start", gap: 10,
      background: C.card, border: `1.5px solid ${C.violet}33`, borderRadius: 12,
      padding: "11px 13px", flexShrink: 0,
    }}>
      <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>🦁</span>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#c8bef0", lineHeight: 1.4 }}>
        <div style={{ fontSize: "0.66rem", fontWeight: 900, color: C.violet, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
          Coach Leo
        </div>
        {message}
      </div>
    </div>
  );
}

const COACH_MESSAGES: Record<Mode, string> = {
  bonus: "You're on a roll! One more session and I'll have a surprise for you!",
  limit: "That was an incredible day of learning! Rest up and I'll see you tomorrow!",
  tomorrow: "Tomorrow is going to be so fun — I can't wait to see you!",
  default: "Every question you answer makes you smarter. I'm so proud of you!",
};

function NextSessionInner() {
  const params = useSearchParams();
  const rawMode = params.get("mode");
  const mode: Mode = (rawMode === "bonus" || rawMode === "limit" || rawMode === "tomorrow") ? rawMode : "default";
  const stars = parseInt(params.get("stars") ?? "0", 10) || 0;

  const cfg = MODE_CONFIG[mode];

  return (
    <AppFrame audience="kid">
      <div style={{
        ...FONT, background: "#0a0a12", minHeight: "100vh",
        padding: "32px 16px 48px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        <style>{`
          @keyframes chip-pop {
            from { transform: scale(0.4); opacity: 0; }
            60%  { transform: scale(1.15); }
            to   { transform: scale(1); opacity: 1; }
          }
          @keyframes star-spin {
            from { transform: rotate(0deg) scale(0.3); opacity: 0; }
            60%  { transform: rotate(15deg) scale(1.2); }
            to   { transform: rotate(0deg) scale(1); opacity: 1; }
          }
        `}</style>

        {/* Stars earned row */}
        <div style={{
          width: "100%", maxWidth: 390,
          background: C.card, border: `1.5px solid ${C.border}`,
          borderRadius: 14, padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: C.muted }}>⭐ Stars earned this session</div>
          <div style={{ fontSize: "1rem", fontWeight: 900, color: C.gold }}>
            {stars > 0 ? `+${stars} ⭐` : "0 ⭐"}
          </div>
        </div>

        {/* Main card */}
        <div style={{
          width: "100%", maxWidth: 390,
          background: cfg.cardBg,
          border: `2px solid ${cfg.cardBorder}`,
          borderRadius: 20, padding: "28px 20px",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 14, textAlign: "center", flexShrink: 0,
        }}>
          <span style={{
            fontSize: "3.5rem",
            animation: "star-spin 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both",
          }}>
            {cfg.emoji}
          </span>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            {cfg.headline}
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.5 }}>
            {cfg.subtext}
          </div>

          {/* Bonus chip only shown for bonus mode */}
          {mode === "bonus" && (
            <div style={{
              background: "linear-gradient(135deg, #ffd166, #f0a000)",
              borderRadius: 20, padding: "6px 16px",
              fontSize: "0.88rem", fontWeight: 900, color: "#1a0c00",
              display: "flex", alignItems: "center", gap: 6,
              animation: "chip-pop 0.4s 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
            }}>
              ⭐ +1 Bonus for playing again today!
            </div>
          )}
        </div>

        {/* Stars safe note */}
        {(mode === "limit" || mode === "tomorrow") && (
          <div style={{ width: "100%", maxWidth: 390 }}>
            <StarSafeNote stars={stars} />
          </div>
        )}

        {/* Coach message */}
        <div style={{ width: "100%", maxWidth: 390 }}>
          <CoachRow message={COACH_MESSAGES[mode]} />
        </div>

        {/* CTA buttons */}
        <div style={{ width: "100%", maxWidth: 390, display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "bonus" && (
            <Link href="/play" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", height: 54, borderRadius: 27, border: "none",
                background: "linear-gradient(135deg, #9b72ff, #7248e8)",
                color: "#fff", ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
              }}>
                Play another session! 🎉
              </button>
            </Link>
          )}

          {mode === "limit" && (
            <Link href="/child" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", height: 54, borderRadius: 27, border: "none",
                background: `linear-gradient(135deg, ${C.mint}, ${C.mintDark})`,
                color: "#051a14", ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
              }}>
                See you tomorrow! 👋
              </button>
            </Link>
          )}

          {mode === "tomorrow" && (
            <Link href="/child" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", height: 54, borderRadius: 27, border: "none",
                background: "linear-gradient(135deg, #9b72ff, #7248e8)",
                color: "#fff", ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
              }}>
                Can't wait! 🌙
              </button>
            </Link>
          )}

          {mode === "default" && (
            <Link href="/play" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", height: 54, borderRadius: 27, border: "none",
                background: "linear-gradient(135deg, #9b72ff, #7248e8)",
                color: "#fff", ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer",
              }}>
                Play again! ▶
              </button>
            </Link>
          )}

          {/* Go home link — shown on all modes */}
          <Link href="/child" style={{
            textAlign: "center", ...FONT,
            fontSize: "0.84rem", fontWeight: 700,
            color: "#6050a0", textDecoration: "underline", textUnderlineOffset: 2,
          }}>
            Go home
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}

export default function PlayNextSessionPage() {
  return (
    <Suspense fallback={
      <AppFrame audience="kid">
        <div style={{
          minHeight: "100vh", background: "#0a0a12",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#9080c0", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 16, fontWeight: 700,
        }}>
          Loading...
        </div>
      </AppFrame>
    }>
      <NextSessionInner />
    </Suspense>
  );
}
