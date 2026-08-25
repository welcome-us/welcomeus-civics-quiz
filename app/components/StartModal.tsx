"use client";

import { useEffect, useRef } from "react";
import { useQuizConfig } from "./QuizConfigContext";
import { StarMark } from "./Wordmark";

interface StartModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function StartModal({ open, onConfirm, onCancel }: StartModalProps) {
  const { copy } = useQuizConfig();
  const { eyebrow, headline, body, rules } = copy.start;
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
        className="absolute inset-0 cursor-default backdrop-blur-sm animate-fade-in"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        className="animate-scale-in relative w-full max-w-lg rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(2,0,73,0.45)]"
      >
        {/* Banner */}
        <div className="relative overflow-hidden rounded-t-3xl bg-[#293870] px-7 pt-7 pb-6 text-paper">
          <div className="absolute -right-6 -top-8 opacity-[0.28]">
            <StarMark className="h-36 w-36 text-[#0D3FF7]" />
          </div>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.22em] text-paper/80">
            {eyebrow}
          </p>
          <h2
            id="start-title"
            className="mt-2 font-display text-3xl font-normal leading-tight"
          >
            {headline}
          </h2>
        </div>

        <div className="px-7 py-6">
          <div
            id="start-desc"
            className="space-y-3 font-body text-[0.975rem] leading-relaxed text-ink-soft"
          >
            {body.map((para) => (
              <p key={para.text}>{para.text}</p>
            ))}
          </div>

          <ul className="mt-5 space-y-3">
            {rules.map((rule) => (
              <li key={rule.lead} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <StarMark className="h-3 w-3" />
                </span>
                <span className="font-body text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{rule.lead}</span>
                  {rule.rest}
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
              className="rounded-full bg-[#FDB913] px-7 py-3 font-ui text-sm font-semibold text-[#020049] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e5a50f] hover:shadow-[0_10px_30px_-6px_rgba(253,185,19,0.275),0_0_44px_-4px_rgba(253,185,19,0.225)] active:translate-y-0 active:scale-[0.98]"
            >
              Take the quiz →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
