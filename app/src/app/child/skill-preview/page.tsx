"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg: "#0a0820",
  card: "#12103a",
  border: "#2a2060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#22c55e",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  dimBorder: "#2a1f60",
};

type SkillProgress = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  launchBandCode: string;
  correctCount: number;
  totalCount: number;
  masteryPct: number;
  lastPracticed: string | null;
};

type Filter = "all" | "reading" | "math";

const SUBJECT_EMOJI: Record<string, string> = {
  reading: "📖",
  math: "🔢",
  phonics: "🔤",
  writing: "✏️",
  science: "🔬",
};

function getEmoji(subjectCode: string): string {
  const key = subjectCode.toLowerCase();
  for (const [k, v] of Object.entries(SUBJECT_EMOJI)) {
    if (key.includes(k)) return v;
  }
  return "✨";
}

function getSubjectLabel(subjectCode: string): string {
  const labels: Record<string, string> = {
    reading: "Reading",
    math: "Math",
    phonics: "Phonics",
    writing: "Writing",
    science: "Science",
  };
  const key = subjectCode.toLowerCase();
  for (const [k, v] of Object.entries(labels)) {
    if (key.includes(k)) return v;
  }
  return subjectCode;
}

function matchesFilter(skill: SkillProgress, filter: Filter): boolean {
  if (filter === "all") return true;
  const sub = skill.subjectCode.toLowerCase();
  if (filter === "reading") return sub.includes("reading") || sub.includes("phonics") || sub.includes("sight");
  if (filter === "math") return sub.includes("math") || sub.includes("number") || sub.includes("count");
  return true;
}

function AccuracyBar({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? C.mint :
    pct >= 50 ? C.gold :
    "#ff7b6b";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 700, color: C.muted }}>
        <span>Accuracy</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: 7, background: "#1a1540", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: SkillProgress }) {
  const [hovered, setHovered] = useState(false);
  const emoji = getEmoji(skill.subjectCode);
  const subjectLabel = getSubjectLabel(skill.subjectCode);
  const pct = Math.round(skill.masteryPct);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card,
        border: `2px solid ${hovered ? C.violet : C.border}`,
        borderRadius: 18,
        overflow: "hidden",
        transition: "border-color 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero strip */}
      <div style={{
        height: 80,
        background: `linear-gradient(135deg, #1e1470, #2a1060)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.4rem",
        position: "relative",
      }}>
        {emoji}
        <span style={{
          position: "absolute", top: 8, right: 10,
          background: "#2d1f80", border: `1px solid ${C.violet}`,
          borderRadius: 7, padding: "2px 8px",
          fontSize: "0.65rem", fontWeight: 900,
          color: "#c4b0ff", textTransform: "uppercase", letterSpacing: 0.5,
          ...FONT,
        }}>
          {subjectLabel}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ fontSize: "0.96rem", fontWeight: 900, color: C.text, lineHeight: 1.2, ...FONT }}>
          {skill.skillName}
        </div>

        {skill.totalCount > 0 ? (
          <AccuracyBar pct={pct} />
        ) : (
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.muted, ...FONT }}>
            Not started yet ✨
          </div>
        )}

        <div style={{ marginTop: "auto" }}>
          <Link
            href={`/play?skill=${encodeURIComponent(skill.skillCode)}`}
            style={{
              display: "block",
              textAlign: "center",
              background: "linear-gradient(135deg, #9b72ff, #7248e8)",
              borderRadius: 10,
              padding: "8px 0",
              fontSize: "0.82rem",
              fontWeight: 900,
              color: "#fff",
              textDecoration: "none",
              ...FONT,
            }}
          >
            Practice →
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      padding: "48px 16px",
      color: C.muted, textAlign: "center",
      ...FONT,
    }}>
      <span style={{ fontSize: "3rem" }}>🔭</span>
      <div style={{ fontSize: "1rem", fontWeight: 900, color: C.text }}>
        {filter === "all" ? "No skills yet!" : `No ${filter} skills found`}
      </div>
      <div style={{ fontSize: "0.84rem", fontWeight: 700, color: C.muted, maxWidth: 260, lineHeight: 1.5 }}>
        {filter === "all"
          ? "Start your first adventure and skills will appear here!"
          : "Try switching to \"All\" to see all your skills."}
      </div>
    </div>
  );
}

export default function ChildSkillPreviewPage() {
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    };

    const studentId = getCookie("wonderquest-child-id");
    if (!studentId) {
      setLoading(false);
      return;
    }

    fetch(`/api/parent/skills?studentId=${encodeURIComponent(studentId)}`)
      .then((r) => r.json())
      .then((data: { skills?: SkillProgress[] }) => {
        setSkills(data.skills ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = skills.filter((s) => matchesFilter(s, filter));

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{
          minHeight: "100vh", background: C.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.muted, ...FONT, fontSize: "1rem", fontWeight: 700,
        }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "2.4rem" }}>🔭</span>
            <div>Loading your skills...</div>
          </div>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        ...FONT,
        color: C.text,
        padding: "24px 16px 60px",
      }}>
        <style>{`
          @keyframes card-pop {
            from { opacity: 0; transform: scale(0.92) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Back nav */}
          <div style={{ marginBottom: 16 }}>
            <Link href="/child" style={{ color: C.violet, fontWeight: 900, fontSize: "0.9rem", textDecoration: "none" }}>
              ← Home
            </Link>
          </div>

          {/* Page header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: C.text }}>
              Your Skills ✨
            </div>
            <div style={{ fontSize: "0.84rem", color: C.muted, marginTop: 4 }}>
              {skills.length > 0
                ? `${skills.length} skill${skills.length !== 1 ? "s" : ""} in your quest`
                : "Start playing to unlock skills!"}
            </div>
          </div>

          {/* Filter buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {(["all", "reading", "math"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? C.violet : "#1a1540",
                  border: `2px solid ${filter === f ? C.violet : C.border}`,
                  borderRadius: 10,
                  color: filter === f ? "#fff" : C.muted,
                  ...FONT, fontSize: "0.82rem", fontWeight: 700,
                  padding: "7px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f === "all" ? "All" : f === "reading" ? "📖 Reading" : "🔢 Math"}
              </button>
            ))}
          </div>

          {/* Skill grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}>
            {filtered.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              filtered.map((skill, i) => (
                <div
                  key={skill.skillCode}
                  style={{ animation: `card-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${0.04 + i * 0.04}s both` }}
                >
                  <SkillCard skill={skill} />
                </div>
              ))
            )}
          </div>

          {/* Back link at bottom */}
          {skills.length > 0 && (
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <Link href="/child" style={{
                color: C.muted, fontSize: "0.84rem", fontWeight: 700,
                textDecoration: "underline", textUnderlineOffset: 2,
              }}>
                ← Back to home
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
