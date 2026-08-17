import { NextRequest, NextResponse } from 'next/server'
import { runDailyMediaIngestion } from '@/services/mediaIngestionService'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  // In local dev without CRON_SECRET configured, allow execution
  if (!cronSecret) {
    return true
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  const urlSecret = req.nextUrl.searchParams.get('secret')
  if (urlSecret && urlSecret === cronSecret) {
    return true
  }

  return false
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await runDailyMediaIngestion()
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    })
  } catch (error) {
    console.error('[API /cron/ingest] Error during media ingestion:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during ingestion',
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
