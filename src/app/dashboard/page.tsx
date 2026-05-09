import { Coins, ClipboardList, ShoppingBag, ArrowRight, Activity, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { getDictionary, isLanguage } from '@/lib/i18n/dictionaries'
import { WelcomeModal } from '@/components/features/onboarding/WelcomeModal'
import data from '@/data/georgian_thesis_trends.json'

const FRAMING_KEY_MAP: Record<string, string> = {
  'როგორ გვთრგუნავენ': 'howTheySuppressUs',
  'როგორ გვზღუდავენ': 'howTheyRestrictUs',
  'გავლენები და ეკლესია': 'influencesAndChurch',
  'როგორ გვყოფენ': 'howTheyDivideUs',
  'სხვა / ნეიტრალური': 'otherNeutral',
}

export default async function DashboardOverview() {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get('ertoba_lang')?.value
  const language = isLanguage(languageCookie) ? languageCookie : 'ka'
  const dictionary = getDictionary(language)

  const sorted = [...data.category_mentions].sort((a, b) => b.value - a.value)
  const strongest = sorted[0]
  const strongestName = dictionary[FRAMING_KEY_MAP[strongest.name] as keyof typeof dictionary] || strongest.name

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <WelcomeModal />
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">{dictionary.welcome}</h1>
          <p className="text-sm sm:text-base text-slate-400">{dictionary.todayInGeorgia}</p>
        </div>

        {/* Compact Stats for Mobile */}
        <div className="flex items-center gap-3">
           <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-white">1,250 <span className="text-slate-500 font-normal">ETC</span></span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-xs font-bold text-white">2 <span className="text-slate-500 font-normal">{dictionary.questionnaires}</span></span>
            </div>
         </div>
      </div>

      {/* One-Sentence Summary */}
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/5 to-transparent p-4">
        <div className="rounded-lg bg-indigo-500/15 p-2 shrink-0">
          <TrendingUp className="h-4 w-4 text-indigo-300" />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          <span className="font-bold text-white">{data.total_articles.toLocaleString()}</span>{' '}
          {dictionary.summaryArticles}{' '}
          {dictionary.summaryDominant}{' '}
          <span className="font-semibold text-indigo-300">{strongestName}</span>{' '}
          <span className="text-slate-500">({strongest.value.toLocaleString()} {dictionary.summaryMentions})</span>
        </p>
      </div>

      <Card className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-slate-950/80 to-slate-950/90 sm:backdrop-blur-md">
        <div
          className="absolute -top-6 right-0 hidden h-24 w-24 rounded-full bg-indigo-500/10 blur-3xl sm:block"
          aria-hidden="true"
        />
        <CardContent className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/15 p-3">
                <Activity className="h-5 w-5 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-300/80">{dictionary.navAnalytics}</p>
                <h2 className="text-xl font-bold tracking-tight text-white">{dictionary.reportsIndexTitle}</h2>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              {dictionary.reportsIndexSubtitle}
            </p>
          </div>

          <Link
            href="/dashboard/reports"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 sm:self-end"
          >
            {dictionary.navReports} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      {/* Action Cards - Stacked on Mobile, Grid on Desktop */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/5 bg-white/5 sm:backdrop-blur-md">
          <CardContent className="p-5">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Coins className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-white text-sm">{dictionary.myWallet}</h3>
             </div>
            <Link
              href="/dashboard/market"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600/80 px-4 text-xs font-semibold text-white transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              {dictionary.viewBalance} <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5 sm:backdrop-blur-md">
          <CardContent className="p-5">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="font-bold text-white text-sm">{dictionary.activeTasks}</h3>
             </div>
            <Link
              href="/dashboard/surveys"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600/80 px-4 text-xs font-semibold text-white transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              {dictionary.start} <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5 sm:backdrop-blur-md sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="font-bold text-white text-sm">{dictionary.rewardsStore}</h3>
             </div>
            <Link
              href="/dashboard/market"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600/80 px-4 text-xs font-semibold text-white transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              {dictionary.browse} <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
