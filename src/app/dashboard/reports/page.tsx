import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, isLanguage } from '@/lib/i18n/dictionaries'
import { ArrowRight, BarChart3, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Reports | Ertoba',
  description: 'In-depth intelligence reports on various topics.',
}

export default async function ReportsIndexPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('ertoba_lang')?.value
  const language = isLanguage(rawLang) ? rawLang : 'ka'
  const d = getDictionary(language)

  const reports = [
    {
      href: '/dashboard/reports/propaganda',
      icon: BarChart3,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/15',
      borderColor: 'border-indigo-500/20',
      title: d.reportPropaganda,
      desc: d.reportPropagandaDesc,
      badge: '47K+',
    },
    {
      href: '/dashboard/reports/fraud',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15',
      borderColor: 'border-amber-500/20',
      title: d.reportFraud,
      desc: d.reportFraudDesc,
      badge: '2026',
    },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">{d.reportsIndexTitle}</h1>
        <p className="text-sm text-slate-400">{d.reportsIndexSubtitle}</p>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.href} className={`relative overflow-hidden border ${report.borderColor} bg-slate-900/60 backdrop-blur-md transition-colors hover:bg-slate-900/80`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className={`rounded-xl ${report.iconBg} p-3`}>
                  <report.icon className={`h-5 w-5 ${report.iconColor}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-white/10 rounded-full px-2 py-0.5">{report.badge}</span>
              </div>
              <h2 className="text-base font-bold text-white mb-2">{report.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">{report.desc}</p>
              <Link
                href={report.href}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {d.openErtobaIndex} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}

        {/* Coming Soon placeholder */}
        <Card className="border border-dashed border-white/10 bg-transparent">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[180px] gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <Sparkles className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">{d.reportsComingSoon}</p>
              <p className="text-xs text-slate-600 mt-1 max-w-[200px]">{d.reportsComingSoonDesc}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
