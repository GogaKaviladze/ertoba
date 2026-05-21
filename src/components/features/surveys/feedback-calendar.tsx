'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getMonthFeedback } from '@/app/actions/dailyFeedback'
import { ResponseComparison } from './response-comparison'
import type { FeedbackResponseItem } from '@/app/actions/dailyFeedback'

type MonthRecord = {
  id: string
  surveyDate: string | Date
  responses: FeedbackResponseItem[]
  matchCount: number
}

const LOCALE_MAP: Record<string, string> = { ka: 'ka-GE', en: 'en-US', de: 'de-DE' }

export function FeedbackCalendar() {
  const { t, language } = useLanguage()
  const now = new Date()
  const [view, setView] = useState({ year: now.getUTCFullYear(), month: now.getUTCMonth() })
  const [records, setRecords] = useState<MonthRecord[]>([])
  const [selected, setSelected] = useState<MonthRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    setSelected(null)
    getMonthFeedback(view.year, view.month)
      .then((rows) => {
        if (active) setRecords(rows as unknown as MonthRecord[])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [view])

  const locale = LOCALE_MAP[language] ?? 'en-US'
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(view.year, view.month, 1)))

  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
  const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay()

  const byDay = new Map<number, MonthRecord>()
  for (const r of records) {
    byDay.set(new Date(r.surveyDate).getUTCDate(), r)
  }

  const isCurrentMonth = view.year === now.getUTCFullYear() && view.month === now.getUTCMonth()
  const todayDate = now.getUTCDate()

  const changeMonth = (delta: number) => {
    setView((v) => {
      const d = new Date(Date.UTC(v.year, v.month + delta, 1))
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() }
    })
  }

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="space-y-6" data-testid="feedback-calendar">
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} data-testid="calendar-prev">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-white capitalize">{monthLabel}</span>
            <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} data-testid="calendar-next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />
              const record = byDay.get(day)
              const completed = Boolean(record)
              const isToday = isCurrentMonth && day === todayDate
              return (
                <button
                  key={day}
                  type="button"
                  disabled={!completed}
                  onClick={() => record && setSelected(record)}
                  data-testid={completed ? 'calendar-day-completed' : 'calendar-day'}
                  className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    completed
                      ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40 hover:bg-teal-500/30 cursor-pointer'
                      : 'bg-white/5 text-slate-600'
                  } ${isToday && !completed ? 'ring-1 ring-white/30' : ''}`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <p className="mt-4 text-xs text-slate-400" data-testid="calendar-completed-count">
            {t('surveyCalendarCompletedLabel')} <span className="text-white font-semibold">{records.length}</span>
          </p>
        </CardContent>
      </Card>

      {selected ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            {t('surveyResultMatchLabel')}{' '}
            <span className="text-white font-bold">
              {selected.matchCount}/{selected.responses.length}
            </span>
          </p>
          <ResponseComparison responses={selected.responses} />
        </div>
      ) : (
        <p className="text-sm text-slate-500" data-testid="calendar-hint">
          {loading
            ? t('loading')
            : records.length === 0
              ? t('surveyCalendarNoData')
              : t('surveyCalendarSelectDay')}
        </p>
      )}
    </div>
  )
}
