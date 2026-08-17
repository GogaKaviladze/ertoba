import prisma from '@/lib/prisma'
import { classifyHeadline } from '@/lib/mediaClassifier'
import { utcMidnight, type Framing } from '@/lib/framing'

export type MediaSource = {
  name: string
  url: string
  type: 'rss' | 'atom'
}

export const DEFAULT_MEDIA_SOURCES: MediaSource[] = [
  {
    name: 'Interpressnews',
    url: 'https://www.interpressnews.ge/ka/rss',
    type: 'rss',
  },
  {
    name: 'Tabula',
    url: 'https://tabula.ge/ge/rss.xml',
    type: 'rss',
  },
  {
    name: '1TV',
    url: 'https://1tv.ge/feed/',
    type: 'rss',
  },
  {
    name: 'Radio Tavisupleba',
    url: 'https://www.radiotavisupleba.ge/api/z$oq_iem_i',
    type: 'rss',
  },
]

export type RawFeedItem = {
  headline: string
  bodyText: string
  url: string | null
  publishedAt: Date
  sourcePublisher: string
}

export type IngestionSummary = {
  totalFetched: number
  newArticlesSaved: number
  duplicatesSkipped: number
  dailyPulseUpdated: boolean
  classifiedFramings: Record<Framing, number>
}

/** Decode basic XML / HTML entities & strip tags */
export function sanitizeXmlText(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
}

/** Resilient pure-TS RSS & Atom XML item parser */
export function parseRssXml(xml: string, sourcePublisher: string): RawFeedItem[] {
  const items: RawFeedItem[] = []

  // Try RSS <item> tags first
  const rssItemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || []
  for (const itemXml of rssItemMatches) {
    const titleMatch = itemXml.match(/<title[\s\S]*?>([\s\S]*?)<\/title>/i)
    const linkMatch = itemXml.match(/<link[\s\S]*?>([\s\S]*?)<\/link>/i)
    const descMatch =
      itemXml.match(/<description[\s\S]*?>([\s\S]*?)<\/description>/i) ||
      itemXml.match(/<content:encoded[\s\S]*?>([\s\S]*?)<\/content:encoded>/i)
    const pubDateMatch = itemXml.match(/<pubDate[\s\S]*?>([\s\S]*?)<\/pubDate>/i)

    const headline = sanitizeXmlText(titleMatch ? titleMatch[1] : '')
    const bodyText = sanitizeXmlText(descMatch ? descMatch[1] : '')
    const url = linkMatch ? sanitizeXmlText(linkMatch[1]) : null
    const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]) : new Date()

    if (headline && headline.length > 5) {
      items.push({
        headline,
        bodyText,
        url: url && url.startsWith('http') ? url : null,
        publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
        sourcePublisher,
      })
    }
  }

  // If no RSS items, try Atom <entry> tags
  if (items.length === 0) {
    const atomEntryMatches = xml.match(/<entry[\s\S]*?<\/entry>/gi) || []
    for (const entryXml of atomEntryMatches) {
      const titleMatch = entryXml.match(/<title[\s\S]*?>([\s\S]*?)<\/title>/i)
      const linkMatch =
        entryXml.match(/<link[^>]*href=["']([^"']+)["']/i) ||
        entryXml.match(/<link[\s\S]*?>([\s\S]*?)<\/link>/i)
      const summaryMatch =
        entryXml.match(/<summary[\s\S]*?>([\s\S]*?)<\/summary>/i) ||
        entryXml.match(/<content[\s\S]*?>([\s\S]*?)<\/content>/i)
      const updatedMatch =
        entryXml.match(/<published[\s\S]*?>([\s\S]*?)<\/published>/i) ||
        entryXml.match(/<updated[\s\S]*?>([\s\S]*?)<\/updated>/i)

      const headline = sanitizeXmlText(titleMatch ? titleMatch[1] : '')
      const bodyText = sanitizeXmlText(summaryMatch ? summaryMatch[1] : '')
      const url = linkMatch ? sanitizeXmlText(linkMatch[1]) : null
      const publishedAt = updatedMatch ? new Date(updatedMatch[1]) : new Date()

      if (headline && headline.length > 5) {
        items.push({
          headline,
          bodyText,
          url: url && url.startsWith('http') ? url : null,
          publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
          sourcePublisher,
        })
      }
    }
  }

  return items
}

/**
 * Fetches and parses an RSS feed from a given URL with timeout and error handling.
 */
