"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  cardBg: "rgba(255,255,255,0.04)",
  cardBgActive: "rgba(155,114,255,0.12)",
  borderActive: "rgba(155,114,255,0.4)",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(255,255,255,0.14)",
  bubbleOut: "#9b72ff",
  bubbleIn: "rgba(255,255,255,0.07)",
  bubbleInBorder: "rgba(255,255,255,0.1)",
  sideBg: "rgba(0,0,0,0.2)",
  composeBg: "rgba(0,0,0,0.18)",
  coral: "#f87171",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Msg = {
  id: string;
  from: "teacher" | "parent";
  body: string;
  time: string;
  unread?: boolean;
};

type Conv = {
  id: string;
  parentName: string;
  parentInitial: string;
  parentColor: string;
  studentName: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  isAnnouncement?: boolean;
  messages: Msg[];
};

type RosterStudent = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
};

type NoteRow = {
  id: string;
  note_text: string;
  created_at: string;
  student_id: string;
  student_name: string;
};

type SentMessage = {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
};

// ── Seed conversations ────────────────────────────────────────────────────────
const CONVS: Conv[] = [
  {
    id: "conv-jordan",
    parentName: "Alex T.",
    parentInitial: "A",
    parentColor: "#475569",
    studentName: "Jordan",
    lastMessage: "Thanks for letting me know, I'll chat with them tonight.",
    lastTime: "10:32am",
    unreadCount: 1,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi Alex — I wanted to reach out about Jordan. They've been working hard on fractions this week! I'd love to schedule a brief check-in if you have a few minutes. No concerns — just want to share some ideas that might help at home too.",
        time: "Ms. Sharma · 9:14am",
      },
      {
        id: "m2",
        from: "parent",
        body: "Thanks so much for reaching out, Ms. Sharma! Jordan mentioned they've been finding fractions tricky. I'd love to chat — does Thursday work?",
        time: "Alex T. · 9:51am",
      },
      {
        id: "m3",
        from: "teacher",
        body: "Thursday works great! I'll send a calendar invite through the school portal. In the meantime, WonderQuest is suggesting some visual models — Jordan should see those pop up in their sessions soon.",
        time: "Ms. Sharma · 10:05am",
      },
      {
        id: "m4",
        from: "parent",
        body: "Thanks for letting me know, I'll chat with them tonight.",
        time: "Alex T. · 10:32am",
        unread: true,
      },
    ],
  },
  {
    id: "conv-priya",
    parentName: "Meera P.",
    parentInitial: "M",
    parentColor: "#0f766e",
    studentName: "Priya",
    lastMessage: "She's excited to catch up! We traveled for a family wedding.",
    lastTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi Meera — just checking in on Priya. We haven't seen her on WonderQuest in about five days. Hope everything is okay! Let me know if there's anything we can do to help her get back into her streak.",
        time: "Ms. Sharma · Mar 22",
      },
      {
        id: "m2",
        from: "parent",
        body: "Oh, I'm so sorry! We traveled for a family wedding last week. She'll be back at it tonight, I promise.",
        time: "Meera P. · Mar 22",
      },
      {
        id: "m3",
        from: "teacher",
        body: "No need to apologize at all — life happens! Priya's streak will reset but her skills are all saved. She'll pick right back up.",
        time: "Ms. Sharma · Mar 22",
      },
      {
        id: "m4",
        from: "parent",
        body: "She's excited to catch up! We traveled for a family wedding last week.",
        time: "Meera P. · Mar 23",
      },
    ],
  },
  {
    id: "conv-marcus",
    parentName: "David K.",
    parentInitial: "D",
    parentColor: "#7c3aed",
    studentName: "Marcus",
    lastMessage: "That's great news about the P3 advancement! We'll celebrate tonight.",
    lastTime: "Mar 20",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi David — big news! Marcus has just met all the criteria to advance from P2 to P3 on WonderQuest. He's worked incredibly hard this term. You should be very proud.",
        time: "Ms. Sharma · Mar 20",
      },
      {
        id: "m2",
        from: "parent",
        body: "Wow, that is amazing! He's been putting in so much time. Can you tell us what P3 means in terms of what he'll be working on?",
        time: "David K. · Mar 20",
      },
      {
        id: "m3",
        from: "teacher",
        body: "P3 covers Grade 3-4 level content — multiplication, division, and early fractions. He'll find it challenging in the best possible way.",
        time: "Ms. Sharma · Mar 20",
      },
      {
        id: "m4",
        from: "parent",
        body: "That's great news about the P3 advancement! We'll celebrate tonight.",
        time: "David K. · Mar 20",
      },
    ],
  },
  {
    id: "conv-announcement",
    parentName: "Sent to all parents",
    parentInitial: "!",
    parentColor: "#1d4ed8",
    studentName: "Class announcement",
    lastMessage: "Class 4B had an amazing week — 1,800 stars total, the best this term!",
    lastTime: "Mar 17",
    unreadCount: 0,
    isAnnouncement: true,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi Class 4B families — your students had a wonderful week on WonderQuest! The class collectively earned over 1,800 stars — the best weekly total this term. Keep encouraging those daily sessions at home.",
        time: "Ms. Sharma · Mar 17",
      },
      {
        id: "m2",
        from: "parent",
        body: "Thank you for sharing this! My son has been so motivated lately.",
        time: "Parent reply · Mar 17",
      },
      {
        id: "m3",
        from: "teacher",
        body: "That is so great to hear! Keep it up everyone — another big week ahead.",
        time: "Ms. Sharma · Mar 17",
      },
    ],
  },
];

