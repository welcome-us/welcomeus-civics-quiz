// Server-side answer grading with Claude Haiku (plan.md §5.4 "Stage 2").
//
// This is the LLM verdict that replaces the browser-only matcher: every
// submitted answer is judged by a single, low-latency Haiku call. It is the
// server half of the seam described in `scoring.ts` — the deterministic
// matcher stays as an offline fallback (see `grade-client.ts`).
//
// Only ever imported from the `app/api/grade` Route Handler, so the API key
// never reaches the browser.

import Anthropic from "@anthropic-ai/sdk";

export interface Verdict {
  correct: boolean;
  /** One short sentence the officer would say — surfaced in the feedback panel. */
  reason: string;
}

export interface GradeInput {
  question: string;
  acceptableAnswers: string[];
  userAnswer: string;
}

const SYSTEM = `You are a fair, experienced USCIS officer grading a practice answer on the U.S. naturalization civics test.

Grade the way a real officer would during the interview — generously and by meaning, not by exact wording:
- Accept any answer whose meaning matches one of the official acceptable answers, including paraphrases, synonyms, partial-but-sufficient answers, and answers wrapped in filler ("I think it's...").
- Ignore spelling, capitalization, punctuation, and minor grammar.
- The official list is not exhaustive; accept a factually correct response that a reasonable officer would allow even if it is not verbatim on the list.
- Reject blank, off-topic, "I don't know", or factually wrong answers.

Respond ONLY with the structured verdict: "correct" (true/false) and a one-sentence "reason" addressed to the applicant.`;

const VERDICT_SCHEMA = {
  type: "object",
  properties: {
    correct: {
      type: "boolean",
      description: "True if the applicant's answer would be accepted.",
    },
    reason: {
      type: "string",
      description: "One short sentence explaining the verdict, addressed to the applicant.",
    },
  },
  required: ["correct", "reason"],
  additionalProperties: false,
} as const;

export async function gradeAnswer(input: GradeInput): Promise<Verdict> {
  // Reads ANTHROPIC_API_KEY from the environment.
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content:
          `Question: ${input.question}\n` +
          `Official acceptable answers: ${input.acceptableAnswers.join(" | ")}\n` +
          `Applicant's answer: ${input.userAnswer}`,
      },
    ],
    output_config: { format: { type: "json_schema", schema: VERDICT_SCHEMA } },
  });

  const block = message.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!block) throw new Error("grader returned no text block");

  const parsed = JSON.parse(block.text) as Partial<Verdict>;
  if (typeof parsed.correct !== "boolean") {
    throw new Error("grader verdict missing 'correct' boolean");
  }
  return { correct: parsed.correct, reason: parsed.reason ?? "" };
}
