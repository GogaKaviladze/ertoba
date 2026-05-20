'use client'

import { Brain, HeartPulse } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext'

function AssessmentsContent() {
  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('assessmentsHubTitle')}</h1>
        <p className="text-slate-400">{t('assessmentsHubSubtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/assessments/big-five" className="group">
          <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all backdrop-blur-xl h-full">
            <CardContent className="p-6">
              <div className="p-3 bg-indigo-500/20 rounded-xl w-fit mb-4">
                <Brain className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('assessmentBigFiveTitle')}</h3>
              <p className="text-sm text-slate-400 mb-4">{t('assessmentBigFiveDesc')}</p>
              <div className="flex items-center text-sm font-medium text-indigo-400">
                {t('assessmentBigFiveReward')}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/assessments/burnout" className="group">
          <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-rose-500/10 to-orange-500/10 hover:from-rose-500/20 hover:to-orange-500/20 transition-all backdrop-blur-xl h-full">
            <CardContent className="p-6">
              <div className="p-3 bg-rose-500/20 rounded-xl w-fit mb-4">
                <HeartPulse className="h-8 w-8 text-rose-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('assessmentBurnoutTitle')}</h3>
              <p className="text-sm text-slate-400 mb-4">{t('assessmentBurnoutDesc')}</p>
              <div className="flex items-center text-sm font-medium text-rose-400">
                {t('assessmentBurnoutReward')}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default function AssessmentsPage() {
  return (
    <LanguageProvider>
      <AssessmentsContent />
    </LanguageProvider>
  )
}
