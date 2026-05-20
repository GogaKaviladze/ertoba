# Daily Feedback Survey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dead "Start Survey" button on `/dashboard/surveys` open a working daily "Narrative Framing Check" survey, with a calendar history page of past answers.

**Architecture:** A new `DailyFeedback` Prisma model stores one row per user per UTC day (`@@unique([userId, surveyDate])`). The survey route picks 3 random real headlines from the existing `PropagandaArticle` table, the user classifies each into one of 4 propaganda framings, and a server action compares the picks against each article's stored `dominantFraming`. A dedicated history page renders a month calendar of completed days with per-day answer detail.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, TypeScript 5, Prisma 7, Tailwind 4, Playwright. Spec: `docs/superpowers/specs/2026-05-21-daily-feedback-survey-design.md`.

---

## Notes for the implementer

- **Branch:** work happens on `feat/daily-feedback-survey` (already checked out).
- **Prerequisites:** a working `.env.local` with `DATABASE_URL` + `DIRECT_URL` (Prisma `db push` needs DB connectivity). See `SETUP.md`.
- **i18n constraint:** `getDictionary` in `src/lib/i18n/dictionaries.ts` types the `en` and `de` objects as `typeof ka`. Every new key MUST be added to all three objects (`ka`, `en`, `de`) or `npm run build` fails. The Georgian/German strings below are best-effort — a native speaker should verify them later, but they are structurally valid.
- **Page headings stay hardcoded English** — this matches the existing convention (`assessments/page.tsx`, the current `surveys/page.tsx`). Only interactive component content is internationalized.
- **RLS for `DailyFeedback` is out of scope** (the spec does not call for it). Access isolation is enforced in the server actions via explicit `userId` filters, consistent with `src/app/actions/assessments.ts`.
- **E2E testing limitation:** completing the survey is once-per-day per user (`@@unique`), so an automated test cannot repeatedly complete it. Playwright tests cover rendering, navigation, and stepping through the form. The full submit → reward → calendar flow is verified manually in Task 13.
- **Type-checking:** verification steps use `npx tsc --noEmit`. If it reports errors in files *outside* this plan's scope, those are pre-existing — switch to `npm run build` to verify, and only fix errors in files you created or modified.

## File Structure

**New files:**
- `src/lib/framing.ts` — framing constants, Georgian↔key mapping, UTC-date helper.
- `src/app/actions/dailyFeedback.ts` — server actions (fetch headlines, fetch status/history, submit).
- `src/components/features/surveys/response-comparison.tsx` — presentational "you said / model said" rows.
- `src/components/features/surveys/daily-result.tsx` — post-submit / already-done result screen.
- `src/components/features/surveys/daily-survey.tsx` — the 3-step survey stepper.
- `src/components/features/surveys/feedback-calendar.tsx` — month calendar + selected-day detail.
- `src/app/dashboard/surveys/daily/page.tsx` — survey route.
- `src/app/dashboard/surveys/history/page.tsx` — history route.
- `tests/daily-feedback.spec.ts` — Playwright E2E.

**Modified files:**
- `prisma/schema.prisma` — add `DailyFeedback` model + `User` relation.
- `src/lib/validation.ts` — add `submitDailyFeedbackSchema`.
- `src/lib/i18n/dictionaries.ts` — add 18 keys to `ka`, `en`, `de`.
- `src/app/dashboard/surveys/page.tsx` — wire the button, i18n the daily card, add history link.

---

## Task 1: Prisma `DailyFeedback` model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the `dailyFeedback` relation to the `User` model**

In `prisma/schema.prisma`, change the `User` model's relation block:

```prisma
  completions    SurveyCompletion[]
  transactions   Transaction[]
  dailyFeedback  DailyFeedback[]
}
```

- [ ] **Step 2: Append the `DailyFeedback` model**

Add at the end of `prisma/schema.prisma`:

```prisma
model DailyFeedback {
  id          String   @id @default(uuid())
  userId      String
  surveyDate  DateTime          // UTC midnight of the survey day
  responses   Json              // FeedbackResponseItem[] — see src/app/actions/dailyFeedback.ts
  matchCount  Int               // 0–3: picks that matched the model's dominantFraming
  earnedCoins Int      @default(15)
  completedAt DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId, surveyDate])
  @@index([userId])
}
```

- [ ] **Step 3: Validate the schema**

Run: `npx prisma validate`
Expected: `The schema at prisma\schema.prisma is valid 🚀`

- [ ] **Step 4: Push the schema to the database**

Run: `npx prisma db push`
Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 5: Regenerate the Prisma client**

