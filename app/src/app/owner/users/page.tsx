"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", coral: "#ff7b6b", gold: "#ffd166",
};

type Student = {
  id: string; display_name: string; username: string; avatar_key: string | null;
  launch_band_code: string | null; age_label: string | null;
  reading_independence_level: string | null; tester_flag: boolean;
  is_virtual: boolean; last_active_at: string | null;
  guardian_count: number; teacher_count: number; session_count: number;
};

type Family = {
  id: string; display_name: string; email: string | null; username: string;
  relationship_label: string | null; tester_flag: boolean; last_active_at: string | null;
  has_google: boolean; has_password: boolean; child_count: number;
};

type LinkedChild = { id: string; display_name: string; username: string; avatar_key: string | null; age_label: string | null; relationship_label: string };
type LinkedGuardian = { guardian_id: string; display_name: string; email: string | null; username: string; relationship_label: string };

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "7px 11px", color: C.text, fontSize: 13,
  outline: "none", boxSizing: "border-box", width: "100%",
};
const btnViolet: React.CSSProperties = {
  background: C.violet, color: "#fff", border: "none", borderRadius: 8,
  padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  background: "transparent", color: C.muted, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "6px 13px", fontSize: 12, cursor: "pointer",
};
const btnCoral: React.CSSProperties = { ...btnGhost, color: C.coral, borderColor: "rgba(255,123,107,0.3)" };
const btnMint: React.CSSProperties = { ...btnGhost, color: C.mint, borderColor: "rgba(80,232,144,0.3)" };

