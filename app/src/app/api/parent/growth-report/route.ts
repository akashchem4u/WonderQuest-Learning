import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";
import { getCurriculumForBand } from "@/lib/curriculum-standards";

// ── Types ────────────────────────────────────────────────────────────────────

export type SubjectMastery = {
  subject: string;
  label: string;
  emoji: string;
  skillCount: number;
  masteredCount: number;
  avgMastery: number; // 0–100
  color: string;
};

export type MasteredSkill = {
  skillName: string;
  subject: string;
  proficientAt: string; // ISO date
  masteryScore: number;
};

export type SkillInProgress = {
  skillName: string;
  subject: string;
  masteryScore: number;
  sessionCount: number;
  priority: string;
  parentTip: string;
};

export type SkillNotStarted = {
  skillName: string;
  subject: string;
  priority: string;
  parentAction: string;
};

export type GradeReadiness = {
  essential: { mastered: number; total: number };
  onTrack: { mastered: number; total: number };
  enrichment: { mastered: number; total: number };
  overallPct: number; // weighted curriculum-completion 0–100 (essentials 60%, on-track 30%, enrichment 10%)
  bandCode: string;
  bandLabel: string;
};

export type LearningPattern = {
  avgSessionMinutes: number | null;
  totalSessions30d: number;
  bestDayLabel: string | null; // "Monday", "Tuesday", etc.
  consistencyPct: number; // distinct active days / 30 days (multi-session days count once)
  avgAccuracy30d: number | null;
};

export type GrowthReport = {
  studentId: string;
  displayName: string;
  bandCode: string;
  gradeReadiness: GradeReadiness;
  subjectMastery: SubjectMastery[];
  masteredSkills: MasteredSkill[];
  skillsInProgress: SkillInProgress[];
  skillsNotStarted: SkillNotStarted[];
  topStrengths: MasteredSkill[];
  learningPattern: LearningPattern;
};

// ── Subject metadata ─────────────────────────────────────────────────────────

const SUBJECT_META: Record<string, { label: string; emoji: string; color: string }> = {
  math:           { label: "Math",                    emoji: "🔢", color: "#38bdf8" },
  reading:        { label: "Reading",                 emoji: "📖", color: "#9b72ff" },
  phonics:        { label: "Phonics & Decoding",      emoji: "🔤", color: "#f59e0b" },
  writing:        { label: "Writing",                 emoji: "✍️",  color: "#22c55e" },
  science:        { label: "Science",                 emoji: "🔬", color: "#06b6d4" },
  "social-studies": { label: "Social Studies",        emoji: "🌍", color: "#ffd166" },
  logic:          { label: "Logic & Problem Solving", emoji: "🧩", color: "#c084fc" },
  "early-literacy": { label: "Early Literacy",        emoji: "📚", color: "#fb923c" },
};

// ── Parent tips by subject ───────────────────────────────────────────────────

