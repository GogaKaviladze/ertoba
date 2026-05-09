import { GeorgianAnalyticsDashboardLazy } from '@/components/features/analytics/georgian-dashboard-lazy'
import { AgentReportCard } from '@/components/features/analytics/agent-report-card'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

export const metadata = {
  title: 'Propaganda Analysis | Ertoba Reports',
  description: 'Deep semantic analysis of the Georgian political landscape — 47,000+ articles analyzed.',
}

export default function PropagandaReportPage() {
  return (
    <LanguageProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Ertoba</h1>
          <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest">სიღრმისეული ანალიზი</p>
        </div>

        <AgentReportCard />

        <GeorgianAnalyticsDashboardLazy />
      </div>
    </LanguageProvider>
  )
}