// ── Merge Modal ────────────────────────────────────────────────────────────────
function MergeModal({
  type, a, b, onClose, onDone,
}: {
  type: "student" | "guardian";
  a: { id: string; display_name: string };
  b: { id: string; display_name: string };
  onClose: () => void;
  onDone: () => void;
}) {
  const [keepId, setKeepId] = useState(a.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mergeId = keepId === a.id ? b.id : a.id;
  const keepName = keepId === a.id ? a.display_name : b.display_name;
  const mergeName = keepId === a.id ? b.display_name : a.display_name;

  async function doMerge() {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, keepId, mergeId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to merge");
      onDone();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to merge"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, maxWidth: 440, width: "90%" }}>
        <h3 style={{ color: C.text, margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>Merge {type === "student" ? "Students" : "Families"}</h3>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
          Choose which profile to <strong style={{ color: C.text }}>keep</strong>. The other will be deleted and all its data merged into the kept profile.
        </p>
        <p style={{ color: C.coral, fontSize: 12, margin: "0 0 16px" }}>⚠️ This is irreversible.</p>
        {[a, b].map(p => (
          <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `1px solid ${keepId === p.id ? C.violet : C.border}`, marginBottom: 8, cursor: "pointer", background: keepId === p.id ? "rgba(155,114,255,0.1)" : "transparent" }}>
            <input type="radio" name="keepId" value={p.id} checked={keepId === p.id} onChange={() => setKeepId(p.id)} style={{ accentColor: C.violet }} />
            <div>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{p.display_name}</div>
              <div style={{ color: C.muted, fontSize: 11, fontFamily: "monospace" }}>{p.id}</div>
            </div>
            {keepId === p.id && <span style={{ marginLeft: "auto", color: C.mint, fontSize: 11, fontWeight: 700 }}>KEEP</span>}
          </label>
        ))}
        {error && <p style={{ color: C.coral, fontSize: 12, margin: "8px 0" }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button style={btnGhost} onClick={onClose}>Cancel</button>
          <button style={{ ...btnCoral, flex: 1, fontWeight: 700 }} disabled={saving} onClick={() => void doMerge()}>
            {saving ? "Merging…" : `Merge "${mergeName}" → "${keepName}"`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Students Tab ───────────────────────────────────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandId, setExpandId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, { displayName: string; ageLabel: string; launchBandCode: string; testerFlag: boolean }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [linkedGuardians, setLinkedGuardians] = useState<Record<string, LinkedGuardian[]>>({});
  const [linkInput, setLinkInput] = useState<Record<string, string>>({});
  const [linkSaving, setLinkSaving] = useState<string | null>(null);
  const [mergeSelected, setMergeSelected] = useState<Set<string>>(new Set());
  const [showMerge, setShowMerge] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/students");
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load");
      setStudents((await res.json()).students);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function expand(s: Student) {
    if (expandId === s.id) { setExpandId(null); return; }
    setExpandId(s.id);
    setEditForm(f => ({
      ...f,
      [s.id]: { displayName: s.display_name, ageLabel: s.age_label ?? "", launchBandCode: s.launch_band_code ?? "", testerFlag: s.tester_flag },
    }));
    setSaveError("");
    // load guardians
    const res = await fetch(`/api/admin/links?studentId=${s.id}`);
    if (res.ok) {
      const data = await res.json();
      setLinkedGuardians(g => ({ ...g, [s.id]: data.links }));
    }
  }

  async function saveStudent(id: string) {
    setSavingId(id); setSaveError("");
    try {
      const f = editForm[id];
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: f.displayName, ageLabel: f.ageLabel, launchBandCode: f.launchBandCode, testerFlag: f.testerFlag }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      await load();
    } catch (e) { setSaveError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSavingId(null); }
  }

  async function unlink(studentId: string, guardianId: string) {
    await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unlink", guardianId, studentId }),
    });
    setLinkedGuardians(g => ({ ...g, [studentId]: (g[studentId] ?? []).filter(x => x.guardian_id !== guardianId) }));
  }

  async function linkGuardian(studentId: string) {
    const guardianId = (linkInput[studentId] ?? "").trim();
    if (!guardianId) return;
    setLinkSaving(studentId);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", guardianId, studentId, relationshipLabel: "parent" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to link");
      setLinkInput(l => ({ ...l, [studentId]: "" }));
      // reload guardians
      const lr = await fetch(`/api/admin/links?studentId=${studentId}`);
      if (lr.ok) {
        const lrData = await lr.json();
        setLinkedGuardians(g => ({ ...g, [studentId]: lrData.links }));
      }
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to link"); }
    finally { setLinkSaving(null); }
  }

  function toggleMerge(id: string) {
    setMergeSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 2) next.add(id);
      return next;
    });
  }

  const filtered = students.filter(s =>
    s.display_name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  const mergeIds = [...mergeSelected];
  const mergeA = students.find(s => s.id === mergeIds[0]);
  const mergeB = students.find(s => s.id === mergeIds[1]);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <input style={{ ...inputStyle, maxWidth: 280 }} placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
        {mergeSelected.size === 2 && (
          <button style={{ ...btnCoral, fontSize: 13 }} onClick={() => setShowMerge(true)}>
            ⚠️ Merge 2 selected
          </button>
        )}
        {mergeSelected.size > 0 && mergeSelected.size < 2 && (
          <span style={{ color: C.muted, fontSize: 12 }}>Select 1 more to merge</span>
        )}
      </div>

      {loading && <p style={{ color: C.muted, fontSize: 13 }}>Loading…</p>}
      {error && <p style={{ color: C.coral, fontSize: 13 }}>{error} <button style={btnGhost} onClick={() => void load()}>Retry</button></p>}
      {!loading && !error && filtered.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>No students found.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: C.muted }}>
                <th style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>☐</th>
                {["Name", "Username", "Band", "Age", "Sessions", "Guardians", "Teachers", "Last Active", ""].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <>
                  <tr key={s.id} style={{ borderBottom: expandId === s.id ? "none" : `1px solid ${C.border}` }}>
                    <td style={{ padding: "9px 8px" }}>
                      <input type="checkbox" checked={mergeSelected.has(s.id)} onChange={() => toggleMerge(s.id)} style={{ accentColor: C.violet }} />
                    </td>
                    <td style={{ padding: "9px 8px", color: C.text, fontWeight: 600 }}>{s.display_name}{s.is_virtual ? <span style={{ color: C.muted, fontSize: 11, marginLeft: 6 }}>virtual</span> : null}</td>
                    <td style={{ padding: "9px 8px", color: C.muted, fontFamily: "monospace" }}>{s.username}</td>
                    <td style={{ padding: "9px 8px", color: C.muted }}>{s.launch_band_code ?? "—"}</td>
                    <td style={{ padding: "9px 8px", color: C.muted }}>{s.age_label ?? "—"}</td>
                    <td style={{ padding: "9px 8px", color: C.text }}>{String(s.session_count)}</td>
                    <td style={{ padding: "9px 8px", color: C.text }}>{String(s.guardian_count)}</td>
                    <td style={{ padding: "9px 8px", color: C.text }}>{String(s.teacher_count)}</td>
                    <td style={{ padding: "9px 8px", color: C.muted }}>{fmtDate(s.last_active_at)}</td>
                    <td style={{ padding: "9px 8px" }}>
                      <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => void expand(s)}>
                        {expandId === s.id ? "Close" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {expandId === s.id && (
                    <tr key={`exp-${s.id}`} style={{ background: "rgba(155,114,255,0.04)", borderBottom: `1px solid ${C.border}` }}>
                      <td colSpan={10} style={{ padding: "14px 16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 10, alignItems: "end" }}>
                          <div>
                            <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Display Name</label>
                            <input style={inputStyle} value={editForm[s.id]?.displayName ?? ""} onChange={e => setEditForm(f => ({ ...f, [s.id]: { ...f[s.id], displayName: e.target.value } }))} />
                          </div>
                          <div>
                            <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Age Label</label>
                            <input style={inputStyle} value={editForm[s.id]?.ageLabel ?? ""} onChange={e => setEditForm(f => ({ ...f, [s.id]: { ...f[s.id], ageLabel: e.target.value } }))} />
                          </div>
                          <div>
                            <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Launch Band</label>
                            <input style={inputStyle} value={editForm[s.id]?.launchBandCode ?? ""} onChange={e => setEditForm(f => ({ ...f, [s.id]: { ...f[s.id], launchBandCode: e.target.value } }))} />
                          </div>
                          <div>
                            <label style={{ color: C.muted, fontSize: 11, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                              <input type="checkbox" checked={editForm[s.id]?.testerFlag ?? false} onChange={e => setEditForm(f => ({ ...f, [s.id]: { ...f[s.id], testerFlag: e.target.checked } }))} style={{ accentColor: C.violet }} />
                              Tester
                            </label>
                          </div>
                        </div>
                        {saveError && <p style={{ color: C.coral, fontSize: 12, marginBottom: 8 }}>{saveError}</p>}
                        <button style={{ ...btnViolet, marginBottom: 16, fontSize: 12 }} disabled={savingId === s.id} onClick={() => void saveStudent(s.id)}>
                          {savingId === s.id ? "Saving…" : "Save changes"}
                        </button>

                        {/* Linked Guardians */}
                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                          <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Linked Guardians</p>
                          {(linkedGuardians[s.id] ?? []).length === 0 ? (
                            <p style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>No linked guardians.</p>
                          ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                              {(linkedGuardians[s.id] ?? []).map(g => (
                                <div key={g.guardian_id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px" }}>
                                  <span style={{ color: C.text, fontSize: 12 }}>{g.display_name}</span>
                                  <span style={{ color: C.muted, fontSize: 11 }}>{g.relationship_label}</span>
                                  <button style={{ ...btnCoral, padding: "2px 8px", fontSize: 11 }} onClick={() => void unlink(s.id, g.guardian_id)}>Unlink</button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              style={{ ...inputStyle, maxWidth: 240, padding: "5px 10px" }}
                              placeholder="Guardian ID to link"
                              value={linkInput[s.id] ?? ""}
                              onChange={e => setLinkInput(l => ({ ...l, [s.id]: e.target.value }))}
                            />
                            <button style={{ ...btnMint, fontSize: 12 }} disabled={linkSaving === s.id} onClick={() => void linkGuardian(s.id)}>
                              {linkSaving === s.id ? "Linking…" : "Link"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showMerge && mergeA && mergeB && (
        <MergeModal
          type="student"
          a={{ id: mergeA.id, display_name: mergeA.display_name }}
          b={{ id: mergeB.id, display_name: mergeB.display_name }}
          onClose={() => setShowMerge(false)}
          onDone={() => { setShowMerge(false); setMergeSelected(new Set()); void load(); }}
        />
      )}
    </div>
  );
}

// ── Families Tab ───────────────────────────────────────────────────────────────
function FamiliesTab() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandId, setExpandId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, { displayName: string; email: string; testerFlag: boolean }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [linkedChildren, setLinkedChildren] = useState<Record<string, LinkedChild[]>>({});
  const [mergeSelected, setMergeSelected] = useState<Set<string>>(new Set());
  const [showMerge, setShowMerge] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/families");
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load");
      setFamilies((await res.json()).families);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function expand(f: Family) {
    if (expandId === f.id) { setExpandId(null); return; }
    setExpandId(f.id);
    setEditForm(ef => ({ ...ef, [f.id]: { displayName: f.display_name, email: f.email ?? "", testerFlag: f.tester_flag } }));
    setSaveError("");
    const res = await fetch(`/api/admin/families/${f.id}`);
    if (res.ok) {
      const data = await res.json();
      setLinkedChildren(c => ({ ...c, [f.id]: data.children }));
    }
  }

  async function saveFamily(id: string) {
    setSavingId(id); setSaveError("");
    try {
      const f = editForm[id];
      const res = await fetch(`/api/admin/families/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: f.displayName, email: f.email, testerFlag: f.testerFlag }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      await load();
    } catch (e) { setSaveError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSavingId(null); }
  }

  async function unlinkChild(guardianId: string, studentId: string) {
    await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unlink", guardianId, studentId }),
    });
    setLinkedChildren(c => ({ ...c, [guardianId]: (c[guardianId] ?? []).filter(x => x.id !== studentId) }));
  }

  function toggleMerge(id: string) {
    setMergeSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 2) next.add(id);
      return next;
    });
  }

  const filtered = families.filter(f =>
    f.display_name.toLowerCase().includes(search.toLowerCase()) ||
    (f.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const mergeIds = [...mergeSelected];
  const mergeA = families.find(f => f.id === mergeIds[0]);
  const mergeB = families.find(f => f.id === mergeIds[1]);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <input style={{ ...inputStyle, maxWidth: 280 }} placeholder="Search families…" value={search} onChange={e => setSearch(e.target.value)} />
        {mergeSelected.size === 2 && (
          <button style={{ ...btnCoral, fontSize: 13 }} onClick={() => setShowMerge(true)}>⚠️ Merge 2 selected</button>
        )}
        {mergeSelected.size > 0 && mergeSelected.size < 2 && (
          <span style={{ color: C.muted, fontSize: 12 }}>Select 1 more to merge</span>
        )}
      </div>

      {loading && <p style={{ color: C.muted, fontSize: 13 }}>Loading…</p>}
      {error && <p style={{ color: C.coral, fontSize: 13 }}>{error} <button style={btnGhost} onClick={() => void load()}>Retry</button></p>}
      {!loading && !error && filtered.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>No families found.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: C.muted }}>
                <th style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>☐</th>
                {["Name", "Email", "Username", "Auth", "Children", "Last Active", "Tester", ""].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <>
                  <tr key={f.id} style={{ borderBottom: expandId === f.id ? "none" : `1px solid ${C.border}` }}>
                    <td style={{ padding: "9px 8px" }}>
                      <input type="checkbox" checked={mergeSelected.has(f.id)} onChange={() => toggleMerge(f.id)} style={{ accentColor: C.violet }} />
                    </td>
                    <td style={{ padding: "9px 8px", color: C.text, fontWeight: 600 }}>{f.display_name}</td>
                    <td style={{ padding: "9px 8px", color: C.muted }}>{f.email ?? "—"}</td>
                    <td style={{ padding: "9px 8px", color: C.muted, fontFamily: "monospace" }}>{f.username}</td>
                    <td style={{ padding: "9px 8px" }}>
                      {f.has_google && <span style={{ fontSize: 11, marginRight: 4 }}>🔗 Google</span>}
                      {f.has_password && <span style={{ fontSize: 11 }}>🔑 Pass</span>}
                      {!f.has_google && !f.has_password && <span style={{ color: C.muted, fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: "9px 8px", color: C.text }}>{String(f.child_count)}</td>
                    <td style={{ padding: "9px 8px", color: C.muted }}>{fmtDate(f.last_active_at)}</td>
                    <td style={{ padding: "9px 8px" }}>
                      {f.tester_flag ? <span style={{ color: C.gold, fontSize: 11 }}>✓ Tester</span> : <span style={{ color: C.muted, fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: "9px 8px" }}>
                      <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => void expand(f)}>
                        {expandId === f.id ? "Close" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {expandId === f.id && (
                    <tr key={`exp-${f.id}`} style={{ background: "rgba(155,114,255,0.04)", borderBottom: `1px solid ${C.border}` }}>
                      <td colSpan={9} style={{ padding: "14px 16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 10, alignItems: "end" }}>
                          <div>
                            <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Display Name</label>
                            <input style={inputStyle} value={editForm[f.id]?.displayName ?? ""} onChange={e => setEditForm(ef => ({ ...ef, [f.id]: { ...ef[f.id], displayName: e.target.value } }))} />
                          </div>
                          <div>
                            <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Email</label>
                            <input style={inputStyle} value={editForm[f.id]?.email ?? ""} onChange={e => setEditForm(ef => ({ ...ef, [f.id]: { ...ef[f.id], email: e.target.value } }))} />
                          </div>
                          <div>
                            <label style={{ color: C.muted, fontSize: 11, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                              <input type="checkbox" checked={editForm[f.id]?.testerFlag ?? false} onChange={e => setEditForm(ef => ({ ...ef, [f.id]: { ...ef[f.id], testerFlag: e.target.checked } }))} style={{ accentColor: C.violet }} />
                              Tester
                            </label>
                          </div>
                        </div>
                        {saveError && <p style={{ color: C.coral, fontSize: 12, marginBottom: 8 }}>{saveError}</p>}
                        <button style={{ ...btnViolet, marginBottom: 16, fontSize: 12 }} disabled={savingId === f.id} onClick={() => void saveFamily(f.id)}>
                          {savingId === f.id ? "Saving…" : "Save changes"}
                        </button>

                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                          <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Linked Children</p>
                          {(linkedChildren[f.id] ?? []).length === 0 ? (
                            <p style={{ color: C.muted, fontSize: 12 }}>No linked children.</p>
                          ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {(linkedChildren[f.id] ?? []).map(c => (
                                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px" }}>
                                  <span style={{ color: C.text, fontSize: 12 }}>{c.display_name}</span>
                                  <span style={{ color: C.muted, fontSize: 11 }}>{c.relationship_label}</span>
                                  <button style={{ ...btnCoral, padding: "2px 8px", fontSize: 11 }} onClick={() => void unlinkChild(f.id, c.id)}>Unlink</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showMerge && mergeA && mergeB && (
        <MergeModal
          type="guardian"
          a={{ id: mergeA.id, display_name: mergeA.display_name }}
          b={{ id: mergeB.id, display_name: mergeB.display_name }}
          onClose={() => setShowMerge(false)}
          onDone={() => { setShowMerge(false); setMergeSelected(new Set()); void load(); }}
        />
      )}
    </div>
  );
}

// ── Teachers Tab ───────────────────────────────────────────────────────────────
function TeachersTab() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/teachers").then(r => r.json()).then(d => setCount(d.teachers?.length ?? 0)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ background: "rgba(155,114,255,0.07)", border: `1px solid rgba(155,114,255,0.2)`, borderRadius: 12, padding: "20px 24px", maxWidth: 400 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>👩‍🏫</div>
        <p style={{ color: C.text, fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
          {count !== null ? `${count} Teacher${count !== 1 ? "s" : ""}` : "Teachers"}
        </p>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
          Create, edit, reset passwords, and delete teacher accounts from the dedicated Teachers page.
        </p>
        <Link href="/owner/teachers" style={{ display: "inline-block", background: C.violet, color: "#fff", textDecoration: "none", borderRadius: 9, padding: "9px 20px", fontSize: 13, fontWeight: 700 }}>
          Manage Teachers →
        </Link>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OwnerUsersPage() {
  const [tab, setTab] = useState<"students" | "families" | "teachers">("students");

  return (
    <AppFrame>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Link href="/owner" style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>← Owner</Link>
          <span style={{ color: C.muted, fontSize: 13 }}>/</span>
          <span style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>Users</span>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "16px 20px 0", borderBottom: `1px solid ${C.border}` }}>
            {(["students", "families", "teachers"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? C.violet : "transparent",
                color: tab === t ? "#fff" : C.muted,
                border: "none", borderRadius: "8px 8px 0 0",
                padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                textTransform: "capitalize",
              }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {tab === "students" && <StudentsTab />}
            {tab === "families" && <FamiliesTab />}
            {tab === "teachers" && <TeachersTab />}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
