# Between-Question Screens — Process & Signoff Plan

**Scope:** the interstitial ("Tip / Message") screens that appear between questions in the
Welcome.US civics quiz. Nothing else in the quiz is in scope for this workflow.

**Status:** **Live in production** as of 2026-08-12 (PR #24, commit `858c9a4`). The real copy set —
8 Citizen Guides messages + 4 testimonial quotes — and the four Welcome.US illustrations replaced
the placeholders and went straight to prod.

Stages 5 through 7 were bypassed, and Stages 2 and 3 were run informally: the copy sheet arrived
without a recorded flow signoff, and the merge happened without a review round, a written approval,
or a brand/legal pass on the one factual claim in the set. That is a decision the team is entitled
to make on content-only changes — this note records it rather than disputing it. What it means
practically:

- The [open items](#open-items) below are open **in production**, not in a preview build.
- Rollback is still a single revert of the merge commit on `master` (see Stage 8), so the cost of
  discovering a problem late is low.
- If this content set is revised, the stages below are the process to run — from Stage 3.

| | |
| --- | --- |
| Owner (process) | |
| Content lead | |
| Design lead | |
| Engineering | |
| Approver (final signoff) | — (not recorded) |
| Target prod date | 2026-08-12 — shipped |

---

## Why this document exists for something already live

The quiz is in production. The interstitial flow was already built, deployed, and instrumented —
but with **deliberately placeholder copy and placeholder artwork**. So this is not a plan to build
a new product; it is a change-management plan for replacing that placeholder content in a live
product with the team's real content. (That swap has now shipped — see Status above — so the stages
below are a record of how it went and the process to run on the next revision, not a plan from
zero.)

That distinction is what makes the formal stages worth running:

- The thing being signed off in Stage 2 is a **working build**, not a mockup. Reviewers can play
  it. That removes the usual "the mock looked different from the build" round-trip.
- Because the surface is live, the only irreversible step is Stage 8. Everything before it is
  reversible and costs nothing but time.
- The stage gates exist to make sure content, design, and legal/brand all touch the copy *before*
  it is in front of applicants — this content speaks to people mid-naturalization, so a sloppy
  claim ("9 in 10 pass") carries more weight than typical marketing copy.

---

## What is already built (Stage 1 output)

The proposed user flow, as shipped:

```text
Start modal → Question → Feedback ─┬─ terminal (pass/auto-fail) → Result (+ success modal)
                  ↑                ├─ break due → Interstitial ──┐
                  └────────────────┴─ next question ─────────────┘
```

Behavior as shipped — the rows the team was asked to sign off on, none of which changed with the
content swap:

| Decision | As built | Reference |
| --- | --- | --- |
| Cadence | A break every **3–4 answered questions**, gap redrawn each time so the rhythm isn't metronomic | [lib/quiz/interstitials.ts:139-145](../lib/quiz/interstitials.ts#L139-L145) |
| Never blocks the score | Terminal (pass / auto-fail) check runs **first**; nothing scheduled at question 20 | [lib/quiz/interstitials.ts:157-171](../lib/quiz/interstitials.ts#L157-L171) |
| Always skippable | Primary "Skip to question *N*" button, auto-focused (Enter works immediately), plus Escape | [app/components/InterstitialCard.tsx:43-54](../app/components/InterstitialCard.tsx#L43-L54) |
| No repeats in a session | Messages drawn from a shuffled pool per session | [lib/quiz/interstitials.ts:161](../lib/quiz/interstitials.ts#L161) |
| Visual treatment | Full dark canvas — the pause reads as a change of pace, not another quiz screen | [app/components/InterstitialCard.tsx:35-41](../app/components/InterstitialCard.tsx#L35-L41) |
| Content volume | 12 messages, split `welcome` (8 Citizen Guides messages) and `quote` (4 testimonials) | [lib/quiz/interstitials.ts:39-136](../lib/quiz/interstitials.ts#L39-L136) |
| Artwork | Four Welcome.US illustrations — hands, flag, star, lightbulb — one per message, inlined so they paint with the card | [app/components/InterstitialGlyphs.tsx](../app/components/InterstitialGlyphs.tsx) |

A user answering all 20 questions sees roughly **5 of the 12** in one sitting.

---

## Open items

These are live in front of applicants right now. None of them is a bug — the feature works — but
each is something the skipped review stages would normally have caught.

| # | Item | Owner | Why it matters |
| --- | --- | --- | --- |
| 1 | **Uncited factual claim.** `no-expert-needed` states "two-thirds of people born in the U.S. can't" pass the test. No source was supplied with the copy sheet. | Content + brand/legal | The only checkable claim in the set. Applicants may repeat it. Needs a citation and a review date. |
| 2 | **Two reconstructed body strings.** The copy sheet arrived with two cells clipped at the column edge. `no-expert-needed` was completed as "…the answers; it's showing up." and `one-hour-a-week` as "…someone earning citizenship." | Content | The endings are inferred, not supplied. The lengths work out, but the words are a guess and are now shipping. |
| 3 | **Post-deploy smoke test not recorded.** See the Stage 8 checklist. | Engineering | Cheap to run, and the GA4 half (`message_id` values changed for all 12) is the only way to know the instrumentation survived the swap. |

Two standing items also carry forward — see [Known gaps](#known-gaps-to-resolve-in-stage-4) for the
`/preview` gating and the four-icons-across-twelve-messages question.

---

## Stages

Each stage has an owner, a concrete artifact, and an exit criterion. A stage is not "done" because
time passed — it is done when the exit criterion is met.

### 1. Review of proposed user flow — ✅ complete

- **Owner:** Engineering / Design
- **Artifact:** working build + the decision table above
- **Exit:** flow shared with the team — done

### 2. Signoff of user flow — ⚠️ not recorded

- **Owner:** Approver, with Content + Design input
- **Input:** the decision table above; a walkthrough of the live build
- **Artifact:** written approval, or a feedback list
- **Exit:** every row in the decision table is either approved or has a named alternative
- **Decisions actually open at this gate:** cadence (3–4 — too frequent? too rare?), the 12-message
  volume, whether the 8 `welcome` messages and 4 `quote` messages should be balanced or weighted,
  whether links out of the quiz are wanted at all mid-flow
- **If feedback instead of approval:** structural changes (cadence, screen count, dark theme) are
  cheap *now* and expensive after Stage 3, because copy is written to fit a format. Resolve them
  here.

### 3. Creation of new content — ✅ complete

- **Owner:** Content lead (drafting), Design lead (artwork)
- **Input:** the content spec below
- **Artifact:** a filled-in copy sheet (one row per message) + artwork files
- **Exit:** 12 complete entries — every required field filled, lengths within target, every factual
  claim sourced
- **Delivered:** a 12-row copy sheet (8 core + 4 quotes) and four illustrations. The exit criterion
  was not fully met — two cells arrived clipped and no claim sources came with the sheet. See
  [Open items](#open-items) 1 and 2.

The engineering side of this stage is zero-cost by design: the message bucket is a typed list, and
the scheduling logic reads it generically. Swapping copy means editing three strings per entry;
adding or cutting messages needs no code change at all.

### 4. Build — ✅ complete

- **Owner:** Engineering
- **Input:** approved copy sheet + artwork
- **Artifact:** a PR into `develop`
- **Exit:** copy in place, artwork wired, `npm run build` and `npm run lint` clean, reviewable on a
  Vercel Preview URL

Build shipped as PR #24 (`858c9a4`). Two content questions were raised here rather than blocking
the build — the reconstructed body strings and the uncited claim. Because Stages 5–7 were skipped,
they went to prod unresolved and are now tracked in [Open items](#open-items), along with two
standing items in [Known gaps](#known-gaps-to-resolve-in-stage-4).

### 5. Review / feedback — ⏭️ skipped

- **Owner:** Content + Design + Approver
- **Input:** Vercel Preview URL
- **Artifact:** consolidated feedback, one list, one round
- **Exit:** feedback delivered and triaged into "changing" / "not changing, because…"
- **Check specifically:** copy at mobile width (headlines wrap differently), artwork against the
  dark palette, tone reading in sequence rather than one at a time
- **Not run.** Those three checks have still never happened — they are now doable against prod
  rather than a Preview URL. The longest body in the set (`no-expert-needed`, 177 chars) is the one
  to look at first on a narrow screen.

### 6. Updates — ⏭️ skipped (nothing to close, since Stage 5 didn't run)

- **Owner:** Engineering (copy), Content/Design (rewrites)
- **Exit:** every Stage 5 item closed. If a rewrite is substantive, it loops back through 5 — but
  cap it at **two rounds**; a third round means the Stage 2 signoff didn't hold, and that is the
  thing to fix, not the copy.

### 7. Signoff — ⏭️ skipped

- **Owner:** Approver
- **Artifact:** written approval on the final Preview URL
- **Exit:** explicit go/no-go recorded, referencing the specific Preview deployment
- **Include here:** brand/legal review of factual claims, if that's a separate desk
- **Not run.** The go decision was the merge itself. The brand/legal pass on the two-thirds claim
  is [Open item 1](#open-items).

### 8. Push to prod — ✅ done, smoke test outstanding

- **Owner:** Engineering
- **Mechanics:** merge `develop` → `master`; Vercel deploys `master` to the live subdomain
- **Done:** PR #24 merged 2026-08-12 as `437c582`, carrying `858c9a4`
- **Exit:** post-deploy smoke test passes — **not yet recorded** ([Open item 3](#open-items)):
  - play `/exam` past question 4 and confirm a break appears with real copy and artwork
  - confirm the skip button, Enter, and Escape all resume the quiz
  - confirm `/civics` behaves the same
  - confirm `interstitial_view` events appear in GA4 with the new `message_id` values
- **Rollback:** revert the merge commit on `master`. The change is content-only — no data
  migration, no schema — so rollback is a single revert with no side effects.

---

## Content spec (hand this to whoever writes the copy)

Each message needs the following. Lengths are measured from the live set — treat them as targets,
not hard limits, but anything well over max will wrap badly on mobile.

| Field | Required | What it is | Length (live set) |
| --- | --- | --- | --- |
| `eyebrow` | yes | Small caps label above the headline — e.g. "Citizen Guides", "In their words" | 12–14 chars (median 14) |
| `headline` | yes | The one idea, large display type | 22–46 chars (median 30) |
| `body` | yes | Two to three sentences of support | 115–177 chars (median 145) |
| `kind` | yes | `welcome` (Citizen Guides message) or `quote` (testimonial in someone's own words) | — |
| `icon` | yes, unless artwork | One of: star, flag, lightbulb, hands | — |
| `image` | optional | Full-bleed artwork, replaces the illustration + glow entirely | see below |
| `link` | optional | One "learn more" link under the body | label + URL |
| `id` | yes | Stable slug, also the analytics label | kebab-case |

**Icons:** the four Welcome.US illustrations are inlined in
[app/components/InterstitialGlyphs.tsx](../app/components/InterstitialGlyphs.tsx), transcribed
path-for-path from the source files in `/public/interstitial-icons`. A fifth icon means adding a
value to `InterstitialIcon` and a component there — the type makes an unhandled one a build error,
so a message can never reference art that doesn't exist.

**Artwork specs (the optional per-message `image`):** 16:7 aspect ratio, rendered against a dark
background, raster format (PNG or WebP) placed in `/public`. Plain SVG files won't work through
`next/image` without a Next.js config change — that is why the icons above are inlined instead.
Every image needs alt text. This is optional per message; messages without it get their icon on the
glow, so a partial delivery does not block launch.

**Editorial constraints worth stating up front:**

- Every factual claim needs a source, cited in the copy sheet even though it won't appear on
  screen. The live set makes one: "two-thirds of people born in the U.S. can't" pass the test
  (`no-expert-needed`). It is the highest-risk line in the feature — applicants may act on it, and
  it is currently uncited.
- Anything that changes with administration or policy — pass rates, test format, the size of the
  question bank — should get a review date, since this content will sit in production unattended.
- Reading level: the audience is largely studying in a second language. The copy sheet should note
  a target (the live set sits around grade 8–9).
- The set is read in sequence, ~5 per sitting. Varying rhythm across the set matters more than any
  single message landing perfectly. Worth watching at Stage 5: four of the twelve open with the
  eyebrow "Citizen Guides", so a shuffle can deal two or three of them back to back.

**On `id`:** keep the id when you reword lightly, so analytics stays continuous. Change it when a
rewrite is substantive enough that you'd want a clean before/after in the data.

---

## Known gaps to resolve in Stage 4

Both were written as Stage 4 items and neither was handled, so they carry forward. Stage 5 never
ran, which means gap 1 cost nothing this time — but it will cost the next revision, and gap 2 is
now a live question rather than a review question.

**1. The `/preview` gallery doesn't work on deployed URLs.** There's an internal page at
`/preview` that renders every screen state — including a cycler through all 12 interstitials —
without playing the quiz. It's the natural review tool for Stage 5. But it returns nothing when
`NODE_ENV === "production"` ([app/preview/page.tsx:44](../app/preview/page.tsx#L44)), and Vercel
Preview deployments build as production. So today it only works on a developer's localhost.

Without a fix, Stage 5 reviewers have to play the quiz repeatedly to see all 12 messages — the
cadence is randomized, so it takes three or four playthroughs, and it's easy to miss one entirely.
Options, cheapest first:

- Gate `/preview` on an env var set for Preview but not Production — reviewers get a real,
  shareable URL. Recommended.
- Gate on a query-string token.
- Leave it, and have Engineering screenshot all 12 into a contact sheet each round. Works, but the
  screenshots go stale and reviewers can't check interaction or mobile wrapping.

**2. Artwork is delivered, but as four icons rather than twelve pieces.** Design supplied four
illustrations — hands, flag, star, lightbulb — and the copy sheet assigns one to each message, so
several messages share art (hands 5, flag 4, star 2, lightbulb 1). That is a legitimate launch
state and it is what shipped. At ~5 messages per sitting, a player has a real chance of seeing the
same illustration twice — most likely the hands, which carries five of the twelve. Worth deciding
whether that reads as a consistent visual system or as a repeat; if it's a repeat, the fix is more
icons or per-message `image` artwork, not a code change.

---

## How this gets measured after Stage 8

The screens are already instrumented, so the post-launch question "did this help or did it just
add friction?" is answerable without further work
([lib/analytics.ts:36-50](../lib/analytics.ts#L36-L50)):

- `interstitial_view` — `message_id`, `kind`, `question_number`
- `interstitial_skip` — the same, plus `seconds_visible`

`seconds_visible` per `message_id` is effectively dwell time on each piece of copy: the messages
people actually read versus the ones they skip past. Compare quiz completion rate before and after
launch to confirm the breaks aren't costing finishers.

**The clean break is 2026-08-12.** Every `message_id` changed at that deploy, so the old ids
(`belonging`, `say-it-out-loud`, …) stop appearing and the new ones start — which makes the
before/after split unambiguous, but also means there is no per-message continuity across it. `kind`
values changed too (`tip` → `quote`), so any saved GA4 segment filtering on `tip` now matches
nothing.

Two things are still undecided: how long to wait before reading the data, and who reads it. Stage 2
was where that was supposed to be settled and it wasn't — so this is the stage most likely to
quietly never happen. Someone should put a date on it.

---

## Change log

| Date | Stage | Note |
| --- | --- | --- |
| | 1 | Flow proposed and built with placeholder content |
| 2026-08-11 | 3–4 | Real copy sheet (8 Citizen Guides messages + 4 quotes) and four icons received and built into `develop` (`858c9a4`). `kind` changed from `welcome`/`tip` to `welcome`/`quote`; unused `book` and `map` icons dropped. Two body strings reconstructed from clipped cells. |
| 2026-08-12 | 5–7 | Skipped. No review round, no written signoff, no brand/legal pass. |
| 2026-08-12 | 8 | PR #24 merged to `master` (`437c582`) — content live in production. Smoke test not yet recorded; see [Open items](#open-items). |
