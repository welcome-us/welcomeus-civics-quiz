# WelcomeUS Civics Quiz — Build Plan

A build plan for an open-ended (free-text) U.S. civics practice quiz, intended for Claude Code. Each session presents 20 questions drawn from a master bank, answers are typed as free text and scored by an LLM, and 12 correct answers are required to pass.

---

## 1. Background & key decision

The requested format — **20 questions per session, 12 correct to pass, end early on win/loss** — matches the **USCIS 2025 redesigned civics test** (128-question bank, 20 asked, 12 to pass, exam stops at 12 correct or 9 incorrect). This is important for two reasons:

1. **Master question bank source:** Use the **official USCIS 2025 (128-question) civics list** as the seed for the master bank, not the older 2008 (100-question) list. The 2008 list is the wrong format (10 asked / 6 to pass).
2. **Validation of the win/auto-fail rules:** The real exam stops once a candidate reaches 12 correct *or* 9 incorrect — identical to rules 6 and 7. The state machine below encodes exactly this.

References for the engineer to pull source material from (do not hardcode without verifying against the official source):
- USCIS study materials: `https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test`
- The "One Nation, One People: 2025 Civics Test" official 128-question list (PDF on the USCIS site above).

> Note: USCIS questions and answers are U.S. federal government works and are in the public domain, so they may be reproduced in the app. Always copy them verbatim from the official PDF rather than from third-party study sites.

---

## 2. Goals & non-goals

**Goals**
- Deliver a working, accessible practice quiz that faithfully implements the 7 rules below.
- Score open-ended answers leniently and correctly using an LLM, the way a fair USCIS officer would.
- End sessions early on a guaranteed pass or guaranteed fail.

**Non-goals (for v1)**
- User accounts, persistent history, or analytics dashboards (can be layered on later).
- Voice input / spoken answers (the real test is oral, but v1 is text-only per spec).
- The official English reading/writing portions of the naturalization test.

---

## 3. Requirements (the 7 rules, made precise)

1. **20 questions per session**, sampled at random (without replacement) from the master bank.
2. **Open-ended answers only** — a single free-text input; no multiple choice.
3. **12 correct to pass.** An answer is *correct* if it is any reasonable variation of an official USCIS acceptable answer. Typos, casing, punctuation, extra/missing filler words, and equivalent phrasings must **not** cause a wrong mark.
4. **Immediate feedback** after each submission: correct/incorrect verdict, the official acceptable answer(s), and a brief explanation.
5. **Next-question flow** — after reading feedback, the user clicks "Next" to advance.
6. **Auto-fail** — the instant it becomes mathematically impossible to reach 12 correct with the questions remaining, end the session and show the failure screen.
7. **Win condition** — the instant the user reaches 12 correct, end the session and show the pass screen.

---

## 4. Quiz state machine (core correctness logic)

This is the most important piece to get right and the most important piece to unit-test. Implement it as **pure functions** with no I/O so it can be tested exhaustively, and compute the verdict **server-side** so a tampered client cannot fake a pass.

**Constants**
```
TOTAL_QUESTIONS = 20
PASS_THRESHOLD  = 12
MAX_WRONG       = TOTAL_QUESTIONS - PASS_THRESHOLD   // = 8
```

**Session state**
```
correctCount    // answers marked correct so far
wrongCount      // answers marked incorrect so far
answeredCount = correctCount + wrongCount
remaining     = TOTAL_QUESTIONS - answeredCount
```

**Evaluate status after each scored answer (in this order):**
```
1. WIN:  if correctCount >= PASS_THRESHOLD              -> status = PASSED, end session
2. FAIL: if correctCount + remaining < PASS_THRESHOLD   -> status = FAILED, end session
            (equivalently: wrongCount > MAX_WRONG, i.e. wrongCount >= 9)
3. DONE: if remaining == 0                              -> terminal:
            PASSED if correctCount >= PASS_THRESHOLD else FAILED
4. else: status = IN_PROGRESS, advance to next question
```

