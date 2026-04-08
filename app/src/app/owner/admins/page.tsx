"use client";

import { useEffect, useState } from "react";

const C = {
  bg: "#06071a",
  surface: "#0e1029",
  card: "#12152e",
  border: "rgba(255,255,255,0.07)",
  violet: "#9b72ff",
  teal: "#2dd4bf",
  text: "#f1f5f9",
  muted: "rgba(241,245,249,0.52)",
  red: "#fb7185",
  green: "#4ade80",
  amber: "#fbbf24",
} as const;

type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  inviteAcceptedAt: string | null;
};

const inputStyle: React.CSSProperties = {
  background: "#0e1029",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 8,
  padding: "0.5rem 0.7rem",
  color: "#f1f5f9",
  fontSize: "0.875rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function RoleBadge({ role }: { role: string }) {
  const sup = role === "super_admin";
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600, background: sup ? `${C.violet}22` : `${C.teal}22`, color: sup ? C.violet : C.teal, border: `1px solid ${sup ? C.violet : C.teal}44`, letterSpacing: "0.02em" }}>
      {sup ? "Super Admin" : "Admin"}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600, background: isActive ? `${C.green}18` : `${C.amber}18`, color: isActive ? C.green : C.amber, border: `1px solid ${isActive ? C.green : C.amber}44` }}>
      {isActive ? "Active" : "Pending invite"}
    </span>
  );
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Tab = "members" | "invite";

