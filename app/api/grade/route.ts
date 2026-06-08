// POST /api/grade — judge one civics answer with Claude Haiku.
//
// Request body: { question: string, acceptableAnswers: string[], userAnswer: string }
// Response:     { correct: boolean, reason: string }
//
// The client falls back to the deterministic matcher when this route errors
// (see lib/quiz/grade-client.ts), so a missing key or upstream failure must
// surface as a non-2xx rather than a silent wrong/right verdict.

import { gradeAnswer } from "@/lib/quiz/llm-grader";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { question, acceptableAnswers, userAnswer } = (body ?? {}) as {
    question?: unknown;
    acceptableAnswers?: unknown;
    userAnswer?: unknown;
  };

  if (
    typeof question !== "string" ||
    typeof userAnswer !== "string" ||
    !Array.isArray(acceptableAnswers) ||
    !acceptableAnswers.every((a) => typeof a === "string")
  ) {
    return Response.json({ error: "malformed grade request" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // No key configured — tell the client so it uses the offline fallback.
    return Response.json({ error: "grading unavailable" }, { status: 503 });
  }

  try {
    const verdict = await gradeAnswer({ question, acceptableAnswers, userAnswer });
    return Response.json(verdict);
  } catch (err) {
    console.error("grade route failed:", err);
    return Response.json({ error: "grading failed" }, { status: 502 });
  }
}
