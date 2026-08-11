# Between-Question Screens — Process & Signoff Plan

**Scope:** the interstitial ("Tip / Message") screens that appear between questions in the
Welcome.US civics quiz. Nothing else in the quiz is in scope for this workflow.

**Status:** Stage 4 complete — the real copy set (8 Citizen Guides messages + 4 testimonial quotes)
and the delivered icon artwork are in the build, replacing the placeholders. Ready for Stage 5
review. Note that Stages 2 and 3 were run informally: the copy sheet arrived without a recorded
flow signoff, so if the decision table below still needs approving, it is being approved against a
build that already carries the real content.

| | |
| --- | --- |
| Owner (process) | |
| Content lead | |
| Design lead | |
| Engineering | |
| Approver (final signoff) | |
| Target prod date | |

---

## Why this document exists for something already live

The quiz is in production. The interstitial flow was already built, deployed, and instrumented —
but with **deliberately placeholder copy and placeholder artwork**. So this is not a plan to build
a new product; it is a change-management plan for replacing that placeholder content in a live
product with the team's real content. (That swap has now happened in `develop` — see Status above —
so the stages below are the path from here to prod, not from zero.)

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

Behavior the team is being asked to sign off on:

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

## Stages

Each stage has an owner, a concrete artifact, and an exit criterion. A stage is not "done" because
time passed — it is done when the exit criterion is met.

### 1. Review of proposed user flow — ✅ complete

- **Owner:** Engineering / Design
- **Artifact:** working build + the decision table above
- **Exit:** flow shared with the team — done

### 2. Signoff of user flow

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
- **Delivered:** a 12-row copy sheet (8 core + 4 quotes) and four illustrations. Two items still
  open against the exit criterion — see the note under Stage 4.

The engineering side of this stage is zero-cost by design: the message bucket is a typed list, and
the scheduling logic reads it generically. Swapping copy means editing three strings per entry;
adding or cutting messages needs no code change at all.

### 4. Build — ✅ complete

- **Owner:** Engineering
- **Input:** approved copy sheet + artwork
- **Artifact:** a PR into `develop`
- **Exit:** copy in place, artwork wired, `npm run build` and `npm run lint` clean, reviewable on a
  Vercel Preview URL

Carried into Stage 5 rather than blocking the build:

- **Two body strings were reconstructed.** The copy sheet arrived with two cells clipped at the
  column edge. `no-expert-needed` ends "…What matters isn't the answers; it's showing up." and
  `one-hour-a-week` ends "…mean everything to someone earning citizenship." Both endings are
  inferred, not supplied — confirm against the source sheet.
- **No claim sources were supplied.** One factual claim survives into the live set: "two-thirds of
  people born in the U.S. can't" pass the test (`no-expert-needed`). It needs a citation and a
  review date before Stage 7.

Plus two standing items (see [Known gaps](#known-gaps-to-resolve-in-stage-4)).

### 5. Review / feedback

- **Owner:** Content + Design + Approver
- **Input:** Vercel Preview URL
- **Artifact:** consolidated feedback, one list, one round
- **Exit:** feedback delivered and triaged into "changing" / "not changing, because…"
- **Check specifically:** copy at mobile width (headlines wrap differently), artwork against the
  dark palette, tone reading in sequence rather than one at a time

### 6. Updates

- **Owner:** Engineering (copy), Content/Design (rewrites)
- **Exit:** every Stage 5 item closed. If a rewrite is substantive, it loops back through 5 — but
  cap it at **two rounds**; a third round means the Stage 2 signoff didn't hold, and that is the
  thing to fix, not the copy.

### 7. Signoff

- **Owner:** Approver
- **Artifact:** written approval on the final Preview URL
- **Exit:** explicit go/no-go recorded, referencing the specific Preview deployment
- **Include here:** brand/legal review of factual claims, if that's a separate desk

### 8. Push to prod

- **Owner:** Engineering
- **Mechanics:** merge `develop` → `master`; Vercel deploys `master` to the live subdomain
- **Exit:** post-deploy smoke test passes:
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

Two things will bite during Stage 5 review if they aren't handled first.

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
several messages share art (hands 5, flag 4, star 2, lightbulb 1). That is a legitimate launch state and it is
what is in the build. What it means for review: at ~5 messages per sitting, a player has a real
chance of seeing the same illustration twice. Decide at Stage 5 whether that reads as a consistent
visual system or as a repeat — and if it's a repeat, the fix is more icons or per-message `image`
artwork, not a code change.

---

## How this gets measured after Stage 8

The screens are already instrumented, so the post-launch question "did this help or did it just
add friction?" is answerable without further work
([lib/analytics.ts:36-50](../lib/analytics.ts#L36-L50)):

- `interstitial_view` — `message_id`, `kind`, `question_number`
- `interstitial_skip` — the same, plus `seconds_visible`

`seconds_visible` per `message_id` is effectively dwell time on each piece of copy: the messages
people actually read versus the ones they skip past. Compare quiz completion rate before and after
launch to confirm the breaks aren't costing finishers. Worth agreeing at Stage 2 on how long to
wait before reading the data, and who reviews it — otherwise this stage quietly never happens.

---

## Change log

| Date | Stage | Note |
| --- | --- | --- |
| | 1 | Flow proposed and built with placeholder content |
| 2026-08-11 | 3–4 | Real copy sheet (8 Citizen Guides messages + 4 quotes) and four icons received and built into `develop`. `kind` changed from `welcome`/`tip` to `welcome`/`quote`; unused `book` and `map` icons dropped. Two body strings reconstructed from clipped cells — see Stage 4. |
