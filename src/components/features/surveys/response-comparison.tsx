'use client'

import { Check, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { FRAMING_LABEL_KEYS } from '@/lib/framing'
import type { FeedbackResponseItem } from '@/app/actions/dailyFeedback'

export function ResponseComparison({ responses }: { responses: FeedbackResponseItem[] }) {
  const { t } = useLanguage()

  return (
    <div className="space-y-3">
      {responses.map((r) => {
        const matched = r.userFraming === r.modelFraming
        return (
          <div
            key={r.articleId}
            data-testid="response-comparison-row"
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-medium text-white mb-3 leading-relaxed">{r.headline}</p>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-white/5 p-2.5">
                <span className="block text-slate-500 mb-0.5">{t('surveyYouSaid')}</span>
                <span className="text-slate-200 font-medium">{t(FRAMING_LABEL_KEYS[r.userFraming].label)}</span>
              </div>
              <div className="rounded-lg bg-white/5 p-2.5">
                <span className="block text-slate-500 mb-0.5">{t('surveyModelSaid')}</span>
                <span className="text-slate-200 font-medium">{t(FRAMING_LABEL_KEYS[r.modelFraming].label)}</span>
              </div>
            </div>
            <div
              className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                matched ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {matched ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {matched ? 'Match' : 'Different'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
