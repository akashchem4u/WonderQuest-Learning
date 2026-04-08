"use client";

// SiblingSwitcher — horizontal pill row for switching between linked children.
// Renders nothing if there is only 1 child (or 0).

export interface ChildSummary {
  id: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
}

interface Props {
  children: ChildSummary[];
  activeChildId: string;
  onSwitch: (id: string) => void;
}

function getAvatarSymbol(avatarKey: string): string {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "✨";
}

function getBandColor(bandCode: string): string {
  if (bandCode === "PREK" || bandCode === "P0" || bandCode.startsWith("pre")) return "#ffd166";
  if (bandCode === "K1" || bandCode === "P1" || bandCode.startsWith("k1")) return "#9b72ff";
  if (bandCode === "G23" || bandCode === "P2" || bandCode.startsWith("g2") || bandCode.startsWith("g3")) return "#58e8c1";
  if (bandCode === "G45" || bandCode === "P3" || bandCode.startsWith("g4") || bandCode.startsWith("g5")) return "#ff7b6b";
  return "#9b72ff";
}

function getBandLabel(bandCode: string): string {
  if (bandCode === "PREK" || bandCode === "P0" || bandCode.startsWith("pre")) return "Pre-K";
  if (bandCode === "K1" || bandCode === "P1" || bandCode.startsWith("k1")) return "K–1";
  if (bandCode === "G23" || bandCode === "P2" || bandCode.startsWith("g2") || bandCode.startsWith("g3")) return "G2–3";
  if (bandCode === "G45" || bandCode === "P3" || bandCode.startsWith("g4") || bandCode.startsWith("g5")) return "G4–5";
  return bandCode;
}

export function SiblingSwitcher({ children, activeChildId, onSwitch }: Props) {
  if (children.length <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "4px 0",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
      }}
    >
      {children.map((child) => {
        const isActive = child.id === activeChildId;
        const bandColor = getBandColor(child.launchBandCode);
        const avatar = getAvatarSymbol(child.avatarKey);
        const bandLabel = getBandLabel(child.launchBandCode);

        return (
          <button
            key={child.id}
            type="button"
            onClick={() => onSwitch(child.id)}
            style={{
              borderRadius: 24,
              border: `2px solid ${isActive ? "#9b72ff" : "rgba(255,255,255,0.1)"}`,
              background: isActive ? "rgba(155,114,255,0.12)" : "rgba(255,255,255,0.04)",
              padding: "6px 12px 6px 8px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              minHeight: 44,
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              flexShrink: 0,
              fontFamily: "system-ui",
              transition: "border-color 0.15s, background 0.15s",
              boxShadow: isActive ? "0 0 0 3px rgba(155,114,255,0.18)" : "none",
            }}
          >
            {/* Avatar circle */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `${bandColor}22`,
                border: `1.5px solid ${bandColor}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {avatar}
            </div>

            {/* Name */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: isActive ? "#f0f6ff" : "rgba(240,246,255,0.75)",
                whiteSpace: "nowrap",
              }}
            >
              {child.displayName}
            </span>

            {/* Band badge */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: bandColor,
                background: `${bandColor}1a`,
                border: `1px solid ${bandColor}44`,
                borderRadius: 10,
                padding: "1px 7px",
                whiteSpace: "nowrap",
              }}
            >
              {bandLabel}
            </span>

            {/* Active checkmark */}
            {isActive && (
              <span
                style={{
                  fontSize: 13,
                  color: "#9b72ff",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
