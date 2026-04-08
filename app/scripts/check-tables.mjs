import pg from "pg"; import { existsSync, readFileSync } from "node:fs"; import path from "node:path";
const { Client } = pg;
function loadEnv() {
  const e = path.resolve(process.cwd(),".env.local"); if(!existsSync(e)) return;
  readFileSync(e,"utf8").split(/\r?\n/).forEach(l=>{const s=l.indexOf("=");if(s<0||l.startsWith("#"))return;const k=l.slice(0,s).trim();if(k&&!(k in process.env))process.env[k]=l.slice(s+1).trim().replace(/^["']|["']$/g,"");});
}
loadEnv();
const c=new Client({host:process.env.SUPABASE_DB_HOST,port:parseInt(process.env.SUPABASE_DB_PORT||"5432"),database:process.env.SUPABASE_DB_NAME||"postgres",user:process.env.SUPABASE_DB_USER,password:process.env.SUPABASE_DB_PASSWORD,ssl:{rejectUnauthorized:false}});
await c.connect();
const r=await c.query("select tablename from pg_tables where schemaname='public' order by tablename");
console.log("Tables:",r.rows.map(x=>x.tablename).join(", "));
await c.end();
