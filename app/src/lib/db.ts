import pg from "pg";

const { Pool } = pg;

declare global {
  // eslint-disable-next-line no-var
  var __wonderquestPool: pg.Pool | undefined;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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
  });
}

export const db =
  global.__wonderquestPool ?? (global.__wonderquestPool = createPool());