Run: `npx prisma generate`
Expected: `Generated Prisma Client` — `prisma.dailyFeedback` is now typed.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add DailyFeedback model for daily survey"
```

---

## Task 2: i18n keys

**Files:**
- Modify: `src/lib/i18n/dictionaries.ts`

- [ ] **Step 1: Add the Georgian (`ka`) keys**

In `src/lib/i18n/dictionaries.ts`, inside the `ka` object, add this block immediately after the `privacySection8Body:` line (the last key of the object):

```ts
  // --- DAILY FEEDBACK SURVEY ---
  surveyDailyTitle: 'ყოველდღიური გამოკითხვა',
  surveyDailyDesc: 'დააკლასიფიცირე, როგორ არის ჩარჩოში მოქცეული ბოლოდროინდელი სათაურები — შენი პასუხები გვეხმარება მოდელების გაწვრთნაში.',
  surveyDailyDuration: 'დაახ. 2 წუთი',
  surveyStartButton: 'გამოკითხვის დაწყება',
  surveyViewHistory: 'ისტორიის ნახვა',
  surveyQuestionPrompt: 'რომელ ნარატივს ავრცელებს ეს სათაური?',
  surveySubmit: 'შედეგების ნახვა',
  surveySubmitting: 'ინახება...',
  surveyResultTitle: 'შენი შედეგები',
  surveyResultMatchLabel: 'დამთხვევა ჩვენს მოდელთან:',
  surveyYouSaid: 'შენ თქვი',
  surveyModelSaid: 'ჩვენი მოდელი',
  surveyRewardEarned: 'მიღებულია +15 ETC',
  surveyAlreadyDone: 'დღევანდელი გამოკითხვა უკვე დაასრულე. დაბრუნდი ხვალ!',
  surveyBackToSurveys: 'გამოკითხვებში დაბრუნება',
  surveyCalendarCompletedLabel: 'დასრულებული გამოკითხვები:',
  surveyCalendarSelectDay: 'აირჩიე დასრულებული დღე პასუხების სანახავად.',
  surveyCalendarNoData: 'ამ თვეში გამოკითხვა არ დაგისრულებია.',
```

- [ ] **Step 2: Add the English (`en`) keys**

Inside the `en` object, after its `privacySection8Body:` line, add:

```ts
  // --- DAILY FEEDBACK SURVEY ---
  surveyDailyTitle: 'Daily Feedback Survey',
  surveyDailyDesc: 'Classify how recent Georgian headlines are framed — your answers help train our models.',
  surveyDailyDuration: 'Est. 2 mins',
  surveyStartButton: 'Start Survey',
  surveyViewHistory: 'View history',
  surveyQuestionPrompt: 'Which narrative does this headline push?',
  surveySubmit: 'See Results',
  surveySubmitting: 'Saving...',
  surveyResultTitle: 'Your Results',
  surveyResultMatchLabel: 'Matches with our model:',
  surveyYouSaid: 'You said',
  surveyModelSaid: 'Our model said',
  surveyRewardEarned: '+15 ETC earned',
  surveyAlreadyDone: 'You have already completed today’s survey. Come back tomorrow!',
  surveyBackToSurveys: 'Back to Surveys',
  surveyCalendarCompletedLabel: 'Surveys completed:',
  surveyCalendarSelectDay: 'Select a completed day to see your answers.',
  surveyCalendarNoData: 'No surveys completed this month.',
```

- [ ] **Step 3: Add the German (`de`) keys**

Inside the `de` object, after its `privacySection8Body:` line, add:

```ts
  // --- DAILY FEEDBACK SURVEY ---
  surveyDailyTitle: 'Tägliche Feedback-Umfrage',
  surveyDailyDesc: 'Klassifiziere, wie aktuelle georgische Schlagzeilen gerahmt werden — deine Antworten helfen, unsere Modelle zu trainieren.',
  surveyDailyDuration: 'ca. 2 Min.',
  surveyStartButton: 'Umfrage starten',
  surveyViewHistory: 'Verlauf ansehen',
  surveyQuestionPrompt: 'Welches Narrativ verbreitet diese Schlagzeile?',
  surveySubmit: 'Ergebnisse ansehen',
  surveySubmitting: 'Wird gespeichert...',
  surveyResultTitle: 'Deine Ergebnisse',
  surveyResultMatchLabel: 'Übereinstimmungen mit unserem Modell:',
  surveyYouSaid: 'Du sagtest',
  surveyModelSaid: 'Unser Modell sagte',
  surveyRewardEarned: '+15 ETC erhalten',
  surveyAlreadyDone: 'Du hast die heutige Umfrage bereits abgeschlossen. Komm morgen wieder!',
  surveyBackToSurveys: 'Zurück zu den Umfragen',
  surveyCalendarCompletedLabel: 'Abgeschlossene Umfragen:',
  surveyCalendarSelectDay: 'Wähle einen abgeschlossenen Tag, um deine Antworten zu sehen.',
  surveyCalendarNoData: 'In diesem Monat keine Umfragen abgeschlossen.',
