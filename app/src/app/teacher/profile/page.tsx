"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#50e890",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.45)",
  red: "#ff7b6b",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(155,114,255,0.07)",
  border: "1px solid rgba(155,114,255,0.18)",
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontFamily: "inherit",
  fontSize: 16,
  boxSizing: "border-box",
  outline: "none",
  minHeight: 44,
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "rgba(255,255,255,0.35)",
  textTransform: "uppercase",
  letterSpacing: 1.2,
  marginBottom: 10,
  display: "block",
};

const GRADE_OPTIONS = ["K", "1", "2", "3", "4", "5"];

type ProfileData = {
  displayName: string;
  username: string;
  schoolName: string | null;
  gradeLevels: string[];
  email: string | null;
  classCode: string | null;
  createdAt: string | null;
};

export default function TeacherProfilePage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { fetchTeacherId().then(id => setAuthed(!!id)); }, []);
  if (!authed) return <TeacherGate configured={false} />;

  return <ProfileContent />;
}

function ProfileContent() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable field state
  const [displayName, setDisplayName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMsg, setSaveMsg] = useState("");

  // Copy state
  const [copied, setCopied] = useState(false);

  useEffect(() => { void (async () => {
    const teacherId = await fetchTeacherId();
    if (!teacherId) return;

    fetch(`/api/teacher/profile?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error as string);
        } else {
          const p = data.profile as ProfileData;
          setProfile(p);
          setDisplayName(p.displayName ?? "");
          setSchoolName(p.schoolName ?? "");
          setGradeLevels(p.gradeLevels ?? []);
          setEmail(p.email ?? "");
        }
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  })(); }, []);

  function toggleGrade(grade: string) {
    setGradeLevels((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade],
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");
    setSaveMsg("");
    try {
      const res = await fetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          schoolName: schoolName.trim() || null,
          gradeLevels,
          email: email.trim() || null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setSaveStatus("error");
        setSaveMsg(data.error ?? "Save failed.");
      } else {
        setSaveStatus("success");
        setSaveMsg("Profile saved!");
        // Update local profile state
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                displayName: displayName.trim() || prev.displayName,
                schoolName: schoolName.trim() || null,
                gradeLevels,
                email: email.trim() || null,
              }
            : prev,
        );
      }
    } catch {
      setSaveStatus("error");
      setSaveMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  async function handleCopyCode() {
    if (!profile?.classCode) return;
    try {
      await navigator.clipboard.writeText(profile.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback — select text
    }
  }

  function formatDate(iso: string | null): string {
    if (!iso) return "Unknown";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/profile">
      <div
        style={{
          maxWidth: 620,
          margin: "0 auto",
          padding: "32px 16px 80px",
          paddingBottom: "env(safe-area-inset-bottom, 80px)",
          color: C.text,
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 6,
            background: `linear-gradient(90deg, ${C.violet}, ${C.gold})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Profile Settings
        </h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 28, marginTop: 0 }}>
          Manage your account details and share your class code with parents.
        </p>

        {loading && (
          <p style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading…</p>
        )}
        {error && (
          <div
            style={{
              ...cardStyle,
              border: `1px solid ${C.red}`,
              background: "rgba(255,123,107,0.08)",
              color: C.red,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && profile && (
          <>
            {/* ── Profile Card ── */}
            <div style={cardStyle}>
              <span style={sectionLabel}>Profile Info</span>

              <div style={{ marginBottom: 16 }}>
                <label style={{ ...sectionLabel, marginBottom: 6 }}>Display Name</label>
                <input
                  style={inputStyle}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ ...sectionLabel, marginBottom: 6 }}>School</label>
                <input
                  style={inputStyle}
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="School name"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ ...sectionLabel, marginBottom: 10 }}>Grade Levels</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {GRADE_OPTIONS.map((g) => {
                    const active = gradeLevels.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGrade(g)}
                        style={{
                          padding: "6px 16px",
                          borderRadius: 100,
                          border: active
                            ? `1.5px solid ${C.violet}`
                            : "1.5px solid rgba(255,255,255,0.12)",
                          background: active ? `${C.violet}22` : "rgba(255,255,255,0.04)",
                          color: active ? C.violet : C.muted,
                          fontWeight: active ? 700 : 400,
                          fontSize: 14,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          minHeight: 44,
                          touchAction: "manipulation",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        {g === "K" ? "Kindergarten" : `Grade ${g}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ ...sectionLabel, marginBottom: 6 }}>Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "11px 28px",
                    borderRadius: 12,
                    border: "none",
                    background: saving ? "rgba(155,114,255,0.4)" : C.violet,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: saving ? "default" : "pointer",
                    transition: "all 0.15s",
                    minHeight: 44,
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>

                {saveStatus === "success" && (
                  <span style={{ color: C.mint, fontSize: 14, fontWeight: 600 }}>
                    {saveMsg}
                  </span>
                )}
                {saveStatus === "error" && (
                  <span style={{ color: C.red, fontSize: 14 }}>{saveMsg}</span>
                )}
              </div>
            </div>

            {/* ── Class Code Card ── */}
            <div style={cardStyle}>
              <span style={sectionLabel}>Class Code</span>
              <p style={{ color: C.muted, fontSize: 13, marginTop: 0, marginBottom: 16 }}>
                Share this code with parents so students can join your class.
              </p>

              {profile.classCode ? (
                <>
                  <div
                    style={{
                      fontSize: 38,
                      fontWeight: 900,
                      letterSpacing: 6,
                      fontFamily: "monospace",
                      color: C.gold,
                      marginBottom: 16,
                      userSelect: "all",
                    }}
                  >
                    {profile.classCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      padding: "9px 22px",
                      borderRadius: 10,
                      border: `1px solid rgba(255,209,102,0.3)`,
                      background: copied ? "rgba(80,232,144,0.12)" : "rgba(255,209,102,0.08)",
                      color: copied ? C.mint : C.gold,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      minHeight: 44,
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {copied ? "Copied!" : "Copy Code"}
                  </button>
                </>
              ) : (
                <p style={{ color: C.muted, fontStyle: "italic", fontSize: 14 }}>
                  No class code generated yet. One will be created automatically when you
                  reload this page.
                </p>
              )}
            </div>

            {/* ── Account Card ── */}
            <div style={cardStyle}>
              <span style={sectionLabel}>Account</span>

              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <span
                    style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8 }}
                  >
                    Username
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 15,
                      fontWeight: 600,
                      color: C.text,
                      fontFamily: "monospace",
                    }}
                  >
                    {profile.username || "—"}
                  </p>
                </div>

                <div>
                  <span
                    style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8 }}
                  >
                    Member Since
                  </span>
                  <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: C.text }}>
                    {formatDate(profile.createdAt)}
                  </p>
                </div>

                <div style={{ paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <a
                    href="/api/teacher/logout"
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.35)",
                      textDecoration: "none",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: 44,
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    Sign out →
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
