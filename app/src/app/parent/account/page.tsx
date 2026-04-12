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
type Section = "profile" | "kids" | "notifications";

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
  const [section, setSection] = useState<Section>("profile");

  // Session / real data
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [accountCtx, setAccountCtx] = useState<{
    stateCode: string | null;
    schoolName: string | null;
    isdName: string | null;
    hasPin: boolean;
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

  // School / curriculum editing
  const [editingSchool,  setEditingSchool]  = useState(false);
  const [editStateCode,  setEditStateCode]  = useState("");
  const [editSchoolName, setEditSchoolName] = useState("");
  const [editIsdName,    setEditIsdName]    = useState("");
  const [schoolSaving,   setSchoolSaving]   = useState(false);
  const [schoolSaved,    setSchoolSaved]    = useState(false);
  const [schoolError,    setSchoolError]    = useState<string | null>(null);

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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState<string | null>(null);

  // Accordion state for sub-sections
  const [securityOpen, setSecurityOpen] = useState(false);
  const [dangerOpen,   setDangerOpen]   = useState(false);

  async function handleDeleteAccount() {
    if (!deleteChecked) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const res = await fetch("/api/parent/delete-account", { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/";
    } else {
      const data = await res.json() as { error?: string };
      setDeleteError(data.error ?? "Something went wrong. Please try again.");
      setDeleteLoading(false);
    }
  }

  // PIN reset (inline on child card)
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

  // ── School / curriculum save ──────────────────────────────────────────────
  async function saveSchool() {
    setSchoolSaving(true);
    setSchoolError(null);
    try {
      const res = await fetch("/api/parent/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateCode:  editStateCode.trim().toUpperCase() || null,
          schoolName: editSchoolName.trim() || null,
          isdName:    editIsdName.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Save failed.");
      }
      // Refresh context so the displayed values update
      const ctx = await fetch("/api/parent/account-context").then((r) => r.ok ? r.json() : null);
      if (ctx) setAccountCtx(ctx as typeof accountCtx);
      setEditingSchool(false);
      setSchoolSaved(true);
      setTimeout(() => setSchoolSaved(false), 2500);
    } catch (err) {
      setSchoolError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSchoolSaving(false);
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
  const hasPin = accountCtx?.hasPin ?? true; // default true = require current PIN

  async function changePin() {
    setPinError(null);
    if (hasPin && !/^\d{4}$/.test(currentPin)) { setPinError("Current PIN must be 4 digits."); return; }
    if (!/^\d{4}$/.test(newPin))               { setPinError("New PIN must be exactly 4 digits."); return; }
    if (newPin !== confirmPin)                  { setPinError("PINs do not match."); return; }

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

  // ── Reset child PIN (inline) ──────────────────────────────────────────────
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

  // ── Shared style helpers ──────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: SURFACE,
    borderRadius: 14,
    padding: "18px 20px",
    border: `1px solid ${BORDER}`,
    marginBottom: 12,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 10,
    paddingLeft: 2,
  };

  const cardHead: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT,
    marginBottom: 14,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "10px 0",
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

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems: { key: Section; icon: string; label: string }[] = [
    { key: "profile",       icon: "⚙️", label: "My Profile" },
    { key: "kids",          icon: "👧", label: "My Kids" },
    { key: "notifications", icon: "🔔", label: "Notifications" },
  ];

  return (
    <AppFrame audience="parent" currentPath="/parent/account">
      <div style={{
        background: BASE,
        minHeight: "100vh",
        paddingBottom: "env(safe-area-inset-bottom, 32px)",
        fontFamily: "system-ui",
      }}>
        {/* ── Page header ── */}
        <div style={{
          padding: "20px 20px 0",
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: TEXT, margin: 0, paddingBottom: 16 }}>
            Account Settings
          </h1>
        </div>

        {/* ── Layout: sidebar + content ── */}
        <div style={{
          display: "flex",
          gap: 0,
          maxWidth: 900,
          margin: "0 auto",
        }}>
          {/* ── Sidebar nav ── */}
          <nav style={{
            width: 200,
            flexShrink: 0,
            padding: "20px 12px",
            borderRight: `1px solid ${BORDER}`,
            position: "sticky",
            top: 0,
            height: "fit-content",
          }}>
            {navItems.map((item) => {
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    background: active ? "rgba(155,114,255,0.15)" : "transparent",
                    color: active ? VIOLET : MUTED,
                    fontFamily: "system-ui",
                    marginBottom: 2,
                    textAlign: "left",
                    minHeight: 44,
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* ── Main content ── */}
          <main style={{ flex: 1, padding: "20px 20px 40px", minWidth: 0 }}>

            {/* ════════════════════════════════
                MY PROFILE SECTION
            ════════════════════════════════ */}
            {section === "profile" && (
              <div>
                {sessionError && (
                  <div style={{
                    background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                    borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 14,
                  }}>{sessionError}</div>
                )}
                {profileSaved && (
                  <div style={{
                    background: "rgba(34,197,94,0.1)", border: `1px solid rgba(34,197,94,0.3)`,
                    borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700,
                    color: MINT, marginBottom: 14,
                  }}>Profile saved!</div>
                )}
                {profileError && (
                  <div style={{
                    background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                    borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 14,
                  }}>{profileError}</div>
                )}

                {/* Avatar + name header */}
                <div style={{ ...card, display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: `linear-gradient(135deg,${VIOLET},#6040cc)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: loadingSession ? 13 : 20, color: "#fff", fontWeight: 900, flexShrink: 0,
                  }}>
                    {loadingSession ? "..." : initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {loadingSession ? "Loading..." : (editName || guardian?.displayName || "Parent")}
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>@{guardian?.username ?? "..."}</div>
                    <div style={{
                      display: "inline-flex", alignItems: "center",
                      background: "rgba(155,114,255,0.15)", borderRadius: 20, padding: "2px 9px",
                      fontSize: 11, fontWeight: 700, color: VIOLET, marginTop: 4,
                    }}>{editRelationship}</div>
                  </div>
                  <a
                    href="/api/parent/logout"
                    style={{
                      fontSize: 12, fontWeight: 700, color: RED, textDecoration: "none",
                      background: "rgba(248,81,73,0.08)", border: `1.5px solid rgba(248,81,73,0.3)`,
                      borderRadius: 8, padding: "5px 12px", flexShrink: 0,
                      display: "inline-flex", alignItems: "center",
                      minHeight: 36, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    Sign out
                  </a>
                </div>

                {/* Name + relationship editor */}
                <div style={sectionTitle}>Personal info</div>
                <div style={card}>
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

                  {/* Relationship */}
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

                  <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      style={saveBtnStyle(profileSaving)}
                      disabled={profileSaving}
                      onClick={saveProfile}
                    >
                      {profileSaving ? "Saving..." : "Save profile"}
                    </button>
                  </div>
                </div>

                {/* School & curriculum — collapsed accordion */}
                <div style={sectionTitle}>School info</div>
                <div style={{
                  ...card,
                  padding: 0,
                  overflow: "hidden",
                }}>
                  <button
                    onClick={() => {
                      if (!editingSchool) {
                        setEditStateCode(accountCtx?.stateCode ?? "");
                        setEditSchoolName(accountCtx?.schoolName ?? "");
                        setEditIsdName(accountCtx?.isdName ?? "");
                        setEditingSchool(true);
                      } else {
                        setEditingSchool(false);
                        setSchoolError(null);
                      }
                    }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "14px 18px",
                      background: "transparent", border: "none", cursor: "pointer",
                      fontFamily: "system-ui", textAlign: "left",
                      minHeight: 48, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>School &amp; Curriculum</span>
                      {accountCtx?.stateCode && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: MUTED,
                          background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 8px",
                        }}>{accountCtx.stateCode}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: VIOLET, fontWeight: 700 }}>
                      {editingSchool ? "Cancel" : "Edit"}
                    </span>
                  </button>

                  {editingSchool && (
                    <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${BORDER}` }}>
                      {schoolSaved && (
                        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: MINT, margin: "14px 0 10px" }}>
                          School info saved!
                        </div>
                      )}
                      {schoolError && (
                        <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, margin: "14px 0 10px" }}>
                          {schoolError}
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>State (2-letter code)</div>
                          <input
                            style={inputStyle}
                            value={editStateCode}
                            onChange={(e) => setEditStateCode(e.target.value.slice(0, 2))}
                            placeholder="e.g. TX"
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>School name</div>
                          <input
                            style={inputStyle}
                            value={editSchoolName}
                            onChange={(e) => setEditSchoolName(e.target.value)}
                            placeholder="e.g. Lincoln Elementary"
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>ISD / District</div>
                          <input
                            style={inputStyle}
                            value={editIsdName}
                            onChange={(e) => setEditIsdName(e.target.value)}
                            placeholder="e.g. Austin ISD"
                          />
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button style={saveBtnStyle(schoolSaving)} disabled={schoolSaving} onClick={saveSchool}>
                            {schoolSaving ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => { setEditingSchool(false); setSchoolError(null); }}
                            style={{ padding: "9px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.1)", background: "transparent", color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui", minHeight: 44, touchAction: "manipulation" }}
                          >Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!editingSchool && accountCtx && (
                    <div style={{ padding: "0 18px 14px", borderTop: `1px solid ${BORDER}` }}>
                      {accountCtx.resolution && accountCtx.stateCode ? (
                        <div style={{ ...rowStyle, paddingTop: 12 }}>
                          <span style={labelStyle}>Curriculum</span>
                          <div style={{ flex: 1 }}>
                            <span style={{ display: "inline-block", fontWeight: 700, fontSize: 13, color: accountCtx.resolution.framework.color, background: `${accountCtx.resolution.framework.color}18`, border: `1.5px solid ${accountCtx.resolution.framework.color}35`, borderRadius: 8, padding: "3px 10px" }}>
                              {accountCtx.resolution.framework.shortName}
                            </span>
                            <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>
                              {accountCtx.resolution.source === "isd" ? `via ${accountCtx.resolution.sourceLabel}` : accountCtx.resolution.sourceLabel}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: "12px 0", fontSize: 12, color: MUTED }}>
                          No state set — click Edit to add your state for curriculum alignment.
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
                    </div>
                  )}
                </div>

                {/* Security — accordion */}
                <div style={sectionTitle}>Security</div>
                <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                  <button
                    onClick={() => setSecurityOpen((v) => !v)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "14px 18px",
                      background: "transparent", border: "none", cursor: "pointer",
                      fontFamily: "system-ui", textAlign: "left",
                      minHeight: 48, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
                      {hasPin ? "Change parent PIN" : "Set parent PIN"}
                    </span>
                    <span style={{ fontSize: 18, color: MUTED, lineHeight: 1 }}>{securityOpen ? "−" : "+"}</span>
                  </button>

                  {securityOpen && (
                    <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: "14px 0 16px" }}>
                        {hasPin
                          ? "Your 4-digit PIN is used to switch into your parent view from a child device."
                          : "Set a 4-digit PIN to access your parent view from a child device."}
                      </div>

                      {pinSaved && (
                        <div style={{
                          background: "rgba(34,197,94,0.1)", border: `1px solid rgba(34,197,94,0.3)`,
                          borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700,
                          color: MINT, marginBottom: 14,
                        }}>PIN updated successfully!</div>
                      )}
                      {pinError && (
                        <div style={{
                          background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                          borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 14,
                        }}>{pinError}</div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 300 }}>
                        {hasPin && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Current PIN</div>
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
                        )}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>New PIN</div>
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
                          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Confirm new PIN</div>
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
                          {pinSaving ? "Saving…" : hasPin ? "Update PIN" : "Set PIN"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Danger zone — accordion */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ ...card, padding: 0, overflow: "hidden", border: dangerOpen ? `1.5px solid rgba(248,81,73,0.25)` : `1px solid ${BORDER}` }}>
                    <button
                      onClick={() => setDangerOpen((v) => !v)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "14px 18px",
                        background: "transparent", border: "none", cursor: "pointer",
                        fontFamily: "system-ui", textAlign: "left",
                        minHeight: 48, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700, color: dangerOpen ? RED : MUTED }}>Danger zone</span>
                      <span style={{ fontSize: 18, color: MUTED, lineHeight: 1 }}>{dangerOpen ? "−" : "+"}</span>
                    </button>

                    {dangerOpen && (
                      <div style={{ borderTop: `1px solid rgba(248,81,73,0.15)` }}>
                        {/* Data section */}
                        <div style={{ padding: "14px 18px", borderBottom: `1px solid rgba(248,81,73,0.1)` }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Your data</div>
                          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
                            You have the right to download or request deletion of all data associated with your account and linked children&#39;s profiles (GDPR / CCPA).
                          </div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button style={{
                              padding: "8px 14px", background: "rgba(155,114,255,0.1)", color: VIOLET,
                              border: `1.5px solid rgba(155,114,255,0.3)`, borderRadius: 8,
                              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                              minHeight: 40, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                            }}>Request export</button>
                            <button style={{
                              padding: "8px 14px", background: "rgba(248,81,73,0.08)", color: RED,
                              border: `1.5px solid rgba(248,81,73,0.3)`, borderRadius: 8,
                              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                              minHeight: 40, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                            }}>Request data deletion</button>
                          </div>
                        </div>

                        {/* Delete account */}
                        <div style={{ padding: "14px 18px" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Permanently delete account</div>
                          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
                            All data deleted after a 90-day grace period. Your children&#39;s learning progress is preserved during that window.
                          </div>

                          {!deleteConfirm ? (
                            <button
                              onClick={() => setDeleteConfirm(true)}
                              style={{
                                padding: "9px 18px", background: "rgba(248,81,73,0.08)", color: RED,
                                border: `1.5px solid rgba(248,81,73,0.35)`, borderRadius: 8,
                                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                                minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                              }}
                            >Delete account</button>
                          ) : (
                            <div style={{
                              background: "rgba(248,81,73,0.05)",
                              border: `1.5px solid rgba(248,81,73,0.25)`,
                              borderRadius: 12, padding: "14px 16px",
                            }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: RED, marginBottom: 6 }}>Delete your account?</div>
                              <div style={{
                                background: "rgba(245,158,11,0.08)", borderRadius: 10, padding: "10px 12px",
                                fontSize: 12, color: AMBER, marginBottom: 12, lineHeight: 1.5,
                                border: `1px solid rgba(245,158,11,0.2)`,
                              }}>
                                After 90 days, all data is permanently deleted and cannot be recovered.
                              </div>
                              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 12 }}>
                                <input
                                  type="checkbox"
                                  checked={deleteChecked}
                                  onChange={(e) => setDeleteChecked(e.target.checked)}
                                  style={{ marginTop: 2 }}
                                />
                                <span style={{ fontSize: 13, color: MUTED }}>I understand my account will be deleted after 90 days</span>
                              </label>
                              {deleteError && (
                                <p style={{ fontSize: 12, color: RED, margin: "0 0 8px" }}>{deleteError}</p>
                              )}
                              <div style={{ display: "flex", gap: 10 }}>
                                <button
                                  disabled={!deleteChecked || deleteLoading}
                                  onClick={() => void handleDeleteAccount()}
                                  style={{
                                    flex: 1, padding: 11,
                                    background: deleteChecked ? RED : "rgba(248,81,73,0.2)",
                                    color: "#fff", border: "none", borderRadius: 10,
                                    fontSize: 13, fontWeight: 700, fontFamily: "system-ui",
                                    cursor: deleteChecked && !deleteLoading ? "pointer" : "not-allowed",
                                    opacity: deleteChecked && !deleteLoading ? 1 : 0.6,
                                    minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                                  }}
                                >{deleteLoading ? "Deleting…" : "Yes, delete my account"}</button>
                                <button
                                  onClick={() => { setDeleteConfirm(false); setDeleteChecked(false); setDeleteError(null); }}
                                  style={{
                                    flex: 1, padding: 11, background: "rgba(255,255,255,0.06)",
                                    color: MUTED, border: "none", borderRadius: 10,
                                    fontSize: 13, fontWeight: 700, fontFamily: "system-ui", cursor: "pointer",
                                    minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                                  }}
                                >Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                MY KIDS SECTION
            ════════════════════════════════ */}
            {section === "kids" && (
              <div>
                {loadingSession ? (
                  <div style={{ fontSize: 14, color: MUTED, padding: "20px 0" }}>Loading kids...</div>
                ) : linkedChildren.length === 0 ? (
                  <div style={{ ...card, textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>👧</div>
                    <div style={{ fontSize: 14, color: MUTED, marginBottom: 14 }}>No children linked yet.</div>
                    <a href="/parent/link" style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "9px 20px", borderRadius: 10,
                      background: VIOLET, color: "#fff",
                      fontSize: 13, fontWeight: 700, textDecoration: "none",
                    }}>Link a child account →</a>
                  </div>
                ) : (
                  linkedChildren.map((child) => {
                    const isResettingPin = pinResetChildId === child.id;
                    return (
                      <div key={child.id} style={card}>
                        {/* Child header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 13,
                            background: "rgba(155,114,255,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24, flexShrink: 0,
                            border: `1.5px solid rgba(155,114,255,0.25)`,
                          }}>
                            {avatarEmoji(child.avatarKey)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{child.displayName}</div>
                            <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>@{child.username}</div>
                            <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                              <span style={{
                                background: "rgba(155,114,255,0.14)", color: VIOLET,
                                borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700,
                              }}>{bandLabel(child.launchBandCode)}</span>
                              <span style={{
                                background: "rgba(255,209,102,0.12)", color: GOLD,
                                borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700,
                              }}>Level {child.currentLevel}</span>
                              <span style={{
                                background: "rgba(80,232,144,0.1)", color: "#50e890",
                                borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700,
                              }}>⭐ {child.totalPoints.toLocaleString()}</span>
                            </div>
                          </div>
                          <a
                            href={`/parent?studentId=${child.id}`}
                            style={{
                              padding: "7px 12px",
                              background: "rgba(255,255,255,0.05)",
                              border: `1.5px solid rgba(255,255,255,0.1)`,
                              borderRadius: 8, fontSize: 12, fontWeight: 700,
                              color: MUTED, textDecoration: "none",
                              display: "inline-flex", alignItems: "center",
                              minHeight: 36, flexShrink: 0,
                              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            Dashboard →
                          </a>
                        </div>

                        {/* Action row */}
                        <div style={{
                          display: "flex", gap: 8, flexWrap: "wrap",
                          borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: 12,
                        }}>
                          <button
                            onClick={() => {
                              if (isResettingPin) {
                                setPinResetChildId(null);
                                setPinResetValue("");
                                setPinResetError(null);
                              } else {
                                openPinResetModal(child.id, child.displayName);
                              }
                            }}
                            style={{
                              padding: "7px 14px",
                              background: isResettingPin ? "rgba(155,114,255,0.2)" : "rgba(155,114,255,0.1)",
                              border: `1.5px solid ${isResettingPin ? VIOLET : "rgba(155,114,255,0.25)"}`,
                              borderRadius: 8, fontSize: 12, fontWeight: 700,
                              color: VIOLET, cursor: "pointer", fontFamily: "system-ui",
                              minHeight: 38, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            {isResettingPin ? "✕ Cancel" : "🔑 Reset PIN"}
                          </button>
                          <button
                            onClick={() => openBandModal(child.id, child.displayName, child.launchBandCode)}
                            style={{
                              padding: "7px 14px",
                              background: "rgba(255,209,102,0.08)",
                              border: `1.5px solid rgba(255,209,102,0.22)`,
                              borderRadius: 8, fontSize: 12, fontWeight: 700,
                              color: GOLD, cursor: "pointer", fontFamily: "system-ui",
                              minHeight: 38, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            ✏️ Grade level
                          </button>
                        </div>

                        {/* Inline PIN reset panel */}
                        {isResettingPin && (
                          <div style={{
                            marginTop: 12,
                            background: "rgba(155,114,255,0.07)",
                            border: `1.5px solid rgba(155,114,255,0.25)`,
                            borderRadius: 12,
                            padding: "16px 16px 14px",
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
                              New PIN for {child.displayName}
                            </div>

                            {pinResetSuccess ? (
                              <div style={{
                                background: "rgba(80,232,144,0.1)", border: `1px solid rgba(80,232,144,0.3)`,
                                borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700,
                                color: "#50e890", textAlign: "center",
                              }}>
                                PIN updated!
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                                <div style={{ flex: 1 }}>
                                  {pinResetError && (
                                    <div style={{
                                      fontSize: 12, color: RED, marginBottom: 6,
                                    }}>{pinResetError}</div>
                                  )}
                                  <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="Enter 4-digit PIN"
                                    value={pinResetValue}
                                    autoFocus
                                    onChange={(e) => setPinResetValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                    onKeyDown={(e) => e.key === "Enter" && submitResetChildPin()}
                                    style={{
                                      width: "100%",
                                      background: SURFACE2,
                                      border: `1.5px solid rgba(155,114,255,0.45)`,
                                      borderRadius: 8,
                                      padding: "9px 12px",
                                      fontSize: 20,
                                      fontWeight: 800,
                                      color: TEXT,
                                      fontFamily: "system-ui",
                                      outline: "none",
                                      letterSpacing: "0.3em",
                                      boxSizing: "border-box",
                                      textAlign: "center",
                                    }}
                                  />
                                </div>
                                <button
                                  disabled={pinResetSaving || pinResetValue.length !== 4}
                                  onClick={submitResetChildPin}
                                  style={{
                                    padding: "9px 18px",
                                    background: pinResetValue.length === 4 ? VIOLET : "rgba(155,114,255,0.3)",
                                    color: "#fff", border: "none", borderRadius: 8,
                                    fontSize: 13, fontWeight: 700, fontFamily: "system-ui",
                                    cursor: pinResetValue.length === 4 && !pinResetSaving ? "pointer" : "not-allowed",
                                    opacity: pinResetSaving ? 0.6 : 1,
                                    minHeight: 44, flexShrink: 0,
                                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {pinResetSaving ? "Saving..." : "Save PIN"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Add another child CTA */}
                {linkedChildren.length > 0 && (
                  <div style={{
                    padding: "14px 18px",
                    background: "rgba(155,114,255,0.05)",
                    border: `1.5px dashed rgba(155,114,255,0.25)`,
                    borderRadius: 14, textAlign: "center",
                  }}>
                    <a
                      href="/parent/link"
                      style={{ fontSize: 13, fontWeight: 700, color: VIOLET, textDecoration: "none" }}
                    >
                      + Add another child
                    </a>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
                      Link an additional child account to your guardian profile
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════
                NOTIFICATIONS SECTION
            ════════════════════════════════ */}
            {section === "notifications" && (
              <div>
                {notifSaved && (
                  <div style={{
                    background: "rgba(34,197,94,0.1)", border: `1px solid rgba(34,197,94,0.3)`,
                    borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700,
                    color: MINT, marginBottom: 14,
                  }}>Notification preferences saved!</div>
                )}
                {notifError && (
                  <div style={{
                    background: "rgba(248,81,73,0.1)", border: `1px solid rgba(248,81,73,0.3)`,
                    borderRadius: 10, padding: "10px 14px", fontSize: 13, color: RED, marginBottom: 14,
                  }}>{notifError}</div>
                )}

                <div style={sectionTitle}>Email notifications</div>
                <div style={card}>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>
                    Choose which updates you receive by email.
                  </div>

                  {(
                    [
                      {
                        key: "weeklyReports" as const,
                        icon: "📊",
                        label: "Weekly progress reports",
                        desc: "A summary of your child's learning progress every week.",
                      },
                      {
                        key: "milestoneNotifications" as const,
                        icon: "🏆",
                        label: "Milestone notifications",
                        desc: "Get notified when your child earns a badge or trophy.",
                      },
                      {
                        key: "teacherMessages" as const,
                        icon: "💬",
                        label: "Teacher messages",
                        desc: "Receive a notification when a teacher sends you a message.",
                      },
                    ] as const
                  ).map((item, i, arr) => (
                    <div
                      key={item.key}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "13px 0",
                        borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setNotifPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
                    >
                      <span style={{
                        fontSize: 22, width: 36, height: 36, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(255,255,255,0.04)", borderRadius: 10,
                        border: `1px solid rgba(255,255,255,0.07)`,
                      }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{item.desc}</div>
                      </div>
                      {/* Toggle */}
                      <div
                        role="switch"
                        aria-checked={notifPrefs[item.key]}
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

          </main>
        </div>
      </div>

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
