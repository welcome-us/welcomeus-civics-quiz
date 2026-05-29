import QuizApp from "./components/QuizApp";
import questions from "@/data/questions.json";
import type { Question } from "@/lib/quiz/types";

// Server Component: load the bank once on the server and hand the gradeable
// subset to the client flow. (A future iteration can move scoring behind an
// API route so acceptable answers never reach the browser — see plan.md §7.)
export default function Home() {
  const bank = (questions as Question[]).filter(
    (q) => !q.dynamic && !q.stateSpecific,
  );

  return <QuizApp bank={bank} />;
}
