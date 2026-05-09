'use server'

import * as analyticsService from '@/services/analyticsService'
import { rateLimit } from '@/lib/rateLimit'
import { getHeadlinesByFramingSchema } from '@/lib/validation'

export async function getHeadlinesByFraming(framing: string, limit: number = 5) {
  try {
    const parsed = getHeadlinesByFramingSchema.safeParse({ framing, limit })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
    }

    // Allow up to 60 analytics lookups per IP per minute (public-ish action).
    // Using the framing string as a secondary key keeps the limit per-resource.
    const result = rateLimit(`getHeadlinesByFraming:${parsed.data.framing}`, 60)
    if (!result.allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' }
    }

    const articles = await analyticsService.getHeadlinesByFraming(parsed.data.framing, parsed.data.limit)
    return { success: true, data: articles.data }
  } catch (error: unknown) {
    console.error('Error fetching headlines:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch headlines'
    return {
      success: false,
      error: message,
      db_status: 'Error connecting to DB. Check DATABASE_URL on Vercel.',
    }
  }
}
