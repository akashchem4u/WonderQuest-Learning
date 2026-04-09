import { NextRequest, NextResponse } from "next/server";
import { requireChildAccessSession, ChildAccessSessionError } from "@/lib/child-access";
import { db } from "@/lib/db";

// ─── Skill → display label map ────────────────────────────────────────────────

function skillLabel(skillCode: string): string {
  const map: Record<string, string> = {
    "count-objects":          "Counting Objects",
    "compare-numbers":        "Compare Numbers",
    "skip-count-by-5":        "Skip Count by 5s",
    "number-bonds-to-5":      "Number Bonds to 5",
    "add-to-10":              "Add to 10",
    "subtract-from-10":       "Subtract from 10",
    "time-to-hour":           "Telling Time",
    "bigger-smaller":         "Bigger & Smaller",
    "letter-recognition":     "Letter Recognition",
    "short-a-sound":          "Short A Sound",
    "short-e-sound":          "Short E Sound",
    "short-i-sound":          "Short I Sound",
    "rhyme-recognition":      "Rhyming Words",
    "color-recognition":      "Colors",
    "shape-circle":           "Circle Shape",
    "shape-triangle":         "Triangle Shape",
    "read-simple-word":       "Sight Words",
    "cause-effect":           "Cause & Effect",
    "historical-cause-effect":"Historical Cause & Effect",
    "paragraph-sequence":     "Paragraph Sequence",
  };
  return map[skillCode] ?? skillCode.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function skillSubject(skillCode: string): "math" | "reading" | "literacy" {
  const mathSkills = ["count", "compare", "skip-count", "number-bonds", "add", "subtract", "time", "bigger", "smaller", "shape"];
  const mathMatch = mathSkills.some((k) => skillCode.includes(k));
  if (mathMatch) return "math";
  const literacySkills = ["letter", "short-a", "short-e", "short-i", "rhyme", "color", "read", "cause", "paragraph", "phonics", "sequence"];
  if (literacySkills.some((k) => skillCode.includes(k))) return "literacy";
  return "reading";
}

export async function GET(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);

    const [parentRows, teacherRows] = await Promise.all([
      db.query(
        `select id, skill_code, priority, note, pushed_at
         from public.guardian_pushed_activities
         where student_id = $1 and consumed_at is null
         order by priority desc, pushed_at asc
         limit 10`,
        [studentId],
      ),
      db.query(
        `select id, skill_code, priority, note, reason, pushed_at
         from public.teacher_pushed_sessions
         where student_id = $1 and consumed_at is null
         order by priority desc, pushed_at asc
         limit 10`,
        [studentId],
      ),
    ]);

    type RawRow = {
      id: string;
      skill_code: string;
      priority: string;
      note: string | null;
      reason?: string | null;
      pushed_at: string;
    };

    const parentQuests = (parentRows.rows as RawRow[]).map((r) => ({
      id: r.id,
      source: "parent" as const,
      skillCode: r.skill_code,
      label: skillLabel(r.skill_code),
      subject: skillSubject(r.skill_code),
      priority: r.priority,
      note: r.note ?? null,
      pushedAt: r.pushed_at,
    }));

    const teacherQuests = (teacherRows.rows as RawRow[]).map((r) => ({
      id: r.id,
      source: "teacher" as const,
      skillCode: r.skill_code,
      label: skillLabel(r.skill_code),
      subject: skillSubject(r.skill_code),
      priority: r.priority,
      note: r.note ?? r.reason ?? null,
      pushedAt: r.pushed_at,
    }));

    return NextResponse.json({ parentQuests, teacherQuests });
  } catch (error) {
    const status = error instanceof ChildAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load quests." },
      { status },
    );
  }
}