```

- [ ] **Step 4: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors. (If `en`/`de` are missing a key, `tsc` reports exactly which one — add it.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n/dictionaries.ts
git commit -m "feat: add i18n keys for daily feedback survey"
```

---

## Task 3: Framing helper module

**Files:**
- Create: `src/lib/framing.ts`

- [ ] **Step 1: Create `src/lib/framing.ts`**

```ts
/**
 * Propaganda framing categories shared by the Daily Feedback Survey.
 *
 * The PropagandaArticle table stores `dominantFraming` as Georgian strings;
 * the survey works with stable canonical keys.
 */

export const FRAMINGS = ['institutional', 'psychological', 'societal', 'geopolitical'] as const

export type Framing = (typeof FRAMINGS)[number]

/** Georgian DB value -> canonical key */
const GEORGIAN_TO_KEY: Record<string, Framing> = {
  'როგორ გვზღუდავენ': 'institutional',
  'როგორ გვთრგუნავენ': 'psychological',
  'როგორ გვყოფენ': 'societal',
  'გავლენები და ეკლესია': 'geopolitical',
}

/** The four Georgian values that map to a real framing (excludes "სხვა / ნეიტრალური"). */
export const FRAMING_DB_VALUES: string[] = Object.keys(GEORGIAN_TO_KEY)

/** i18n dictionary keys for each framing's label + description (reuses existing dashboard keys). */
export const FRAMING_LABEL_KEYS: Record<Framing, { label: string; desc: string }> = {
  institutional: { label: 'howTheyRestrictUs', desc: 'howTheyRestrictUsSub' },
  psychological: { label: 'howTheySuppressUs', desc: 'howTheySuppressUsSub' },
  societal: { label: 'howTheyDivideUs', desc: 'howTheyDivideUsSub' },
  geopolitical: { label: 'influencesAndChurch', desc: 'influencesAndChurchSub' },
}

export function framingFromGeorgian(value: string | null | undefined): Framing | null {
  if (!value) return null
  return GEORGIAN_TO_KEY[value] ?? null
}

export function isFraming(value: unknown): value is Framing {
  return typeof value === 'string' && (FRAMINGS as readonly string[]).includes(value)
}

/** UTC midnight of the given date — the canonical "survey day" value. */
export function utcMidnight(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/framing.ts
git commit -m "feat: add framing helper for daily survey"
```

---

## Task 4: Validation schema

**Files:**
- Modify: `src/lib/validation.ts`

- [ ] **Step 1: Add the submit schema**

Append to `src/lib/validation.ts` (after the `analytics.ts` section):

```ts
// ---------------------------------------------------------------------------
// dailyFeedback.ts
// ---------------------------------------------------------------------------

export const submitDailyFeedbackSchema = z.object({
  picks: z
    .array(
      z.object({
        articleId: z.string().uuid({ message: 'Invalid article ID.' }),
        userFraming: z.enum(['institutional', 'psychological', 'societal', 'geopolitical'], {
          error: 'Invalid framing choice.',
        }),
      })
    )
    .length(3, { message: 'Exactly 3 answers are required.' }),
})
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validation.ts
git commit -m "feat: add validation schema for daily feedback submission"
```

---

## Task 5: Server actions

**Files:**
- Create: `src/app/actions/dailyFeedback.ts`

- [ ] **Step 1: Create `src/app/actions/dailyFeedback.ts`**

