import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Palette ───────────────────────────────────────────────────────────────────
const BASE    = "#100b2e";
const MINT    = "#50e890";
const VIOLET  = "#9b72ff";
const RED     = "#f85149";
const AMBER   = "#f59e0b";
const TEAL    = "#58e8c1";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(255,255,255,0.4)";
const MUTED2  = "rgba(255,255,255,0.25)";
const MUTED3  = "rgba(255,255,255,0.06)";

// ── Stub data ─────────────────────────────────────────────────────────────────

const STATS = [
  { n: "47",  label: "Total Items",   delta: "+12 vs prev", good: false },
  { n: "2",   label: "Open P0",       delta: "+1 vs prev",  good: false },
  { n: "94%", label: "SLA Met",       delta: "+3pp",        good: true  },
  { n: "4.2h",label: "Avg Resolve",   delta: "-1.3h",       good: true  },
  { n: "+42", label: "NPS Score",     delta: "+5pts",       good: true  },
];

const VOL_BARS: { h: number; color: string; label: string }[] = [
  { h: 22, color: MINT,  label: "M1" },
  { h: 18, color: MINT,  label: "" },
  { h: 30, color: RED,   label: "" },
  { h: 15, color: MINT,  label: "" },
  { h: 20, color: MINT,  label: "W1" },
  { h: 12, color: MINT,  label: "" },
  { h: 16, color: MINT,  label: "" },
  { h: 25, color: AMBER, label: "" },
  { h: 14, color: MINT,  label: "" },
  { h: 18, color: MINT,  label: "W2" },
  { h: 10, color: MINT,  label: "" },
  { h: 22, color: MINT,  label: "" },
  { h: 35, color: RED,   label: "" },
  { h: 16, color: MINT,  label: "" },
  { h: 19, color: MINT,  label: "W3" },
  { h: 14, color: MINT,  label: "" },
  { h: 17, color: MINT,  label: "" },
  { h: 21, color: MINT,  label: "" },
  { h: 28, color: MINT,  label: "" },
  { h: 24, color: MINT,  label: "W4" },
];

const TYPE_ROWS: { label: string; pct: number; n: number; color: string }[] = [
  { label: "Bug",     pct: 40, n: 19, color: RED   },
  { label: "Feature", pct: 32, n: 15, color: VIOLET },
  { label: "Content", pct: 17, n: 8,  color: TEAL  },
  { label: "Question",pct: 11, n: 5,  color: AMBER },
];

const SLA_ROWS: {
  priority: string;
  color: string;
  target: string;
  actual: string;
  met: string;
  missed: string;
  pct: string;
  pctGood: boolean;
}[] = [
  { priority: "P0 Critical", color: RED,   target: "4h",         actual: "3.2h", met: "8",  missed: "1", pct: "89%",  pctGood: true },
  { priority: "P1 Major",    color: AMBER, target: "24h",        actual: "18h",  met: "12", missed: "0", pct: "100%", pctGood: true },
  { priority: "P2 Moderate", color: TEAL,  target: "72h",        actual: "48h",  met: "10", missed: "1", pct: "91%",  pctGood: false },
  { priority: "P3 Minor",    color: TEXT,  target: "7d",         actual: "4.2d", met: "8",  missed: "0", pct: "100%", pctGood: true },
  { priority: "Feature",     color: VIOLET,target: "Best effort", actual: "—",   met: "—",  missed: "—", pct: "N/A",  pctGood: false },
];

const RECENT_RES: { icon: string; title: string; meta: string; time: string }[] = [
  { icon: "✅", title: "SSO token expiry — P0 fixed",          meta: "Riverside Elementary · Hotfix v2.4.8", time: "2h ago" },
  { icon: "✅", title: "G3 Fractions wrong answer — P1 fixed", meta: "Maplewood School · Content patch",     time: "1d ago" },
  { icon: "🚫", title: "Video call feature — Won't Fix",       meta: "Lincoln Academy · Out of scope",      time: "2d ago" },
  { icon: "✅", title: "Queue badge stale count — P1 fixed",   meta: "Oak Park Prep · Cache invalidation",  time: "3d ago" },
];

