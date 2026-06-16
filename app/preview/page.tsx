"use client";

import { useState } from "react";
import type { AnsweredQuestion } from "@/lib/quiz/types";
import StartModal from "@/app/components/StartModal";
import SuccessModal from "@/app/components/SuccessModal";
import ResultScreen from "@/app/components/ResultScreen";

/**
 * Dev-only gallery for jumping straight to any modal / result state without
 * playing through the quiz. Visit /preview. Not linked anywhere and excluded
 * from production builds below.
 */

const MOCK_RESULTS: AnsweredQuestion[] = [
  { question: { id: "1", category: "Government", question: "What is the supreme law of the land?" }, userAnswer: "The Constitution", correct: true },
  { question: { id: "2", category: "Government", question: "What does the Constitution do?" }, userAnswer: "sets up the government", correct: true },
  { question: { id: "3", category: "Government", question: "How many amendments does the Constitution have?" }, userAnswer: "twenty", correct: false },
  { question: { id: "4", category: "History", question: "Who wrote the Declaration of Independence?" }, userAnswer: "Jefferson", correct: true },
  { question: { id: "5", category: "History", question: "When was the Declaration of Independence adopted?" }, userAnswer: "1799", correct: false },
];

type State =
  | { kind: "none" }
  | { kind: "start" }
  | { kind: "success"; variant: "pass" | "giveup"; leadCapture: boolean }
  | { kind: "result"; status: "PASSED" | "FAILED" };

const STATES: { label: string; state: State }[] = [
  { label: "Start modal", state: { kind: "start" } },
  { label: "Success · pass · lead form", state: { kind: "success", variant: "pass", leadCapture: true } },
  { label: "Success · pass · no form", state: { kind: "success", variant: "pass", leadCapture: false } },
  { label: "Success · give up · lead form", state: { kind: "success", variant: "giveup", leadCapture: true } },
  { label: "Success · give up · no form", state: { kind: "success", variant: "giveup", leadCapture: false } },
  { label: "Result · passed", state: { kind: "result", status: "PASSED" } },
  { label: "Result · failed", state: { kind: "result", status: "FAILED" } },
];

export default function PreviewPage() {
  if (process.env.NODE_ENV === "production") return null;

  const [state, setState] = useState<State>(STATES[0].state);
  const noop = () => {};
  const close = () => setState({ kind: "none" });

  return (
    <div className="relative z-10 min-h-dvh">
      {/* Toolbar sits above the z-50 modals so it's always reachable. */}
      <div className="fixed inset-x-0 top-0 z-[60] border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-5 py-3">
          {STATES.map(({ label, state: s }) => {
            const active = JSON.stringify(s) === JSON.stringify(state);
            return (
              <button
                key={label}
                type="button"
                onClick={() => setState(s)}
                className={`rounded-full border px-3 py-1.5 font-ui text-xs font-medium transition-colors ${
                  active
                    ? "border-transparent bg-[#FDB913] text-[#020049]"
                    : "border-line bg-surface text-ink-soft hover:bg-paper-deep"
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={close}
            className="ml-auto rounded-full border border-line px-3 py-1.5 font-ui text-xs font-medium text-ink-soft transition-colors hover:bg-paper-deep"
          >
            Close
          </button>
        </div>
      </div>

      <main className="mx-auto flex max-w-2xl flex-col justify-center px-5 pb-8 pt-24">
        {state.kind === "start" && (
          <StartModal open onConfirm={noop} onCancel={close} />
        )}

        {state.kind === "success" && (
          <SuccessModal
            open
            variant={state.variant}
            leadCapture={state.leadCapture}
            onSubmit={() => ({ ok: true })}
            onClose={close}
          />
        )}

        {state.kind === "result" && (
          <ResultScreen
            status={state.status}
            results={MOCK_RESULTS}
            correct={state.status === "PASSED" ? 12 : 3}
            onRetry={noop}
          />
        )}
      </main>
    </div>
  );
}
