import { NextResponse } from 'next/server'
import agentReport from '@/data/agent_report.json'

/**
 * GET /api/agent-report
 *
 * Returns the latest cached agent report produced by run_agent.py.
 * The report is a static JSON file committed to the repository; it is
 * refreshed by running `python run_agent.py --sample` (or without --sample
 * for real Propaganda.json data).
 *
 * This endpoint exists so client components can fetch the report without
 * importing a large JSON file directly into their bundle.
 */
export async function GET() {
  return NextResponse.json(agentReport, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
