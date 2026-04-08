import dns from "node:dns/promises";
import net from "node:net";
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

const host = requireEnv("SUPABASE_DB_HOST");
const port = Number(requireEnv("SUPABASE_DB_PORT"));
const database = requireEnv("SUPABASE_DB_NAME");
const user = requireEnv("SUPABASE_DB_USER");
const password = requireEnv("SUPABASE_DB_PASSWORD");
const timeoutMs = Number(process.env.WONDERQUEST_DB_DIAG_TIMEOUT_MS || "5000");

async function resolveHost() {
  const startedAt = Date.now();

  try {
    return {
      ok: true,
      durationMs: Date.now() - startedAt,
      lookup: await dns.lookup(host, { all: true }),
      ipv4: await dns.resolve4(host).catch((error) => ({
        error: error instanceof Error ? error.message : String(error),
      })),
      ipv6: await dns.resolve6(host).catch((error) => ({
        error: error instanceof Error ? error.message : String(error),
      })),
    };
  } catch (error) {
    return {
      ok: false,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testTcpConnect() {
  const startedAt = Date.now();

  return await new Promise((resolve) => {
    const socket = net.connect({ host, port });

    const finish = (result) => {
      socket.destroy();
      resolve({
        durationMs: Date.now() - startedAt,
        ...result,
      });
    };

    socket.once("connect", () => finish({ ok: true }));
    socket.once("error", (error) =>
      finish({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }));
    socket.setTimeout(timeoutMs, () => finish({ ok: false, error: "timeout" }));
  });
}

async function testPostgresSslRequest() {
  const startedAt = Date.now();

  return await new Promise((resolve) => {
    const socket = net.connect({ host, port });

    const finish = (result) => {
      socket.destroy();
      resolve({
        durationMs: Date.now() - startedAt,
        ...result,
      });
    };

    socket.once("connect", () => {
      const sslRequest = Buffer.alloc(8);
      sslRequest.writeInt32BE(8, 0);
      sslRequest.writeInt32BE(80877103, 4);
      socket.write(sslRequest);
    });

    socket.once("data", (chunk) =>
      finish({
        ok: true,
        bytes: Array.from(chunk),
        text: chunk.toString("utf8"),
      }));
    socket.once("error", (error) =>
      finish({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }));
    socket.setTimeout(timeoutMs, () => finish({ ok: false, error: "timeout" }));
  });
}

async function testPgConnect() {
  const startedAt = Date.now();
  const client = new pg.Client({
    host,
    port,
    database,
    user,
    password,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: timeoutMs,
  });

  try {
    await client.connect();
    const query = await client.query("select now() as now");
    return {
      ok: true,
      durationMs: Date.now() - startedAt,
      timestamp: String(query.rows[0]?.now ?? ""),
    };
  } catch (error) {
    return {
      ok: false,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await client.end().catch(() => {});
  }
}

function inferLikelyCause(results) {
  if (!results.dns.ok) {
    return "DNS resolution failed before any network connection could start.";
  }

  if (!results.tcp.ok) {
    return "The database host did not accept a basic TCP connection.";
  }

  if (!results.sslRequest.ok && !results.pg.ok) {
    return "TCP is open, but Postgres protocol bytes are not receiving a response. This usually points to a local network, firewall, or device policy blocking Postgres traffic after connect.";
  }

  if (!results.pg.ok) {
    return "Postgres connect still failed after a protocol response. Check DB credentials, SSL config, or pooler settings.";
  }

  return "Postgres connectivity looks healthy.";
}

const results = {
  host,
  port,
  timeoutMs,
  dns: await resolveHost(),
  tcp: await testTcpConnect(),
  sslRequest: await testPostgresSslRequest(),
  pg: await testPgConnect(),
};

results.inference = inferLikelyCause(results);

console.log(JSON.stringify(results, null, 2));

if (!results.pg.ok) {
  process.exitCode = 1;
}
