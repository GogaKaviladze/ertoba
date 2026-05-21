/**
 * Zod validation schemas for all Server Actions.
 *
 * Centralising schemas here keeps action files focused on business logic
 * and makes it easy to tighten or loosen constraints in one place.
 */

import { z } from 'zod'
import { FRAMINGS } from '@/lib/framing'

// ---------------------------------------------------------------------------
// Reusable primitives
// ---------------------------------------------------------------------------

/** UUID v4 pattern */
const uuid = z.string().uuid({ message: 'Invalid user ID.' })

/** Positive integer — used for coin amounts */
const positiveInt = z
  .number()
  .int({ message: 'Amount must be a whole number.' })
  .positive({ message: 'Amount must be greater than zero.' })

// ---------------------------------------------------------------------------
// user.ts
// ---------------------------------------------------------------------------

export const getBalanceSchema = z.object({
  userId: uuid,
})

export const earnTokensSchema = z.object({
  userId: uuid,
  /** Maximum single earn: 10 000 ERTC */
  amount: positiveInt.max(10_000, { message: 'Amount exceeds the per-action limit of 10 000 ERTC.' }),
  reason: z
    .string()
    .min(1, { message: 'Reason is required.' })
    .max(255, { message: 'Reason must be 255 characters or fewer.' }),
  assessmentId: z.string().uuid({ message: 'Invalid assessment ID.' }).optional(),
})

export const purchaseRewardSchema = z.object({
  userId: uuid,
  /** Minimum purchase cost: 1 ERTC */
  cost: positiveInt,
  rewardId: z.string().min(1, { message: 'Reward ID is required.' }).max(128),
})

// ---------------------------------------------------------------------------
// assessments.ts
// ---------------------------------------------------------------------------

const ALLOWED_ASSESSMENT_TYPES = ['BigFive', 'Burnout'] as const

export const saveAssessmentResultSchema = z.object({
  type: z.enum(ALLOWED_ASSESSMENT_TYPES, {
    error: `Assessment type must be one of: ${ALLOWED_ASSESSMENT_TYPES.join(', ')}.`,
  }),
  /** Maximum single-assessment reward: 1 000 ERTC */
  earnedCoins: positiveInt.max(1_000, { message: 'Earned coins exceed the per-assessment limit of 1 000.' }),
})

// ---------------------------------------------------------------------------
// analytics.ts
// ---------------------------------------------------------------------------

export const getHeadlinesByFramingSchema = z.object({
  framing: z
    .string()
    .min(1, { message: 'Framing parameter is required.' })
    .max(100, { message: 'Framing parameter is too long.' }),
  /** Cap how many articles can be requested in one call */
  limit: z
    .number()
    .int()
    .min(1, { message: 'Limit must be at least 1.' })
    .max(50, { message: 'Limit must not exceed 50.' })
    .default(5),
})

// ---------------------------------------------------------------------------
// auth/actions.ts
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email or access key is required.' })
    .max(320, { message: 'Email is too long.' }),
  password: z.string().min(1, { message: 'Password is required.' }).max(512),
  accountType: z.enum(['PERSONAL', 'ORGANIZATIONAL']).default('PERSONAL'),
})

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email or access key is required.' })
    .max(320, { message: 'Email is too long.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).max(512),
  accountType: z.enum(['PERSONAL', 'ORGANIZATIONAL']).default('PERSONAL'),
})

// ---------------------------------------------------------------------------
// dailyFeedback.ts
// ---------------------------------------------------------------------------

export const submitDailyFeedbackSchema = z.object({
  picks: z
    .array(
      z.object({
        articleId: z.string().uuid({ message: 'Invalid article ID.' }),
        userFraming: z.enum(FRAMINGS, { error: 'Invalid framing choice.' }),
      })
    )
    .length(3, { message: 'Exactly 3 answers are required.' }),
})
