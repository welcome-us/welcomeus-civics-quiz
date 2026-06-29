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
| `quiz_start` | Start modal confirmed | `lead_capture` (bool) |
| `question_answered` | Each graded answer | `question_number` (1–20), `result` (`correct`/`incorrect`), `correct_count` |
| `quiz_complete` | Quiz reaches pass/fail | `result` (`passed`/`failed`), `score`, `questions_answered` |
| `quiz_give_up` | "Give Up" clicked mid-quiz | `question_number`, `correct_count` |
| `lead_form_view` | Success/give-up modal shown | `variant` (`pass`/`giveup`) |
| `generate_lead` | Lead submitted successfully | `variant`, `marketing_consent` (bool), `has_zip` (bool) |
| `lead_submit_error` | Lead submission failed server-side | `variant` |
| `grade_error` | Answer grading threw (server unreachable) | `question_number` |

`generate_lead` is a GA4 *recommended* event name and is the primary conversion.

## Funnels

- **Engagement:** `quiz_start` → `question_answered` (by `question_number`) → `quiz_complete`
- **Conversion:** `lead_form_view` → `generate_lead`, split by `variant` (pass vs giveup)

The two route variants (`/exam` vs `/civics`) are distinguishable in GA4 via the
built-in `page_path` dimension; `/exam` also carries `lead_capture: true` on
`quiz_start`.

## One-time GTM setup (container GTM-K3TTLZS)

For each event above, forward the dataLayer push to GA4:

1. **Variables → New → Data Layer Variable** for each param you want to send
   (e.g. `question_number`, `result`, `score`, `variant`, `marketing_consent`,
   `has_zip`, `correct_count`, `questions_answered`, `lead_capture`).
2. **Triggers → New → Custom Event.** Use event name `quiz_start`, etc., or a
   single trigger with **Event name (regex matches)**:
   `^(quiz_start|question_answered|quiz_complete|quiz_give_up|lead_form_view|generate_lead|lead_submit_error|grade_error)$`
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
   `result`, `question_number`, `variant`, `marketing_consent`, `has_zip`,
   `lead_capture`. (Event params are not queryable in standard reports until
   registered; GA4 caps event-scoped dimensions at 50.)
2. **Admin → Key events → mark `generate_lead`** as a key event (conversion).
   Optionally also `quiz_complete`.

## Adding or changing an event

Update the `QuizEvents` map in [`lib/analytics.ts`](../lib/analytics.ts) (the
typed source of truth), fire it from the relevant call site, then mirror the
change in the table above and add any new param as a Data Layer Variable +
GA4 custom dimension.
