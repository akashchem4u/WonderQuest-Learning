import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// POST /api/admin/merge — merge two profiles
// Body: { type: "student"|"guardian", keepId: string, mergeId: string }
// Transfers all relationships from mergeId → keepId, then deletes mergeId
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;
  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Super admin only." }, { status: 403 });
  }

  let body: { type?: unknown; keepId?: unknown; mergeId?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const type = body.type === "student" || body.type === "guardian" ? body.type : null;
  const keepId = typeof body.keepId === "string" ? body.keepId : null;
  const mergeId = typeof body.mergeId === "string" ? body.mergeId : null;

  if (!type || !keepId || !mergeId) {
    return NextResponse.json({ error: "type, keepId, and mergeId are required." }, { status: 400 });
  }
  if (keepId === mergeId) {
    return NextResponse.json({ error: "keepId and mergeId must be different." }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    if (type === "student") {
      // Transfer guardian links (ignore conflicts — guardian may already be linked to keepId)
      await client.query(`
        INSERT INTO public.guardian_student_links (guardian_id, student_id, relationship_label)
        SELECT guardian_id, $1, relationship_label FROM public.guardian_student_links WHERE student_id = $2
        ON CONFLICT (guardian_id, student_id) DO NOTHING
      `, [keepId, mergeId]);

      // Transfer teacher roster entries
      await client.query(`
        INSERT INTO public.teacher_student_roster (teacher_id, student_id)
        SELECT teacher_id, $1 FROM public.teacher_student_roster WHERE student_id = $2
        ON CONFLICT (teacher_id, student_id) DO NOTHING
      `, [keepId, mergeId]);

      // Transfer challenge sessions
      await client.query(`UPDATE public.challenge_sessions SET student_id = $1 WHERE student_id = $2`, [keepId, mergeId]);

      // Transfer progression states
      await client.query(`
        UPDATE public.progression_states SET student_id = $1 WHERE student_id = $2
        AND NOT EXISTS (SELECT 1 FROM public.progression_states WHERE student_id = $1 AND subject_id = progression_states.subject_id)
      `, [keepId, mergeId]);

      // Transfer student_skill_mastery
      await client.query(`
        UPDATE public.student_skill_mastery SET student_id = $1 WHERE student_id = $2
        AND NOT EXISTS (SELECT 1 FROM public.student_skill_mastery WHERE student_id = $1 AND skill_id = student_skill_mastery.skill_id)
      `, [keepId, mergeId]);

      // Transfer notifications
      await client.query(`UPDATE public.student_notifications SET student_id = $1 WHERE student_id = $2`, [keepId, mergeId]);

      // Delete old links and profile
      await client.query(`DELETE FROM public.guardian_student_links WHERE student_id = $1`, [mergeId]);
      await client.query(`DELETE FROM public.teacher_student_roster WHERE student_id = $1`, [mergeId]);
      await client.query(`DELETE FROM public.student_profiles WHERE id = $1`, [mergeId]);

    } else {
      // guardian merge
      // Transfer student links
      await client.query(`
        INSERT INTO public.guardian_student_links (guardian_id, student_id, relationship_label)
        SELECT $1, student_id, relationship_label FROM public.guardian_student_links WHERE guardian_id = $2
        ON CONFLICT (guardian_id, student_id) DO NOTHING
      `, [keepId, mergeId]);

      // Transfer access sessions
      await client.query(`UPDATE public.access_sessions SET guardian_id = $1 WHERE guardian_id = $2`, [keepId, mergeId]);

      // Delete old links and profile
      await client.query(`DELETE FROM public.guardian_student_links WHERE guardian_id = $1`, [mergeId]);
      await client.query(`DELETE FROM public.guardian_profiles WHERE id = $1`, [mergeId]);
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true, message: `Merged ${type} ${mergeId} → ${keepId}` });
  } catch (err) {
    await client.query("ROLLBACK");
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/merge POST]", err);
    return NextResponse.json({ error: "Internal error during merge." }, { status: 500 });
  } finally {
    client.release();
  }
}
