"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", coral: "#ff7b6b", gold: "#ffd166",
};

type Teacher = {
  id: string;
  display_name: string;
  username: string;
  email: string | null;
  school_name: string | null;
  grade_levels: string[];
  class_code: string | null;
  tester_flag: boolean;
  has_google: boolean;
  has_password: boolean;
  student_count: number;
  last_active_at: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function OwnerTeachersPage() {
  const [tab, setTab] = useState<"list" | "add">("list");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ displayName: "", email: "", schoolName: "", password: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add teacher form
  const [addForm, setAddForm] = useState({ displayName: "", username: "", email: "", schoolName: "", password: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  const loadTeachers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/teachers");
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load");
      const data = await res.json();
      setTeachers(data.teachers);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load teachers"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadTeachers(); }, [loadTeachers]);

  function startEdit(t: Teacher) {
    setEditId(t.id);
    setEditForm({ displayName: t.display_name, email: t.email ?? "", schoolName: t.school_name ?? "", password: "" });
    setEditError("");
  }

  async function saveEdit(id: string) {
    setEditSaving(true); setEditError("");
    try {
      const body: Record<string, string> = { displayName: editForm.displayName, email: editForm.email, schoolName: editForm.schoolName };
      if (editForm.password) body.password = editForm.password;
      const res = await fetch(`/api/admin/teachers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      setEditId(null);
      await loadTeachers();
    } catch (e) { setEditError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setEditSaving(false); }
  }

  async function deleteTeacher(id: string, name: string) {
    if (!confirm(`Delete teacher "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to delete");
      await loadTeachers();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to delete"); }
    finally { setDeletingId(null); }
  }

  async function addTeacher() {
    setAddSaving(true); setAddError(""); setAddSuccess(false);
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: addForm.displayName, username: addForm.username, email: addForm.email, schoolName: addForm.schoolName, password: addForm.password }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create");
      setAddSuccess(true);
      setAddForm({ displayName: "", username: "", email: "", schoolName: "", password: "" });
      await loadTeachers();
      setTimeout(() => setTab("list"), 1200);
    } catch (e) { setAddError(e instanceof Error ? e.message : "Failed to create teacher"); }
    finally { setAddSaving(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 14, outline: "none",
  };
  const btnViolet: React.CSSProperties = {
    background: C.violet, color: "#fff", border: "none", borderRadius: 8,
    padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
  };
  const btnGhost: React.CSSProperties = {
    background: "transparent", color: C.muted, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer",
  };
  const btnCoral: React.CSSProperties = { ...btnGhost, color: C.coral, borderColor: "rgba(255,123,107,0.3)" };

  return (
    <AppFrame>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Link href="/owner" style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>← Owner</Link>
          <span style={{ color: C.muted, fontSize: 13 }}>/</span>
          <span style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>Teachers</span>
        </div>

        {/* Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, padding: "16px 20px 0", borderBottom: `1px solid ${C.border}` }}>
            {(["list", "add"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? C.violet : "transparent",
                color: tab === t ? "#fff" : C.muted,
                border: "none", borderRadius: "8px 8px 0 0", padding: "8px 18px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                {t === "list" ? `All Teachers${teachers.length ? ` (${teachers.length})` : ""}` : "Add Teacher"}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {/* ── List tab ── */}
            {tab === "list" && (
              <>
                {loading && <p style={{ color: C.muted, fontSize: 13 }}>Loading…</p>}
                {error && <p style={{ color: C.coral, fontSize: 13 }}>{error}</p>}
                {!loading && !error && teachers.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <p style={{ color: C.muted, fontSize: 14, marginBottom: 12 }}>No teachers yet.</p>
                    <button style={btnViolet} onClick={() => setTab("add")}>Add first teacher →</button>
                  </div>
                )}
                {!loading && teachers.length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ color: C.muted, textAlign: "left" }}>
                          {["Name", "Username", "Email", "School", "Students", "Last Active", "Auth", ""].map(h => (
                            <th key={h} style={{ padding: "6px 10px", fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.map(t => (
                          <>
                            <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                              <td style={{ padding: "10px 10px", color: C.text, fontWeight: 600 }}>{t.display_name}</td>
                              <td style={{ padding: "10px 10px", color: C.muted, fontFamily: "monospace" }}>{t.username}</td>
                              <td style={{ padding: "10px 10px", color: C.muted }}>{t.email ?? "—"}</td>
                              <td style={{ padding: "10px 10px", color: C.muted }}>{t.school_name ?? "—"}</td>
                              <td style={{ padding: "10px 10px", color: C.text }}>{String(t.student_count)}</td>
                              <td style={{ padding: "10px 10px", color: C.muted }}>{fmtDate(t.last_active_at)}</td>
                              <td style={{ padding: "10px 10px" }}>
                                <span style={{ fontSize: 11, marginRight: 4 }}>{t.has_google ? "🔗 Google" : ""}</span>
                                <span style={{ fontSize: 11 }}>{t.has_password ? "🔑 Pass" : ""}</span>
                              </td>
                              <td style={{ padding: "10px 10px", whiteSpace: "nowrap" }}>
                                <button style={{ ...btnGhost, marginRight: 6, fontSize: 12 }} onClick={() => editId === t.id ? setEditId(null) : startEdit(t)}>
                                  {editId === t.id ? "Cancel" : "Edit"}
                                </button>
                                <button style={{ ...btnCoral, fontSize: 12 }} disabled={deletingId === t.id} onClick={() => void deleteTeacher(t.id, t.display_name)}>
                                  {deletingId === t.id ? "…" : "Delete"}
                                </button>
                              </td>
                            </tr>
                            {editId === t.id && (
                              <tr key={`edit-${t.id}`} style={{ background: "rgba(155,114,255,0.05)" }}>
                                <td colSpan={8} style={{ padding: "14px 16px" }}>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                                    <div>
                                      <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Display Name</label>
                                      <input style={inputStyle} value={editForm.displayName} onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))} />
                                    </div>
                                    <div>
                                      <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Email</label>
                                      <input style={inputStyle} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                                    </div>
                                    <div>
                                      <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>School</label>
                                      <input style={inputStyle} value={editForm.schoolName} onChange={e => setEditForm(f => ({ ...f, schoolName: e.target.value }))} />
                                    </div>
                                    <div>
                                      <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>New Password (optional)</label>
                                      <input style={inputStyle} type="password" placeholder="Leave blank to keep" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
                                    </div>
                                  </div>
                                  {editError && <p style={{ color: C.coral, fontSize: 12, marginBottom: 8 }}>{editError}</p>}
                                  <button style={btnViolet} disabled={editSaving} onClick={() => void saveEdit(t.id)}>
                                    {editSaving ? "Saving…" : "Save changes"}
                                  </button>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ── Add tab ── */}
            {tab === "add" && (
              <div style={{ maxWidth: 480 }}>
                {addSuccess && (
                  <div style={{ background: "rgba(80,232,144,0.1)", border: "1px solid rgba(80,232,144,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: C.mint, fontSize: 14 }}>
                    ✓ Teacher created! Switching to list…
                  </div>
                )}
                <div style={{ display: "grid", gap: 14 }}>
                  {[
                    { label: "Display Name *", key: "displayName", placeholder: "Jane Smith", type: "text" },
                    { label: "Username *", key: "username", placeholder: "jsmith (used to log in)", type: "text" },
                    { label: "Password *", key: "password", placeholder: "••••••••", type: "password" },
                    { label: "Email", key: "email", placeholder: "jane@school.edu (optional)", type: "email" },
                    { label: "School Name", key: "schoolName", placeholder: "Lincoln Elementary (optional)", type: "text" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label style={{ color: C.muted, fontSize: 12, display: "block", marginBottom: 5 }}>{label}</label>
                      <input
                        style={inputStyle}
                        type={type}
                        placeholder={placeholder}
                        value={addForm[key as keyof typeof addForm]}
                        onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                {addError && <p style={{ color: C.coral, fontSize: 13, marginTop: 10 }}>{addError}</p>}
                <button
                  style={{ ...btnViolet, marginTop: 18, width: "100%", padding: "11px 0" }}
                  disabled={addSaving || !addForm.displayName || !addForm.username || !addForm.password}
                  onClick={() => void addTeacher()}
                >
                  {addSaving ? "Creating…" : "Create Teacher"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
