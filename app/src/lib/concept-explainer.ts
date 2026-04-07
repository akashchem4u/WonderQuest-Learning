// concept-explainer.ts
// AI-powered teacher engine — when a student answers wrong twice, explains the concept
// in the style of a warm classroom teacher, shows a worked example, then asks a
// gentle check question to verify understanding before moving on.

export type ConceptExplanation = {
  heading: string;       // "Let's understand carrying in addition!"
  explanation: string;   // 2–3 sentences referencing the student's wrong answer
  workedExample: string; // Step-by-step solution for THIS question, "\n"-delimited steps
  tip: string;           // One-sentence memory trick
  checkQuestion: {
    text: string;        // A new question on the same skill (different values)
    options: string[];   // Exactly 3 shuffled options
    correctAnswer: string; // Must match one of options exactly
  };
};

type ExplainerParams = {
  skillCode: string;
  subject: string;           // "math" | "reading" | "phonics" | …
  bandCode: string;          // "K1" | "G23" | "G45" | …
  questionText: string;      // The original question prompt
  studentAnswer: string;     // What the student got wrong
  correctAnswer: string;     // The right answer
  studentFirstName: string;
};

function readingLevelGuide(bandCode: string): string {
  if (
    bandCode === "PREK" || bandCode === "P0" ||
    bandCode === "K1"   || bandCode === "P1"
  ) {
    return (
      "Use very short, simple sentences (5–8 words each). " +
      "Avoid any jargon. Use lots of friendly emojis and encouragement. " +
      "Refer to numbers as 'blocks' or 'things' where possible."
    );
  }
  if (bandCode === "G23" || bandCode === "P2") {
    return (
      "Use clear, friendly language for 7–9 year olds. " +
      "Short sentences. Standard math/phonics terms are fine but always explain them. " +
      "One emoji per section at most."
    );
  }
  // G45 / P3 and above
  return (
    "Use clear language appropriate for 9–11 year olds. " +
    "Standard academic terms are fine. Keep it concise and encouraging."
  );
}

function isEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Generate a concept explanation for a student who answered wrong twice.
 * Returns null if the feature is disabled or if OpenAI fails — callers should
 * treat null as a graceful no-op and let the student continue normally.
 */
export async function generateConceptExplanation(
  params: ExplainerParams,
): Promise<ConceptExplanation | null> {
  if (!isEnabled()) return null;

  const apiKey = process.env.OPENAI_API_KEY!;
  const model  = process.env.OPENAI_CONCEPT_MODEL ?? "gpt-4o-mini";
  const guide  = readingLevelGuide(params.bandCode);
  const first  = params.studentFirstName;

  const systemPrompt = [
    "You are a warm, encouraging elementary school teacher helping a child who just answered a question wrong.",
    "Your job is to explain the concept clearly, show how to solve the EXACT question step by step,",
    "give a memory tip, and create a fresh check question to see if the child now understands.",
    "",
    `Reading level instructions: ${guide}`,
    "",
    "Rules:",
    "- Reference the student's WRONG answer to show exactly where the thinking went wrong.",
    "- The workedExample MUST use the EXACT numbers/words from the original question.",
    "- The checkQuestion MUST test the same concept but use DIFFERENT values/words.",
    "- checkQuestion.options must have EXACTLY 3 items; the correctAnswer must match one of them exactly.",
    "- Never make the child feel bad. Always stay warm and encouraging.",
    "- Respond ONLY with valid JSON matching the schema.",
  ].join("\n");

  const userPrompt = `
Student name: ${first}
Subject: ${params.subject}
Skill: ${params.skillCode}
Original question: "${params.questionText}"
Student's answer (WRONG): "${params.studentAnswer}"
Correct answer: "${params.correctAnswer}"

Generate a JSON object with this exact shape:
{
  "heading": "<short friendly heading, max 8 words>",
  "explanation": "<2–3 sentences explaining the concept, mentioning what ${first} did and why the correct answer is ${params.correctAnswer}>",
  "workedExample": "<step-by-step solution for the EXACT question above, steps separated by \\n, prefix each step with a number e.g. '1. …'>",
  "tip": "<one sentence quick memory trick, max 15 words>",
  "checkQuestion": {
    "text": "<new question on the same skill, DIFFERENT values from the original>",
    "options": ["<correct answer>", "<plausible wrong answer 1>", "<plausible wrong answer 2>"],
    "correctAnswer": "<exact text of the correct option>"
  }
}
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[concept-explainer] OpenAI ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ConceptExplanation;

    // Validate required shape
    if (
      !parsed.heading ||
      !parsed.explanation ||
      !parsed.workedExample ||
      !parsed.tip ||
      !parsed.checkQuestion?.text ||
      !Array.isArray(parsed.checkQuestion.options) ||
      parsed.checkQuestion.options.length < 2 ||
      !parsed.checkQuestion.correctAnswer
    ) {
      console.error("[concept-explainer] Unexpected shape from OpenAI");
      return null;
    }

    // Ensure correctAnswer is present in options
    if (!parsed.checkQuestion.options.includes(parsed.checkQuestion.correctAnswer)) {
      parsed.checkQuestion.options[0] = parsed.checkQuestion.correctAnswer;
    }

    // Trim to 3 options maximum
    parsed.checkQuestion.options = parsed.checkQuestion.options.slice(0, 3);

    // Shuffle options so correct answer isn't always first
    parsed.checkQuestion.options = shuffleArray(parsed.checkQuestion.options);

    return parsed;
  } catch (e) {
    console.error("[concept-explainer] Error:", e);
    return null;
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
