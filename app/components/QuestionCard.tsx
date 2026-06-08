"use client";

import { useEffect, useRef, useState } from "react";
import type { AnsweredQuestion, Question } from "@/lib/quiz/types";
import AutoTextarea from "./AutoTextarea";
import ProgressBar from "./ProgressBar";

interface QuestionCardProps {
  question: Question;
  index: number;
  results: AnsweredQuestion[];
  correct: number;
  onSubmit: (answer: string) => void;
  /** True while the answer is being graded by the server. */
  pending?: boolean;
}

export default function QuestionCard({
  question,
  index,
  results,
  correct,
  onSubmit,
  pending = false,
}: QuestionCardProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fresh field + focus on every new question.
  useEffect(() => {
    setValue("");
    inputRef.current?.focus();
  }, [question.id]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && !pending;

  const submit = () => {
    if (canSubmit) onSubmit(trimmed);
  };

  // Enter submits; Shift+Enter inserts a newline.
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div key={question.id} className="animate-float-up w-full">
      <ProgressBar current={index} results={results} correct={correct} />

      <div className="mt-7 rounded-3xl border border-line bg-surface p-6 shadow-[0_18px_50px_-28px_rgba(22,36,63,0.4)] sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-paper-deep px-3 py-1 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {question.category}
        </span>

        <h1 className="mt-4 text-balance font-display text-[1.7rem] font-semibold leading-snug text-ink sm:text-[2.05rem]">
          {question.question}
        </h1>

        <div className="mt-6">
          <label
            htmlFor="answer"
            className="mb-2 block font-sans text-sm font-medium text-ink-soft"
          >
            Your answer
          </label>
          <AutoTextarea
            id="answer"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your answer in your own words…"
            aria-describedby="answer-hint"
            className="w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3.5 font-sans text-lg leading-relaxed text-ink shadow-inner outline-none transition-colors placeholder:text-ink-faint focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/12"
          />
        </div>

        <div className="mt-5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p id="answer-hint" className="font-sans text-xs text-ink-faint">
            Press{" "}
            <kbd className="rounded border border-line bg-paper-deep px-1.5 py-0.5 font-sans text-[0.7rem] font-semibold text-ink-soft">
              Enter
            </kbd>{" "}
            to submit ·{" "}
            <kbd className="rounded border border-line bg-paper-deep px-1.5 py-0.5 font-sans text-[0.7rem] font-semibold text-ink-soft">
              Shift + Enter
            </kbd>{" "}
            for a new line
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 font-sans text-sm font-semibold text-paper shadow-md transition-all enabled:hover:bg-brand enabled:hover:shadow-lg enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper"
                aria-hidden="true"
              />
            )}
            {pending ? "Grading…" : "Submit answer"}
          </button>
        </div>
      </div>
    </div>
  );
}
