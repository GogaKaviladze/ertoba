import { cookies } from 'next/headers'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { isLanguage } from '@/lib/i18n/dictionaries'
import { FeedbackCalendar } from '@/components/features/surveys/feedback-calendar'

export const metadata = {
  title: 'Survey History | Ertoba Analytics',
}

export default async function SurveyHistoryPage() {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('ertoba_lang')?.value
  const language = isLanguage(langCookie) ? langCookie : 'ka'

  return (
    <LanguageProvider initialLanguage={language}>
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
