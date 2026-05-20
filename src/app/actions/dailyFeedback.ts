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
      userFraming: pick.userFraming,
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
