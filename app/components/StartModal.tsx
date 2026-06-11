"use client";

import { useEffect, useRef } from "react";
import { PASS_THRESHOLD, TOTAL_QUESTIONS } from "@/lib/quiz/state";
import { StarMark } from "./Wordmark";

interface StartModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RULES = [
  {
    label: `${TOTAL_QUESTIONS} questions`,
    detail: "Drawn at random from the official USCIS civics bank.",
  },
  {
    label: `${PASS_THRESHOLD} correct to pass`,
    detail: "The test ends early the moment you pass — or can no longer pass.",
  },
  {
    label: "Answer in your own words",
    detail: "Type your answer. Spelling and phrasing don't need to be perfect.",
  },
];

export default function StartModal({ open, onConfirm, onCancel }: StartModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Tab") {
        // Simple focus trap across the dialog's focusable controls.
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-title"
      aria-describedby="start-desc"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-ink/35 backdrop-blur-sm animate-fade-in"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        className="animate-scale-in relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(2,0,73,0.45)]"
      >
        {/* Banner */}
        <div className="relative overflow-hidden bg-brand px-7 pt-7 pb-6 text-paper">
          <div className="absolute -right-6 -top-8 opacity-[0.14]">
            <StarMark className="h-36 w-36" />
          </div>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.22em] text-paper/80">
            Naturalization Practice
          </p>
          <h2
            id="start-title"
            className="mt-2 font-display text-3xl font-normal leading-tight"
          >
            Could you pass a U.S. citizenship quiz?
          </h2>
        </div>

        <div className="px-7 py-6">
          <p id="start-desc" className="font-body text-[0.975rem] leading-relaxed text-ink-soft">
            As the United States marks its 250th birthday, put your civics
            knowledge to the test. You'll answer 20 open-ended questions – the
            same format used in the real citizenship exam. Think you have what
            it takes to earn American citizenship? Let's find out!
          </p>

          <ul className="mt-5 space-y-3">
            {RULES.map((rule) => (
              <li key={rule.label} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <StarMark className="h-3 w-3" />
                </span>
                <span className="font-body text-sm leading-relaxed text-ink">
                  <span className="font-semibold">{rule.label}.</span>{" "}
                  <span className="text-ink-soft">{rule.detail}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-5 py-3 font-ui text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep"
            >
              Not yet
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className="group relative overflow-hidden rounded-full bg-brand px-7 py-3 font-ui text-sm font-semibold text-paper shadow-md transition-all hover:bg-brand-deep hover:shadow-lg active:scale-[0.98]"
            >
              {/* Sheen sweep on hover */}
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/25 opacity-0 transition-opacity group-hover:animate-[sheen_0.9s_ease] group-hover:opacity-100" />
              Take the quiz →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
