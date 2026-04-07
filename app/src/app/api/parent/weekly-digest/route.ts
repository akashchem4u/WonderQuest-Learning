import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";

// Returns a short AI-generated narrative summarising a child's learning week.
// Falls back gracefully to a template narrative if OpenAI is unavailable.

function parseWeekOffset(value: string | null): number {
  const parsed = Number(value ?? "");
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function startOfWeekUtc(offsetWeeks: number): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const mondayIndex = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - mondayIndex - offsetWeeks * 7);
  return d;
}

function bandName(code: string): string {
  if (code === "PREK" || code === "P0") return "Pre-K";
  if (code === "K1" || code === "P1") return "Kindergarten–Grade 1";
  if (code === "G23" || code === "P2") return "Grade 2–3";
  if (code === "G45" || code === "P3") return "Grade 4–5";
  return code;
}

// Simple template narrative when AI is unavailable
function templateNarrative(
  firstName: string,
  sessions: number,
  accuracy: number | null,
  topSkill: string | null,
  milestones: string[],
): string {
  const sessionPhrase =
    sessions === 0 ? "took a break this week" :
    sessions === 1 ? "completed 1 learning session" :
    `completed ${sessions} learning sessions`;

  const accuracyPhrase = accuracy !== null
    ? ` with ${Math.round(accuracy)}% accuracy`
    : "";

  const milestonePhrase = milestones.length > 0
    ? ` A highlight moment: ${firstName} reached proficiency in ${milestones[0]}! 🎉`
    : "";

  const topSkillPhrase = topSkill && milestones.length === 0
    ? ` The most-practiced skill this week was ${topSkill}.`
    : "";

  return `${firstName} ${sessionPhrase}${accuracyPhrase} this week.${milestonePhrase}${topSkillPhrase} Keep up the great momentum!`;
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 200,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId =
      request.nextUrl.searchParams.get("studentId")?.trim() ||
      request.nextUrl.searchParams.get("childId")?.trim();
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }
    const weekOffset = parseWeekOffset(request.nextUrl.searchParams.get("weekOffset"));

    // Verify guardian owns student
    const linkCheck = await db.query(
      `select 1 from public.guardian_student_links where guardian_id = $1 and student_id = $2 limit 1`,
      [guardianId, studentId],
    );
    if (!linkCheck.rowCount) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch student profile
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
    const firstName = displayName.split(" ")[0];

    const weekStart = startOfWeekUtc(weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    // Sessions this week
    const sessionsRes = await db.query(
      `select count(*) as cnt,
              sum(correct_count) as correct,
              sum(total_questions) as total
       from public.sessions
       where student_id = $1
         and started_at >= $2
         and started_at < $3
         and completed_at is not null`,
      [studentId, weekStart.toISOString(), weekEnd.toISOString()],
    );
    const sessionRow = sessionsRes.rows[0] as { cnt: string; correct: string; total: string };
    const sessions = Number(sessionRow.cnt ?? 0);
    const correct = Number(sessionRow.correct ?? 0);
    const total = Number(sessionRow.total ?? 0);
    const accuracy = total > 0 ? (correct / total) * 100 : null;

    // Skills practiced this week — top by session involvement
    const skillsRes = await db.query(
      `select sk.display_name as skill_name, count(*) as cnt
       from public.session_items si
       join public.sessions s on s.id = si.session_id
       join public.skills sk on sk.id = si.skill_id
       where s.student_id = $1
         and s.started_at >= $2
         and s.started_at < $3
       group by sk.display_name
       order by cnt desc
       limit 5`,
      [studentId, weekStart.toISOString(), weekEnd.toISOString()],
    );
    const topSkills = (skillsRes.rows as { skill_name: string; cnt: string }[]).map((r) => r.skill_name);

    // Milestones: skills that became proficient this week
    const milestonesRes = await db.query(
      `select sk.display_name as skill_name
       from public.student_skill_mastery ssm
       join public.skills sk on sk.id = ssm.skill_id
       where ssm.student_id = $1
         and ssm.proficient_at >= $2
         and ssm.proficient_at < $3
       order by ssm.proficient_at desc`,
      [studentId, weekStart.toISOString(), weekEnd.toISOString()],
    );
    const milestones = (milestonesRes.rows as { skill_name: string }[]).map((r) => r.skill_name);

    // Skills with lower mastery — areas to grow
    const growthRes = await db.query(
      `select sk.display_name as skill_name, ssm.mastery_score
       from public.student_skill_mastery ssm
       join public.skills sk on sk.id = ssm.skill_id
       where ssm.student_id = $1
         and ssm.proficient_at is null
         and ssm.session_count > 0
       order by ssm.mastery_score asc
       limit 2`,
      [studentId],
    );
    const growthAreas = (growthRes.rows as { skill_name: string; mastery_score: number }[]).map(
      (r) => `${r.skill_name} (${Math.round(r.mastery_score)}%)`,
    );

    // Try to generate AI narrative
    const apiKey = process.env.OPENAI_API_KEY;
    let narrative: string;

    if (apiKey && sessions > 0) {
      const prompt = [
        `You are a warm, encouraging learning coach writing a brief weekly summary for parents about their child's learning progress. Be specific, positive, and non-judgmental. Use exactly 2-3 sentences. Do not use the word "struggled."`,
        ``,
        `Child: ${firstName} (${bandName(bandCode)})`,
        `Sessions completed this week: ${sessions}`,
        accuracy !== null ? `Overall accuracy: ${Math.round(accuracy)}%` : "",
        topSkills.length > 0 ? `Skills practiced: ${topSkills.slice(0, 3).join(", ")}` : "",
        milestones.length > 0 ? `Skills mastered this week: ${milestones.join(", ")} 🎉` : "",
        growthAreas.length > 0 ? `Skills still developing: ${growthAreas.join(", ")}` : "",
        ``,
        `Write a 2-3 sentence summary that celebrates progress, mentions any milestones, and gently notes what to focus on next. Keep it under 80 words.`,
      ].filter(Boolean).join("\n");

      const aiText = await callOpenAI(prompt, apiKey);
      narrative = aiText ?? templateNarrative(firstName, sessions, accuracy, topSkills[0] ?? null, milestones);
    } else {
      narrative = templateNarrative(firstName, sessions, accuracy, topSkills[0] ?? null, milestones);
    }

    return NextResponse.json({
      narrative,
      highlights: {
        sessions,
        accuracy: accuracy !== null ? Math.round(accuracy) : null,
        milestones,
        topSkills: topSkills.slice(0, 3),
        growthAreas: growthAreas.map((g) => g.split(" (")[0]),
      },
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate digest" },
      { status },
    );
  }
}
