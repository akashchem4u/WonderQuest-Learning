import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

const C = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  accent: "#50e890",
  amber: "#f0a840",
  violet: "#a78bfa",
  gold: "#facc15",
  red: "#f87171",
};

type Family = {
  code: string;
  status: "active" | "paused" | "completed";
  cohort: "A" | "B" | "C";
  sessionsWk: number;
  joined: string;
};

type Teacher = {
  code: string;
  school: string;
  students: number;
  lastActive: string;
};

const FAMILIES: Family[] = [
  { code: "FAM-001", status: "active",    cohort: "A", sessionsWk: 4, joined: "Jan 6, 2026"  },
  { code: "FAM-002", status: "active",    cohort: "A", sessionsWk: 3, joined: "Jan 6, 2026"  },
  { code: "FAM-003", status: "paused",    cohort: "A", sessionsWk: 0, joined: "Jan 6, 2026"  },
  { code: "FAM-004", status: "active",    cohort: "A", sessionsWk: 5, joined: "Jan 6, 2026"  },
  { code: "FAM-005", status: "active",    cohort: "A", sessionsWk: 2, joined: "Jan 9, 2026"  },
  { code: "FAM-006", status: "completed", cohort: "A", sessionsWk: 0, joined: "Jan 9, 2026"  },
  { code: "FAM-007", status: "active",    cohort: "A", sessionsWk: 4, joined: "Jan 13, 2026" },
  { code: "FAM-008", status: "active",    cohort: "A", sessionsWk: 3, joined: "Jan 13, 2026" },
  { code: "FAM-009", status: "active",    cohort: "B", sessionsWk: 5, joined: "Feb 3, 2026"  },
  { code: "FAM-010", status: "active",    cohort: "B", sessionsWk: 1, joined: "Feb 3, 2026"  },
  { code: "FAM-011", status: "paused",    cohort: "B", sessionsWk: 0, joined: "Feb 3, 2026"  },
  { code: "FAM-012", status: "active",    cohort: "B", sessionsWk: 4, joined: "Feb 10, 2026" },
  { code: "FAM-013", status: "completed", cohort: "B", sessionsWk: 0, joined: "Feb 10, 2026" },
  { code: "FAM-014", status: "active",    cohort: "B", sessionsWk: 3, joined: "Feb 17, 2026" },
  { code: "FAM-015", status: "active",    cohort: "B", sessionsWk: 2, joined: "Feb 17, 2026" },
  { code: "FAM-016", status: "paused",    cohort: "B", sessionsWk: 1, joined: "Feb 24, 2026" },
  { code: "FAM-017", status: "active",    cohort: "C", sessionsWk: 3, joined: "Mar 3, 2026"  },
  { code: "FAM-018", status: "active",    cohort: "C", sessionsWk: 4, joined: "Mar 3, 2026"  },
  { code: "FAM-019", status: "paused",    cohort: "C", sessionsWk: 1, joined: "Mar 3, 2026"  },
  { code: "FAM-020", status: "active",    cohort: "C", sessionsWk: 5, joined: "Mar 10, 2026" },
  { code: "FAM-021", status: "active",    cohort: "C", sessionsWk: 2, joined: "Mar 10, 2026" },
  { code: "FAM-022", status: "active",    cohort: "C", sessionsWk: 3, joined: "Mar 17, 2026" },
  { code: "FAM-023", status: "active",    cohort: "C", sessionsWk: 4, joined: "Mar 17, 2026" },
  { code: "FAM-024", status: "active",    cohort: "C", sessionsWk: 2, joined: "Mar 24, 2026" },
];

const TEACHERS: Teacher[] = [
  { code: "TCH-001", school: "Lincoln Elementary",    students: 22, lastActive: "Apr 5, 2026"  },
  { code: "TCH-002", school: "Jefferson Primary",     students: 18, lastActive: "Apr 4, 2026"  },
  { code: "TCH-003", school: "Oak Park Academy",      students: 24, lastActive: "Apr 5, 2026"  },
  { code: "TCH-004", school: "Riverside Prep",        students: 20, lastActive: "Mar 31, 2026" },
  { code: "TCH-005", school: "Maple Grove School",    students: 16, lastActive: "Apr 3, 2026"  },
  { code: "TCH-006", school: "Hillside Learning Ctr", students: 19, lastActive: "Apr 2, 2026"  },
];

const STATUS_CHIP: Record<string, { bg: string; color: string; border: string; label: string }> = {
  active:    { bg: "rgba(80,232,144,0.15)",  color: "#50e890", border: "rgba(80,232,144,0.3)",  label: "Active"    },
  paused:    { bg: "rgba(240,168,64,0.15)",  color: "#f0a840", border: "rgba(240,168,64,0.3)",  label: "Paused"    },
  completed: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "rgba(167,139,250,0.3)", label: "Completed" },
};

