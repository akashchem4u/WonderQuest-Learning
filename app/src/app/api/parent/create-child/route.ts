import { NextRequest, NextResponse } from "next/server";
import { requireParentAccessSession } from "@/lib/parent-access";
import { createChildForParent } from "@/lib/prototype-service";
import { db } from "@/lib/db";
import { getRequestIpAddress, getRequestUserAgent } from "@/lib/child-access";
import { track } from "@/lib/analytics";

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
