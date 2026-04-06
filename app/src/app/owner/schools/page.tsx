"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", gold: "#ffd166", coral: "#ff7b6b",
};

type School = {
  schoolName: string;
  teacherCount: number;
  studentCount: number;
};

type SchoolsData = {
  schools: School[];
  totals: { schoolCount: number; teacherCount: number; studentCount: number };
};

type TeacherRow = { id: string; displayName: string; email: string };

function TeacherList({ schoolName }: { schoolName: string }) {
  const [teachers, setTeachers] = useState<TeacherRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/owner/schools/teachers?school=${encodeURIComponent(schoolName)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: { teachers: TeacherRow[] } | null) => {
        setTeachers(d?.teachers ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [schoolName]);

  if (loading) {
    return <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Loading teachers…</div>;
  }
  if (!teachers || teachers.length === 0) {
    return <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No teachers found for this school.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
        Teachers at this school
      </div>
      {teachers.map((t) => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(155,114,255,0.5)", flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{t.displayName}</span>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>{t.email}</span>
        </div>
      ))}
    </div>
  );
}

export default function OwnerSchoolsPage() {
  const [data, setData] = useState<SchoolsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/owner/schools")
      .then((r) => r.ok ? r.json() : null)
      .then((d: SchoolsData | null) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 32px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/owner" style={{ fontSize: 12, color: "rgba(155,114,255,0.7)", textDecoration: "none", fontWeight: 600 }}>← Owner</Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Schools</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>
          Schools registered by teachers — real data, testers excluded
        </p>

        {loading && <div style={{ color: C.muted, fontSize: 14 }}>Loading…</div>}
        {!loading && !data && (
          <div style={{ color: C.coral, fontSize: 14 }}>Failed to load schools data</div>
        )}

        {!loading && data && (
          <>
            {/* Summary cards */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              {[
                { val: data.totals.schoolCount, lbl: "Schools", color: C.violet },
                { val: data.totals.teacherCount, lbl: "Teachers", color: C.mint },
                { val: data.totals.studentCount, lbl: "Students (via roster)", color: C.gold },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", flex: "1 1 140px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* School cards */}
            {data.schools.length === 0 ? (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "32px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 14, color: C.muted }}>No schools registered yet.</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
                  Teachers will add their school when signing up.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.schools.map((school) => {
                  const isExpanded = expandedSchool === school.schoolName;
                  return (
                    <div
                      key={school.schoolName}
                      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: "rgba(155,114,255,0.12)",
                          border: "1px solid rgba(155,114,255,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, flexShrink: 0,
                        }}>
                          🏫
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {school.schoolName}
                          </div>
                          <div style={{ fontSize: 12, color: C.muted }}>
                            <span style={{ color: C.mint, fontWeight: 700 }}>{school.teacherCount}</span>
                            {" "}teacher{school.teacherCount !== 1 ? "s" : ""}
                            {" · "}
                            <span style={{ color: C.gold, fontWeight: 700 }}>{school.studentCount}</span>
                            {" "}student{school.studentCount !== 1 ? "s" : ""} via roster
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedSchool(isExpanded ? null : school.schoolName)}
                          style={{
                            background: "rgba(155,114,255,0.1)",
                            border: "1px solid rgba(155,114,255,0.25)",
                            borderRadius: 8, padding: "6px 12px",
                            fontSize: 12, fontWeight: 700, color: C.violet,
                            cursor: "pointer", flexShrink: 0,
                          }}
                        >
                          {isExpanded ? "Hide \u2191" : "View teachers \u2192"}
                        </button>
                      </div>
                      {isExpanded && (
                        <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 20px 16px", background: "rgba(155,114,255,0.04)" }}>
                          <TeacherList schoolName={school.schoolName} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppFrame>
  );
}
