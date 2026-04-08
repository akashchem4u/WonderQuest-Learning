import process from "node:process";
import pg from "pg";
import {
  promptNeedsSanitization,
  sanitizeQuestionPrompt,
} from "../../tools/question-prompt-sanitizer.mjs";
import { loadEnvLocal } from "./load-env-local.mjs";

const { Pool } = pg;

const PREFIX_MARKERS = [
  "another prompt:",
  "another try:",
  "analysis check:",
  "analyst check:",
  "concept check:",
  "advanced prompt:",
  "cross-skill round:",
  "extension round:",
  "look again:",
  "new challenge:",
  "new clue:",
  "new picture clue:",
  "new round:",
  "next challenge:",
  "next clue:",
  "next turn:",
  "one more:",
  "practice set:",
  "practice turn:",
  "precision pass:",
  "precision round:",
  "proof check:",
  "quick check:",
  "quest practice:",
  "read this one:",
  "reason it out:",
  "reasoning set:",
  "review step:",
  "skill check:",
  "skill review:",
  "skill turn:",
  "sound check:",
  "stretch prompt:",
  "try another:",
  "try this:",
  "warm-up check:",
];

const META_MARKERS = [
  "a higher-band variation is ready",
  "a new turn is here",
  "a new variation is ready",
  "a related variant is ready",
  "a fresh turn is waiting",
  "another practice one",
  "apply the same concept again",
  "hold onto the evidence trail",
  "keep exploring",
  "keep the idea in mind",
  "keep the pattern in mind",
  "keep your eyes on the clue",
  "keep your logic disciplined",
  "let us keep going",
  "look for the strongest logic again",
  "ready for another",
  "re-check the core principle",
  "reapply the same principle",
  "stay focused on the clue",
  "stay sharp on the concept",
  "this checks the concept from another angle",
  "this checks the same idea",
  "this one checks the same idea",
  "this one tests transfer across contexts",
  "this one twists the same concept",
  "this variant pushes the same concept harder",
  "this variation tests the same skill",
  "try a fresh clue",
  "use precise reasoning here",
  "use the same proof idea again",
  "use the same reasoning pattern here",
  "use the same skill again",
  "use the same strategy here",
  "you are doing great",
  "you are ready",
];

loadEnvLocal();

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    max: 2,
  });
}

async function main() {
  const pool = createPool();
  const sampleLimit = Math.max(1, Number(process.env.PROMPT_HYGIENE_SAMPLE_LIMIT ?? 20) || 20);
  const prefixRegex = `^(${PREFIX_MARKERS.map(escapeRegex).join("|")})`;
  const metaRegex = `(${META_MARKERS.map(escapeRegex).join("|")})`;
  const variantRegex = "variant\\s+[0-9]+[.!?]*$";

  try {
    const [countResult, sampleResult] = await Promise.all([
      pool.query(
        `
          select count(*)::int as issue_count
          from public.example_items
          where source_kind = 'seeded'
            and active = true
            and (
              prompt_text ~* $1
              or prompt_text ~* $2
              or prompt_text ~* $3
            )
        `,
        [prefixRegex, metaRegex, variantRegex],
      ),
      pool.query(
        `
          select example_key, launch_band_code, prompt_text
          from public.example_items
          where source_kind = 'seeded'
            and active = true
            and (
              prompt_text ~* $1
              or prompt_text ~* $2
              or prompt_text ~* $3
            )
          order by example_key
          limit $4
        `,
        [prefixRegex, metaRegex, variantRegex, sampleLimit],
      ),
    ]);

    const sample = sampleResult.rows.map((row) => ({
      exampleKey: String(row.example_key),
      launchBandCode: String(row.launch_band_code),
      prompt: String(row.prompt_text),
      promptRequiresCleanup: promptNeedsSanitization(row.prompt_text),
      sanitizedPrompt: sanitizeQuestionPrompt(row.prompt_text),
    }));

    console.log(
      JSON.stringify(
        {
          issueCount: Number(countResult.rows[0]?.issue_count ?? 0),
          sample,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

await main();
