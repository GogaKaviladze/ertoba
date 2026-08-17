'use client'

import { ClipboardList, FileBarChart, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { WelcomeModal } from '@/components/features/onboarding/WelcomeModal'

export default function DashboardOverview() {
  const { t } = useLanguage()

  return (
    <div className="space-y-10 pb-10 max-w-xl mx-auto">
      <WelcomeModal />

      {/* Header */}
      <div className="pt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{t('welcome')}</h1>
      </div>

      {/* PRIMARY ACTION */}
      <Link href="/dashboard/surveys">
        <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-slate-950/80 hover:from-teal-500/20 transition-all cursor-pointer group">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="p-3 bg-teal-500/15 rounded-xl shrink-0">
                <ClipboardList className="h-6 w-6 text-teal-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-white">{t('activeTasks')}</h2>
                  <span className="bg-teal-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">2</span>
                </div>
                <p className="text-sm text-slate-400">Daily Feedback · +15 ETC</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-teal-400 shrink-0 group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </Link>

      {/* Secondary */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link href="/dashboard/reports" className="group">
          <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors h-full">
            <CardContent className="p-4 flex flex-col gap-3">
              <FileBarChart className="h-5 w-5 text-indigo-400" />
              <span className="text-sm font-medium text-white">{t('navReports')}</span>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-white/5 bg-white/[0.02] h-full opacity-50 cursor-not-allowed">
          <CardContent className="p-4 flex flex-col gap-3">
            <ShoppingBag className="h-5 w-5 text-orange-400/60" />
            <div>
              <span className="text-sm font-medium text-slate-500 block">{t('navMarket')}</span>
              <span className="text-[11px] text-slate-600">{t('reportsComingSoon')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

