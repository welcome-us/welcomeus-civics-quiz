"use client";

import { useEffect, useRef } from "react";
import type { AnsweredQuestion, Feedback, PublicQuestion } from "@/lib/quiz/types";
import ProgressBar from "./ProgressBar";

interface FeedbackPanelProps {
  question: PublicQuestion;
  userAnswer: string;
  feedback: Feedback;
  index: number;
  results: AnsweredQuestion[];
  isTerminal: boolean;
  onNext: () => void;
}

export default function FeedbackPanel({
  question,
  userAnswer,
  feedback,
  index,
  results,
  isTerminal,
  onNext,
}: FeedbackPanelProps) {
  const nextRef = useRef<HTMLButtonElement>(null);
  const { correct } = feedback;

  useEffect(() => {
    nextRef.current?.focus();
  }, []);

  const accent = correct ? "var(--correct)" : "var(--wrong)";
  const softBg = correct ? "bg-correct-soft" : "bg-wrong-soft";

  return (
    <div className="animate-float-up w-full">
      <ProgressBar current={index} results={results} correct={feedback.progress.correct} />

      <div
        className="mt-7 overflow-hidden rounded-3xl border bg-surface shadow-[0_18px_50px_-28px_rgba(2,0,73,0.4)]"
        style={{ borderColor: accent }}
      >
        {/* Verdict header */}
        <div className={`flex items-center gap-3 px-6 py-4 sm:px-8 ${softBg}`}>
          <span
            className="animate-pop grid h-9 w-9 shrink-0 place-items-center rounded-full text-paper"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          >
            {correct ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M5 12.5l4.2 4.2L19 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M7 7l10 10M17 7L7 17"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
          <div aria-live="polite">
            <p
              className="font-display text-xl font-normal leading-none"
              style={{ color: accent }}
            >
              {correct ? "Correct" : "Not quite"}
            </p>
            <p className="mt-1 font-body text-sm text-ink-soft">
              {feedback.reason
                ? feedback.reason
                : correct
                  ? "That's a valid answer."
                  : "Here's what the test is looking for."}
            </p>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="font-display text-lg font-normal leading-snug text-ink">
            {question.question}
          </p>

          <div className="mt-4 rounded-xl bg-paper px-4 py-3 ring-1 ring-line">
            <p className="font-ui text-xs font-semibold uppercase tracking-wider text-ink-faint">
              You wrote
            </p>
            <p className="mt-1 font-body text-[0.95rem] text-ink">“{userAnswer}”</p>
          </div>

          <div className="mt-4">
            <p className="font-ui text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {feedback.acceptableAnswers.length > 1
                ? "Acceptable answers include"
                : "Acceptable answer"}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {feedback.acceptableAnswers.map((ans) => (
                <li
                  key={ans}
                  className="rounded-lg bg-correct-soft px-3 py-1.5 font-body text-sm font-medium text-correct"
                >
                  {ans}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 border-l-2 border-gold/50 pl-3 font-body text-sm leading-relaxed text-ink-soft">
            {feedback.explanation}
          </p>

          <div className="mt-7 flex justify-end">
            <button
              ref={nextRef}
              type="button"
              onClick={onNext}
              className="rounded-full bg-ink px-7 py-3.5 font-ui text-sm font-semibold text-paper shadow-md transition-all hover:bg-brand hover:shadow-lg active:scale-[0.98]"
            >
              {isTerminal ? "See your result →" : "Next question →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
