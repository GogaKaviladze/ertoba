import { cookies } from 'next/headers'
import { getDictionary, isLanguage } from '@/lib/i18n/dictionaries'
import { ContactForm } from '@/components/features/contact/ContactForm'
import { Hexagon } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Contact | Ertoba',
  description: 'Get in touch about team assessments, B2B plans, or partnerships.',
}

export default async function ContactPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('ertoba_lang')?.value
  const language = isLanguage(rawLang) ? rawLang : 'ka'
  const d = getDictionary(language)

  return (
    <div className="relative isolate min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_transparent_40%)]" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-2">
          <Hexagon className="h-7 w-7 text-indigo-500" />
          <span className="font-bold text-xl tracking-tight text-white">Ertoba<span className="text-indigo-400">.</span></span>
        </Link>

        <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">{d.contactPageTitle}</h1>
        <p className="mb-8 text-sm text-slate-400">contact@ertoba.info</p>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
          <ContactForm dict={{
            contactFormName: d.contactFormName,
            contactFormEmail: d.contactFormEmail,
            contactFormCompany: d.contactFormCompany,
            contactFormMessage: d.contactFormMessage,
            contactFormGdpr: d.contactFormGdpr,
            contactFormSubmit: d.contactFormSubmit,
            contactFormSuccess: d.contactFormSuccess,
          }} />
        </div>
      </div>
    </div>
  )
}
