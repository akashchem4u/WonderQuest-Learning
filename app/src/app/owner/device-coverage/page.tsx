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
  red: "#f87171",
  blue: "#38bdf8",
  violet: "#a78bfa",
};

const DEVICE_BREAKDOWN = [
  { label: "Desktop",  pct: 54, color: "#50e890" },
  { label: "Mobile",   pct: 38, color: "#38bdf8" },
  { label: "Tablet",   pct: 8,  color: "#a78bfa" },
];

const BROWSER_BREAKDOWN = [
  { label: "Chrome",  pct: 61, color: "#50e890" },
  { label: "Safari",  pct: 26, color: "#38bdf8" },
  { label: "Firefox", pct: 9,  color: "#a78bfa" },
  { label: "Edge",    pct: 4,  color: "#f0a840" },
];

const SCREEN_SIZES = [
  { label: "< 768px (Mobile)",     pct: 38, color: "#38bdf8", flag: true  },
  { label: "768–1024px (Tablet)",  pct: 12, color: "#a78bfa", flag: false },
  { label: "> 1024px (Desktop)",   pct: 50, color: "#50e890", flag: false },
];

const SESSION_LOG = [
  { id: "SES-2024", device: "iPhone 15 Pro",       browser: "Safari 17",    os: "iOS 17.4",     screen: "390×844",   ts: "Apr 6, 2026 09:14" },
  { id: "SES-2023", device: "MacBook Pro 14\"",     browser: "Chrome 123",   os: "macOS 15.3",   screen: "1512×982",  ts: "Apr 6, 2026 09:02" },
  { id: "SES-2022", device: "Samsung Galaxy S23",   browser: "Chrome 123",   os: "Android 14",   screen: "360×780",   ts: "Apr 6, 2026 08:57" },
  { id: "SES-2021", device: "iPad Air (M2)",        browser: "Safari 17",    os: "iPadOS 17.3",  screen: "820×1180",  ts: "Apr 5, 2026 21:44" },
  { id: "SES-2020", device: "Windows 11 Desktop",   browser: "Firefox 124",  os: "Windows 11",   screen: "1920×1080", ts: "Apr 5, 2026 20:31" },
  { id: "SES-2019", device: "iPhone 14",            browser: "Safari 17",    os: "iOS 17.2",     screen: "390×844",   ts: "Apr 5, 2026 19:15" },
  { id: "SES-2018", device: "Chromebook",           browser: "Chrome 122",   os: "ChromeOS 122", screen: "1366×768",  ts: "Apr 5, 2026 18:40" },
  { id: "SES-2017", device: "iPad mini 6",          browser: "Safari 17",    os: "iPadOS 17.1",  screen: "744×1133",  ts: "Apr 5, 2026 17:22" },
  { id: "SES-2016", device: "Pixel 7",              browser: "Chrome 123",   os: "Android 14",   screen: "412×915",   ts: "Apr 5, 2026 16:09" },
  { id: "SES-2015", device: "MacBook Air (M3)",     browser: "Safari 17",    os: "macOS 15.2",   screen: "1440×900",  ts: "Apr 5, 2026 15:55" },
];

const A11Y_FLAGS = [
  { device: "iPhone SE (1st gen)", issue: "Screen width 320px — may clip content at default font size", level: "warn" },
  { device: "Galaxy A13",          issue: "320px viewport detected — verify high-contrast mode support", level: "warn" },
];

export default async function DeviceCoveragePage() {
  const configured = isOwnerAccessConfigured();
  const allowed = hasOwnerAccess();

  if (!configured || !allowed) {
    return (
      <AppFrame audience="owner">
        <OwnerGate configured={configured} />
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="owner">
      <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 16px 64px", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>📱 Device Coverage</h1>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>Session device breakdowns</p>
          </div>

          {/* Top row: Device + Browser breakdowns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            {/* Device breakdown */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>
                Device Type
              </div>
              {DEVICE_BREAKDOWN.map((d) => (
                <div key={d.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: C.text }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.pct}%</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${d.pct}%`, height: "100%", background: d.color, borderRadius: 99, opacity: 0.85 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 18, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {DEVICE_BREAKDOWN.map((d) => (
                  <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                    {d.label} {d.pct}%
                  </div>
                ))}
              </div>
            </div>

            {/* Browser breakdown */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>
                Browser
              </div>
              {BROWSER_BREAKDOWN.map((b) => (
                <div key={b.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: C.text }}>{b.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 99, opacity: 0.85 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Screen sizes */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>
              Screen Size Categories
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {SCREEN_SIZES.map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.flag ? "rgba(240,168,64,0.3)" : C.border}`, borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.pct}%</div>
                  <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{s.label}</div>
                  {s.flag && (
                    <div style={{ fontSize: 11, color: C.amber, marginTop: 6 }}>⚠ Small screen — check contrast</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent session log */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              Recent Session Device Log
            </div>
            <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${C.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}` }}>
                    {["Session ID", "Device", "Browser", "OS", "Screen", "Timestamp"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SESSION_LOG.map((row) => (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 12px", color: C.accent, fontFamily: "monospace", fontSize: 12 }}>{row.id}</td>
                      <td style={{ padding: "10px 12px", color: C.text }}>{row.device}</td>
                      <td style={{ padding: "10px 12px", color: C.muted }}>{row.browser}</td>
                      <td style={{ padding: "10px 12px", color: C.muted }}>{row.os}</td>
                      <td style={{ padding: "10px 12px", color: C.muted, fontFamily: "monospace", fontSize: 12 }}>{row.screen}</td>
                      <td style={{ padding: "10px 12px", color: C.muted, whiteSpace: "nowrap" }}>{row.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accessibility flags */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              Accessibility Flags
            </div>
            {A11Y_FLAGS.length === 0 ? (
              <div style={{ color: C.accent, fontSize: 14, padding: "12px 0" }}>✓ No accessibility flags — all sessions within safe parameters</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {A11Y_FLAGS.map((flag, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "rgba(240,168,64,0.08)", border: "1px solid rgba(240,168,64,0.25)", borderRadius: 8 }}>
                    <span style={{ color: C.amber, fontSize: 16, flexShrink: 0 }}>⚠</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{flag.device}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{flag.issue}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { href: "/owner", label: "← Owner Hub" },
              { href: "/owner/routes", label: "Routes →" },
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
