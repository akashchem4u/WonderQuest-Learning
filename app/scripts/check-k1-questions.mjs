import pg from "pg"; import { existsSync, readFileSync } from "node:fs"; import path from "node:path";
const { Client } = pg;
function loadEnv() {
  const e = path.resolve(process.cwd(),".env.local"); if(!existsSync(e)) return;
  readFileSync(e,"utf8").split(/\r?\n/).forEach(l=>{const s=l.indexOf("=");if(s<0||l.startsWith("#"))return;const k=l.slice(0,s).trim();if(k&&!(k in process.env))process.env[k]=l.slice(s+1).trim().replace(/^["']|["']$/g,"");});
}
loadEnv();
const c=new Client({host:process.env.SUPABASE_DB_HOST,port:5432,database:process.env.SUPABASE_DB_NAME||"postgres",user:process.env.SUPABASE_DB_USER,password:process.env.SUPABASE_DB_PASSWORD,ssl:{rejectUnauthorized:false}});
await c.connect();

// Simulate the actual content-bank query for K1 guided session
const r = await c.query(`
  select ei.example_key, ei.prompt_text, s.code as skill, s.subject_code
  from public.example_items ei
  join public.skills s on s.id = ei.skill_id
  where ei.active = true
    and s.active = true
    and ei.launch_band_code = $1
  order by random()
  limit 10
`, ['K1']);

console.log('K1 questions available:', r.rows.length > 0 ? 'YES (' + r.rows.length + ' sampled)' : 'NONE - PROBLEM!');
if(r.rows.length > 0) {
  console.log('Sample:', r.rows[0].skill, '|', r.rows[0].subject_code, '|', r.rows[0].prompt_text?.substring(0,60));
}

// Check skill active status
const skills = await c.query(`select code, active, launch_band_code from public.skills where launch_band_code='K1' limit 5`);
console.log('\nK1 skills (sample):', skills.rows.length, 'found');
skills.rows.forEach(s => console.log(' ', s.code, '| active:', s.active));

await c.end();
