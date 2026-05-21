import { ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getDictionary, isLanguage } from '@/lib/i18n/dictionaries'

export default async function SurveysPage() {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get('ertoba_lang')?.value
  const language = isLanguage(languageCookie) ? languageCookie : 'ka'
  const dictionary = getDictionary(language)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Available Surveys</h1>
        <p className="text-slate-400">Complete tasks to earn ETC tokens and contribute to the Ertoba ecosystem.</p>
      </div>

      <div className="grid gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-500/20 rounded-xl mt-1 shrink-0">
                <ClipboardList className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{dictionary.surveyDailyTitle}</h3>
                <p className="text-sm text-slate-400 mb-2">{dictionary.surveyDailyDesc}</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30">
                    Reward: +15 ETC
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-400/10 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-400/20">
                    {dictionary.surveyDailyDuration}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2 w-full md:w-auto shrink-0">
              <Link
                href="/dashboard/surveys/daily"
                data-testid="start-survey-link"
                className={cn(buttonVariants({ size: 'lg' }), 'bg-indigo-500 hover:bg-indigo-600 text-white border-0')}
              >
                {dictionary.surveyStartButton} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/surveys/history"
                data-testid="survey-history-link"
                className="text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                {dictionary.surveyViewHistory}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-black/20 backdrop-blur-xl opacity-75">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-500/10 rounded-xl mt-1 shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-300">Onboarding Questionnaire</h3>
                <p className="text-sm text-slate-500 mb-2">Initial setup questionnaire.</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/30">
                    Completed
                  </span>
                </div>
              </div>
            </div>
            <Button disabled variant="outline" className="w-full md:w-auto border-white/10 bg-transparent shrink-0 text-slate-500">
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
