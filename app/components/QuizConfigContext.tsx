"use client";

import { createContext, useContext, useMemo } from "react";
import { VARIANTS, type VariantConfig } from "@/lib/quiz/variants";
import { variantCopy, type VariantCopy } from "@/lib/quiz/copy";

// The active variant's config, shared with every component that renders a
// count, a pass bar, or a question number.
//
// Context rather than props because these values are fixed for the whole
// session and needed at several depths: ProgressBar is reached through two
// different parents (QuestionCard and FeedbackPanel), and the three modals each
// interpolate the totals into their copy. Drilling `totalQuestions` and
// `passThreshold` through every one of them would add noise to signatures that
// otherwise describe a single question.

/** The config plus the copy that belongs to it, resolved once per variant. */
export type QuizConfig = VariantConfig & { copy: VariantCopy };

const QuizConfigContext = createContext<QuizConfig>({
  ...VARIANTS.exam,
  copy: variantCopy(VARIANTS.exam),
});

export function QuizConfigProvider({
  config,
  children,
}: {
  config: VariantConfig;
  children: React.ReactNode;
}) {
  // Copy is derived from the config (counts interpolate into it), so it is
  // resolved here rather than at every call site.
  const value = useMemo(() => ({ ...config, copy: variantCopy(config) }), [config]);

  return (
    <QuizConfigContext.Provider value={value}>
      {children}
    </QuizConfigContext.Provider>
  );
}

/**
 * Read the active variant config. Defaults to the /exam variant so a component
 * rendered outside a provider (the /preview gallery did this before it wrapped
 * itself) still gets sensible numbers instead of throwing.
 */
export function useQuizConfig(): QuizConfig {
  return useContext(QuizConfigContext);
}
