"use client";

import { useCallback, useState } from "react";
import { gradeAnswer } from "@/lib/quiz/grade-client";
import { submitSuccessModal } from "@/app/_actions/submit-success-modal";
import {
  PASS_THRESHOLD,
  TOTAL_QUESTIONS,
  computeProgress,
  evaluateStatus,
  sampleQuestions,
} from "@/lib/quiz/state";
import type {
  AnsweredQuestion,
  Feedback,
  PublicQuestion,
  QuizStatus,
} from "@/lib/quiz/types";
import FeedbackPanel from "./FeedbackPanel";
import QuestionCard from "./QuestionCard";
import ResultScreen from "./ResultScreen";
import StartModal from "./StartModal";
import SuccessModal, {
  type CaptureVariant,
  type SuccessFormData,
  type SuccessSubmitResult,
} from "./SuccessModal";
import { StarMark } from "./Wordmark";
import WusLogo from "@/public/wus-logo.svg"
import Image from "next/image";

type Phase = "intro" | "question" | "feedback" | "result";

interface Session {
  questions: PublicQuestion[];
  index: number;
  correct: number;
  wrong: number;
  results: AnsweredQuestion[];
  status: QuizStatus;
}

function newSession(bank: PublicQuestion[]): Session {
  return {
    questions: sampleQuestions(bank),
    index: 0,
    correct: 0,
    wrong: 0,
    results: [],
    status: "IN_PROGRESS",
  };
}