```ts
'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { writeAuditLog } from '@/lib/audit'
import { submitDailyFeedbackSchema } from '@/lib/validation'
import { FRAMING_DB_VALUES, framingFromGeorgian, utcMidnight, type Framing } from '@/lib/framing'

const DAILY_REWARD = 15

export type SurveyHeadline = {
  articleId: string
  headline: string
  sourcePublisher: string | null
}

export type FeedbackResponseItem = {
  articleId: string
  headline: string
  sourcePublisher: string | null
  userFraming: Framing
  modelFraming: Framing
}

async function getUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

/** 3 random PropagandaArticle rows that carry one of the 4 real framings. */
export async function getDailySurveyHeadlines(): Promise<SurveyHeadline[]> {
  const rows = await prisma.$queryRaw<
    { id: string; headline: string | null; sourcePublisher: string | null }[]
  >`
    SELECT "id", "headline", "sourcePublisher"
    FROM "PropagandaArticle"
    WHERE "dominantFraming" IN (${Prisma.join(FRAMING_DB_VALUES)})
      AND "headline" IS NOT NULL
    ORDER BY random()
    LIMIT 3
  `
  return rows
    .filter((r): r is { id: string; headline: string; sourcePublisher: string | null } => Boolean(r.headline))
    .map((r) => ({ articleId: r.id, headline: r.headline, sourcePublisher: r.sourcePublisher }))
}

/** The current user's DailyFeedback row for today, or null. */
export async function getTodaysFeedback() {
  const userId = await getUserId()
  if (!userId) return null
  return prisma.dailyFeedback.findUnique({
    where: { userId_surveyDate: { userId, surveyDate: utcMidnight() } },
  })
}

/** The current user's completed DailyFeedback rows within the given month. */
export async function getMonthFeedback(year: number, month: number) {
  const userId = await getUserId()
  if (!userId) return []
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 1))
  return prisma.dailyFeedback.findMany({
    where: { userId, surveyDate: { gte: start, lt: end } },
    orderBy: { surveyDate: 'asc' },
  })
}

export async function submitDailyFeedback(picks: { articleId: string; userFraming: string }[]) {
  const parsed = submitDailyFeedbackSchema.safeParse({ picks })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input.')
  }

  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const limit = rateLimit(`submitDailyFeedback:${userId}`, 5)
  if (!limit.allowed) {
    throw new Error('Too many requests. Please try again later.')
  }

  const surveyDate = utcMidnight()

  const existing = await prisma.dailyFeedback.findUnique({
    where: { userId_surveyDate: { userId, surveyDate } },
  })
  if (existing) {
    throw new Error('You have already completed today’s survey.')
  }

  // Re-read each article's real classification server-side — never trust the client.
  const articles = await prisma.propagandaArticle.findMany({
    where: { id: { in: parsed.data.picks.map((p) => p.articleId) } },
    select: { id: true, headline: true, sourcePublisher: true, dominantFraming: true },
  })

  const responses: FeedbackResponseItem[] = []
  for (const pick of parsed.data.picks) {
    const article = articles.find((a) => a.id === pick.articleId)
    const modelFraming = framingFromGeorgian(article?.dominantFraming)
    if (!article || !modelFraming) {
      throw new Error('One of the survey headlines is no longer available.')
    }
    responses.push({
      articleId: article.id,
      headline: article.headline ?? '',
      sourcePublisher: article.sourcePublisher,
      userFraming: pick.userFraming as Framing,
      modelFraming,
    })
  }

  const matchCount = responses.filter((r) => r.userFraming === r.modelFraming).length

  const [created] = await prisma
    .$transaction([
      prisma.dailyFeedback.create({
        data: {
          userId,
          surveyDate,
          responses: responses as unknown as Prisma.InputJsonValue,
          matchCount,
          earnedCoins: DAILY_REWARD,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: DAILY_REWARD } },
      }),
    ])
    .catch((e) => {
      // Race: another request inserted today's row between the check above and now.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new Error('You have already completed today’s survey.')
      }
      throw e
    })

  await writeAuditLog(userId, 'WRITE', 'DailyFeedback', created.id, {
    matchCount,
    earnedCoins: DAILY_REWARD,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/surveys')
  revalidatePath('/dashboard/surveys/daily')
  revalidatePath('/dashboard/surveys/history')

  return { matchCount, responses }
}
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors. (`prisma.dailyFeedback` must be typed — if not, re-run `npx prisma generate`.)

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/dailyFeedback.ts
git commit -m "feat: add daily feedback server actions"
```

---

## Task 6: `ResponseComparison` component

**Files:**
- Create: `src/components/features/surveys/response-comparison.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { Check, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { FRAMING_LABEL_KEYS } from '@/lib/framing'
import type { FeedbackResponseItem } from '@/app/actions/dailyFeedback'

export function ResponseComparison({ responses }: { responses: FeedbackResponseItem[] }) {
  const { t } = useLanguage()

  return (
    <div className="space-y-3">
      {responses.map((r) => {
        const matched = r.userFraming === r.modelFraming
        return (
          <div
            key={r.articleId}
            data-testid="response-comparison-row"
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-medium text-white mb-3 leading-relaxed">{r.headline}</p>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-white/5 p-2.5">
                <span className="block text-slate-500 mb-0.5">{t('surveyYouSaid')}</span>
                <span className="text-slate-200 font-medium">{t(FRAMING_LABEL_KEYS[r.userFraming].label)}</span>
              </div>
              <div className="rounded-lg bg-white/5 p-2.5">
                <span className="block text-slate-500 mb-0.5">{t('surveyModelSaid')}</span>
                <span className="text-slate-200 font-medium">{t(FRAMING_LABEL_KEYS[r.modelFraming].label)}</span>
              </div>
            </div>
            <div
              className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                matched ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {matched ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {matched ? 'Match' : 'Different'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/surveys/response-comparison.tsx
git commit -m "feat: add response comparison component"
```

