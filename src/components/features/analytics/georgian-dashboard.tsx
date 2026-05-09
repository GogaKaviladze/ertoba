'use client'

import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Globe2, AlertTriangle, Info, BookOpen, Fingerprint, Loader2, ExternalLink, Sparkles, Shield, Brain, Users } from 'lucide-react'
import { getHeadlinesByFraming } from '@/app/actions/analytics'
import data from '@/data/georgian_thesis_trends.json'

const COLOR_MAP: Record<string, string> = {
  'როგორ გვთრგუნავენ': '#ef4444', // Red (Psychological -> Danger)
  'როგორ გვზღუდავენ': '#3b82f6', // Blue (Institutional -> Authority)
  'გავლენები და ეკლესია': '#f59e0b', // Amber (Geopolitical)
  'როგორ გვყოფენ': '#10b981', // Emerald (Societal)
  'სხვა / ნეიტრალური': '#8b5cf6' // Purple
}

type PieLabelProps = {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}

type Headline = {
  id: string
  headline: string | null
  sourcePublisher: string | null
  publishedAt: Date | null
  url: string | null
  framingScore: number | null
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx = 0, cy = 0, midAngle, innerRadius = 0, outerRadius = 0, percent = 0 }: PieLabelProps) => {
  if (midAngle === undefined) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] sm:text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function GeorgianAnalyticsDashboard() {
  const { t, language } = useLanguage();

  const framingKeyMap: Record<string, string> = {
    'როგორ გვთრგუნავენ': 'howTheySuppressUs',
    'როგორ გვზღუდავენ': 'howTheyRestrictUs',
    'გავლენები და ეკლესია': 'influencesAndChurch',
    'როგორ გვყოფენ': 'howTheyDivideUs',
    'სხვა / ნეიტრალური': 'otherNeutral'
  };

  const translatedCategories = React.useMemo(() => {
    const result: Record<string, string> = {}
    data.category_mentions.forEach(item => {
      result[item.name] = t(framingKeyMap[item.name] || item.name)
    })
    return result
  }, [language, t]);

  const getTranslatedCategory = (name: string) => {
    return translatedCategories[name] || name
  };

  const [selectedFraming, setSelectedFraming] = useState<string | null>(null);
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categoryMentions = [...data.category_mentions].sort((a, b) => b.value - a.value);
  const dominantFraming = [...data.dominant_framing].sort((a, b) => b.value - a.value);
  const topThreeSignals = categoryMentions.slice(0, 3);
  const strongestSignal = categoryMentions[0];

  const copy = {
    ka: {
      pulseTitle: 'დღევანდელი სურათი ერთ წინადადებაში',
      pulseSubtitle: strongestSignal
        ? `${getTranslatedCategory(strongestSignal.name)} ყველაზე ხშირად გვხვდება.`
        : 'მონაცემები იტვირთება.',
      pulseBody: 'ეს დაფა აჩვენებს რა ტაქტიკით მუშაობს ნარატივი: შეზღუდვა, შიში, გაყოფა თუ გეოპოლიტიკური გავლენა.',
      readTitle: 'როგორ წავიკითხოთ ეს გვერდი?',
      steps: [
        'შეხედე Top-3 სიგნალებს ქვემოთ - ეს არის მთავარი ზეწოლის თემები.',
        'გრაფიკზე დააჭირე კატეგორიას - ნახავ რეალურ სტატიებს.',
        'სიტყვების ბლოკში გადაამოწმე რომელი ფრაზები მეორდება ყველაზე ხშირად.',
      ],
      topSignal: 'Top სიგნალები',
      mentions: 'ხსენება',
      clickHint: 'დააჭირე ფერს, რომ ნახო რეალური მაგალითები',
    },
    en: {
      pulseTitle: 'The Story In One Sentence',
      pulseSubtitle: strongestSignal
        ? `${getTranslatedCategory(strongestSignal.name)} appears most often.`
        : 'Data is loading.',
      pulseBody: 'This dashboard shows how narratives operate: institutional pressure, fear, division, or geopolitical influence.',
      readTitle: 'How to read this page',
      steps: [
        'Start with the Top-3 signals below; they are the strongest pressure themes.',
        'Click a category on a chart to open real article examples.',
        'Use the keyword blocks to see which phrases repeat the most.',
      ],
      topSignal: 'Top Signals',
      mentions: 'mentions',
      clickHint: 'Click a color to open real examples',
    },
    de: {
      pulseTitle: 'Die Lage in einem Satz',
      pulseSubtitle: strongestSignal
        ? `${getTranslatedCategory(strongestSignal.name)} kommt am häufigsten vor.`
        : 'Daten werden geladen.',
      pulseBody: 'Das Dashboard zeigt, mit welchen Mustern Narrative wirken: institutioneller Druck, Angst, Spaltung oder geopolitischer Einfluss.',
      readTitle: 'So liest du diese Seite',
      steps: [
        'Starte mit den Top-3 Signalen unten - das sind die stärksten Druckthemen.',
        'Klicke eine Kategorie im Chart, um reale Artikelbeispiele zu sehen.',
        'Prüfe im Wortblock, welche Begriffe sich am häufigsten wiederholen.',
      ],
      topSignal: 'Top-Signale',
      mentions: 'Erwähnungen',
      clickHint: 'Klicke auf eine Farbe für reale Beispiele',
    },
  }[language];

  const handleDrillDown = async (framing: string) => {
    setSelectedFraming(framing);
    setIsLoading(true);
    setErrorMsg(null);
    const result = await getHeadlinesByFraming(framing, 5);
    if (result.success && result.data) {
      setHeadlines(result.data);
    } else {
      setHeadlines([]);
      setErrorMsg(result.error || "Failed to fetch data");
    }
    setIsLoading(false);
  };
  const customTooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Narrative Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/50 p-5 sm:p-6 shadow-xl">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.pulseTitle}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{copy.pulseSubtitle}</h2>
            <p className="max-w-2xl text-sm text-slate-300 leading-relaxed">{copy.pulseBody}</p>
            <p className="text-xs text-slate-400">{copy.clickHint}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-300">{copy.topSignal}</h3>
            <div className="space-y-3">
              {topThreeSignals.map((item) => {
                const maxValue = strongestSignal?.value || 1;
                const width = Math.max(8, Math.round((item.value / maxValue) * 100));
                return (
                  <button
                    key={item.name}
                    onClick={() => handleDrillDown(item.name)}
                    className="w-full text-left"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-100 truncate">{getTranslatedCategory(item.name)}</span>
                      <span className="text-slate-400">{item.value.toLocaleString()} {copy.mentions}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${width}%`, backgroundColor: COLOR_MAP[item.name] || '#64748b' }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reading Guide */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {copy.steps.map((step, idx) => (
          <div key={step} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">{idx + 1}</div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      {/* Methodology Explanation */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl mb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
            <Info className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{t('methodologyTitle')}</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t('methodologyDesc')}
        </p>
      </div>

      {/* Mobile-First Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="p-2 w-fit rounded-lg bg-blue-500/20 mb-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">{t('dashboardAnalysis')}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{data.total_articles.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="p-2 w-fit rounded-lg bg-red-500/20 mb-2">
              <Shield className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">{t('howTheyRestrictUs')}</p>
            <p className="text-[8px] sm:text-[10px] text-slate-500 mt-0.5 normal-case tracking-normal">{t('howTheyRestrictUsSub')}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {data.category_mentions.find(c => c.name === 'როგორ გვზღუდავენ')?.value.toLocaleString() || 0}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="p-2 w-fit rounded-lg bg-amber-500/20 mb-2">
              <Brain className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">{t('howTheySuppressUs')}</p>
            <p className="text-[8px] sm:text-[10px] text-slate-500 mt-0.5 normal-case tracking-normal">{t('howTheySuppressUsSub')}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {data.category_mentions.find(c => c.name === 'როგორ გვთრგუნავენ')?.value.toLocaleString() || 0}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="p-2 w-fit rounded-lg bg-emerald-500/20 mb-2">
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">{t('howTheyDivideUs')}</p>
            <p className="text-[8px] sm:text-[10px] text-slate-500 mt-0.5 normal-case tracking-normal">{t('howTheyDivideUsSub')}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {data.category_mentions.find(c => c.name === 'როგორ გვყოფენ')?.value.toLocaleString() || 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bar Chart - Responsive height */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Fingerprint className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">{t('whatTactics')}</h2>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_mentions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tickFormatter={getTranslatedCategory} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={customTooltipStyle} 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  labelFormatter={(value) => getTranslatedCategory(value as string)}
                />
                <Bar dataKey="value" name={t('amount')} radius={[4, 4, 0, 0]}>
                  {data.category_mentions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLOR_MAP[entry.name] || '#64748b'} 
                      fillOpacity={0.8}
                      onClick={() => handleDrillDown(entry.name)}
                      style={{ cursor: 'pointer' }}
                      className="hover:opacity-100 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Responsive */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Globe2 className="h-5 w-5 text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">{t('mainMessage')}</h2>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.dominant_framing.map(d => ({ ...d, translatedName: getTranslatedCategory(d.name) }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="90%"
                  innerRadius="50%"
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="translatedName"
                  strokeWidth={0}
                >
                  {data.dominant_framing.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLOR_MAP[entry.name] || '#64748b'} 
                      fillOpacity={0.8}
                      onClick={() => handleDrillDown(entry.name)}
                      style={{ cursor: 'pointer', outline: 'none' }}
                      className="hover:opacity-100 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {dominantFraming[0] && (
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-200">{t('mainMessage')}:</span>{' '}
              {getTranslatedCategory(dominantFraming[0].name)} ({dominantFraming[0].value.toLocaleString()})
            </p>
          )}
        </div>
      </div>

      {/* Dynamic Drill-Down Section */}
      {selectedFraming && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('realExamples')} <span className="text-indigo-400">{getTranslatedCategory(selectedFraming)}</span></h2>
                <p className="text-xs text-slate-400 mt-1">{t('evidenceSub')}</p>
              </div>
            </div>
            <button onClick={() => setSelectedFraming(null)} className="text-sm text-slate-400 hover:text-white transition-colors">{t('close')}</button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-medium text-slate-400 tracking-widest uppercase">{t('loading')}</p>
            </div>
          ) : headlines.length > 0 ? (
            <div className="grid gap-3">
              {headlines.map((article) => (
                <div key={article.id} className="group flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-sm font-semibold text-white line-clamp-2 break-words mb-1" title={article.headline ?? undefined}>{article.headline}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-amber-500/80">{article.sourcePublisher}</span>
                      <span>•</span>
                      <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  {article.url && (
                    <a href={article.url} target="_blank" rel="noreferrer" className="mt-3 sm:mt-0 flex items-center justify-center p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              {errorMsg ? (
                <div className="space-y-3">
                  <p className="text-red-400 font-medium">{errorMsg}</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Tip: Ensure the <code className="text-indigo-400">DATABASE_URL</code> environment variable is set in your Vercel project settings and that Prisma is generated.
                  </p>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">{t('noDataFound')}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Keywords - Scrolling on mobile */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
         <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-pink-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">{t('frequentWords')}</h2>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mb-5 leading-relaxed">
            ⚖️ {t('logScaleHint')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {Object.entries(data.top_keywords).map(([category, keywords]) => {
               const maxVal = Math.max(...keywords.map(k => k.value));
               const logMaxVal = Math.log(maxVal + 1);
               return (
               <div key={category} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                 <h3 className="text-xs font-bold text-slate-400 mb-4 border-b border-white/5 pb-2 flex items-center justify-between uppercase tracking-widest">
                   {getTranslatedCategory(category)}
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_MAP[category] || '#64748b' }}></div>
                 </h3>
                 <div className="space-y-4">
                   {keywords.map((kw) => {
                     const pct = maxVal > 0 ? (Math.log(kw.value + 1) / logMaxVal) * 100 : 0;
                     return (
                       <div key={kw.name} className="group cursor-default">
                         <div className="flex justify-between text-xs mb-1.5 font-medium">
                           <span className="text-slate-200 group-hover:text-white transition-colors">{t(kw.name)}</span>
                           <span className="text-slate-500">{kw.value.toLocaleString()}</span>
                         </div>
                         <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                           <div 
                             className="h-full rounded-full transition-all duration-500 ease-out" 
                             style={{ width: `${pct}%`, backgroundColor: COLOR_MAP[category] || '#64748b' }}
                           ></div>
                         </div>
                       </div>
                     )
                   })}
                 </div>
               </div>
               )
            })}
          </div>
      </div>
    </div>
  )
}
