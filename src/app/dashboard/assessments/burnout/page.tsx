import { Burnout, type BurnoutScores } from '@/components/features/assessments/burnout'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { getAssessmentCompletion } from '@/app/actions/assessments'

export const metadata = {
  title: 'Burnout Assessment | Ertoba Analytics',
  description: 'Evaluate your workplace stress and emotional exhaustion levels.',
}

export default async function BurnoutPage() {
  const previousResult = await getAssessmentCompletion('Burnout')
  const initialScores = previousResult as BurnoutScores | null

  return (
    <LanguageProvider>
      <div className="space-y-8">
        <Burnout initialScores={initialScores} />
      </div>
    </LanguageProvider>
  )
}
