// The quiz ships as route-selected variants off the same engine:
//
//   /exam   → 20 questions, lead-generation: a passing score opens the form.
//   /civics → 20 questions, no form: a passing score opens a congrats modal.
//   /trivia → 5 questions, no breaks, lead-capture for everyone who finishes.
//
// The variants differ only in this config, so adding another flavor (or moving
// copy that diverges) means editing this table — never forking the components.
// Every knob below is read through QuizConfigProvider, so a component that
// needs one calls useQuizConfig() rather than importing a constant.
export type QuizVariant = "exam" | "civics" | "trivia";

export interface VariantConfig {
  /** Route key — also the analytics label, so keep it in sync with the path. */
  id: QuizVariant;
  /** When true, the success modal renders the lead-capture form. */
  leadCapture: boolean;
  /** How many questions a session draws. */
  totalQuestions: number;
  /** Correct answers needed to pass. */
  passThreshold: number;
  /**
   * Cap on EASY-tagged questions per session. Omit for no cap. Only EASY is
   * tagged in the bank — everything else has no `difficulty` — so a cap of 1
   * means "one tagged-easy question, the rest untagged".
   */
  maxEasy?: number;
  /** Show the Welcoming-message breathers between questions. */
  interstitials: boolean;
  /**
   * End the session the moment a pass or fail is guaranteed. False makes every
   * session run the full length, which is what a short quiz wants: stopping a
   * 5-question run after 3 correct answers would cut it in half.
   */
  endEarly: boolean;
  /**
   * Open the success modal once the last question is answered no matter the
   * score. False keeps the original behavior — the form appears only on a pass.
   */
  leadOnFinish: boolean;
}

export const VARIANTS: Record<QuizVariant, VariantConfig> = {
  exam: {
    id: "exam",
    leadCapture: true,
    totalQuestions: 20,
    passThreshold: 12,
    interstitials: true,
    endEarly: true,
    leadOnFinish: false,
  },
  civics: {
    id: "civics",
    leadCapture: false,
    totalQuestions: 20,
    passThreshold: 12,
    interstitials: true,
    endEarly: true,
    leadOnFinish: false,
  },
  trivia: {
    id: "trivia",
    leadCapture: true,
    totalQuestions: 5,
    passThreshold: 3, // the exam's 60% bar, scaled down
    maxEasy: 1,
    interstitials: false,
    endEarly: false,
    leadOnFinish: true,
  },
};

/**
 * Per-route page metadata. The root layout's description hardcodes the exam's
 * counts, which read wrong on a 5-question variant, so each page exports its
 * own built from the config it renders — a page-level `metadata` export
 * overrides the layout's.
 */
export function variantMetadata({ totalQuestions, passThreshold }: VariantConfig) {
  return {
    title: "Civics Practice — Welcome.US",
    description: `Practice for the U.S. naturalization civics test. ${totalQuestions} questions, ${passThreshold} to pass — type your answers in your own words.`,
  };
}
