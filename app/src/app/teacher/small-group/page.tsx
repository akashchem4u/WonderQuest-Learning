"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  base: "#0d1117",
  surface: "#161b22",
  surface2: "#1c2230",
  border: "rgba(255,255,255,0.06)",
  blue: "#38bdf8",
  teal: "#2dd4bf",
  violet: "#a78bfa",
  gold: "#fbbf24",
  green: "#50e890",
  danger: "#f87171",
  text: "#f0f6ff",
  muted: "#8b949e",
};

type RosterStudent = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  sessionsLast7d: number;
  correctLast7d: number;
  totalLast7d: number;
  lastSessionAt: string | null;
  inInterventionQueue: boolean;
  streak: number;
};

type Tier = "strong" | "building" | "support";

function getTier(s: RosterStudent): Tier {
  const total = s.totalLast7d;
  const correct = s.correctLast7d;
  const masteryPct = total > 0 ? Math.round((correct / total) * 100) : 0;
  if (masteryPct >= 70) return "strong";
  if (masteryPct >= 40) return "building";
  return "support";
}

function getMasteryPct(s: RosterStudent): number {
  const total = s.totalLast7d;
  const correct = s.correctLast7d;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

type GroupColor = "teal" | "violet" | "gold";

const TIER_CONFIG: Record<Tier, { color: GroupColor; label: string; description: string }> = {
  strong:   { color: "teal",   label: "Strong",   description: ">=70% mastery this week" },
  building: { color: "violet", label: "Building", description: "40-69% mastery this week" },
  support:  { color: "gold",   label: "Support",  description: "<40% mastery this week" },
};

const COLOR_MAP: Record<GroupColor, { hex: string; chipBg: string; chipBorder: string; chipText: string }> = {
  teal:   { hex: C.teal,   chipBg: "rgba(45,212,191,.15)",  chipBorder: "rgba(45,212,191,.3)",   chipText: C.teal   },
  violet: { hex: C.violet, chipBg: "rgba(167,139,250,.15)", chipBorder: "rgba(167,139,250,.3)",  chipText: C.violet },
  gold:   { hex: C.gold,   chipBg: "rgba(251,191,36,.15)",  chipBorder: "rgba(251,191,36,.3)",   chipText: C.gold   },
};

const QUEST_OPTIONS = [
  { id: "q1", label: "P0 Maths Batch",   sub: "Pre-K / Numbers & Counting" },
  { id: "q2", label: "P1 Reading Batch", sub: "K-1 / Blending & Sight Words" },
  { id: "q3", label: "P1 Maths Batch",   sub: "K-1 / Addition & Subtraction" },
  { id: "q4", label: "P2 Reading Batch", sub: "G2-3 / Comprehension & Fluency" },
  { id: "q5", label: "Free Explore",     sub: "Student-directed / Any band" },
];

const BAND_META: Record<string, { label: string; emoji: string; color: string }> = {
  PREK: { label: "Pre-K",                  emoji: "🐣", color: "#50e890" },
  K1:   { label: "Kindergarten - Grade 1", emoji: "⭐", color: "#9b72ff" },
  G23:  { label: "Grades 2-3",             emoji: "🚀", color: "#ffd166" },
  G45:  { label: "Grades 4-5",             emoji: "🏗️", color: "#ff7b6b" },
  G6:   { label: "Grade 6+",               emoji: "🎯", color: "#58e8c1" },
};
const BAND_ORDER = ["PREK", "K1", "G23", "G45", "G6"];

function Btn({ children, variant = "primary", small, onClick, style }: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  small?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: small ? "7px 13px" : "10px 18px", borderRadius: 8, border: "none",
    fontFamily: "system-ui,sans-serif", fontSize: small ? 12.5 : 13.5, fontWeight: 600,
    cursor: "pointer", transition: "all .18s ease", minHeight: small ? 36 : 44, textDecoration: "none",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: C.green, color: "#0d1117" },
    secondary: { background: "transparent", color: C.blue, border: "1.5px solid rgba(56,189,248,.35)" },
    ghost:     { background: "transparent", color: C.muted, border: "1.5px solid " + C.border },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick}>{children}</button>;
}

