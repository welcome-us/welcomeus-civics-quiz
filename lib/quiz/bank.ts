import questions from "@/data/questions.json";
import type { PublicQuestion, Question } from "@/lib/quiz/types";

// Server-only: load the full bank and return the gradeable subset stripped down
// to PublicQuestion fields. The answer key (`acceptableAnswers`, `explanation`)
// never crosses to the browser — grading happens behind /api/grade by question
// id, and the answers come back only after a guess is scored (plan.md §10).
// Shared by every route variant so the strip logic lives in exactly one place.
export function loadPublicBank(): PublicQuestion[] {
  return (questions as Question[])
    .filter((q) => !q.dynamic && !q.stateSpecific)
    .map(({ id, category, question, difficulty }) => ({
      id,
      category,
      question,
      difficulty,
    }));
}
