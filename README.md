# Welcome.US Civics Quiz

A practice tool for the U.S. naturalization civics test. Users answer questions
in their own words; answers are graded server-side, and a passing (or give-up)
result surfaces a Welcome.US call to action.

Built with Next.js 16 (App Router) and React 19. See [AGENTS.md](AGENTS.md) — this
Next.js version has breaking changes from older releases; read the bundled guides
in `node_modules/next/dist/docs/` before relying on framework APIs.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the keys below
npm run dev                  # http://localhost:3000
```

`npm run build` for a production build, `npm run lint` to lint.

## Variants

The quiz ships as three route-selected variants off a **single engine** — there is
no duplicated quiz logic. The only thing that differs is one config table.

| Route | Questions | To pass | Breaks | Lead form |
|---|---|---|---|---|
| **`/exam`** | 20 | 12 | yes | on a passing score (posts to Salesforce) |
| **`/civics`** | 20 | 12 | yes | never — a congrats-only modal; give-up shows the Citizen Guide CTA |
| **`/trivia`** | 5 | 3 | no | for **everyone who finishes**, pass or fail |

- **`/`** — 307 redirect to `/exam` (incoming query/UTMs preserved).

Variant behavior lives in [lib/quiz/variants.ts](lib/quiz/variants.ts). Each route
page ([app/exam/page.tsx](app/exam/page.tsx), [app/civics/page.tsx](app/civics/page.tsx),
[app/trivia/page.tsx](app/trivia/page.tsx)) is a thin wrapper that renders the
shared `QuizApp` with its variant config. Adding another flavor means editing the
config table, not forking components.

The config is published to the component tree by `QuizConfigProvider`
([app/components/QuizConfigContext.tsx](app/components/QuizConfigContext.tsx)) and
read with `useQuizConfig()`. Anything that renders a count, a pass bar, or a
question number pulls it from there — no component imports a hardcoded total.

Two knobs are worth calling out, both set for `/trivia`:

- **`endEarly: false`** — the session runs its full length instead of resolving
  the moment the outcome is locked in. On a 5-question quiz, stopping at 3
  correct would cut it in half.
- **`maxEasy: 1`** — caps EASY-tagged questions per session, so a short quiz
  can't be won on the gentlest questions in the bank. Note that only `EASY` is
  tagged in [data/questions.json](data/questions.json) (16 of 120 gradeable
  questions); everything else has no `difficulty` field, so the cap really reads
  as "one tagged-easy question, the rest untagged". Every variant still *opens*
  with an easy question when one is available.

Both defaults (`endEarly: true`, no cap) preserve the original 20-question
behavior exactly.

## User flow

```text
Start modal → Question → Feedback ─┬─ terminal (pass/auto-fail) → Result (+ success modal)
                  ↑                ├─ break due → Interstitial ──┐
                  └────────────────┴─ next question ─────────────┘
