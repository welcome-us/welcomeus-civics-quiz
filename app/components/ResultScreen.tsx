"use client";

import { PASS_THRESHOLD } from "@/lib/quiz/state";
import type { AnsweredQuestion, QuizStatus } from "@/lib/quiz/types";
import { StarMark } from "./Wordmark";

interface ResultScreenProps {
  status: Exclude<QuizStatus, "IN_PROGRESS">;
  results: AnsweredQuestion[];
  correct: number;
  onRetry: () => void;
}

export default function ResultScreen({
  status,
  results,
  correct,
  onRetry,
}: ResultScreenProps) {
  const passed = status === "PASSED";
  const answered = results.length;
  const accent = passed ? "var(--correct)" : "var(--wrong)";

  return (
    <div className="animate-scale-in w-full">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_24px_70px_-28px_rgba(22,36,63,0.45)]">
        <div
          className="relative overflow-hidden px-7 py-10 text-center text-paper sm:px-10"
          style={{ backgroundColor: accent }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
            <StarMark className="absolute -left-6 top-4 h-28 w-28" />
            <StarMark className="absolute -right-4 bottom-2 h-20 w-20" />
          </div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-paper/85">
            {passed ? "Congratulations" : "Keep practicing"}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {passed ? "You passed!" : "Not this time"}
          </h2>
          <p className="mx-auto mt-3 max-w-md font-sans text-[0.975rem] leading-relaxed text-paper/90">
            {passed
              ? `You reached ${PASS_THRESHOLD} correct answers — that's a passing score on the civics test.`
              : `A passing score is ${PASS_THRESHOLD} correct. You'll get there with a little more practice.`}
          </p>
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <Stat label="Correct" value={correct} tone="var(--correct)" />
          <Stat label="Answered" value={answered} tone="var(--ink)" />
          <Stat label="To pass" value={PASS_THRESHOLD} tone="var(--brand)" />
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Your session
          </p>
          <ul className="mt-3 space-y-2">
            {results.map((r, i) => (
              <li
                key={r.question.id}
                className="flex items-start gap-3 rounded-xl bg-paper px-3.5 py-2.5 ring-1 ring-line"
              >
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-paper"
                  style={{ backgroundColor: r.correct ? "var(--correct)" : "var(--wrong)" }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                    {r.correct ? (
                      <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    )}
                  </svg>
                </span>
                <span className="font-sans text-sm leading-snug text-ink-soft">
                  <span className="mr-1 font-semibold text-ink-faint tabular-nums">
                    {i + 1}.
                  </span>
                  {r.question.question}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-brand px-8 py-3.5 font-sans text-sm font-semibold text-paper shadow-md transition-all hover:bg-brand-deep hover:shadow-lg active:scale-[0.98]"
            >
              Try again with new questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="px-4 py-5 text-center">
      <p className="font-display text-3xl font-semibold tabular-nums" style={{ color: tone }}>
        {value}
      </p>
      <p className="mt-1 font-sans text-xs font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </p>
    </div>
  );
}
