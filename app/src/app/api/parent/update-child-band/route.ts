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

    // ── Gather promotion evidence before updating ──
    const currentBandResult = await db.query(
      `select launch_band_code from public.student_profiles where id = $1`,
      [childId],
    );
    const fromBand: string = currentBandResult.rows[0]?.launch_band_code ?? "unknown";

    // Count proficient skills (mastery_score >= 70) in old band and new band
    const skillCountsResult = await db.query(
      `
        select
          sk.launch_band_code,
          count(*) as total,
          count(*) filter (where ssm.mastery_score >= 70) as proficient
        from public.skills sk
        left join public.student_skill_mastery ssm
          on ssm.skill_id = sk.id and ssm.student_id = $1
        where sk.launch_band_code = any($2::text[])
        group by sk.launch_band_code
      `,
      [childId, [fromBand, launchBandCode]],
    );

    const bandStats: Record<string, { total: number; proficient: number }> = {};
    for (const r of skillCountsResult.rows) {
      bandStats[String(r.launch_band_code)] = {
        total: Number(r.total ?? 0),
        proficient: Number(r.proficient ?? 0),
      };
    }

    const promotionEvidence = {
      fromBand,
      toBand: launchBandCode,
      proficientSkillsInOldBand: bandStats[fromBand]?.proficient ?? 0,
      totalSkillsInOldBand: bandStats[fromBand]?.total ?? 0,
      proficientSkillsInNewBand: bandStats[launchBandCode]?.proficient ?? 0,
      totalSkillsInNewBand: bandStats[launchBandCode]?.total ?? 0,
    };

    await db.query(
      `update public.student_profiles set launch_band_code = $1 where id = $2`,
      [launchBandCode, childId],
    );

    // ── Log band promotion to audit log ──
    try {
      await db.query(
        `
          INSERT INTO public.content_audit_log
            (entity_type, entity_id, action, changed_by, previous_value, new_value, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          "student",
          childId,
          "band_promotion",
          `guardian:${guardianId}`,
          JSON.stringify({ band: fromBand }),
          JSON.stringify({
            band: launchBandCode,
            evidence: promotionEvidence,
          }),
          `Guardian promoted student from ${fromBand} to ${launchBandCode}`,
        ],
      );
    } catch {
      // Non-fatal: band update already succeeded
    }

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

    return NextResponse.json({
      ok: true,
      newBandCode: launchBandCode,
      evidence: {
        proficientInOldBand: promotionEvidence.proficientSkillsInOldBand,
        totalInOldBand: promotionEvidence.totalSkillsInOldBand,
        proficientInNewBand: promotionEvidence.proficientSkillsInNewBand,
        totalInNewBand: promotionEvidence.totalSkillsInNewBand,
      },
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Band update failed." },
      { status },
    );
  }
}
