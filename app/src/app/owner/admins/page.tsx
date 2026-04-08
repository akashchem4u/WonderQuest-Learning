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

function RoleBadge({ role }: { role: string }) {
  const isSuperAdmin = role === "super_admin";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 100,
        fontSize: "0.72rem",
        fontWeight: 600,
        background: isSuperAdmin ? `${C.violet}22` : `${C.teal}22`,
        color: isSuperAdmin ? C.violet : C.teal,
        border: `1px solid ${isSuperAdmin ? C.violet : C.teal}44`,
        letterSpacing: "0.02em",
      }}
    >
      {isSuperAdmin ? "Super Admin" : "Admin"}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 100,
        fontSize: "0.72rem",
        fontWeight: 600,
        background: isActive ? `${C.green}18` : `${C.amber}18`,
        color: isActive ? C.green : C.amber,
        border: `1px solid ${isActive ? C.green : C.amber}44`,
      }}
    >
      {isActive ? "Active" : "Pending invite"}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDisplayName, setInviteDisplayName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "super_admin">("admin");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ inviteUrl: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/admins");
      if (!res.ok) {
        const data = await res.json();
        setLoadError(data.error ?? "Failed to load admins.");
        return;
      }
      const data = await res.json();
      setAdmins(data.admins ?? []);
    } catch {
      setLoadError("Network error. Could not load admins.");
    }
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
        body: JSON.stringify({
          email: inviteEmail,
          displayName: inviteDisplayName,
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error ?? "Invite failed.");
        return;
      }
      setInviteResult(data);
      setInviteEmail("");
      setInviteDisplayName("");
      setInviteRole("admin");
      fetchAdmins();
    } catch {
      setInviteError("Network error. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  }

  function copyInviteLink() {
    if (!inviteResult) return;
    const fullUrl = `${window.location.origin}${inviteResult.inviteUrl}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const inputStyle: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "0.5rem 0.7rem",
    color: C.text,
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: "1.5rem 1rem",
        color: C.text,
      }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Header */}
        <div>
          <h1 style={{ color: C.text, fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
            Admin Users
          </h1>
          <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0.3rem 0 0" }}>
            Manage who has owner-level access to WonderQuest.
          </p>
        </div>

        {/* Admin list */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.85rem 1rem",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: C.text, fontWeight: 600, fontSize: "0.9rem" }}>All admins</span>
            <span style={{ color: C.muted, fontSize: "0.8rem" }}>{admins.length} total</span>
          </div>

          {loadError && (
            <div style={{ padding: "1rem", color: C.red, fontSize: "0.85rem" }}>{loadError}</div>
          )}

          {!loadError && admins.length === 0 && (
            <div
              style={{
                padding: "2.5rem 1rem",
                textAlign: "center",
                color: C.muted,
                fontSize: "0.85rem",
              }}
            >
              No admins yet. Create the first one below.
            </div>
          )}

          {admins.map((admin, i) => (
            <div
              key={admin.id}
              style={{
                padding: "0.85rem 1rem",
                borderBottom: i < admins.length - 1 ? `1px solid ${C.border}` : "none",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: `${C.violet}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.violet,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {admin.displayName.charAt(0).toUpperCase()}
              </div>

              {/* Name / email */}
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ color: C.text, fontWeight: 600, fontSize: "0.875rem" }}>
                  {admin.displayName}
                </div>
                <div style={{ color: C.muted, fontSize: "0.78rem" }}>{admin.email}</div>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                <RoleBadge role={admin.role} />
                <StatusBadge isActive={admin.isActive} />
              </div>

              {/* Last login */}
              <div style={{ color: C.muted, fontSize: "0.78rem", minWidth: 120, textAlign: "right" }}>
                {admin.isActive ? (
                  <>Last login: {formatDate(admin.lastLoginAt)}</>
                ) : (
                  <>Invited</>
                )}
              </div>

              {/* Deactivate (coming soon) */}
              <button
                disabled
                title="Coming soon"
                style={{
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: "3px 8px",
                  color: C.muted,
                  fontSize: "0.75rem",
                  cursor: "not-allowed",
                  opacity: 0.5,
                }}
              >
                Deactivate
              </button>
            </div>
          ))}
        </div>

        {/* Invite form */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h2
            style={{
              color: C.text,
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: "0 0 1rem",
            }}
          >
            Invite Admin
          </h2>

          {inviteError && (
            <div
              style={{
                background: `${C.red}18`,
                border: `1px solid ${C.red}44`,
                borderRadius: 8,
                padding: "0.6rem 0.75rem",
                color: C.red,
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              {inviteError}
            </div>
          )}

          {inviteResult && (
            <div
              style={{
                background: `${C.teal}12`,
                border: `1px solid ${C.teal}44`,
                borderRadius: 8,
                padding: "0.75rem",
                marginBottom: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: C.teal, fontSize: "0.85rem", fontWeight: 600 }}>
                Invite created!
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: C.surface,
                  borderRadius: 6,
                  padding: "0.4rem 0.6rem",
                  border: `1px solid ${C.border}`,
                }}
              >
                <code
                  style={{
                    color: C.text,
                    fontSize: "0.78rem",
                    flex: 1,
                    wordBreak: "break-all",
                    fontFamily: "monospace",
                  }}
                >
                  {typeof window !== "undefined"
                    ? `${window.location.origin}${inviteResult.inviteUrl}`
                    : inviteResult.inviteUrl}
                </code>
                <button
                  onClick={copyInviteLink}
                  style={{
                    background: C.teal,
                    color: "#06071a",
                    border: "none",
                    borderRadius: 5,
                    padding: "3px 10px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleInvite}
            style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.65rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ color: C.muted, fontSize: "0.78rem" }}>Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ color: C.muted, fontSize: "0.78rem" }}>Display Name</label>
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

            <div style={{ marginTop: "0.25rem" }}>
              <button
                type="submit"
                disabled={inviteLoading}
                style={{
                  background: inviteLoading ? `${C.violet}66` : C.violet,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.55rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: inviteLoading ? "not-allowed" : "pointer",
                }}
              >
                {inviteLoading ? "Sending…" : "Send invite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
