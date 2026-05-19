import Link from 'next/link'
import { type Language } from '@/lib/i18n/dictionaries'

interface FooterProps {
  language?: Language
  privacyLabel?: string
  imprintLabel?: string
}

export function Footer({ privacyLabel = 'Privacy Policy', imprintLabel = 'Imprint' }: FooterProps) {
  return (
    <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center">
      <p className="text-[10px] text-slate-600 uppercase tracking-widest">
        Ertoba Analytics · {new Date().getFullYear()}
      </p>
      <div className="mt-2 flex items-center justify-center gap-4">
        <Link href="/privacy" className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">
          {privacyLabel}
        </Link>
        <span className="text-[10px] text-slate-700">·</span>
        <Link href="/impressum" className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">
          {imprintLabel}
        </Link>
      </div>
    </footer>
  )
}
