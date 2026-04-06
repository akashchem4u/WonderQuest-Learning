"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  coral: "#ff7b6b",
  text: "#f0f6ff",
  muted: "#8b949e",
  blue: "#38bdf8",
} as const;

interface Student {
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
}

interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  reason: string;
  interventionType: string;
  status: string;
  teacherNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

interface Stats {
  total: number;
  activeCount: number;
  supportQueueCount: number;
  avgStreak: number;
  onStreakCount: number;
  longStreakCount: number;
  midStreakCount: number;
  noStreakCount: number;
  avgAccuracy: number;
  highAccuracyCount: number;
  buildingCount: number;
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function computeStats(roster: Student[]): Stats {
  const total = roster.length;
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const activeCount = roster.filter((s) => {
    if (!s.lastSessionAt) return false;
    return now - new Date(s.lastSessionAt).getTime() <= sevenDaysMs;
  }).length;

  const supportQueueCount = roster.filter((s) => s.inInterventionQueue).length;
  const onStreakCount = roster.filter((s) => s.streak > 0).length;
  const longStreakCount = roster.filter((s) => s.streak >= 7).length;
  const midStreakCount = roster.filter((s) => s.streak >= 3 && s.streak < 7).length;
  const noStreakCount = roster.filter((s) => s.streak === 0).length;
  const avgStreak = total === 0 ? 0 : Math.round(roster.reduce((acc, s) => acc + s.streak, 0) / total);

  const accuracies = roster.filter((s) => s.totalLast7d > 0).map((s) => s.correctLast7d / s.totalLast7d);
  const avgAccuracy = accuracies.length === 0 ? 0 : accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  const highAccuracyCount = accuracies.filter((a) => a >= 0.8).length;
  const buildingCount = accuracies.filter((a) => a >= 0.5 && a < 0.8).length;

  return { total, activeCount, supportQueueCount, avgStreak, onStreakCount, longStreakCount, midStreakCount, noStreakCount, avgAccuracy, highAccuracyCount, buildingCount };
}

const STUB: Stats = { total: 0, activeCount: 0, supportQueueCount: 0, avgStreak: 0, onStreakCount: 0, longStreakCount: 0, midStreakCount: 0, noStreakCount: 0, avgAccuracy: 0, highAccuracyCount: 0, buildingCount: 0 };

function SparkBar({ color }: { color: string }) {
  const heights = [8, 12, 10, 15, 18, 16, 20];
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 22 }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: 6, borderRadius: 2, background: i >= 3 ? color : "rgba(255,255,255,0.1)", height: h }} />
      ))}
    </div>
  );
}

function CircleStat({ value, label, color, bgColor }: { value: string | number; label: string; color: string; bgColor: string }) {
  return (
    <div style={{ width: 56, height: 56, borderRadius: "50%", background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0, border: `1.5px solid ${color}40` }}>
      <span style={{ fontSize: 17, fontWeight: 900, lineHeight: 1, color }}>{value}</span>
      <span style={{ fontSize: 8, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 1 }}>{label}</span>
    </div>
  );
}

type BadgeVariant = "green" | "amber" | "violet";
function Badge({ variant, children }: { variant: BadgeVariant; children: string }) {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    green: { background: "rgba(34,197,94,0.15)", color: C.mint },
    amber: { background: "rgba(245,158,11,0.15)", color: C.amber },
    violet: { background: "rgba(155,114,255,0.15)", color: C.violet },
  };
  return <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 8, ...styles[variant] }}>{children}</span>;
}

function SegBar({ segs }: { segs: { flex: number; color: string }[] }) {
  return (
    <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
      {segs.map((s, i) => <div key={i} style={{ flex: s.flex, height: 8, background: s.color }} />)}
    </div>
  );
}

