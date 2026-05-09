import prisma from '@/lib/prisma'

/**
 * Analytics Service for Propaganda Data
 * 
 * Centralizes all data fetching and processing logic for the dashboard.
 */

export async function getHeadlinesByFraming(framing: string, limit: number = 5) {
  try {
    const articles = await prisma.propagandaArticle.findMany({
      where: { dominantFraming: framing },
      take: limit,
      orderBy: { framingScore: 'desc' },
      select: {
        id: true,
        headline: true,
        sourcePublisher: true,
        publishedAt: true,
        url: true,
        framingScore: true
      }
    });
    
    return { success: true, data: articles };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AnalyticsService] Error fetching headlines for framing ${framing}:`, message);
    throw error;
  }
}

/**
 * Fetch daily pulse data for trend analysis
 */
export async function getDailyPulse(limit: number = 7) {
  try {
    const pulses = await prisma.dailyPulse.findMany({
      take: limit,
      orderBy: { date: 'desc' }
    });
    return pulses;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[AnalyticsService] Error fetching daily pulse:", message);
    throw error;
  }
}
