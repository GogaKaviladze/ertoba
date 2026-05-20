import { Burnout, type BurnoutScores } from '@/components/features/assessments/burnout'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { getAssessmentCompletion } from '@/app/actions/assessments'

export const metadata = {
  title: 'Burnout Assessment | Ertoba Analytics',
  description: 'Evaluate your workplace stress and emotional exhaustion levels.',
}

export default async function BurnoutPage() {
  let initialScores: BurnoutScores | null = null
  try {
    const previousResult = await getAssessmentCompletion('Burnout')
    initialScores = previousResult as BurnoutScores | null
  } catch {
    // DB unreachable (e.g. TLS issue in dev) — show the test without prior results
  }

  return (
    <LanguageProvider>
      <div className="space-y-8">
        <Burnout initialScores={initialScores} />
      </div>
    </LanguageProvider>
  )
}