The win check must come before the fail check (a session can't be both, but ordering keeps intent explicit). Steps 1–2 already cover the natural end-of-quiz cases; step 3 is an explicit safety net.

**Worked intuition:** with 20 questions and 12 needed, a user can afford at most 8 wrong. The 9th wrong answer makes 12 unreachable (8 remaining at best + however many correct < 12), so it triggers auto-fail. The 12th correct answer triggers an immediate pass. Both can happen well before question 20.

Implement the fail check as the **inequality** `correctCount + remaining < PASS_THRESHOLD` rather than a hardcoded `wrongCount >= 9`, so the logic stays correct if `TOTAL_QUESTIONS` or `PASS_THRESHOLD` are ever changed via config.

---

## 5. LLM-based answer scoring

### 5.1 Model recommendation

Use **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) via the Anthropic Messages API as the scorer:
- Fuzzy answer-matching is a lightweight, well-bounded classification task — it does not need a frontier model.
- Haiku 4.5 is the fastest/cheapest current Claude tier (~$1 / $5 per million input/output tokens, 200K context), which keeps per-answer latency and cost low for a high-volume quiz.
- **Escalation path:** if eval results show it mis-grading subtle paraphrases, swap to **Claude Sonnet 4.6** (`claude-sonnet-4-6`) for grading only. Keep the model name in config so it's a one-line change.

Get the key from a server-side env var (`ANTHROPIC_API_KEY`). **Never expose the key to the browser**; all scoring goes through a server endpoint.

### 5.2 Two-stage scoring (cheap path first)

To cut cost and latency, score in two stages:

**Stage 1 — deterministic pre-check (no LLM call).** Normalize the user answer and each acceptable answer (lowercase, trim, strip punctuation, collapse internal whitespace, optionally strip leading filler like "the answer is"). If the normalized user answer exactly matches *or* is within a high fuzzy-similarity threshold (e.g. Levenshtein ratio ≥ ~0.9 or Dice coefficient ≥ ~0.85) of any acceptable answer, mark **correct** immediately. This handles the overwhelmingly common case (right answer + typo) for free.

> Important: the pre-check may only *confirm* correctness, never *reject*. If nothing matches, **always fall through to the LLM** — semantic equivalence (synonyms, paraphrases, "name one of…" answers) needs the model. Do not deterministically mark anything incorrect.

**Stage 2 — LLM verdict.** Only called when Stage 1 finds no match. Send the question, the official acceptable answers, and the user's answer; get back a structured correct/incorrect verdict.

### 5.3 Scorer responsibilities (kept narrow)

The LLM returns **only the correctness verdict**. The displayed *acceptable answers* and *brief explanation* come from the **authored question bank**, not the model — this keeps feedback consistent, high-quality, and reviewable, and avoids the model hallucinating an explanation. So:
- Verdict (correct/incorrect) → LLM (or Stage-1 pre-check)
- Acceptable answers shown → from bank
- Explanation shown → from bank

### 5.4 Scorer prompt (template)

System prompt:
```
You are grading one answer on a U.S. citizenship (USCIS) civics practice test.
Grade the way a fair, lenient USCIS officer would: accept any answer that shows
genuine understanding.

ACCEPT as correct:
- Any of the official acceptable answers, in any wording.
- Misspellings, typos, phonetic/ESL spellings, wrong casing, and punctuation
  differences, as long as the intended meaning is clearly one of the acceptable
  answers.
- Synonyms and equivalent phrasings (e.g. "the President" vs a named office).
- For "name one ..." questions, ANY single valid item is correct.
- Answers with extra harmless words around a correct answer.

MARK INCORRECT:
- Blank/empty answers, or "I don't know" / "skip".
- Off-topic, factually wrong, or guesses that don't match any acceptable answer.
- Answers that merely restate the question without answering it.

Respond with ONLY a JSON object, no other text:
{"correct": true|false}
```

User message:
```
Question: {{question_text}}
Official acceptable answers: {{json_array_of_acceptable_answers}}
User's answer: {{user_answer_raw}}
```

Implementation notes:
- Prefer a **tool/structured-output** call or strict-JSON instruction; parse defensively (strip code fences, `try/catch`, default to a safe fallback).
- Keep `max_tokens` small (the response is tiny).
- On API error/timeout, fall back gracefully: retry once, then either (a) accept Stage-1 result if any, or (b) surface a non-blocking "couldn't grade — try again" rather than silently marking wrong. Log the failure.
- Cap user answer length server-side (e.g. 500 chars) before sending.

---

## 6. Data model

### 6.1 Question bank schema (`/data/questions.json`)

