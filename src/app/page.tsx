'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Brain, Building2, Globe, Lock, Shield, Users } from 'lucide-react'
import { getDictionary, type Language } from '@/lib/i18n/dictionaries'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const LANG_LABELS: Record<Language, string> = { ka: 'ქართული', en: 'English', de: 'Deutsch' }
const LANG_FLAGS: Record<Language, string> = { ka: '🇬🇪', en: '🇬🇧', de: '🇩🇪' }

export default function LandingPage() {
  const { language: lang, setLanguage: changeLang } = useLanguage()
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)

  const t = getDictionary(lang)

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[600px] rounded-full bg-purple-600/10 blur-[140px]" />
        <div className="absolute left-0 top-1/2 h-[300px] w-[400px] rounded-full bg-teal-600/8 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <span className="text-indigo-300 text-xs font-bold">E</span>
          </div>
          <span className="text-white font-bold tracking-tight">Ertoba</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
            {(Object.keys(LANG_LABELS) as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                aria-label={LANG_LABELS[l]}
                title={LANG_LABELS[l]}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  lang === l
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-sm leading-none" aria-hidden="true">{LANG_FLAGS[l]}</span>
                <span className="hidden sm:inline">{l.toUpperCase()}</span>
              </button>
            ))}
          </div>

          <Link
            href="/login"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5"
          >
            {t.signIn}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium">{t.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-4">
          {t.landingHeroTitle}{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t.landingHeroTitleAccent}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
          {t.landingHeroSubtitle}
        </p>

        <div className="flex flex-col items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            {t.landingCta} <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-slate-400">
            {t.landingCtaCallout}
          </p>
          <p className="text-xs text-slate-500 pt-2">
            {t.landingAlreadyAccount}{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              {t.signIn}
            </Link>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 sm:gap-8">
          {[
            { value: t.landingStatAssessments, label: t.landingStatAssessmentsLabel, tooltip: t.landingStatAssessmentsTooltip, icon: <Brain className="h-5 w-5 text-indigo-400" /> },
            { value: t.landingStatPrivacy, label: t.landingStatPrivacyLabel, tooltip: t.landingStatPrivacyTooltip, icon: <Shield className="h-5 w-5 text-teal-400" /> },
            { value: t.landingStatAnon, label: t.landingStatAnonLabel, tooltip: t.landingStatAnonTooltip, icon: <Lock className="h-5 w-5 text-purple-400" /> },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              onMouseEnter={() => setHoveredStat(idx)}
              onMouseLeave={() => setHoveredStat(null)}
              className="relative flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="mb-2">{stat.icon}</div>
              <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums">{stat.value}</span>
              <span className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">{stat.label}</span>
              {hoveredStat === idx && stat.tooltip && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-xs text-slate-300 whitespace-nowrap">
                  {stat.tooltip}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="relative z-10 px-6 py-12 sm:py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t.landingWhatTitle}</h2>
          <p className="text-sm text-slate-400">{t.landingWhatSubtitle}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: '🧠', text: t.landingWhatItem1 },
            { icon: '🔥', text: t.landingWhatItem2 },
            { icon: '📊', text: t.landingWhatItem3 },
            { icon: '🚀', text: t.landingWhatItem4 },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 transition-all">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium text-white">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            👥 {t.landingWhatUsers}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-12 sm:py-16 max-w-4xl mx-auto">
        <h2 className="text-center text-lg sm:text-2xl font-bold text-white mb-10 tracking-tight">
          {t.landingHowTitle}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <Brain className="h-5 w-5 text-indigo-400" />,
              bg: 'bg-indigo-500/10 border-indigo-500/20',
              num: '01',
              title: t.landingStep1Title,
              desc: t.landingStep1Desc,
            },
            {
              icon: <Lock className="h-5 w-5 text-teal-400" />,
              bg: 'bg-teal-500/10 border-teal-500/20',
              num: '02',
              title: t.landingStep2Title,
              desc: t.landingStep2Desc,
            },
            {
              icon: <Users className="h-5 w-5 text-amber-400" />,
              bg: 'bg-amber-500/10 border-amber-500/20',
              num: '03',
              title: t.landingStep3Title,
              desc: t.landingStep3Desc,
            },
          ].map((step) => (
            <div
              key={step.num}
              className={`relative flex flex-col gap-4 p-6 rounded-2xl border ${step.bg} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                  {step.icon}
                </div>
                <span className="text-3xl font-black text-white/10 tabular-nums">{step.num}</span>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1.5">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* B2C/B2B Path Clarity */}
      <section className="relative z-10 px-6 py-12 sm:py-16 max-w-4xl mx-auto">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/login"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm p-8 hover:bg-indigo-500/10 transition-all"
          >
            <Brain className="h-6 w-6 text-indigo-400" />
            <span className="text-base font-semibold text-white text-center">{t.landingForYouTitle}</span>
            <span className="text-xs text-slate-400 text-center">{t.landingForYouDesc}</span>
          </Link>

          <a
            href="/contact"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-teal-500/20 bg-teal-500/5 backdrop-blur-sm p-8 hover:bg-teal-500/10 transition-all"
          >
            <Building2 className="h-6 w-6 text-teal-400" />
            <span className="text-base font-semibold text-white text-center">{t.landingForTeamTitle}</span>
            <span className="text-xs text-slate-400 text-center">{t.landingForTeamDesc}</span>
          </a>
        </div>
      </section>

      {/* B2B Section */}
      <section className="relative z-10 px-6 py-12 sm:py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <Building2 className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {t.b2bTitle}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8 max-w-2xl">
            {t.b2bSubtitle}
          </p>

          <div className="grid gap-3 sm:grid-cols-3 mb-8">
            {[
              { icon: <Users className="h-4 w-4 text-indigo-400" />, text: t.b2bFeature1 },
              { icon: <Shield className="h-4 w-4 text-teal-400" />, text: t.b2bFeature2 },
              { icon: <Globe className="h-4 w-4 text-purple-400" />, text: t.b2bFeature3 },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                {feature.icon}
                <span className="text-sm text-white font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 border border-white/20 text-sm"
          >
            {t.b2bCta} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 py-12 sm:py-16 text-center">
        <div className="max-w-md mx-auto">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20 text-sm"
          >
            {t.landingCta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest">
          Ertoba Analytics · {new Date().getFullYear()}
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/privacy" className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">
            {t.footerPrivacy}
          </Link>
          <span className="text-[10px] text-slate-700">·</span>
          <Link href="/impressum" className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">
            {t.footerImprint}
          </Link>
        </div>
      </footer>
    </div>
  )
}
