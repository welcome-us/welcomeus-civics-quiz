// POST /api/grade — judge one civics answer on the server.
//
// Request body: { questionId: string, userAnswer: string }
// Response:     { correct: boolean, acceptableAnswers: string[],
//                 explanation: string, reason?: string }
//
// The answer key never leaves the server except as feedback *after* grading:
// the client sends only a question id, we look the answers up here, grade with
// Claude Haiku when a key is configured (falling back to the deterministic
// matcher otherwise), and return the answers + explanation to show the user
// (plan.md §10).

import questions from "@/data/questions.json";
import { gradeAnswer } from "@/lib/quiz/llm-grader";
import { scoreAnswer } from "@/lib/quiz/scoring";
import type { Question } from "@/lib/quiz/types";

const BANK = questions as Question[];
const MAX_ANSWER_LENGTH = 1000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { questionId, userAnswer } = (body ?? {}) as {
    questionId?: unknown;
    userAnswer?: unknown;
  };

  if (
    typeof questionId !== "string" ||
    typeof userAnswer !== "string" ||
    userAnswer.length > MAX_ANSWER_LENGTH
  ) {
    return Response.json({ error: "malformed grade request" }, { status: 400 });
  }

  const question = BANK.find((q) => q.id === questionId);
  if (!question) {
    return Response.json({ error: "unknown question" }, { status: 404 });
  }

  const { acceptableAnswers, explanation } = question;

  // Prefer the Haiku verdict; fall back to the deterministic matcher when no
  // key is configured or the upstream call fails, so grading never errors out
  // and never silently flips a verdict.
  let correct: boolean;
  let reason: string | undefined;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const verdict = await gradeAnswer({
        question: question.question,
        acceptableAnswers,
        userAnswer,
      });
      correct = verdict.correct;
      reason = verdict.reason;
    } catch (err) {
      console.error("grade route: Haiku grading failed, using fallback:", err);
      correct = scoreAnswer(userAnswer, acceptableAnswers);
    }
  } else {
    correct = scoreAnswer(userAnswer, acceptableAnswers);
  }

  return Response.json({ correct, acceptableAnswers, explanation, reason });
}
