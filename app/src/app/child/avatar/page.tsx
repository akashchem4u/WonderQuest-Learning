"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  gold: "#ffd166",
  text: "#f0f6ff",
  muted: "#9b8ec4",
  surface: "#1a1460",
  border: "#2a2060",
} as const;

type Category = "all" | "animals" | "fantasy" | "space" | "ocean";

type Avatar = { id: string; emoji: string; name: string; tagline: string; category: Exclude<Category, "all"> };

const AVATARS: Avatar[] = [
  { id: "flutter", emoji: "🦋", name: "Flutter", tagline: "Graceful and curious!", category: "animals" },
  { id: "leo", emoji: "🦁", name: "Leo", tagline: "Brave and bold!", category: "animals" },
  { id: "sparks", emoji: "🐉", name: "Sparks", tagline: "Fire and magic!", category: "fantasy" },
  { id: "finn", emoji: "🦊", name: "Finn", tagline: "Clever and quick!", category: "animals" },
  { id: "splash", emoji: "🐬", name: "Splash", tagline: "Fast and friendly!", category: "ocean" },
  { id: "sky", emoji: "🦅", name: "Sky", tagline: "Soaring high!", category: "animals" },
  { id: "luna", emoji: "🌙", name: "Luna", tagline: "Dreamy and wise!", category: "space" },
  { id: "bolt", emoji: "⚡", name: "Bolt", tagline: "Super speedy!", category: "space" },
  { id: "panda", emoji: "🐼", name: "Panda", tagline: "Calm and kind!", category: "animals" },
  { id: "stardust", emoji: "🦄", name: "Stardust", tagline: "Magical and rare!", category: "fantasy" },
  { id: "sage", emoji: "🐢", name: "Sage", tagline: "Wise and steady!", category: "animals" },
  { id: "fin", emoji: "🦈", name: "Fin", tagline: "Sharp and swift!", category: "ocean" },
  { id: "bloom", emoji: "🌺", name: "Bloom", tagline: "Bright and cheerful!", category: "animals" },
  { id: "hop", emoji: "🐸", name: "Hop", tagline: "Bouncy and fun!", category: "animals" },
  { id: "wise", emoji: "🦉", name: "Wise", tagline: "All-knowing owl!", category: "animals" },
  { id: "octo", emoji: "🐙", name: "Octo", tagline: "Eight arms, one heart!", category: "ocean" },
];

const CATS: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "animals", label: "🐾 Animals" },
  { id: "fantasy", label: "🧙 Fantasy" },
  { id: "space", label: "🚀 Space" },
  { id: "ocean", label: "🌊 Ocean" },
];

export default function ChildAvatarPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("all");

  const visible = AVATARS.filter((a) => category === "all" || a.category === category);
  const chosen = AVATARS.find((a) => a.id === selected);

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`@keyframes scale-in { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      <div style={{ minHeight: "100vh", background: "#1a1a2e", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 40px" }}>

        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Step 1 of 3</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>Pick your explorer! 🌟</h1>
            <p style={{ fontSize: 13, color: C.muted, fontWeight: 700 }}>Choose who goes on the adventure with you</p>
          </div>

          {/* Preview strip */}
          {chosen ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.surface, border: `2px solid ${C.violet}`, borderRadius: 16, padding: "14px 16px", marginBottom: 16, animation: "scale-in 0.2s ease-out" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "#2a1880", border: `2px solid ${C.violet}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                {chosen.emoji}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: C.violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Your Explorer</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{chosen.name} {chosen.emoji}</div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>{chosen.tagline}</div>
              </div>
            </div>
          ) : (
            <div style={{ background: C.surface, border: `2px dashed ${C.border}`, borderRadius: 14, padding: 14, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#5a4080" }}>Tap any explorer to pick them!</div>
            </div>
          )}

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", scrollbarWidth: "none" }}>
            {CATS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  flexShrink: 0, padding: "6px 14px", borderRadius: 20,
                  border: `2px solid ${category === cat.id ? C.violet : C.border}`,
                  background: category === cat.id ? C.violet : "#1a1060",
                  color: category === cat.id ? "#fff" : C.muted,
                  fontFamily: "'Nunito', system-ui", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Avatar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {visible.map((av) => {
              const isSelected = selected === av.id;
              return (
                <div
                  key={av.id}
                  onClick={() => setSelected(av.id)}
                  style={{
                    aspectRatio: "1", borderRadius: 20, background: isSelected ? "#2a1880" : "#1a1460",
                    border: `3px solid ${isSelected ? C.violet : C.border}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                    boxShadow: isSelected ? `0 0 0 3px rgba(155,114,255,0.3)` : "none",
                    transform: isSelected ? "scale(1.06)" : "scale(1)",
                    transition: "all 0.15s",
                  }}
                >
                  {isSelected && (
                    <div style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, background: C.violet, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 900 }}>✓</div>
                  )}
                  <span style={{ fontSize: 32 }}>{av.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: isSelected ? "#c4a0ff" : "#7a6090", textAlign: "center", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{av.name}</span>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          {chosen ? (
            <Link href="/child" style={{ display: "block", width: "100%", padding: 14, borderRadius: 14, background: "linear-gradient(135deg, #9b72ff, #7c4ddb)", color: "#fff", fontFamily: "'Nunito', system-ui", fontSize: 17, fontWeight: 900, cursor: "pointer", boxShadow: "0 6px 20px rgba(155,114,255,0.4)", textAlign: "center", textDecoration: "none", marginBottom: 10 }}>
              {chosen.name} it is! Let&apos;s go →
            </Link>
          ) : (
            <div style={{ padding: 14, borderRadius: 14, background: "rgba(155,114,255,0.2)", color: C.muted, fontFamily: "'Nunito', system-ui", fontSize: 17, fontWeight: 900, textAlign: "center", marginBottom: 10 }}>
              Pick an explorer first!
            </div>
          )}

          <Link href="/child" style={{ display: "block", width: "100%", padding: 10, borderRadius: 10, border: `2px solid ${C.border}`, background: "transparent", color: "#6a5090", fontFamily: "'Nunito', system-ui", fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>
            Skip for now →
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
