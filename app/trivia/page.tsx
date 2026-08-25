import QuizApp from "@/app/components/QuizApp";
import { loadPublicBank } from "@/lib/quiz/bank";
import { VARIANTS, variantMetadata } from "@/lib/quiz/variants";

// Short-form variant: 5 questions, no between-question breaks, and the
// lead-capture form for everyone who reaches the end — pass or not.
export const metadata = variantMetadata(VARIANTS.trivia);

export default function TriviaPage() {
  return <QuizApp bank={loadPublicBank()} config={VARIANTS.trivia} />;
}
