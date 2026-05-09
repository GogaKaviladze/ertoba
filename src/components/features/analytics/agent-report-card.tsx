'use client'

import React from 'react'
import { Newspaper, TrendingUp, Calendar, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import agentReport from '@/data/agent_report.json'

// ── Tactic key mapping ────────────────────────────────────────────────────────

const TACTIC_EMOJI: Record<string, string> = {
  'Card Stacking':  '🃏',
  'Appeal to Fear': '😰',
  'Name Calling':   '🏷️',
  'Demonizing':     '😈',
  'Whataboutism':   '↩️',
  'Loaded Language':'💬',
}

// Maps the English tactic name from the data to translation-key prefixes
const TACTIC_KEY: Record<string, string> = {
  'Card Stacking':  'tactic_CardStacking',
  'Appeal to Fear': 'tactic_AppealToFear',
  'Name Calling':   'tactic_NameCalling',
  'Demonizing':     'tactic_Demonizing',
  'Whataboutism':   'tactic_Whataboutism',
  'Loaded Language':'tactic_LoadedLanguage',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_COLOR = {
  CRITICAL: { color: 'text-red-300',     bg: 'bg-red-500/10 border-red-500/30'        },
  HIGH:     { color: 'text-orange-300',  bg: 'bg-orange-500/10 border-orange-500/30'  },
  MEDIUM:   { color: 'text-yellow-300',  bg: 'bg-yellow-500/10 border-yellow-500/30'  },
  LOW:      { color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/30' },
} as const

function fmtDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function StatBubble({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-center">
      <Icon className="h-4 w-4 text-indigo-400 mb-0.5" />
      <span className="text-xl font-bold text-white leading-none">{value}</span>
      <span className="text-[11px] text-slate-400 leading-tight">{label}</span>
    </div>
  )
}

function SourceBar({ name, count, max }: { name: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs text-slate-300 capitalize font-medium">{name}</span>
      <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs text-slate-400">{count}</span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AgentReportCard() {
  const { t } = useLanguage()

  const report = agentReport
  const riskLevel = (report.risk_level ?? 'LOW') as keyof typeof RISK_COLOR
  const riskStyle = RISK_COLOR[riskLevel] ?? RISK_COLOR.LOW

  // Risk text and sub resolved through t()
  const riskTextKey = `agentRisk${riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()}Text` as const
  const riskSubKey  = `agentRisk${riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()}Sub`  as const

  const totalArticles = report.data_context?.total_articles ?? 0
  const dateFrom = report.data_context?.date_range?.from ?? ''
  const dateTo   = report.data_context?.date_range?.to   ?? ''
  const sources  = report.data_context?.source_distribution ?? {}
  const findings = report.key_findings ?? []

  const dayCount = dateFrom && dateTo
    ? Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86_400_000) + 1
    : 0

  const sortedSources = Object.entries(sources)
    .filter(([name]) => name !== 'other')
    .sort(([, a], [, b]) => b - a)
  const maxCount = sortedSources[0]?.[1] ?? 1

  const updatedAt = report.generated_at
    ? new Date(report.generated_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  return (
    <Card className="border-white/5 bg-white/3 sm:backdrop-blur-md overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-base font-bold text-white">{t('agentScanTitle')}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{t('agentScanSubtitle')}</p>
        </div>
        <div className={`self-start sm:self-auto flex-shrink-0 rounded-xl border px-4 py-2 ${riskStyle.bg}`}>
          <p className={`text-sm font-bold ${riskStyle.color}`}>{t(riskTextKey)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-[220px]">{t(riskSubKey)}</p>
        </div>
      </div>

      <CardContent className="p-5 space-y-6">

        {/* ── At-a-glance numbers ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatBubble icon={Newspaper}  value={totalArticles.toLocaleString()} label={t('agentArticlesLabel')} />
          <StatBubble icon={Calendar}   value={dayCount > 0 ? `${dayCount}` : '—'} label={t('agentDaysLabel')} />
          <StatBubble icon={TrendingUp} value={`${sortedSources.length}`} label={t('agentSourcesLabel')} />
        </div>

        {/* ── Time period ── */}
        {dateFrom && dateTo && (
          <div className="flex justify-center" data-testid="zeitraum-badge">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-slate-200">
              <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>
                {t('agentAnalysisPeriod')}{' '}
                <span className="text-white font-semibold">{fmtDate(dateFrom)}</span>
                {' '}{t('agentAnalysisPeriodTo')}{' '}
                <span className="text-white font-semibold">{fmtDate(dateTo)}</span>
              </span>
            </div>
          </div>
        )}

        {/* ── Influence tactics ── */}
        {findings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-white">{t('agentTacticsTitle')}</h4>
              <span className="text-[10px] text-slate-500 bg-white/5 rounded px-1.5 py-0.5">{t('agentTacticsTag')}</span>
            </div>
            <div className="space-y-2">
              {findings.map((tactic) => {
                const keyPrefix = TACTIC_KEY[tactic]
                const name = keyPrefix ? t(keyPrefix) : tactic
                const desc = keyPrefix ? t(`${keyPrefix}_desc`) : ''
                return (
                  <div
                    key={tactic}
                    className="flex items-start gap-3 rounded-lg bg-white/4 border border-white/6 px-3 py-2.5"
                  >
                    <span className="text-lg leading-none mt-0.5">{TACTIC_EMOJI[tactic] ?? '📌'}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{name}</p>
                      {desc && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Source breakdown ── */}
        {sortedSources.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">{t('agentSourcesTitle')}</h4>
            <p className="text-xs text-slate-400 mb-3">{t('agentSourcesSub')}</p>
            <div className="space-y-2">
              {sortedSources.map(([name, count]) => (
                <SourceBar key={name} name={name} count={count} max={maxCount} />
              ))}
            </div>
          </div>
        )}

        {/* ── Anomaly notice ── */}
        {(report.data_context?.anomalies?.length ?? 0) > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-300 mb-1">{t('agentDataQualityNote')}</p>
              <ul className="space-y-0.5">
                {report.data_context!.anomalies!.map((a, i) => (
                  <li key={i} className="text-xs text-amber-200/70">{a}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
          <Info className="h-3 w-3 text-slate-600 shrink-0" />
          <p className="text-[11px] text-slate-500">
            {t('agentAutoAnalysed')} · {t('agentLastUpdated')} {updatedAt} · {t('agentDisclaimer')}
          </p>
        </div>

      </CardContent>
    </Card>
  )
}
