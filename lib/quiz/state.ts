// Pure quiz state-machine logic. No I/O — safe to unit-test exhaustively.
// Mirrors the rules in plan.md §4: 20 questions, 12 to pass, end early on a
// guaranteed win or a guaranteed loss.

import type { Progress, Question, QuizStatus } from "./types";

export const TOTAL_QUESTIONS = 20;
export const PASS_THRESHOLD = 12;
export const MAX_WRONG = TOTAL_QUESTIONS - PASS_THRESHOLD; // 8

export function computeProgress(correct: number, wrong: number): Progress {
  const answered = correct + wrong;
  return {
    correct,
    wrong,
    answered,
    remaining: TOTAL_QUESTIONS - answered,
  };
}

/**
 * Evaluate the session status after a scored answer. The win check comes
 * before the fail check: a session can't be both, and the ordering keeps the
 * intent explicit. The fail test is written as an inequality so the logic
 * survives changes to TOTAL_QUESTIONS / PASS_THRESHOLD.
 */
export function evaluateStatus(correct: number, wrong: number): QuizStatus {
  const { remaining } = computeProgress(correct, wrong);

  if (correct >= PASS_THRESHOLD) return "PASSED";
  if (correct + remaining < PASS_THRESHOLD) return "FAILED";
  if (remaining === 0) return correct >= PASS_THRESHOLD ? "PASSED" : "FAILED";
  return "IN_PROGRESS";
}

/** Fisher–Yates shuffle returning a new array; never mutates the input. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build a session's question set. Dynamic / state-specific questions are
 * excluded (plan.md §6.2 Option A) because their official answer is
 * "answers will vary" and can't be auto-graded. Falls back gracefully if the
 * gradeable pool is smaller than TOTAL_QUESTIONS.
 */
export function sampleQuestions(
  bank: readonly Question[],
  count = TOTAL_QUESTIONS,
): Question[] {
  const gradeable = bank.filter((q) => !q.dynamic && !q.stateSpecific);
  return shuffle(gradeable).slice(0, Math.min(count, gradeable.length));
}
