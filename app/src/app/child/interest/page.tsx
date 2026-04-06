"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

type Interest = { id: string; emoji: string; name: string };

const INTERESTS: Interest[] = [
  { id: "dinos",   emoji: "🦕", name: "Dinosaurs" },
  { id: "space",   emoji: "🚀", name: "Space" },
  { id: "animals", emoji: "🐶", name: "Animals" },
  { id: "games",   emoji: "🎮", name: "Games" },
  { id: "sports",  emoji: "⚽", name: "Sports" },
  { id: "art",     emoji: "🎨", name: "Art" },
  { id: "food",    emoji: "🍕", name: "Food" },
  { id: "music",   emoji: "🎵", name: "Music" },
  { id: "stories", emoji: "📚", name: "Stories" },
  { id: "science", emoji: "🔬", name: "Science" },
  { id: "puzzles", emoji: "🧩", name: "Puzzles" },
  { id: "ocean",   emoji: "🌊", name: "Ocean" },
];

const MAX_PICKS = 5;

const C = {
  bg:      "#100b2e",
  surface: "#161b22",
  border:  "#2a2060",
  violet:  "#9b72ff",
  gold:    "#ffd166",
  mint:    "#50e890",
  text:    "#f0f6ff",
  muted:   "#9b8ec4",
};

const FONT: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif" };

type SaveState = "idle" | "saving" | "saved" | "error";

