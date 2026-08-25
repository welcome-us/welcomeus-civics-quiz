"use client";

import { useState } from "react";
import type { AnsweredQuestion } from "@/lib/quiz/types";
import { INTERSTITIALS } from "@/lib/quiz/interstitials";
import { VARIANTS, type QuizVariant } from "@/lib/quiz/variants";
import { QuizConfigProvider } from "@/app/components/QuizConfigContext";
import StartModal from "@/app/components/StartModal";
import SuccessModal from "@/app/components/SuccessModal";
import ResultScreen from "@/app/components/ResultScreen";
import InterstitialCard from "@/app/components/InterstitialCard";

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
  | { kind: "success"; variant: "pass" | "fail" | "giveup"; leadCapture: boolean }
  | { kind: "result"; status: "PASSED" | "FAILED" }
  | { kind: "interstitial" };

const STATES: { label: string; state: State }[] = [
  { label: "Start modal", state: { kind: "start" } },
  { label: "Success · pass · lead form", state: { kind: "success", variant: "pass", leadCapture: true } },
  { label: "Success · pass · no form", state: { kind: "success", variant: "pass", leadCapture: false } },
  { label: "Success · fail · lead form", state: { kind: "success", variant: "fail", leadCapture: true } },
  { label: "Success · give up · lead form", state: { kind: "success", variant: "giveup", leadCapture: true } },
  { label: "Success · give up · no form", state: { kind: "success", variant: "giveup", leadCapture: false } },
  { label: "Result · passed", state: { kind: "result", status: "PASSED" } },
  { label: "Result · failed", state: { kind: "result", status: "FAILED" } },
  { label: "Interstitial · messages", state: { kind: "interstitial" } },
];

export default function PreviewPage() {
  const [state, setState] = useState<State>(STATES[0].state);
  // Which variant's counts the screens render with — the copy interpolates
  // them, so /trivia's 5-question framing is worth eyeballing here too.
  const [variant, setVariant] = useState<QuizVariant>("exam");
  // Which message the interstitial preview is showing — its skip button cycles
  // through the whole bucket so all 12 can be read in one pass.
  const [messageIndex, setTipIndex] = useState(0);
  const noop = () => {};
  const close = () => setState({ kind: "none" });

  // Bail after the hooks, never before — an early return above them would make
  // the hook order differ between builds, which is what rules-of-hooks forbids.
  if (process.env.NODE_ENV === "production") return null;

  return (
    <QuizConfigProvider config={VARIANTS[variant]}>
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
          <label className="ml-auto flex items-center gap-2 font-ui text-xs text-ink-soft">
            Variant
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as QuizVariant)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 font-ui text-xs font-medium text-ink-soft"
            >
              {(Object.keys(VARIANTS) as QuizVariant[]).map((v) => (
                <option key={v} value={v}>
                  /{v} · {VARIANTS[v].totalQuestions}q
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-line px-3 py-1.5 font-ui text-xs font-medium text-ink-soft transition-colors hover:bg-paper-deep"
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

        {state.kind === "interstitial" && (
          <InterstitialCard
            message={INTERSTITIALS[messageIndex % INTERSTITIALS.length]}
            // The earliest a break can land is after 3 answers, so the button
            // never reads "question 1" in the real flow — keep the preview honest.
            nextQuestionNumber={(messageIndex % INTERSTITIALS.length) + 4}
            onSkip={() => setTipIndex((i) => i + 1)}
          />
        )}

        {state.kind === "result" && (
          <ResultScreen
            status={state.status}
            results={MOCK_RESULTS}
            correct={state.status === "PASSED" ? VARIANTS[variant].passThreshold : 1}
            onRetry={noop}
          />
        )}
      </main>
    </div>
    </QuizConfigProvider>
  );
}
