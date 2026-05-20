'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { FRAMINGS, FRAMING_LABEL_KEYS, type Framing } from '@/lib/framing'
import { submitDailyFeedback, type SurveyHeadline, type FeedbackResponseItem } from '@/app/actions/dailyFeedback'
import { DailyResult } from './daily-result'

type Props = { headlines: SurveyHeadline[] }

export function DailySurvey({ headlines }: Props) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Framing>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ responses: FeedbackResponseItem[]; matchCount: number } | null>(null)

  if (result) {
    return <DailyResult responses={result.responses} matchCount={result.matchCount} alreadyDone={false} />
  }

  const headline = headlines[step]
  const progress = ((step + 1) / headlines.length) * 100
  const currentAnswer = answers[headline.articleId]
  const isLast = step === headlines.length - 1

  const choose = (framing: Framing) => {
    setAnswers((prev) => ({ ...prev, [headline.articleId]: framing }))
  }

  const next = async () => {
    if (!currentAnswer) return
    if (!isLast) {
      setStep((s) => s + 1)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const picks = headlines.map((h) => ({
        articleId: h.articleId,
        userFraming: answers[h.articleId] as Framing,
      }))
      const res = await submitDailyFeedback(picks)
      setResult({ responses: res.responses, matchCount: res.matchCount })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto" data-testid="daily-survey-form">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>
            Headline {step + 1} of {headlines.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1 bg-white/10" />
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl mb-6">
        <CardContent className="p-8">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
            {headline.sourcePublisher ?? 'Unknown source'}
          </p>
          <h3 className="text-xl font-medium text-white mb-2 leading-relaxed">{headline.headline}</h3>
          <p className="text-sm text-slate-400 mb-6">{t('surveyQuestionPrompt')}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {FRAMINGS.map((framing) => {
              const selected = currentAnswer === framing
              return (
                <button
                  key={framing}
                  type="button"
                  data-testid={`survey-framing-option-${framing}`}
                  onClick={() => choose(framing)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-500/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-sm font-semibold text-white mb-1">
                    {t(FRAMING_LABEL_KEYS[framing].label)}
                  </span>
                  <span className="block text-xs text-slate-400 leading-relaxed">
                    {t(FRAMING_LABEL_KEYS[framing].desc)}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-400 mb-4" data-testid="survey-error">
          {error}
        </p>
      )}

      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="text-slate-400 hover:text-white"
          data-testid="survey-back-button"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <Button
          onClick={next}
          disabled={!currentAnswer || submitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
          data-testid="survey-next-button"
        >
          {submitting ? t('surveySubmitting') : isLast ? t('surveySubmit') : t('next')}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
