'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Brain, ClipboardList, ShoppingBag, FileBarChart, User, Hexagon } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getDictionary } from '@/lib/i18n/dictionaries'

export type SidebarLabels = {
  navDashboard: string
  navAssessments: string
  navSurveys: string
  navMarket: string
  navProfile: string
  navAnalytics: string
  navReports: string
}

export const navigation = [
  { key: 'navDashboard' as const, href: '/dashboard', icon: LayoutDashboard },
  { key: 'navAssessments' as const, href: '/dashboard/assessments', icon: Brain },
  { key: 'navSurveys' as const, href: '/dashboard/surveys', icon: ClipboardList, badge: 2 },
  { key: 'navProfile' as const, href: '/dashboard/profile', icon: User },
]

export const analyticsNavigation = [
  { key: 'navReports' as const, href: '/dashboard/reports', icon: FileBarChart },
]

export function Sidebar({
  className,
  labels,
  onNavigate,
}: {
  className?: string
  labels?: SidebarLabels
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { language } = useLanguage()
  const dictionary = getDictionary(language)
  const activeLabels: SidebarLabels = labels ?? {
    navDashboard: dictionary.navDashboard,
    navAssessments: dictionary.navAssessments,
    navSurveys: dictionary.navSurveys,
    navMarket: dictionary.navMarket,
    navProfile: dictionary.navProfile,
    navAnalytics: dictionary.navAnalytics,
    navReports: dictionary.navReports,
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center gap-3 pt-4">
          <Hexagon className="h-8 w-8 text-indigo-500" />
          <span className="font-bold text-xl tracking-tight text-white">Ertoba<span className="text-indigo-400">.</span></span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex justify-between gap-x-3 rounded-lg p-3 text-sm/6 font-medium transition-colors",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {activeLabels[item.key]}
                        </div>
                        {item.badge ? (
                          <span className="flex h-5 items-center justify-center rounded-full bg-teal-500 px-2 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  )
                })}

                {/* Market — Coming Soon */}
                <li>
                  <div className="flex justify-between items-center gap-x-3 rounded-lg p-3 text-sm/6 font-medium text-slate-600 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {activeLabels.navMarket}
                    </div>
                    <span className="text-[10px] text-slate-700 font-medium">Soon</span>
                  </div>
                </li>
              </ul>
            </li>
            <li>
              <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 mt-2 mb-1">{activeLabels.navAnalytics}</p>
              <ul role="list" className="-mx-2 space-y-1">
                {analyticsNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex gap-x-3 rounded-lg p-3 text-sm/6 font-medium transition-colors",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {activeLabels[item.key]}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
