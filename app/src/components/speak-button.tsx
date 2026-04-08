"use client";
import { useTTS } from "@/hooks/use-tts";

interface SpeakButtonProps {
  text: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function SpeakButton({ text, size = "md", label }: SpeakButtonProps) {
  const { speak } = useTTS();

  const sizes = { sm: 28, md: 36, lg: 44 };
  const px = sizes[size];

  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      aria-label={label ?? `Read aloud: ${text}`}
      title="Read aloud"
      type="button"
      style={{
        width: px, height: px,
        borderRadius: "50%",
        background: "rgba(155,114,255,0.15)",
        border: "1px solid rgba(155,114,255,0.3)",
        color: "#9b72ff",
        fontSize: size === "sm" ? 14 : size === "lg" ? 20 : 16,
        cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      🔊
    </button>
  );
}