const TOP_SCHOOLS: { name: string; count: number; health: "Good" | "Attn" }[] = [
  { name: "Lincoln Academy",      count: 9, health: "Attn" },
  { name: "Riverside Elementary", count: 7, health: "Good" },
  { name: "Oak Park Prep",        count: 6, health: "Good" },
  { name: "Maplewood School",     count: 5, health: "Good" },
  { name: "Cedar Grove",          count: 4, health: "Good" },
];

const TREND_BARS_90D: { h: number; color: string; label: string }[] = [
  { h: 35, color: MINT,  label: "W1" },
  { h: 28, color: MINT,  label: "W2" },
  { h: 40, color: RED,   label: "W3" },
  { h: 22, color: MINT,  label: "W4" },
  { h: 30, color: MINT,  label: "W5" },
  { h: 25, color: MINT,  label: "W6" },
  { h: 38, color: AMBER, label: "W7" },
  { h: 20, color: MINT,  label: "W8" },
  { h: 32, color: MINT,  label: "W9" },
  { h: 27, color: MINT,  label: "W10" },
  { h: 45, color: RED,   label: "W11" },
  { h: 55, color: RED,   label: "W12" },
  { h: 47, color: MINT,  label: "W13" },
];

export default async function OwnerFeedbackSummaryPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  if (!allowed) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <OwnerGate configured={configured} />
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", background: BASE, minHeight: "100vh", padding: "24px 20px", color: TEXT }}>

        {/* Page title */}
        <div style={{ maxWidth: 1100, margin: "0 auto 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 6 }}>Owner · Feedback</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: TEXT, margin: 0 }}>Feedback Summary</h1>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 0 }}>Aggregate product health — volume trends, SLA performance, NPS, and top schools.</p>
        </div>

        {/* ── 30-day summary shell ─────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto 32px", background: "#0d1117", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>

          {/* Shell header */}
          <div style={{ background: "#010409", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Feedback Summary</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["7d", "30d", "90d"].map((p) => (
                  <span key={p} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: p === "30d" ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)", color: p === "30d" ? TEXT : MUTED }}>{p}</span>
                ))}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: MINT }}>&#8595; Export CSV</span>
          </div>

          {/* Top stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: BORDER, borderBottom: `1px solid ${BORDER}` }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ background: "#0d1117", padding: "18px 20px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: TEXT }}>{s.n}</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED2, marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: s.good ? MINT : AMBER }}>{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Main body: left + right */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px" }}>

            {/* LEFT */}
            <div style={{ padding: 24, borderRight: `1px solid ${BORDER}` }}>

              {/* Section: Volume & Priority */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` }}>Volume &amp; Priority</div>

              {/* Volume chart */}
              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", marginBottom: 16, border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>Daily Submission Volume — Last 30 Days</div>
                <div style={{ height: 80, display: "flex", gap: 3, alignItems: "flex-end" }}>
                  {VOL_BARS.map((b, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ width: "100%", borderRadius: "2px 2px 0 0", height: b.h, minHeight: 3, background: b.color, opacity: b.color === RED ? 0.7 : b.color === AMBER ? 0.6 : 0.4 }} />
                      <div style={{ fontSize: 8, color: MUTED2, fontWeight: 600 }}>{b.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: MUTED2 }}><span style={{ color: RED }}>■</span> P0 spike</span>
                  <span style={{ fontSize: 10, color: MUTED2 }}><span style={{ color: AMBER }}>■</span> P1 cluster</span>
                  <span style={{ fontSize: 10, color: MUTED2 }}><span style={{ color: MINT }}>■</span> Normal</span>
                </div>
              </div>

              {/* Type breakdown */}
              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", marginBottom: 16, border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>Feedback Type Breakdown</div>
                <div style={{ display: "flex", gap: 4, height: 16, borderRadius: 5, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ flex: 19, background: RED,   opacity: 0.8 }} />
                  <div style={{ flex: 15, background: AMBER, opacity: 0.8 }} />
                  <div style={{ flex: 8,  background: TEAL,  opacity: 0.7 }} />
                  <div style={{ flex: 5,  background: VIOLET,opacity: 0.8 }} />
                </div>
                {TYPE_ROWS.map((r) => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", width: 80, flexShrink: 0 }}>{r.label}</div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,.07)", borderRadius: 3, height: 5 }}>
                      <div style={{ height: 5, borderRadius: 3, width: `${r.pct}%`, background: r.color }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.45)", width: 32, textAlign: "right" }}>{r.n}</div>
                  </div>
                ))}
              </div>

              {/* Section: SLA Performance */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` }}>SLA Performance</div>
              <div style={{ background: SURFACE, borderRadius: 12, marginBottom: 16, border: "1px solid rgba(255,255,255,.05)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Priority", "Target", "Avg Actual", "Met", "Missed", "% Met"].map((h) => (
                        <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: MUTED2, padding: "5px 8px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.07)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLA_ROWS.map((r) => (
                      <tr key={r.priority}>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: r.color, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.priority}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: "rgba(255,255,255,.6)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.target}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: "rgba(255,255,255,.6)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.actual}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: MINT, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.met}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: "rgba(255,255,255,.6)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.missed}</td>
                        <td style={{ fontSize: 11, padding: "6px 8px", color: r.priority === "Feature" ? MUTED : r.pctGood ? MINT : AMBER, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section: NPS */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` }}>NPS &amp; Satisfaction</div>
              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>Net Promoter Score — Post-Resolution</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", border: `3px solid ${MINT}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: MINT }}>+42</div>
                    <div style={{ fontSize: 8, color: MUTED2, fontWeight: 700 }}>NPS</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[
                      { label: "Promoters (9–10)", pct: 62, color: MINT },
                      { label: "Passives (7–8)",   pct: 20, color: AMBER },
                      { label: "Detractors (0–6)", pct: 18, color: "rgba(248,81,73,.6)" },
                    ].map((r) => (
                      <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", width: 110 }}>{r.label}</div>
                        <div style={{ flex: 1, background: "rgba(255,255,255,.06)", borderRadius: 2, height: 4 }}>
                          <div style={{ height: 4, borderRadius: 2, width: `${r.pct}%`, background: r.color }} />
                        </div>
                        <div style={{ fontSize: 10, color: MUTED2, width: 28, textAlign: "right" }}>{r.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: MUTED2, marginTop: 10 }}>Based on 34 post-resolution surveys (NPS sent 24h after resolution). Suppressed 14d after previous NPS.</div>
              </div>
            </div>

            {/* RIGHT sidebar */}
            <div style={{ padding: 20 }}>

              {/* Recent resolutions */}
              <div style={{ background: SURFACE, borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 10 }}>Recent Resolutions</div>
                {RECENT_RES.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < RECENT_RES.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                    <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>{r.title}</div>
                      <div style={{ fontSize: 10, color: MUTED2, marginTop: 1 }}>{r.meta}</div>
                    </div>
                    <div style={{ fontSize: 10, color: MUTED2, flexShrink: 0 }}>{r.time}</div>
                  </div>
                ))}
              </div>

              {/* Top submitting schools */}
              <div style={{ background: SURFACE, borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 10 }}>Top Submitting Schools</div>
                {TOP_SCHOOLS.map((s, i) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < TOP_SCHOOLS.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                    <div style={{ fontSize: 11, color: MUTED2, width: 18, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", flex: 1 }}>{s.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>{s.count}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: s.health === "Good" ? "rgba(80,232,144,.12)" : "rgba(245,158,11,.12)", color: s.health === "Good" ? MINT : AMBER }}>{s.health}</span>
                  </div>
                ))}
                <div style={{ fontSize: 10, color: MUTED2, marginTop: 8 }}>High submission count does not mean unhappy. Lincoln has the most active teachers; health tracked separately.</div>
              </div>

              {/* Resolution breakdown */}
              <div style={{ background: SURFACE, borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 10 }}>Resolution Breakdown</div>
                <div style={{ display: "flex", gap: 3, height: 12, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ flex: 72, background: MINT, opacity: 0.7 }} />
                  <div style={{ flex: 15, background: "rgba(255,255,255,.2)" }} />
                  <div style={{ flex: 13, background: AMBER, opacity: 0.6 }} />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ fontSize: 10, color: MUTED }}><span style={{ color: MINT }}>■</span> Resolved 72%</div>
                  <div style={{ fontSize: 10, color: MUTED }}><span style={{ color: "rgba(255,255,255,.4)" }}>■</span> Won&apos;t Fix 15%</div>
                  <div style={{ fontSize: 10, color: MUTED }}><span style={{ color: AMBER }}>■</span> Open 13%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 90-day trends shell ───────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto 32px", background: "#0d1117", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ background: "#010409", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Feedback Trends</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["7d", "30d", "90d"].map((p) => (
                  <span key={p} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: p === "90d" ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)", color: p === "90d" ? TEXT : MUTED }}>{p}</span>
                ))}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: MINT }}>&#8595; Export PDF</span>
          </div>

          <div style={{ padding: 24 }}>
            {/* 90-day volume */}
            <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", marginBottom: 16, border: "1px solid rgba(255,255,255,.05)", maxWidth: 740 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>90-Day Submission Volume (Weekly)</div>
              <div style={{ height: 100, display: "flex", gap: 3, alignItems: "flex-end" }}>
                {TREND_BARS_90D.map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: "100%", borderRadius: "2px 2px 0 0", height: b.h, minHeight: 3, background: b.color, opacity: b.color === RED ? 0.65 : 0.5 }} />
                    <div style={{ fontSize: 8, color: MUTED2, fontWeight: 600 }}>{b.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: MUTED2, marginTop: 8 }}>Spikes at W3 (SSO incident) · W7 (Assignment engine failure) · W11–W12 (Fractions content bug cluster)</div>
            </div>

            {/* NPS trend + Avg resolution */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 740 }}>
              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>NPS Trend (Monthly)</div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 60, marginBottom: 6 }}>
                  {[{ h: 30, label: "Jan" }, { h: 34, label: "Feb" }, { h: 42, label: "Mar" }].map((b) => (
                    <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ width: 24, height: b.h, background: MINT, opacity: 0.5 + b.h * 0.004, borderRadius: "2px 2px 0 0" }} />
                      <div style={{ fontSize: 9, color: MUTED2 }}>{b.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: MUTED }}>Jan: +32 → Feb: +37 → Mar: +42</div>
              </div>

              <div style={{ background: SURFACE, borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: 12 }}>Avg Resolution Time</div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 60, marginBottom: 6 }}>
                  {[{ h: 50, color: AMBER, label: "Jan" }, { h: 42, color: AMBER, label: "Feb" }, { h: 28, color: MINT, label: "Mar" }].map((b) => (
                    <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ width: 24, height: b.h, background: b.color, opacity: 0.6 + (b.color === MINT ? 0.1 : 0), borderRadius: "2px 2px 0 0" }} />
                      <div style={{ fontSize: 9, color: MUTED2 }}>{b.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: MUTED }}>Jan: 7.1h → Feb: 5.4h → Mar: 4.2h</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer nav ───────────────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", borderTop: `1px solid ${BORDER}`, paddingTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/owner" style={{ fontSize: 13, color: MINT, textDecoration: "none", fontWeight: 600 }}>&#8592; Dashboard</Link>
          <Link href="/owner/feedback" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Feedback Workbench</Link>
          <Link href="/owner/triage" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Triage</Link>
          <Link href="/owner/content" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Content</Link>
          <Link href="/owner/release" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Release</Link>
          <Link href="/owner/roadmap" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Roadmap</Link>
          <Link href="/owner/governance" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Governance Log</Link>
          <Link href="/owner/command" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Command</Link>
        </div>
      </div>
    </AppFrame>
  );
}
