// The quiz ships as two route-selected variants off the same engine:
//
//   /exam   → lead-generation: a passing score opens the lead-capture form.
//   /civics → no form: a passing score opens a congrats modal only.
//
// The variants differ only in this config, so adding a third flavor (or moving
// copy that diverges) means editing this table — never forking the components.
export type QuizVariant = "exam" | "civics";

export interface VariantConfig {
  /** When true, the success modal renders the lead-capture form. */
  leadCapture: boolean;
}

export const VARIANTS: Record<QuizVariant, VariantConfig> = {
  exam: { leadCapture: true },
  civics: { leadCapture: false },
};
