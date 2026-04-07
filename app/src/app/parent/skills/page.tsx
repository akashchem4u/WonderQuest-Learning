"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { AppFrame } from "@/components/app-frame";
import { ChildPicker } from "@/components/child-picker";

// ─── Types ────────────────────────────────────────────────────────────────────

type LinkedChild = {
  id: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
};

type ParentSession = {
  linkedChildren: LinkedChild[];
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

type Tab = "all" | "mastered" | "inprogress";
type SortKey = "mastery-desc" | "mastery-asc" | "name" | "last-practiced";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function skillStatus(pct: number, total: number): "Mastered" | "Building" | "Just starting" {
  if (pct >= 70) return "Mastered";
  if (total === 0) return "Just starting";
  if (pct >= 40) return "Building";
  return "Just starting";
}

function statusStyle(status: "Mastered" | "Building" | "Just starting"): React.CSSProperties {
  if (status === "Mastered")
    return { background: "rgba(80,232,144,0.14)", color: "#50e890", border: "1px solid rgba(80,232,144,0.30)" };
  if (status === "Building")
    return { background: "rgba(255,209,102,0.14)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.30)" };
  return { background: "rgba(155,114,255,0.12)", color: "#c4a8ff", border: "1px solid rgba(155,114,255,0.25)" };
}

function barColor(pct: number): string {
  if (pct >= 70) return "#50e890";
  if (pct >= 40) return "#ffd166";
  return "rgba(155,114,255,0.50)";
}

function lastPracticedMs(iso: string | null): number {
  if (!iso) return 0;
  return new Date(iso).getTime();
}

function subjectIcon(code: string): string {
  const c = (code ?? "").toLowerCase();
  if (c.includes("read") || c.includes("ela") || c.includes("literacy")) return "📖";
  if (c.includes("math")) return "➕";
  if (c.includes("science")) return "🔬";
  if (c.includes("social")) return "🌍";
  return "📚";
}

function subjectLabel(code: string): string {
  const c = (code ?? "").toLowerCase();
  if (c.includes("read") || c.includes("ela")) return "Reading";
  if (c.includes("literacy")) return "Literacy";
  if (c.includes("math")) return "Math";
  if (c.includes("science")) return "Science";
  return code ?? "General";
}

function formatLastPracticed(iso: string | null): string {
  if (!iso) return "Not yet practiced";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Skill card ───────────────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: SkillProgress }) {
  const status = skillStatus(skill.masteryPct, skill.totalCount);
  const color = barColor(skill.masteryPct);
  const mastered = status === "Mastered";

  return (
    <Link
      href={`/parent/skills/${encodeURIComponent(skill.skillCode)}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: mastered
            ? "1px solid rgba(80,232,144,0.22)"
            : "1px solid rgba(155,114,255,0.18)",
          borderRadius: "16px",
          padding: "18px 18px 16px",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = mastered
            ? "rgba(80,232,144,0.45)"
            : "rgba(155,114,255,0.45)";
          (e.currentTarget as HTMLDivElement).style.background = mastered
            ? "rgba(80,232,144,0.05)"
            : "rgba(155,114,255,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = mastered
            ? "rgba(80,232,144,0.22)"
            : "rgba(155,114,255,0.18)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
        }}
      >
        {/* Subject icon + name + mastery badge */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
          <span style={{ fontSize: "1.3rem", lineHeight: 1, flexShrink: 0 }}>
            {subjectIcon(skill.subjectCode)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#f0f6ff",
              lineHeight: 1.3,
              marginBottom: "3px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {skill.skillName}
              </span>
              {mastered && (
                <span title="Mastered" style={{ fontSize: "0.75rem", color: "#50e890", flexShrink: 0, fontWeight: 900 }}>✓</span>
              )}
            </div>
            <div style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>
              {subjectLabel(skill.subjectCode)}
            </div>
          </div>
          <span style={{
            fontSize: "0.63rem",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "20px",
            flexShrink: 0,
            ...statusStyle(status),
          }}>
            {status}
          </span>
        </div>

        {/* Mastery bar */}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "0.67rem", color: "rgba(255,255,255,0.38)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Mastery
            </span>
            <span style={{ fontSize: "0.80rem", fontWeight: 800, color }}>
              {skill.masteryPct}%
            </span>
          </div>
          <div style={{
            height: "6px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "999px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${skill.masteryPct}%`,
              height: "100%",
              background: color,
              borderRadius: "999px",
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.67rem", color: "rgba(255,255,255,0.30)" }}>
            {skill.correctCount} correct / {skill.totalCount} attempts
          </span>
          <span style={{ fontSize: "0.67rem", color: "rgba(255,255,255,0.28)" }}>
            {formatLastPracticed(skill.lastPracticed)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  if (filtered) {
    return (
      <div style={{
        textAlign: "center",
        padding: "60px 0",
        color: "rgba(255,255,255,0.38)",
        fontSize: "0.88rem",
      }}>
        No skills match your search.
      </div>
    );
  }
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "320px",
      gap: "12px",
      color: "rgba(255,255,255,0.4)",
      textAlign: "center",
    }}>
      <span style={{ fontSize: "3rem" }}>📚</span>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>
        No skills practiced yet
      </div>
      <div style={{ fontSize: "0.82rem", maxWidth: 300 }}>
        Play a few sessions and skill progress will appear here!
      </div>
      <Link href="/child" style={{
        marginTop: "8px",
        padding: "10px 22px",
        background: "rgba(155,114,255,0.18)",
        border: "1px solid rgba(155,114,255,0.35)",
        borderRadius: "10px",
        color: "#c4a8ff",
        fontWeight: 700,
        fontSize: "0.82rem",
        textDecoration: "none",
      }}>
        Start learning →
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentSkillsPage() {
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("mastery-desc");
  const [session, setSession] = useState<ParentSession | null>(null);
  const [activeChildId, setActiveChildId] = useState<string>("");

  function fetchSkills(studentId: string) {
    setLoading(true);
    setSkills([]);
    fetch(`/api/parent/skills?studentId=${encodeURIComponent(studentId)}`)
      .then(async (res) => {
        if (res.status === 401) throw new Error("Session expired. Please sign in again.");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Failed to load skills.");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return res.json() as Promise<{ skills: any[] }>;
      })
      .then(({ skills: raw }) => {
        const mapped: SkillProgress[] = (raw ?? []).map((s) => ({
          skillCode: String(s.skillCode ?? ""),
          skillName: String(s.displayName ?? s.skillName ?? ""),
          subjectCode: String(s.subjectCode ?? ""),
          launchBandCode: String(s.launchBandCode ?? ""),
          correctCount: Number(s.correctAttempts ?? s.correctCount ?? 0),
          totalCount: Number(s.attempts ?? s.totalCount ?? 0),
          masteryPct: Number(s.masteryScore ?? s.masteryPct ?? 0),
          lastPracticed: s.updatedAt ?? s.lastPracticed ?? null,
        }));
        setSkills(mapped);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load skills.");
        setLoading(false);
      });
  }

  useEffect(() => {
    // Load session to get children, then pick the active child
    fetch("/api/parent/session")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Not authenticated"))))
      .then((s: ParentSession) => {
        setSession(s);
        const urlStudentId =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("studentId")
            : null;
        const studentId =
          urlStudentId ??
          (typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null) ??
          s.linkedChildren[0]?.id ??
          null;

        if (!studentId) {
          setError("No child selected. Please go back to Family Hub and select a child.");
          setLoading(false);
          return;
        }
        setActiveChildId(studentId);
        fetchSkills(studentId);
      })
      .catch(() => {
        // Fallback to old behavior if session fetch fails
        const studentId =
          typeof window !== "undefined"
            ? (new URLSearchParams(window.location.search).get("studentId") ??
                localStorage.getItem("wq_active_student_id"))
            : null;

        if (!studentId) {
          setError("No child selected. Please go back to Family Hub and select a child.");
          setLoading(false);
          return;
        }
        fetchSkills(studentId);
      });
  }, []);


  // ── Derived counts ──
  const masteredCount   = skills.filter((s) => skillStatus(s.masteryPct, s.totalCount) === "Mastered").length;
  const inProgressCount = skills.filter((s) => {
    const st = skillStatus(s.masteryPct, s.totalCount);
    return st === "Building" || (st === "Just starting" && s.totalCount > 0);
  }).length;
  const notStartedCount = skills.filter((s) => s.totalCount === 0).length;

  // ── Tab + search + sort ──
  const filtered = useMemo(() => {
    let list = skills.slice();
    if (tab === "mastered")   list = list.filter((s) => skillStatus(s.masteryPct, s.totalCount) === "Mastered");
    if (tab === "inprogress") list = list.filter((s) => {
      const st = skillStatus(s.masteryPct, s.totalCount);
      return st === "Building" || st === "Just starting";
    });
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.skillName.toLowerCase().includes(q) || subjectLabel(s.subjectCode).toLowerCase().includes(q));
    }
    if (sort === "mastery-desc") list.sort((a, b) => b.masteryPct - a.masteryPct);
    else if (sort === "mastery-asc") list.sort((a, b) => a.masteryPct - b.masteryPct);
    else if (sort === "name") list.sort((a, b) => a.skillName.localeCompare(b.skillName));
    else if (sort === "last-practiced") list.sort((a, b) => lastPracticedMs(b.lastPracticed) - lastPracticedMs(a.lastPracticed));
    return list;
  }, [skills, tab, search, sort]);

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "all",        label: "All Skills",  count: skills.length },
    { id: "mastered",   label: "Mastered ✓",  count: masteredCount },
    { id: "inprogress", label: "In Progress", count: inProgressCount },
  ];

  const SORTS: { id: SortKey; label: string }[] = [
    { id: "mastery-desc",   label: "Mastery ↓" },
    { id: "mastery-asc",    label: "Mastery ↑" },
    { id: "name",           label: "Name" },
    { id: "last-practiced", label: "Last practiced" },
  ];

  return (
    <AppFrame audience="parent" currentPath="/parent/skills">
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #100b2e 0%, #1a1248 55%, #0e1a38 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f0f6ff",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 60px" }}>

          {/* ── Top bar ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <Link href="/parent" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "#9b72ff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "13px",
              padding: "6px 12px",
              background: "rgba(155,114,255,0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(155,114,255,0.22)",
            }}>
              ← Home
            </Link>
            <Link href="/parent/report" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "13px",
              padding: "6px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              Weekly Report
            </Link>
            <Link href="/parent/milestones" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "13px",
              padding: "6px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              🏆 Milestones
            </Link>
          </div>

          {/* ── Child picker ── */}
          {session && session.linkedChildren.length > 1 && (
            <ChildPicker
              children={session.linkedChildren}
              activeChildId={activeChildId}
              onSelect={(id) => {
                setActiveChildId(id);
                fetchSkills(id);
              }}
            />
          )}

          {/* ── Header + summary ── */}
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{
              margin: "0 0 6px",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 900,
              color: "#f0f6ff",
              letterSpacing: "-0.01em",
            }}>
              Skills Progress
            </h1>
            {!loading && !error && skills.length > 0 && (
              <p style={{ margin: 0, fontSize: "0.84rem", color: "rgba(255,255,255,0.42)" }}>
                <span style={{ color: "#50e890", fontWeight: 700 }}>{masteredCount} mastered</span>
                {" · "}
                <span style={{ color: "#ffd166", fontWeight: 700 }}>{inProgressCount} in progress</span>
                {notStartedCount > 0 && (
                  <>{" · "}<span style={{ color: "rgba(255,255,255,0.38)", fontWeight: 700 }}>{notStartedCount} not started</span></>
                )}
              </p>
            )}
          </div>

          {/* ── Tabs ── */}
          {!loading && !error && skills.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "20px",
                    border: tab === t.id
                      ? "1px solid rgba(155,114,255,0.55)"
                      : "1px solid rgba(255,255,255,0.10)",
                    background: tab === t.id
                      ? "rgba(155,114,255,0.18)"
                      : "rgba(255,255,255,0.04)",
                    color: tab === t.id ? "#c4a8ff" : "rgba(255,255,255,0.45)",
                    fontWeight: 700,
                    fontSize: "0.80rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span style={{
                      background: tab === t.id ? "rgba(155,114,255,0.3)" : "rgba(255,255,255,0.08)",
                      color: tab === t.id ? "#c4a8ff" : "rgba(255,255,255,0.35)",
                      borderRadius: "20px",
                      padding: "1px 7px",
                      fontSize: "0.70rem",
                    }}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Search + sort bar ── */}
          {!loading && !error && skills.length > 0 && (
            <div style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}>
              <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
                <span style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.35)",
                  pointerEvents: "none",
                }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search skills…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    color: "#f0f6ff",
                    fontSize: "0.84rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Sort:</span>
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSort(s.id)}
                    style={{
                      padding: "5px 11px",
                      borderRadius: "8px",
                      border: sort === s.id
                        ? "1px solid rgba(155,114,255,0.45)"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: sort === s.id
                        ? "rgba(155,114,255,0.14)"
                        : "rgba(255,255,255,0.03)",
                      color: sort === s.id ? "#c4a8ff" : "rgba(255,255,255,0.38)",
                      fontWeight: 600,
                      fontSize: "0.73rem",
                      cursor: "pointer",
                      transition: "all 0.12s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              flexDirection: "column",
              gap: "12px",
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(155,114,255,0.2)",
                borderTop: "3px solid #9b72ff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>Loading skills…</span>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={{
              background: "rgba(255,123,107,0.1)",
              border: "1px solid rgba(255,123,107,0.25)",
              borderRadius: "12px",
              padding: "20px",
              color: "#ff7b6b",
              fontSize: "0.88rem",
              fontWeight: 600,
              textAlign: "center",
            }}>
              {error}
              <br />
              <Link href="/parent" style={{ color: "#9b72ff", marginTop: "8px", display: "inline-block" }}>
                ← Go back to Family Hub
              </Link>
            </div>
          )}

          {/* ── Empty state (no skills at all) ── */}
          {!loading && !error && skills.length === 0 && <EmptyState filtered={false} />}

          {/* ── Skill grid ── */}
          {!loading && !error && skills.length > 0 && filtered.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "12px",
            }}>
              {filtered.map((s) => (
                <SkillCard key={s.skillCode} skill={s} />
              ))}
            </div>
          )}

          {/* ── No results after filter/search ── */}
          {!loading && !error && skills.length > 0 && filtered.length === 0 && (
            <EmptyState filtered={true} />
          )}

        </div>
      </div>
    </AppFrame>
  );
}
