// Per-variant copy for the screens whose wording diverges by route.
//
// variants.ts is the table for *behavior*; this is the table for *words*. They
// are split because the copy is long, is reviewed by non-engineers, and changes
// on its own schedule — but they are keyed the same way, and `variantCopy()`
// takes the config so counts interpolate instead of being typed twice.
//
// Only the screens that actually diverge live here (the start card, and the
// exit-card messages). Everything else stays in the components.

import type { VariantConfig } from "./variants";

/** One paragraph. `lead` renders bold, immediately ahead of `text`. */
export interface Paragraph {
  lead?: string;
  text: string;
}

/** A start-card bullet: `lead` renders bold, `rest` carries its own punctuation. */
export interface Rule {
  lead: string;
  rest: string;
}

export interface StartCopy {
  eyebrow: string;
  headline: string;
  body: Paragraph[];
  rules: Rule[];
}

export interface ExitCopy {
  eyebrow: string;
  headline: string;
  body: Paragraph[];
  /**
   * Append the standing "Find out more … at Welcome.US." sentence. Off where the
   * copy already ends on its own call to action, which would otherwise compete.
   */
  welcomeLink: boolean;
}

export interface VariantCopy {
  start: StartCopy;
  /** Finished at or above the pass bar. */
  pass: ExitCopy;
  /** Finished below it — only reachable when leadOnFinish is set. */
  fail: ExitCopy;
  /** Bailed out mid-quiz, on a variant that captures leads. */
  giveup: ExitCopy;
  /** Bailed out mid-quiz on /civics: Citizen Guide CTA, no form. */
  citizenGuide: ExitCopy;
}

// The 20-question routes (/exam, /civics) — the wording that shipped before
// /trivia existed. Kept verbatim; only the counts interpolate.
function longFormCopy({ totalQuestions, passThreshold }: VariantConfig): VariantCopy {
  const consolation = {
    eyebrow: "No worries",
    headline: "The citizenship test is tough.",
  };

  return {
    start: {
      eyebrow: "Naturalization Practice",
      headline: "Could you pass a U.S. citizenship exam?",
      body: [
        {
          text: `As the United States marks its 250th birthday, put your civics knowledge to the test. You'll answer ${totalQuestions} open-ended questions – the same format used in the real citizenship exam. Think you have what it takes to earn American citizenship? Let's find out!`,
        },
      ],
      rules: [
        {
          lead: `${totalQuestions} questions`,
          rest: ". Drawn at random from the official USCIS civics bank.",
        },
        {
          lead: `${passThreshold} correct to pass`,
          rest: ". The test ends early the moment you pass — or can no longer pass.",
        },
        {
          lead: "Answer in your own words",
          rest: ". Type your answer. Spelling and phrasing don't need to be perfect.",
        },
      ],
    },
    pass: {
      eyebrow: "You passed",
      headline: "Congrats, you passed!",
      body: [
        {
          text: `You're as American as fireworks on the Fourth of July! You answered at least ${passThreshold} out of ${totalQuestions} questions correctly—the score needed to pass the U.S. citizenship exam. Now share this quiz with family and friends to see if they have what it takes to pass the citizenship test—and take the opportunity to brag about your civics knowledge!`,
        },
      ],
      welcomeLink: true,
    },
    fail: {
      ...consolation,
      body: [
        {
          // TODO: replace alongside the give-up copy below.
          text: "You made it all the way through—most people need a few rounds of practice before they're ready. Leave your details and we'll send you study tips and resources so you can pass it next time.",
        },
      ],
      welcomeLink: true,
    },
    giveup: {
      ...consolation,
      body: [
        {
          // TODO: replace with final give-up copy
          text: "No shame in stepping away—most people need a few rounds of practice before they're ready. Leave your details and we'll send you study tips and resources so you can pick up where you left off and pass it next time.",
        },
      ],
      welcomeLink: true,
    },
    citizenGuide: {
      ...consolation,
      body: [
        {
          text: "You're not alone in feeling stumped. Most Americans born here could not pass this exam. Now imagine the pressure of testing with your future riding on the answers. Nobody should have to study alone. The Citizen Guide program virtually pairs a green card holder with a volunteer, and they study together, one question at a time. You might be surprised what you take away from it.",
        },
      ],
      welcomeLink: false,
    },
  };
}

// The Citizen Guides ask closing both /trivia exit cards. Identical wording
// either way — only the bold lead-in changes, since a passing player is asked
// to pay it forward and a failing one to brush up first.
const GUIDES_ASK =
  " We'll send you information on how Citizen Guides, like you, help lawful permanent residents cross the finish line of citizenship.";

// A fact about the real USCIS exam, not about this quiz — it stays constant
// while the quiz's own counts come from the config.
const REAL_EXAM =
  "The real exam pulls from a bank of 128 questions, asks up to 20 of them, and takes 12 right to earn it";

// /trivia — the short lead-gen route. Approved copy, 2026-08-25. Give-up and
// the Citizen Guide card are inherited: neither was part of that review.
function triviaCopy(config: VariantConfig): VariantCopy {
  const { totalQuestions, passThreshold } = config;

  return {
    ...longFormCopy(config),
    start: {
      eyebrow: "Civics trivia challenge",
      headline: "Could you pass the real U.S. citizenship exam?",
      body: [
        {
          text: `This year the United States turned 250. Every year, thousands of people who've followed every legal step toward becoming American sit down and take a test most Americans have never studied for. Here, you only need ${passThreshold} out of ${totalQuestions} to pass. On the real exam, it takes 12 out of 20.`,
        },
        { text: "Think you have what it takes? Let's find out." },
      ],
      rules: [
        {
          lead: `${totalQuestions} questions`,
          rest: ", drawn at random from the official USCIS civics bank.",
        },
        {
          lead: `${passThreshold} correct to pass`,
          rest: ". You'll answer every question, whatever your running score.",
        },
        {
          lead: "Answer in your own words",
          rest: ". The real exam is open-ended, so is this version. Spelling and phrasing don't need to be perfect.",
        },
      ],
    },
    pass: {
      eyebrow: "Star-spangled Smarty",
      headline: "You passed, you earned this one.",
      body: [
        {
          text: `You got at least ${passThreshold} out of ${totalQuestions} U.S. civics questions correct. That's a pass. ${REAL_EXAM}, after years of paperwork and waiting most of us never had to do. You just proved you could do it for fun. Somebody out there is doing it for keeps.`,
        },
        {
          lead: "Help someone earn a passing score for real.",
          text: GUIDES_ASK,
        },
      ],
      // The Citizen Guides ask is the call to action; a second link would split it.
      welcomeLink: false,
    },
    fail: {
      eyebrow: "Founding father: 1. You: 0.",
      headline: "You didn't pass, but neither would most.",
      body: [
        {
          text: `You didn't pass this time, but 64% of Americans couldn't answer these either. ${REAL_EXAM}.`,
        },
        {
          lead: "Brush up on your U.S. civics and help someone earn a passing score for real.",
          text: GUIDES_ASK,
        },
      ],
      welcomeLink: false,
    },
  };
}

export function variantCopy(config: VariantConfig): VariantCopy {
  return config.id === "trivia" ? triviaCopy(config) : longFormCopy(config);
}