const SUBJECT_TIPS: Record<string, { inProgress: string; notStarted: string }> = {
  math: {
    inProgress: "Practice counting real objects at home — coins, toys, or steps. Short 5-minute daily sessions beat long weekly sessions for math fluency.",
    notStarted: "Play number games together: count items on grocery trips or use a simple number line to explore this skill before introducing it in the app.",
  },
  reading: {
    inProgress: "Read aloud together for 10 minutes daily. Let your child point to words as you read — this builds confidence and reinforces what they're building in the app.",
    notStarted: "Start with familiar, simple books on this topic. Library picture books are excellent entry points before practice sessions in the app.",
  },
  phonics: {
    inProgress: "Sound out words together when reading signs, labels, or menus. Make it a fun game — 'Can you sound out that word?'",
    notStarted: "Letter-sound songs and foam bath letters are wonderful hands-on tools to introduce phonics concepts playfully.",
  },
  writing: {
    inProgress: "Encourage journaling or drawing with short captions. Even a sentence a day builds the hand-eye coordination and confidence writing requires.",
    notStarted: "Start with tracing activities or drawing shapes together. Building fine motor skills sets the foundation for confident writing.",
  },
  science: {
    inProgress: "Connect this topic to everyday life — cooking involves chemistry, plants involve biology. Ask open-ended 'what do you think?' questions.",
    notStarted: "Simple at-home experiments (mixing colors, growing a bean) are a wonderful spark. Watch a short age-appropriate science video together first.",
  },
  "social-studies": {
    inProgress: "Look at maps together, talk about community helpers you encounter during the day, or explore family heritage through photos and stories.",
    notStarted: "Books from the library on community, history, or geography are a great warm-up before introducing this in structured practice.",
  },
  logic: {
    inProgress: "Puzzles, pattern-block games, and simple board games all reinforce logic skills. Even spotting patterns in nature counts!",
    notStarted: "Start with sorting and matching activities — by color, shape, or size. These build the foundational pattern-recognition logic needs.",
  },
  "early-literacy": {
    inProgress: "Read together daily and ask 'what happens next?' questions. Retelling stories in their own words builds comprehension and vocabulary naturally.",
    notStarted: "Shared reading — you read, they listen and point to pictures — builds vocabulary and print awareness before formal practice.",
  },
};

function getBandLabel(code: string): string {
  if (code === "PREK" || code === "P0") return "Pre-Kindergarten";
  if (code === "K1" || code === "P1") return "Kindergarten – Grade 1";
  if (code === "G23" || code === "P2") return "Grade 2 – 3";
  if (code === "G45" || code === "P3") return "Grade 4 – 5";
  if (code === "G6") return "Grade 6";
  return code;
}