function NavBtn({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} style={{ display: "inline-block", padding: "10px 22px", borderRadius: 10, background: "rgba(155,114,255,0.12)", border: `1px solid rgba(155,114,255,0.3)`, color: C.violet, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
      {children}
    </a>
  );
}

interface TriageStudent {
  studentId: string;
  name: string;
  daysSince: number | null;
  sessionsLast7d: number;
  interventionReason: string | null;
}

function buildTriage(roster: Student[], interventions: Intervention[]): { onTrack: TriageStudent[]; checkIn: TriageStudent[]; needsHelp: TriageStudent[] } {
  const interventionsByStudent = new Map<string, Intervention[]>();
  for (const iv of interventions) {
    const existing = interventionsByStudent.get(iv.studentId) ?? [];
    existing.push(iv);
    interventionsByStudent.set(iv.studentId, existing);
  }

  const onTrack: TriageStudent[] = [];
  const checkIn: TriageStudent[] = [];
  const needsHelp: TriageStudent[] = [];

  for (const s of roster) {
    const days = daysSince(s.lastSessionAt);
    const ivs = interventionsByStudent.get(s.studentId) ?? [];
    const hasIntervention = s.inInterventionQueue || ivs.length > 0;
    const interventionReason = ivs.length > 0 ? ivs[0].reason : null;
    const entry: TriageStudent = { studentId: s.studentId, name: s.displayName, daysSince: days, sessionsLast7d: s.sessionsLast7d, interventionReason };

    if (hasIntervention || days === null || days >= 7) {
      needsHelp.push(entry);
    } else if (days !== null && days <= 3 && s.sessionsLast7d >= 1) {
      onTrack.push(entry);
    } else {
      checkIn.push(entry);
    }
  }

  onTrack.sort((a, b) => (a.daysSince ?? 999) - (b.daysSince ?? 999));
  checkIn.sort((a, b) => (a.daysSince ?? 999) - (b.daysSince ?? 999));
  needsHelp.sort((a, b) => (b.daysSince ?? 999) - (a.daysSince ?? 999));

  return { onTrack, checkIn, needsHelp };
}

export default function ClassHealthPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  const [roster, setRoster] = useState<Student[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [stats, setStats] = useState<Stats>(STUB);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const teacherId = getTeacherId();
    Promise.all([
      fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ roster?: Student[] }>;
      }),
      fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=active`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ interventions?: Intervention[] }>;
      }),
    ])
      .then(([classData, ivData]) => {
        const rosterData = classData.roster ?? [];
        const ivList = ivData.interventions ?? [];
        setRoster(rosterData);
        setInterventions(ivList);
        setStats(computeStats(rosterData));
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  const engagementBadge: BadgeVariant = stats.total === 0 ? "amber" : stats.activeCount / stats.total >= 0.75 ? "green" : "amber";
  const masteryBadge: BadgeVariant = stats.highAccuracyCount > stats.buildingCount ? "green" : "amber";
  const queueBadge: BadgeVariant = stats.supportQueueCount === 0 ? "green" : "amber";
  const streakBadge: BadgeVariant = stats.total === 0 ? "amber" : stats.onStreakCount / stats.total >= 0.5 ? "green" : "amber";

  const triage = !loading && roster.length > 0 ? buildTriage(roster, interventions) : { onTrack: [], checkIn: [], needsHelp: [] };
  const allOnTrack = !loading && roster.length > 0 && triage.checkIn.length === 0 && triage.needsHelp.length === 0;

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/class-health">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/class-health">
      <div style={{ background: C.base, minHeight: "100vh", padding: "28px 24px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        <div style={{ marginBottom: 28, maxWidth: 960 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 4 }}>📊 Class Health</div>
          <div style={{ fontSize: 14, color: C.muted }}>
            Teacher view · This week
            {loading && <span style={{ marginLeft: 12, fontSize: 12, color: C.violet, fontWeight: 700 }}>Loading…</span>}
            {error && <span style={{ marginLeft: 12, fontSize: 12, color: C.amber, fontWeight: 700 }}>Using stub data</span>}
          </div>
        </div>

        {!loading && roster.length > 0 && (
          <div style={{ maxWidth: 960, marginBottom: 36 }}>
            {allOnTrack ? (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 14, padding: "28px 24px", fontSize: 18, fontWeight: 700, color: C.mint, textAlign: "center" }}>
                🎉 Your whole class is on track this week!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                <div style={{ background: C.surface, border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.mint, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>🟢 On Track</span>
                    <span style={{ background: "rgba(34,197,94,0.15)", color: C.mint, borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>{triage.onTrack.length}</span>
                  </div>
                  {triage.onTrack.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.muted }}>No students in this group.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {triage.onTrack.map((s) => (
                        <div key={s.studentId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: C.text, fontWeight: 600 }}>{s.name}</span>
                          <span style={{ color: C.muted, fontSize: 12 }}>{s.daysSince === 0 ? "Today" : s.daysSince === 1 ? "Yesterday" : `${s.daysSince}d ago`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: C.surface, border: "1px solid rgba(255,209,102,0.2)", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.gold, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>🟡 Check In</span>
                    <span style={{ background: "rgba(255,209,102,0.15)", color: C.gold, borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>{triage.checkIn.length}</span>
                  </div>
                  {triage.checkIn.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.muted }}>No students in this group.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {triage.checkIn.map((s) => (
                        <div key={s.studentId} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: C.text, fontWeight: 600 }}>{s.name}</span>
                            <span style={{ color: C.muted, fontSize: 12 }}>{s.daysSince === null ? "No activity" : s.daysSince === 0 ? "Today" : `${s.daysSince}d ago`}</span>
                          </div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.sessionsLast7d} session{s.sessionsLast7d !== 1 ? "s" : ""} this week</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: C.surface, border: "1px solid rgba(255,123,107,0.2)", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.coral, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>🔴 Needs Help</span>
                    <span style={{ background: "rgba(255,123,107,0.15)", color: C.coral, borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>{triage.needsHelp.length}</span>
                  </div>
                  {triage.needsHelp.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.muted }}>No students in this group.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {triage.needsHelp.map((s) => (
                        <div key={s.studentId} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: C.text, fontWeight: 600 }}>{s.name}</span>
                            <a href={`/teacher/students/${s.studentId}`} style={{ color: C.violet, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>View →</a>
                          </div>
                          {s.interventionReason ? (
                            <div style={{ fontSize: 12, color: C.coral, marginTop: 2 }}>{s.interventionReason}</div>
                          ) : (
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.daysSince === null ? "Never active" : `Inactive ${s.daysSince}d`}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 880, marginBottom: 28 }}>
          <div style={{ background: C.surface, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🏃</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Engagement</span>
              </div>
              <Badge variant={engagementBadge}>{engagementBadge === "green" ? "Good" : "Watch"}</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <CircleStat value={stats.activeCount} label="Active" color={C.mint} bgColor="rgba(34,197,94,0.12)" />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
                <strong style={{ color: C.text }}>{stats.activeCount}</strong>{stats.total > 0 && <span> of {stats.total}</span>} students active this week
                <br />Session activity in the last 7 days
              </div>
            </div>
            <SparkBar color={C.mint} />
            <a href="/teacher/class" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none", marginTop: 8 }}>View student activity →</a>
          </div>

          <div style={{ background: C.surface, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>💪</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Mastery Velocity</span>
              </div>
              <Badge variant={masteryBadge}>{masteryBadge === "green" ? "Good" : "Watch"}</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <CircleStat value={`${Math.round(stats.avgAccuracy * 100)}%`} label="Accuracy" color={C.gold} bgColor="rgba(255,209,102,0.12)" />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
                <strong style={{ color: C.text }}>{stats.highAccuracyCount}</strong> students at strong accuracy
                <br /><strong style={{ color: C.text }}>{stats.buildingCount}</strong> building toward mastery
              </div>
            </div>
            <SegBar segs={[{ flex: Math.max(stats.highAccuracyCount, 1), color: C.mint }, { flex: Math.max(stats.buildingCount, 1), color: C.amber }, { flex: Math.max(stats.total - stats.highAccuracyCount - stats.buildingCount, 1), color: "rgba(255,255,255,0.1)" }]} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              {[{ dot: C.mint, label: `Strong (${stats.highAccuracyCount})` }, { dot: C.amber, label: `Building (${stats.buildingCount})` }, { dot: "rgba(255,255,255,0.2)", label: `Early (${Math.max(stats.total - stats.highAccuracyCount - stats.buildingCount, 0)})` }].map((leg) => (
                <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.muted }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: leg.dot }} />{leg.label}
                </div>
              ))}
            </div>
            <a href="/teacher/skill-mastery" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>View skill breakdown →</a>
          </div>

          <div style={{ background: C.surface, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Support Queue</span>
              </div>
              <Badge variant={queueBadge}>{stats.supportQueueCount === 0 ? "All clear" : `${stats.supportQueueCount} open`}</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <CircleStat value={stats.supportQueueCount} label="Need help" color={C.amber} bgColor="rgba(245,158,11,0.12)" />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
                {stats.supportQueueCount === 0 ? <>No students flagged for<br />intervention right now.</> : <><strong style={{ color: C.text }}>{stats.supportQueueCount}</strong> student{stats.supportQueueCount !== 1 ? "s" : ""} flagged for<br />teacher check-in or follow-up.</>}
              </div>
            </div>
            <SparkBar color={C.amber} />
            <a href="/teacher/support" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none", marginTop: 8 }}>Review support queue →</a>
          </div>

          <div style={{ background: C.surface, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🔥</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Streak Health</span>
              </div>
              <Badge variant={streakBadge}>{streakBadge === "green" ? "Great" : "Watch"}</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <CircleStat value={stats.onStreakCount} label="On streak" color={C.violet} bgColor="rgba(155,114,255,0.12)" />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
                <strong style={{ color: C.text }}>{stats.onStreakCount}</strong>{stats.total > 0 && <span> of {stats.total}</span>} on active streak
                <br />Avg streak: <strong style={{ color: C.text }}>{stats.avgStreak}</strong> days
              </div>
            </div>
            <SegBar segs={[{ flex: Math.max(stats.longStreakCount, 1), color: C.gold }, { flex: Math.max(stats.midStreakCount, 1), color: C.mint }, { flex: Math.max(stats.noStreakCount, 1), color: "rgba(255,255,255,0.1)" }]} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              {[{ dot: C.gold, label: `7+ days (${stats.longStreakCount})` }, { dot: C.mint, label: `3–6 days (${stats.midStreakCount})` }, { dot: "rgba(255,255,255,0.2)", label: `No streak (${stats.noStreakCount})` }].map((leg) => (
                <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.muted }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: leg.dot }} />{leg.label}
                </div>
              ))}
            </div>
            <a href="/teacher/class" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>View streak breakdown →</a>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 880 }}>
          <NavBtn href="/teacher/support">Support Queue</NavBtn>
          <NavBtn href="/teacher/class">Full Class Roster</NavBtn>
          <NavBtn href="/teacher/class-growth">Growth Report</NavBtn>
        </div>
      </div>
    </AppFrame>
  );
}
