'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  Shield,
  Sparkles,
  Users,
  ChevronDown,
} from 'lucide-react'
import { getDictionary, type Language } from '@/lib/i18n/dictionaries'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const LANG_LABELS: Record<Language, string> = { ka: 'ქართული', en: 'English', de: 'Deutsch' }
const LANG_FLAGS: Record<Language, string> = { ka: '🇬🇪', en: '🇬🇧', de: '🇩🇪' }

export default function LandingPage() {
  const { language: lang, setLanguage: changeLang } = useLanguage()
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)

  const t = getDictionary(lang)

  // Demo trait metrics for the hero preview card
  const demoTraits = [
    { name: t.openness, score: 86, color: 'bg-emerald-400', desc: t.opennessDesc },
    { name: t.conscientiousness, score: 78, color: 'bg-blue-400', desc: t.conscientiousnessDesc },
    { name: t.extraversion, score: 64, color: 'bg-amber-400', desc: t.extraversionDesc },
    { name: t.agreeableness, score: 82, color: 'bg-teal-400', desc: t.agreeablenessDesc },
    { name: t.neuroticism, score: 28, color: 'bg-indigo-400', desc: t.neuroticismDesc },
  ]

  return (
    <div className="relative min-h-screen bg-[#07090E] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Refined Ambient Lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-6xl bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.14),transparent)]" />
        <div className="absolute top-[400px] left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(56,189,248,0.05),transparent)]" />
      </div>

      {/* Structured Nav */}
      <nav className="relative z-20 border-b border-white/[0.06] bg-[#07090E]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center transition-colors group-hover:border-indigo-400/50">
              <span className="text-indigo-300 text-sm font-bold">E</span>
            </div>
            <span className="text-white font-bold tracking-tight text-lg">Ertoba</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-3 py-1.5 transition-all text-xs font-medium text-slate-300 outline-none">
                <span className="text-sm leading-none" aria-hidden="true">{LANG_FLAGS[lang]}</span>
                <span>{LANG_LABELS[lang]}</span>
                <ChevronDown className="h-3 w-3 text-slate-400 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="min-w-[140px] bg-[#0D111A] border-white/10 shadow-xl">
                {(Object.keys(LANG_FLAGS) as Language[]).map((l) => (
                  <DropdownMenuItem
                    key={l}
                    onClick={() => changeLang(l)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      lang === l ? 'text-white bg-white/[0.08]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm leading-none" aria-hidden="true">{LANG_FLAGS[l]}</span>
                    <span>{LANG_LABELS[l]}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06]"
            >
              {t.signIn}
            </Link>
          </div>
        </div>
      </nav>

      {/* Sovereign Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-16 sm:pt-24 sm:pb-20 max-w-5xl mx-auto text-center">
        {/* Subtle Institutional Tag */}
        <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs text-slate-300 font-medium tracking-wide">{t.badge}</span>
        </div>

        {/* Clean, Non-Gradient High-Impact Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
          <span>{t.landingHeroTitle}</span>
          <span className="block text-slate-300 font-bold text-2xl sm:text-4xl lg:text-5xl mt-2 sm:mt-3">
            {t.landingHeroTitleAccent}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-9">
          {t.landingHeroSubtitle}
        </p>

        {/* Primary CTA & Direct Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/30 border border-indigo-400/20 active:scale-[0.98]"
          >
            <span>{t.landingCta}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white font-medium text-sm sm:text-base px-6 py-3.5 rounded-xl border border-white/[0.08] transition-all"
          >
            <span>{t.signIn}</span>
          </Link>
        </div>

        {/* Trust Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-slate-400 mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            10 წუთი
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <Shield className="h-3.5 w-3.5 text-teal-400" />
            100% ანონიმური
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            ელფოსტის გარეშე
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            მყისიერი ანალიზი
          </span>
        </div>

        {/* Tangible Product Proof Teaser: Live Profile Preview Card */}
        <div className="relative mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0C101A]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-md text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">{t.bigFiveTitle}</h3>
                <p className="text-xs text-slate-400">სამეცნიერო ფსიქომეტრიული ანალიზი</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Demo
              </span>
            </div>
          </div>

          <div className="grid gap-3.5 pt-5 sm:grid-cols-2">
            {demoTraits.map((trait) => (
              <div
                key={trait.name}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-200">{trait.name}</span>
                  <span className="text-xs font-mono font-bold text-slate-300">{trait.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${trait.color}`}
                    style={{ width: `${trait.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{trait.desc}</p>
              </div>
            ))}

            <div className="flex flex-col justify-center items-center p-3.5 rounded-xl bg-indigo-500/[0.04] border border-indigo-500/15 text-center">
              <span className="text-xs font-semibold text-indigo-300 mb-1">გადაწვის რისკის ინდექსი</span>
              <span className="text-2xl font-black text-white font-mono">14% (დაბალი)</span>
              <span className="text-[11px] text-slate-400 mt-1">სტაბილური ემოციური მდგრადობა</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-10 sm:py-14 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8">
          {[
            { value: t.landingStatAssessments, label: t.landingStatAssessmentsLabel, tooltip: t.landingStatAssessmentsTooltip, icon: <Brain className="h-5 w-5 text-indigo-400" /> },
            { value: t.landingStatPrivacy, label: t.landingStatPrivacyLabel, tooltip: t.landingStatPrivacyTooltip, icon: <Shield className="h-5 w-5 text-teal-400" /> },
            { value: t.landingStatAnon, label: t.landingStatAnonLabel, tooltip: t.landingStatAnonTooltip, icon: <Lock className="h-5 w-5 text-amber-400" /> },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              onMouseEnter={() => setHoveredStat(idx)}
              onMouseLeave={() => setHoveredStat(null)}
              className="relative flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer"
            >
              <div className="mb-2">{stat.icon}</div>
              <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums">{stat.value}</span>
              <span className="text-xs sm:text-sm text-slate-400 mt-1 leading-snug">{stat.label}</span>
              {hoveredStat === idx && stat.tooltip && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 bg-[#111624] border border-white/20 rounded-lg px-3 py-2 text-xs text-slate-300 whitespace-nowrap shadow-xl">
                  {stat.tooltip}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="relative z-10 px-6 py-14 sm:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t.landingWhatTitle}</h2>
          <p className="text-sm text-slate-400">{t.landingWhatSubtitle}</p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {[
            { icon: '🧠', text: t.landingWhatItem1 },
            { icon: '🔥', text: t.landingWhatItem2 },
            { icon: '📊', text: t.landingWhatItem3 },
            { icon: '🚀', text: t.landingWhatItem4 },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all">
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
      <section className="relative z-10 px-6 py-14 sm:py-20 max-w-4xl mx-auto">
        <h2 className="text-center text-xl sm:text-3xl font-bold text-white mb-12 tracking-tight">
          {t.landingHowTitle}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <Brain className="h-5 w-5 text-indigo-400" />,
              bg: 'bg-indigo-500/[0.03] border-indigo-500/15',
              num: '01',
              title: t.landingStep1Title,
              desc: t.landingStep1Desc,
            },
            {
              icon: <Lock className="h-5 w-5 text-teal-400" />,
              bg: 'bg-teal-500/[0.03] border-teal-500/15',
              num: '02',
              title: t.landingStep2Title,
              desc: t.landingStep2Desc,
            },
            {
              icon: <Users className="h-5 w-5 text-amber-400" />,
              bg: 'bg-amber-500/[0.03] border-amber-500/15',
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
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
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
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.03] backdrop-blur-sm p-8 hover:bg-indigo-500/[0.07] transition-all"
          >
            <Brain className="h-6 w-6 text-indigo-400" />
            <span className="text-base font-semibold text-white text-center">{t.landingForYouTitle}</span>
            <span className="text-xs text-slate-400 text-center">{t.landingForYouDesc}</span>
          </Link>

          <a
            href="/contact"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-teal-500/20 bg-teal-500/[0.03] backdrop-blur-sm p-8 hover:bg-teal-500/[0.07] transition-all"
          >
            <Building2 className="h-6 w-6 text-teal-400" />
            <span className="text-base font-semibold text-white text-center">{t.landingForTeamTitle}</span>
            <span className="text-xs text-slate-400 text-center">{t.landingForTeamDesc}</span>
          </a>
        </div>
      </section>

      {/* B2B Section */}
      <section className="relative z-10 px-6 py-12 sm:py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
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
              <div key={feature.text} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {feature.icon}
                <span className="text-sm text-white font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 border border-white/[0.15] text-sm"
          >
            {t.b2bCta} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 py-14 sm:py-20 text-center">
        <div className="max-w-md mx-auto">
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/30 border border-indigo-400/20 text-sm"
          >
            {t.landingCta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8 text-center bg-[#07090E]">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
          Ertoba Analytics · {new Date().getFullYear()}
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/privacy" className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors">
            {t.footerPrivacy}
          </Link>
          <span className="text-[10px] text-slate-700">·</span>
          <Link href="/contact" className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors">
            {t.footerContact}
          </Link>
        </div>
      </footer>
    </div>
  )
}
