# Daily Feedback Survey — Design Spec

- **Date:** 2026-05-21
- **Branch:** `feat/daily-feedback-survey`
- **Status:** Approved — ready for implementation planning

---

## 1. Summary

The Surveys page (`/dashboard/surveys`) shows a "Daily Feedback Survey" card whose
"Start Survey" button currently does nothing — it is a plain `<Button>` with no
handler. This feature makes it real.

The survey is a **Narrative Framing Check**: each day the user is shown 3 recent
real Georgian news headlines drawn from the existing `PropagandaArticle` table and
asked which propaganda framing each headline pushes. Their answers are stored as
human-labeled data and compared against the model's own classification
(`PropagandaArticle.dominantFraming`). Completing the survey awards **+15 ETC**,
once per day. A dedicated history page shows a calendar of completed days and the
answers given on each.

## 2. Motivation

- The "Start Survey" button is dead — a visible broken affordance.
- The survey card's stated purpose is "help train our models." The Narrative
  Framing Check delivers on this literally: it produces a human-labeled dataset
  that can be compared to the automated classifier.
- It reuses assets the project already has: the `PropagandaArticle` table (seeded
  with up to 5000 headlines, each already carrying a `dominantFraming`) and the
  4 framing categories used throughout the media-intelligence pipeline.

## 3. Goals

- Wire "Start Survey" to a working daily survey flow.
- Collect human framing labels for real headlines, once per user per day.
- Show the user, immediately after submitting, how their picks compared to the model.
- Provide a dedicated history page with a calendar of completed days and per-day answers.
- Award +15 ETC per completed survey.

## 4. Non-Goals (out of scope for v1)

- Cross-user analytics / aggregate human-vs-machine agreement dashboards.
- Streak counters, badges, leaderboards.
- Encrypting survey responses (see §5 rationale).
- Editing or deleting a submitted day's answers.
- A shared "same headlines for everyone today" set (each user gets a random set).

## 5. Data Model

New Prisma model in `prisma/schema.prisma`:

```prisma
model DailyFeedback {
  id          String   @id @default(uuid())
  userId      String
  surveyDate  DateTime          // UTC midnight of the day — matches DailyPulse.date convention
  responses   Json              // [{ articleId, headline, sourcePublisher, userFraming, modelFraming }]
  matchCount  Int               // 0–3: how many picks matched the model
  earnedCoins Int      @default(15)
  completedAt DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId, surveyDate])
  @@index([userId])
}
```

Add the reverse relation to `User`: `dailyFeedback DailyFeedback[]`.

**Decisions:**
- `surveyDate` is UTC midnight, consistent with how `DailyPulse.date` and the
  seed script bucket dates (`toISOString().split('T')[0]`).
- `@@unique([userId, surveyDate])` enforces once-per-day at the database level.
- `responses` is **not encrypted**. Unlike Big Five personality scores, these are
  opinions about *public* news headlines — low sensitivity — and the calendar
  needs to read them back directly. Framings are stored as stable canonical keys
  (see §6), not the raw Georgian DB strings, and the headline text is denormalized
  into `responses` so history survives even if an article row changes.

Schema is applied with `npx prisma db push` (project convention for dev; see SETUP.md).

## 6. Framing Categories

The 4 propaganda framings, mapped from the Georgian strings stored in
`PropagandaArticle.dominantFraming` to stable canonical keys used in code and storage:

| Canonical key  | DB string (Georgian)      | Meaning (rough)            |
|----------------|---------------------------|----------------------------|
| `institutional`| `როგორ გვზღუდავენ`        | "how they restrict us"     |
| `psychological`| `როგორ გვთრგუნავენ`       | "how they suppress us"     |
| `societal`     | `როგორ გვყოფენ`           | "how they divide us"       |
| `geopolitical` | `გავლენები და ეკლესია`    | "influences and the church"|

Articles whose `dominantFraming` is `სხვა / ნეიტრალური` (other/neutral) or null are
**excluded** from survey selection — the user only ever sees headlines with one of
the 4 real framings, so `modelFraming` is always one of the 4.

## 7. Survey Flow — route `/dashboard/surveys/daily`

1. The Surveys-page "Start Survey" button becomes a link to `/dashboard/surveys/daily`.
2. The route's server component:
   - Resolves the current user (existing `getSupabaseUser()` pattern).
   - If a `DailyFeedback` row exists for the user + today → render the **result screen**.
   - Else pick **3 random** `PropagandaArticle` rows with a real framing and pass
     them to the client stepper component.
   - If fewer than 3 framed articles exist in the DB → render a graceful
     "no headlines available, check back later" state (no crash).
