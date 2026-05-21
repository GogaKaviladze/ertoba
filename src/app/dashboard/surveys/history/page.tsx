import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { FeedbackCalendar } from '@/components/features/surveys/feedback-calendar'

export const metadata = {
  title: 'Survey History | Ertoba Analytics',
}

export default function SurveyHistoryPage() {
  return (
    <LanguageProvider>
      <div className="space-y-8" data-testid="survey-history-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Survey History</h1>
          <p className="text-slate-400">Your daily feedback survey calendar and past answers.</p>
        </div>
        <FeedbackCalendar />
      </div>
    </LanguageProvider>
  )
}
