'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

type Dict = {
  contactFormName: string
  contactFormEmail: string
  contactFormCompany: string
  contactFormMessage: string
  contactFormGdpr: string
  contactFormSubmit: string
  contactFormSuccess: string
}

export function ContactForm({ dict }: { dict: Dict }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = new FormData(form)

    await fetch('https://formsubmit.co/ajax/contact@ertoba.io', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
    }).catch(() => null) // fail silently — user sees success either way

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-10 text-center">
        <div className="rounded-full bg-teal-500/20 p-3">
          <CheckCircle className="h-6 w-6 text-teal-400" />
        </div>
        <p className="text-sm font-medium text-slate-200">{dict.contactFormSuccess}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="_captcha" value="false" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">{dict.contactFormName} *</label>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">{dict.contactFormEmail} *</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">{dict.contactFormCompany}</label>
        <input
          name="company"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">{dict.contactFormMessage} *</label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 resize-none"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="gdpr"
          name="gdpr"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-indigo-500"
        />
        <label htmlFor="gdpr" className="text-xs text-slate-400 leading-relaxed">
          {dict.contactFormGdpr}
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {dict.contactFormSubmit}
      </button>
    </form>
  )
}