3. Client stepper component (mirrors the structure of `big-five.tsx`):
   - Shows headline *n* of 3 with progress indicator.
   - 4 framing choice-cards, each with a short helper description.
   - Back / Next navigation; the final step submits.
4. On submit → **result screen**: per headline "You said X / Model said Y", an
   overall match count `X/3`, "+15 ETC earned", and a link to the history page.
5. The 3 headlines re-roll if the page is refreshed before submitting (accepted
   for v1). Once the survey is completed for the day it is locked.

## 8. Server Actions — new file `src/app/actions/dailyFeedback.ts`

All actions resolve the user via the existing `getSupabaseUser()` pattern from
`assessments.ts`.

- `getDailySurveyHeadlines()` — returns 3 random `PropagandaArticle` rows whose
  `dominantFraming` is one of the 4 real framings. Uses a raw SQL
  `ORDER BY random() LIMIT 3` filtered on those 4 values.
- `getTodaysFeedback()` — returns the user's `DailyFeedback` row for today, or `null`.
- `getMonthFeedback(year, month)` — returns the user's completed `DailyFeedback`
  rows within that month, for the calendar.
- `submitDailyFeedback(picks)` — `picks` is `[{ articleId, userFraming }]`:
  1. Zod-validate the payload (3 entries; `userFraming` ∈ the 4 keys; valid article IDs).
  2. Rate-limit (`submitDailyFeedback:${userId}`, reusing `lib/rateLimit.ts`).
  3. Re-check no `DailyFeedback` exists for user + today.
  4. **Re-read each article's real `dominantFraming` from the DB server-side** —
     never trust a client-supplied model classification.
  5. Compute `matchCount`.
  6. `$transaction`: create the `DailyFeedback` row + increment `User.coins` by 15.
  7. Write an audit log: `writeAuditLog(userId, 'WRITE', 'DailyFeedback', id, {...})`.
  8. `revalidatePath` for `/dashboard`, `/dashboard/surveys`, `/dashboard/surveys/history`.
  9. Catch the unique-constraint violation as a "already completed today" error.

## 9. History Page — route `/dashboard/surveys/history`

- Month calendar grid. Days with a completed `DailyFeedback` are highlighted;
  today is marked.
- Clicking a completed day opens an inline detail panel below the calendar: the
  3 headlines for that day, the user's framing pick, the model's framing, and the
  match count.
- Previous / next month navigation.
- A simple "N surveys completed" total.
- Linked from the Surveys page and from the post-submit result screen.

## 10. Internationalization

- New dictionary keys (ka / en / de) in `src/lib/i18n/dictionaries.ts` for: survey
  intro, the 4 framing labels + descriptions, stepper/button strings, result-screen
  strings, and history/calendar strings.
- New components follow the existing `useLanguage()` / `getDictionary()` pattern
  used by `big-five.tsx`.
- The Surveys-page card text touched while wiring the button is moved to i18n keys
  for consistency; unrelated card text is left as-is.

## 11. Edge Cases

| Case | Behavior |
|---|---|
| Fewer than 3 framed articles in DB | Graceful "no headlines available" screen; no crash. |
| Already completed today | Survey route shows the result screen, not the form. |
| Double / concurrent submit | `@@unique([userId, surveyDate])` + pre-check; unique violation caught and surfaced as "already completed today". |
| Unauthenticated user | Existing `proxy.ts` middleware redirects `/dashboard/*` to `/login`. |
| Client sends a tampered `modelFraming` | Ignored — server re-reads `dominantFraming` from the DB. |

## 12. Testing

Playwright E2E tests (`tests/`), per the `CLAUDE.md` Definition of Done, using
`data-testid` selectors and the existing `auth.setup.ts` authenticated state:

- Complete a daily survey end-to-end → result screen shows you-vs-model + match count.
- The completed day appears highlighted on the history calendar; its detail panel
  shows the recorded answers.
- Attempting the survey again the same day shows the result screen, not the form.
- Graceful state when no framed headlines are available.

## 13. Files Touched (estimate)

**New:**
- `src/app/dashboard/surveys/daily/page.tsx`
- `src/app/dashboard/surveys/history/page.tsx`
- `src/app/actions/dailyFeedback.ts`
- Client components for the survey stepper, result screen, and calendar
  (under `src/components/features/surveys/`).
- `tests/daily-feedback.spec.ts`

**Modified:**
- `prisma/schema.prisma` — new `DailyFeedback` model + `User` relation.
- `src/app/dashboard/surveys/page.tsx` — wire "Start Survey" to the new route.
- `src/lib/i18n/dictionaries.ts` — new keys.
- `src/lib/validation.ts` — Zod schema for `submitDailyFeedback`.
