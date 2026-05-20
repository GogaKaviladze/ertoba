'use client'

import { ClipboardList, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext'

function SurveysContent() {
  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('surveysTitle')}</h1>
        <p className="text-slate-400">{t('surveysSubtitle')}</p>
      </div>

      <div className="grid gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-500/20 rounded-xl mt-1 shrink-0">
                <ClipboardList className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{t('surveyDailyTitle')}</h3>
                <p className="text-sm text-slate-400 mb-2">{t('surveyDailyDesc')}</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30">
                    {t('surveyRewardLabel')} +15 ERTC
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-400/10 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-400/20">
                    {t('surveyEstTime')}
                  </span>
                </div>
              </div>
            </div>
            <Button className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 border-0 shrink-0">
              {t('surveyStartBtn')}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-black/20 backdrop-blur-xl opacity-75">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-500/10 rounded-xl mt-1 shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-300">{t('surveyOnboardingTitle')}</h3>
                <p className="text-sm text-slate-500 mb-2">{t('surveyOnboardingDesc')}</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/30">
                    {t('surveyCompleted')}
                  </span>
                </div>
              </div>
            </div>
            <Button disabled variant="outline" className="w-full md:w-auto border-white/10 bg-transparent shrink-0 text-slate-500">
              {t('surveyDoneBtn')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SurveysPage() {
  return (
    <LanguageProvider>
      <SurveysContent />
    </LanguageProvider>
  )
}