---

## Task 7: `DailyResult` component

**Files:**
- Create: `src/components/features/surveys/daily-result.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Link from 'next/link'
import { Coins, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { ResponseComparison } from './response-comparison'
import type { FeedbackResponseItem } from '@/app/actions/dailyFeedback'

type Props = {
  responses: FeedbackResponseItem[]
  matchCount: number
  alreadyDone: boolean
}

export function DailyResult({ responses, matchCount, alreadyDone }: Props) {
  const { t } = useLanguage()

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="daily-result">
      <Card className="border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">{t('surveyResultTitle')}</h2>
          <p className="text-slate-400 text-sm mb-4">
            {t('surveyResultMatchLabel')}{' '}
            <span className="text-white font-bold">
              {matchCount}/{responses.length}
            </span>
          </p>
          {alreadyDone ? (
            <p className="text-sm text-slate-400">{t('surveyAlreadyDone')}</p>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-yellow-400 font-bold">
              <Coins className="h-5 w-5" /> {t('surveyRewardEarned')}
            </p>
          )}
        </CardContent>
      </Card>

      <ResponseComparison responses={responses} />

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/surveys" className={cn(buttonVariants({ variant: 'outline' }))}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('surveyBackToSurveys')}
        </Link>
        <Link href="/dashboard/surveys/history" className={cn(buttonVariants())}>
          {t('surveyViewHistory')}
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/surveys/daily-result.tsx
git commit -m "feat: add daily survey result component"
```

---

## Task 8: `DailySurvey` stepper component

**Files:**
- Create: `src/components/features/surveys/daily-survey.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { FRAMINGS, FRAMING_LABEL_KEYS, type Framing } from '@/lib/framing'
import { submitDailyFeedback, type SurveyHeadline, type FeedbackResponseItem } from '@/app/actions/dailyFeedback'
import { DailyResult } from './daily-result'

type Props = { headlines: SurveyHeadline[] }

export function DailySurvey({ headlines }: Props) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Framing>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ responses: FeedbackResponseItem[]; matchCount: number } | null>(null)

  if (result) {
    return <DailyResult responses={result.responses} matchCount={result.matchCount} alreadyDone={false} />
  }

  const headline = headlines[step]
  const progress = ((step + 1) / headlines.length) * 100
  const currentAnswer = answers[headline.articleId]
  const isLast = step === headlines.length - 1

  const choose = (framing: Framing) => {
    setAnswers((prev) => ({ ...prev, [headline.articleId]: framing }))
  }

  const next = async () => {
    if (!currentAnswer) return
    if (!isLast) {
      setStep((s) => s + 1)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const picks = headlines.map((h) => ({
        articleId: h.articleId,
        userFraming: answers[h.articleId] as Framing,
      }))
      const res = await submitDailyFeedback(picks)
      setResult({ responses: res.responses, matchCount: res.matchCount })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto" data-testid="daily-survey-form">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>
            Headline {step + 1} of {headlines.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1 bg-white/10" />
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl mb-6">
        <CardContent className="p-8">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
            {headline.sourcePublisher ?? 'Unknown source'}
          </p>
          <h3 className="text-xl font-medium text-white mb-2 leading-relaxed">{headline.headline}</h3>
          <p className="text-sm text-slate-400 mb-6">{t('surveyQuestionPrompt')}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {FRAMINGS.map((framing) => {
              const selected = currentAnswer === framing
              return (
                <button
                  key={framing}
                  type="button"
                  data-testid={`survey-framing-option-${framing}`}
                  onClick={() => choose(framing)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-500/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-sm font-semibold text-white mb-1">
                    {t(FRAMING_LABEL_KEYS[framing].label)}
                  </span>
                  <span className="block text-xs text-slate-400 leading-relaxed">
                    {t(FRAMING_LABEL_KEYS[framing].desc)}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-400 mb-4" data-testid="survey-error">
          {error}
        </p>
      )}

      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="text-slate-400 hover:text-white"
          data-testid="survey-back-button"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <Button
          onClick={next}
          disabled={!currentAnswer || submitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
          data-testid="survey-next-button"
        >
          {submitting ? t('surveySubmitting') : isLast ? t('surveySubmit') : t('next')}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/surveys/daily-survey.tsx
git commit -m "feat: add daily survey stepper component"
```

