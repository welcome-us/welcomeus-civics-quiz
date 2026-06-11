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
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_24px_70px_-28px_rgba(2,0,73,0.45)]">
        <div
          className="relative overflow-hidden px-7 py-10 text-center text-paper sm:px-10"
          style={{ backgroundColor: accent }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
            <StarMark className="absolute -left-6 top-4 h-28 w-28" />
            <StarMark className="absolute -right-4 bottom-2 h-20 w-20" />
          </div>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.24em] text-paper/85">
            {passed ? "Congratulations" : "Keep practicing"}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {passed ? "You passed!" : "Sorry, you did not pass."}
          </h2>
          {passed && (
            <p className="mx-auto mt-3 max-w-md font-body text-[0.975rem] leading-relaxed text-paper/90">
              You reached {PASS_THRESHOLD} correct answers — that&apos;s a
              passing score on the civics test.
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <Stat label="Correct" value={correct} tone="var(--correct)" />
          <Stat label="Answered" value={answered} tone="var(--ink)" />
          <Stat label="To pass" value={PASS_THRESHOLD} tone="var(--brand)" />
        </div>

        <div className="px-6 py-6 sm:px-8">
          {!passed && (
            <div className="mb-6 space-y-3 font-body text-[0.975rem] leading-relaxed text-ink-soft">
              <p>
                If this scenario was real, you&apos;d get one more shot to answer{" "}
                {PASS_THRESHOLD} questions correctly at a second interview.
                Don&apos;t feel bad—these questions are from the real U.S.
                citizenship civics test, and two-thirds of Americans can&apos;t
                pass it cold either. If you thought that was a challenge, share
                this quiz with family and friends to see if they have what it
                takes to pass the citizenship test.
              </p>
              <p>
                Find out more about what it takes to earn American citizenship at{" "}
                <a
                  href="https://welcome.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline underline-offset-2 hover:text-brand-deep"
                >
                  Welcome.US
                </a>
                .
              </p>
            </div>
          )}

          <p className="font-ui text-xs font-semibold uppercase tracking-wider text-ink-faint">
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
                <span className="font-body text-sm leading-snug text-ink-soft">
                  <span className="mr-1 font-semibold text-ink-faint tabular-nums">
                    {i + 1}.
                  </span>
                  {r.question.question}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onRetry}
              className="w-full rounded-full bg-brand px-8 py-3.5 font-ui text-sm font-semibold text-paper shadow-md transition-all hover:bg-brand-deep hover:shadow-lg active:scale-[0.98] sm:w-auto"
            >
              {passed ? "Try again with new questions" : "Try again"}
            </button>
            {!passed && (
              <a
                href="https://welcome.us/citizenship"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full border border-line bg-surface px-8 py-3.5 text-center font-ui text-sm font-semibold text-brand shadow-sm transition-all hover:bg-paper-deep hover:shadow active:scale-[0.98] sm:w-auto"
              >
                Citizenship 101 @ Welcome.US
              </a>
            )}
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
      <p className="mt-1 font-muted text-xs font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </p>
    </div>
  );
}
