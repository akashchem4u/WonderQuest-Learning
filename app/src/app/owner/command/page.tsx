import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { getOwnerOverview } from "@/lib/analytics-service";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

const C = {
  base: "#100b2e",
  mint: "#50e890",
  violet: "#9b72ff",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#f85149",
  surface: "#161b22",
  surface2: "#0d1117",
  sidebar: "#010409",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  faint: "rgba(255,255,255,0.07)",
} as const;

export default async function OwnerCommandPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  let overview: Awaited<ReturnType<typeof getOwnerOverview>> | null = null;
  if (allowed) {
    try {
      overview = await getOwnerOverview();
    } catch {
      // leave null — UI falls back to static defaults
    }
  }

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ minHeight: "100vh", background: C.base, padding: "24px 24px 60px" }}>
        {!allowed ? (
          <OwnerGate configured={configured} />
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 4 }}>Owner Analytics</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>📊 Command Center</h1>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Business analytics · Data lag ~4h · Analytics warehouse</p>
              </div>
              {/* Period selector */}
              <div style={{ display: "flex", gap: 5 }}>
                {["7d", "30d", "90d", "All"].map((p) => (
                  <div key={p} style={{ padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: p === "30d" ? C.mint : C.faint, color: p === "30d" ? "#010409" : C.muted, cursor: "pointer" }}>{p}</div>
                ))}
              </div>
            </div>

            {/* Stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
              {[
                { n: overview ? overview.counts.students.toLocaleString() : "4,820", label: "Students", delta: `${overview ? overview.counts.guardians.toLocaleString() + " guardians" : "↑12% vs prior"}`, color: C.mint },
                { n: overview ? overview.counts.sessions.toLocaleString() : "$18.4K", label: overview ? "Sessions" : "MRR", delta: overview ? `${overview.counts.feedbackItems} feedback items` : "↑$800 (+4.5%)", color: C.mint },
                { n: overview ? overview.counts.totalPoints.toLocaleString() : "$220.8K", label: overview ? "Total Points" : "ARR (run rate)", delta: overview ? `across all learners` : "↑$9.6K", color: C.mint },
                { n: overview ? overview.counts.exampleItems.toLocaleString() : "142", label: overview ? "Example Items" : "Active schools", delta: overview ? `${overview.counts.explainers} explainers` : "↑3 this month", color: C.mint },
                { n: overview ? overview.byBand.length.toString() : "68%", label: overview ? "Launch Bands" : "D30 retention", delta: overview ? overview.byBand.map((b) => b.code).join(", ") || "—" : "↑4pp vs prior 30d", color: C.mint },
              ].map((s) => (
                <div key={s.label} style={{ background: C.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{s.n}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: s.color }}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* 2-col grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {/* MAU chart */}
              <div style={{ background: C.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 8 }}>📈 MAU Growth — Last 12 Months</div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 50 }}>
                  {[14, 18, 20, 16, 14, 22, 28, 32, 30, 36, 42, 50].map((h, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1 }}>
                      <div style={{ borderRadius: "2px 2px 0 0", width: "100%", height: h, background: C.mint, opacity: i === 11 ? 1 : 0.5 + i * 0.04 }} />
                      <div style={{ fontSize: 8, color: i === 11 ? C.mint : C.muted, fontWeight: i === 11 ? 700 : 400 }}>
                        {["A","M","J","J","A","S","O","N","D","J","F","M"][i]}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Peak: 4,820 MAU (Mar 2026)</div>
              </div>

              {/* MRR */}
              <div style={{ background: C.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 8 }}>💰 MRR Components</div>
                {[["School subscriptions", "$16,200"], ["District licences", "$1,800"], ["Individual family plans", "$400"]].map(([label, val]) => (
                  <div key={label as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
                    <span style={{ color: C.muted }}>{label}</span>
                    <span style={{ fontWeight: 700, color: C.mint }}>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: 6, marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.muted }}>Total MRR</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.mint }}>$18,400</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Churn this month: 0 schools</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.mint }}>Net new MRR: +$800</div>
                </div>
              </div>
            </div>

            {/* 3-col grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              {/* School cohorts */}
              <div style={{ background: C.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 8 }}>🏫 School Cohorts</div>
                {[["Active (≥10 sessions/mo)", 75, C.mint, 107], ["Light (1–9 sessions/mo)", 20, C.amber, 28], ["Dormant (0 sessions)", 5, C.red, 7]].map(([label, pct, color, n]) => (
                  <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, color: C.muted, flex: 1 }}>{label}</span>
                    <div style={{ background: C.faint, borderRadius: 3, height: 5, width: 80 }}>
                      <div style={{ height: 5, borderRadius: 3, background: color as string, width: `${pct}%` }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, width: 28, textAlign: "right" }}>{n}</span>
                  </div>
                ))}
              </div>

              {/* Retention */}
              <div style={{ background: C.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 8 }}>🎯 D7 / D30 Retention</div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 44, marginBottom: 6 }}>
                  {[["88%", 38, "D7"], ["68%", 28, "D30"], ["48%", 20, "D90"]].map(([pct, h, label]) => (
                    <div key={label as string} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ fontSize: 9, color: C.muted }}>{pct}</div>
                      <div style={{ width: 28, height: h as number, background: C.mint, opacity: label === "D7" ? 1 : label === "D30" ? 0.7 : 0.5, borderRadius: "3px 3px 0 0" }} />
                      <div style={{ fontSize: 9, color: C.muted }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>D30 ↑4pp vs prior period</div>
              </div>

              {/* Band adoption */}
              <div style={{ background: C.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 8 }}>📚 Band Adoption</div>
                {[["P0 Pre-K", C.gold, 20, 820], ["P1 K–1", C.violet, 42, 1780], ["P2 G2–3", "#58e8c1", 70, 3020], ["P3 G4–5", "#ff7b6b", 28, 1200]].map(([label, color, pct, n]) => (
                  <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, color: color as string, width: 60, flexShrink: 0 }}>{label}</span>
                    <div style={{ background: C.faint, borderRadius: 3, height: 5, flex: 1 }}>
                      <div style={{ height: 5, borderRadius: 3, background: color as string, width: `${pct}%` }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, width: 36, textAlign: "right" }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schools table */}
            <div style={{ background: C.surface, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 10 }}>Top Schools by Sessions (30d)</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr>
                    {["School", "Students", "Teachers", "Sessions (30d)", "Avg streak", "Status"].map((h) => (
                      <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Maple Ridge Elementary", 248, 8, "2,140", "5.2d", C.mint],
                    ["Sunnybrook K-5", 184, 6, "1,820", "4.8d", C.mint],
                    ["Lincoln Park Primary", 312, 11, "1,640", "3.9d", C.mint],
                    ["Riverside Elementary", 144, 5, "420", "2.1d", C.amber],
                    ["Harbor View School", 210, 7, "80", "0.8d", C.red],
                  ].map(([name, students, teachers, sessions, streak, color]) => (
                    <tr key={name as string}>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}`, color: C.text, fontSize: 11 }}>{name}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{students}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{teachers}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{sessions}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{streak}</td>
                      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color as string, marginRight: 4 }} />
                        <span style={{ color: color as string, fontSize: 10, fontWeight: 700 }}>{color === C.mint ? "Active" : color === C.amber ? "Light" : "At risk"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer nav */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { href: "/owner", label: "← Dashboard" },
                { href: "/owner/roadmap", label: "Roadmap" },
                { href: "/owner/feedback", label: "Feedback" },
                { href: "/owner/routes", label: "Route Health" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>{l.label}</Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