```jsonc
{
  "id": "q-001",
  "category": "American Government",        // for optional stratified sampling
  "question": "What is the supreme law of the land?",
  "acceptableAnswers": ["the Constitution"], // verbatim from USCIS, all variants
  "explanation": "The U.S. Constitution is the highest law; all other laws must agree with it.",
  "dynamic": false,                          // true for officeholder/state answers
  "stateSpecific": false,                    // true if answer depends on user's state
  "lastVerified": "2026-05-29"               // for dynamic answers especially
}
```

### 6.2 Dynamic & state-specific answers (must-handle)

Some official answers change over time or depend on the user's state: current President / Vice President / Speaker of the House / Chief Justice, and "your" U.S. senators, U.S. representative, governor, and state capital. For v1, choose one of:

- **Option A (simplest):** exclude `dynamic` and `stateSpecific` questions from the sampled bank. Ship a clearly-scoped subset. Fastest to correctness.
- **Option B (fuller):** add an optional "Select your state" step at quiz start, maintain an `officials.json` of current officeholders with a `lastVerified` date, and inject the correct acceptable answers for those questions at session-creation time.

Recommend **Option A for the first working build**, then **Option B** as a follow-up. Either way, mark these questions in the schema so they're handled deliberately and flagged for periodic review.

### 6.3 Session (server-authoritative)

```jsonc
{
  "sessionId": "uuid",
  "questionIds": ["q-014", "q-003", ...],    // the 20 sampled, fixed order
  "currentIndex": 0,
  "correctCount": 0,
  "wrongCount": 0,
  "status": "IN_PROGRESS",                    // IN_PROGRESS | PASSED | FAILED
  "createdAt": "..."
}
```

Store sessions in-memory for a single-instance MVP, or in a lightweight store (SQLite/Redis) if running multiple instances. The server — not the client — owns `correctCount`, `wrongCount`, and `status`.

### 6.4 Sampling

- MVP: uniform random sample of 20 **distinct** questions (Fisher–Yates shuffle, take 20).
- Enhancement: **stratified** sampling across the three USCIS sections (American Government / American History / Integrated Civics) to mirror real exam balance.

---

## 7. API design (server-authoritative)

Two endpoints; both keep answers and tallies on the server.

**`POST /api/session`** — start a session.
- Samples 20 question IDs, creates a session record.
- Returns `sessionId` and the **first** question (`id`, `question`, `category`) — *not* its answers.

**`POST /api/answer`** — submit one answer.
- Body: `{ sessionId, questionId, answer }`.
- Server: validates the session/question, runs scoring (Stage 1 → Stage 2), updates counts, runs the state machine.
- Returns:
  ```jsonc
  {
    "correct": true,
    "acceptableAnswers": ["the Constitution"],   // from bank, for feedback
    "explanation": "…",                          // from bank
    "progress": { "correct": 5, "wrong": 2, "answered": 7, "remaining": 13 },
    "status": "IN_PROGRESS",                     // or PASSED / FAILED
    "nextQuestion": { "id": "...", "question": "...", "category": "..." } // null if ended
  }
  ```
- Reject submissions for a session whose `status` is already terminal.

Do **not** ship the full bank (with answers) to the client up front — return acceptable answers/explanations only after each submission, so the answers can't be peeked.

---

## 8. UI / UX flow

Screens:
1. **Start** — short intro: 20 questions, 12 to pass, type your answers. "Start quiz" button. (Optional state selector if Option B.)
2. **Question** — question text, category label, a single multi-line text input, and a progress indicator (e.g. "Question 7 of 20 · 5 correct"). "Submit" button. Disable submit on empty input; allow Enter-to-submit.
3. **Feedback** (after submit) — clear ✅/❌ verdict, the official acceptable answer(s), the brief explanation, and a "Next" button (rule 5). Show updated progress.
4. **Result** — pass or fail screen with final score (e.g. "You passed: 12 / 14 answered"), reached as soon as the win/auto-fail/finish condition fires. Offer "Try again" (new random 20).

Flow control:
- After feedback, **Next** calls nothing if the returned `status` is terminal → route straight to the Result screen. Otherwise it shows `nextQuestion` from the previous response.
- Show a loading state on Submit while scoring runs (LLM call is ~1s).

---

## 9. Accessibility & internationalization

