import { db, hasDatabaseConfig } from "@/lib/db";
import { launchBands } from "@/lib/launch-plan";

export type LaunchStatus = {
  source: "supabase" | "fallback";
  launchBandCount: number;
  skillCount: number;
  templateCount: number;
  bands: {
    code: string;
    theme: string;
  }[];
};

function fallbackStatus(): LaunchStatus {
  return {
    source: "fallback",
    launchBandCount: launchBands.length,
    skillCount: 0,
    templateCount: 0,
    bands: launchBands.map((band) => ({
      code: band.code,
      theme: band.primaryTheme,
    })),
  };
}

export async function getLaunchStatus(): Promise<LaunchStatus> {
  if (!hasDatabaseConfig()) {
    return fallbackStatus();
  }

  try {
    const counts = await db.query(`
      select
        (select count(*) from public.launch_bands) as launch_bands,
        (select count(*) from public.skills) as skills,
        (select count(*) from public.content_templates) as templates
    `);

    const bands = await db.query(`
      select
        lb.code,
        tf.display_name as theme_name
      from public.launch_bands lb
      join public.theme_families tf
        on tf.code = lb.primary_theme_code
      order by lb.sort_order asc
    `);

    return {
      source: "supabase",
      launchBandCount: Number(counts.rows[0]?.launch_bands ?? 0),
      skillCount: Number(counts.rows[0]?.skills ?? 0),
      templateCount: Number(counts.rows[0]?.templates ?? 0),
      bands: bands.rows.map((row) => ({
        code: row.code,
        theme: row.theme_name,
      })),
    };
  } catch (error) {
    console.error("WonderQuest launch status fallback", error);
    return fallbackStatus();
  }
}
