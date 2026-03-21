import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";
import { loadEnvLocal } from "./load-env-local.mjs";

const { Pool } = pg;

loadEnvLocal();

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function projectPath(...segments) {
  return path.resolve(process.cwd(), "..", ...segments);
}

async function loadJson(relativePath) {
  const file = await readFile(projectPath(relativePath), "utf8");
  return JSON.parse(file);
}

function createPool() {
  return new Pool({
    host: requireEnv("SUPABASE_DB_HOST"),
    port: Number(requireEnv("SUPABASE_DB_PORT")),
    database: requireEnv("SUPABASE_DB_NAME"),
    user: requireEnv("SUPABASE_DB_USER"),
    password: requireEnv("SUPABASE_DB_PASSWORD"),
    ssl: {
      rejectUnauthorized: false,
    },
    max: 4,
  });
}

async function main() {
  const pool = createPool();
  const client = await pool.connect();

  try {
    const [questions, explainers] = await Promise.all([
      loadJson("data/launch/sample_questions.json"),
      loadJson("data/launch/explainers.json"),
    ]);

    await client.query("begin");

    for (const explainer of explainers) {
      await client.query(
        `
          insert into public.explainer_assets (
            explainer_key,
            launch_band_code,
            subject_code,
            format,
            misconception_type,
            script_text,
            media_hint,
            active
          )
          values ($1, $2, $3, $4, $5, $6, $7, true)
          on conflict (explainer_key)
          do update
          set
            launch_band_code = excluded.launch_band_code,
            subject_code = excluded.subject_code,
            format = excluded.format,
            misconception_type = excluded.misconception_type,
            script_text = excluded.script_text,
            media_hint = excluded.media_hint,
            active = true
        `,
        [
          explainer.explainer_key,
          explainer.launch_band,
          explainer.subject,
          explainer.format,
          explainer.misconception,
          explainer.script,
          explainer.media_hint,
        ],
      );
    }

    for (const question of questions) {
      const skill = await client.query(
        `
          select id
          from public.skills
          where code = $1
          limit 1
        `,
        [question.skill],
      );

      if (!skill.rowCount) {
        throw new Error(`Skill not found for question ${question.question_key}`);
      }

      const explainer = explainers.find(
        (item) => item.explainer_key === question.explainer_key,
      );

      await client.query(
        `
          insert into public.example_items (
            example_key,
            skill_id,
            theme_code,
            launch_band_code,
            prompt_text,
            correct_answer,
            distractors,
            explanation_text,
            voice_script,
            media_hint,
            difficulty,
            active
          )
          values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, true)
          on conflict (example_key)
          do update
          set
            skill_id = excluded.skill_id,
            theme_code = excluded.theme_code,
            launch_band_code = excluded.launch_band_code,
            prompt_text = excluded.prompt_text,
            correct_answer = excluded.correct_answer,
            distractors = excluded.distractors,
            explanation_text = excluded.explanation_text,
            voice_script = excluded.voice_script,
            media_hint = excluded.media_hint,
            difficulty = excluded.difficulty,
            active = true
        `,
        [
          question.question_key,
          skill.rows[0].id,
          question.theme,
          question.launch_band,
          question.prompt,
          question.correct_answer,
          JSON.stringify(question.distractors),
          explainer?.script ?? "Guided follow-up explainer.",
          explainer?.script ?? null,
          explainer?.media_hint ?? null,
          question.difficulty,
        ],
      );
    }

    await client.query("commit");

    const counts = await client.query(`
      select
        (select count(*) from public.example_items) as example_items,
        (select count(*) from public.explainer_assets) as explainer_assets
    `);

    console.log(
      JSON.stringify(
        {
          syncedQuestions: questions.length,
          syncedExplainers: explainers.length,
          dbExampleItems: Number(counts.rows[0]?.example_items ?? 0),
          dbExplainers: Number(counts.rows[0]?.explainer_assets ?? 0),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

await main();
