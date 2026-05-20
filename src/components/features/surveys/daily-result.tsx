'use client'

import Link from 'next/link'
import { Coins, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { ResponseComparison } from './response-comparison'
import type { FeedbackResponseItem } from '@/app/actions/dailyFeedback'

type Props = {
  responses: FeedbackResponseItem[]
  matchCount: number
  alreadyDone: boolean
}

export function DailyResult({ responses, matchCount, alreadyDone }: Props) {
  const { t } = useLanguage()

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="daily-result">
      <Card className="border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">{t('surveyResultTitle')}</h2>
          <p className="text-slate-400 text-sm mb-4">
            {t('surveyResultMatchLabel')}{' '}
            <span className="text-white font-bold">
              {matchCount}/{responses.length}
            </span>
          </p>
          {alreadyDone ? (
            <p className="text-sm text-slate-400">{t('surveyAlreadyDone')}</p>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-yellow-400 font-bold">
              <Coins className="h-5 w-5" /> {t('surveyRewardEarned')}
            </p>
          )}
        </CardContent>
      </Card>

      <ResponseComparison responses={responses} />

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/surveys" className={cn(buttonVariants({ variant: 'outline' }))}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('surveyBackToSurveys')}
        </Link>
        <Link href="/dashboard/surveys/history" className={cn(buttonVariants())}>
          {t('surveyViewHistory')}
        </Link>
      </div>
    </div>
  )
}
