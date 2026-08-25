# Analytics — GA4 events via GTM

The quiz emits custom events through Google Tag Manager (container `GTM-K3TTLZS`),
which forwards them to GA4. Events are defined and typed in
[`lib/analytics.ts`](../lib/analytics.ts) and fired from
[`app/components/QuizApp.tsx`](../app/components/QuizApp.tsx) via `track(event, params)`.

`track()` calls `sendGTMEvent()` from `@next/third-parties/google`, which pushes
`{ event, ...params }` onto `window.dataLayer`. When `NEXT_PUBLIC_GTM_ID` is unset
(local/dev), the push is a no-op.

## Events

| Event | Fires when | Params |
| --- | --- | --- |
| `quiz_start` | Start modal confirmed | `quiz_variant` (`exam`/`civics`/`trivia`), `lead_capture` (bool) |
| `question_answered` | Each graded answer | `question_number` (1–20, or 1–5 on `/trivia`), `result` (`correct`/`incorrect`), `correct_count` |
| `quiz_complete` | Quiz reaches pass/fail | `quiz_variant`, `result` (`passed`/`failed`), `score`, `questions_answered` |
| `quiz_give_up` | "Give Up" clicked mid-quiz | `question_number`, `correct_count` |
| `interstitial_view` | A between-questions message is shown | `message_id`, `kind` (`welcome`/`quote`), `question_number` (the one after the break) |
| `interstitial_skip` | User leaves the break to resume | `message_id`, `kind`, `question_number`, `seconds_visible` |
| `lead_form_view` | Success/give-up modal shown | `quiz_variant`, `variant` (`pass`/`fail`/`giveup`) |
| `generate_lead` | Lead submitted successfully | `quiz_variant`, `variant`, `marketing_consent` (bool), `has_zip` (bool) |
| `lead_submit_error` | Lead submission failed server-side | `quiz_variant`, `variant` |
| `grade_error` | Answer grading threw (server unreachable) | `question_number` |

`generate_lead` is a GA4 *recommended* event name and is the primary conversion.

## Funnels

- **Engagement:** `quiz_start` → `question_answered` (by `question_number`) → `quiz_complete`
- **Conversion:** `lead_form_view` → `generate_lead`, split by `variant` (pass vs fail vs giveup)

Two different "variant" params travel together — keep them straight:

- **`quiz_variant`** — which route the session ran on (`exam` / `civics` / `trivia`).
  Carried on `quiz_start`, `quiz_complete`, `lead_form_view`, `generate_lead`,
  `lead_submit_error`. Use it to compare conversion across routes without leaning
  on `page_path` (which is also available, but breaks if a path is ever renamed).
- **`variant`** — which message the lead form carried (`pass` / `fail` / `giveup`).

`variant: "fail"` only appears on variants that capture leads from everyone who
finishes (`/trivia`); on `/exam` a losing score never opens the form, so its
conversion denominator is passes plus give-ups only.

## One-time GTM setup (container GTM-K3TTLZS)

For each event above, forward the dataLayer push to GA4:

1. **Variables → New → Data Layer Variable** for each param you want to send
   (e.g. `question_number`, `result`, `score`, `quiz_variant`, `variant`, `marketing_consent`,
   `has_zip`, `correct_count`, `questions_answered`, `lead_capture`,
   `message_id`, `kind`, `seconds_visible`).
2. **Triggers → New → Custom Event.** Use event name `quiz_start`, etc., or a
   single trigger with **Event name (regex matches)**:
   `^(quiz_start|question_answered|quiz_complete|quiz_give_up|interstitial_view|interstitial_skip|lead_form_view|generate_lead|lead_submit_error|grade_error)$`
3. **Tags → New → Google Analytics: GA4 Event.**
   - Configuration tag: the existing GA4 Google Tag.
   - Event Name: `{{Event}}` (the built-in GTM variable — passes the dataLayer
     event name straight through).
   - Event Parameters: map each param name to its Data Layer Variable.
   - Trigger: the Custom Event trigger from step 2.
4. **Submit / Publish** the container.

> Verify in **GTM Preview** + **GA4 → DebugView**: play through a quiz and confirm
> each event arrives with its params.

## One-time GA4 setup

1. **Admin → Custom definitions → Create custom dimension** (event-scoped) for the
   params you want to report on:
   `result`, `question_number`, `quiz_variant`, `variant`, `marketing_consent`, `has_zip`,
   `lead_capture`. (Event params are not queryable in standard reports until
   registered; GA4 caps event-scoped dimensions at 50.)
2. **Admin → Key events → mark `generate_lead`** as a key event (conversion).
   Optionally also `quiz_complete`.

## Adding or changing an event

Update the `QuizEvents` map in [`lib/analytics.ts`](../lib/analytics.ts) (the
typed source of truth), fire it from the relevant call site, then mirror the
change in the table above and add any new param as a Data Layer Variable +
GA4 custom dimension.
