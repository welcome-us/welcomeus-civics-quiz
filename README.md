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

The quiz ships as two route-selected variants off a **single engine** — there is
no duplicated quiz logic. The only thing that differs is one config table.

- **`/exam`** — lead-gen: a passing score opens the lead-capture form (posts to Salesforce).
- **`/civics`** — no form: a passing score opens a congrats-only modal; give-up shows the Citizen Guide CTA.
- **`/`** — 307 redirect to `/exam` (incoming query/UTMs preserved).

Variant behavior lives in [lib/quiz/variants.ts](lib/quiz/variants.ts) — a
`leadCapture` flag per variant. Each route page ([app/exam/page.tsx](app/exam/page.tsx),
[app/civics/page.tsx](app/civics/page.tsx)) is a thin wrapper that renders the
shared `QuizApp` with its variant config. Adding a third flavor means editing the
config table, not forking components.

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
