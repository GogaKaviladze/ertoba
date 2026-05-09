import { BigFive, type BigFiveScores } from '@/components/features/assessments/big-five'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { getAssessmentCompletion } from '@/app/actions/assessments'

export const metadata = {
  title: 'Big Five Personality Assessment | Ertoba Analytics',
  description: 'Understand your core personality traits and earn ETC tokens.',
}

export default async function BigFivePage() {
  const previousResult = await getAssessmentCompletion('BigFive')

  const initialScores = previousResult as BigFiveScores | null

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
