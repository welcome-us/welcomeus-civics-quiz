// Pure quiz state-machine logic. No I/O — safe to unit-test exhaustively.
// Mirrors the rules in plan.md §4, with the counts supplied by the caller: the
// question total, the pass bar and the early-end rule all vary per route
// variant (see lib/quiz/variants.ts), so nothing here hardcodes them.

import type { Progress, PublicQuestion, QuizStatus } from "./types";

export function computeProgress(
  correct: number,
  wrong: number,
  total: number,
): Progress {
  const answered = correct + wrong;
  return {
    correct,
    wrong,
    answered,
    remaining: total - answered,
  };
}

export interface StatusRules {
  total: number;
  passThreshold: number;
  /**
   * When true, a session resolves as soon as the outcome is guaranteed. When
   * false only the final answer can end it, so every session runs full length.
   */
  endEarly: boolean;
}

/**
 * Evaluate the session status after a scored answer. The win check comes
 * before the fail check: a session can't be both, and the ordering keeps the
 * intent explicit. The tests are written as inequalities so the logic survives
 * changes to the totals.
 */
export function evaluateStatus(
  correct: number,
  wrong: number,
  { total, passThreshold, endEarly }: StatusRules,
): QuizStatus {
  const { remaining } = computeProgress(correct, wrong, total);

  if (remaining <= 0) return correct >= passThreshold ? "PASSED" : "FAILED";
  if (!endEarly) return "IN_PROGRESS";

  if (correct >= passThreshold) return "PASSED";
  if (correct + remaining < passThreshold) return "FAILED";
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

export interface SampleOptions {
  count: number;
  /**
   * Cap on EASY-tagged questions in the lineup. Omit to leave the draw
   * unconstrained (the 20-question variants), which is the historical
   * behavior. A short quiz sets it so the score still means something.
   */
  maxEasy?: number;
}

/**
 * Build a session's question set from an already-gradeable pool. Dynamic /
 * state-specific questions are excluded upstream (plan.md §6.2 Option A) before
 * the bank reaches the client, because their official answer is "answers will
 * vary" and can't be auto-graded.
 *
 * The session always opens with an EASY question (randomly chosen among them)
 * so the first prompt feels approachable. If no EASY question is available,
 * the order is left fully random.
 *
 * Both the cap and the count degrade gracefully: a pool short on hard
 * questions is topped up with easy ones rather than returning a short lineup,
 * since a full-length quiz matters more than a perfect difficulty mix.
 */
export function sampleQuestions(
  bank: readonly PublicQuestion[],
  { count, maxEasy }: SampleOptions,
): PublicQuestion[] {
  const shuffled = shuffle(bank);
  const target = Math.min(count, shuffled.length);

  if (maxEasy === undefined) {
    // Uncapped: promote an EASY question within the *whole* pool before
    // slicing, so the lineup opens easy whenever the bank holds one at all.
    // Slicing first would leave the odd session with no EASY to promote.
    return easyFirst(shuffled).slice(0, target);
  }

  const easy = shuffled.filter((q) => q.difficulty === "EASY");
  const rest = shuffled.filter((q) => q.difficulty !== "EASY");
  const picked = [...easy.slice(0, maxEasy), ...rest.slice(0, target - Math.min(maxEasy, easy.length))];
  // Only reachable when the pool is short on non-easy questions: a full-length
  // quiz matters more than holding the cap, so top up past it.
  if (picked.length < target) {
    picked.push(...easy.slice(maxEasy, maxEasy + target - picked.length));
  }
  return easyFirst(shuffle(picked));
}

/**
 * Move the first EASY question to the front, in place. The input is already
 * shuffled, so "the first" is a random one. A pool with no EASY question is
 * returned untouched — fully random order.
 */
function easyFirst(items: PublicQuestion[]): PublicQuestion[] {
  const i = items.findIndex((q) => q.difficulty === "EASY");
  if (i > 0) {
    const [easy] = items.splice(i, 1);
    items.unshift(easy);
  }
  return items;
}
