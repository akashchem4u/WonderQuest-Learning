import pg from "pg";

const { Pool } = pg;

declare global {
  // eslint-disable-next-line no-var
  var __wonderquestPool: pg.Pool | undefined;
  // eslint-disable-next-line no-var
  var __wonderquestPoolErrorHook: boolean | undefined;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function hasDatabaseConfig() {
  return Boolean(
    process.env.SUPABASE_DB_HOST &&
      process.env.SUPABASE_DB_PORT &&
      process.env.SUPABASE_DB_NAME &&
      process.env.SUPABASE_DB_USER &&
      process.env.SUPABASE_DB_PASSWORD,
  );
}

function createPool() {
  return new Pool({
    host: requireEnv("SUPABASE_DB_HOST"),
    port: Number(requireEnv("SUPABASE_DB_PORT")),
    database: requireEnv("SUPABASE_DB_NAME"),
    user: requireEnv("SUPABASE_DB_USER"),
    password: requireEnv("SUPABASE_DB_PASSWORD"),
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    query_timeout: 10000,
    statement_timeout: 10000,
  });
}

export const db =
  global.__wonderquestPool ?? (global.__wonderquestPool = createPool());

if (!global.__wonderquestPoolErrorHook) {
  db.on("error", (error) => {
    console.error("WonderQuest database pool error", error);
  });
  global.__wonderquestPoolErrorHook = true;
}
