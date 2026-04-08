import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { existsSync, readFileSync } from "node:fs";

const { Client } = pg;

// Load .env.local from cwd
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const sep = rawLine.indexOf("=");
    if (sep === -1) continue;
    const key = rawLine.slice(0, sep).trim();
    if (!key || key in process.env) continue;
    let value = rawLine.slice(sep + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvLocal();

const sql = await readFile("/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/.claude/worktrees/xenodochial-mirzakhani/supabase/migrations/20260407_000012_teacher_notes.sql", "utf8");

const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: parseInt(process.env.SUPABASE_DB_PORT || "5432"),
  database: process.env.SUPABASE_DB_NAME || "postgres",
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

await client.connect();
console.log("Connected to DB");
await client.query(sql);
console.log("Migration 000012 (teacher_notes) applied successfully");
await client.end();
