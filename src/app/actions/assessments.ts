'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { rateLimit } from '@/lib/rateLimit'
import { saveAssessmentResultSchema } from '@/lib/validation'
import { encryptJson, decryptJson } from '@/lib/encryption'
import { writeAuditLog } from '@/lib/audit'

async function getSupabaseUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getAssessmentCompletion(type: string) {
  const user = await getSupabaseUser()
  if (!user) return null

  const assessment = await prisma.assessment.findFirst({ where: { type } })
  if (!assessment) return null

  const completion = await prisma.surveyCompletion.findFirst({
    where: { userId: user.id, assessmentId: assessment.id },
    orderBy: { completedAt: 'desc' },
  })

  if (completion) {
    await writeAuditLog(user.id, 'READ', 'SurveyCompletion', completion.id, { assessmentType: type })
  }

  return completion ? (decryptJson(completion.results) as Prisma.JsonObject) : null
}

export async function saveAssessmentResult(type: string, results: Prisma.InputJsonValue, earnedCoins: number) {
  const parsed = saveAssessmentResultSchema.safeParse({ type, earnedCoins })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input.')
  }

  const user = await getSupabaseUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Allow at most 5 assessment submissions per user per minute to prevent abuse.
  const result = rateLimit(`saveAssessmentResult:${user.id}`, 5)
  if (!result.allowed) {
    throw new Error('Too many requests. Please try again later.')
  }

  // Find or create assessment record
  let assessment = await prisma.assessment.findFirst({
    where: { type: parsed.data.type }
  })

  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        type: parsed.data.type,
        title: parsed.data.type === 'BigFive' ? 'Big Five Personality' : parsed.data.type,
        rewardCoins: parsed.data.earnedCoins,
      }
    })
  }

  // Prevent duplicate completions: each assessment can only be completed once per user.
  const existing = await prisma.surveyCompletion.findFirst({
    where: { userId: user.id, assessmentId: assessment.id },
  })
  if (existing) {
    throw new Error('You have already completed this assessment.')
  }

  // Update user balance and create completion record in a transaction
  await prisma.$transaction([
    prisma.surveyCompletion.create({
      data: {
        userId: user.id,
        assessmentId: assessment.id,
        earnedCoins: parsed.data.earnedCoins,
        results: encryptJson(results) as Prisma.InputJsonValue,
      }
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        coins: { increment: parsed.data.earnedCoins }
      }
    })
  ])

  const created = await prisma.surveyCompletion.findFirst({
    where: { userId: user.id, assessmentId: assessment.id },
    orderBy: { completedAt: 'desc' },
  })
  await writeAuditLog(user.id, 'WRITE', 'SurveyCompletion', created?.id, {
    assessmentType: parsed.data.type,
    earnedCoins: parsed.data.earnedCoins,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/assessments')
  revalidatePath('/dashboard/assessments/big-five')
  revalidatePath('/dashboard/profile')
  return { success: true }
}
