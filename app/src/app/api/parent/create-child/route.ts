import { NextRequest, NextResponse } from "next/server";
import { requireParentAccessSession } from "@/lib/parent-access";
import { createChildForParent } from "@/lib/prototype-service";
import { db } from "@/lib/db";
import { getRequestIpAddress, getRequestUserAgent } from "@/lib/child-access";
import { track } from "@/lib/analytics";
import { canAddChild, getLimits, type Plan } from "@/lib/plan-limits";

const CONSENT_TEXT =
  "I confirm that I am the parent or legal guardian of this child. I give WonderQuest Learning permission to create an educational account and collect the educational data described in the Privacy Policy on behalf of my child.";

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json();

    if (body.coppaConsent !== true) {
      return NextResponse.json(
        { error: "Parental consent is required to create a child account." },
        { status: 400 },
      );
    }

    // Plan gate: check child limit before creating
    const planRow = await db.query(
      `SELECT gp.plan,
              COUNT(gsl.student_id) AS child_count
         FROM public.guardian_profiles gp
         LEFT JOIN public.guardian_student_links gsl ON gsl.guardian_id = gp.id
        WHERE gp.id = $1
        GROUP BY gp.plan`,
      [guardianId],
    );
    const planData = planRow.rows[0] as { plan: string; child_count: string } | undefined;
    const plan = (planData?.plan ?? "free") as Plan;
    const childCount = parseInt(planData?.child_count ?? "0", 10);
    if (!canAddChild(plan, childCount)) {
      const limit = getLimits(plan).maxChildren;
      return NextResponse.json(
        { error: "upgrade_required", limit, plan },
        { status: 403 },
      );
    }

    const result = await createChildForParent(guardianId, body);

    // Store COPPA consent record (immutable audit trail)
    await db.query(
      `INSERT INTO public.coppa_consents (guardian_id, student_id, consent_text, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        guardianId,
        result.child.id,
        CONSENT_TEXT,
        getRequestIpAddress(request),
        getRequestUserAgent(request),
      ],
    );

    void track(guardianId, "child_account_created", { band: result.child.launchBandCode });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create child account." },
      { status: 400 },
    );
  }
}
