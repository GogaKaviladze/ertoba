import { cookies } from 'next/headers'
import { getDictionary, isLanguage } from '@/lib/i18n/dictionaries'
import { Hexagon } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum | Ertoba',
  description: 'Angaben gemäß § 5 TMG — Ertoba Analytics / Anthronode.io',
}

export default async function ImpressumPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('ertoba_lang')?.value
  const language = isLanguage(rawLang) ? rawLang : 'ka'
  const d = getDictionary(language)

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

        <h1 className="mb-10 text-3xl font-bold tracking-tight text-white">{d.imprintPageTitle}</h1>

        <div className="space-y-8">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">Angaben gemäß § 5 TMG</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Anthronode.io<br />
              Goga Kaviladze<br />
              [Adresse wird ergänzt]<br />
              Deutschland
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">Kontakt</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              E-Mail: hello@anthronode.io
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Goga Kaviladze<br />
              hello@anthronode.io
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">Haftungsausschluss</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">English Note</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This imprint page is required by German law (§ 5 TMG). The responsible entity for Ertoba Analytics is Anthronode.io. For inquiries, contact hello@anthronode.io.
            </p>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Home</Link>
          <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{d.footerPrivacy}</Link>
        </div>
      </div>
    </div>
  )
}
