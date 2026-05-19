'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Menu, Globe, Coins } from 'lucide-react'

const mobileNav = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Assessments', href: '/dashboard/assessments' },
  { name: 'Surveys', href: '/dashboard/surveys' },
  { name: 'Market', href: '/dashboard/market' },
  { name: 'Ertoba Index', href: '/dashboard/reports/propaganda' },
  { name: 'Profile', href: '/dashboard/profile' },
]

type Language = 'ka' | 'en' | 'de'

export function Header({ initialLanguage = 'ka', balance = 0 }: { initialLanguage?: Language; balance?: number }) {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.assign('/login')
  }

  const switchLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
    document.cookie = `ertoba_lang=${nextLanguage}; path=/; max-age=31536000; samesite=lax${
      window.location.protocol === 'https:' ? '; secure' : ''
    }`
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-3 border-b border-white/5 bg-black/80 px-4 shadow-sm sm:gap-x-6 sm:bg-black/20 sm:px-6 sm:backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-4">
        <details
          className="relative md:hidden"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              (e.currentTarget as HTMLDetailsElement).open = false
            }
          }}
        >
          <summary
            className="list-none cursor-pointer rounded-md p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </summary>
          <nav
            className="absolute left-0 top-12 w-56 rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-xl backdrop-blur-md"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {mobileNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </details>
      </div>

      <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
        <div className="flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 sm:px-4">
          <Coins className="h-4 w-4 text-yellow-400" />
          <span className="text-xs font-bold text-indigo-50 sm:text-sm">{balance.toLocaleString()} ERTC</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          <Globe className="ml-1 hidden h-4 w-4 text-indigo-400 sm:block" />
          {(['ka', 'en', 'de'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => switchLanguage(lang)}
              className={`rounded px-2 py-1.5 text-xs font-bold uppercase transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none sm:px-3 sm:py-2 ${language === lang ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              aria-pressed={language === lang}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-red-300 transition-all hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none min-h-[44px]"
          onClick={handleLogout}
        >
          <LogOut className="mr-1 h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </header>
  )
}
