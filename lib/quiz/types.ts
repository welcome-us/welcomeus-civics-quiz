// Shared types for the civics quiz flow.

export interface Question {
  id: string;
  category: string;
  question: string;
  acceptableAnswers: string[];
  explanation: string;
  dynamic: boolean;
  stateSpecific: boolean;
  lastVerified: string;
}

/** A single graded answer within a session. */
export interface AnsweredQuestion {
  question: Question;
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
}

export interface Progress {
  correct: number;
  wrong: number;
  answered: number;
  remaining: number;
}
