import QuizApp from "@/app/components/QuizApp";
import { loadPublicBank } from "@/lib/quiz/bank";
import { VARIANTS } from "@/lib/quiz/variants";

// Lead-generation variant: a passing score opens the lead-capture form.
export default function ExamPage() {
  return <QuizApp bank={loadPublicBank()} leadCapture={VARIANTS.exam.leadCapture} />;
}
