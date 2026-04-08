"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", coral: "#ff7b6b", gold: "#ffd166",
  amber: "#f59e0b",
};

type Student = {
  id: string; display_name: string; username: string; avatar_key: string | null;
  launch_band_code: string | null; age_label: string | null;
  tester_flag: boolean; is_virtual: boolean; last_active_at: string | null;
  guardian_count: number; teacher_count: number; session_count: number;
  deactivated_at?: string | null;
};

type Family = {
  id: string; display_name: string; email: string | null; username: string;
  tester_flag: boolean; last_active_at: string | null;
  has_google: boolean; has_password: boolean; child_count: number;
  deactivated_at?: string | null;
};

type SearchResult = { id: string; display_name: string; email?: string | null; username: string; child_count?: number; age_label?: string | null; launch_band_code?: string | null };
type LinkedChild = { id: string; display_name: string; username: string; age_label: string | null; relationship_label: string };
type LinkedGuardian = { guardian_id: string; display_name: string; email: string | null; username: string };

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const inp: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "7px 11px", color: C.text, fontSize: 13,
  outline: "none", boxSizing: "border-box", width: "100%",
};
const bV: React.CSSProperties = { background: C.violet, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const bG: React.CSSProperties = { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 13px", fontSize: 12, cursor: "pointer" };
const bC: React.CSSProperties = { ...bG, color: C.coral, borderColor: "rgba(255,123,107,0.3)" };
const bM: React.CSSProperties = { ...bG, color: C.mint, borderColor: "rgba(80,232,144,0.3)" };
const bA: React.CSSProperties = { ...bG, color: C.amber, borderColor: "rgba(245,158,11,0.3)" };

// ── Search-and-pick dropdown ──────────────────────────────────────────────────
function SearchPicker({
  type, placeholder, onPick,
}: {
  type: "guardian" | "student" | "teacher";
  placeholder: string;
  onPick: (r: SearchResult) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleChange(val: string) {
    setQ(val);
    if (timer.current) clearTimeout(timer.current);
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/admin/search?type=${type}&q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
        setOpen(true);
      }
    }, 280);
  }

  function pick(r: SearchResult) {
    onPick(r);
    setQ("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <input
        style={{ ...inp, padding: "6px 10px" }}
        placeholder={placeholder}
        value={q}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "#1c2230", border: `1px solid ${C.border}`, borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)", marginTop: 4, overflow: "hidden",
        }}>
          {results.map(r => (
            <button key={r.id} onMouseDown={() => pick(r)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "9px 14px", background: "transparent", border: "none", cursor: "pointer",
              borderBottom: `1px solid ${C.border}`, color: C.text,
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(155,114,255,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontWeight: 600, fontSize: 13 }}>{r.display_name}</span>
              {r.email && <span style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>{r.email}</span>}
              <span style={{ color: C.muted, fontSize: 11, marginLeft: 8, fontFamily: "monospace" }}>@{r.username}</span>
              {r.child_count !== undefined && <span style={{ color: C.muted, fontSize: 11, marginLeft: 8 }}>{String(r.child_count)} child{Number(r.child_count) !== 1 ? "ren" : ""}</span>}
              {r.age_label && <span style={{ color: C.muted, fontSize: 11, marginLeft: 8 }}>{r.age_label}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Merge Modal ───────────────────────────────────────────────────────────────
function MergeModal({ type, a, b, onClose, onDone }: {
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, keepId, mergeId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to merge");
      onDone();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to merge"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, maxWidth: 460, width: "92%" }}>
        <h3 style={{ color: C.text, margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>Merge {type === "student" ? "Students" : "Families"}</h3>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>
          The <strong style={{ color: C.text }}>kept</strong> profile absorbs all data from the merged one. The merged profile is permanently deleted.
        </p>
        <p style={{ color: C.coral, fontSize: 12, margin: "0 0 16px" }}>⚠️ This is irreversible — all sessions, links, and history are migrated.</p>
        {[a, b].map(p => (
          <label key={p.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            borderRadius: 10, border: `1px solid ${keepId === p.id ? C.violet : C.border}`,
            marginBottom: 8, cursor: "pointer", background: keepId === p.id ? "rgba(155,114,255,0.1)" : "transparent",
          }}>
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
          <button style={bG} onClick={onClose}>Cancel</button>
          <button style={{ ...bC, flex: 1, fontWeight: 700 }} disabled={saving} onClick={() => void doMerge()}>
            {saving ? "Merging…" : `Delete "${mergeName}", keep "${keepName}"`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ type, name, onClose, onConfirm, saving }: {
  type: string; name: string; onClose: () => void; onConfirm: () => void; saving: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, maxWidth: 400, width: "92%" }}>
        <h3 style={{ color: C.coral, margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Delete {type}?</h3>
        <p style={{ color: C.text, fontSize: 14, margin: "0 0 6px" }}>You are about to permanently delete:</p>
        <p style={{ color: C.text, fontWeight: 700, fontSize: 15, margin: "0 0 12px" }}>"{name}"</p>
        <p style={{ color: C.muted, fontSize: 12, margin: "0 0 20px", lineHeight: 1.6 }}>
          All session history, links, and data will be removed. This cannot be undone.<br />
          <strong style={{ color: C.amber }}>Consider deactivating instead</strong> to preserve history.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...bG, flex: 1 }} onClick={onClose} disabled={saving}>Cancel</button>
          <button style={{ ...bC, flex: 1, fontWeight: 700 }} onClick={onConfirm} disabled={saving}>
            {saving ? "Deleting…" : "Yes, delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Students Tab ──────────────────────────────────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandId, setExpandId] = useState<string | null>(null);
  const [editMap, setEditMap] = useState<Record<string, { displayName: string; ageLabel: string; launchBandCode: string; testerFlag: boolean }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [linkedGuardians, setLinkedGuardians] = useState<Record<string, LinkedGuardian[]>>({});
  const [linkSaving, setLinkSaving] = useState<string | null>(null);
  const [mergeSelected, setMergeSelected] = useState<Set<string>>(new Set());
  const [showMerge, setShowMerge] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

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
    setEditMap(m => ({ ...m, [s.id]: { displayName: s.display_name, ageLabel: s.age_label ?? "", launchBandCode: s.launch_band_code ?? "", testerFlag: s.tester_flag } }));
    setSaveError("");
    const res = await fetch(`/api/admin/links?studentId=${s.id}`);
    if (res.ok) {
      const data = await res.json();
      setLinkedGuardians(g => ({ ...g, [s.id]: data.links }));
    }
  }

  async function save(id: string) {
    setSavingId(id); setSaveError("");
    try {
      const f = editMap[id];
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: f.displayName, ageLabel: f.ageLabel, launchBandCode: f.launchBandCode, testerFlag: f.testerFlag }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      await load();
    } catch (e) { setSaveError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSavingId(null); }
  }

  async function unlink(studentId: string, guardianId: string) {
    const res = await fetch("/api/admin/links", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unlink", guardianId, studentId }),
    });
    if (res.ok) setLinkedGuardians(g => ({ ...g, [studentId]: (g[studentId] ?? []).filter(x => x.guardian_id !== guardianId) }));
  }

  async function linkGuardian(studentId: string, guardian: SearchResult) {
    setLinkSaving(studentId);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", guardianId: guardian.id, studentId, relationshipLabel: "parent" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to link");
      const lr = await fetch(`/api/admin/links?studentId=${studentId}`);
      if (lr.ok) {
        const lrData = await lr.json();
        setLinkedGuardians(g => ({ ...g, [studentId]: lrData.links }));
      }
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to link"); }
    finally { setLinkSaving(null); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to delete");
      setDeleteTarget(null);
      setExpandId(null);
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to delete"); }
    finally { setDeleteSaving(false); }
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
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input style={{ ...inp, maxWidth: 260 }} placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
        {mergeSelected.size === 2 && (
          <button style={{ ...bC, fontSize: 13 }} onClick={() => setShowMerge(true)}>⚠️ Merge 2 selected</button>
        )}
        {mergeSelected.size === 1 && <span style={{ color: C.muted, fontSize: 12 }}>Select 1 more to merge</span>}
      </div>

      {loading && <p style={{ color: C.muted, fontSize: 13 }}>Loading…</p>}
      {error && <div style={{ display: "flex", gap: 8, alignItems: "center" }}><p style={{ color: C.coral, fontSize: 13, margin: 0 }}>{error}</p><button style={bG} onClick={() => void load()}>Retry</button></div>}
      {!loading && !error && filtered.length === 0 && <p style={{ color: C.muted, fontSize: 13, padding: "30px 0", textAlign: "center" }}>No students found.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: C.muted }}>
                {["", "Name", "Username", "Band", "Age", "Sessions", "Guardians", "Last Active", "Status", ""].map((h, i) => (
                  <th key={i} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const isDeactivated = !!s.deactivated_at;
                return (
                  <>
                    <tr key={s.id} style={{ borderBottom: expandId === s.id ? "none" : `1px solid ${C.border}`, opacity: isDeactivated ? 0.5 : 1 }}>
                      <td style={{ padding: "9px 8px" }}>
                        <input type="checkbox" checked={mergeSelected.has(s.id)} onChange={() => toggleMerge(s.id)} style={{ accentColor: C.violet }} />
                      </td>
                      <td style={{ padding: "9px 8px", color: C.text, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {s.display_name}
                        {s.is_virtual && <span style={{ color: C.muted, fontSize: 10, marginLeft: 5, background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "1px 5px" }}>virtual</span>}
                      </td>
                      <td style={{ padding: "9px 8px", color: C.muted, fontFamily: "monospace", fontSize: 12 }}>{s.username}</td>
                      <td style={{ padding: "9px 8px", color: C.muted }}>{s.launch_band_code ?? "—"}</td>
                      <td style={{ padding: "9px 8px", color: C.muted }}>{s.age_label ?? "—"}</td>
                      <td style={{ padding: "9px 8px", color: C.text }}>{String(s.session_count)}</td>
                      <td style={{ padding: "9px 8px", color: s.guardian_count > 0 ? C.text : C.coral }}>{String(s.guardian_count)}</td>
                      <td style={{ padding: "9px 8px", color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(s.last_active_at)}</td>
                      <td style={{ padding: "9px 8px" }}>
                        {isDeactivated
                          ? <span style={{ color: C.coral, fontSize: 11, fontWeight: 600 }}>Deactivated</span>
                          : <span style={{ color: C.mint, fontSize: 11 }}>Active</span>}
                      </td>
                      <td style={{ padding: "9px 8px", whiteSpace: "nowrap", display: "flex", gap: 5 }}>
                        <button style={{ ...bG, fontSize: 11 }} onClick={() => void expand(s)}>
                          {expandId === s.id ? "Close" : "Edit"}
                        </button>
                        <button style={{ ...bC, fontSize: 11 }} onClick={() => setDeleteTarget(s)}>Delete</button>
                      </td>
                    </tr>
                    {expandId === s.id && (
                      <tr key={`x-${s.id}`} style={{ background: "rgba(155,114,255,0.04)", borderBottom: `1px solid ${C.border}` }}>
                        <td colSpan={10} style={{ padding: "14px 16px" }}>
                          {/* Edit form */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 10, alignItems: "end" }}>
                            {[
                              { label: "Display Name", key: "displayName" },
                              { label: "Age Label", key: "ageLabel" },
                              { label: "Launch Band", key: "launchBandCode" },
                            ].map(({ label, key }) => (
                              <div key={key}>
                                <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>{label}</label>
                                <input style={inp} value={editMap[s.id]?.[key as keyof typeof editMap[string]] as string ?? ""} onChange={e => setEditMap(m => ({ ...m, [s.id]: { ...m[s.id], [key]: e.target.value } }))} />
                              </div>
                            ))}
                            <label style={{ color: C.muted, fontSize: 11, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", paddingBottom: 8 }}>
                              <input type="checkbox" checked={editMap[s.id]?.testerFlag ?? false} onChange={e => setEditMap(m => ({ ...m, [s.id]: { ...m[s.id], testerFlag: e.target.checked } }))} style={{ accentColor: C.violet }} />
                              Tester
                            </label>
                          </div>
                          {saveError && <p style={{ color: C.coral, fontSize: 12, marginBottom: 8 }}>{saveError}</p>}
                          <button style={{ ...bV, fontSize: 12, marginBottom: 18 }} disabled={savingId === s.id} onClick={() => void save(s.id)}>
                            {savingId === s.id ? "Saving…" : "Save changes"}
                          </button>

                          {/* Linked Guardians */}
                          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                            <p style={{ color: C.muted, fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Linked Guardians / Families</p>
                            {(linkedGuardians[s.id] ?? []).length === 0
                              ? <p style={{ color: C.coral, fontSize: 12, marginBottom: 10 }}>No linked guardians — this student has no family assigned.</p>
                              : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                                  {(linkedGuardians[s.id] ?? []).map(g => (
                                    <div key={g.guardian_id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px" }}>
                                      <div>
                                        <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{g.display_name}</span>
                                        {g.email && <span style={{ color: C.muted, fontSize: 11, marginLeft: 6 }}>{g.email}</span>}
                                        <span style={{ color: C.muted, fontSize: 11, marginLeft: 6 }}>({g.relationship_label})</span>
                                      </div>
                                      <button style={{ ...bC, padding: "3px 9px", fontSize: 11 }} onClick={() => void unlink(s.id, g.guardian_id)}>Unlink</button>
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <SearchPicker
                                type="guardian"
                                placeholder="Search guardian by name, email, or username…"
                                onPick={g => void linkGuardian(s.id, g)}
                              />
                              {linkSaving === s.id && <span style={{ color: C.muted, fontSize: 12 }}>Linking…</span>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showMerge && mergeA && mergeB && (
        <MergeModal type="student" a={{ id: mergeA.id, display_name: mergeA.display_name }} b={{ id: mergeB.id, display_name: mergeB.display_name }}
          onClose={() => setShowMerge(false)}
          onDone={() => { setShowMerge(false); setMergeSelected(new Set()); void load(); }}
        />
      )}
      {deleteTarget && (
        <DeleteModal type="Student" name={deleteTarget.display_name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void doDelete()}
          saving={deleteSaving}
        />
      )}
    </div>
  );
}

// ── Families Tab ──────────────────────────────────────────────────────────────
function FamiliesTab() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandId, setExpandId] = useState<string | null>(null);
  const [editMap, setEditMap] = useState<Record<string, { displayName: string; email: string; testerFlag: boolean }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [linkedChildren, setLinkedChildren] = useState<Record<string, LinkedChild[]>>({});
  const [linkSaving, setLinkSaving] = useState<string | null>(null);
  const [mergeSelected, setMergeSelected] = useState<Set<string>>(new Set());
  const [showMerge, setShowMerge] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Family | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

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
    setEditMap(m => ({ ...m, [f.id]: { displayName: f.display_name, email: f.email ?? "", testerFlag: f.tester_flag } }));
    setSaveError("");
    const res = await fetch(`/api/admin/families/${f.id}`);
    if (res.ok) {
      const data = await res.json();
      setLinkedChildren(c => ({ ...c, [f.id]: data.children }));
    }
  }

  async function save(id: string) {
    setSavingId(id); setSaveError("");
    try {
      const f = editMap[id];
      const res = await fetch(`/api/admin/families/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: f.displayName, email: f.email, testerFlag: f.testerFlag }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      await load();
    } catch (e) { setSaveError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSavingId(null); }
  }

  async function unlinkChild(guardianId: string, studentId: string) {
    const res = await fetch("/api/admin/links", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unlink", guardianId, studentId }),
    });
    if (res.ok) setLinkedChildren(c => ({ ...c, [guardianId]: (c[guardianId] ?? []).filter(x => x.id !== studentId) }));
  }

  async function linkStudent(guardianId: string, student: SearchResult) {
    setLinkSaving(guardianId);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", guardianId, studentId: student.id, relationshipLabel: "parent" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to link");
      const lr = await fetch(`/api/admin/families/${guardianId}`);
      if (lr.ok) {
        const lrData = await lr.json();
        setLinkedChildren(c => ({ ...c, [guardianId]: lrData.children }));
      }
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to link"); }
    finally { setLinkSaving(null); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/admin/families/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to delete");
      setDeleteTarget(null);
      setExpandId(null);
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to delete"); }
    finally { setDeleteSaving(false); }
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
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input style={{ ...inp, maxWidth: 260 }} placeholder="Search families…" value={search} onChange={e => setSearch(e.target.value)} />
        {mergeSelected.size === 2 && (
          <button style={{ ...bC, fontSize: 13 }} onClick={() => setShowMerge(true)}>⚠️ Merge 2 selected</button>
        )}
        {mergeSelected.size === 1 && <span style={{ color: C.muted, fontSize: 12 }}>Select 1 more to merge</span>}
      </div>

      {loading && <p style={{ color: C.muted, fontSize: 13 }}>Loading…</p>}
      {error && <div style={{ display: "flex", gap: 8, alignItems: "center" }}><p style={{ color: C.coral, fontSize: 13, margin: 0 }}>{error}</p><button style={bG} onClick={() => void load()}>Retry</button></div>}
      {!loading && !error && filtered.length === 0 && <p style={{ color: C.muted, fontSize: 13, padding: "30px 0", textAlign: "center" }}>No families found.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: C.muted }}>
                {["", "Name", "Email", "Username", "Auth", "Children", "Last Active", "Status", ""].map((h, i) => (
                  <th key={i} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const isDeactivated = !!f.deactivated_at;
                return (
                  <>
                    <tr key={f.id} style={{ borderBottom: expandId === f.id ? "none" : `1px solid ${C.border}`, opacity: isDeactivated ? 0.5 : 1 }}>
                      <td style={{ padding: "9px 8px" }}>
                        <input type="checkbox" checked={mergeSelected.has(f.id)} onChange={() => toggleMerge(f.id)} style={{ accentColor: C.violet }} />
                      </td>
                      <td style={{ padding: "9px 8px", color: C.text, fontWeight: 600, whiteSpace: "nowrap" }}>{f.display_name}</td>
                      <td style={{ padding: "9px 8px", color: C.muted, fontSize: 12 }}>{f.email ?? "—"}</td>
                      <td style={{ padding: "9px 8px", color: C.muted, fontFamily: "monospace", fontSize: 12 }}>{f.username}</td>
                      <td style={{ padding: "9px 8px" }}>
                        {f.has_google && <span style={{ fontSize: 11, marginRight: 4 }}>🔗 G</span>}
                        {f.has_password && <span style={{ fontSize: 11 }}>🔑</span>}
                        {!f.has_google && !f.has_password && <span style={{ color: C.muted, fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ padding: "9px 8px", color: f.child_count > 0 ? C.text : C.coral }}>{String(f.child_count)}</td>
                      <td style={{ padding: "9px 8px", color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(f.last_active_at)}</td>
                      <td style={{ padding: "9px 8px" }}>
                        {isDeactivated
                          ? <span style={{ color: C.coral, fontSize: 11, fontWeight: 600 }}>Deactivated</span>
                          : <span style={{ color: C.mint, fontSize: 11 }}>Active</span>}
                      </td>
                      <td style={{ padding: "9px 8px", whiteSpace: "nowrap", display: "flex", gap: 5 }}>
                        <button style={{ ...bG, fontSize: 11 }} onClick={() => void expand(f)}>
                          {expandId === f.id ? "Close" : "Edit"}
                        </button>
                        <button style={{ ...bC, fontSize: 11 }} onClick={() => setDeleteTarget(f)}>Delete</button>
                      </td>
                    </tr>
                    {expandId === f.id && (
                      <tr key={`x-${f.id}`} style={{ background: "rgba(155,114,255,0.04)", borderBottom: `1px solid ${C.border}` }}>
                        <td colSpan={9} style={{ padding: "14px 16px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 10, alignItems: "end" }}>
                            <div>
                              <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Display Name</label>
                              <input style={inp} value={editMap[f.id]?.displayName ?? ""} onChange={e => setEditMap(m => ({ ...m, [f.id]: { ...m[f.id], displayName: e.target.value } }))} />
                            </div>
                            <div>
                              <label style={{ color: C.muted, fontSize: 11, display: "block", marginBottom: 4 }}>Email</label>
                              <input style={inp} value={editMap[f.id]?.email ?? ""} onChange={e => setEditMap(m => ({ ...m, [f.id]: { ...m[f.id], email: e.target.value } }))} />
                            </div>
                            <label style={{ color: C.muted, fontSize: 11, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", paddingBottom: 8 }}>
                              <input type="checkbox" checked={editMap[f.id]?.testerFlag ?? false} onChange={e => setEditMap(m => ({ ...m, [f.id]: { ...m[f.id], testerFlag: e.target.checked } }))} style={{ accentColor: C.violet }} />
                              Tester
                            </label>
                          </div>
                          {saveError && <p style={{ color: C.coral, fontSize: 12, marginBottom: 8 }}>{saveError}</p>}
                          <button style={{ ...bV, fontSize: 12, marginBottom: 18 }} disabled={savingId === f.id} onClick={() => void save(f.id)}>
                            {savingId === f.id ? "Saving…" : "Save changes"}
                          </button>

                          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                            <p style={{ color: C.muted, fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Linked Children</p>
                            {(linkedChildren[f.id] ?? []).length === 0
                              ? <p style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>No children linked to this family yet.</p>
                              : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                                  {(linkedChildren[f.id] ?? []).map(c => (
                                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px" }}>
                                      <div>
                                        <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{c.display_name}</span>
                                        <span style={{ color: C.muted, fontSize: 11, marginLeft: 6 }}>@{c.username}</span>
                                        
                                      </div>
                                      <button style={{ ...bC, padding: "3px 9px", fontSize: 11 }} onClick={() => void unlinkChild(f.id, c.id)}>Unlink</button>
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <SearchPicker
                                type="student"
                                placeholder="Search student by name or username…"
                                onPick={s => void linkStudent(f.id, s)}
                              />
                              {linkSaving === f.id && <span style={{ color: C.muted, fontSize: 12 }}>Linking…</span>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showMerge && mergeA && mergeB && (
        <MergeModal type="guardian" a={{ id: mergeA.id, display_name: mergeA.display_name }} b={{ id: mergeB.id, display_name: mergeB.display_name }}
          onClose={() => setShowMerge(false)}
          onDone={() => { setShowMerge(false); setMergeSelected(new Set()); void load(); }}
        />
      )}
      {deleteTarget && (
        <DeleteModal type="Family" name={deleteTarget.display_name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void doDelete()}
          saving={deleteSaving}
        />
      )}
    </div>
  );
}

// ── Teachers Tab ──────────────────────────────────────────────────────────────
function TeachersTab() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/admin/teachers").then(r => r.json()).then(d => setCount(d.teachers?.length ?? 0)).catch(() => {});
  }, []);
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ background: "rgba(155,114,255,0.07)", border: `1px solid rgba(155,114,255,0.2)`, borderRadius: 12, padding: "20px 24px", maxWidth: 420 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>👩‍🏫</div>
        <p style={{ color: C.text, fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
          {count !== null ? `${count} Teacher${count !== 1 ? "s" : ""}` : "Teachers"}
        </p>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
          Create accounts, reset passwords, edit school info, and delete teacher accounts.
        </p>
        <Link href="/owner/teachers" style={{ display: "inline-block", background: C.violet, color: "#fff", textDecoration: "none", borderRadius: 9, padding: "9px 20px", fontSize: 13, fontWeight: 700 }}>
          Manage Teachers →
        </Link>
      </div>
    </div>
  );
}

// ── Deactivate notice banner ──────────────────────────────────────────────────
function DeactivateBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{ background: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.25)`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: 18 }}>⏸️</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: C.amber, fontSize: 13, fontWeight: 700, margin: "0 0 3px" }}>Deactivate / Reactivate requires a one-time DB migration</p>
        <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
          Run <code style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "1px 5px", fontFamily: "monospace", fontSize: 11 }}>supabase/migrations/20260408_deactivation.sql</code> in your Supabase SQL editor to enable soft-disable on all profiles.
        </p>
      </div>
      <button style={{ ...bG, fontSize: 11, padding: "3px 9px" }} onClick={() => setDismissed(true)}>×</button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
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

        <DeactivateBanner />

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 4, padding: "16px 20px 0", borderBottom: `1px solid ${C.border}` }}>
            {(["students", "families", "teachers"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? C.violet : "transparent",
                color: tab === t ? "#fff" : C.muted,
                border: "none", borderRadius: "8px 8px 0 0",
                padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
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
