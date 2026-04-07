const PROMPT_PREFIX_PATTERNS = [
  /^another prompt:\s*/i,
  /^another try:\s*/i,
  /^analysis check:\s*/i,
  /^analyst check:\s*/i,
  /^concept check:\s*/i,
  /^advanced prompt:\s*/i,
  /^cross-skill round:\s*/i,
  /^extension round:\s*/i,
  /^look again:\s*/i,
  /^new challenge:\s*/i,
  /^new clue:\s*/i,
  /^new picture clue:\s*/i,
  /^new round:\s*/i,
  /^next challenge:\s*/i,
  /^next clue:\s*/i,
  /^next turn:\s*/i,
  /^one more:\s*/i,
  /^practice set:\s*/i,
  /^practice turn:\s*/i,
  /^precision pass:\s*/i,
  /^precision round:\s*/i,
  /^proof check:\s*/i,
  /^quick check:\s*/i,
  /^quest practice:\s*/i,
  /^read this one:\s*/i,
  /^reason it out:\s*/i,
  /^reasoning set:\s*/i,
  /^review step:\s*/i,
  /^skill check:\s*/i,
  /^skill review:\s*/i,
  /^skill turn:\s*/i,
  /^sound check:\s*/i,
  /^stretch prompt:\s*/i,
  /^try another:\s*/i,
  /^try this:\s*/i,
  /^warm-up check:\s*/i,
];

const PROMPT_META_SENTENCE_PATTERNS = [
  /^a higher-band variation is ready[.!?]*$/i,
  /^a new turn is here[.!?]*$/i,
  /^a new variation is ready[.!?]*$/i,
  /^a related variant is ready[.!?]*$/i,
  /^a fresh turn is waiting[.!?]*$/i,
  /^another practice one[.!?]*$/i,
  /^apply the same concept again[.!?]*$/i,
  /^hold onto the evidence trail[.!?]*$/i,
  /^keep exploring[.!?]*$/i,
  /^keep the idea in mind[.!?]*$/i,
  /^keep the pattern in mind[.!?]*$/i,
  /^keep your eyes on the clue[.!?]*$/i,
  /^keep your logic disciplined[.!?]*$/i,
  /^let us keep going[.!?]*$/i,
  /^look for the strongest logic again[.!?]*$/i,
  /^ready for another[.!?]*$/i,
  /^re-check the core principle[.!?]*$/i,
  /^reapply the same principle[.!?]*$/i,
  /^stay focused on the clue[.!?]*$/i,
  /^stay sharp on the concept[.!?]*$/i,
  /^this checks the concept from another angle[.!?]*$/i,
  /^this checks the same idea[.!?]*$/i,
  /^this one checks the same idea[.!?]*$/i,
  /^this one tests transfer across contexts[.!?]*$/i,
  /^this one twists the same concept[.!?]*$/i,
  /^this variant pushes the same concept harder[.!?]*$/i,
  /^this variation tests the same skill[.!?]*$/i,
  /^try a fresh clue[.!?]*$/i,
  /^use precise reasoning here[.!?]*$/i,
  /^use the clue words[.!?]*$/i,
  /^use what you know[.!?]*$/i,
  /^use the same concept again[.!?]*$/i,
  /^use the same proof idea again[.!?]*$/i,
  /^use the same reasoning pattern here[.!?]*$/i,
  /^use the same skill again[.!?]*$/i,
  /^use the same strategy here[.!?]*$/i,
  /^variant \d+[.!?]*$/i,
  /^solve it carefully[.!?]*$/i,
  /^read the choices twice[.!?]*$/i,
  /^look at every detail[.!?]*$/i,
  /^choose the strongest answer[.!?]*$/i,
  /^think step by step[.!?]*$/i,
  /^check the pattern[.!?]*$/i,
  /^you are doing great[.!?]*$/i,
  /^you are ready[.!?]*$/i,
];

const PROMPT_META_FRAGMENT_PATTERNS = [
  /\ba higher-band variation is ready[.!?]*/gi,
  /\ba new turn is here[.!?]*/gi,
  /\ba new variation is ready[.!?]*/gi,
  /\ba related variant is ready[.!?]*/gi,
  /\ba fresh turn is waiting[.!?]*/gi,
  /\banother practice one[.!?]*/gi,
  /\bapply the same concept again[.!?]*/gi,
  /\bhold onto the evidence trail[.!?]*/gi,
  /\bkeep exploring[.!?]*/gi,
  /\bkeep the idea in mind[.!?]*/gi,
  /\bkeep the pattern in mind[.!?]*/gi,
  /\bkeep your eyes on the clue[.!?]*/gi,
  /\bkeep your logic disciplined[.!?]*/gi,
  /\blet us keep going[.!?]*/gi,
  /\blook for the strongest logic again[.!?]*/gi,
  /\bready for another[.!?]*/gi,
  /\bre-check the core principle[.!?]*/gi,
  /\breapply the same principle[.!?]*/gi,
  /\bstay focused on the clue[.!?]*/gi,
  /\bstay sharp on the concept[.!?]*/gi,
  /\bthis checks the concept from another angle[.!?]*/gi,
  /\bthis checks the same idea[.!?]*/gi,
  /\bthis one checks the same idea[.!?]*/gi,
  /\bthis one tests transfer across contexts[.!?]*/gi,
  /\bthis one twists the same concept[.!?]*/gi,
  /\bthis variant pushes the same concept harder[.!?]*/gi,
  /\bthis variation tests the same skill[.!?]*/gi,
  /\btry a fresh clue[.!?]*/gi,
  /\buse precise reasoning here[.!?]*/gi,
  /\buse the clue words[.!?]*/gi,
  /\buse what you know[.!?]*/gi,
  /\buse the same proof idea again[.!?]*/gi,
  /\buse the same reasoning pattern here[.!?]*/gi,
  /\buse the same skill again[.!?]*/gi,
  /\buse the same strategy here[.!?]*/gi,
  /\bvariant\s+\d+[.!?]*/gi,
  /\bsolve it carefully[.!?]*/gi,
  /\bread the choices twice[.!?]*/gi,
  /\blook at every detail[.!?]*/gi,
  /\bchoose the strongest answer[.!?]*/gi,
  /\bthink step by step[.!?]*/gi,
  /\bcheck the pattern[.!?]*/gi,
  /\byou are doing great[.!?]*/gi,
  /\byou are ready[.!?]*/gi,
];

function collapseWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function sanitizeQuestionPrompt(value) {
  let prompt = collapseWhitespace(value);

  if (!prompt) {
    return "";
  }

  for (const pattern of PROMPT_PREFIX_PATTERNS) {
    prompt = prompt.replace(pattern, "");
  }

  for (const pattern of PROMPT_META_FRAGMENT_PATTERNS) {
    prompt = prompt.replace(pattern, " ");
  }

  const sentences = prompt
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter(
      (sentence) =>
        !PROMPT_META_SENTENCE_PATTERNS.some((pattern) => pattern.test(sentence)),
    );

  const sanitized = (sentences.length ? sentences.join(" ") : prompt)
    .replace(/\s+(What (?:was|is|happened|happens))/gi, ". $1")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();

  if (!sanitized) {
    return prompt;
  }

  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
}

export function promptNeedsSanitization(value) {
  return sanitizeQuestionPrompt(value) !== collapseWhitespace(value);
}
