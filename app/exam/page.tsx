import QuizApp from "@/app/components/QuizApp";
import { loadPublicBank } from "@/lib/quiz/bank";
import { VARIANTS, variantMetadata } from "@/lib/quiz/variants";

// Lead-generation variant: a passing score opens the lead-capture form.
export const metadata = variantMetadata(VARIANTS.exam);

export default function ExamPage() {
  return <QuizApp bank={loadPublicBank()} config={VARIANTS.exam} />;
}