function dayLabel(dow: number): string {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dow] ?? "Unknown";
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId =
      request.nextUrl.searchParams.get("studentId")?.trim() ||
      request.nextUrl.searchParams.get("childId")?.trim();

    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    // Verify ownership
    const linkCheck = await db.query(
      `select 1 from public.guardian_student_links where guardian_id = $1 and student_id = $2 limit 1`,
      [guardianId, studentId],
    );
    if (!linkCheck.rowCount) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Student profile
    const profileRes = await db.query(
      `select display_name, launch_band_code from public.student_profiles where id = $1 limit 1`,
      [studentId],
    );
    if (!profileRes.rowCount) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const { display_name: displayName, launch_band_code: bandCode } = profileRes.rows[0] as {
      display_name: string; launch_band_code: string;
    };

    // Curriculum skills for this band
    const curriculum = getCurriculumForBand(bandCode);
    const skillCodes = curriculum.map((s) => s.code);

    // All mastery records for this student
    const masteryRes = await db.query(
      `select
         sk.code as skill_code,
         sk.display_name as skill_name,
         sk.subject_code as subject,
         ssm.mastery_score,
         ssm.session_count,
         ssm.proficient_at
       from public.student_skill_mastery ssm
       join public.skills sk on sk.id = ssm.skill_id
       where ssm.student_id = $1`,
      [studentId],
    );

    type MasteryRow = {
      skill_code: string;
      skill_name: string;
      subject: string;
      mastery_score: number;
      session_count: number;
      proficient_at: string | null;
    };

    const masteryByCode = new Map<string, MasteryRow>();
    for (const row of masteryRes.rows as MasteryRow[]) {
      masteryByCode.set(row.skill_code, row);
    }

    // ── Grade readiness ──────────────────────────────────────────────────────
    let essentialMastered = 0, essentialTotal = 0;
    let onTrackMastered = 0, onTrackTotal = 0;
    let enrichmentMastered = 0, enrichmentTotal = 0;

    for (const skill of curriculum) {
      const m = masteryByCode.get(skill.code);
      if (skill.priority === "essential") {
        essentialTotal++;
        if (m?.proficient_at) essentialMastered++;
      } else if (skill.priority === "on-track") {
        onTrackTotal++;
        if (m?.proficient_at) onTrackMastered++;
      } else if (skill.priority === "enrichment") {
        enrichmentTotal++;
        if (m?.proficient_at) enrichmentMastered++;
      }
    }

    // Weighted readiness: essentials count 60%, on-track 30%, enrichment 10%
    const essentialPct = essentialTotal > 0 ? essentialMastered / essentialTotal : 0;
    const onTrackPct = onTrackTotal > 0 ? onTrackMastered / onTrackTotal : 0;
    const enrichmentPct = enrichmentTotal > 0 ? enrichmentMastered / enrichmentTotal : 0;
    const overallPct = Math.round((essentialPct * 60 + onTrackPct * 30 + enrichmentPct * 10));

    const gradeReadiness: GradeReadiness = {
      essential: { mastered: essentialMastered, total: essentialTotal },
      onTrack: { mastered: onTrackMastered, total: onTrackTotal },
      enrichment: { mastered: enrichmentMastered, total: enrichmentTotal },
      overallPct,
      bandCode,
      bandLabel: getBandLabel(bandCode),
    };

    // ── Subject mastery breakdown ────────────────────────────────────────────
    const subjectMap = new Map<string, { scores: number[]; mastered: number; total: number }>();
    for (const skill of curriculum) {
      const subj = skill.subject;
      if (!subjectMap.has(subj)) subjectMap.set(subj, { scores: [], mastered: 0, total: 0 });
      const entry = subjectMap.get(subj)!;
      entry.total++;
      const m = masteryByCode.get(skill.code);
      if (m) {
        entry.scores.push(m.mastery_score);
        if (m.proficient_at) entry.mastered++;
      }
    }

    const subjectMastery: SubjectMastery[] = [];
    for (const [subj, data] of subjectMap) {
      const meta = SUBJECT_META[subj] ?? { label: subj, emoji: "📝", color: "#8b949e" };
      const avgMastery = data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0;
      subjectMastery.push({
        subject: subj,
        label: meta.label,
        emoji: meta.emoji,
        skillCount: data.total,
        masteredCount: data.mastered,
        avgMastery,
        color: meta.color,
      });
    }
    subjectMastery.sort((a, b) => b.avgMastery - a.avgMastery);

    // ── Skills mastered (timeline) ───────────────────────────────────────────
    const masteredSkills: MasteredSkill[] = [];
    for (const skill of curriculum) {
      const m = masteryByCode.get(skill.code);
      if (m?.proficient_at) {
        masteredSkills.push({
          skillName: m.skill_name,
          subject: skill.subject,
          proficientAt: m.proficient_at,
          masteryScore: Math.round(m.mastery_score),
        });
      }
    }
    masteredSkills.sort((a, b) => new Date(b.proficientAt).getTime() - new Date(a.proficientAt).getTime());

    // Top strengths: highest-mastery proficient skills
    const topStrengths = [...masteredSkills]
      .sort((a, b) => b.masteryScore - a.masteryScore)
      .slice(0, 3);

    // ── Skills in progress ───────────────────────────────────────────────────
    const skillsInProgress: SkillInProgress[] = [];
    for (const skill of curriculum) {
      const m = masteryByCode.get(skill.code);
      if (m && !m.proficient_at && m.mastery_score > 0) {
        const tips = SUBJECT_TIPS[skill.subject] ?? SUBJECT_TIPS["reading"];
        skillsInProgress.push({
          skillName: m.skill_name,
          subject: skill.subject,
          masteryScore: Math.round(m.mastery_score),
          sessionCount: m.session_count ?? 0,
          priority: skill.priority,
          parentTip: tips.inProgress,
        });
      }
    }
    // Sort: essential first, then by mastery desc
    skillsInProgress.sort((a, b) => {
      const po = { essential: 0, "on-track": 1, enrichment: 2, challenge: 3 };
      const pa = po[a.priority as keyof typeof po] ?? 3;
      const pb = po[b.priority as keyof typeof po] ?? 3;
      if (pa !== pb) return pa - pb;
      return b.masteryScore - a.masteryScore;
    });

    // ── Skills not yet started (essential + on-track only, limit 6) ──────────
    const skillsNotStarted: SkillNotStarted[] = [];
    const notStartedSkills = curriculum.filter(
      (s) => (s.priority === "essential" || s.priority === "on-track") && !masteryByCode.has(s.code)
    );
    for (const skill of notStartedSkills.slice(0, 6)) {
      const tips = SUBJECT_TIPS[skill.subject] ?? SUBJECT_TIPS["reading"];
      skillsNotStarted.push({
        skillName: skill.name,
        subject: skill.subject,
        priority: skill.priority,
        parentAction: tips.notStarted,
      });
    }

    // ── Learning patterns (last 30 days) ────────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const patternRes = await db.query(
      `select
         extract(dow from cs.started_at) as dow,
         count(*) as session_count,
         avg(extract(epoch from (cs.ended_at - cs.started_at)) / 60.0) as avg_minutes,
         sum(sr_correct.cnt) as correct_total,
         sum(sr_all.cnt) as total_questions
       from public.challenge_sessions cs
       left join lateral (
         select count(*) filter (where correct) as cnt
         from public.session_results where session_id = cs.id
       ) sr_correct on true
       left join lateral (
         select count(*) as cnt
         from public.session_results where session_id = cs.id
       ) sr_all on true
       where cs.student_id = $1
         and cs.started_at >= $2
       group by extract(dow from cs.started_at)
       order by session_count desc`,
      [studentId, thirtyDaysAgo.toISOString()],
    );

    type PatternRow = { dow: number; session_count: string; avg_minutes: string | null; correct_total: string; total_questions: string };

    const allPatternRows = patternRes.rows as PatternRow[];
    const totalSessions30d = allPatternRows.reduce((sum, r) => sum + Number(r.session_count), 0);
    const totalCorrect = allPatternRows.reduce((sum, r) => sum + Number(r.correct_total ?? 0), 0);
    const totalQs = allPatternRows.reduce((sum, r) => sum + Number(r.total_questions ?? 0), 0);

    const avgMinutesRaw = allPatternRows
      .filter((r) => r.avg_minutes !== null)
      .map((r) => Number(r.avg_minutes));
    const avgSessionMinutes = avgMinutesRaw.length > 0
      ? Math.round(avgMinutesRaw.reduce((a, b) => a + b, 0) / avgMinutesRaw.length)
      : null;

    const bestDayRow = allPatternRows[0];
    const bestDayLabel = bestDayRow && Number(bestDayRow.session_count) > 0
      ? dayLabel(Number(bestDayRow.dow))
      : null;

    const distinctDaysRes = await db.query(
      `select count(distinct date_trunc('day', started_at at time zone 'UTC')::date) as active_days
       from public.challenge_sessions
       where student_id = $1 and started_at >= $2`,
      [studentId, thirtyDaysAgo.toISOString()],
    );
    const activeDays30d = Number(distinctDaysRes.rows[0]?.active_days ?? 0);

    const consistencyPct = Math.min(100, Math.round((activeDays30d / 30) * 100));
    const avgAccuracy30d = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : null;

    const learningPattern: LearningPattern = {
      avgSessionMinutes,
      totalSessions30d,
      bestDayLabel,
      consistencyPct,
      avgAccuracy30d,
    };

    const growthReport: GrowthReport = {
      studentId,
      displayName,
      bandCode,
      gradeReadiness,
      subjectMastery,
      masteredSkills,
      skillsInProgress,
      skillsNotStarted,
      topStrengths,
      learningPattern,
    };

    return NextResponse.json({ report: growthReport });

  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load growth report" },
      { status },
    );
  }
}
