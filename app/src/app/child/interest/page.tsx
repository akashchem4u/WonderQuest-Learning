"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionData = {
  student: { displayName: string; launchBandCode: string };
  progression: { totalPoints: number; currentLevel: number; badgeCount: number; trophyCount: number };
};

type ScreenId = "pick" | "complete";

type Interest = {
  id: string;
  emoji: string;
  name: string;
};

// ─── Interest data ────────────────────────────────────────────────────────────

const MAX_INTERESTS = 5;

const INTERESTS: Interest[] = [
  { id: "dinos", emoji: "🦖", name: "Dinosaurs" },
  { id: "space", emoji: "🚀", name: "Space" },
  { id: "unicorns", emoji: "🦄", name: "Unicorns" },
  { id: "ocean", emoji: "🐳", name: "Ocean" },
  { id: "dragons", emoji: "🐉", name: "Dragons" },
  { id: "colors", emoji: "🌈", name: "Colors" },
  { id: "sports", emoji: "⚽", name: "Sports" },
  { id: "music", emoji: "🎵", name: "Music" },
  { id: "food", emoji: "🍕", name: "Food" },
  { id: "pets", emoji: "🐾", name: "Pets" },
  { id: "castles", emoji: "🏰", name: "Castles" },
  { id: "art", emoji: "🎨", name: "Art" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildInterestPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [screen, setScreen] = useState<ScreenId>("pick");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Explorer");

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        if (data?.student?.displayName) setDisplayName(data.student.displayName);
      })
      .catch(() => {});
  }, []);

  const count = selected.size;
  const isMaxed = count >= MAX_INTERESTS;

  function toggleInterest(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_INTERESTS) {
        next.add(id);
      }
      return next;
    });
  }

  function handleContinue() {
    setScreen("complete");
  }

  const selectedInterests = INTERESTS.filter((i) => selected.has(i.id));

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0820",
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#e8e0ff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 16px 60px",
        }}
      >
        {/* Back nav */}
        <div style={{ width: "100%", maxWidth: 420, marginBottom: 8 }}>
          <Link
            href="/child"
            style={{
              color: "#9b72ff",
              fontWeight: 900,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
        </div>

        {/* Phone-frame wrapper */}
        <div
          style={{
            width: 390,
            background: "#100b2e",
            borderRadius: 40,
            border: "2px solid #2a2060",
            boxShadow: "inset 0 0 0 2px rgba(155,114,255,0.13), 0 20px 50px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* Status bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 20px 4px",
              fontSize: 11,
              color: "#9b8ec4",
              fontWeight: 700,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            <span>9:41</span>
            <span>Onboarding</span>
            <span>🔋</span>
          </div>

          {screen === "pick" ? (
            <>
              {/* Step header */}
              <div
                style={{
                  padding: "12px 20px 0",
                  textAlign: "center",
                }}
              >
                {/* Step dots */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  {[true, true, false].map((done, i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          i === 0
                            ? "#50e890"
                            : i === 1
                            ? "#9b72ff"
                            : "#2a2060",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#e8e0ff",
                    marginBottom: 4,
                    lineHeight: 1.2,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  {`${displayName}, what do you love? 🌟`}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#9b8ec4",
                    marginBottom: 14,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  Pick your favorites to make quests just for you!
                </div>
              </div>

              {/* Count badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  margin: "0 16px 12px",
                  padding: 8,
                  background: isMaxed ? "#1e1470" : "#1a1540",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: isMaxed ? "#c4b0ff" : "#9b8ec4",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {isMaxed ? (
                  <>
                    <span>🎉 All 5 picked!</span>
                    <span
                      style={{
                        color: "#9b72ff",
                        fontSize: 16,
                        fontWeight: 900,
                        fontFamily: "'Nunito', system-ui, sans-serif",
                      }}
                    >
                      {count}
                    </span>
                    <span>/ 5</span>
                  </>
                ) : (
                  <>
                    <span>Pick up to 5</span>
                    <span
                      style={{
                        color: "#9b72ff",
                        fontSize: 16,
                        fontWeight: 900,
                        fontFamily: "'Nunito', system-ui, sans-serif",
                      }}
                    >
                      {count}
                    </span>
                    <span>chosen</span>
                  </>
                )}
              </div>

              {/* Interest grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  padding: "0 16px 16px",
                }}
              >
                {INTERESTS.map((interest) => {
                  const isSelected = selected.has(interest.id);
                  const isDimmed = isMaxed && !isSelected;
                  const isHovered = hoveredId === interest.id;

                  return (
                    <div
                      key={interest.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleInterest(interest.id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && toggleInterest(interest.id)
                      }
                      onMouseEnter={() => setHoveredId(interest.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        background: isSelected ? "#1e1470" : "#1a1540",
                        border: `3px solid ${isSelected ? "#9b72ff" : isHovered ? "#9b72ff" : "#2a2060"}`,
                        borderRadius: 16,
                        padding: "12px 8px",
                        textAlign: "center",
                        cursor: isDimmed ? "default" : "pointer",
                        transform:
                          isSelected || isHovered ? "scale(1.04)" : "scale(1)",
                        transition: "border-color 0.15s, transform 0.15s, background 0.15s",
                        position: "relative",
                        opacity: isDimmed ? 0.4 : 1,
                      }}
                    >
                      {/* Selected checkmark */}
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            background: "#9b72ff",
                            color: "#fff",
                            borderRadius: "50%",
                            width: 18,
                            height: 18,
                            fontSize: 10,
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'Nunito', system-ui, sans-serif",
                          }}
                        >
                          ✓
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: 28,
                          marginBottom: 5,
                          display: "block",
                        }}
                      >
                        {interest.emoji}
                      </span>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 900,
                          color: isSelected ? "#e8e0ff" : "#c4b0ff",
                          fontFamily: "'Nunito', system-ui, sans-serif",
                        }}
                      >
                        {interest.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA button */}
              <button
                onClick={count > 0 ? handleContinue : undefined}
                disabled={count === 0}
                style={{
                  margin: "0 16px 12px",
                  width: "calc(100% - 32px)",
                  background: "linear-gradient(135deg, #9b72ff, #7c4dff)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 900,
                  padding: 13,
                  cursor: count === 0 ? "default" : "pointer",
                  opacity: count === 0 ? 0.35 : 1,
                  transition: "opacity 0.2s",
                  display: "block",
                }}
              >
                {count === 0
                  ? "Pick something to continue →"
                  : isMaxed
                  ? "Perfect! Let's go →"
                  : "These look great! →"}
              </button>

              {/* Skip link */}
              <div
                style={{
                  textAlign: "center",
                  paddingBottom: 16,
                  fontSize: 12,
                  color: "#9b8ec4",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {isMaxed ? "Change my picks first" : "I'll choose later →"}
              </div>
            </>
          ) : (
            /* Complete screen */
            <div
              style={{
                padding: "30px 20px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: 60,
                  display: "block",
                  marginBottom: 12,
                  animation: "bounce 1.5s ease-in-out infinite",
                }}
              >
                🎉
              </span>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#e8e0ff",
                  marginBottom: 6,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                Your quests are ready!
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#9b8ec4",
                  marginBottom: 16,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                We made them especially for you, based on what you love:
              </div>

              {/* Interest chips */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {selectedInterests.map((interest, i) => (
                  <span
                    key={interest.id}
                    style={{
                      background: "#1e1470",
                      border: "2px solid #9b72ff",
                      borderRadius: 14,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#c4b0ff",
                      animation: `chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s both`,
                      fontFamily: "'Nunito', system-ui, sans-serif",
                    }}
                  >
                    {interest.emoji} {interest.name}
                  </span>
                ))}
              </div>

              {/* Start adventure CTA */}
              <button
                onClick={() => setScreen("pick")}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #9b72ff, #7c4dff)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 900,
                  padding: 12,
                  cursor: "pointer",
                  marginBottom: 16,
                }}
              >
                🌟 Start My Adventure!
              </button>
            </div>
          )}
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes chip-pop {
            from { opacity: 0; transform: scale(0.6); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </AppFrame>
  );
}
