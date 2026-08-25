import QuizApp from "@/app/components/QuizApp";
import { loadPublicBank } from "@/lib/quiz/bank";
import { VARIANTS, variantMetadata } from "@/lib/quiz/variants";

// No-form variant: a passing score opens a congrats modal with no lead capture.
export const metadata = variantMetadata(VARIANTS.civics);

export default function CivicsPage() {
  return <QuizApp bank={loadPublicBank()} config={VARIANTS.civics} />;
}
