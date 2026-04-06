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
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    query_timeout: 15000,
    statement_timeout: 15000,
  });
}

function resetPool() {
  if (global.__wonderquestPool) {
    global.__wonderquestPool.end().catch(() => {/* ignore cleanup errors */});
    global.__wonderquestPool = undefined;
    global.__wonderquestPoolErrorHook = undefined;
  }
}

function getPool(): pg.Pool {
  if (!global.__wonderquestPool) {
    global.__wonderquestPool = createPool();
  }
  if (!global.__wonderquestPoolErrorHook) {
    global.__wonderquestPool.on("error", (error) => {
      console.error("WonderQuest database pool error", error);
      // Reset the pool on fatal errors so the next query gets a fresh one
      resetPool();
    });
    global.__wonderquestPoolErrorHook = true;
  }
  return global.__wonderquestPool;
}

function isConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return (
    msg.includes("timeout") ||
    msg.includes("connect") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound") ||
    msg.includes("econnreset") ||
    msg.includes("pool")
  );
}

/** Drop-in replacement for db.query that auto-retries once on connection errors. */
export async function queryWithRetry(
  sql: string,
  params?: unknown[],
): Promise<pg.QueryResult> {
  try {
    return await getPool().query(sql, params as pg.QueryConfigValues<unknown[]>);
  } catch (firstErr) {
    if (!isConnectionError(firstErr)) throw firstErr;
    // Connection was stale — reset the pool and try once more
    console.warn("WonderQuest DB connection error, resetting pool and retrying…", firstErr instanceof Error ? firstErr.message : firstErr);
    resetPool();
    await new Promise((r) => setTimeout(r, 500));
    return await getPool().query(sql, params as pg.QueryConfigValues<unknown[]>);
  }
}

export const db = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    const pool = getPool();
    const value = (pool as unknown as Record<string | symbol, unknown>)[prop];
    // Wrap query() with automatic one-shot retry on stale-connection errors.
    // This transparently handles kids who sit on a question for 10+ minutes.
    if (prop === "query" && typeof value === "function") {
      return async (...args: unknown[]) => {
        try {
          return await (value as (...a: unknown[]) => Promise<unknown>).apply(pool, args);
        } catch (firstErr) {
          if (!isConnectionError(firstErr)) throw firstErr;
          console.warn(
            "WonderQuest DB stale connection — resetting pool and retrying once:",
            firstErr instanceof Error ? firstErr.message : firstErr,
          );
          resetPool();
          await new Promise((r) => setTimeout(r, 600));
          const freshPool = getPool();
          const freshQuery = (freshPool as unknown as Record<string | symbol, unknown>)["query"];
          return await (freshQuery as (...a: unknown[]) => Promise<unknown>).apply(freshPool, args);
        }
      };
    }
    return typeof value === "function"
      ? (value as (...a: unknown[]) => unknown).bind(pool)
      : value;
  },
});