export default function AdminsPage() {
  const [tab, setTab] = useState<Tab>("members");

  // Members tab state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Invite tab state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDisplayName, setInviteDisplayName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "super_admin">("admin");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ inviteUrl: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/admins");
      if (!res.ok) { const d = await res.json(); setLoadError(d.error ?? "Failed to load admins."); return; }
      const d = await res.json();
      setAdmins(d.admins ?? []);
    } catch { setLoadError("Network error. Could not load admins."); }
  }

  async function toggleActive(admin: AdminUser) {
    setTogglingId(admin.id);
    setToggleError(null);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      const d = await res.json();
      if (!res.ok) { setToggleError(d.error ?? "Failed to update admin."); return; }
      fetchAdmins();
    } catch { setToggleError("Network error. Please try again."); }
    finally { setTogglingId(null); }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setInviteResult(null);
    setInviteLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, displayName: inviteDisplayName, role: inviteRole }),
      });
      const d = await res.json();
      if (!res.ok) { setInviteError(d.error ?? "Invite failed."); return; }
      setInviteResult(d);
      setInviteEmail(""); setInviteDisplayName(""); setInviteRole("admin");
      fetchAdmins();
    } catch { setInviteError("Network error. Please try again."); }
    finally { setInviteLoading(false); }
  }

  function copyInviteLink() {
    if (!inviteResult) return;
    navigator.clipboard.writeText(`${window.location.origin}${inviteResult.inviteUrl}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const activeCount = admins.filter(a => a.isActive).length;
  const pendingCount = admins.filter(a => !a.isActive).length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "1.5rem 1rem", color: C.text }}>
      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{ color: C.text, fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>Admin Access</h1>
            <p style={{ color: C.muted, fontSize: "0.83rem", margin: "0.25rem 0 0" }}>
              Manage who has owner-level access to WonderQuest.
            </p>
          </div>
          {/* Stats pill */}
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}33`, borderRadius: 100, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
              {activeCount} active
            </span>
            {pendingCount > 0 && (
              <span style={{ background: `${C.amber}18`, color: C.amber, border: `1px solid ${C.amber}33`, borderRadius: 100, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {([
              { key: "members", label: "Members", count: admins.length },
              { key: "invite",  label: "Invite Admin", count: null },
            ] as { key: Tab; label: string; count: number | null }[]).map(t => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: active ? `2px solid ${C.violet}` : "2px solid transparent",
                    color: active ? C.text : C.muted,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: active ? 600 : 400,
                    padding: "0.75rem 1.25rem",
                    transition: "color .15s",
                  }}
                >
                  {t.label}
                  {t.count !== null && (
                    <span style={{ background: active ? `${C.violet}30` : "rgba(255,255,255,0.08)", color: active ? C.violet : C.muted, borderRadius: 100, fontSize: "0.7rem", fontWeight: 700, padding: "1px 7px" }}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── MEMBERS TAB ───────────────────────────────────────────────── */}
          {tab === "members" && (
            <div>
              {loadError && (
                <div style={{ padding: "0.75rem 1rem", color: C.red, fontSize: "0.83rem", borderBottom: `1px solid ${C.border}` }}>{loadError}</div>
              )}
              {toggleError && (
                <div style={{ padding: "0.55rem 1rem", color: C.red, fontSize: "0.8rem", background: `${C.red}0d`, borderBottom: `1px solid ${C.border}` }}>{toggleError}</div>
              )}

              {!loadError && admins.length === 0 && (
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: C.muted, fontSize: "0.85rem" }}>
                  No admins yet —{" "}
                  <button onClick={() => setTab("invite")} style={{ background: "none", border: "none", color: C.violet, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", padding: 0 }}>
                    send an invite
                  </button>
                </div>
              )}

              {admins.map((admin, i) => (
                <div
                  key={admin.id}
                  style={{
                    padding: "0.9rem 1rem",
                    borderBottom: i < admins.length - 1 ? `1px solid ${C.border}` : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Avatar */}
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${C.violet}22`, display: "flex", alignItems: "center", justifyContent: "center", color: C.violet, fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                    {admin.displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Name / email */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: "0.875rem" }}>{admin.displayName}</div>
                    <div style={{ color: C.muted, fontSize: "0.76rem", marginTop: 1 }}>{admin.email}</div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                    <RoleBadge role={admin.role} />
                    <StatusBadge isActive={admin.isActive} />
                  </div>

                  {/* Last login */}
                  <div style={{ color: C.muted, fontSize: "0.76rem", minWidth: 120, textAlign: "right" }}>
                    {admin.isActive ? `Last login: ${fmt(admin.lastLoginAt)}` : `Invited ${fmt(admin.inviteAcceptedAt)}`}
                  </div>

                  {/* Action */}
                  <button
                    disabled={togglingId === admin.id}
                    onClick={() => void toggleActive(admin)}
                    style={{
                      background: "transparent",
                      border: `1px solid ${admin.isActive ? C.red : C.green}55`,
                      borderRadius: 6,
                      padding: "4px 11px",
                      color: admin.isActive ? C.red : C.green,
                      fontSize: "0.75rem",
                      cursor: togglingId === admin.id ? "not-allowed" : "pointer",
                      opacity: togglingId === admin.id ? 0.5 : 1,
                      fontWeight: 500,
                      transition: "opacity .15s",
                      fontFamily: "system-ui,-apple-system,sans-serif",
                    }}
                  >
                    {togglingId === admin.id ? "…" : admin.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── INVITE TAB ────────────────────────────────────────────────── */}
          {tab === "invite" && (
            <div style={{ padding: "1.25rem" }}>

              {/* Success — invite link */}
              {inviteResult && (
                <div style={{ background: `${C.teal}10`, border: `1px solid ${C.teal}44`, borderRadius: 10, padding: "1rem", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.6rem" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={C.teal}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <span style={{ color: C.teal, fontSize: "0.85rem", fontWeight: 600 }}>Invite link ready — share this with the admin</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, borderRadius: 7, padding: "0.45rem 0.65rem", border: `1px solid ${C.border}` }}>
                    <code style={{ color: C.text, fontSize: "0.76rem", flex: 1, wordBreak: "break-all", fontFamily: "monospace" }}>
                      {typeof window !== "undefined" ? `${window.location.origin}${inviteResult.inviteUrl}` : inviteResult.inviteUrl}
                    </code>
                    <button
                      onClick={copyInviteLink}
                      style={{ background: copied ? C.green : C.teal, color: "#06071a", border: "none", borderRadius: 5, padding: "4px 11px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "background .2s" }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p style={{ color: C.muted, fontSize: "0.74rem", margin: "0.5rem 0 0" }}>Link expires in 72 hours. The recipient must sign in with the exact Google account tied to that email.</p>
                </div>
              )}

              {/* Error */}
              {inviteError && (
                <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}44`, borderRadius: 8, padding: "0.6rem 0.75rem", color: C.red, fontSize: "0.83rem", marginBottom: "1rem" }}>
                  {inviteError}
                </div>
              )}

              <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ color: C.muted, fontSize: "0.78rem" }}>Email <span style={{ color: C.red }}>*</span></label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      placeholder="admin@example.com"
                      style={inputStyle}
                    />
                    <span style={{ color: C.muted, fontSize: "0.72rem" }}>Must match their Google account</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ color: C.muted, fontSize: "0.78rem" }}>Display Name <span style={{ color: C.red }}>*</span></label>
                    <input
                      type="text"
                      value={inviteDisplayName}
                      onChange={(e) => setInviteDisplayName(e.target.value)}
                      required
                      placeholder="Their name"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", maxWidth: 200 }}>
                  <label style={{ color: C.muted, fontSize: "0.78rem" }}>Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "super_admin")}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: "0.25rem" }}>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    style={{ background: inviteLoading ? `${C.violet}66` : C.violet, color: "#fff", border: "none", borderRadius: 8, padding: "0.55rem 1.4rem", fontSize: "0.875rem", fontWeight: 600, cursor: inviteLoading ? "not-allowed" : "pointer", fontFamily: "system-ui,-apple-system,sans-serif" }}
                  >
                    {inviteLoading ? "Sending…" : "Send invite"}
                  </button>
                  <span style={{ color: C.muted, fontSize: "0.76rem" }}>Invite link expires in 72 hours</span>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
