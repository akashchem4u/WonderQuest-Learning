import pg from "pg";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const pool = new pg.Pool({
  host: requireEnv("SUPABASE_DB_HOST"),
  port: Number(requireEnv("SUPABASE_DB_PORT")),
  database: requireEnv("SUPABASE_DB_NAME"),
  user: requireEnv("SUPABASE_DB_USER"),
  password: requireEnv("SUPABASE_DB_PASSWORD"),
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
});

const startedAt = Date.now();

try {
  const result = await pool.query("select now() as now");
  console.log(
    JSON.stringify(
      {
        ok: true,
        responseTimeMs: Date.now() - startedAt,
        timestamp: String(result.rows[0]?.now ?? ""),
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        responseTimeMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} finally {
  await pool.end().catch(() => {});
}
