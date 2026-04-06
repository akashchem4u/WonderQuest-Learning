"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

type Interest = { id: string; emoji: string; name: string };

const INTERESTS: Interest[] = [
  { id: "animals",   emoji: "🦁", name: "Animals" },
  { id: "space",     emoji: "🚀", name: "Space" },
  { id: "sports",    emoji: "⚽", name: "Sports" },
  { id: "art",       emoji: "🎨", name: "Art" },
  { id: "food",      emoji: "🍕", name: "Food" },
  { id: "ocean",     emoji: "🌊", name: "Ocean" },
  { id: "dinos",     emoji: "🦕", name: "Dinosaurs" },
  { id: "games",     emoji: "🎮", name: "Games" },
  { id: "nature",    emoji: "🌱", name: "Nature" },
  { id: "fantasy",   emoji: "🏰", name: "Fantasy" },
];

const STORAGE_KEY = "wq_interests";

export default function ChildInterestPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved,    setSaved]    = useState(false);
  const [hovered,  setHovered]  = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    if (!document.cookie.includes("wonderquest-child-session")) {
      router.replace("/child");
    }
  }, [router]);

  // Load saved selections
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setSelected(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleInterest(id: string) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected]));
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const count = selected.size;

  const C = {
    bg:     "#0a0820",
    card:   "#100b2e",
    border: "#2a2060",
    violet: "#9b72ff",
    gold:   "#ffd166",
    mint:   "#22c55e",
    text:   "#e8e0ff",
    muted:  "#9b8ec4",
  };

  const FONT: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif" };

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
      `}</style>

      <div style={{
        ...FONT,
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px 60px",
      }}>
        {/* Back link */}
        <div style={{ width: "100%", maxWidth: 480, marginBottom: 8 }}>
          <Link href="/child/hub" style={{
            color: C.gold,
            fontWeight: 900,
            fontSize: 14,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            minHeight: 48,
          }}>
            ← Back to Hub
          </Link>
        </div>

        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <h1 style={{ ...FONT, fontSize: 26, fontWeight: 900, color: C.text, margin: "0 0 6px" }}>
              What do you love? 🌟
            </h1>
            <p style={{ ...FONT, fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.5 }}>
              We&apos;ll use your interests to make quests more fun!
            </p>
          </div>

          {/* Count badge */}
          <div style={{
            ...FONT,
            background: count > 0 ? "rgba(155,114,255,0.14)" : "#1a1540",
            border: `1.5px solid ${count > 0 ? C.violet : C.border}`,
            borderRadius: 12,
            padding: "10px 16px",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            color: count > 0 ? "#c4b0ff" : C.muted,
          }}>
            {count === 0
              ? "Tap your favorites below to get started!"
              : `${count} topic${count === 1 ? "" : "s"} selected — tap to add more or remove`}
          </div>

          {/* Interest grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}>
            {INTERESTS.map((interest) => {
              const isSelected = selected.has(interest.id);
              const isHovered  = hovered === interest.id;
              return (
                <div
                  key={interest.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleInterest(interest.id)}
                  onKeyDown={(e) => e.key === "Enter" && toggleInterest(interest.id)}
                  onMouseEnter={() => setHovered(interest.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isSelected ? "rgba(155,114,255,0.18)" : C.card,
                    border: `2.5px solid ${isSelected ? C.gold : isHovered ? C.violet : C.border}`,
                    borderRadius: 18,
                    padding: "18px 12px",
                    textAlign: "center",
                    cursor: "pointer",
                    minHeight: 80,
                    transform: isSelected || isHovered ? "scale(1.03)" : "scale(1)",
                    transition: "border-color 0.15s, transform 0.15s, background 0.15s",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: C.gold,
                      color: "#1a0800",
                      borderRadius: "50%",
                      width: 22,
                      height: 22,
                      fontSize: 11,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      ✓
                    </div>
                  )}
                  <span style={{ fontSize: 32, display: "block" }}>{interest.emoji}</span>
                  <div style={{
                    ...FONT,
                    fontSize: 13,
                    fontWeight: 900,
                    color: isSelected ? "#e8e0ff" : "#c4b0ff",
                  }}>
                    {interest.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <button
            onClick={count > 0 ? handleSave : undefined}
            disabled={count === 0}
            style={{
              ...FONT,
              width: "100%",
              minHeight: 64,
              borderRadius: 20,
              border: "none",
              background: saved
                ? `linear-gradient(135deg,#22c55e,#16a34a)`
                : count === 0
                ? "#1a1540"
                : `linear-gradient(135deg,${C.gold},#e09000)`,
              color: saved ? "#fff" : count === 0 ? C.muted : "#1a0800",
              fontSize: 18,
              fontWeight: 900,
              cursor: count === 0 ? "default" : "pointer",
              opacity: count === 0 ? 0.5 : 1,
              transition: "background 0.2s, opacity 0.2s",
              boxShadow: saved
                ? "0 4px 20px rgba(34,197,94,0.35)"
                : count > 0
                ? "0 4px 20px rgba(255,209,102,0.35)"
                : "none",
            }}
          >
            {saved
              ? "✓ Saved!"
              : count === 0
              ? "Pick something to continue →"
              : "Save my picks 🎉"}
          </button>

          <p style={{ ...FONT, textAlign: "center", fontSize: 12, color: C.muted, margin: 0 }}>
            You can always come back and change these!
          </p>
        </div>
      </div>
    </AppFrame>
  );
}
