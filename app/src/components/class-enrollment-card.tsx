"use client";
import { useState, useEffect } from "react";

interface ClassInfo {
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  schoolName: string | null;
  classCode: string;
  joinedAt: string;
}

interface Props {
  studentId: string;
  studentName: string;
  onClassJoined?: () => void;
}

export function ClassEnrollmentCard({ studentId, studentName: _studentName, onClassJoined }: Props) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  async function load() {
    const res = await fetch("/api/parent/my-classes");
    if (res.ok) {
      const data = await res.json() as { classes: ClassInfo[] };
      setClasses(data.classes.filter(c => c.studentId === studentId));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true); setJoinError(""); setJoinSuccess("");
    const res = await fetch("/api/parent/join-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classCode: code.trim().toUpperCase(), studentId }),
    });
    const data = await res.json() as { teacherName?: string; error?: string };
    setJoining(false);
    if (!res.ok) { setJoinError(data.error || "Could not join class."); return; }
    setJoinSuccess(`Joined ${data.teacherName ?? "teacher"}'s class!`);
    setCode(""); setShowJoin(false);
    load();
    onClassJoined?.();
  }

  async function handleLeave(teacherId: string) {
    if (!confirm("Remove this child from the class?")) return;
    await fetch("/api/parent/join-class", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, teacherId }),
    });
    load();
  }

  if (loading) return null;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">Class</h3>
        {!showJoin && (
          <button
            onClick={() => setShowJoin(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            + Join a class
          </button>
        )}
      </div>

      {classes.length === 0 && !showJoin && (
        <p className="text-xs text-white/40 italic">Not enrolled in any class yet.</p>
      )}

      {classes.map(c => (
        <div key={c.teacherId} className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{c.teacherName}</p>
            {c.schoolName && <p className="text-xs text-white/50 truncate">{c.schoolName}</p>}
          </div>
          <button
            onClick={() => handleLeave(c.teacherId)}
            className="shrink-0 text-xs text-white/30 hover:text-red-400 transition-colors"
          >
            Leave
          </button>
        </div>
      ))}

      {joinSuccess && (
        <p className="text-xs text-emerald-400">{joinSuccess}</p>
      )}

      {showJoin && (
        <form onSubmit={handleJoin} className="flex gap-2">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Class code"
            maxLength={8}
            className="flex-1 min-w-0 rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={joining || code.length < 4}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
          >
            {joining ? "…" : "Join"}
          </button>
          <button
            type="button"
            onClick={() => { setShowJoin(false); setJoinError(""); setCode(""); }}
            className="shrink-0 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 transition-colors"
          >
            ✕
          </button>
        </form>
      )}

      {joinError && <p className="text-xs text-red-400">{joinError}</p>}
    </div>
  );
}
