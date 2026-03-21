import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const sqlFiles = [
  path.join(repoRoot, "supabase", "migrations", "20260320_000001_initial_wonderquest_schema.sql"),
  path.join(repoRoot, "supabase", "seed", "launch_seed.sql"),
  path.join(repoRoot, "supabase", "seed", "content_seed.sql"),
];

const client = new Client({
  host: requireEnv("SUPABASE_DB_HOST"),
  port: Number(requireEnv("SUPABASE_DB_PORT")),
  database: requireEnv("SUPABASE_DB_NAME"),
  user: requireEnv("SUPABASE_DB_USER"),
  password: requireEnv("SUPABASE_DB_PASSWORD"),
  ssl: {
    rejectUnauthorized: false,
  },
});

async function applySqlFile(filePath) {
  const sql = await readFile(filePath, "utf8");
  console.log(`Applying ${path.relative(repoRoot, filePath)} ...`);
  await client.query(sql);
}

async function main() {
  await client.connect();
  try {
    for (const filePath of sqlFiles) {
      await applySqlFile(filePath);
    }
    console.log("WonderQuest Supabase foundation applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to apply WonderQuest Supabase foundation.");
  console.error(error);
  process.exitCode = 1;
});
