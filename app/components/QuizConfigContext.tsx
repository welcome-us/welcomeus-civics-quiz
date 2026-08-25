"use client";

import { createContext, useContext } from "react";
import { VARIANTS, type VariantConfig } from "@/lib/quiz/variants";

// The active variant's config, shared with every component that renders a
// count, a pass bar, or a question number.
//
// Context rather than props because these values are fixed for the whole
// session and needed at several depths: ProgressBar is reached through two
// different parents (QuestionCard and FeedbackPanel), and the three modals each
// interpolate the totals into their copy. Drilling `totalQuestions` and
// `passThreshold` through every one of them would add noise to signatures that
// otherwise describe a single question.

const QuizConfigContext = createContext<VariantConfig>(VARIANTS.exam);

export function QuizConfigProvider({
  config,
  children,
}: {
  config: VariantConfig;
  children: React.ReactNode;
}) {
  return (
    <QuizConfigContext.Provider value={config}>
      {children}
    </QuizConfigContext.Provider>
  );
}

/**
 * Read the active variant config. Defaults to the /exam variant so a component
 * rendered outside a provider (the /preview gallery did this before it wrapped
 * itself) still gets sensible numbers instead of throwing.
 */
export function useQuizConfig(): VariantConfig {
  return useContext(QuizConfigContext);
}
