import pg from "pg";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
const { Client } = pg;
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  readFileSync(envPath, "utf8").split(/\r?\n/).forEach(line => {
    const sep = line.indexOf("=");
    if (sep === -1 || line.startsWith("#")) return;
    const key = line.slice(0, sep).trim();
    if (key && !(key in process.env)) process.env[key] = line.slice(sep+1).trim().replace(/^["']|["']$/g, "");
  });
}
loadEnv();
const client = new Client({
  host: process.env.SUPABASE_DB_HOST, port: parseInt(process.env.SUPABASE_DB_PORT||"5432"),
  database: process.env.SUPABASE_DB_NAME||"postgres",
  user: process.env.SUPABASE_DB_USER, password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});
await client.connect();
const r = await client.query(`
  select launch_band_code, count(*) as q_count
  from public.content_questions
  where deleted_at is null
  group by launch_band_code order by launch_band_code
`);
console.log("Questions per band:");
r.rows.forEach(row => console.log(" ", row.launch_band_code, "→", row.q_count));
const sp = await client.query(`
  select display_name, launch_band_code, username from public.student_profiles order by created_at desc limit 5
`);
console.log("\nRecent students:");
sp.rows.forEach(r => console.log(" ", r.display_name, "|", r.launch_band_code, "|", r.username));
await client.end();
