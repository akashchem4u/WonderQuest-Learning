"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

type BannerVariant = "same" | "two" | "seven" | "thirty";

const VARIANTS: { key: BannerVariant; label: string }[] = [
  { key: "same", label: "Same Day" },
  { key: "two", label: "2-Day Gap" },
  { key: "seven", label: "7-Day Gap" },
  { key: "thirty", label: "30-Day Return" },
];

// ─── Session types ────────────────────────────────────────────────────────────

type SessionData = {
  student: {
    displayName: string;
    launchBandCode: string;
  };
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
};

// ─── Banner data factory ───────────────────────────────────────────────────────

function buildBannerData(displayName: string, streakCount: number) {
  return {
    same: {
      mascot: "🦋",
      greeting: `Welcome back, ${displayName}! ✨`,
      sub: "You were just here — your world is waiting!",
      ctaText: "Continue →",
      subColor: "#b8a0e8",
      ctaBg: "#9b72ff",
      ctaColor: "#fff",
      bannerBg: "linear-gradient(135deg, #1e1470 0%, #2a1880 100%)",
      borderColor: "#4a30b0",
      chips: [] as { label: string; variant: "gold" | "green" | "violet" }[],
      showStarSafe: false,
      starSafeText: "",
      mobileSubColor: "#b8a0e8",
      mobileSub: `🔥 ${streakCount} day streak`,
      mobileCta: "Go →",
      mobileCtaBg: "#9b72ff",
      mobileCtaColor: "#fff",
      mobileBg: "linear-gradient(135deg,#1e1470,#2a1880)",
      mobileBorder: "#4a30b0",
    },
    two: {
      mascot: "🦁",
      greeting: `${displayName} is back! 🚀`,
      sub: "Your world is waiting — right where you left it!",
      ctaText: "Jump In →",
      subColor: "#d4a060",
      ctaBg: "#f0a030",
      ctaColor: "#1a0800",
      bannerBg: "linear-gradient(135deg, #2a1a08 0%, #1a1060 100%)",
      borderColor: "#5a3a10",
      chips: [] as { label: string; variant: "gold" | "green" | "violet" }[],
      showStarSafe: true,
      starSafeText: "⭐ Your stars are safe — always!",
      mobileSubColor: "#d4a060",
      mobileSub: "⭐ Stars safe · world waiting",
      mobileCta: "Go →",
      mobileCtaBg: "#f0a030",
      mobileCtaColor: "#1a0800",
      mobileBg: "linear-gradient(135deg,#2a1a08,#1a1060)",
      mobileBorder: "#5a3a10",
    },
    seven: {
      mascot: "🐉",
      greeting: "The dragons waited for you! 🐉",
      sub: "Streak restored — you earned +1 star and +30 XP just for coming back!",
      ctaText: "Let's Go! →",
      subColor: "#80d8b0",
      ctaBg: "#50e890",
      ctaColor: "#0a2a15",
      bannerBg: "linear-gradient(135deg, #0a2a20 0%, #1a1060 100%)",
      borderColor: "#2a6048",
      chips: [
        { label: "⭐ +1 star", variant: "gold" as const },
        { label: "✨ +30 XP", variant: "green" as const },
        { label: "🔥 Streak restored!", variant: "violet" as const },
      ],
      showStarSafe: true,
      starSafeText: "⭐ All your stars kept safe while you were away!",
      mobileSubColor: "#80d8b0",
      mobileSub: "+1⭐ +30XP · All stars safe",
      mobileCta: "Go →",
      mobileCtaBg: "#50e890",
      mobileCtaColor: "#0a2a15",
      mobileBg: "linear-gradient(135deg,#0a2a20,#1a1060)",
      mobileBorder: "#2a6048",
    },
    thirty: {
      mascot: "🏆",
      greeting: `LEGENDARY COMEBACK, ${displayName.toUpperCase()}! 🎉`,
      sub: "+2 stars · +100 XP · Legend Badge — your stars were waiting the whole time!",
      ctaText: "I'm BACK! 🚀",
      subColor: "#f0c080",
      ctaBg: "linear-gradient(135deg, #ffd166, #e09000)",
      ctaColor: "#1a1000",
      bannerBg: "linear-gradient(135deg, #2a2010 0%, #1a1060 100%)",
      borderColor: "#ffd166",
      chips: [
        { label: "⭐ +2 stars", variant: "gold" as const },
        { label: "✨ +100 XP", variant: "green" as const },
        { label: "🏅 Legend Badge", variant: "violet" as const },
      ],
      showStarSafe: true,
      starSafeText: "⭐ Every single star you ever earned is still here!",
      mobileSubColor: "#f0c080",
      mobileSub: "+2⭐ +100XP · Stars safe!",
      mobileCta: "Go →",
      mobileCtaBg: "linear-gradient(135deg,#ffd166,#e09000)",
      mobileCtaColor: "#1a1000",
      mobileBg: "linear-gradient(135deg,#2a2010,#1a1060)",
      mobileBorder: "#ffd166",
    },
  };
}

const CHIP_STYLES: Record<"gold" | "green" | "violet", React.CSSProperties> = {
  gold: { background: "#2a2010", border: "2px solid #ffd166", color: "#ffd166" },
  green: { background: "#0a2a15", border: "2px solid #50e890", color: "#50e890" },
  violet: { background: "#1a1060", border: "2px solid #9b72ff", color: "#c4a0ff" },
};

