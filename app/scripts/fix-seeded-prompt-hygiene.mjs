import process from "node:process";
import pg from "pg";
import { sanitizeQuestionPrompt } from "../../tools/question-prompt-sanitizer.mjs";
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

async function updateBatch(client, rows) {
  if (!rows.length) {
    return 0;
  }

  const keys = rows.map((row) => row.example_key);
  const prompts = rows.map((row) => row.prompt_text);

  const result = await client.query(
    `
      update public.example_items as ei
      set prompt_text = updates.prompt_text
      from unnest(
        $1::text[],
        $2::text[]
      ) as updates(example_key, prompt_text)
      where ei.example_key = updates.example_key
        and ei.source_kind = 'seeded'
        and ei.active = true
    `,
    [keys, prompts],
  );

  return result.rowCount ?? 0;
}

async function main() {
  const pool = createPool();
  const batchSize = Math.max(1, Number(process.env.PROMPT_HYGIENE_FIX_BATCH_SIZE ?? 500) || 500);
  const prefixRegex = `^(${PREFIX_MARKERS.map(escapeRegex).join("|")})`;
  const metaRegex = `(${META_MARKERS.map(escapeRegex).join("|")})`;
  const variantRegex = "variant\\s+[0-9]+[.!?]*$";

  let lastExampleKey = "";
  let scanned = 0;
  let updated = 0;
  let matched = 0;

  try {
    while (true) {
      const result = await pool.query(
        `
          select example_key, prompt_text
          from public.example_items
          where source_kind = 'seeded'
            and active = true
            and example_key > $4
            and (
              prompt_text ~* $1
              or prompt_text ~* $2
              or prompt_text ~* $3
            )
          order by example_key
          limit $5
        `,
        [prefixRegex, metaRegex, variantRegex, lastExampleKey, batchSize],
      );

      if (!result.rows.length) {
        break;
      }

      matched += result.rows.length;
      scanned += result.rows.length;
      lastExampleKey = String(result.rows[result.rows.length - 1]?.example_key ?? lastExampleKey);

      const rowsToUpdate = result.rows
        .map((row) => {
          const prompt = String(row.prompt_text ?? "");
          const sanitized = sanitizeQuestionPrompt(prompt);

          if (sanitized === prompt) {
            return null;
          }

          return {
            example_key: String(row.example_key),
            prompt_text: sanitized,
          };
        })
        .filter(Boolean);

      if (rowsToUpdate.length) {
        updated += await updateBatch(pool, rowsToUpdate);
      }
    }

    console.log(
      JSON.stringify(
        {
          matched,
          scanned,
          updated,
          batchSize,
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
