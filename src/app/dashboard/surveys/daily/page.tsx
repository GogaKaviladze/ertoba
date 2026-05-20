import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { Card, CardContent } from '@/components/ui/card'
import { getTodaysFeedback, getDailySurveyHeadlines, type FeedbackResponseItem } from '@/app/actions/dailyFeedback'
import { DailySurvey } from '@/components/features/surveys/daily-survey'
import { DailyResult } from '@/components/features/surveys/daily-result'

export const metadata = {
  title: 'Daily Feedback Survey | Ertoba Analytics',
}

export default async function DailySurveyPage() {
  const todays = await getTodaysFeedback()
  const headlines = todays ? [] : await getDailySurveyHeadlines()

  return (
    <LanguageProvider>
      <div className="space-y-8" data-testid="daily-survey-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Daily Feedback Survey</h1>
          <p className="text-slate-400">Classify how today&apos;s headlines are framed.</p>
        </div>

        {todays ? (
          <DailyResult
            responses={todays.responses as unknown as FeedbackResponseItem[]}
            matchCount={todays.matchCount}
            alreadyDone
          />
        ) : headlines.length < 3 ? (
          <Card className="border-white/10 bg-white/5" data-testid="daily-survey-empty">
            <CardContent className="p-8 text-center text-slate-400">
              No headlines available right now. Please check back later.
            </CardContent>
          </Card>
        ) : (
          <DailySurvey headlines={headlines} />
        )}
      </div>
    </LanguageProvider>
  )
}
