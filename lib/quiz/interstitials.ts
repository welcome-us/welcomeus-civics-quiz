// Welcoming messages + study tips shown between questions.
//
// Every 3–4 answered questions the quiz pauses on a full-screen "breather": a
// dark-themed card with one message from the bucket below. The break is always
// optional — a single button skips straight to the next question.
//
// ⚠️ PLACEHOLDER COPY. The bucket below is structured, not final: the team is
// writing the real messages. Swap the `eyebrow` / `headline` / `body` (and drop
// in `image`) per entry and nothing else has to change — the scheduling logic
// reads the bucket generically and adapts to any length.

import { shuffle, TOTAL_QUESTIONS } from "./state";

/** Which inline glyph the card draws in its art frame. */
export type InterstitialIcon =
  | "star"
  | "flag"
  | "book"
  | "lightbulb"
  | "hands"
  | "map";

export interface InterstitialMessage {
  /** Stable id — also the analytics label, so keep it if you reword the copy. */
  id: string;
  /** "welcome" = mission/encouragement, "tip" = test-taking or study advice. */
  kind: "welcome" | "tip";
  eyebrow: string;
  headline: string;
  body: string;
  icon: InterstitialIcon;
  /**
   * Optional artwork replacing the placeholder frame. Use a raster asset in
   * /public (png/webp) — plain-string SVG paths would have to go through the
   * image optimizer, which rejects them without `dangerouslyAllowSVG`.
   */
  image?: { src: string; alt: string; width: number; height: number };
  /** Optional "learn more" link rendered under the body copy. */
  link?: { label: string; href: string };
}

export const INTERSTITIALS: readonly InterstitialMessage[] = [
  {
    id: "belonging",
    kind: "welcome",
    eyebrow: "Welcome.US",
    headline: "You belong here.",
    body: "Every person taking this test is doing something brave — choosing a country, and being chosen back. Whatever your score today, that part is already true.",
    icon: "star",
  },
  {
    id: "newcomers-strengthen",
    kind: "welcome",
    eyebrow: "Did you know",
    headline: "Newcomers make communities stronger.",
    body: "Immigrants and their children have started more than 40% of America's largest companies — and they show up as neighbors, nurses, and teachers long before anyone counts them.",
    icon: "flag",
  },
  {
    id: "say-it-out-loud",
    kind: "tip",
    eyebrow: "Study tip",
    headline: "Say your answers out loud.",
    body: "The real interview is spoken, not written. Practicing aloud trains both your recall and your ear, so the officer's phrasing feels familiar on test day.",
    icon: "lightbulb",
  },
  {
    id: "short-answers-win",
    kind: "tip",
    eyebrow: "Study tip",
    headline: "Short answers are enough.",
    body: "You don't need a full sentence. \"The Constitution\" counts. Officers are listening for the key fact, not an essay — extra words only add room for error.",
    icon: "book",
  },
  {
    id: "not-alone",
    kind: "welcome",
    eyebrow: "You're not alone",
    headline: "Nobody should have to study alone.",
    body: "Welcome.US pairs green card holders with volunteers who study alongside them, one question at a time. Most say the encouragement mattered as much as the answers.",
    icon: "hands",
    link: { label: "Meet the Citizen Guide program", href: "https://welcome.us/citizenship" },
  },
  {
    id: "ten-of-one-hundred",
    kind: "tip",
    eyebrow: "Good to know",
    headline: "The real test is 10 questions.",
    body: "An officer picks 10 from the official bank of 100 and stops as soon as you get 6 right. We ask 20 here so you get more practice per sitting.",
    icon: "book",
  },
  {
    id: "mistakes-are-practice",
    kind: "welcome",
    eyebrow: "Keep going",
    headline: "A wrong answer is just a question you haven't learned yet.",
    body: "The people who pass aren't the ones who never miss — they're the ones who came back to the questions that stung.",
    icon: "star",
  },
  {
    id: "most-people-pass",
    kind: "welcome",
    eyebrow: "Did you know",
    headline: "About 9 in 10 applicants pass.",
    body: "The civics test has a high pass rate, and you get a second chance if the first attempt doesn't go your way. Nerves are normal; the odds are on your side.",
    icon: "flag",
  },
  {
    id: "study-in-your-language",
    kind: "tip",
    eyebrow: "Study tip",
    headline: "Learn the idea first, the English second.",
    body: "Understand what a branch of government does in whichever language you think in. The English words attach much faster once the concept is already yours.",
    icon: "lightbulb",
  },
  {
    id: "know-your-state",
    kind: "tip",
    eyebrow: "Study tip",
    headline: "Some answers depend on where you live.",
    body: "Your governor, your senators, your representative — those change by state and over time. Look yours up once and check them again close to your interview.",
    icon: "map",
  },
  {
    id: "little-and-often",
    kind: "tip",
    eyebrow: "Study tip",
    headline: "Ten minutes a day beats one long cram.",
    body: "Spacing practice across days is how facts move into long-term memory. A short round on the bus does more than an anxious hour the night before.",
    icon: "lightbulb",
  },
  {
    id: "share-the-quiz",
    kind: "welcome",
    eyebrow: "Welcome.US",
    headline: "Most Americans born here couldn't pass this.",
    body: "When you're done, send this to a friend who's never had to prove it. Understanding the test is its own kind of welcome.",
    icon: "hands",
  },
];

/** The break lands after this many answered questions, at minimum. */
export const MIN_GAP = 3;
/** …and at most this many. Picked per gap so the rhythm isn't metronomic. */
export const MAX_GAP = 4;

function randomGap(): number {
  return MIN_GAP + Math.floor(Math.random() * (MAX_GAP - MIN_GAP + 1));
}

/**
 * Build a session's break schedule, keyed by the number of questions answered
 * when the break should appear. So a key of 3 means: after the 3rd answer is
 * graded and the user taps "Next question", show that message before question 4.
 *
 * Messages are drawn from a shuffled pool, so a session never repeats one and
 * two sessions rarely look alike. Nothing is scheduled at `total` — the last
 * answer ends the quiz, and a breather in front of the result screen would only
 * stand between the user and their score.
 */
export function planInterstitials(
  total: number = TOTAL_QUESTIONS,
  pool: readonly InterstitialMessage[] = INTERSTITIALS,
): Map<number, InterstitialMessage> {
  const picks = shuffle(pool);
  const plan = new Map<number, InterstitialMessage>();

  let answered = randomGap();
  for (let i = 0; answered < total && i < picks.length; i++) {
    plan.set(answered, picks[i]);
    answered += randomGap();
  }

  return plan;
}