```

On the 20-question variants, every 3–4 answered questions the quiz pauses on an
**interstitial** — a Welcoming message or study tip on a dark canvas, with artwork
and a one-click skip. It is a breather, never a gate. (`/trivia` sets
`interstitials: false` and gets an empty schedule — five questions are short
enough that a break would interrupt rather than relieve.)

- **Cadence and content** live in [lib/quiz/interstitials.ts](lib/quiz/interstitials.ts):
  a bucket of 12 typed messages plus `planInterstitials()`, which draws a fresh
  schedule and a shuffled message order per session. Gaps are 3–4 answers, drawn
  per step so the rhythm isn't metronomic.
- **Never before the result.** The terminal (win / auto-fail) check runs first, so
  a break can't stand between a user and their score. Nothing is scheduled at
  the final question either.
- **Always skippable** — a primary "Skip to question *N*" button, auto-focused so
  Enter works immediately, plus Escape.
- **Dark theme** is a token flip: the card sets `data-theme="dark"` on `<html>`
  while mounted, so the whole page turns with it (palette in
  [app/globals.css](app/globals.css)), and restores on unmount.
- **Copy is placeholder** pending the team's final text. Swapping it means editing
  `eyebrow` / `headline` / `body` per entry — the scheduling logic reads the bucket
  generically and adapts to any length. Drop in real art per message via `image`
  (raster; plain-string SVG paths need `dangerouslyAllowSVG`).

Review all 12 without playing through the quiz at **`/preview`** → "Interstitial ·
tips"; its skip button cycles the bucket.

## Architecture

- **Routing is path-based within one deployment.** The `app/` folder structure
  defines the routes; the `/` → `/exam` redirect is configured in
  [next.config.ts](next.config.ts) and honored natively by Vercel (no `vercel.json`).
- **The answer key never reaches the browser.** [app/page-level loaders](lib/quiz/bank.ts)
  strip `acceptableAnswers` / `explanation` from each question; the client only
  ever sees `PublicQuestion` fields. Grading happens behind `/api/grade` by
  question id, and the correct answer is returned only *after* a guess is scored.
- **Grading degrades gracefully.** [app/api/grade/route.ts](app/api/grade/route.ts)
  uses the Anthropic (Haiku) grader when `ANTHROPIC_API_KEY` is set, and falls
  back to a deterministic string matcher when it is not — grading never errors
  out and never silently flips a verdict.
- **Lead capture** is a single server action,
  [app/_actions/submit-success-modal.ts](app/_actions/submit-success-modal.ts),
  which validates the payload and POSTs to the configured Salesforce endpoint.

## Environment variables

Copy [.env.example](.env.example) to `.env.local`. Both are read at **runtime**
(server action / API route), so the build succeeds without them.

| Variable            | Required          | Effect when missing                                  |
| ------------------- | ----------------- | ---------------------------------------------------- |
| `SF_ENDPOINT`       | yes (for `/exam`) | lead submissions fail; **no leads captured**         |
| `ANTHROPIC_API_KEY` | recommended       | grading falls back to the deterministic matcher      |

## Dependency overrides

`package.json` carries an `overrides` block. JSON has no comments, so the reasons
live here — **check each one before removing it**, and drop it once the upstream
constraint relaxes.

| Override | Why |
| --- | --- |
| `postcss: ^8.5.26` | `next` pins `postcss` to exactly `8.4.31`, which is below the fix for four sourceMappingURL file-read advisories. Bumping `next` alone does **not** move it. |
| `sharp: ^0.35.3` | `next` declares `sharp: ^0.34.5`, and `^0.34.x` excludes `0.35.0` — where the libvips CVEs are fixed. Only an override crosses that boundary. |
| `nanoid: ^3.3.18` | Pulled in by `postcss`; the patched line is `3.3.18`. |

Verified when these were added: the `postcss` bump produces **byte-identical**
compiled CSS (only Next's own font asset hashes change), and Next drives
`sharp@0.35.3` through `/_next/image` to a valid optimized WebP.

Note the app itself only ships SVGs (static imports, `dangerouslyAllowSVG` off),
so `sharp` does almost no work here in practice.

## Deployment

Hosted on Vercel; `master` is the Production branch and serves the subdomain.
Workflow: work on `develop`, open a PR into `master`, merge to deploy.

- Set `SF_ENDPOINT` and `ANTHROPIC_API_KEY` in the Vercel **Production**
  environment. Preview deployments don't inherit Production-scoped vars, so the
  form and the LLM grader degrade there unless the vars are added to Preview too
  (use a sandbox Salesforce endpoint for Preview to avoid polluting the CRM).
- After changing env vars, redeploy — Vercel does not apply them to existing builds.
- Smoke test on the live subdomain: `/` 307s to `/exam`; pass `/exam` and submit
  a test lead to confirm `SF_ENDPOINT` end-to-end; `/civics` shows no form;
  append `?utm_source=test` and confirm the UTM carries through to the lead.
