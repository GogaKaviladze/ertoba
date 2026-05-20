import { BigFive, type BigFiveScores } from '@/components/features/assessments/big-five'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { getAssessmentCompletion } from '@/app/actions/assessments'

export const metadata = {
  title: 'Big Five Personality Assessment | Ertoba Analytics',
  description: 'Understand your core personality traits and earn ETC tokens.',
}

export default async function BigFivePage() {
  let initialScores: BigFiveScores | null = null
  try {
    const previousResult = await getAssessmentCompletion('BigFive')
    initialScores = previousResult as BigFiveScores | null
  } catch {
    // DB unreachable (e.g. TLS issue in dev) — show the test without prior results
  }

  return (
    <LanguageProvider>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Big Five Assessment</h1>
          <p className="text-slate-400">The scientific gold standard for personality testing.</p>
        </div>

        <BigFive initialScores={initialScores} />
      </div>
    </LanguageProvider>
  )
}
