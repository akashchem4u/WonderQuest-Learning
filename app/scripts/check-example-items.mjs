import pg from "pg"; import { existsSync, readFileSync } from "node:fs"; import path from "node:path";
const { Client } = pg;
function loadEnv() {
  const e = path.resolve(process.cwd(),".env.local"); if(!existsSync(e)) return;
  readFileSync(e,"utf8").split(/\r?\n/).forEach(l=>{const s=l.indexOf("=");if(s<0||l.startsWith("#"))return;const k=l.slice(0,s).trim();if(k&&!(k in process.env))process.env[k]=l.slice(s+1).trim().replace(/^["']|["']$/g,"");});
}
loadEnv();
const c=new Client({host:process.env.SUPABASE_DB_HOST,port:5432,database:process.env.SUPABASE_DB_NAME||"postgres",user:process.env.SUPABASE_DB_USER,password:process.env.SUPABASE_DB_PASSWORD,ssl:{rejectUnauthorized:false}});
await c.connect();

// Columns
const cols = await c.query(`select column_name from information_schema.columns where table_schema='public' and table_name='example_items' order by ordinal_position`);
console.log("example_items columns:", cols.rows.map(r=>r.column_name).join(", "));

// Count
const r = await c.query(`select launch_band_code, count(*) as n from public.example_items group by launch_band_code order by launch_band_code`);
console.log("\nItems per band:");
if(r.rows.length===0) console.log("  EMPTY!");
else r.rows.forEach(x=>console.log(" ",x.launch_band_code,"→",x.n));

// Recent students
const sp = await c.query(`select display_name, launch_band_code, username from public.student_profiles order by created_at desc limit 5`);
console.log("\nRecent students:");
sp.rows.forEach(r=>console.log(" ",r.display_name,"|",r.launch_band_code,"|",r.username));

await c.end();