export default function SmallGroupPage() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<"bands" | "groups" | "engagement">("bands");
  const [activeGroup, setActiveGroup] = useState<Tier>("strong");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assignModalGroup, setAssignModalGroup] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<RosterStudent[]>([]);

  useEffect(() => { fetchTeacherId().then(id => setAuthed(!!id)); }, []);

  useEffect(() => { void (async () => {
    if (!authed) return;
    const teacherId = await fetchTeacherId();
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/teacher/class?teacherId=" + encodeURIComponent(teacherId));
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json() as { roster: RosterStudent[] };
        setRoster(data.roster);
      } catch {
        // silently keep empty roster on error
      } finally {
        setLoading(false);
      }
    }
    void load();
  })(); }, [authed]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const toggleStudent = (name: string) => {
    setSelectedStudents((prev) => prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]);
  };

  const byTier: Record<Tier, RosterStudent[]> = { strong: [], building: [], support: [] };
  for (const s of roster) { byTier[getTier(s)].push(s); }
  const tiers: Tier[] = ["strong", "building", "support"];

  const byBand: Record<string, RosterStudent[]> = {};
  for (const s of roster) {
    const band = s.launchBandCode ?? "UNKNOWN";
    if (!byBand[band]) byBand[band] = [];
    byBand[band].push(s);
  }
  const activeBands = BAND_ORDER.filter((b) => (byBand[b]?.length ?? 0) > 0);

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: "9px 20px", borderRadius: 8,
    border: "1.5px solid " + (activeTab === tab ? C.blue : C.border),
    background: activeTab === tab ? "rgba(56,189,248,.12)" : "transparent",
    color: activeTab === tab ? C.blue : C.muted,
    fontSize: 13.5, fontWeight: 600, fontFamily: "system-ui,sans-serif", cursor: "pointer", minHeight: 44,
  });

  const groupTabStyle = (tier: Tier): React.CSSProperties => {
    const col = COLOR_MAP[TIER_CONFIG[tier].color].hex;
    const isActive = activeGroup === tier;
    return {
      padding: "9px 20px", borderRadius: 8,
      border: "1.5px solid " + (isActive ? col : C.border),
      background: isActive ? col + "1a" : "transparent",
      color: isActive ? col : C.muted,
      fontSize: 13, fontWeight: 700, fontFamily: "system-ui,sans-serif", cursor: "pointer", minHeight: 44, transition: "all .18s",
    };
  };

  const engStudents = byTier[activeGroup];
  const engConfig = TIER_CONFIG[activeGroup];
  const engCol = COLOR_MAP[engConfig.color].hex;
  const totalStudents = roster.length;

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/small-group">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/small-group">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px", background: C.base }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, " + C.green + ", " + C.blue + ")", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🗂</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Small Group Planner</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 1 }}>WonderQuest Teacher View</div>
            </div>
          </div>
          <span style={{ background: "rgba(56,189,248,.15)", color: C.blue, border: "1px solid rgba(56,189,248,.3)", borderRadius: 20, padding: "5px 13px", fontSize: 12, fontWeight: 600 }}>Teacher View</span>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          <button style={tabStyle("bands")}      onClick={() => setActiveTab("bands")}>By Band</button>
          <button style={tabStyle("groups")}     onClick={() => setActiveTab("groups")}>By Mastery</button>
          <button style={tabStyle("engagement")} onClick={() => setActiveTab("engagement")}>Group Engagement</button>
        </div>

        {loading && <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 14 }}>Loading class roster...</div>}

        {/* By Band tab */}
        {!loading && activeTab === "bands" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Students by Learning Band</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{activeBands.length} band{activeBands.length !== 1 ? "s" : ""} · {totalStudents} students total</div>
            </div>
            {roster.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 14 }}>No students found in your class roster.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {activeBands.map((bandCode) => {
                  const meta = BAND_META[bandCode] ?? { label: bandCode, emoji: "📚", color: C.muted };
                  const bandStudents = byBand[bandCode] ?? [];
                  return (
                    <div key={bandCode} style={{ background: C.surface, border: "1.5px solid " + meta.color + "38", borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{meta.emoji}</span>
                          <div>
                            <div style={{ fontSize: 15.5, fontWeight: 700, color: C.text }}>{meta.label}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{bandCode}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: meta.color + "22", color: meta.color, border: "1px solid " + meta.color + "44", whiteSpace: "nowrap" }}>
                          {bandStudents.length} student{bandStudents.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                        {bandStudents.map((s) => (
                          <div key={s.studentId} style={{ display: "flex", alignItems: "center", gap: 6, background: meta.color + "18", border: "1px solid " + meta.color + "33", borderRadius: 20, padding: "5px 12px" }}>
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: meta.color + "55", color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{s.displayName.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.displayName}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ paddingTop: 14, borderTop: "1px solid " + C.border }}>
                        <Link href={"/teacher/assignment?band=" + bandCode} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: meta.color + "22", color: meta.color, border: "1.5px solid " + meta.color + "44", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "all .18s" }}>
                          Start session for this group
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* By Mastery tab */}
        {!loading && activeTab === "groups" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>My Groups</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{tiers.filter((t) => byTier[t].length > 0).length} groups · {totalStudents} students total</div>
              </div>
              <Btn variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>+ Create Group</Btn>
            </div>
            {showCreateForm && (
              <div style={{ background: C.surface, border: "1.5px solid rgba(80,232,144,.25)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.green, marginBottom: 16 }}>New Group</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>Group Name</label>
                    <input type="text" placeholder="e.g. Wonder Wizards" style={{ background: C.base, border: "1.5px solid " + C.border, borderRadius: 8, padding: "10px 14px", color: C.text, fontFamily: "system-ui,sans-serif", fontSize: 14, minHeight: 44, outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>Group Color</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      {[C.teal, C.violet, C.gold, C.blue, C.danger, C.green].map((col) => (
                        <div key={col} style={{ width: 34, height: 34, borderRadius: 8, background: col, border: "2.5px solid transparent", cursor: "pointer" }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>Add Students</label>
                    <div style={{ background: C.base, border: "1.5px solid " + C.border, borderRadius: 8, padding: 8, display: "flex", flexWrap: "wrap", gap: 6, minHeight: 60 }}>
                      {roster.map((s) => (
                        <button key={s.studentId} onClick={() => toggleStudent(s.displayName)} style={{ padding: "5px 11px", borderRadius: 20, border: "1.5px solid " + (selectedStudents.includes(s.displayName) ? C.green : C.border), background: selectedStudents.includes(s.displayName) ? "rgba(80,232,144,.15)" : C.surface2, color: selectedStudents.includes(s.displayName) ? C.green : C.muted, fontSize: 12.5, fontWeight: 500, cursor: "pointer", minHeight: 32, fontFamily: "system-ui,sans-serif" }}>{s.displayName}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <Btn variant="primary" onClick={() => { showToast("Group saved!"); setShowCreateForm(false); }}>Save Group</Btn>
                  <Btn variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Btn>
                </div>
              </div>
            )}
            {roster.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 14 }}>No students found in your class roster.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {tiers.filter((tier) => byTier[tier].length > 0).map((tier) => {
                  const config = TIER_CONFIG[tier];
                  const col = COLOR_MAP[config.color];
                  const tierStudents = byTier[tier];
                  return (
                    <div key={tier} style={{ background: C.surface, border: "1.5px solid " + col.hex + "38", borderRadius: 12, padding: 20, transition: "border-color .2s, transform .2s" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                          <div style={{ width: 12, height: 12, borderRadius: "50%", background: col.hex, flexShrink: 0, marginTop: 2 }} />
                          <div style={{ fontSize: 15.5, fontWeight: 700, color: C.text }}>{config.label}</div>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: C.surface2, color: C.muted, whiteSpace: "nowrap" }}>{tierStudents.length} students</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{config.description}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                        {tierStudents.map((s) => (
                          <span key={s.studentId} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: col.chipBg, color: col.chipText, border: "1px solid " + col.chipBorder }}>{s.displayName}</span>
                        ))}
                      </div>
                      <div style={{ background: C.surface2, borderRadius: 8, padding: "10px 13px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Avg mastery this week</div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginTop: 2 }}>
                            {tierStudents.length > 0 ? Math.round(tierStudents.reduce((sum, s) => sum + getMasteryPct(s), 0) / tierStudents.length) + "%" : "-"}
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 11px", borderRadius: 20, whiteSpace: "nowrap", background: "rgba(80,232,144,.15)", color: C.green, border: "1px solid rgba(80,232,144,.3)" }}>
                          {tierStudents.filter((s) => s.sessionsLast7d > 0).length}/{tierStudents.length} active
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid " + C.border, alignItems: "center" }}>
                        <Btn variant="secondary" small onClick={() => setAssignModalGroup(tier)}>Assign Quest</Btn>
                        <Btn variant="ghost" small onClick={() => showToast("Edit mode - " + config.label + " group")}>Edit Group</Btn>
                        <button onClick={() => { setActiveTab("engagement"); setActiveGroup(tier); }} style={{ marginLeft: "auto", fontSize: 13, color: C.blue, fontWeight: 600, textDecoration: "none", background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui,sans-serif", minHeight: 44, display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 6 }}>
                          View Engagement
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Group Engagement tab */}
        {!loading && activeTab === "engagement" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Group Engagement</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>This week - first names only</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {tiers.map((tier) => (<button key={tier} style={groupTabStyle(tier)} onClick={() => setActiveGroup(tier)}>{TIER_CONFIG[tier].label}</button>))}
            </div>
            <div className="stat-grid-3" style={{ gap: 12, marginBottom: 24 }}>
              {[
                { val: engStudents.filter((s) => s.sessionsLast7d > 0).length + "/" + engStudents.length, lbl: "Students Active", color: engCol },
                { val: String(engStudents.reduce((sum, s) => sum + s.sessionsLast7d, 0)), lbl: "Sessions This Week", color: C.green },
                { val: engStudents.length > 0 ? Math.round(engStudents.reduce((sum, s) => sum + getMasteryPct(s), 0) / engStudents.length) + "%" : "-", lbl: "Avg Mastery", color: C.blue },
              ].map((s) => (
                <div key={s.lbl} style={{ background: C.surface, border: "1.5px solid " + C.border, borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 4, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
            {engStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 13 }}>No students in this group.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {engStudents.map((s) => {
                  const active = s.sessionsLast7d > 0;
                  return (
                    <div key={s.studentId} style={{ background: C.surface, border: "1.5px solid " + C.border, borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: active ? engCol + "2e" : "rgba(139,148,158,.12)", color: active ? engCol : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{s.displayName.charAt(0).toUpperCase()}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, flex: 1, minWidth: 80, color: C.text }}>{s.displayName}</div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(56,189,248,.15)", color: C.blue, border: "1px solid rgba(56,189,248,.3)" }}>{s.launchBandCode}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: C.muted, border: "1px solid " + C.border }}>{getMasteryPct(s)}% mastery</span>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 11px", borderRadius: 20, background: active ? "rgba(80,232,144,.15)" : "rgba(139,148,158,.12)", color: active ? C.green : C.muted, border: "1px solid " + (active ? "rgba(80,232,144,.3)" : "rgba(139,148,158,.25)") }}>
                        {active ? s.sessionsLast7d + " session" + (s.sessionsLast7d !== 1 ? "s" : "") + " this week" : "Not started yet"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <Btn variant="secondary" onClick={() => showToast("Encouragement sent through the platform!")}>Send Encouragement</Btn>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,.07)", border: "1px solid rgba(56,189,248,.18)", borderRadius: 8, padding: "10px 14px", marginTop: 20, fontSize: 12, color: C.muted }}>
              <span>🔒</span>
              First names only - No accuracy data shown - Messages routed through platform
            </div>
          </div>
        )}

        {/* Assign Quest Modal */}
        {assignModalGroup !== null && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
            <div style={{ background: C.surface, border: "1.5px solid rgba(56,189,248,.2)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 440 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 18 }}>
                Assign Quest - {TIER_CONFIG[assignModalGroup as Tier]?.label ?? assignModalGroup} Group
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                {QUEST_OPTIONS.map((q) => (
                  <div key={q.id} onClick={() => setSelectedQuest(q.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, border: "1.5px solid " + (selectedQuest === q.id ? C.blue : C.border), background: selectedQuest === q.id ? "rgba(56,189,248,.1)" : C.base, cursor: "pointer", transition: "all .15s" }}>
                    <input type="radio" readOnly checked={selectedQuest === q.id} style={{ accentColor: C.blue, width: 16, height: 16 }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{q.label}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{q.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <Btn variant="primary" onClick={() => {
                  if (selectedQuest) {
                    const quest = QUEST_OPTIONS.find((q) => q.id === selectedQuest);
                    showToast((quest?.label ?? "") + " assigned to " + (TIER_CONFIG[assignModalGroup as Tier]?.label ?? assignModalGroup) + " group");
                  }
                  setAssignModalGroup(null); setSelectedQuest(null);
                }}>Assign</Btn>
                <Btn variant="ghost" onClick={() => { setAssignModalGroup(null); setSelectedQuest(null); }}>Cancel</Btn>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast !== null && (
          <div style={{ position: "fixed", bottom: 28, right: 24, background: C.surface, border: "1.5px solid " + C.green, borderRadius: 8, padding: "12px 18px", fontSize: 13.5, fontWeight: 600, color: C.green, zIndex: 200, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,.45)", maxWidth: 320 }}>
            {toast}
          </div>
        )}

      </div>
    </AppFrame>
  );
}