const TOTAL_UNREAD = CONVS.reduce((s, c) => s + c.unreadCount, 0);

// ── Templates data ────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    icon: "★",
    title: "Progress update",
    body: "Hi — I wanted to share a positive update on what your child mastered this week on WonderQuest!",
  },
  {
    icon: "↑",
    title: "Band advancement",
    body: "Great news — your child is ready to advance to the next WonderQuest level. They've worked incredibly hard!",
  },
  {
    icon: "★",
    title: "Check-in request",
    body: "Hi — I'd love to schedule a brief chat. No concerns at all — just want to share some ideas that might help at home.",
  },
  {
    icon: "♡",
    title: "Encourage at home",
    body: "Hi — here are a few ways you can support your child's learning at home alongside their WonderQuest sessions.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeacherMessagesPage() {
  // Auth guard
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  // Top-level page tab
  const [pageTab, setPageTab] = useState<"notes" | "parent-messages">("notes");

  // ── Inbox / Compose / Announce tabs (parent messages panel)
  const [msgTab, setMsgTab] = useState<"inbox" | "compose" | "announce">("inbox");
  const [announceSubject, setAnnounceSubject] = useState("Great week in Class 4B!");
  const [announceBody, setAnnounceBody] = useState(
    "Hi Class 4B families,\n\nJust wanted to share that your students have had a wonderful week on WonderQuest! The class collectively earned over 1,800 stars — the best weekly total this term.\n\nKeep encouraging those daily sessions at home. Streaks are building and skills are clicking!\n\nThanks,\nMs. Sharma"
  );

  // ── Compose-message form state ───────────────────────────────────────────
  const [composeStudent, setComposeStudent] = useState("");
  const [composeTitle, setComposeTitle] = useState("");
  const [composeMsgBody, setComposeMsgBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [composeSuccess, setComposeSuccess] = useState("");

  // ── Announce form state ──────────────────────────────────────────────────
  const [announceSending, setAnnounceSending] = useState(false);
  const [announceError, setAnnounceError] = useState("");
  const [announceSuccess, setAnnounceSuccess] = useState("");

  // ── Sent messages (inbox) ────────────────────────────────────────────────
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [sentLoading, setSentLoading] = useState(false);

  // ── Real student roster ──────────────────────────────────────────────────
  const [roster, setRoster] = useState<RosterStudent[]>([]);

  useEffect(() => {
    if (!authed) return;
    const teacherId = getTeacherId();
    async function load() {
      try {
        const res = await fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`);
        if (!res.ok) return;
        const data = await res.json() as { roster: RosterStudent[] };
        setRoster(data.roster);
      } catch {
        // silently fail
      }
    }
    void load();
  }, [authed]);

  const loadSentMessages = useCallback(async () => {
    setSentLoading(true);
    try {
      const teacherId = getTeacherId();
      const res = await fetch(`/api/teacher/messages?teacherId=${encodeURIComponent(teacherId)}`);
      if (!res.ok) return;
      const data = await res.json() as { messages: SentMessage[] };
      setSentMessages(data.messages ?? []);
    } catch {
      // silently fail
    } finally {
      setSentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    void loadSentMessages();
  }, [authed, loadSentMessages]);

  async function handleSendMessage() {
    setComposeError("");
    setComposeSuccess("");
    if (!composeStudent) { setComposeError("Please select a student."); return; }
    if (!composeTitle.trim()) { setComposeError("Please enter a subject."); return; }
    if (!composeMsgBody.trim()) { setComposeError("Please enter a message."); return; }
    setComposeSending(true);
    try {
      const teacherId = getTeacherId();
      const res = await fetch("/api/teacher/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, studentId: composeStudent, title: composeTitle, messageBody: composeMsgBody }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setComposeError(data.error ?? "Failed to send message.");
      } else {
        const studentName = roster.find((s) => s.studentId === composeStudent)?.displayName ?? "student";
        setComposeSuccess(`Message sent to ${studentName}'s parent!`);
        setComposeStudent("");
        setComposeTitle("");
        setComposeMsgBody("");
        setTimeout(() => setComposeSuccess(""), 4000);
        void loadSentMessages();
      }
    } catch {
      setComposeError("Failed to send message.");
    } finally {
      setComposeSending(false);
    }
  }

  async function handleSendAnnouncement() {
    setAnnounceError("");
    setAnnounceSuccess("");
    if (roster.length === 0) { setAnnounceError("No students in your class roster."); return; }
    if (!announceSubject.trim()) { setAnnounceError("Please enter a subject."); return; }
    if (!announceBody.trim()) { setAnnounceError("Please enter a message."); return; }
    setAnnounceSending(true);
    try {
      const teacherId = getTeacherId();
      const sends = roster.map((s) =>
        fetch("/api/teacher/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId, studentId: s.studentId, title: announceSubject, messageBody: announceBody }),
        })
      );
      await Promise.all(sends);
      setAnnounceSuccess(`Announcement sent to ${roster.length} student${roster.length === 1 ? "" : "s"}'s parents!`);
      setAnnounceSubject("");
      setAnnounceBody("");
      setTimeout(() => setAnnounceSuccess(""), 4000);
      void loadSentMessages();
    } catch {
      setAnnounceError("Failed to send announcement.");
    } finally {
      setAnnounceSending(false);
    }
  }

  // ── Notes state ──────────────────────────────────────────────────────────
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteStudent, setNoteStudent] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [noteSuccess, setNoteSuccess] = useState("");

  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const res = await fetch("/api/teacher/notes");
      if (!res.ok) return;
      const data = await res.json() as { notes: NoteRow[] };
      setNotes(data.notes ?? []);
    } catch {
      // silently fail
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    void loadNotes();
  }, [authed, loadNotes]);

  async function handleSaveNote() {
    setNoteError("");
    setNoteSuccess("");
    if (!noteStudent) { setNoteError("Please select a student."); return; }
    if (!noteText.trim()) { setNoteError("Please enter a note."); return; }
    setNoteSaving(true);
    try {
      const res = await fetch("/api/teacher/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: noteStudent, noteText: noteText.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setNoteError(data.error ?? "Failed to save note.");
      } else {
        setNoteText("");
        setNoteStudent("");
        setNoteSuccess("Note saved.");
        setTimeout(() => setNoteSuccess(""), 2500);
        void loadNotes();
      }
    } catch {
      setNoteError("Failed to save note.");
    } finally {
      setNoteSaving(false);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      await fetch(`/api/teacher/notes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silently fail
    }
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const navStyle: React.CSSProperties = {
    padding: "20px 32px 0",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap" as const,
  };

  const tabBtnBase: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "system-ui,-apple-system,sans-serif",
    fontSize: 13,
    fontWeight: 700,
    paddingBottom: 14,
    letterSpacing: "0.02em",
    borderBottom: "2px solid transparent",
    color: C.muted,
    transition: "color 0.15s",
  };

  // Auth gate
  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/messages">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          background: C.base,
          minHeight: "100vh",
          color: C.text,
          fontFamily: "system-ui,-apple-system,sans-serif",
          paddingBottom: 48,
        }}
      >
        {/* ── Page header ── */}
        <div
          style={{
            padding: "28px 32px 0",
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <Link
                href="/teacher"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.muted,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                <span>&#8592;</span> Dashboard
              </Link>
              <Link
                href="/teacher/command"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.blue,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  background: "rgba(56,189,248,0.08)",
                  borderRadius: 6,
                  padding: "3px 10px",
                }}
              >
                Command Center
              </Link>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.violet,
                marginBottom: 4,
              }}
            >
              Messages &amp; Notes
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: C.text,
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Message Center
            </h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
              Internal student notes and parent communications, all in one place.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 28 }}>
            {TOTAL_UNREAD > 0 && pageTab === "parent-messages" && (
              <div
                style={{
                  background: C.coral,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 12,
                  borderRadius: 20,
                  padding: "4px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                {TOTAL_UNREAD} unread
              </div>
            )}
          </div>
        </div>

        {/* ── Top-level page tabs ── */}
        <div style={navStyle}>
          {(["notes", "parent-messages"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setPageTab(t)}
              style={{
                ...tabBtnBase,
                color: pageTab === t ? C.text : C.muted,
                borderBottom: pageTab === t ? `2px solid ${C.violet}` : "2px solid transparent",
              }}
            >
              {t === "notes" ? "Notes" : "Parent messages"}
            </button>
          ))}
        </div>

        {/* ══════ PAGE TAB: NOTES ══════ */}
        {pageTab === "notes" && (
          <div style={{ padding: "28px 32px", maxWidth: 860 }}>

            {/* Add note form */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 22,
                marginBottom: 28,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 16 }}>
                Add note
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  Student
                </div>
                <select
                  value={noteStudent}
                  onChange={(e) => setNoteStudent(e.target.value)}
                  style={{
                    width: "100%",
                    background: C.inputBg,
                    border: `1.5px solid ${C.inputBorder}`,
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: noteStudent ? C.text : C.muted,
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select a student…</option>
                  {roster.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
                {roster.length === 0 && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    Loading your class roster…
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  Note
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value.slice(0, 500))}
                  placeholder="Write a private note about this student…"
                  rows={3}
                  style={{
                    width: "100%",
                    background: C.inputBg,
                    border: `1.5px solid ${C.inputBorder}`,
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: C.text,
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    lineHeight: 1.55,
                  }}
                />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3, textAlign: "right" }}>
                  {noteText.length}/500
                </div>
              </div>

              {noteError && (
                <div
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: C.coral,
                    marginBottom: 12,
                  }}
                >
                  {noteError}
                </div>
              )}

              {noteSuccess && (
                <div
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: C.mint,
                    marginBottom: 12,
                  }}
                >
                  {noteSuccess}
                </div>
              )}

              <button
                onClick={() => { void handleSaveNote(); }}
                disabled={noteSaving}
                style={{
                  padding: "9px 22px",
                  background: C.violet,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: noteSaving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: noteSaving ? 0.6 : 1,
                  boxShadow: "0 2px 10px rgba(155,114,255,0.3)",
                }}
              >
                {noteSaving ? "Saving…" : "Save note"}
              </button>
            </div>

            {/* Recent notes list */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                Recent notes
              </div>

              {notesLoading && (
                <div style={{ color: C.muted, fontSize: 13 }}>Loading notes…</div>
              )}

              {!notesLoading && notes.length === 0 && (
                <div
                  style={{
                    background: C.cardBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "20px 22px",
                    fontSize: 13,
                    color: C.muted,
                    textAlign: "center",
                  }}
                >
                  No notes yet — add your first note above.
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {notes.map((note) => {
                  const d = new Date(note.created_at);
                  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  return (
                    <div
                      key={note.id}
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        padding: "14px 18px",
                        display: "flex",
                        gap: 14,
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: C.violet,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {note.student_name}
                          </span>
                          <span style={{ fontSize: 11, color: C.muted }}>
                            {dateStr} · {timeStr}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: C.text,
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {note.note_text}
                        </div>
                      </div>
                      <button
                        onClick={() => { void handleDeleteNote(note.id); }}
                        title="Delete note"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: C.muted,
                          cursor: "pointer",
                          fontSize: 16,
                          lineHeight: 1,
                          padding: "2px 6px",
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════ PAGE TAB: PARENT MESSAGES ══════ */}
        {pageTab === "parent-messages" && (
          <div style={{ padding: "28px 32px" }}>

            {/* Inbox tab bar */}
            <div
              style={{
                paddingTop: 4,
                paddingBottom: 0,
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
                borderBottom: `1px solid ${C.border}`,
                marginBottom: 0,
              }}
            >
              {(["inbox", "compose", "announce"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMsgTab(t)}
                  style={{
                    ...tabBtnBase,
                    color: msgTab === t ? C.text : C.muted,
                    borderBottom: msgTab === t ? `2px solid ${C.violet}` : "2px solid transparent",
                  }}
                >
                  {t === "inbox" ? "Sent messages" : t === "compose" ? "New message" : "Announcement"}
                </button>
              ))}
            </div>

            {/* ══ TAB: INBOX ══ */}
            {msgTab === "inbox" && (
              <div style={{ marginTop: 20 }}>
                {sentLoading && (
                  <div style={{ color: C.muted, fontSize: 13, padding: "12px 0" }}>Loading sent messages…</div>
                )}

                {!sentLoading && sentMessages.length === 0 && (
                  <div
                    style={{
                      background: C.cardBg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "28px 24px",
                      fontSize: 13,
                      color: C.muted,
                      textAlign: "center",
                      maxWidth: 520,
                    }}
                  >
                    No messages sent yet — use &ldquo;New message&rdquo; to reach a parent.
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 720 }}>
                  {sentMessages.map((msg) => {
                    const d = new Date(msg.created_at);
                    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                    return (
                      <div
                        key={msg.id}
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                          borderRadius: 12,
                          padding: "14px 18px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: C.violet, letterSpacing: "0.04em" }}>
                            re: {msg.student_name}
                          </span>
                          <span style={{ fontSize: 11, color: C.muted }}>
                            {dateStr} · {timeStr}
                          </span>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 10,
                              fontWeight: 700,
                              color: msg.read ? C.mint : C.amber,
                              background: msg.read ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
                              border: `1px solid ${msg.read ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
                              borderRadius: 6,
                              padding: "2px 8px",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {msg.read ? "Read" : "Unread"}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                          {msg.title}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                          {msg.body}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ TAB: COMPOSE ══ */}
            {msgTab === "compose" && (
              <div style={{ marginTop: 20, display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Compose form */}
                <div
                  style={{
                    flex: "1 1 380px",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 18 }}>
                    New Message
                  </div>

                  {/* Student selector */}
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 5,
                      }}
                    >
                      Student
                    </div>
                    <select
                      value={composeStudent}
                      onChange={(e) => setComposeStudent(e.target.value)}
                      style={{
                        width: "100%",
                        background: C.inputBg,
                        border: `1.5px solid ${C.inputBorder}`,
                        borderRadius: 10,
                        padding: "9px 12px",
                        fontSize: 13,
                        color: composeStudent ? C.text : C.muted,
                        fontFamily: "inherit",
                        outline: "none",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Select a student…</option>
                      {roster.map((s) => (
                        <option key={s.studentId} value={s.studentId}>
                          {s.displayName}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      Messages are delivered in-platform to the student&apos;s parent. No email addresses shared.
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 5,
                      }}
                    >
                      Subject
                    </div>
                    <input
                      value={composeTitle}
                      onChange={(e) => setComposeTitle(e.target.value.slice(0, 120))}
                      placeholder="e.g. Progress update for this week"
                      style={{
                        width: "100%",
                        background: C.inputBg,
                        border: `1.5px solid ${C.inputBorder}`,
                        borderRadius: 10,
                        padding: "9px 12px",
                        fontSize: 13,
                        color: C.text,
                        fontFamily: "inherit",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3, textAlign: "right" }}>
                      {composeTitle.length}/120
                    </div>
                  </div>

                  {/* Message body */}
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 5,
                      }}
                    >
                      Message
                    </div>
                    <textarea
                      value={composeMsgBody}
                      onChange={(e) => setComposeMsgBody(e.target.value.slice(0, 1000))}
                      placeholder="Write your message to the parent…"
                      rows={5}
                      style={{
                        width: "100%",
                        background: C.inputBg,
                        border: `1.5px solid ${C.inputBorder}`,
                        borderRadius: 10,
                        padding: "9px 12px",
                        fontSize: 13,
                        color: C.text,
                        fontFamily: "inherit",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                        lineHeight: 1.55,
                        minHeight: 120,
                      }}
                    />
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3, textAlign: "right" }}>
                      {composeMsgBody.length}/1000
                    </div>
                  </div>

                  {composeError && (
                    <div
                      style={{
                        background: "rgba(248,113,113,0.1)",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        color: C.coral,
                        marginBottom: 12,
                      }}
                    >
                      {composeError}
                    </div>
                  )}

                  {composeSuccess && (
                    <div
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        color: C.mint,
                        marginBottom: 12,
                      }}
                    >
                      &#10003; {composeSuccess}
                    </div>
                  )}

                  <div
                    style={{
                      background: "rgba(34,197,94,0.07)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      borderRadius: 8,
                      padding: "9px 12px",
                      fontSize: 11,
                      color: C.mint,
                      lineHeight: 1.5,
                      marginBottom: 16,
                    }}
                  >
                    &#128274; Messages appear in the parent&apos;s WonderQuest notification feed. Student data is not included unless you write it.
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { void handleSendMessage(); }}
                      disabled={composeSending}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: C.violet,
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: composeSending ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        boxShadow: "0 2px 10px rgba(155,114,255,0.3)",
                        opacity: composeSending ? 0.6 : 1,
                      }}
                    >
                      {composeSending ? "Sending…" : "Send message"}
                    </button>
                    <button
                      onClick={() => setMsgTab("inbox")}
                      style={{
                        padding: "10px 16px",
                        background: "transparent",
                        color: C.muted,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Template sidebar */}
                <div style={{ flex: "0 0 260px" }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 12,
                    }}
                  >
                    Message Templates
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {TEMPLATES.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { setComposeTitle(t.title); setComposeMsgBody(t.body); }}
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          padding: "12px 14px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          color: C.text,
                          transition: "border-color 0.15s",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                          {t.icon} {t.title}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{t.body}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ TAB: ANNOUNCE ══ */}
            {msgTab === "announce" && (
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 24,
                    maxWidth: 580,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>📢</span>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>
                      Class Announcement
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
                    Send a message to all {roster.length > 0 ? roster.length : ""} student{roster.length === 1 ? "" : "s"}&apos; parents in your class. Announcements must not contain individual student names or data — use class-level language only.
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 5,
                      }}
                    >
                      Subject
                    </div>
                    <input
                      value={announceSubject}
                      onChange={(e) => setAnnounceSubject(e.target.value)}
                      style={{
                        width: "100%",
                        background: C.inputBg,
                        border: `1.5px solid ${C.inputBorder}`,
                        borderRadius: 10,
                        padding: "9px 12px",
                        fontSize: 13,
                        color: C.text,
                        fontFamily: "inherit",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 5,
                      }}
                    >
                      Message
                    </div>
                    <textarea
                      value={announceBody}
                      onChange={(e) => setAnnounceBody(e.target.value)}
                      rows={7}
                      style={{
                        width: "100%",
                        background: C.inputBg,
                        border: `1.5px solid ${C.inputBorder}`,
                        borderRadius: 10,
                        padding: "9px 12px",
                        fontSize: 13,
                        color: C.text,
                        fontFamily: "inherit",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                        lineHeight: 1.55,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      borderRadius: 8,
                      padding: "9px 12px",
                      fontSize: 11,
                      color: C.amber,
                      lineHeight: 1.5,
                      marginBottom: 16,
                    }}
                  >
                    &#9888;&#65039; Class announcements must not include individual student names or data. If you need to reference a specific student, send an individual message instead.
                  </div>

                  {announceError && (
                    <div
                      style={{
                        background: "rgba(248,113,113,0.1)",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        color: C.coral,
                        marginBottom: 12,
                      }}
                    >
                      {announceError}
                    </div>
                  )}

                  {announceSuccess && (
                    <div
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        color: C.mint,
                        marginBottom: 12,
                      }}
                    >
                      &#10003; {announceSuccess}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { void handleSendAnnouncement(); }}
                      disabled={announceSending}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: C.blue,
                        color: "#0a0a0a",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: announceSending ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        opacity: announceSending ? 0.6 : 1,
                      }}
                    >
                      {announceSending ? "Sending…" : `Send to ${roster.length} student${roster.length === 1 ? "" : "s"}'s parents`}
                    </button>
                    <button
                      onClick={() => setMsgTab("inbox")}
                      style={{
                        padding: "10px 16px",
                        background: "transparent",
                        color: C.muted,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Privacy notice (always shown) ── */}
        <div
          style={{
            margin: "16px 32px 0",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.18)",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 11,
            color: C.mint,
            lineHeight: 1.5,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span style={{ flexShrink: 0 }}>&#128274;</span>
          <span>
            Notes are private to you. Messages are sent through WonderQuest only — parent contact details are not shared with teachers, and teacher contact details are not shared with parents.
          </span>
        </div>
      </div>
    </AppFrame>
  );
}
