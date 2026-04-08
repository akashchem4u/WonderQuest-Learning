import pg from "pg"; import { existsSync, readFileSync } from "node:fs"; import path from "node:path";
const { Client } = pg;
function loadEnv() {
  const e = path.resolve(process.cwd(),".env.local"); if(!existsSync(e)) return;
  readFileSync(e,"utf8").split(/\r?\n/).forEach(l=>{const s=l.indexOf("=");if(s<0||l.startsWith("#"))return;const k=l.slice(0,s).trim();if(k&&!(k in process.env))process.env[k]=l.slice(s+1).trim().replace(/^["']|["']$/g,"");});
}
loadEnv();
const c=new Client({host:process.env.SUPABASE_DB_HOST,port:5432,database:process.env.SUPABASE_DB_NAME||"postgres",user:process.env.SUPABASE_DB_USER,password:process.env.SUPABASE_DB_PASSWORD,ssl:{rejectUnauthorized:false}});
await c.connect();

// All real (non-smoke) students
const sp = await c.query(`
  select id, display_name, launch_band_code, username, created_at
  from public.student_profiles 
  where username not like 'backend-%' and username not like 'route-%'
  order by created_at desc limit 10
`);
console.log("Real students:");
sp.rows.forEach(r=>console.log(" ",r.display_name,"|",r.launch_band_code,"|",r.username,"|",r.id));

// Check recent challenge sessions
const cs = await c.query(`
  select cs.id, sp.display_name, cs.session_mode, cs.status, cs.created_at
  from public.challenge_sessions cs
  join public.student_profiles sp on sp.id = cs.student_id
  where sp.username not like 'backend-%'
  order by cs.created_at desc limit 5
`);
console.log("\nRecent challenge sessions:");
if(cs.rows.length === 0) console.log("  NONE");
else cs.rows.forEach(r=>console.log(" ",r.display_name,"|",r.session_mode,"|",r.status,"|",r.created_at));

// Check access_sessions for child login
const as = await c.query(`
  select sp.display_name, sp.launch_band_code, als.created_at, als.expires_at
  from public.access_sessions als
  join public.student_profiles sp on sp.id = als.student_id
  order by als.created_at desc limit 5
`);
console.log("\nRecent child access sessions:");
if(as.rows.length === 0) console.log("  NONE");
else as.rows.forEach(r=>console.log(" ",r.display_name,"|",r.launch_band_code,"|",r.created_at));

await c.end();
