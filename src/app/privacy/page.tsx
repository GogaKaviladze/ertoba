import { cookies } from 'next/headers'
import { getDictionary, isLanguage } from '@/lib/i18n/dictionaries'
import { Hexagon } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Ertoba',
  description: 'How Ertoba Analytics collects, uses, and protects your personal data.',
}

export default async function PrivacyPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('ertoba_lang')?.value
  const language = isLanguage(rawLang) ? rawLang : 'ka'
  const t = getDictionary(language)

  const sections = [
    { title: t.privacySection1Title, body: t.privacySection1Body },
    { title: t.privacySection2Title, body: t.privacySection2Body },
    { title: t.privacySection3Title, body: t.privacySection3Body },
    { title: t.privacySection4Title, body: t.privacySection4Body },
    { title: t.privacySection5Title, body: t.privacySection5Body },
    { title: t.privacySection6Title, body: t.privacySection6Body },
    { title: t.privacySection7Title, body: t.privacySection7Body },
    { title: t.privacySection8Title, body: t.privacySection8Body },
  ]

  return (
    <div className="relative isolate min-h-screen bg-[#050505] px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <Hexagon className="h-7 w-7 text-indigo-500" />
          <span className="font-bold text-xl tracking-tight text-white">Ertoba<span className="text-indigo-400">.</span></span>
        </Link>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-white">{t.privacyPageTitle}</h1>
        <p className="mb-10 text-sm text-slate-400 leading-relaxed">{t.privacyIntro}</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">{section.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-[10px] text-slate-600 uppercase tracking-widest">
          Last updated: April 2026
        </p>

        <div className="mt-8 flex gap-4">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Home</Link>
          <Link href="/impressum" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{t.footerImprint}</Link>
        </div>
      </div>
    </div>
  )
}
