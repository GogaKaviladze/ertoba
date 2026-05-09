'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, Coins, Sparkles, X } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const ONBOARDING_KEY = 'ertoba_onboarding_done'

export function WelcomeModal() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const { language: lang } = useLanguage()

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (done) return

    // Small delay so dashboard renders first
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setVisible(false)
  }

  const next = () => {
    if (step < 2) setStep(step + 1)
    else dismiss()
  }

  if (!visible) return null

  const t = getDictionary(lang)
  
  const steps = [
    {
      icon: <Sparkles className="h-6 w-6 text-indigo-300" />,
      bg: 'from-indigo-500/20 to-purple-500/10',
      border: 'border-indigo-500/30',
      title: t.onboardingStep1Title,
      desc: t.onboardingStep1Desc,
      sub: t.onboardingStep1Sub,
    },
    {
      icon: <Coins className="h-6 w-6 text-amber-300" />,
      bg: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/30',
      title: t.onboardingStep2Title,
      desc: t.onboardingStep2Desc,
      sub: t.onboardingStep2Sub,
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-teal-300" />,
      bg: 'from-teal-500/20 to-cyan-500/10',
      border: 'border-teal-500/30',
      title: t.onboardingStep3Title,
      desc: t.onboardingStep3Desc,
      sub: t.onboardingStep3Sub,
    },
  ]

  const current = steps[step]
  const isLast = step === 2

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-400 ease-out">
        <div className={`rounded-2xl bg-gradient-to-br ${current.bg} border ${current.border} backdrop-blur-xl p-6 shadow-2xl`}>
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step dots */}
          <div className="flex gap-1.5 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-white' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center mb-5">
            {current.icon}
          </div>

          {/* Content */}
          <h2 className="text-lg font-bold text-white mb-2 leading-snug">{current.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{current.desc}</p>
          <p className="text-[11px] text-slate-500 mb-6">{current.sub}</p>

          {/* Actions */}
          {isLast ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/assessments/big-five"
                onClick={dismiss}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
              >
                {t.onboardingStartTest} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/dashboard/reports"
                onClick={dismiss}
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-all border border-white/10"
              >
                {t.onboardingGoAnalytics}
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={dismiss}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {t.onboardingSkip}
              </button>
              <button
                onClick={next}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                {t.onboardingNext} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
