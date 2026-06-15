import QuizApp from "@/app/components/QuizApp";
import { loadPublicBank } from "@/lib/quiz/bank";
import { VARIANTS } from "@/lib/quiz/variants";

// No-form variant: a passing score opens a congrats modal with no lead capture.
export default function CivicsPage() {
  return <QuizApp bank={loadPublicBank()} leadCapture={VARIANTS.civics.leadCapture} />;
}
