import pg from "pg";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const { Client } = pg;

function loadEnv() {
  const e = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(e)) return;
  readFileSync(e, "utf8").split(/\r?\n/).forEach((l) => {
    const s = l.indexOf("=");
    if (s < 0 || l.startsWith("#")) return;
    const k = l.slice(0, s).trim();
    if (k && !(k in process.env)) process.env[k] = l.slice(s + 1).trim().replace(/^["']|["']$/g, "");
  });
}

loadEnv();

const c = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: 5432,
  database: process.env.SUPABASE_DB_NAME || "postgres",
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

await c.connect();

// Find Inesh
const find = await c.query(
  `select id, display_name, username, launch_band_code
   from public.student_profiles
   where lower(display_name) like '%inesh%' or lower(username) like '%inesh%'
   order by created_at desc limit 5`
);

if (find.rows.length === 0) {
  console.log("❌ No student found with name/username matching 'inesh'");
  console.log("Listing all students so you can find the right one:");
  const all = await c.query(`select id, display_name, username, launch_band_code from public.student_profiles order by created_at desc limit 20`);
  all.rows.forEach((r) => console.log(`  [${r.launch_band_code}] ${r.display_name} (${r.username}) — id: ${r.id}`));
  await c.end();
  process.exit(1);
}

console.log("Found students:");
find.rows.forEach((r) => console.log(`  [${r.launch_band_code}] ${r.display_name} (${r.username}) — id: ${r.id}`));

const student = find.rows[0];

if (student.launch_band_code === "G23") {
  console.log(`\n✅ ${student.display_name} is already on G23 — no change needed.`);
  await c.end();
  process.exit(0);
}

// Update band to G23
const upd = await c.query(
  `update public.student_profiles set launch_band_code = 'G23' where id = $1 returning id, display_name, launch_band_code`,
  [student.id]
);

console.log(`\n✅ Updated ${upd.rows[0].display_name}: ${student.launch_band_code} → ${upd.rows[0].launch_band_code}`);
console.log("   Next quiz session will use Grade 2–3 questions and difficulty range.");

await c.end();
