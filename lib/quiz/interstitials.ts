// Welcome.US messages shown between questions.
//
// Every 3–4 answered questions the quiz pauses on a full-screen "breather": a
// dark-themed card with one message from the bucket below. The break is always
// optional — a single button skips straight to the next question.
//
// The copy below is the team's approved set: 8 Citizen Guides messages plus 4
// testimonial quotes. Swapping copy means editing the three strings per entry —
// the scheduling logic reads the bucket generically and adapts to any length,
// so adding or cutting messages needs no code change.

import { shuffle, TOTAL_QUESTIONS } from "./state";

/**
 * Which piece of Welcome.US artwork the card draws. Every value here needs a
 * matching illustration in InterstitialGlyphs.
 */
export type InterstitialIcon = "star" | "flag" | "lightbulb" | "hands";

export interface InterstitialMessage {
  /** Stable id — also the analytics label, so keep it if you reword the copy. */
  id: string;
  /** "welcome" = Citizen Guides message, "quote" = someone's own words. */
  kind: "welcome" | "quote";
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
    id: "nobody-studies-alone",
    kind: "welcome",
    eyebrow: "Citizen Guides",
    headline: "Nobody should study alone.",
    body: "Welcome.US's Citizen Guide program pairs a volunteer with legal green card holders, studying for this exact test. They meet virtually, covering one question at a time.",
    icon: "hands",
  },
  {
    id: "want-to-help",
    kind: "welcome",
    eyebrow: "Citizen Guides",
    headline: "Want to help someone pass?",
    body: "People across the country are studying to become citizens right now. When you finish your quiz, you can find out how to walk alongside one of them.",
    icon: "flag",
  },
  {
    id: "good-neighbors",
    kind: "welcome",
    eyebrow: "Everyday good",
    headline: "Good neighbors are everywhere.",
    body: "Most people just want to lend a hand where they can. Helping someone virtually prepare for their citizenship test is one small way to do exactly that.",
    icon: "hands",
  },
  {
    id: "help-a-future-citizen",
    kind: "welcome",
    eyebrow: "Pay it forward",
    headline: "Help a future citizen.",
    body: "You're attempting real questions on the U.S. citizenship exam. Right now, someone nearby is studying those same questions, hoping to become an American.",
    icon: "flag",
  },
  {
    id: "by-the-book",
    kind: "welcome",
    eyebrow: "Did you know?",
    headline: "They're doing it by the book.",
    body: "The people Citizen Guides help are here legally, playing by the rules, and studying hard to earn their citizenship. They'd love a study partner.",
    icon: "star",
  },
  {
    id: "helping-gives-back",
    kind: "welcome",
    eyebrow: "Why it helps",
    headline: "Helping others gives back.",
    body: "Citizen Guides say they come away with more than they gave. It's only one hour a week that ultimately changes someone's life.",
    icon: "hands",
  },
  {
    id: "no-expert-needed",
    kind: "welcome",
    eyebrow: "Citizen Guides",
    headline: "You don't need to be an expert.",
    body: "Most Citizen Guides start out unsure they could pass this test themselves. In fact, two-thirds of people born in the U.S. can't. What matters isn't the answers; it's showing up.",
    icon: "lightbulb",
  },
  {
    id: "one-hour-a-week",
    kind: "welcome",
    eyebrow: "Citizen Guides",
    headline: "One neighbor, one hour a week.",
    body: "Being a Citizen Guide isn't a big commitment. It's one person helping another feel ready. A few hours that can mean everything to someone earning citizenship.",
    icon: "hands",
  },
  {
    id: "quote-heather",
    kind: "quote",
    eyebrow: "In their words",
    headline: "A volunteer who tutors for this test.",
    body: "“It's the most impactful thing I've ever done in my life. I'm a mom and a grandmother, I was a teacher. I'm a wife.” —Heather",
    icon: "hands",
  },
  {
    id: "quote-susie",
    kind: "quote",
    eyebrow: "In their words",
    headline: "A tutor answers a common worry.",
    body: "“No [aspiring American] is taking anything away from you. They're offering you something. A chance to make your life more interesting.” —Susie",
    icon: "star",
  },
  {
    id: "quote-janis",
    kind: "quote",
    eyebrow: "In their words",
    headline: "An interpreter for U.S. forces, now a citizen.",
    body: "“Now I'm a proud U.S. citizen. My wife, my kids, everybody's a citizen. We have a beautiful life here in Northern Virginia.” —Janis",
    icon: "flag",
  },
  {
    id: "quote-azad",
    kind: "quote",
    eyebrow: "In their words",
    headline: "He aided U.S. troops, then earned citizenship.",
    body: "“When I swore in and I saw the American flag, it was everything I worked really hard for finally paying off.” —Azad",
    icon: "flag",
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
