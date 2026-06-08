import QuizApp from "./components/QuizApp";
import questions from "@/data/questions.json";
import type { PublicQuestion, Question } from "@/lib/quiz/types";

// Server Component: load the bank on the server and hand the client only the
// gradeable subset, stripped down to PublicQuestion fields. The answer key
// (`acceptableAnswers`, `explanation`) never crosses to the browser — grading
// happens behind /api/grade by question id, and the answers come back only
// after a guess is scored (plan.md §10).
export default function Home() {
  const bank: PublicQuestion[] = (questions as Question[])
    .filter((q) => !q.dynamic && !q.stateSpecific)
    .map(({ id, category, question, difficulty }) => ({
      id,
      category,
      question,
      difficulty,
    }));

  return <QuizApp bank={bank} />;
}
