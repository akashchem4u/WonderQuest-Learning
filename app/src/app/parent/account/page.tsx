"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const BASE    = "#100b2e";
const SURFACE = "#161b22";
const SURFACE2 = "#0d1117";
const BORDER  = "rgba(255,255,255,0.06)";
const VIOLET  = "#9b72ff";
const BLUE    = "#38bdf8";
const MINT    = "#22c55e";
const GOLD    = "#ffd166";
const AMBER   = "#f59e0b";
const RED     = "#f85149";
const TEXT    = "#f0f6ff";
const MUTED   = "#8b949e";
const MUTED2  = "rgba(255,255,255,0.3)";

type Tab = "profile" | "devices" | "danger";

const NAV_ITEMS = [
  { icon: "🏠", label: "Family overview", href: "/parent" },
  { icon: "📊", label: "Weekly report",   href: "/parent/report" },
  { icon: "🏅", label: "Badges",          href: "/parent/badges" },
  { icon: "🔔", label: "Notifications",   href: "/parent/notifications" },
  { icon: "⚙️", label: "Settings",        href: "/parent/account" },
];

export default function ParentAccountPage() {
  const [tab, setTab] = useState<Tab>("profile");

  const cardStyle: React.CSSProperties = {
    background: SURFACE,
    borderRadius: 14,
    padding: 20,
    border: `1px solid ${BORDER}`,
    marginBottom: 16,
  };

  const cardHeadStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT,
    marginBottom: 14,
  };

  const infoRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "11px 0",
    borderBottom: `1px solid rgba(255,255,255,0.05)`,
  };

  const infoLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    minWidth: 130,
  };

  const infoValStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: TEXT,
    flex: 1,
  };

  const infoEditStyle: React.CSSProperties = {
    fontSize: 12,
    color: VIOLET,
    fontWeight: 700,
    cursor: "pointer",
    marginLeft: "auto",
  };

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: active ? VIOLET : "rgba(255,255,255,0.06)",
    color: active ? "#fff" : MUTED,
    transition: "all 0.18s",
    fontFamily: "system-ui",
  });

  return (
    <AppFrame audience="parent">
      <div style={{ background: BASE, minHeight: "100vh", display: "flex" }}>
        {/* Sidebar */}
        <div style={{
          width: 240,
          background: SURFACE,
          borderRight: `1px solid ${BORDER}`,
          padding: "20px 0",
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 900,
            color: VIOLET,
            padding: "0 20px 16px",
            borderBottom: `1px solid ${BORDER}`,
            marginBottom: 12,
          }}>WonderQuest</div>
          <div style={{ padding: "0 8px" }}>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.href}
                style={{
                  padding: "9px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: item.label === "Settings" ? VIOLET : MUTED,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 8,
                  background: item.label === "Settings" ? "rgba(155,114,255,0.1)" : "transparent",
                }}
              >
                {item.icon} {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: TEXT, marginBottom: 20 }}>Account Settings</h1>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <button style={tabBtnStyle(tab === "profile")} onClick={() => setTab("profile")}>Profile &amp; Plan</button>
            <button style={tabBtnStyle(tab === "devices")} onClick={() => setTab("devices")}>Devices &amp; Security</button>
            <button style={tabBtnStyle(tab === "danger")} onClick={() => setTab("danger")}>Danger Zone</button>
          </div>

          {/* ── Profile & Plan ── */}
          {tab === "profile" && (
            <div>
              {/* Profile card */}
              <div style={cardStyle}>
                <div style={cardHeadStyle}>👤 Your profile</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: `linear-gradient(135deg, ${VIOLET}, #6040cc)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    color: "#fff",
                    fontWeight: 900,
                    flexShrink: 0,
                  }}>S</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: TEXT }}>Sarah Mitchell</div>
                    <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>sarah.mitchell@email.com</div>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(155,114,255,0.15)",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: VIOLET,
                      marginTop: 5,
                    }}>👨‍👩‍👧 Family plan</div>
                    <div style={{ fontSize: 12, color: VIOLET, fontWeight: 700, cursor: "pointer", marginTop: 6 }}>Edit profile photo</div>
                  </div>
                </div>

                <div style={{ ...infoRowStyle }}>
                  <span style={infoLabelStyle}>Full name</span>
                  <span style={infoValStyle}>Sarah Mitchell</span>
                  <span style={infoEditStyle}>Edit</span>
                </div>
                <div style={{ ...infoRowStyle }}>
                  <span style={infoLabelStyle}>Email</span>
                  <span style={infoValStyle}>sarah.mitchell@email.com</span>
                  <span style={infoEditStyle}>Change</span>
                </div>
                <div style={{ ...infoRowStyle }}>
                  <span style={infoLabelStyle}>Password</span>
                  <span style={infoValStyle}>••••••••</span>
                  <span style={infoEditStyle}>Update</span>
                </div>
                <div style={{ ...infoRowStyle }}>
                  <span style={infoLabelStyle}>Role</span>
                  <span style={infoValStyle}>Parent / Guardian</span>
                  <span style={infoEditStyle}>Change</span>
                </div>
                <div style={{ ...infoRowStyle, borderBottom: "none" }}>
                  <span style={infoLabelStyle}>Member since</span>
                  <span style={infoValStyle}>January 14, 2026</span>
                </div>
              </div>

              {/* Subscription card */}
              <div style={cardStyle}>
                <div style={cardHeadStyle}>💳 Subscription</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    background: "rgba(155,114,255,0.15)",
                    color: VIOLET,
                  }}>👨‍👩‍👧 Family plan</span>
                  <span style={{ fontSize: 13, color: MUTED }}>$7.99/month · Renews Apr 14, 2026</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 16 }}>
                  {[
                    "Unlimited children",
                    "Unlimited sessions/day",
                    "Full weekly reports",
                    "All skill detail views",
                    "Home practice planner",
                    "Priority support",
                  ].map((feature) => (
                    <div key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: TEXT }}>
                      <span style={{ color: MINT, fontWeight: 900, marginTop: 1, flexShrink: 0 }}>✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{
                    padding: "10px 20px",
                    border: `1.5px solid ${BORDER}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: MUTED,
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.04)",
                    fontFamily: "system-ui",
                  }}>Manage billing</button>
                  <button style={{
                    padding: "10px 20px",
                    border: `1.5px solid rgba(248,81,73,0.4)`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: RED,
                    cursor: "pointer",
                    background: "rgba(248,81,73,0.08)",
                    fontFamily: "system-ui",
                  }}>Cancel plan</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Devices & Security ── */}
          {tab === "devices" && (
            <div>
              {/* Linked devices */}
              <div style={cardStyle}>
                <div style={cardHeadStyle}>📱 Linked devices</div>
                {[
                  { icon: "📱", name: "iPhone 15 Pro", meta: "iOS 17.4 · Last active: Today 3:40 PM", current: true },
                  { icon: "💻", name: "MacBook Pro",   meta: "Safari · Last active: Mon Mar 23 at 8:12am", current: false },
                  { icon: "📱", name: "iPad (Maya's)", meta: "iPadOS 17.3 · Child device · Last session: Today", current: false },
                ].map((device, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.05)` : "none",
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(155,114,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}>{device.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                        {device.name}
                        {device.current && (
                          <span style={{
                            fontSize: 10,
                            background: "rgba(34,197,94,0.15)",
                            color: MINT,
                            fontWeight: 700,
                            borderRadius: 20,
                            padding: "2px 8px",
                            marginLeft: 6,
                          }}>This device</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: MUTED }}>{device.meta}</div>
                    </div>
                    {!device.current && (
                      <span style={{ fontSize: 12, color: RED, fontWeight: 700, cursor: "pointer" }}>Remove</span>
                    )}
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <button style={{
                    background: "transparent",
                    border: `1.5px solid rgba(248,81,73,0.4)`,
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: RED,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                  }}>Sign out all other devices</button>
                </div>
              </div>

              {/* Security */}
              <div style={cardStyle}>
                <div style={cardHeadStyle}>🔐 Security</div>
                <div style={{ ...infoRowStyle }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Two-factor authentication</span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>Extra security when signing in</span>
                  </div>
                  <span style={{
                    background: "rgba(34,197,94,0.12)",
                    color: MINT,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 20,
                    marginLeft: "auto",
                  }}>Enabled ✓</span>
                </div>
                <div style={{ ...infoRowStyle }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Active sessions</span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>2 active sessions across devices</span>
                  </div>
                  <span style={infoEditStyle}>View all</span>
                </div>
                <div style={{ ...infoRowStyle, borderBottom: "none" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Login history</span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>Last 10 sign-ins</span>
                  </div>
                  <span style={infoEditStyle}>View</span>
                </div>
              </div>

              {/* Child profile PIN */}
              <div style={cardStyle}>
                <div style={cardHeadStyle}>🔢 Child profile PIN</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                  The PIN you enter when switching to Maya&#39;s profile in the app. This is separate from your account password.
                </div>
                <div style={{ ...infoRowStyle, borderBottom: "none" }}>
                  <span style={infoValStyle}>••••</span>
                  <span style={infoEditStyle}>Change PIN</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Danger Zone ── */}
          {tab === "danger" && (
            <div>
              {/* Your data */}
              <div style={cardStyle}>
                <div style={cardHeadStyle}>📦 Your data</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                  You have the right to download or request deletion of all data associated with your account and linked children&#39;s profiles (GDPR/CCPA).
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: `1px solid ${BORDER}`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Export all data</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Download a ZIP of your account and Maya&#39;s learning data</div>
                  </div>
                  <button style={{
                    padding: "8px 16px",
                    background: "rgba(155,114,255,0.1)",
                    color: VIOLET,
                    border: `1.5px solid rgba(155,114,255,0.3)`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}>Request export</button>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Data deletion request</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Request removal of all personal data (separate from account deletion)</div>
                  </div>
                  <button style={{
                    padding: "8px 16px",
                    background: "rgba(248,81,73,0.08)",
                    color: RED,
                    border: `1.5px solid rgba(248,81,73,0.35)`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}>Request deletion</button>
                </div>
              </div>

              {/* Danger zone */}
              <div style={{
                background: SURFACE,
                borderRadius: 14,
                padding: 20,
                border: `1.5px solid rgba(248,81,73,0.3)`,
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: RED, marginBottom: 14 }}>⚠️ Danger zone</div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: `1px solid rgba(248,81,73,0.15)`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Deactivate account</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Pause your account — reactivate anytime. Maya&#39;s data preserved.</div>
                  </div>
                  <button style={{
                    padding: "8px 16px",
                    background: "rgba(248,81,73,0.08)",
                    color: RED,
                    border: `1.5px solid rgba(248,81,73,0.35)`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}>Deactivate</button>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Permanently delete account</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>All data deleted after 90-day grace period. 2-step confirmation required.</div>
                  </div>
                  <button style={{
                    padding: "8px 16px",
                    background: "rgba(248,81,73,0.08)",
                    color: RED,
                    border: `1.5px solid rgba(248,81,73,0.35)`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}>Delete account</button>
                </div>
              </div>

              {/* Delete confirmation example */}
              <div style={{
                background: SURFACE,
                borderRadius: 14,
                padding: 20,
                border: `1.5px solid rgba(248,81,73,0.3)`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 10 }}>Delete confirmation dialog (2-step)</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: RED, marginBottom: 8 }}>Delete your account?</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                  Your account will be scheduled for deletion. Maya&#39;s learning progress will be preserved for <strong style={{ color: TEXT }}>90 days</strong> — you can reactivate within that time to restore everything.
                </div>
                <div style={{
                  background: "rgba(245,158,11,0.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 12,
                  color: AMBER,
                  marginBottom: 14,
                  lineHeight: 1.5,
                  border: `1px solid rgba(245,158,11,0.2)`,
                }}>
                  ⚠️ After 90 days, all data is permanently deleted and cannot be recovered.
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" style={{ marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: MUTED }}>I understand my account will be deleted after 90 days</span>
                  </label>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{
                    flex: 1,
                    padding: 12,
                    background: RED,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                    cursor: "pointer",
                  }}>Yes, delete my account</button>
                  <button style={{
                    flex: 1,
                    padding: 12,
                    background: "rgba(255,255,255,0.06)",
                    color: MUTED,
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                    cursor: "pointer",
                  }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
