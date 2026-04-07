// virtual-classroom.ts
// Creates a realistic demo classroom of virtual students for a teacher.
// Virtual students are real DB rows that can actually play sessions.

import { db } from "@/lib/db";
import { hashPin } from "@/lib/pin";
import { getCurriculumForBand } from "@/lib/curriculum-standards";

// Culturally diverse first names pool
const FIRST_NAMES = [
  "Aisha","Caleb","Sofia","Marcus","Priya","Noah","Mei","Diego","Amara","Liam",
  "Fatima","Ethan","Yuki","Omar","Isabella","Jayden","Layla","Connor","Zara","Miles",
  "Ananya","Tyler","Bianca","Rafi","Chloe","Malik","Elena","Jordan","Nadia","Sam",
  "Kenji","Rosa","Finn","Amelia","Kwame","Aria","Leo","Sasha","Dante","Nora",
  "Leila","Cole","Maya","Theo","Imani","Remy","Aditi","Blake","Luna","Ezra",
];

const LAST_NAMES = [
  "Johnson","Patel","Garcia","Kim","Williams","Chen","Martinez","Thompson","Ali","Brown",
  "Rodriguez","Nguyen","Davis","Wilson","Okafor","Taylor","Yamamoto","Anderson","Singh","Clark",
];

const AVATARS = ["bunny_purple","bear_blue","lion_gold","fox_orange","panda_green","owl_violet"];

// Mastery distribution archetypes — realistic classroom spread
type MasteryArchetype = "advanced" | "on-track" | "developing" | "foundational";

// 2 advanced, 5 on-track, 4 developing, 4 foundational (for a 15-student class)
const ARCHETYPE_WEIGHTS: MasteryArchetype[] = [
  "advanced","advanced",
  "on-track","on-track","on-track","on-track","on-track",
  "developing","developing","developing","developing",
  "foundational","foundational","foundational","foundational",
];

// Seeded random for deterministic name generation per slot
const used = new Set<string>();

function randomName(): { displayName: string; username: string } {
  let first: string;
  let last: string;
  let displayName: string;
  let attempts = 0;
  do {
    first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    displayName = `${first} ${last}`;
    attempts++;
    if (attempts > 50) break; // safety: avoid infinite loop
  } while (used.has(displayName));
  used.add(displayName);
  const username = `${first.toLowerCase()}${Math.floor(Math.random() * 900 + 100)}`;
  return { displayName, username };
}

function masteryForArchetype(archetype: MasteryArchetype): number {
  switch (archetype) {
    case "advanced": return 82 + Math.floor(Math.random() * 18);
    case "on-track": return 65 + Math.floor(Math.random() * 18);
    case "developing": return 42 + Math.floor(Math.random() * 24);
    case "foundational": return 18 + Math.floor(Math.random() * 25);
  }
}

export async function createVirtualClassroom(
  teacherId: string,
  bandCode: string, // "PREK" | "K1" | "G23" | "G45"
  studentCount = 15,
): Promise<{ created: number; students: Array<{ id: string; displayName: string }> }> {
  const skills = getCurriculumForBand(bandCode);
  const created: Array<{ id: string; displayName: string }> = [];

  // Clear the used name set for this invocation
  used.clear();

  for (let i = 0; i < studentCount; i++) {
    const { displayName, username } = randomName();
    const avatar = AVATARS[i % AVATARS.length];
    const archetype = ARCHETYPE_WEIGHTS[i % ARCHETYPE_WEIGHTS.length];
    const pin = String(1000 + Math.floor(Math.random() * 9000));
    const pinHash = hashPin(pin, username);

    // Ensure username uniqueness
    let finalUsername = username;
    const exists = await db.query(
      `select 1 from public.student_profiles where username = $1 limit 1`,
      [username],
    );
    if (exists.rowCount) {
      finalUsername = `${username}${Math.floor(Math.random() * 99)}`;
    }

    // Insert student profile
    const studentRes = await db.query(
      `insert into public.student_profiles (
        username, display_name, avatar_key, launch_band_code, pin_hash,
        is_virtual, virtual_teacher_id
      ) values ($1, $2, $3, $4, $5, true, $6)
      returning id`,
      [finalUsername, displayName, avatar, bandCode, pinHash, teacherId],
    );

    const studentId = studentRes.rows[0].id as string;

    // Create progression state
    await db.query(
      `insert into public.progression_states (student_id, total_points, current_level, streak_count)
       values ($1, $2, $3, $4) on conflict (student_id) do nothing`,
      [
        studentId,
        Math.floor(Math.random() * 500 + 50),
        Math.floor(Math.random() * 5 + 1),
        Math.floor(Math.random() * 7),
      ],
    );

    // Link to teacher roster
    await db.query(
      `insert into public.teacher_student_roster (teacher_id, student_id)
       values ($1, $2) on conflict do nothing`,
      [teacherId, studentId],
    );

    // Seed realistic mastery data for a subset of skills
    const skillSample = skills.slice(0, Math.min(skills.length, 8));
    for (const skill of skillSample) {
      const base = masteryForArchetype(archetype);
      const variance = Math.floor(Math.random() * 20) - 10;
      const score = Math.min(100, Math.max(0, base + variance));
      const attempts = Math.floor(Math.random() * 15 + 3);
      const correct = Math.floor(attempts * (score / 100));

      // Find skill ID — skip gracefully if not in DB
      const skillRow = await db.query(
        `select id from public.skills where code = $1 limit 1`,
        [skill.code],
      );
      if (!skillRow.rowCount) continue;
      const skillId = skillRow.rows[0].id as string;

      await db.query(
        `insert into public.student_skill_mastery (
          student_id, skill_id, attempts, correct_attempts, mastery_score,
          session_count, last_seen_at, created_at, updated_at
        ) values ($1, $2, $3, $4, $5, $6, now() - interval '1 day' * $7, now(), now())
        on conflict (student_id, skill_id) do update set
          mastery_score = excluded.mastery_score,
          attempts = excluded.attempts,
          correct_attempts = excluded.correct_attempts,
          session_count = excluded.session_count,
          last_seen_at = excluded.last_seen_at,
          updated_at = excluded.updated_at`,
        [
          studentId,
          skillId,
          attempts,
          correct,
          score,
          Math.floor(attempts / 3),
          Math.floor(Math.random() * 14),
        ],
      );
    }

    created.push({ id: studentId, displayName });
  }

  return { created: created.length, students: created };
}

export async function removeVirtualClassroom(teacherId: string): Promise<number> {
  const result = await db.query(
    `delete from public.student_profiles
     where virtual_teacher_id = $1 and is_virtual = true
     returning id`,
    [teacherId],
  );
  return result.rowCount ?? 0;
}

export async function hasVirtualClassroom(teacherId: string): Promise<boolean> {
  const result = await db.query(
    `select 1 from public.student_profiles
     where virtual_teacher_id = $1 and is_virtual = true
     limit 1`,
    [teacherId],
  );
  return (result.rowCount ?? 0) > 0;
}
