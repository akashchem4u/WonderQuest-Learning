"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Theme tokens ──────────────────────────────────────────────────────────────
const BASE     = "#100b2e";
const SURFACE  = "#161b22";
const SURFACE2 = "#0d1117";
const BORDER   = "rgba(255,255,255,0.06)";
const VIOLET   = "#9b72ff";
const MINT     = "#22c55e";
const GOLD     = "#ffd166";
const RED      = "#f85149";
const AMBER    = "#f59e0b";
const TEXT     = "#f0f6ff";
const MUTED    = "#8b949e";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "profile" | "devices" | "danger";

interface LinkedChild {
  id: string;
  username: string;
  displayName: string;
  launchBandCode: string;
  avatarKey: string;
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
}

interface Guardian {
  id: string;
  username: string;
  displayName: string;
}

interface SessionData {
  guardian: Guardian;
  linkedChildren: LinkedChild[];
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: "🏠", label: "Family overview", href: "/parent" },
  { icon: "📊", label: "Weekly report",   href: "/parent/report" },
  { icon: "🏅", label: "Badges",          href: "/parent/badges" },
  { icon: "🔔", label: "Notifications",   href: "/parent/notifications" },
  { icon: "⚙️", label: "Settings",        href: "/parent/account" },
];

// ── Band label helper ─────────────────────────────────────────────────────────
function bandLabel(code: string): string {
  const map: Record<string, string> = {
    "K":  "Kindergarten",
    "G1": "Grade 1",
    "G2": "Grade 2",
    "G3": "Grade 3",
    "G4": "Grade 4",
    "G5": "Grade 5",
  };
  return map[code] ?? code;
}

// ── Avatar emoji helper ───────────────────────────────────────────────────────
function avatarEmoji(avatarKey: string): string {
  const map: Record<string, string> = {
    cat: "🐱", dog: "🐶", dragon: "🐉", fox: "🦊", owl: "🦉",
    bear: "🐻", bunny: "🐰", panda: "🐼",
  };
  return map[avatarKey] ?? "⭐";
}