---

## Task 9: Survey route `/dashboard/surveys/daily` + E2E tests

**Files:**
- Create: `src/app/dashboard/surveys/daily/page.tsx`
- Create: `tests/daily-feedback.spec.ts`

- [ ] **Step 1: Write the failing Playwright tests**

Create `tests/daily-feedback.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('Daily Feedback Survey route', () => {
  test('renders the daily survey page', async ({ page }) => {
    await page.goto('/dashboard/surveys/daily')
    await expect(page.getByTestId('daily-survey-page')).toBeVisible()
  })

  test('shows one of: survey form, result, or empty state', async ({ page }) => {
    await page.goto('/dashboard/surveys/daily')
    const form = page.getByTestId('daily-survey-form')
    const result = page.getByTestId('daily-result')
    const empty = page.getByTestId('daily-survey-empty')
    await expect(form.or(result).or(empty)).toBeVisible()
  })

  test('if the survey form is shown, choosing a framing enables Next', async ({ page }) => {
    await page.goto('/dashboard/surveys/daily')
    const form = page.getByTestId('daily-survey-form')
    if (!(await form.isVisible().catch(() => false))) {
      test.skip(true, 'Survey already completed today or no headlines available')
    }
    const nextBtn = page.getByTestId('survey-next-button')
    await expect(nextBtn).toBeDisabled()
    await page.getByTestId('survey-framing-option-institutional').click()
    await expect(nextBtn).toBeEnabled()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:e2e -- daily-feedback`
Expected: FAIL — the route does not exist yet (`daily-survey-page` not found / 404).

- [ ] **Step 3: Create the route page**

Create `src/app/dashboard/surveys/daily/page.tsx`:

```tsx
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { Card, CardContent } from '@/components/ui/card'
import { getTodaysFeedback, getDailySurveyHeadlines, type FeedbackResponseItem } from '@/app/actions/dailyFeedback'
import { DailySurvey } from '@/components/features/surveys/daily-survey'
import { DailyResult } from '@/components/features/surveys/daily-result'

export const metadata = {
  title: 'Daily Feedback Survey | Ertoba Analytics',
}

export default async function DailySurveyPage() {
  const todays = await getTodaysFeedback()
  const headlines = todays ? [] : await getDailySurveyHeadlines()

  return (
    <LanguageProvider>
      <div className="space-y-8" data-testid="daily-survey-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Daily Feedback Survey</h1>
          <p className="text-slate-400">Classify how today&apos;s headlines are framed.</p>
        </div>

        {todays ? (
          <DailyResult
            responses={todays.responses as unknown as FeedbackResponseItem[]}
            matchCount={todays.matchCount}
            alreadyDone
          />
        ) : headlines.length < 3 ? (
          <Card className="border-white/10 bg-white/5" data-testid="daily-survey-empty">
            <CardContent className="p-8 text-center text-slate-400">
              No headlines available right now. Please check back later.
            </CardContent>
          </Card>
        ) : (
          <DailySurvey headlines={headlines} />
        )}
      </div>
    </LanguageProvider>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:e2e -- daily-feedback`