WelcomeUS serves immigrants and refugees with a wide range of English proficiency, so this matters more than usual:
- **Plain, large, high-contrast** text; mobile-first responsive layout; generous tap targets.
- **Full keyboard navigation**; visible focus states; Enter submits.
- **Screen-reader support:** announce feedback via an `aria-live` region so the verdict is read aloud after submit.
- **i18n-ready:** structure UI strings for translation (e.g. an `i18n` map), even if v1 ships English-only. Note that civics *answers* must remain in English (the real test is in English), but instructions, buttons, and feedback chrome can be translated. Spanish is the highest-value first translation for this audience.

---

## 10. Security & robustness

- API key server-side only; never in client bundles or responses.
- Validate and length-cap user input before scoring.
- Rate-limit `/api/answer` per session/IP to control LLM spend and abuse.
- Sanitize any user text rendered back to the page.
- Handle LLM timeouts/errors with retry + graceful fallback (don't silently mark correct answers wrong).
- Don't trust client-sent tallies; recompute server-side every turn.

---

## 11. Suggested stack & project structure

**Stack:** Next.js (React + TypeScript) with API routes — single codebase, server-side scoring keeps the key safe, deploys easily (e.g. Vercel/Netlify). Tailwind CSS for accessible styling. Question bank as JSON; no database required for v1 (add SQLite/Redis only if multi-instance or attempt logging is needed). Anthropic SDK for the Messages API.

> Any equivalent stack is fine (e.g. Vite + React front end with a small Express/Fastify backend). The hard requirement is: **scoring and verdict computation run on a server**, not in the browser.

```
/data
  questions.json          // master bank (128 USCIS 2025 questions)
  officials.json          // optional, for dynamic/state answers (Option B)
/lib
  quizState.ts            // pure state-machine functions (heavily tested)
  scoring.ts              // normalize + pre-check + LLM call + JSON parse
  sampling.ts             // random / stratified selection
  sessions.ts             // session store
/app
  api/session/route.ts
  api/answer/route.ts
  (ui screens: start, question, feedback, result)
/tests
  quizState.test.ts
  scoring.eval.ts
```

---

## 12. Testing plan

**State machine (unit tests — exhaustive).** Assert correct status for at least:
- Reaching exactly 12 correct on question 20 → PASSED.
- Reaching 12 correct early (e.g. by question 14) → PASSED, session ends, no further questions.
- 9th wrong answer mid-quiz → FAILED immediately, session ends.
- Finishing all 20 with exactly 11 correct → FAILED.
- Finishing all 20 with 12 correct, 8 wrong → PASSED.
- A submission to an already-terminal session is rejected.
- Property test: status is never both PASSED and FAILED; counts never exceed 20.

**Scorer (golden eval set, run against the live grader).** For a sample of ~15–20 questions, define answers that **must** be accepted and answers that **must** be rejected:
- *Must pass:* exact answer; same answer with typos / wrong case / no punctuation; valid synonym/paraphrase; for "name one…" a single valid item; correct answer wrapped in filler.
- *Must fail:* blank; "I don't know"; a different (wrong) but plausible-sounding answer; restating the question.
Track pass rate and review any miss before changing the model.

**End-to-end:** start a session, drive it to each terminal outcome (early win, early fail, full-quiz pass, full-quiz fail) through the API.

---

## 13. Build milestones

1. Scaffold project; load and validate the 128-question bank (schema check, no dupes, every question has acceptable answers + explanation).
2. Implement and unit-test the pure quiz state machine (Section 4 + 12).
3. Implement scoring: normalization + deterministic pre-check, then Haiku 4.5 verdict; write and run the scorer eval set.
4. Build server endpoints (`/api/session`, `/api/answer`), server-authoritative session + verdict.
5. Build UI screens and the submit → feedback → next → result flow.
6. Accessibility pass (keyboard, contrast, aria-live), error handling, deploy, then optionally add Option B (state-specific answers) and Spanish UI.

---

## 14. Decisions to confirm with stakeholders

- **Dynamic/state questions:** ship Option A (exclude) first, or go straight to Option B (state selector + maintained officials list)?
- **Session persistence/analytics:** is logging attempts/scores needed, or is the quiz fully ephemeral for v1?
- **Languages:** English-only at launch, or Spanish UI from day one?
- **Sampling:** uniform random vs stratified-by-section?
- **Scorer model:** start on Haiku 4.5 (recommended) and only escalate to Sonnet 4.6 if evals demand it — confirm acceptable.