export async function fetchFeedItems(source: MediaSource): Promise<RawFeedItem[]> {
  try {
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'Ertoba-Media-Ingestion/1.0 (+https://ertoba.ge)',
        Accept: 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
      },
      signal: AbortSignal.timeout(8000), // 8s timeout per feed
    })

    if (!res.ok) {
      console.warn(`[Ingestion] Failed to fetch feed ${source.name} (${source.url}): HTTP ${res.status}`)
      return []
    }

    const xml = await res.text()
    return parseRssXml(xml, source.name)
  } catch (err) {
    console.warn(`[Ingestion] Network error fetching feed ${source.name}:`, err instanceof Error ? err.message : err)
    return []
  }
}

/**
 * Full automated daily ingestion job:
 * 1. Fetches headlines from all configured media sources
 * 2. Classifies framing for each article
 * 3. Filters existing duplicates
 * 4. Inserts into database
 * 5. Aggregates and updates DailyPulse
 */
export async function runDailyMediaIngestion(
  sources: MediaSource[] = DEFAULT_MEDIA_SOURCES,
  geminiApiKey: string | undefined = process.env.GEMINI_API_KEY
): Promise<IngestionSummary> {
  const summary: IngestionSummary = {
    totalFetched: 0,
    newArticlesSaved: 0,
    duplicatesSkipped: 0,
    dailyPulseUpdated: false,
    classifiedFramings: {
      institutional: 0,
      psychological: 0,
      societal: 0,
      geopolitical: 0,
    },
  }

  // 1. Fetch from all feeds in parallel
  const feedPromises = sources.map((source) => fetchFeedItems(source))
  const results = await Promise.allSettled(feedPromises)
  const allItems: RawFeedItem[] = []

  for (const res of results) {
    if (res.status === 'fulfilled') {
      allItems.push(...res.value)
    }
  }

  summary.totalFetched = allItems.length
  if (allItems.length === 0) {
    return summary
  }

  // Deduplicate within the current batch by headline
  const uniqueItems = new Map<string, RawFeedItem>()
  for (const item of allItems) {
    if (!uniqueItems.has(item.headline)) {
      uniqueItems.set(item.headline, item)
    }
  }

  // 2. Query existing headlines/URLs from DB to skip duplicates
  const candidateHeadlines = Array.from(uniqueItems.values()).map((i) => i.headline)
  const existingArticles = await prisma.propagandaArticle.findMany({
    where: { headline: { in: candidateHeadlines } },
    select: { headline: true },
  })

  const existingSet = new Set(existingArticles.map((a) => a.headline))
  const itemsToClassify = Array.from(uniqueItems.values()).filter((item) => !existingSet.has(item.headline))

  summary.duplicatesSkipped = allItems.length - itemsToClassify.length

  if (itemsToClassify.length === 0) {
    return summary
  }

  // 3. Classify each new article
  const classifiedArticles = []
  for (const item of itemsToClassify) {
    const classification = await classifyHeadline(item.headline, item.bodyText, geminiApiKey)
    summary.classifiedFramings[classification.canonicalKey] += 1

    classifiedArticles.push({
      headline: item.headline,
      bodyText: item.bodyText || null,
      publishedAt: item.publishedAt,
      sourcePublisher: item.sourcePublisher,
      dominantFraming: classification.dominantFraming,
      framingScore: classification.framingScore,
      url: item.url,
    })
  }

  // 4. Batch insert into PropagandaArticle
  if (classifiedArticles.length > 0) {
    await prisma.propagandaArticle.createMany({
      data: classifiedArticles,
    })
    summary.newArticlesSaved = classifiedArticles.length
  }

  // 5. Update DailyPulse for today
  const todayMidnight = utcMidnight()
  const framingIncrements = {
    institutional: summary.classifiedFramings.institutional,
    psychological: summary.classifiedFramings.psychological,
    societal: summary.classifiedFramings.societal,
    geopolitical: summary.classifiedFramings.geopolitical,
  }

  await prisma.dailyPulse.upsert({
    where: { date: todayMidnight },
    create: {
      date: todayMidnight,
      ...framingIncrements,
    },
    update: {
      institutional: { increment: framingIncrements.institutional },
      psychological: { increment: framingIncrements.psychological },
      societal: { increment: framingIncrements.societal },
      geopolitical: { increment: framingIncrements.geopolitical },
    },
  })
  summary.dailyPulseUpdated = true

  return summary
}