export default function QuizApp({
  bank,
  leadCapture = true,
}: {
  bank: PublicQuestion[];
  /** Route-selected: true renders the lead-capture form on the success modal. */
  leadCapture?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [modalOpen, setModalOpen] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [lastAnswer, setLastAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [captureVariant, setCaptureVariant] = useState<CaptureVariant>("pass");

  const start = useCallback(() => {
    setSession(newSession(bank));
    setFeedback(null);
    setGradeError(false);
    setModalOpen(false);
    setPhase("question");
  }, [bank]);

  const handleSubmit = useCallback(
    async (answer: string) => {
      if (!session || grading) return;
      const question = session.questions[session.index];

      setGrading(true);
      let verdict;
      try {
        verdict = await gradeAnswer(question, answer);
      } catch (err) {
        // Server unreachable — leave the user on the question to retry rather
        // than silently scoring it. The answer key stays on the server.
        console.error("grading failed:", err);
        setGrading(false);
        setGradeError(true);
        return;
      }
      setGrading(false);
      setGradeError(false);

      const { correct } = verdict;
      const correctCount = session.correct + (correct ? 1 : 0);
      const wrongCount = session.wrong + (correct ? 0 : 1);
      const status = evaluateStatus(correctCount, wrongCount);
      const results = [...session.results, { question, userAnswer: answer, correct }];

      setSession({
        ...session,
        correct: correctCount,
        wrong: wrongCount,
        results,
        status,
      });
      setFeedback({
        correct,
        acceptableAnswers: verdict.acceptableAnswers,
        explanation: verdict.explanation,
        status,
        progress: computeProgress(correctCount, wrongCount),
        reason: verdict.reason,
      });
      setLastAnswer(answer);
      setPhase("feedback");
    },
    [session, grading],
  );

  const handleNext = useCallback(() => {
    if (!session) return;
    if (session.status !== "IN_PROGRESS") {
      setPhase("result");
      if (session.status === "PASSED") {
        setCaptureVariant("pass");
        setSuccessOpen(true);
      }
      return;
    }
    setSession({ ...session, index: session.index + 1 });
    setFeedback(null);
    setGradeError(false);
    setPhase("question");
  }, [session]);

  const retry = useCallback(() => {
    setSession(newSession(bank));
    setFeedback(null);
    setGradeError(false);
    setSuccessOpen(false);
    setPhase("question");
  }, [bank]);

  // Bail out mid-quiz: surface the same lead-capture form with the give-up
  // message instead of a passing score.
  const giveUp = useCallback(() => {
    setCaptureVariant("giveup");
    setSuccessOpen(true);
  }, []);

  const backToStart = useCallback(() => {
    setPhase("intro");
    setSession(null);
    setFeedback(null);
    setSuccessOpen(false);
    setModalOpen(true);
  }, []);

  const handleSuccessSubmit = useCallback(async (data: SuccessFormData): Promise<SuccessSubmitResult> => {
    const searchParams = new URLSearchParams(window.location.search);

    const result = await submitSuccessModal({
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      opt_out: !data.marketingConsent,
      zip: data.zip,
      utm_medium: searchParams.get("utm_medium") ?? "",
      utm_campaign: searchParams.get("utm_campaign") ?? "",
      utm_source: searchParams.get("utm_source") ?? "",
      path: window.location.pathname + window.location.search,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: "We couldn't send your details right now. Please try again.",
      };
    }

    setSuccessOpen(false);
    return { ok: true };
  }, []);

  const current = session?.questions[session.index];
  const isTerminal = session ? session.status !== "IN_PROGRESS" : false;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <header className="mx-auto grid w-full max-w-2xl grid-cols-3 items-center px-5 pt-6 sm:px-6">
        <span aria-hidden="true" />
        <a
          href="https://welcome.us"
          target="_blank"
          rel="noopener noreferrer"
          className="justify-self-center rounded-lg transition-opacity hover:opacity-80"
          aria-label="Welcome.US (opens in a new tab)"
        >
          <Image src={WusLogo} alt="Welcome.US" className="h-8 w-auto" />
        </a>
        {phase !== "intro" ? (
          <div className="flex items-center justify-end gap-4">
            {(phase === "question" || phase === "feedback") && (
              <button
                type="button"
                onClick={giveUp}
                className="font-ui text-sm font-medium text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
              >
                Give Up
              </button>
            )}
            <button
              type="button"
              onClick={backToStart}
              className="font-ui text-sm font-medium text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
            >
              Restart
            </button>
          </div>
        ) : (
          <span aria-hidden="true" />
        )}
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-8 sm:px-6">
        {phase === "intro" && <IntroHero onStart={() => setModalOpen(true)} />}

        {phase === "question" && current && session && (
          <QuestionCard
            question={current}
            index={session.index}
            results={session.results}
            correct={session.correct}
            onSubmit={handleSubmit}
            pending={grading}
            error={gradeError}
          />
        )}

        {phase === "feedback" && current && session && feedback && (
          <FeedbackPanel
            question={current}
            userAnswer={lastAnswer}
            feedback={feedback}
            index={session.index}
            results={session.results}
            isTerminal={isTerminal}
            onNext={handleNext}
          />
        )}

        {phase === "result" && session && session.status !== "IN_PROGRESS" && (
          <ResultScreen
            status={session.status}
            results={session.results}
            correct={session.correct}
            onRetry={retry}
          />
        )}
      </main>

      <footer className="mx-auto w-full max-w-2xl px-5 pb-6 text-center sm:px-6">
        <p className="font-muted text-xs text-ink-soft">
          Practice tool · Questions from the official USCIS civics bank (public
          domain). Not affiliated with USCIS.
        </p>
      </footer>

      <StartModal open={modalOpen} onConfirm={start} onCancel={() => setModalOpen(false)} />
      <SuccessModal
        open={successOpen}
        variant={captureVariant}
        leadCapture={leadCapture}
        onSubmit={handleSuccessSubmit}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}

function IntroHero({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-float-up text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft shadow-sm">
        <StarMark className="h-3.5 w-3.5 text-accent" />
        U.S. Naturalization · Civics
      </span>

      <h1 className="mt-6 text-balance font-display text-5xl font-normal leading-[1.05] text-ink sm:text-6xl">
        Practice the civics test,
        <br />
        <span className="text-brand">welcome home.</span>
      </h1>

      <p className="mx-auto mt-5 max-w-md text-pretty font-body text-lg leading-relaxed text-ink-soft">
        {TOTAL_QUESTIONS} questions, {PASS_THRESHOLD} to pass. Type your answers
        in your own words — we grade them the way a fair officer would.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FDB913] px-8 py-4 font-ui text-base font-semibold text-[#020049] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e5a50f] hover:shadow-[0_10px_30px_-6px_rgba(253,185,19,0.275),0_0_44px_-4px_rgba(253,185,19,0.225)] active:translate-y-0 active:scale-[0.98]"
      >
        Start practicing
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
