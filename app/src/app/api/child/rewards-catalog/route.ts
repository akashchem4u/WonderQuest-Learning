// GET /api/child/rewards-catalog
// Returns all active badge + trophy definitions with earned flag for the current child.
import { NextRequest, NextResponse } from "next/server";
import { requireChildAccessSession } from "@/lib/child-access";

export async function GET(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const { db } = await import("@/lib/db");

    const [badgesResult, trophiesResult] = await Promise.all([
      db.query(
        `select b.id, b.badge_key, b.display_name, b.description, b.icon_key,
                b.emoji, b.category, b.required_value, b.sort_order,
                sb.earned_at
         from public.badge_definitions b
         left join public.student_badges sb
           on sb.badge_id = b.id and sb.student_id = $1
         where b.is_active = true
         order by b.sort_order asc, b.created_at asc`,
        [studentId],
      ),
      db.query(
        `select t.id, t.trophy_key, t.display_name, t.description, t.icon_key,
                t.emoji, t.tier, t.category, t.required_value, t.sort_order,
                st.earned_at
         from public.trophy_definitions t
         left join public.student_trophies st
           on st.trophy_id = t.id and st.student_id = $1
         where t.is_active = true
         order by t.sort_order asc, t.created_at asc`,
        [studentId],
      ),
    ]);

    return NextResponse.json({
      badges: badgesResult.rows.map((r) => ({
        id: r.id as string,
        badgeKey: r.badge_key as string,
        displayName: r.display_name as string,
        description: r.description as string,
        iconKey: (r.icon_key ?? null) as string | null,
        emoji: r.emoji as string,
        category: r.category as string,
        requiredValue: r.required_value as number,
        earned: !!r.earned_at,
        earnedAt: (r.earned_at ?? null) as string | null,
      })),
      trophies: trophiesResult.rows.map((r) => ({
        id: r.id as string,
        trophyKey: r.trophy_key as string,
        displayName: r.display_name as string,
        description: r.description as string,
        iconKey: (r.icon_key ?? null) as string | null,
        emoji: r.emoji as string,
        tier: r.tier as string,
        category: r.category as string,
        requiredValue: r.required_value as number,
        earned: !!r.earned_at,
        earnedAt: (r.earned_at ?? null) as string | null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
