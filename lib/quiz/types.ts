// Shared types for the civics quiz flow.

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

/**
 * The only shape of a question the browser is ever allowed to see. It
 * deliberately omits `acceptableAnswers` and `explanation`: those are the
 * answer key, and shipping them as Client Component props would serialize them
 * into the RSC payload where anyone can read them from the console (plan.md
 * §10). The full answers live server-side in `Question` and are revealed only
 * after an answer is graded, via the /api/grade response.
 */
export interface PublicQuestion {
  id: string;
  category: string;
  question: string;
  difficulty?: Difficulty;
}

/** The full bank entry — server-only. Never pass this to a Client Component. */
export interface Question extends PublicQuestion {
  acceptableAnswers: string[];
  explanation: string;
  dynamic: boolean;
  stateSpecific: boolean;
  lastVerified: string;
}

/** A single graded answer within a session. */
export interface AnsweredQuestion {
  question: PublicQuestion;
  userAnswer: string;
  correct: boolean;
}

export type QuizStatus = "IN_PROGRESS" | "PASSED" | "FAILED";

/** Outcome returned to the UI after each scored answer. */
export interface Feedback {
  correct: boolean;
  acceptableAnswers: string[];
  explanation: string;
  status: QuizStatus;
  progress: Progress;
  /** One-sentence verdict from the Haiku grader; absent on offline fallback. */
  reason?: string;
}

export interface Progress {
  correct: number;
  wrong: number;
  answered: number;
  remaining: number;
}
