"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  blue: "#38bdf8",
  text: "#f0f6ff",
  muted: "#8b949e",
} as const;

// ── Band config ───────────────────────────────────────────────────────────────

interface BandConfig {
  id: string;
  label: string;
  emoji: string;
  range: string;
  color: string;
  labelColor: string;
  bg: string;
  description: string;
}

const BAND_CONFIG: BandConfig[] = [
  {
    id: "P0",
    label: "PREK",
    emoji: "🐣",
    range: "Pre-K",
    color: "#ffd166",
    labelColor: "#b8860b",
    bg: "rgba(255,209,102,0.08)",
    description: "Letter recognition, counting to 10, basic shapes",
  },
  {
    id: "P1",
    label: "K1",
    emoji: "⭐",
    range: "K–1",
    color: "#9b72ff",
    labelColor: "#7c3fcf",
    bg: "rgba(155,114,255,0.08)",
    description: "Phonics, sight words, adding/subtracting to 20",
  },
  {
    id: "P2",
    label: "G23",
    emoji: "🚀",
    range: "G2–3",
    color: "#22c55e",
    labelColor: "#15803d",
    bg: "rgba(34,197,94,0.08)",
    description: "Reading fluency, multiplication intro, fractions",
  },
  {
    id: "P3",
    label: "G45",
    emoji: "🏗️",
    range: "G4–5",
    color: "#ff7b6b",
    labelColor: "#c0392b",
    bg: "rgba(255,123,107,0.08)",
    description: "Long division, decimals, reading comprehension",
  },
];

// ── Band code normalisation ───────────────────────────────────────────────────

function normaliseBand(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const up = raw.toUpperCase().replace(/[-_\s]/g, "");
  if (up === "PREK" || up === "P0") return "P0";
  if (up === "K1"   || up === "P1") return "P1";
  if (up === "G23"  || up === "P2") return "P2";
  if (up === "G45"  || up === "P3") return "P3";
  return null;
}

// ── Data shape for a live band row ───────────────────────────────────────────

interface LiveBand extends BandConfig {
  count: number;
  pct: number;
  students: { displayName: string; avatarKey: string }[];
}

function buildLiveBands(
  roster: { launchBandCode?: string; displayName?: string; avatarKey?: string }[]
): LiveBand[] {
  const buckets: Record<string, { displayName: string; avatarKey: string }[]> = {
    P0: [],
    P1: [],
    P2: [],
    P3: [],
  };
  for (const s of roster) {
    const band = normaliseBand(s.launchBandCode);
    if (band) {
      buckets[band].push({
        displayName: s.displayName ?? "Student",
        avatarKey: s.avatarKey ?? "",
      });
    }
  }
  const total = roster.length || 1;
  return BAND_CONFIG.map((bc) => ({
    ...bc,
    count: buckets[bc.id].length,
    pct: Math.round((buckets[bc.id].length / total) * 100),
    students: buckets[bc.id],
  }));
}

// ── Avatar emoji from key ─────────────────────────────────────────────────────

function avatarEmoji(key: string): string {
  const map: Record<string, string> = {
    fox: "🦊", owl: "🦉", bear: "🐻", cat: "🐱", dog: "🐶",
    rabbit: "🐰", penguin: "🐧", lion: "🦁", tiger: "🐯", panda: "🐼",
    dragon: "🐲", unicorn: "🦄", star: "⭐", rocket: "🚀",
  };
  return map[key?.toLowerCase()] ?? "🙂";
}

// ── Student chip ──────────────────────────────────────────────────────────────

function StudentChip({
  name,
  avatarKey,
  color,
}: {
  name: string;
  avatarKey: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: "4px 10px 4px 6px",
        fontSize: 12,
        color: C.text,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 14 }}>{avatarEmoji(avatarKey)}</span>
      <span>{name}</span>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          marginLeft: 2,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ── Summary line ──────────────────────────────────────────────────────────────

