// Client-side grading entry point used by the quiz UI.
//
// The browser never holds the answer key. It posts the question id and the
// user's answer to the server Route Handler, which looks up the acceptable
// answers, grades (Haiku verdict, or a deterministic fallback when no key is
// configured), and returns the verdict together with the answers + explanation
// to reveal in the feedback panel.

import type { PublicQuestion } from "./types";

export interface Verdict {
  correct: boolean;
  /** The answer key, returned only after grading so it can be shown as feedback. */
  acceptableAnswers: string[];
  explanation: string;
  /** One-sentence verdict from the Haiku grader; absent on the offline fallback. */
  reason?: string;
}

export async function gradeAnswer(
  question: PublicQuestion,
  userAnswer: string,
): Promise<Verdict> {
  const res = await fetch("/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId: question.id, userAnswer }),
  });
  if (!res.ok) throw new Error(`grade request failed: ${res.status}`);

  const data = (await res.json()) as Partial<Verdict>;
  if (
    typeof data.correct !== "boolean" ||
    !Array.isArray(data.acceptableAnswers) ||
    typeof data.explanation !== "string"
  ) {
    throw new Error("bad verdict shape");
  }
  return {
    correct: data.correct,
    acceptableAnswers: data.acceptableAnswers,
    explanation: data.explanation,
    reason: data.reason,
  };
}
