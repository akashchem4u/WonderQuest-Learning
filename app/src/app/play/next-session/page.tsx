"use client";

import { useState } from "react";
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

type TabId = "bonus" | "limit" | "tomorrow";

// ─── Shared sub-components ────────────────────────────────────────────────────
function MiniSummary({ label, stars }: { label: string; stars: string }) {
  return (
    <div style={{
      width: "100%", background: C.card, border: `1.5px solid ${C.border}`,
      borderRadius: 14, padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
    }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: C.muted }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 900, color: C.gold }}>{stars}</div>
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

function StarSafeNote({ message }: { message: string }) {
  return (
    <div style={{
      width: "100%", background: "#1a2a15", border: `1.5px solid rgba(80,232,144,0.27)`,
      borderRadius: 12, padding: "10px 14px",
      display: "flex", alignItems: "center", gap: 9, flexShrink: 0,
    }}>
      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>🛡</span>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#90e890", lineHeight: 1.4 }}>{message}</div>
    </div>
  );
}

function AnnoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10,
      padding: "12px 16px", fontSize: "0.78rem", fontWeight: 700, color: "#3a2800",
      lineHeight: 1.6, maxWidth: 390, width: "100%",
    }}>
      <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 700 }}>{title}</div>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, bg, color, onClick }: { children: React.ReactNode; bg?: string; color?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", height: 54, borderRadius: 27, border: "none",
      background: bg ?? "linear-gradient(135deg, #9b72ff, #7248e8)",
      color: color ?? "#fff",
      ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer", flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

function SecondaryLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", ...FONT, fontSize: "0.84rem", fontWeight: 700, color: "#6050a0",
      background: "none", border: "none", cursor: "pointer",
      textDecoration: "underline", textUnderlineOffset: 2, flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlayNextSessionPage() {
  const [activeTab, setActiveTab] = useState<TabId>("bonus");

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0a12", minHeight: "100vh", padding: "24px 16px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <style>{`
          @keyframes chip-pop {
            from { transform: scale(0.4); opacity: 0; }
            60%  { transform: scale(1.15); }
            to   { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <p style={{ fontSize: "1rem", fontWeight: 900, color: C.muted, letterSpacing: "0.04em" }}>
          play-next-session-prompt-v2 · WonderQuest Design System
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {([
            { id: "bonus", label: "Same Day Bonus" },
            { id: "limit", label: "Daily Limit" },
            { id: "tomorrow", label: "Tomorrow Teaser" },
          ] as { id: TabId; label: string }[]).map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: "7px 14px", borderRadius: 20,
              border: `1.5px solid ${activeTab === id ? C.violet : "#2a2050"}`,
              background: activeTab === id ? C.violet : "#14102a",
              color: activeTab === id ? "#fff" : C.muted,
              ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Same Day Bonus ── */}
        {activeTab === "bonus" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <AnnoBox title='Same Day Bonus — "One more session today?"'>
              Warm invitation after session 1 of the day. Gold bonus chip. Two options: "Play another!" (primary) / "See you tomorrow!" (text link). No guilt, no time pressure.
            </AnnoBox>

            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                padding: "28px 22px 32px", gap: 16,
                alignItems: "center", justifyContent: "center",
              }}>
                <MiniSummary label="⭐ Stars earned this session" stars="+7 ⭐" />

                {/* Prompt card */}
                <div style={{
                  width: "100%", background: "linear-gradient(180deg, #1a1040 0%, #221960 100%)",
                  border: `2px solid ${C.violet}55`, borderRadius: 20,
                  padding: "24px 20px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 14, textAlign: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: "3.5rem" }}>🚀</span>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                    Want to keep going?
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.5 }}>
                    There's more to learn — and a bonus star waiting for you!
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg, #ffd166, #f0a000)",
                    borderRadius: 20, padding: "6px 16px",
                    fontSize: "0.88rem", fontWeight: 900, color: "#1a0c00",
                    display: "flex", alignItems: "center", gap: 6,
                    animation: "chip-pop 0.4s 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}>
                    ⭐ +1 Bonus for playing again today!
                  </div>
                </div>

                <CoachRow message="You're on a roll! One more session and I'll have a surprise for you!" />

                <PrimaryBtn>Play another session! 🎉</PrimaryBtn>
                <SecondaryLink onClick={() => setActiveTab("tomorrow")}>See you tomorrow!</SecondaryLink>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Daily Limit ── */}
        {activeTab === "limit" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <AnnoBox title="Daily Limit — 3 Sessions Reached">
              Child has hit their daily session limit (default: 3, parent-configurable). No shame — warm close. Stars safe message + tomorrow teaser. Only CTA: "See you tomorrow!"
            </AnnoBox>

            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                padding: "28px 22px 32px", gap: 16,
                alignItems: "center", justifyContent: "center",
              }}>
                <MiniSummary label="Total stars today" stars="⭐ 21" />

                {/* Limit card */}
                <div style={{
                  width: "100%", background: "linear-gradient(180deg, #1a1040 0%, #14102a 100%)",
                  border: `2px solid ${C.violet}33`, borderRadius: 20,
                  padding: "24px 20px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 14, textAlign: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: "3.5rem" }}>🌙</span>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                    Amazing session! 🌟
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.5 }}>
                    You've played 3 sessions today — that's your adventure goal! Come back tomorrow for more!
                  </div>
                </div>

                <StarSafeNote message="Your ⭐ 21 stars are saved and waiting for you tomorrow!" />
                <CoachRow message="That was an incredible day of learning! Rest up and I'll see you tomorrow!" />

                <PrimaryBtn
                  bg={`linear-gradient(135deg, ${C.mint}, ${C.mintDark})`}
                  color="#051a14"
                  onClick={() => setActiveTab("tomorrow")}
                >
                  See you tomorrow! 👋
                </PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Tomorrow Teaser ── */}
        {activeTab === "tomorrow" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <AnnoBox title="Tomorrow Teaser — Preview of What's Coming">
              Shown as child leaves. Teaser card previews next session's skill. Builds curiosity without spoiling. No urgency, no FOMO language.
            </AnnoBox>

            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                padding: "28px 22px 32px", gap: 16,
                alignItems: "center", justifyContent: "center",
              }}>
                {/* Prompt card */}
                <div style={{
                  width: "100%", background: "linear-gradient(180deg, #1a1040 0%, #221960 100%)",
                  border: `2px solid ${C.violet}55`, borderRadius: 20,
                  padding: "24px 20px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 12, textAlign: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: "3.5rem" }}>👋</span>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                    See you tomorrow!
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.5 }}>
                    Your stars are safe and ready for tomorrow's adventure!
                  </div>
                  <StarSafeNote message="⭐ 7 stars saved — they'll be here when you return!" />
                </div>

                {/* Teaser card */}
                <div style={{
                  width: "100%", background: "#14102a", border: `1.5px solid #2a2050`,
                  borderRadius: 16, padding: 16,
                  display: "flex", flexDirection: "column", gap: 10, flexShrink: 0,
                }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6050a0" }}>
                    👀 Coming up tomorrow
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "2.4rem", flexShrink: 0 }}>📚</span>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.4 }}>
                      <strong style={{ color: "#fff" }}>Sight Words!</strong>
                      <br />
                      You'll learn to read words like "jump", "play", and "make" super fast!
                    </div>
                  </div>
                </div>

                <CoachRow message="Tomorrow is going to be so fun — I can't wait to see you!" />

                <button onClick={() => setActiveTab("bonus")} style={{
                  width: "100%", height: 54, borderRadius: 27,
                  background: "#1a1440", border: `1.5px solid ${C.dimBorder}`,
                  color: "#b89eff",
                  ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer", flexShrink: 0,
                }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