function buildSummary(bands: LiveBand[], total: number): string {
  const activeBands = bands.filter((b) => b.count > 0);
  if (activeBands.length === 0) return "";
  const topBand = [...activeBands].sort((a, b) => b.count - a.count)[0];
  const plural = activeBands.length !== 1 ? "s" : "";
  return `Your class spans ${activeBands.length} learning band${plural}. Most students are in ${topBand.label} ${topBand.emoji} (${topBand.count} of ${total}).`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BandCoveragePage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    fetchTeacherId().then(id => setAuthed(!!id));
  }, []);

  const [bands, setBands] = useState<LiveBand[]>(buildLiveBands([]));
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void (async () => {
    if (!authed) return;
    const teacherId = await fetchTeacherId();
    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => r.json())
      .then((data) => {
        const roster: { launchBandCode?: string; displayName?: string; avatarKey?: string }[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.roster)
            ? data.roster
            : Array.isArray(data?.students)
            ? data.students
            : [];
        setBands(buildLiveBands(roster));
        setTotalStudents(roster.length);
      })
      .catch(() => {
        // Keep zeroed-out bands on error
      })
      .finally(() => setLoading(false));
  })(); }, [authed]);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/band-coverage">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
          }}
        >
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  const activeBands = bands.filter((b) => b.count > 0);
  const summaryLine = buildSummary(bands, totalStudents);

  return (
    <AppFrame audience="teacher" currentPath="/teacher/band-coverage">
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "28px 20px 64px",
          fontFamily: "system-ui,-apple-system,sans-serif",
          color: C.text,
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: C.text,
              marginBottom: 6,
              lineHeight: 1.2,
            }}
          >
            Band Coverage
          </h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            {loading
              ? "Loading student data…"
              : totalStudents === 0
              ? "No students yet"
              : `${totalStudents} student${totalStudents !== 1 ? "s" : ""} across P0–P3 learning bands`}
          </p>
        </div>

        {/* Empty state */}
        {!loading && totalStudents === 0 && (
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              padding: "48px 32px",
              border: `1px solid ${C.border}`,
              textAlign: "center",
              maxWidth: 460,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏫</div>
            <div
              style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 10 }}
            >
              No students yet
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              Add students to see your class band breakdown.
            </div>
          </div>
        )}

        {/* Summary banner */}
        {!loading && totalStudents > 0 && summaryLine && (
          <div
            style={{
              background: "rgba(56,189,248,0.07)",
              border: `1px solid rgba(56,189,248,0.18)`,
              borderRadius: 12,
              padding: "14px 18px",
              fontSize: 13,
              color: C.blue,
              fontWeight: 700,
              marginBottom: 28,
              lineHeight: 1.5,
            }}
          >
            {summaryLine}
          </div>
        )}

        {/* Band cards */}
        {!loading && totalStudents > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {activeBands.map((band) => (
              <div
                key={band.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: "20px 22px",
                  borderLeft: `4px solid ${band.color}`,
                }}
              >
                {/* Band header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <span style={{ fontSize: 26 }}>{band.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: band.color,
                        lineHeight: 1.2,
                      }}
                    >
                      {band.label}{" "}
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: C.muted }}
                      >
                        {band.range}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {band.description}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: band.color,
                      lineHeight: 1,
                      minWidth: 40,
                      textAlign: "right",
                    }}
                  >
                    {band.count}
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 8,
                    background: C.surfaceAlt,
                    borderRadius: 4,
                    overflow: "hidden",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 4,
                      background: band.color,
                      width: `${band.pct}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    marginBottom: 14,
                  }}
                >
                  {band.pct}% of class · {band.count} student
                  {band.count !== 1 ? "s" : ""}
                </div>

                {/* Student chips */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {band.students.map((s, i) => (
                    <StudentChip
                      key={i}
                      name={s.displayName}
                      avatarKey={s.avatarKey}
                      color={band.color}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Bands with zero students — collapsed pills */}
            {bands.filter((b) => b.count === 0).length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 4,
                }}
              >
                {bands
                  .filter((b) => b.count === 0)
                  .map((band) => (
                    <div
                      key={band.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: C.surfaceAlt,
                        border: `1px solid ${C.border}`,
                        borderRadius: 20,
                        padding: "6px 12px",
                        fontSize: 12,
                        color: C.muted,
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{band.emoji}</span>
                      {band.label} — 0 students
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  background: C.surface,
                  borderRadius: 16,
                  height: 140,
                  border: `1px solid ${C.border}`,
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
