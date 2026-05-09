import prisma from '@/lib/prisma'

/**
 * ERTC (Ertoba Reward Token Coin) Service
 * 
 * Handles all transactional logic for user tokens.
 * Uses Prisma Transactions to ensure atomic operations and prevent race conditions.
 */

export async function getUserBalance(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true }
  })
  return user?.coins || 0
}

/**
 * Earn ERTC tokens for a specific activity (e.g., completing a survey)
 */
export async function earnERTC(userId: string, amount: number, reason: string, assessmentId?: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Update user balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        coins: { increment: amount }
      }
    })

    // 2. (Optional) Log completion if it's an assessment
    if (assessmentId) {
      await tx.surveyCompletion.create({
        data: {
          userId,
          assessmentId,
          earnedCoins: amount,
          results: { reason } // Storing metadata
        }
      })
    }

    return updatedUser
  })
}

/**
 * Spend ERTC tokens for a reward (e.g., a premium report)
 * Ensures user has enough balance before processing.
 */
export async function spendERTC(userId: string, cost: number, rewardId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check current balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    })

    if (!user || user.coins < cost) {
      throw new Error(`Insufficient ERTC balance. Required: ${cost}, Current: ${user?.coins || 0}`)
    }

    // 2. Deduct tokens
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        coins: { decrement: cost }
      }
    })

    // 3. Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        userId,
        rewardId,
        cost
      }
    })

    return { user: updatedUser, transaction }
  })
}

import { AccountType } from '@prisma/client'

/**
 * Ensures a user exists in the Prisma database.
 * Calls this after a successful Supabase login/signup.
 *
 * For PERSONAL accounts the Supabase Auth email is a pseudo-address of the form
 * `<ertoba-key>@ertoba.anon`.  We do NOT store that pseudo-email in the `email`
 * column (PERSONAL users have no real email address) and instead surface the
 * access key via the `username` column so the Supabase table remains readable.
 */
export async function ensureUserExists(userId: string, email?: string, accountType: AccountType = 'PERSONAL') {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    // Treat empty-string email the same as absent email.
    let storedEmail: string | null = email || null
    let storedUsername: string | null = null

    if (accountType === 'PERSONAL' && storedEmail?.endsWith('@ertoba.anon')) {
      // Strip the pseudo-email suffix and keep the key as the username.
      storedUsername = storedEmail?.replace(/@ertoba\.anon$/, '') ?? null
      storedEmail = null
    }

    return await prisma.user.create({
      data: {
        id: userId,
        email: storedEmail,
        username: storedUsername,
        accountType: accountType,
        coins: 100 // Starting balance for new users
      }
    })
  }

  return user
}
