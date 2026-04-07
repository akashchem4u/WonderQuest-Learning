"use client";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  violet: "#9b72ff",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ─── Avatar helper ────────────────────────────────────────────────────────────

function getAvatarSymbol(avatarKey: string): string {
  const k = (avatarKey ?? "").toLowerCase();
  if (k.includes("bunny")) return "🐰";
  if (k.includes("bear")) return "🐻";
  if (k.includes("lion")) return "🦁";
  if (k.includes("fox")) return "🦊";
  if (k.includes("panda")) return "🐼";
  if (k.includes("owl")) return "🦉";
  return "✨";
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ChildPickerChild {
  id: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
}

interface ChildPickerProps {
  children: ChildPickerChild[];
  activeChildId: string;
  onSelect: (childId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChildPicker({ children, activeChildId, onSelect }: ChildPickerProps) {
  // Only render when there are multiple children
  if (!children || children.length <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        paddingBottom: "4px",
        marginBottom: "24px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children.map((child) => {
        const isActive = child.id === activeChildId;
        return (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              border: isActive
                ? `2px solid ${C.violet}`
                : `1px solid ${C.border}`,
              background: isActive
                ? "rgba(155,114,255,0.18)"
                : C.surface,
              color: isActive ? C.text : C.muted,
              font: `${isActive ? 700 : 500} 0.85rem system-ui`,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s",
              outline: "none",
            }}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>
              {getAvatarSymbol(child.avatarKey)}
            </span>
            <span>{child.displayName}</span>
          </button>
        );
      })}
    </div>
  );
}