Expected: PASS (the framing test may report `skipped` if today's survey is already done or the DB has no headlines — that is acceptable).

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/surveys/daily/page.tsx tests/daily-feedback.spec.ts
git commit -m "feat: add daily feedback survey route"
```

---

## Task 10: Wire the Surveys page

**Files:**
- Modify: `src/app/dashboard/surveys/page.tsx`
- Modify: `tests/daily-feedback.spec.ts`

- [ ] **Step 1: Add a failing test for the wired button**

Add this `describe` block to `tests/daily-feedback.spec.ts`:

```ts
test.describe('Surveys page wiring', () => {
  test('Start Survey navigates to the daily survey route', async ({ page }) => {
    await page.goto('/dashboard/surveys')
    await page.getByTestId('start-survey-link').click()
    await expect(page).toHaveURL(/\/dashboard\/surveys\/daily/)
    await expect(page.getByTestId('daily-survey-page')).toBeVisible()
  })

  test('View history link navigates to the history route', async ({ page }) => {
    await page.goto('/dashboard/surveys')
    await page.getByTestId('survey-history-link').click()
    await expect(page).toHaveURL(/\/dashboard\/surveys\/history/)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:e2e -- daily-feedback`
Expected: FAIL — `start-survey-link` / `survey-history-link` do not exist yet.

- [ ] **Step 3: Replace `src/app/dashboard/surveys/page.tsx`**

Replace the entire file with:

```tsx
import { ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getDictionary, isLanguage } from '@/lib/i18n/dictionaries'

export default async function SurveysPage() {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get('ertoba_lang')?.value
  const language = isLanguage(languageCookie) ? languageCookie : 'ka'
  const dictionary = getDictionary(language)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Available Surveys</h1>
        <p className="text-slate-400">Complete tasks to earn ETC tokens and contribute to the Ertoba ecosystem.</p>
      </div>

      <div className="grid gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-500/20 rounded-xl mt-1 shrink-0">
                <ClipboardList className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{dictionary.surveyDailyTitle}</h3>
                <p className="text-sm text-slate-400 mb-2">{dictionary.surveyDailyDesc}</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30">
                    Reward: +15 ETC
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-400/10 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-400/20">
                    {dictionary.surveyDailyDuration}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2 w-full md:w-auto shrink-0">
              <Link
                href="/dashboard/surveys/daily"
                data-testid="start-survey-link"
                className={cn(buttonVariants({ size: 'lg' }), 'bg-indigo-500 hover:bg-indigo-600 text-white border-0')}
              >
                {dictionary.surveyStartButton} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/surveys/history"
                data-testid="survey-history-link"
                className="text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                {dictionary.surveyViewHistory}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-black/20 backdrop-blur-xl opacity-75">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-500/10 rounded-xl mt-1 shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-300">Onboarding Questionnaire</h3>
                <p className="text-sm text-slate-500 mb-2">Initial setup questionnaire.</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/30">
                    Completed
                  </span>
                </div>
              </div>
            </div>
            <Button disabled variant="outline" className="w-full md:w-auto border-white/10 bg-transparent shrink-0 text-slate-500">
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:e2e -- daily-feedback`
Expected: PASS for the "Surveys page wiring" tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/surveys/page.tsx tests/daily-feedback.spec.ts
git commit -m "feat: wire Start Survey button to daily survey route"
```

---

## Task 11: `FeedbackCalendar` component

**Files:**
- Create: `src/components/features/surveys/feedback-calendar.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getMonthFeedback } from '@/app/actions/dailyFeedback'
import { ResponseComparison } from './response-comparison'
import type { FeedbackResponseItem } from '@/app/actions/dailyFeedback'

type MonthRecord = {
  id: string
  surveyDate: string | Date
  responses: FeedbackResponseItem[]
  matchCount: number
}

const LOCALE_MAP: Record<string, string> = { ka: 'ka-GE', en: 'en-US', de: 'de-DE' }

export function FeedbackCalendar() {
  const { t, language } = useLanguage()
  const now = new Date()
  const [view, setView] = useState({ year: now.getUTCFullYear(), month: now.getUTCMonth() })
  const [records, setRecords] = useState<MonthRecord[]>([])
  const [selected, setSelected] = useState<MonthRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    setSelected(null)
    getMonthFeedback(view.year, view.month)
      .then((rows) => {
        if (active) setRecords(rows as unknown as MonthRecord[])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [view])

  const locale = LOCALE_MAP[language] ?? 'en-US'
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(view.year, view.month, 1)))

  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
  const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay()

  const byDay = new Map<number, MonthRecord>()
  for (const r of records) {
    byDay.set(new Date(r.surveyDate).getUTCDate(), r)
  }

  const isCurrentMonth = view.year === now.getUTCFullYear() && view.month === now.getUTCMonth()
  const todayDate = now.getUTCDate()

  const changeMonth = (delta: number) => {
    setView((v) => {
      const d = new Date(Date.UTC(v.year, v.month + delta, 1))
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() }
    })
  }

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="space-y-6" data-testid="feedback-calendar">
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} data-testid="calendar-prev">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-white capitalize">{monthLabel}</span>
            <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} data-testid="calendar-next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />
              const record = byDay.get(day)
              const completed = Boolean(record)
              const isToday = isCurrentMonth && day === todayDate
              return (
                <button
                  key={day}
                  type="button"
                  disabled={!completed}
                  onClick={() => record && setSelected(record)}
                  data-testid={completed ? 'calendar-day-completed' : 'calendar-day'}
                  className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    completed
                      ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40 hover:bg-teal-500/30 cursor-pointer'
                      : 'bg-white/5 text-slate-600'
                  } ${isToday && !completed ? 'ring-1 ring-white/30' : ''}`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <p className="mt-4 text-xs text-slate-400" data-testid="calendar-completed-count">
            {t('surveyCalendarCompletedLabel')} <span className="text-white font-semibold">{records.length}</span>
          </p>
        </CardContent>
      </Card>

      {selected ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            {t('surveyResultMatchLabel')}{' '}
            <span className="text-white font-bold">
              {selected.matchCount}/{selected.responses.length}
            </span>
          </p>
          <ResponseComparison responses={selected.responses} />
        </div>
      ) : (
        <p className="text-sm text-slate-500" data-testid="calendar-hint">
          {loading
            ? t('loading')
            : records.length === 0
              ? t('surveyCalendarNoData')
              : t('surveyCalendarSelectDay')}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/surveys/feedback-calendar.tsx
git commit -m "feat: add feedback calendar component"
```

---

## Task 12: History route `/dashboard/surveys/history` + E2E test

**Files:**
- Create: `src/app/dashboard/surveys/history/page.tsx`
- Modify: `tests/daily-feedback.spec.ts`

- [ ] **Step 1: Add a failing test for the history page**

Add this `describe` block to `tests/daily-feedback.spec.ts`:

```ts
test.describe('Survey history page', () => {
  test('renders the calendar', async ({ page }) => {
    await page.goto('/dashboard/surveys/history')
    await expect(page.getByTestId('survey-history-page')).toBeVisible()
    await expect(page.getByTestId('feedback-calendar')).toBeVisible()
  })

  test('month navigation works', async ({ page }) => {
    await page.goto('/dashboard/surveys/history')
    await expect(page.getByTestId('feedback-calendar')).toBeVisible()
    await page.getByTestId('calendar-prev').click()
    await expect(page.getByTestId('feedback-calendar')).toBeVisible()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:e2e -- daily-feedback`
Expected: FAIL — the history route does not exist (`survey-history-page` not found).

- [ ] **Step 3: Create the route page**

Create `src/app/dashboard/surveys/history/page.tsx`:

```tsx
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { FeedbackCalendar } from '@/components/features/surveys/feedback-calendar'

export const metadata = {
  title: 'Survey History | Ertoba Analytics',
}

export default function SurveyHistoryPage() {
  return (
    <LanguageProvider>
      <div className="space-y-8" data-testid="survey-history-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Survey History</h1>
          <p className="text-slate-400">Your daily feedback survey calendar and past answers.</p>
        </div>
        <FeedbackCalendar />
      </div>
    </LanguageProvider>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:e2e -- daily-feedback`
Expected: PASS for the "Survey history page" tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/surveys/history/page.tsx tests/daily-feedback.spec.ts
git commit -m "feat: add survey history calendar route"
```

---

## Task 13: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds with no type errors. The routes `/dashboard/surveys/daily` and `/dashboard/surveys/history` appear in the build output.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors in the files created/modified by this plan.

- [ ] **Step 3: Run the full E2E suite**

Run: `npm run test:e2e -- daily-feedback`
Expected: all `daily-feedback` tests pass (framing-interaction test may be `skipped` if today's survey is already complete).

- [ ] **Step 4: Manual verification of the submit flow**

Because the survey is once-per-day per user, the full mutation flow is verified manually:

1. Run `npm run dev` and log in (test account from `tests/auth.setup.ts`, or any account).
2. Go to `/dashboard/surveys` → click **Start Survey**.
3. If the empty state appears, the `PropagandaArticle` table has fewer than 3 framed rows — run `npx prisma db seed` first (requires `Propaganda.json`; see `prisma/seed.ts`). Otherwise continue.
4. Pick a framing for each of the 3 headlines, stepping with Next/Back → submit.
5. Confirm the result screen shows "You said / Our model said" per headline and a match count of `N/3`.
6. Confirm the dashboard coin balance increased by 15 (check the `User.coins` value, e.g. via `npx prisma studio`).
7. Reload `/dashboard/surveys/daily` → confirm it now shows the result screen with the "come back tomorrow" message instead of the form.
8. Go to `/dashboard/surveys/history` → confirm today is highlighted on the calendar; click it → confirm the answer detail panel matches what was submitted.

- [ ] **Step 5: Confirm the design spec is fully covered**

Cross-check against `docs/superpowers/specs/2026-05-21-daily-feedback-survey-design.md` — every section (data model, survey flow, framing mapping, server actions, history page, i18n, edge cases, testing) should map to a completed task above.

- [ ] **Step 6: Finish the branch**

Use the superpowers:finishing-a-development-branch skill to decide how to integrate the work (the project convention is a PR — `CLAUDE.md` says never push directly to `main`, and the PR description should include risk + test notes).
