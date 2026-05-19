'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const ONBOARDING_KEY = 'ertoba_onboarding_done'

export function WelcomeModal() {
  const [visible, setVisible] = useState(false)
  const { language: lang } = useLanguage()

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (done) return
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const t = getDictionary(lang)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-400 ease-out">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 backdrop-blur-xl p-6 shadow-2xl">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="text-lg font-bold text-white mb-2">{t.onboardingStep1Title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">{t.onboardingStep3Desc}</p>

          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard/assessments/big-five"
              onClick={dismiss}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
            >
              {t.onboardingStartTest} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={dismiss}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors py-1"
            >
              {t.onboardingSkip}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
