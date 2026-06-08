// Lenient, deterministic answer scoring (plan.md §5.2 "Stage 1").
//
// Runs server-side only (in the /api/grade Route Handler) as the fallback when
// no API key is configured or the Haiku call fails — it never ships to the
// browser, so the answer key stays on the server. It is intentionally
// generous: typos, casing, punctuation, the optional "(parenthetical)" parts
// of USCIS answers, and extra filler words must not cause a wrong mark.

const FILLER_PREFIXES = [
  "the answer is",
  "i think it is",
  "i think its",
  "i think",
  "it is",
  "its",
  "it's",
  "maybe",
  "probably",
  "answer",
];

// Tiny words that shouldn't carry meaning when comparing answer tokens.
const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "and", "or", "in", "on", "for",
  "is", "are", "was", "be", "by", "u", "s", "us", "usa",
]);

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalize(input: string): string {
  let s = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // punctuation -> space
    .replace(/\s+/g, " ")
    .trim();

  // Peel off one or more leading filler phrases ("the answer is ...").
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of FILLER_PREFIXES) {
      if (s === prefix) continue;
      if (s.startsWith(prefix + " ")) {
        s = s.slice(prefix.length).trim();
        changed = true;
      }
    }
  }
  return s;
}

function coreTokens(normalized: string): string[] {
  return normalized.split(" ").filter((t) => t && !STOPWORDS.has(t));
}

/** Sørensen–Dice coefficient over character bigrams (0..1). */
function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = (str: string) => {
    const map = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.slice(i, i + 2);
      map.set(bg, (map.get(bg) ?? 0) + 1);
    }
    return map;
  };

  const aBg = bigrams(a);
  const bBg = bigrams(b);
  let overlap = 0;
  let total = 0;
  for (const count of aBg.values()) total += count;
  for (const [bg, count] of bBg) {
    total += count;
    const inA = aBg.get(bg) ?? 0;
    if (inA > 0) overlap += Math.min(inA, count);
  }
  return (2 * overlap) / total;
}

/** Are all of `needle`'s core tokens present in `haystack`'s core tokens? */
function tokensSubset(needle: string[], haystack: Set<string>): boolean {
  if (needle.length === 0) return false;
  return needle.every((t) => haystack.has(t));
}

/** True if the user's answer plausibly matches one acceptable answer. */
function matchesOne(userNorm: string, acceptable: string): boolean {
  const accNorm = normalize(acceptable);
  if (!accNorm) return false;

  if (userNorm === accNorm) return true;

  const userCore = coreTokens(userNorm);
  const accCore = coreTokens(accNorm);
  const userSet = new Set(userCore);
  const accSet = new Set(accCore);

  // Containment in either direction: handles "constitution" vs
  // "(u.s.) constitution", or a correct answer wrapped in extra words.
  if (tokensSubset(accCore, userSet)) return true;
  if (tokensSubset(userCore, accSet)) return true;

  // Whole-string fuzzy match catches typos in multi-word answers.
  if (diceCoefficient(userNorm, accNorm) >= 0.82) return true;

  // Single-concept answers: compare the joined core tokens fuzzily so a
  // one-word typo ("constitiution") still counts.
  const userJoined = userCore.join("");
  const accJoined = accCore.join("");
  if (
    userJoined.length >= 4 &&
    accJoined.length >= 4 &&
    diceCoefficient(userJoined, accJoined) >= 0.8
  ) {
    return true;
  }

  return false;
}

/**
 * Grade an answer against the list of acceptable answers. Returns true if it
 * matches any one of them. Blank / "I don't know" style answers are rejected.
 */
export function scoreAnswer(userAnswer: string, acceptableAnswers: string[]): boolean {
  const userNorm = normalize(userAnswer);
  if (!userNorm) return false;
  if (["i dont know", "dont know", "idk", "skip", "no idea", "pass"].includes(userNorm)) {
    return false;
  }
  return acceptableAnswers.some((acc) => matchesOne(userNorm, acc));
}
