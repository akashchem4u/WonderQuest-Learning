import { NextRequest, NextResponse } from "next/server";
import { requireChildAccessSession } from "@/lib/child-access";

export async function GET(request: NextRequest) {
  try {
    const { studentId } = await requireChildAccessSession(request);
    const { db } = await import("@/lib/db");

    // Check if student_badges table exists
    const badges = await db
      .query(
        `select b.id, b.badge_key, b.display_name, b.description, b.icon_key,
                sb.earned_at, sb.display_seen
         from public.badge_definitions b
         left join public.student_badges sb
           on sb.badge_id = b.id and sb.student_id = $1
         order by sb.earned_at desc nulls last, b.sort_order asc
         limit 50`,
        [studentId],
      )
      .catch(() => ({ rows: [] as Record<string, unknown>[] }));

    return NextResponse.json({
      badges: badges.rows.map((r) => ({
        id: r.id,
        badgeKey: r.badge_key,
        displayName: r.display_name,
        description: r.description,
        iconKey: r.icon_key,
        earned: !!r.earned_at,
        earnedAt: r.earned_at ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ badges: [] });
  }
}
