// Analytics event tracking for the civics quiz.
//
// Thin, typed wrapper over @next/third-parties' sendGTMEvent. Each call pushes a
// named event plus its params onto the GTM dataLayer; GTM forwards them to GA4
// (see docs/analytics.md for the GTM tag + GA4 custom-dimension setup). When GTM
// is not configured (no NEXT_PUBLIC_GTM_ID) the push is a harmless no-op, so
// call sites never need to guard on it.

import { sendGTMEvent } from "@next/third-parties/google";

type QuizResult = "passed" | "failed";
type AnswerResult = "correct" | "incorrect";
type LeadVariant = "pass" | "giveup";

// The single source of truth for every event we emit and the params it carries.
// Keeping the shapes here (rather than inline at call sites) means GA4's expected
// payloads live in one place — mirror any change here in docs/analytics.md.
type QuizEvents = {
  /** Quiz session begins (Start modal confirmed). */
  quiz_start: { lead_capture: boolean };
  /** One graded answer. High volume — drives per-question drop-off analysis. */
  question_answered: {
    question_number: number;
    result: AnswerResult;
    correct_count: number;
  };
  /** Quiz reaches a terminal pass/fail state. */
  quiz_complete: {
    result: QuizResult;
    score: number;
    questions_answered: number;
  };
  /** User bails out mid-quiz via "Give Up". */
  quiz_give_up: { question_number: number; correct_count: number };
  /** The lead-capture / success modal is shown. */
  lead_form_view: { variant: LeadVariant };
  /** Lead submitted successfully — the primary conversion (GA4 recommended name). */
  generate_lead: {
    variant: LeadVariant;
    marketing_consent: boolean;
    has_zip: boolean;
  };
  /** Lead submission failed server-side — otherwise invisible lead loss. */
  lead_submit_error: { variant: LeadVariant };
  /** Answer grading threw (server unreachable) — a reliability signal. */
  grade_error: { question_number: number };
};

export function track<E extends keyof QuizEvents>(
  event: E,
  params: QuizEvents[E],
): void {
  // sendGTMEvent pushes { event, ...params } onto window.dataLayer. It is safe to
  // call during SSR (no-op) and when GTM is disabled.
  sendGTMEvent({ event, ...params });
}
