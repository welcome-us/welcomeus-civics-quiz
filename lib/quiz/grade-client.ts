// Client-side grading entry point used by the quiz UI.
//
// Calls the server Route Handler (Haiku verdict) and falls back to the
// deterministic browser matcher if the API is unavailable — so the quiz keeps
// working with no key, offline, or during an upstream outage.

import { scoreAnswer } from "./scoring";
import type { Question } from "./types";

export interface Verdict {
  correct: boolean;
  reason?: string;
}

export async function gradeAnswer(
  question: Question,
  userAnswer: string,
): Promise<Verdict> {
  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question.question,
        acceptableAnswers: question.acceptableAnswers,
        userAnswer,
      }),
    });
    if (!res.ok) throw new Error(`grade request failed: ${res.status}`);

    const data = (await res.json()) as Verdict;
    if (typeof data.correct !== "boolean") throw new Error("bad verdict shape");
    return data;
  } catch {
    // Offline / no key / upstream error → deterministic fallback.
    return { correct: scoreAnswer(userAnswer, question.acceptableAnswers) };
  }
}
