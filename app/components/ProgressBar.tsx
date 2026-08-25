"use client";

import type { AnsweredQuestion } from "@/lib/quiz/types";
import { useQuizConfig } from "./QuizConfigContext";

interface ProgressBarProps {
  /** Zero-based index of the question currently on screen. */
  current: number;
  results: AnsweredQuestion[];
  correct: number;
}

/**
 * A progress indicator with two parts: a continuous fill (how far through the
 * session) and a row of one pip per question, coloured by outcome — green for
 * correct, coral for wrong, with the active question highlighted. Both scale to
 * the variant's question count, so 5 pips stretch the same track as 20.
 */
export default function ProgressBar({ current, results, correct }: ProgressBarProps) {
  const { totalQuestions, passThreshold } = useQuizConfig();
  const answered = results.length;
  const pct = Math.round((answered / totalQuestions) * 100);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="font-ui text-sm font-semibold tracking-wide text-ink">
          Question{" "}
          <span className="tabular-nums">
            {Math.min(current + 1, totalQuestions)}
          </span>{" "}
          <span className="text-ink-faint">of {totalQuestions}</span>
        </p>
        <p className="font-ui text-sm text-ink-soft">
          <span className="font-semibold tabular-nums text-correct">{correct}</span>{" "}
          correct
          <span className="text-ink-faint"> · need {passThreshold}</span>
        </p>
      </div>

      {/* Continuous fill */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-paper-deep ring-1 ring-line">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Per-question pips */}
      <div className="mt-2 flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const result = results[i];
          const isActive = i === current && !result;
          const color = result
            ? result.correct
              ? "var(--correct)"
              : "var(--wrong)"
            : isActive
              ? "var(--ink)"
              : "var(--line-strong)";
          return (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                isActive ? "ring-2 ring-ink/15" : ""
              }`}
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>
    </div>
  );
}
