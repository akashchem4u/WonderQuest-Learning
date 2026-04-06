import process from "node:process";
import pg from "pg";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createDbPool() {
  return new pg.Pool({
    host: requireEnv("SUPABASE_DB_HOST"),
    port: Number(requireEnv("SUPABASE_DB_PORT")),
    database: requireEnv("SUPABASE_DB_NAME"),
    user: requireEnv("SUPABASE_DB_USER"),
    password: requireEnv("SUPABASE_DB_PASSWORD"),
    ssl: {
      rejectUnauthorized: false,
    },
    max: 4,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  });
}

async function deleteByCount(pool, sql) {
  const result = await pool.query(sql);
  return result.rowCount ?? 0;
}

async function main() {
  const pool = createDbPool();

  try {
    await pool.query("begin");

    const counts = {
      feedbackItems: await deleteByCount(
        pool,
        `
          delete from public.feedback_items fi
          where exists (
            select 1
            from public.guardian_profiles gp
            where gp.id = fi.guardian_id
              and (
                gp.username like 'backend-%'
                or gp.username like 'qa-%'
              )
          )
             or exists (
               select 1
               from public.student_profiles sp
               where sp.id = fi.student_id
                 and (
                   sp.username like 'backend-%'
                   or sp.username like 'qa-%'
                 )
             )
        `,
      ),
      teacherProfiles: await deleteByCount(
        pool,
        `
          delete from public.teacher_profiles
          where tester_flag = true
            and (
              email like '%@wonderquest-smoke.local'
              or display_name ilike 'Smoke %'
            )
        `,
      ),
      guardianProfiles: await deleteByCount(
        pool,
        `
          delete from public.guardian_profiles
          where username like 'backend-%'
             or username like 'qa-%'
        `,
      ),
      studentProfiles: await deleteByCount(
        pool,
        `
          delete from public.student_profiles
          where username like 'backend-%'
             or username like 'qa-%'
        `,
      ),
      accessSessions: await deleteByCount(
        pool,
        `
          delete from public.access_sessions
          where guardian_id is null
            and student_id is null
            and expires_at < now() - interval '1 day'
        `,
      ),
    };

    await pool.query("commit");
    console.log(JSON.stringify({ cleaned: counts }, null, 2));
  } catch (error) {
    await pool.query("rollback");
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