export default function ParentAccountPage() {
  const [tab, setTab] = useState<Tab>("profile");

  // Session / real data
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Editable profile fields
  const [editName,  setEditName]  = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editingName,  setEditingName]  = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Danger zone confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteChecked, setDeleteChecked] = useState(false);

  // ── Fetch session on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/parent/session")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Failed to load profile.");
        }
        return res.json() as Promise<SessionData>;
      })
      .then((data) => {
        setSessionData(data);
        setLoadingSession(false);

        // Seed editable fields from localStorage (persist across sessions)
        const storedName  = localStorage.getItem("wq_parent_display_name");
        const storedEmail = localStorage.getItem("wq_parent_email");
        setEditName(storedName ?? data.guardian.displayName ?? "");
        setEditEmail(storedEmail ?? "");
      })
      .catch((err: unknown) => {
        setSessionError(err instanceof Error ? err.message : "Could not load profile.");
        setLoadingSession(false);

        // Still populate from localStorage if available
        const storedName  = localStorage.getItem("wq_parent_display_name");
        const storedEmail = localStorage.getItem("wq_parent_email");
        if (storedName)  setEditName(storedName);
        if (storedEmail) setEditEmail(storedEmail);
      });
  }, []);

  function saveProfileField() {
    localStorage.setItem("wq_parent_display_name", editName);
    localStorage.setItem("wq_parent_email", editEmail);
    setEditingName(false);
    setEditingEmail(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  // ── Shared card styles ────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: SURFACE,
    borderRadius: 14,
    padding: 20,
    border: `1px solid ${BORDER}`,
    marginBottom: 16,
  };

  const cardHead: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT,
    marginBottom: 14,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "11px 0",
    borderBottom: `1px solid rgba(255,255,255,0.05)`,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    minWidth: 130,
  };

  const valStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: TEXT,
    flex: 1,
  };

  const editLinkStyle: React.CSSProperties = {
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
    fontFamily: "system-ui",
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: SURFACE2,
    border: `1.5px solid rgba(155,114,255,0.4)`,
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 14,
    color: TEXT,
    fontFamily: "system-ui",
    outline: "none",
  };

  // ── Derived display values ────────────────────────────────────────────────
  const guardian = sessionData?.guardian;
  const linkedChildren = sessionData?.linkedChildren ?? [];

  // Initial for avatar fallback
  const initials = editName
    ? editName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : (guardian?.displayName ?? "P").charAt(0).toUpperCase();

  return (
    <AppFrame audience="parent" currentPath="/parent/account">
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
            {NAV_ITEMS.map((item) => {
              const isActive = item.label === "Settings";
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: isActive ? VIOLET : MUTED,
                    borderRadius: 8,
                    background: isActive ? "rgba(155,114,255,0.1)" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  {item.icon} {item.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: TEXT, marginBottom: 20 }}>
            Account Settings
          </h1>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <button style={tabBtnStyle(tab === "profile")} onClick={() => setTab("profile")}>
              Profile &amp; Plan
            </button>
            <button style={tabBtnStyle(tab === "devices")} onClick={() => setTab("devices")}>
              Devices &amp; Security
            </button>
            <button style={tabBtnStyle(tab === "danger")} onClick={() => setTab("danger")}>
              Danger Zone
            </button>
          </div>

          {/* ── Profile & Plan ── */}
          {tab === "profile" && (
            <div>
              {/* Session error banner */}
              {sessionError && (
                <div style={{
                  background: "rgba(248,81,73,0.1)",
                  border: `1px solid rgba(248,81,73,0.3)`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: RED,
                  marginBottom: 16,
                }}>
                  ⚠️ {sessionError} Showing locally saved data.
                </div>
              )}

              {/* Save confirmation banner */}
              {profileSaved && (
                <div style={{
                  background: "rgba(34,197,94,0.1)",
                  border: `1px solid rgba(34,197,94,0.3)`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: MINT,
                  marginBottom: 16,
                }}>
                  ✓ Profile saved!
                </div>
              )}

              {/* Profile card */}
              <div style={cardStyle}>
                <div style={cardHead}>👤 Your profile</div>

                {/* Avatar + name row */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: `linear-gradient(135deg,${VIOLET},#6040cc)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: loadingSession ? 14 : 22,
                    color: "#fff",
                    fontWeight: 900,
                    flexShrink: 0,
                  }}>
                    {loadingSession ? "..." : initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: TEXT }}>
                      {loadingSession ? "Loading..." : (editName || guardian?.displayName || "Parent")}
                    </div>
                    <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
                      {editEmail || "No email saved"}
                    </div>
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
                  </div>
                </div>

                {/* Editable: Full name */}
                <div style={{ ...rowStyle }}>
                  <span style={labelStyle}>Full name</span>
                  {editingName ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                      <input
                        style={inputStyle}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveProfileField()}
                      />
                      <span
                        style={{ fontSize: 12, color: MINT, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                        onClick={saveProfileField}
                      >Save</span>
                      <span
                        style={{ fontSize: 12, color: MUTED, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                        onClick={() => setEditingName(false)}
                      >Cancel</span>
                    </div>
                  ) : (
                    <>
                      <span style={valStyle}>{editName || guardian?.displayName || "—"}</span>
                      <span style={editLinkStyle} onClick={() => setEditingName(true)}>Edit</span>
                    </>
                  )}
                </div>

                {/* Editable: Email */}
                <div style={{ ...rowStyle }}>
                  <span style={labelStyle}>Email</span>
                  {editingEmail ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                      <input
                        style={inputStyle}
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveProfileField()}
                      />
                      <span
                        style={{ fontSize: 12, color: MINT, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                        onClick={saveProfileField}
                      >Save</span>
                      <span
                        style={{ fontSize: 12, color: MUTED, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                        onClick={() => setEditingEmail(false)}
                      >Cancel</span>
                    </div>
                  ) : (
                    <>
                      <span style={valStyle}>{editEmail || "No email saved"}</span>
                      <span style={editLinkStyle} onClick={() => setEditingEmail(true)}>
                        {editEmail ? "Change" : "Add"}
                      </span>
                    </>
                  )}
                </div>

                {/* Static: Username */}
                <div style={{ ...rowStyle }}>
                  <span style={labelStyle}>Username</span>
                  <span style={valStyle}>{guardian?.username ?? "—"}</span>
                </div>

                {/* Static: Role */}
                <div style={{ ...rowStyle }}>
                  <span style={labelStyle}>Role</span>
                  <span style={valStyle}>Parent / Guardian</span>
                </div>

                {/* Password */}
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                  <span style={labelStyle}>Password</span>
                  <span style={valStyle}>••••••••</span>
                  <span style={editLinkStyle}>Update</span>
                </div>
              </div>

              {/* Linked children card — real data */}
              <div style={cardStyle}>
                <div style={cardHead}>👦 Linked children</div>

                {loadingSession ? (
                  <div style={{ fontSize: 14, color: MUTED, padding: "8px 0" }}>Loading children...</div>
                ) : linkedChildren.length === 0 ? (
                  <div style={{ fontSize: 14, color: MUTED, padding: "8px 0" }}>
                    No children linked yet.{" "}
                    <a href="/parent/link-child" style={{ color: VIOLET, fontWeight: 700 }}>Link a child →</a>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {linkedChildren.map((child, i) => (
                      <div
                        key={child.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 0",
                          borderBottom: i < linkedChildren.length - 1
                            ? `1px solid rgba(255,255,255,0.05)`
                            : "none",
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: "rgba(155,114,255,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          flexShrink: 0,
                          border: `1.5px solid rgba(155,114,255,0.3)`,
                        }}>
                          {avatarEmoji(child.avatarKey)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>{child.displayName}</div>
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                            @{child.username}
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                            <span style={{
                              background: "rgba(155,114,255,0.14)",
                              color: VIOLET,
                              borderRadius: 20,
                              padding: "2px 9px",
                              fontSize: 11,
                              fontWeight: 700,
                            }}>
                              {bandLabel(child.launchBandCode)}
                            </span>
                            <span style={{
                              background: "rgba(255,209,102,0.12)",
                              color: GOLD,
                              borderRadius: 20,
                              padding: "2px 9px",
                              fontSize: 11,
                              fontWeight: 700,
                            }}>
                              Level {child.currentLevel}
                            </span>
                            <span style={{
                              background: "rgba(34,197,94,0.1)",
                              color: MINT,
                              borderRadius: 20,
                              padding: "2px 9px",
                              fontSize: 11,
                              fontWeight: 700,
                            }}>
                              ⭐ {child.totalPoints.toLocaleString()} pts
                            </span>
                          </div>
                        </div>

                        {/* View report link */}
                        <a
                          href={`/parent/report?studentId=${child.id}`}
                          style={{
                            fontSize: 12,
                            color: VIOLET,
                            fontWeight: 700,
                            textDecoration: "none",
                            flexShrink: 0,
                          }}
                        >
                          View report →
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscription card */}
              <div style={cardStyle}>
                <div style={cardHead}>💳 Subscription</div>
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
                <div style={cardHead}>📱 Linked devices</div>
                {[
                  { icon: "📱", name: "iPhone 15 Pro",   meta: "iOS 17.4 · Last active: Today 3:40 PM",            current: true  },
                  { icon: "💻", name: "MacBook Pro",      meta: "Safari · Last active: Mon Mar 23 at 8:12am",       current: false },
                  { icon: "📱", name: "iPad (child's)",   meta: "iPadOS 17.3 · Child device · Last session: Today", current: false },
                ].map((device, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.05)` : "none",
                    }}
                  >
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
                <div style={cardHead}>🔐 Security</div>
                <div style={{ ...rowStyle }}>
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
                <div style={{ ...rowStyle }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Active sessions</span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>2 active sessions across devices</span>
                  </div>
                  <span style={editLinkStyle}>View all</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Login history</span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>Last 10 sign-ins</span>
                  </div>
                  <span style={editLinkStyle}>View</span>
                </div>
              </div>

              {/* Child profile PIN */}
              <div style={cardStyle}>
                <div style={cardHead}>🔢 Child profile PIN</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                  The PIN you enter when switching to your child&#39;s profile in the app. This is separate from your account password.
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                  <span style={valStyle}>••••</span>
                  <span style={editLinkStyle}>Change PIN</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Danger Zone ── */}
          {tab === "danger" && (
            <div>
              {/* Your data */}
              <div style={cardStyle}>
                <div style={cardHead}>📦 Your data</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                  You have the right to download or request deletion of all data associated with your account and linked children&#39;s profiles (GDPR / CCPA).
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
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Download a ZIP of your account and learning data</div>
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
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Pause your account — reactivate anytime. Your child&#39;s data is preserved.</div>
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
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    style={{
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
                    }}
                  >Delete account</button>
                </div>
              </div>

              {/* Delete confirmation dialog */}
              {deleteConfirm && (
                <div style={{
                  background: SURFACE,
                  borderRadius: 14,
                  padding: 20,
                  border: `1.5px solid rgba(248,81,73,0.3)`,
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: RED, marginBottom: 8 }}>Delete your account?</div>
                  <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                    Your account will be scheduled for deletion. Your children&#39;s learning progress will be preserved for <strong style={{ color: TEXT }}>90 days</strong> — you can reactivate within that time to restore everything.
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
                      <input
                        type="checkbox"
                        checked={deleteChecked}
                        onChange={(e) => setDeleteChecked(e.target.checked)}
                        style={{ marginTop: 2 }}
                      />
                      <span style={{ fontSize: 13, color: MUTED }}>I understand my account will be deleted after 90 days</span>
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      disabled={!deleteChecked}
                      style={{
                        flex: 1,
                        padding: 12,
                        background: deleteChecked ? RED : "rgba(248,81,73,0.2)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: "system-ui",
                        cursor: deleteChecked ? "pointer" : "not-allowed",
                        opacity: deleteChecked ? 1 : 0.6,
                      }}
                    >Yes, delete my account</button>
                    <button
                      onClick={() => { setDeleteConfirm(false); setDeleteChecked(false); }}
                      style={{
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
                      }}
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
