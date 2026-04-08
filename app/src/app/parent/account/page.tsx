"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { type CurriculumFramework } from "@/lib/curriculum-frameworks";

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
type Tab = "profile" | "children" | "notifications" | "security" | "danger";

type RelationshipLabel = "Parent" | "Guardian" | "Grandparent" | "Caregiver";

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

interface NotificationPrefs {
  weeklyReports: boolean;
  milestoneNotifications: boolean;
  teacherMessages: boolean;
}

// ── Band label helper ─────────────────────────────────────────────────────────
function bandLabel(code: string): string {
  const map: Record<string, string> = {
    "PREK": "Pre-K",
    "K1":   "K – Grade 1",
    "G23":  "Grade 2 – 3",
    "G45":  "Grade 4 – 5",
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
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  // Session / real data
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [accountCtx, setAccountCtx] = useState<{
    stateCode: string | null;
    schoolName: string | null;
    isdName: string | null;
    resolution?: { framework: CurriculumFramework; source: string; sourceLabel: string };
  } | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Editable profile fields
  const [editName,         setEditName]         = useState("");
  const [editRelationship, setEditRelationship] = useState<RelationshipLabel>("Parent");
  const [editingName,      setEditingName]      = useState(false);
  const [profileSaving,    setProfileSaving]    = useState(false);
  const [profileSaved,     setProfileSaved]     = useState(false);
  const [profileError,     setProfileError]     = useState<string | null>(null);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    weeklyReports: true,
    milestoneNotifications: true,
    teacherMessages: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved,  setNotifSaved]  = useState(false);
  const [notifError,  setNotifError]  = useState<string | null>(null);

  // PIN change
  const [currentPin, setCurrentPin] = useState("");
  const [newPin,     setNewPin]     = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinSaving,  setPinSaving]  = useState(false);
  const [pinSaved,   setPinSaved]   = useState(false);
  const [pinError,   setPinError]   = useState<string | null>(null);

  // Danger zone confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteChecked, setDeleteChecked] = useState(false);

  // PIN reset modal (child)
  const [pinResetChildId,   setPinResetChildId]   = useState<string | null>(null);
  const [pinResetChildName, setPinResetChildName] = useState("");
  const [pinResetValue,     setPinResetValue]     = useState("");
  const [pinResetSaving,    setPinResetSaving]    = useState(false);
  const [pinResetError,     setPinResetError]     = useState<string | null>(null);
  const [pinResetSuccess,   setPinResetSuccess]   = useState(false);

  // Band edit modal (child)
  const [bandChildId,    setBandChildId]    = useState<string | null>(null);
  const [bandChildName,  setBandChildName]  = useState("");
  const [bandSelected,   setBandSelected]   = useState("");
  const [bandSaving,     setBandSaving]     = useState(false);
  const [bandError,      setBandError]      = useState<string | null>(null);
  const [bandSuccess,    setBandSuccess]    = useState(false);

  // ── Fetch session on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/parent/session")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg = (body as { error?: string }).error ?? "Failed to load profile.";
          if (res.status === 401) {
            router.push("/parent");
            return null;
          }
          throw new Error(msg);
        }
        return res.json() as Promise<SessionData>;
      })
      .then((data) => {
        if (!data) return;
        setSessionData(data);
        setLoadingSession(false);
        setEditName(data.guardian.displayName ?? "");
      })
      .catch((err: unknown) => {
        setSessionError(err instanceof Error ? err.message : "Could not load profile.");
        setLoadingSession(false);
      });

    // Load curriculum/school context (non-blocking)
    fetch("/api/parent/account-context")
      .then(async (r) => {
        if (r.ok) {
          const ctx = await r.json() as typeof accountCtx;
          setAccountCtx(ctx);
        }
      })
      .catch(() => { /* ignore */ });
  }, [router]);

  // ── Profile save ─────────────────────────────────────────────────────────
  async function saveProfile() {
    setProfileSaving(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/parent/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: editName, relationshipLabel: editRelationship }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Save failed.");
      }
      setEditingName(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Notification prefs save ───────────────────────────────────────────────
  async function saveNotifPrefs() {
    setNotifSaving(true);
    setNotifError(null);
    try {
      const res = await fetch("/api/parent/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationSettings: notifPrefs }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Save failed.");
      }
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2500);
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setNotifSaving(false);
    }
  }

  // ── PIN change ────────────────────────────────────────────────────────────
  async function changePin() {
    setPinError(null);
    if (!/^\d{4}$/.test(currentPin)) { setPinError("Current PIN must be 4 digits."); return; }
    if (!/^\d{4}$/.test(newPin))     { setPinError("New PIN must be exactly 4 digits."); return; }
    if (newPin !== confirmPin)        { setPinError("PINs do not match."); return; }

    setPinSaving(true);
    try {
      const res = await fetch("/api/parent/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "PIN update failed.");
      }
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 3000);
    } catch (err) {
      setPinError(err instanceof Error ? err.message : "PIN update failed.");
    } finally {
      setPinSaving(false);
    }
  }

  // ── Reset child PIN ───────────────────────────────────────────────────────
  async function submitResetChildPin() {
    if (!/^\d{4}$/.test(pinResetValue)) {
      setPinResetError("PIN must be exactly 4 digits.");
      return;
    }
    setPinResetSaving(true);
    setPinResetError(null);
    try {
      const res = await fetch("/api/parent/reset-child-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: pinResetChildId, newPin: pinResetValue }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Reset failed.");
      }
      setPinResetSuccess(true);
      setTimeout(() => {
        setPinResetChildId(null);
        setPinResetValue("");
        setPinResetSuccess(false);
        setPinResetError(null);
      }, 1800);
    } catch (err) {
      setPinResetError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setPinResetSaving(false);
    }
  }

  function openPinResetModal(childId: string, childName: string) {
    setPinResetChildId(childId);
    setPinResetChildName(childName);
    setPinResetValue("");
    setPinResetError(null);
    setPinResetSuccess(false);
  }

  // ── Band modal ────────────────────────────────────────────────────────────
  function openBandModal(childId: string, childName: string, currentBand: string) {
    setBandChildId(childId);
    setBandChildName(childName);
    setBandSelected(currentBand);
    setBandError(null);
    setBandSuccess(false);
  }

  async function submitBandUpdate() {
    if (!bandChildId) return;
    setBandSaving(true);
    setBandError(null);
    try {
      const res = await fetch("/api/parent/update-child-band", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: bandChildId, launchBandCode: bandSelected }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Update failed.");
      }
      // Update local state so the badge refreshes immediately without a reload
      setSessionData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          linkedChildren: prev.linkedChildren.map((c) =>
            c.id === bandChildId ? { ...c, launchBandCode: bandSelected } : c
          ),
        };
      });
      setBandSuccess(true);
      setTimeout(() => {
        setBandChildId(null);
        setBandSuccess(false);
        setBandError(null);
      }, 1600);
    } catch (err) {
      setBandError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBandSaving(false);
    }
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
    minHeight: 44,
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: SURFACE2,
    border: `1.5px solid rgba(155,114,255,0.4)`,
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 16,
    color: TEXT,
    fontFamily: "system-ui",
    outline: "none",
  };

  const pinInputStyle: React.CSSProperties = {
    width: "100%",
    background: SURFACE2,
    border: `1.5px solid rgba(155,114,255,0.4)`,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 16,
    color: TEXT,
    fontFamily: "system-ui",
    outline: "none",
    letterSpacing: "0.25em",
    boxSizing: "border-box",
  };

  const saveBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "9px 22px",
    borderRadius: 10,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 700,
    background: disabled ? "rgba(155,114,255,0.3)" : VIOLET,
    color: "#fff",
    fontFamily: "system-ui",
    opacity: disabled ? 0.6 : 1,
    minHeight: 44,
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  });

  // ── Derived values ────────────────────────────────────────────────────────
  const guardian = sessionData?.guardian;
  const linkedChildren = sessionData?.linkedChildren ?? [];

  const initials = editName
    ? editName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : (guardian?.displayName ?? "P").charAt(0).toUpperCase();

  return (
    <AppFrame audience="parent" currentPath="/parent/account">
      <div style={{ background: BASE, minHeight: "100vh", padding: 32, overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom, 32px)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: TEXT, marginBottom: 20 }}>
          Account Settings
        </h1>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <button style={tabBtnStyle(tab === "profile")}       onClick={() => setTab("profile")}>Profile</button>
          <button style={tabBtnStyle(tab === "children")}      onClick={() => setTab("children")}>Children</button>
          <button style={tabBtnStyle(tab === "notifications")} onClick={() => setTab("notifications")}>Notifications</button>
          <button style={tabBtnStyle(tab === "security")}      onClick={() => setTab("security")}>Security</button>
          <button style={tabBtnStyle(tab === "danger")}        onClick={() => setTab("danger")}>Danger Zone</button>
        </div>

        {/* ── Profile Tab ── */}
        {tab === "profile" && (
          <div>
            {sessionError && (
              <div style={{
                background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 16,
              }}>{sessionError}</div>
            )}
            {profileSaved && (
              <div style={{
                background: "rgba(34,197,94,0.1)", border: `1px solid rgba(34,197,94,0.3)`,
                borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700,
                color: MINT, marginBottom: 16,
              }}>Profile saved!</div>
            )}
            {profileError && (
              <div style={{
                background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 16,
              }}>{profileError}</div>
            )}

            {/* Account Info card */}
            <div style={cardStyle}>
              <div style={cardHead}>Account info</div>
              <div style={{ ...rowStyle }}>
                <span style={labelStyle}>Email / username</span>
                <span style={valStyle}>@{guardian?.username ?? "—"}</span>
              </div>
              <div style={{ ...rowStyle }}>
                <span style={labelStyle}>Display name</span>
                <span style={valStyle}>{guardian?.displayName ?? "—"}</span>
              </div>
              <div style={{ ...rowStyle, borderBottom: "none" }}>
                <span style={labelStyle}>Session</span>
                <a
                  href="/api/parent/logout"
                  style={{
                    fontSize: 12, fontWeight: 700, color: RED, textDecoration: "none",
                    background: "rgba(248,81,73,0.08)", border: `1.5px solid rgba(248,81,73,0.3)`,
                    borderRadius: 8, padding: "5px 14px",
                    display: "inline-flex", alignItems: "center",
                    minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Sign out
                </a>
              </div>
            </div>

            {/* Profile card */}
            <div style={cardStyle}>
              <div style={cardHead}>Your profile</div>

              {/* Avatar + name header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: `linear-gradient(135deg,${VIOLET},#6040cc)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: loadingSession ? 14 : 22, color: "#fff", fontWeight: 900, flexShrink: 0,
                }}>
                  {loadingSession ? "..." : initials}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: TEXT }}>
                    {loadingSession ? "Loading..." : (editName || guardian?.displayName || "Parent")}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>@{guardian?.username ?? "..."}</div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(155,114,255,0.15)", borderRadius: 20, padding: "3px 10px",
                    fontSize: 11, fontWeight: 700, color: VIOLET, marginTop: 5,
                  }}>{editRelationship}</div>
                </div>
              </div>

              {/* Display name */}
              <div style={{ ...rowStyle }}>
                <span style={labelStyle}>Display name</span>
                {editingName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <input
                      style={inputStyle}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                    />
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

              {/* Relationship label */}
              <div style={{ ...rowStyle }}>
                <span style={labelStyle}>Relationship</span>
                <select
                  value={editRelationship}
                  onChange={(e) => setEditRelationship(e.target.value as RelationshipLabel)}
                  style={{
                    flex: 1,
                    background: SURFACE2,
                    border: `1.5px solid rgba(155,114,255,0.4)`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 16,
                    color: TEXT,
                    fontFamily: "system-ui",
                    outline: "none",
                    cursor: "pointer",
                    minHeight: 44,
                    touchAction: "manipulation",
                  }}
                >
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Caregiver">Caregiver</option>
                </select>
              </div>

              {/* Username (static) */}
              <div style={{ ...rowStyle, borderBottom: "none" }}>
                <span style={labelStyle}>Username</span>
                <span style={valStyle}>{guardian?.username ?? "—"}</span>
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button
                  style={saveBtnStyle(profileSaving)}
                  disabled={profileSaving}
                  onClick={saveProfile}
                >
                  {profileSaving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>

            {/* School & Standards card */}
            <div style={cardStyle}>
              <div style={cardHead}>School &amp; Curriculum Standards</div>
              {accountCtx ? (
                <>
                  {accountCtx.resolution && accountCtx.stateCode ? (
                    <div style={{ ...rowStyle }}>
                      <span style={labelStyle}>Curriculum</span>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          display: "inline-block",
                          fontWeight: 700,
                          fontSize: 13,
                          color: accountCtx.resolution.framework.color,
                          background: `${accountCtx.resolution.framework.color}18`,
                          border: `1.5px solid ${accountCtx.resolution.framework.color}35`,
                          borderRadius: 8,
                          padding: "3px 10px",
                        }}>
                          {accountCtx.resolution.framework.shortName}
                        </span>
                        <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>
                          {accountCtx.resolution.source === "isd"
                            ? `via ${accountCtx.resolution.sourceLabel}`
                            : accountCtx.resolution.sourceLabel}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ ...rowStyle }}>
                      <span style={labelStyle}>Curriculum</span>
                      <a
                        href="/parent"
                        style={{ fontSize: 12, color: VIOLET, fontWeight: 600, textDecoration: "none" }}
                      >
                        Add your state to see curriculum alignment →
                      </a>
                    </div>
                  )}
                  {accountCtx.schoolName && (
                    <div style={{ ...rowStyle }}>
                      <span style={labelStyle}>School</span>
                      <span style={valStyle}>{accountCtx.schoolName}</span>
                    </div>
                  )}
                  {accountCtx.isdName && (
                    <div style={{ ...rowStyle, borderBottom: "none" }}>
                      <span style={labelStyle}>ISD / District</span>
                      <span style={valStyle}>{accountCtx.isdName}</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 13, color: MUTED }}>Loading…</div>
              )}
            </div>

          </div>
        )}

        {/* ── Children Tab ── */}
        {tab === "children" && (
          <div>
            {loadingSession ? (
              <div style={{ fontSize: 14, color: MUTED, padding: "16px 0" }}>Loading children...</div>
            ) : linkedChildren.length === 0 ? (
              <div style={cardStyle}>
                <div style={{ fontSize: 14, color: MUTED }}>
                  No children linked yet.{" "}
                  <a href="/parent/link" style={{ color: VIOLET, fontWeight: 700 }}>Link a child account →</a>
                </div>
              </div>
            ) : (
              linkedChildren.map((child) => (
                <div key={child.id} style={{ ...cardStyle }}>
                  {/* Child header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: "rgba(155,114,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 26, flexShrink: 0,
                      border: `1.5px solid rgba(155,114,255,0.3)`,
                    }}>
                      {avatarEmoji(child.avatarKey)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{child.displayName}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>@{child.username}</div>
                      <span style={{
                        display: "inline-block", marginTop: 5,
                        background: "rgba(155,114,255,0.14)", color: VIOLET,
                        borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                      }}>{bandLabel(child.launchBandCode)}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{
                        background: "rgba(255,209,102,0.12)", color: GOLD,
                        borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700,
                      }}>Level {child.currentLevel}</span>
                      <span style={{
                        background: "rgba(80,232,144,0.1)", color: "#50e890",
                        borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700,
                      }}>⭐ {child.totalPoints.toLocaleString()} pts</span>
                    </div>
                  </div>

                  {/* Action row */}
                  <div style={{
                    display: "flex", gap: 10, flexWrap: "wrap",
                    borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: 12,
                  }}>
                    <button
                      onClick={() => openPinResetModal(child.id, child.displayName)}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(155,114,255,0.12)",
                        border: `1.5px solid rgba(155,114,255,0.3)`,
                        borderRadius: 8, fontSize: 12, fontWeight: 700,
                        color: VIOLET, cursor: "pointer", fontFamily: "system-ui",
                        minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      🔑 Reset PIN
                    </button>
                    <button
                      onClick={() => openBandModal(child.id, child.displayName, child.launchBandCode)}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(255,209,102,0.08)",
                        border: `1.5px solid rgba(255,209,102,0.25)`,
                        borderRadius: 8, fontSize: 12, fontWeight: 700,
                        color: GOLD, cursor: "pointer", fontFamily: "system-ui",
                        minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      ✏️ Edit grade level
                    </button>
                    <a
                      href={`/parent?studentId=${child.id}`}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(255,255,255,0.05)",
                        border: `1.5px solid rgba(255,255,255,0.1)`,
                        borderRadius: 8, fontSize: 12, fontWeight: 700,
                        color: MUTED, textDecoration: "none", fontFamily: "system-ui",
                        display: "inline-flex", alignItems: "center",
                        minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      Dashboard →
                    </a>
                  </div>
                </div>
              ))
            )}

            {/* Add another child CTA */}
            <div style={{
              marginTop: 8, padding: "16px 20px",
              background: "rgba(155,114,255,0.06)",
              border: `1.5px dashed rgba(155,114,255,0.3)`,
              borderRadius: 14, textAlign: "center" as const,
            }}>
              <a
                href="/parent/link"
                style={{ fontSize: 14, fontWeight: 700, color: VIOLET, textDecoration: "none" }}
              >
                + Add another child
              </a>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
                Link an additional child account to your guardian profile
              </div>
            </div>
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {tab === "notifications" && (
          <div>
            {notifSaved && (
              <div style={{
                background: "rgba(34,197,94,0.1)", border: `1px solid rgba(34,197,94,0.3)`,
                borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700,
                color: MINT, marginBottom: 16,
              }}>Notification preferences saved!</div>
            )}
            {notifError && (
              <div style={{
                background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 16,
              }}>{notifError}</div>
            )}

            <div style={cardStyle}>
              <div style={cardHead}>Notification preferences</div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>
                Choose which notifications you receive by email.
              </div>

              {(
                [
                  {
                    key: "weeklyReports" as const,
                    label: "Weekly progress reports",
                    desc: "Get a summary of your child's learning progress every week.",
                  },
                  {
                    key: "milestoneNotifications" as const,
                    label: "Milestone notifications",
                    desc: "Be notified when your child earns a badge or trophy.",
                  },
                  {
                    key: "teacherMessages" as const,
                    label: "Teacher messages",
                    desc: "Receive a notification when a teacher sends you a message.",
                  },
                ] as const
              ).map((item, i, arr) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "14px 0",
                    borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{item.desc}</div>
                  </div>
                  <div
                    role="switch"
                    aria-checked={notifPrefs[item.key]}
                    onClick={() => setNotifPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
                    style={{
                      width: 46, height: 26, borderRadius: 13, flexShrink: 0,
                      background: notifPrefs[item.key] ? VIOLET : "rgba(255,255,255,0.1)",
                      cursor: "pointer", position: "relative",
                      transition: "background 0.2s",
                      touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                      minWidth: 44,
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 3,
                      left: notifPrefs[item.key] ? 23 : 3,
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                    }} />
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button
                  style={saveBtnStyle(notifSaving)}
                  disabled={notifSaving}
                  onClick={saveNotifPrefs}
                >
                  {notifSaving ? "Saving..." : "Save preferences"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Security Tab ── */}
        {tab === "security" && (
          <div>
            {/* Change PIN */}
            <div style={cardStyle}>
              <div style={cardHead}>Change PIN</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 16 }}>
                Your 4-digit PIN is used to switch into your parent view from a child device.
              </div>

              {pinSaved && (
                <div style={{
                  background: "rgba(34,197,94,0.1)", border: `1px solid rgba(34,197,94,0.3)`,
                  borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700,
                  color: MINT, marginBottom: 16,
                }}>PIN updated successfully!</div>
              )}
              {pinError && (
                <div style={{
                  background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 16,
                }}>{pinError}</div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                    Current PIN
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    style={pinInputStyle}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                    New PIN
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    style={pinInputStyle}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                    Confirm new PIN
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    style={pinInputStyle}
                    onKeyDown={(e) => e.key === "Enter" && changePin()}
                  />
                </div>
                <button
                  style={{ ...saveBtnStyle(pinSaving), alignSelf: "flex-start" }}
                  disabled={pinSaving}
                  onClick={changePin}
                >
                  {pinSaving ? "Updating..." : "Update PIN"}
                </button>
              </div>
            </div>

            {/* Sign out */}
            <div style={cardStyle}>
              <div style={cardHead}>Session</div>
              <div style={{ ...rowStyle, borderBottom: "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Sign out</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>End your current session and return to the sign-in page.</div>
                </div>
                <a
                  href="/api/parent/logout"
                  style={{
                    fontSize: 13, fontWeight: 700, color: RED, textDecoration: "none",
                    background: "rgba(248,81,73,0.08)", border: `1.5px solid rgba(248,81,73,0.3)`,
                    borderRadius: 8, padding: "7px 16px", flexShrink: 0,
                  }}
                >
                  Sign out
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Danger Zone Tab ── */}
        {tab === "danger" && (
          <div>
            <div style={cardStyle}>
              <div style={cardHead}>Your data</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                You have the right to download or request deletion of all data associated with your account and
                linked children&#39;s profiles (GDPR / CCPA).
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: `1px solid ${BORDER}`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Export all data</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Download a ZIP of your account and learning data</div>
                </div>
                <button style={{
                  padding: "8px 16px", background: "rgba(155,114,255,0.1)", color: VIOLET,
                  border: `1.5px solid rgba(155,114,255,0.3)`, borderRadius: 8,
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                  flexShrink: 0, marginLeft: 12,
                  minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}>Request export</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Data deletion request</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Request removal of all personal data (separate from account deletion)</div>
                </div>
                <button style={{
                  padding: "8px 16px", background: "rgba(248,81,73,0.08)", color: RED,
                  border: `1.5px solid rgba(248,81,73,0.35)`, borderRadius: 8,
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                  flexShrink: 0, marginLeft: 12,
                  minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}>Request deletion</button>
              </div>
            </div>

            <div style={{
              background: SURFACE, borderRadius: 14, padding: 20,
              border: `1.5px solid rgba(248,81,73,0.3)`, marginBottom: 16,
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: RED, marginBottom: 14 }}>Danger zone</div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: `1px solid rgba(248,81,73,0.15)`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Deactivate account</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Pause your account — reactivate anytime. Your child&#39;s data is preserved.</div>
                </div>
                <button style={{
                  padding: "8px 16px", background: "rgba(248,81,73,0.08)", color: RED,
                  border: `1.5px solid rgba(248,81,73,0.35)`, borderRadius: 8,
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                  flexShrink: 0, marginLeft: 12,
                  minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}>Deactivate</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Permanently delete account</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>All data deleted after 90-day grace period. 2-step confirmation required.</div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  style={{
                    padding: "8px 16px", background: "rgba(248,81,73,0.08)", color: RED,
                    border: `1.5px solid rgba(248,81,73,0.35)`, borderRadius: 8,
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                    flexShrink: 0, marginLeft: 12,
                  }}
                >Delete account</button>
              </div>
            </div>

            {deleteConfirm && (
              <div style={{
                background: SURFACE, borderRadius: 14, padding: 20,
                border: `1.5px solid rgba(248,81,73,0.3)`,
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: RED, marginBottom: 8 }}>Delete your account?</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                  Your account will be scheduled for deletion. Your children&#39;s learning progress will be preserved for{" "}
                  <strong style={{ color: TEXT }}>90 days</strong> — you can reactivate within that time to restore everything.
                </div>
                <div style={{
                  background: "rgba(245,158,11,0.08)", borderRadius: 10, padding: "12px 14px",
                  fontSize: 12, color: AMBER, marginBottom: 14, lineHeight: 1.5,
                  border: `1px solid rgba(245,158,11,0.2)`,
                }}>
                  After 90 days, all data is permanently deleted and cannot be recovered.
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
                      flex: 1, padding: 12,
                      background: deleteChecked ? RED : "rgba(248,81,73,0.2)",
                      color: "#fff", border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 700, fontFamily: "system-ui",
                      cursor: deleteChecked ? "pointer" : "not-allowed",
                      opacity: deleteChecked ? 1 : 0.6,
                      minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >Yes, delete my account</button>
                  <button
                    onClick={() => { setDeleteConfirm(false); setDeleteChecked(false); }}
                    style={{
                      flex: 1, padding: 12, background: "rgba(255,255,255,0.06)",
                      color: MUTED, border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 700, fontFamily: "system-ui", cursor: "pointer",
                      minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PIN Reset Modal ── */}
      {pinResetChildId && (
        <div
          onClick={() => { setPinResetChildId(null); setPinResetValue(""); }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: SURFACE,
              border: `1px solid rgba(155,114,255,0.3)`,
              borderRadius: 18,
              padding: "28px 28px 24px",
              width: 320,
              maxWidth: "90vw",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginBottom: 6 }}>
              Reset PIN — {pinResetChildName}
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
              Enter a new 4-digit PIN for {pinResetChildName}&#39;s account. They will use this to sign in on their device.
            </div>

            {pinResetSuccess ? (
              <div style={{
                background: "rgba(80,232,144,0.1)", border: `1px solid rgba(80,232,144,0.3)`,
                borderRadius: 10, padding: "12px 14px", fontSize: 14, fontWeight: 700,
                color: "#50e890", textAlign: "center" as const,
              }}>
                PIN updated!
              </div>
            ) : (
              <>
                {pinResetError && (
                  <div style={{
                    background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                    borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 14,
                  }}>{pinResetError}</div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 8 }}>
                    New 4-digit PIN
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={pinResetValue}
                    autoFocus
                    onChange={(e) => setPinResetValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    onKeyDown={(e) => e.key === "Enter" && submitResetChildPin()}
                    style={{
                      width: "100%",
                      background: SURFACE2,
                      border: `1.5px solid rgba(155,114,255,0.4)`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: 20,
                      fontWeight: 800,
                      color: TEXT,
                      fontFamily: "system-ui",
                      outline: "none",
                      letterSpacing: "0.35em",
                      boxSizing: "border-box" as const,
                      textAlign: "center" as const,
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    disabled={pinResetSaving || pinResetValue.length !== 4}
                    onClick={submitResetChildPin}
                    style={{
                      flex: 1, padding: 12,
                      background: pinResetValue.length === 4 ? VIOLET : "rgba(155,114,255,0.3)",
                      color: "#fff", border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 700, fontFamily: "system-ui",
                      cursor: pinResetValue.length === 4 ? "pointer" : "not-allowed",
                      opacity: pinResetSaving ? 0.6 : 1,
                      minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {pinResetSaving ? "Saving..." : "Set PIN"}
                  </button>
                  <button
                    onClick={() => { setPinResetChildId(null); setPinResetValue(""); setPinResetError(null); }}
                    style={{
                      flex: 1, padding: 12, background: "rgba(255,255,255,0.06)",
                      color: MUTED, border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 700, fontFamily: "system-ui", cursor: "pointer",
                      minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Band edit modal ── */}
      {bandChildId && (
        <div
          onClick={() => { setBandChildId(null); setBandError(null); }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: SURFACE,
              border: `1px solid rgba(255,209,102,0.3)`,
              borderRadius: 18,
              padding: "28px 28px 24px",
              width: 360,
              maxWidth: "92vw",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginBottom: 6 }}>
              Grade level — {bandChildName}
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
              Pick the level that matches where {bandChildName} is right now. Questions and difficulty will update on their next quiz.
            </div>

            {bandSuccess ? (
              <div style={{
                background: "rgba(80,232,144,0.1)", border: `1px solid rgba(80,232,144,0.3)`,
                borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700,
                color: "#50e890", textAlign: "center" as const,
              }}>
                ✅ Grade level updated!
              </div>
            ) : (
              <>
                {bandError && (
                  <div style={{
                    background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                    borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 14,
                  }}>{bandError}</div>
                )}

                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 20 }}>
                  {([
                    { code: "PREK", label: "Pre-K",         ages: "Ages 3–5",  desc: "Letters, counting, shapes, colors" },
                    { code: "K1",   label: "Kindergarten – Grade 1", ages: "Ages 5–7",  desc: "Phonics, first words, simple addition" },
                    { code: "G23",  label: "Grade 2 – 3",   ages: "Ages 7–9",  desc: "Reading, multiplication, problem solving" },
                    { code: "G45",  label: "Grade 4 – 5",   ages: "Ages 9–11", desc: "Complex math, comprehension, reasoning" },
                  ] as const).map((band) => {
                    const isSelected = bandSelected === band.code;
                    return (
                      <button
                        key={band.code}
                        onClick={() => setBandSelected(band.code)}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "12px 14px",
                          background: isSelected ? "rgba(255,209,102,0.1)" : "rgba(255,255,255,0.03)",
                          border: isSelected ? `2px solid ${GOLD}` : `1.5px solid rgba(255,255,255,0.08)`,
                          borderRadius: 12, cursor: "pointer", textAlign: "left" as const,
                          fontFamily: "system-ui", width: "100%",
                          transition: "all 0.15s",
                          minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                          border: `2px solid ${isSelected ? GOLD : "rgba(255,255,255,0.2)"}`,
                          background: isSelected ? GOLD : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a0800" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? GOLD : TEXT }}>
                            {band.label}
                          </div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                            {band.ages} · {band.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    disabled={bandSaving}
                    onClick={submitBandUpdate}
                    style={{
                      flex: 1, padding: 12,
                      background: `linear-gradient(135deg, ${GOLD}, #e8a000)`,
                      color: "#1a0800", border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 800, fontFamily: "system-ui",
                      cursor: bandSaving ? "not-allowed" : "pointer",
                      opacity: bandSaving ? 0.6 : 1,
                      minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {bandSaving ? "Saving..." : "Save grade level"}
                  </button>
                  <button
                    onClick={() => { setBandChildId(null); setBandError(null); }}
                    style={{
                      flex: 1, padding: 12, background: "rgba(255,255,255,0.06)",
                      color: MUTED, border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 700, fontFamily: "system-ui", cursor: "pointer",
                      minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppFrame>
  );
}
