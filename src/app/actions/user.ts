'use server'

import * as userService from '@/services/userService'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { getBalanceSchema, earnTokensSchema, purchaseRewardSchema } from '@/lib/validation'

/**
 * Validates that the current user matches the requested userId.
 * Throws an error if unauthorized.
 */
async function validateUserAccess(requestedUserId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  if (session.user.id !== requestedUserId) {
    throw new Error('Unauthorized')
  }

  return session.user
}

/**
 * Server Action: Get User Balance
 */
export async function getBalance(userId: string) {
  try {
    const parsed = getBalanceSchema.safeParse({ userId })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
    }

    const result = rateLimit(`getBalance:${userId}`, 30)
    if (!result.allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' }
    }

    await validateUserAccess(parsed.data.userId)
    const balance = await userService.getUserBalance(parsed.data.userId)
    return { success: true, balance }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

/**
 * Server Action: Earn ERTC
 * To be called after successful completion of tasks/surveys.
 */
export async function earnTokens(userId: string, amount: number, reason: string, assessmentId?: string) {
  try {
    const parsed = earnTokensSchema.safeParse({ userId, amount, reason, assessmentId })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
    }

    // Allow at most 10 earn actions per user per minute to prevent abuse.
    const result = rateLimit(`earnTokens:${userId}`, 10)
    if (!result.allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' }
    }

    await validateUserAccess(parsed.data.userId)
    const data = await userService.earnERTC(
      parsed.data.userId,
      parsed.data.amount,
      parsed.data.reason,
      parsed.data.assessmentId,
    )
    revalidatePath('/dashboard')
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

/**
 * Server Action: Purchase Reward
 * Deducts ERTC and creates a transaction.
 */
export async function purchaseReward(userId: string, cost: number, rewardId: string) {
  try {
    const parsed = purchaseRewardSchema.safeParse({ userId, cost, rewardId })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
    }

    // Allow at most 20 purchase attempts per user per minute.
    const result = rateLimit(`purchaseReward:${userId}`, 20)
    if (!result.allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' }
    }

    await validateUserAccess(parsed.data.userId)
    const data = await userService.spendERTC(parsed.data.userId, parsed.data.cost, parsed.data.rewardId)
    revalidatePath('/dashboard')
    revalidatePath('/marketplace')
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}
