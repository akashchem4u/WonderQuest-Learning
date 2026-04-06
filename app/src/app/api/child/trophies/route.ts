import { NextRequest, NextResponse } from "next/server";
import { requireChildAccessSession } from "@/lib/child-access";

export async function GET(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const { db } = await import("@/lib/db");

    // Check if student_trophies table exists
    const trophies = await db
      .query(
        `select t.id, t.trophy_key, t.display_name, t.description, t.icon_key, t.tier,
                st.earned_at, st.display_seen
         from public.trophy_definitions t
         left join public.student_trophies st
           on st.trophy_id = t.id and st.student_id = $1
         order by st.earned_at desc nulls last, t.sort_order asc
         limit 50`,
        [studentId],
      )
      .catch(() => ({ rows: [] as Record<string, unknown>[] }));

    return NextResponse.json({
      trophies: trophies.rows.map((r) => ({
        id: r.id,
        trophyKey: r.trophy_key,
        displayName: r.display_name,
        description: r.description,
        iconKey: r.icon_key,
        tier: r.tier ?? "bronze",
        earned: !!r.earned_at,
        earnedAt: r.earned_at ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ trophies: [] });
  }
}
