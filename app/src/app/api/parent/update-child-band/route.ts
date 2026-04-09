import { NextRequest, NextResponse } from "next/server";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";
import { db } from "@/lib/db";
import { getEssentialSkills, getOnTrackSkills } from "@/lib/curriculum-standards";

const VALID_BANDS = ["PREK", "K1", "G23", "G45"] as const;
type BandCode = (typeof VALID_BANDS)[number];

function isValidBand(code: unknown): code is BandCode {
  return typeof code === "string" && (VALID_BANDS as readonly string[]).includes(code);
}

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const body = await request.json();
    const { childId, launchBandCode } = body as { childId?: string; launchBandCode?: string };

    if (!childId || typeof childId !== "string") {
      return NextResponse.json({ error: "childId is required." }, { status: 400 });
    }

    if (!isValidBand(launchBandCode)) {
      return NextResponse.json(
        { error: `Invalid band. Must be one of: ${VALID_BANDS.join(", ")}.` },
        { status: 400 },
      );
    }

    // Verify the guardian owns this student
    const link = await db.query(
      `select 1
       from public.guardian_student_links
       where guardian_id = $1 and student_id = $2
       limit 1`,
      [guardianId, childId],
    );

    if (!link.rowCount) {
      return NextResponse.json({ error: "Child not linked to this account." }, { status: 403 });
    }

    await db.query(
      `update public.student_profiles set launch_band_code = $1 where id = $2`,
      [launchBandCode, childId],
    );

    // ── Smart grade cascade: push starter quests only for skills not yet mastered ──
    try {
      // Get all skills the child has meaningful mastery on (from any band)
      const masteryResult = await db.query(
        `select sk.code
         from public.student_skill_mastery ssm
         join public.skills sk on sk.id = ssm.skill_id
         where ssm.student_id = $1 and ssm.mastery_score >= 40`,
        [childId],
      );
      const masteredCodes = new Set<string>(masteryResult.rows.map((r) => String(r.code)));

      // Get essential + on-track skills for the new band, prioritizing essential
      const essentialSkills = getEssentialSkills(launchBandCode);
      const onTrackSkills = getOnTrackSkills(launchBandCode);
      const allNewBandSkills = [...essentialSkills, ...onTrackSkills];

      // Only push skills the child has NOT yet practiced
      const newSkills = allNewBandSkills
        .filter((skill) => !masteredCodes.has(skill.code))
        .slice(0, 3);

      if (newSkills.length > 0) {
        // Remove any unconsumed auto-generated grade-level quests (old band starters)
        await db.query(
          `delete from public.guardian_pushed_activities
           where student_id = $1 and consumed_at is null and note like 'Grade level:%'`,
          [childId],
        );

        // Push up to 3 starter quests for the genuinely new skills
        for (const skill of newSkills) {
          await db.query(
            `insert into public.guardian_pushed_activities (guardian_id, student_id, skill_code, note, pushed_at)
             values ($1, $2, $3, $4, now())`,
            [guardianId, childId, skill.code, `Grade level: ${launchBandCode} starter`],
          );
        }
      }
    } catch {
      // Non-fatal: band update already succeeded
    }

    return NextResponse.json({ success: true, launchBandCode });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Band update failed." },
      { status },
    );
  }
}
