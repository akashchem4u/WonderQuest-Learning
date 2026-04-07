"use client";
// Renders a horizontal scrollable row of student name pills.
// Used on teacher pages where data is scoped to a specific student.
// If only 1 student, renders nothing.

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  violet: "#9b72ff",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ─── Band color helper ────────────────────────────────────────────────────────

function bandColor(code: string): string {
  if (code === "PREK" || code === "P0") return "#ffd166";
  if (code === "K1" || code === "P1") return "#9b72ff";
  if (code === "G23" || code === "P2") return "#58e8c1";
  if (code === "G45" || code === "P3") return "#ff7b6b";
  return "#9b72ff";
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StudentPickerStudent {
  id: string;
  displayName: string;
  username: string;
  launchBandCode?: string;
}

interface StudentPickerProps {
  students: StudentPickerStudent[];
  activeStudentId: string;
  onSelect: (studentId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentPicker({ students, activeStudentId, onSelect }: StudentPickerProps) {
  // Only render when there are multiple students
  if (!students || students.length <= 1) return null;

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
      {students.map((student) => {
        const isActive = student.id === activeStudentId;
        const color = bandColor(student.launchBandCode ?? "");
        return (
          <button
            key={student.id}
            onClick={() => onSelect(student.id)}
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
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span>{student.displayName}</span>
          </button>
        );
      })}
    </div>
  );
}
