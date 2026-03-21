import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { readdir } from "node:fs/promises";

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

async function getSqlFiles() {
  const migrationDir = path.join(repoRoot, "supabase", "migrations");
  const migrationFiles = (await readdir(migrationDir))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort()
    .map((fileName) => path.join(migrationDir, fileName));

  return [
    ...migrationFiles,
    path.join(repoRoot, "supabase", "seed", "launch_seed.sql"),
    path.join(repoRoot, "supabase", "seed", "content_seed.sql"),
  ];
}

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
    const sqlFiles = await getSqlFiles();
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
