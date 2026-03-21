import pg from "pg";
import { launchBands } from "@/lib/launch-plan";

const { Client } = pg;

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

function hasDatabaseEnv() {
  return Boolean(
    process.env.SUPABASE_DB_HOST &&
      process.env.SUPABASE_DB_PORT &&
      process.env.SUPABASE_DB_NAME &&
      process.env.SUPABASE_DB_USER &&
      process.env.SUPABASE_DB_PASSWORD,
  );
}

export async function getLaunchStatus(): Promise<LaunchStatus> {
  if (!hasDatabaseEnv()) {
    return fallbackStatus();
  }

  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: Number(process.env.SUPABASE_DB_PORT),
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    const counts = await client.query(`
      select
        (select count(*) from public.launch_bands) as launch_bands,
        (select count(*) from public.skills) as skills,
        (select count(*) from public.content_templates) as templates
    `);

    const bands = await client.query(`
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
  } catch {
    return fallbackStatus();
  } finally {
    await client.end().catch(() => undefined);
  }
}