export default function ChildWelcomeBackPage() {
  const [variant, setVariant] = useState<BannerVariant>("same");
  const [dismissed, setDismissed] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function switchVariant(v: BannerVariant) {
    setVariant(v);
    setDismissed(false);
  }

  const displayName = session?.student.displayName ?? "Explorer";
  const streakCount = 0; // streakCount is not in session API; default to 0
  const BANNER_DATA = buildBannerData(displayName, streakCount);
  const data = BANNER_DATA[variant];

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes wq-gold-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,209,102,0); }
          50% { box-shadow: 0 0 0 6px rgba(255,209,102,0.15); }
        }
        @keyframes wq-chip-pop {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{ ...FONT, background: "#100b2e", minHeight: "100vh", padding: "20px", color: "#e8e0ff" }}>

        {/* Loading state */}
        {loading && (
          <div style={{ ...FONT, textAlign: "center", padding: "60px 0", color: "#9b8ec4", fontSize: 16, fontWeight: 700 }}>
            Loading your adventure...
          </div>
        )}

        {!loading && (
          <>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 24, maxWidth: 900, margin: "0 auto 24px" }}>
              {VARIANTS.map((v) => (
                <button
                  key={v.key}
                  onClick={() => switchVariant(v.key)}
                  style={{
                    ...FONT,
                    padding: "8px 14px",
                    background: variant === v.key ? "#9b72ff" : "#1e1a40",
                    border: `2px solid ${variant === v.key ? "#9b72ff" : "#2e2a50"}`,
                    borderRadius: 8,
                    color: variant === v.key ? "#fff" : "#aaa",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#5a4080", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 12 }}>
                {variant === "same" && "Home hub banner — same-day return (0–3 hours since last session)"}
                {variant === "two" && "Home hub banner — 2-day gap (1–3 days since last session)"}
                {variant === "seven" && "Home hub banner — 7-day gap (4–13 days). Streak restore bonus awarded."}
                {variant === "thirty" && "Home hub banner — 30-day comeback (14+ days). Legendary return."}
              </div>

              {/* Main banner */}
              {!dismissed && (
                <div
                  style={{
                    background: data.bannerBg,
                    border: `2px solid ${data.borderColor}`,
                    borderRadius: 20,
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    marginBottom: 20,
                    animation: variant === "thirty" ? "wq-gold-pulse 2.5s ease-in-out infinite" : "none",
                  }}
                >
                  <span style={{ fontSize: 44, flexShrink: 0 }}>{data.mascot}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 3 }}>{data.greeting}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: data.subColor, lineHeight: 1.4 }}>{data.sub}</div>
                  </div>
                  <button
                    style={{
                      ...FONT,
                      flexShrink: 0,
                      padding: "10px 18px",
                      borderRadius: 12,
                      border: "none",
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: "pointer",
                      background: data.ctaBg,
                      color: data.ctaColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {data.ctaText}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 12,
                      fontSize: 16,
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      padding: 4,
                      background: "none",
                      border: "none",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {dismissed && (
                <div style={{ fontSize: 13, color: "#5a4080", marginBottom: 20, fontStyle: "italic" }}>
                  Banner dismissed — tap a tab to restore it
                </div>
              )}

              {/* Chips (7-day and 30-day only) */}
              {data.chips.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 }}>
                  {data.chips.map((chip, i) => (
                    <div
                      key={i}
                      style={{
                        ...CHIP_STYLES[chip.variant],
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 18,
                        padding: "6px 12px",
                        fontSize: 13,
                        fontWeight: 900,
                        animation: `wq-chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.1 * (i + 1)}s both`,
                      }}
                    >
                      {chip.label}
                    </div>
                  ))}
                </div>
              )}

              {/* Star safe badge */}
              {data.showStarSafe && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#1a2a15",
                  border: "1px solid #50e890",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#50e890",
                  marginBottom: 20,
                }}>
                  {data.starSafeText}
                </div>
              )}

              {/* Mobile preview */}
              <div style={{ fontSize: 12, fontWeight: 900, color: "#9b72ff", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 10 }}>
                Mobile compact version
              </div>
              <div style={{
                width: 375,
                background: "#100b2e",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                margin: "0 auto",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px 6px", fontSize: 11, fontWeight: 700, color: "#9b72ff" }}>
                  <span style={{ color: "#e0d4ff", fontWeight: 900, fontSize: 13 }}>9:41</span>
                  <span>
                    {session ? `⭐ ${session.progression.totalPoints}` : "⭐ —"}
                  </span>
                  <span>94%</span>
                </div>
                <div style={{
                  margin: "0 12px 12px",
                  borderRadius: 16,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: data.mobileBg,
                  border: `2px solid ${data.mobileBorder}`,
                }}>
                  <span style={{ fontSize: 32, flexShrink: 0 }}>{data.mascot}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{data.greeting}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: data.mobileSubColor }}>{data.mobileSub}</div>
                  </div>
                  <button style={{
                    ...FONT,
                    flexShrink: 0,
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: "pointer",
                    background: data.mobileCtaBg,
                    color: data.mobileCtaColor,
                  }}>
                    {data.mobileCta}
                  </button>
                </div>
              </div>

              {/* Back nav */}
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <Link
                  href="/child/hub"
                  style={{
                    ...FONT,
                    display: "inline-block",
                    background: "#1e1a40",
                    border: "2px solid #2e2a50",
                    borderRadius: 10,
                    color: "#9b8ec4",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "8px 20px",
                    textDecoration: "none",
                  }}
                >
                  ← Child Hub
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