export default function ChildInterestPage() {
  const router = useRouter();
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [hovered,   setHovered]   = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);

  // Auth check — server will 401 if no valid session
  useEffect(() => {
    if (!document.cookie.includes("wonderquest-child-session")) {
      router.replace("/child");
    }
  }, [router]);

  // Load saved interests from API
  useEffect(() => {
    fetch("/api/child/interests")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { interests: string[] }) => {
        if (Array.isArray(data.interests) && data.interests.length > 0) {
          setSelected(new Set(data.interests));
        }
      })
      .catch(() => {
        // Fall back silently — start with empty selection
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleInterest(id: string) {
    setSaveState("idle");
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_PICKS) return prev; // enforce max
        next.add(id);
      }
      return next;
    });
  }

  async function handleSave() {
    if (selected.size === 0) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/child/interests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: [...selected] }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
      setTimeout(() => router.push("/child/hub"), 1400);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2500);
    }
  }

  const count = selected.size;
  const atMax = count >= MAX_PICKS;

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{
          ...FONT, background: C.bg, minHeight: "100vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.muted, fontSize: 16, fontWeight: 700,
        }}>
          Loading your interests...
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes wq-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes wq-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div style={{
        ...FONT,
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px 72px",
      }}>
        {/* Back link */}
        <div style={{ width: "100%", maxWidth: 520, marginBottom: 8 }}>
          <Link href="/child/hub" style={{
            color: C.gold,
            fontWeight: 900,
            fontSize: 14,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            minHeight: 48,
          }}>
            ← Back to Hub
          </Link>
        </div>

        <div style={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          animation: "wq-fade-up 0.4s ease-out both",
        }}>

          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <h1 style={{ ...FONT, fontSize: 28, fontWeight: 900, color: C.text, margin: "0 0 8px", lineHeight: 1.2 }}>
              What do you love? 🌟
            </h1>
            <p style={{ ...FONT, fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>
              We&apos;ll use your interests to make quests more fun!<br />
              Pick up to <strong style={{ color: C.gold }}>{MAX_PICKS}</strong> favourites.
            </p>
          </div>

          {/* Selected count pill */}
          <div style={{
            ...FONT,
            background: count > 0 ? "rgba(155,114,255,0.14)" : C.surface,
            border: `1.5px solid ${count > 0 ? C.violet : C.border}`,
            borderRadius: 12,
            padding: "10px 16px",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            color: count > 0 ? "#c4b0ff" : C.muted,
            transition: "background 0.2s, border-color 0.2s",
          }}>
            {count === 0
              ? "Tap your favourites below to get started!"
              : atMax
              ? `${count} / ${MAX_PICKS} selected — that's the max! Tap to swap.`
              : `${count} / ${MAX_PICKS} selected — keep going!`}
          </div>

          {/* Interest grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}>
            {INTERESTS.map((interest) => {
              const isSelected = selected.has(interest.id);
              const isHovered  = hovered === interest.id;
              const isDisabled = atMax && !isSelected;

              return (
                <div
                  key={interest.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => !isDisabled && toggleInterest(interest.id)}
                  onKeyDown={(e) => e.key === "Enter" && !isDisabled && toggleInterest(interest.id)}
                  onMouseEnter={() => setHovered(interest.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isSelected
                      ? "rgba(155,114,255,0.22)"
                      : isDisabled
                      ? "rgba(22,27,34,0.5)"
                      : C.surface,
                    border: `2.5px solid ${
                      isSelected ? C.gold : isHovered && !isDisabled ? C.violet : C.border
                    }`,
                    borderRadius: 18,
                    padding: "16px 8px",
                    textAlign: "center",
                    cursor: isDisabled ? "default" : "pointer",
                    opacity: isDisabled ? 0.45 : 1,
                    transform: isSelected
                      ? "scale(1.04)"
                      : isHovered && !isDisabled
                      ? "scale(1.02)"
                      : "scale(1)",
                    transition: "border-color 0.15s, transform 0.15s, background 0.15s, opacity 0.15s",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    minHeight: 90,
                    animation: isSelected ? "wq-pop 0.25s ease-out" : undefined,
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: "absolute",
                      top: 7,
                      right: 7,
                      background: C.gold,
                      color: "#1a0800",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      fontSize: 10,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}>
                      ✓
                    </div>
                  )}
                  <span style={{ fontSize: 30, display: "block", lineHeight: 1 }}>{interest.emoji}</span>
                  <div style={{
                    ...FONT,
                    fontSize: 12,
                    fontWeight: 900,
                    color: isSelected ? C.text : "#c4b0ff",
                    letterSpacing: "0.01em",
                  }}>
                    {interest.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={count === 0 || saveState === "saving" || saveState === "saved"}
            style={{
              ...FONT,
              width: "100%",
              minHeight: 60,
              borderRadius: 20,
              border: "none",
              background: saveState === "saved"
                ? `linear-gradient(135deg, ${C.mint}, #28b870)`
                : saveState === "error"
                ? `linear-gradient(135deg, #ef4444, #b91c1c)`
                : count === 0
                ? C.surface
                : `linear-gradient(135deg, ${C.gold}, #e09000)`,
              color: saveState === "saved" || saveState === "error"
                ? "#fff"
                : count === 0
                ? C.muted
                : "#1a0800",
              fontSize: 18,
              fontWeight: 900,
              cursor: count === 0 || saveState === "saving" || saveState === "saved" ? "default" : "pointer",
              opacity: count === 0 ? 0.5 : 1,
              transition: "background 0.25s, opacity 0.2s",
              boxShadow: saveState === "saved"
                ? `0 4px 24px rgba(80,232,144,0.4)`
                : count > 0 && saveState === "idle"
                ? `0 4px 24px rgba(255,209,102,0.35)`
                : "none",
            }}
          >
            {saveState === "saving"
              ? "Saving..."
              : saveState === "saved"
              ? "Saved! ✨"
              : saveState === "error"
              ? "Oops, try again!"
              : count === 0
              ? "Pick something to continue →"
              : `Save my ${count} pick${count === 1 ? "" : "s"} 🎉`}
          </button>

          <p style={{ ...FONT, textAlign: "center", fontSize: 12, color: C.muted, margin: 0 }}>
            You can always come back and change these!
          </p>
        </div>
      </div>
    </AppFrame>
  );
}
