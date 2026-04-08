import pg from "pg"; import { existsSync, readFileSync } from "node:fs"; import path from "node:path";
const { Client } = pg;
function loadEnv() {
  const e = path.resolve(process.cwd(),".env.local"); if(!existsSync(e)) return;
  readFileSync(e,"utf8").split(/\r?\n/).forEach(l=>{const s=l.indexOf("=");if(s<0||l.startsWith("#"))return;const k=l.slice(0,s).trim();if(k&&!(k in process.env))process.env[k]=l.slice(s+1).trim().replace(/^["']|["']$/g,"");});
}
loadEnv();
const c=new Client({host:process.env.SUPABASE_DB_HOST,port:5432,database:process.env.SUPABASE_DB_NAME||"postgres",user:process.env.SUPABASE_DB_USER,password:process.env.SUPABASE_DB_PASSWORD,ssl:{rejectUnauthorized:false}});
await c.connect();

// access_sessions columns
const cols = await c.query(`select column_name from information_schema.columns where table_schema='public' and table_name='access_sessions' order by ordinal_position`);
console.log("access_sessions columns:", cols.rows.map(r=>r.column_name).join(", "));

// Recent child sessions for inesh
const as = await c.query(`
  select als.*, sp.display_name, sp.launch_band_code
  from public.access_sessions als
  join public.student_profiles sp on sp.id = als.student_id
  where sp.username in ('inesh', 'testchild')
  order by als.created_at desc limit 5
`);
console.log("\nChild sessions for inesh/testchild:");
if(as.rows.length === 0) console.log("  NONE - no sessions found");
else as.rows.forEach(r=>console.log(" ",r.display_name,"|",r.created_at,"|",r.expires_at));

// Check if progression state exists
const prog = await c.query(`
  select ps.*, sp.display_name 
  from public.progression_states ps
  join public.student_profiles sp on sp.id = ps.student_id
  where sp.username in ('inesh','testchild')
`);
console.log("\nProgression states:");
if(prog.rows.length === 0) console.log("  NONE");
else prog.rows.forEach(r=>console.log(" ",r.display_name,"|total_points:",r.total_points,"|level:",r.current_level));

await c.end();
