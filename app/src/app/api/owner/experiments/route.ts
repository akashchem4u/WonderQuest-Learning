import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabaseConfig, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

const EXPERIMENTS = [
  {
    key: "live_question_generation",
    name: "Live AI Question Generation",
    description: "Generate questions via OpenAI instead of using the static bank",
    defaultEnabled: process.env.OPENAI_QUESTION_GENERATION_ENABLED === "1",
    defaultTraffic: 100,
  },
  {
    key: "adaptive_difficulty",
    name: "Adaptive Difficulty",
    description: "Adjust question difficulty based on recent performance",
    defaultEnabled: true,
    defaultTraffic: 100,
  },
  {
    key: "hint_ladder",
    name: "Hint Ladder",
    description: "Progressive hint system in play (eliminates wrong answers)",
    defaultEnabled: true,
    defaultTraffic: 100,
  },
  {
    key: "pre_reader_tts",
    name: "Pre-reader TTS Auto-read",
    description: "Auto-read prompts for PREK/K1 bands via Web Speech API",
    defaultEnabled: true,
    defaultTraffic: 100,
  },
  {
    key: "streak_shield",
    name: "Streak Shield",
    description: "Show streak protection indicator on session complete",
    defaultEnabled: true,
    defaultTraffic: 100,
  },
];

type OverrideRow = {
  key: string;
  enabled: boolean;
  traffic_percent: number;
  kill_switch_at: string | null;
  updated_at: string;
};

async function fetchOverrides(): Promise<Map<string, OverrideRow>> {
  const map = new Map<string, OverrideRow>();
  if (!hasDatabaseConfig()) return map;
  try {
    // Check if table exists before querying
    const tableCheck = await db.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'experiment_overrides'
    `);
    if (tableCheck.rows.length === 0) return map;

    const result = await db.query(
      `SELECT key, enabled, traffic_percent, kill_switch_at, updated_at
       FROM public.experiment_overrides`,
    );
    for (const row of result.rows) {
      map.set(row.key, row as OverrideRow);
    }
  } catch {
    // Non-fatal — return defaults
  }
  return map;
}

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (!auth.ok) return auth.response;

  const overrides = await fetchOverrides();

  const experiments = EXPERIMENTS.map((exp) => {
    const ov = overrides.get(exp.key);
    return {
      key: exp.key,
      name: exp.name,
      description: exp.description,
      enabled: ov ? ov.enabled : exp.defaultEnabled,
      trafficPercent: ov ? ov.traffic_percent : exp.defaultTraffic,
      killSwitchAt: ov?.kill_switch_at ?? null,
      updatedAt: ov?.updated_at ?? null,
    };
  });

  return NextResponse.json({ experiments });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (!auth.ok) return auth.response;

  let body: {
    key?: string;
    enabled?: boolean;
    trafficPercent?: number;
    killSwitch?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { key, enabled, trafficPercent, killSwitch } = body;

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  const valid = EXPERIMENTS.find((e) => e.key === key);
  if (!valid) {
    return NextResponse.json({ error: "Unknown experiment key" }, { status: 400 });
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const isEnabled = killSwitch ? false : (enabled ?? true);
    const killAtValue: string | null = killSwitch ? new Date().toISOString() : null;
    const traffic = typeof trafficPercent === "number" ? trafficPercent : 100;

    await db.query(
      `INSERT INTO public.experiment_overrides (key, enabled, traffic_percent, kill_switch_at, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, now(), 'owner')
       ON CONFLICT (key) DO UPDATE SET
         enabled = EXCLUDED.enabled,
         traffic_percent = EXCLUDED.traffic_percent,
         kill_switch_at = EXCLUDED.kill_switch_at,
         updated_at = now(),
         updated_by = 'owner'`,
      [key, isEnabled, traffic, killAtValue],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/owner/experiments PATCH]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