const COHORT_COLOR: Record<string, string> = { A: "#50e890", B: "#a78bfa", C: "#facc15" };

export default async function OwnerBetaRostersPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = hasOwnerAccess();

  if (!configured || !allowed) {
    return (
      <AppFrame audience="owner">
        <OwnerGate configured={configured} />
      </AppFrame>
    );
  }

  const activeFamilies = FAMILIES.filter((f) => f.status === "active");
  const activeThisWeek = FAMILIES.filter((f) => f.sessionsWk > 0).length;
  const avgSessions =
    Math.round((FAMILIES.reduce((s, f) => s + f.sessionsWk, 0) / FAMILIES.length) * 10) / 10;

  return (
    <AppFrame audience="owner">
      <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 16px 64px", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>👥 Beta Rosters</h1>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>Pilot program participant tracking</p>
          </div>

          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
            {[
              { val: String(FAMILIES.length), lbl: "Total Families" },
              { val: String(activeThisWeek),  lbl: "Active This Week" },
              { val: String(TEACHERS.length), lbl: "Teachers Enrolled" },
              { val: String(avgSessions),     lbl: "Avg Sessions / Wk" },
            ].map((s) => (
              <div
                key={s.lbl}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "18px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 700, color: C.accent, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Cohort filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {(["All Cohorts", "Cohort A", "Cohort B", "Cohort C"] as const).map((label) => {
              const cohortKey = label === "All Cohorts" ? null : label.replace("Cohort ", "") as "A" | "B" | "C";
              const count = cohortKey ? FAMILIES.filter((f) => f.cohort === cohortKey).length : FAMILIES.length;
              const color = cohortKey ? COHORT_COLOR[cohortKey] : C.accent;
              return (
                <div
                  key={label}
                  style={{
                    background: `rgba(${cohortKey === "A" ? "80,232,144" : cohortKey === "B" ? "167,139,250" : cohortKey === "C" ? "250,204,21" : "80,232,144"}, 0.08)`,
                    border: `1px solid ${color}40`,
                    color,
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "6px 14px",
                    borderRadius: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {label}
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Two-column roster layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Family Roster */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                Family Roster
              </div>
              <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${C.border}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}` }}>
                      {["Code", "Status", "Cohort", "Sess/wk", "Joined"].map((h) => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FAMILIES.map((row) => {
                      const chip = STATUS_CHIP[row.status];
                      return (
                        <tr key={row.code} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "11px 12px", color: C.text, fontWeight: 500, fontFamily: "monospace", fontSize: 12 }}>{row.code}</td>
                          <td style={{ padding: "11px 12px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`, whiteSpace: "nowrap" }}>
                              {chip.label}
                            </span>
                          </td>
                          <td style={{ padding: "11px 12px" }}>
                            <span style={{ color: COHORT_COLOR[row.cohort], fontWeight: 600, fontSize: 12 }}>{row.cohort}</span>
                          </td>
                          <td style={{ padding: "11px 12px", color: row.sessionsWk === 0 ? C.muted : row.sessionsWk < 2 ? C.amber : C.text, fontWeight: 600 }}>
                            {row.sessionsWk}
                          </td>
                          <td style={{ padding: "11px 12px", color: C.muted, whiteSpace: "nowrap" }}>{row.joined}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 11, color: C.amber, marginTop: 10 }}>
                Amber sessions/wk = below 2 — consider outreach
              </p>
            </div>

            {/* Teacher Roster */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                Teacher Roster
              </div>
              <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${C.border}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}` }}>
                      {["Code", "School", "Students", "Last Active"].map((h) => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TEACHERS.map((row) => (
                      <tr key={row.code} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "11px 12px", color: C.text, fontWeight: 500, fontFamily: "monospace", fontSize: 12 }}>{row.code}</td>
                        <td style={{ padding: "11px 12px", color: C.text }}>{row.school}</td>
                        <td style={{ padding: "11px 12px", color: C.accent, fontWeight: 600 }}>{row.students}</td>
                        <td style={{ padding: "11px 12px", color: C.muted, whiteSpace: "nowrap" }}>{row.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Cohort breakdown</div>
                {(["A", "B", "C"] as const).map((co) => {
                  const count = FAMILIES.filter((f) => f.cohort === co).length;
                  const active = FAMILIES.filter((f) => f.cohort === co && f.status === "active").length;
                  return (
                    <div key={co} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ color: COHORT_COLOR[co], fontWeight: 700, fontSize: 12, minWidth: 16 }}>{co}</span>
                      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${(active / count) * 100}%`, height: "100%", background: COHORT_COLOR[co], borderRadius: 99, opacity: 0.8 }} />
                      </div>
                      <span style={{ color: C.muted, fontSize: 11 }}>{active}/{count} active</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer nav */}
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { href: "/owner", label: "← Owner Hub" },
              { href: "/owner/adoption", label: "Adoption →" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.muted,
                  fontSize: 13,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
