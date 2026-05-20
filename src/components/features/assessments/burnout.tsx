'use client'

import React, { useState } from 'react'
import { HeartPulse, RefreshCcw, AlertTriangle, Coins, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { saveAssessmentResult } from '@/app/actions/assessments'

// Questions: ee = emotional exhaustion (reversed for PA)
// dp = depersonalization, pa = personal accomplishment (reversed scoring)
const QUESTIONS_META = [
  { id: 1, dimension: 'ee', key: 'q_bo_1', reversed: false },
  { id: 2, dimension: 'ee', key: 'q_bo_2', reversed: false },
  { id: 3, dimension: 'ee', key: 'q_bo_3', reversed: false },
  { id: 4, dimension: 'ee', key: 'q_bo_4', reversed: false },
  { id: 5, dimension: 'ee', key: 'q_bo_5', reversed: false },
  { id: 6, dimension: 'dp', key: 'q_bo_6', reversed: false },
  { id: 7, dimension: 'dp', key: 'q_bo_7', reversed: false },
  { id: 8, dimension: 'pa', key: 'q_bo_8', reversed: true },
  { id: 9, dimension: 'pa', key: 'q_bo_9', reversed: true },
  { id: 10, dimension: 'pa', key: 'q_bo_10', reversed: true },
] as const

const FREQUENCY_STEPS = [
  { key: 'burnoutNever', value: 0 },
  { key: 'burnoutRarely', value: 1 },
  { key: 'burnoutSometimes', value: 2 },
  { key: 'burnoutOften', value: 3 },
  { key: 'burnoutAlways', value: 4 },
] as const

export type BurnoutScores = {
  emotionalExhaustion: number
  depersonalization: number
  personalAccomplishment: number
  overallRisk: number
}

type Props = {
  initialScores?: BurnoutScores | null
}

function getRiskLevel(score: number): 'low' | 'moderate' | 'high' {
  if (score < 35) return 'low'
  if (score < 65) return 'moderate'
  return 'high'
}

function getRiskColor(level: 'low' | 'moderate' | 'high') {
  if (level === 'low') return 'text-emerald-400'
  if (level === 'moderate') return 'text-yellow-400'
  return 'text-rose-400'
}

function getRiskBg(level: 'low' | 'moderate' | 'high') {
  if (level === 'low') return 'from-emerald-500/10 to-teal-500/10'
  if (level === 'moderate') return 'from-yellow-500/10 to-orange-500/10'
  return 'from-rose-500/10 to-red-500/10'
}

export function Burnout({ initialScores = null }: Props) {
  const { t } = useLanguage()

  const [scores, setScores] = useState<BurnoutScores | null>(initialScores)
  const [isTakingTest, setIsTakingTest] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedValue, setSelectedValue] = useState<number | null>(null)

  const handleAnswer = (value: number) => {
    setSelectedValue(value)
    setAnswers(prev => ({ ...prev, [QUESTIONS_META[currentStep].id]: value }))
  }

  const startTest = () => {
    setIsTakingTest(true)
    setCurrentStep(0)
    setAnswers({})
    setSelectedValue(null)
  }

  const nextStep = () => {
    if (currentStep < QUESTIONS_META.length - 1) {
      setCurrentStep(prev => prev + 1)
      const nextId = QUESTIONS_META[currentStep + 1].id
      setSelectedValue(answers[nextId] ?? null)
    } else {
      finishTest()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      const prevId = QUESTIONS_META[currentStep - 1].id
      setSelectedValue(answers[prevId] ?? null)
    }
  }

  const finishTest = async () => {
    setIsSubmitting(true)

    const raw: Record<string, number[]> = { ee: [], dp: [], pa: [] }

    QUESTIONS_META.forEach(q => {
      const raw_value = answers[q.id] ?? 2
      // Reversed items: higher answer = lower burnout risk
      const scored = q.reversed ? 4 - raw_value : raw_value
      raw[q.dimension].push(scored)
    })

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const toPercent = (val: number) => (val / 4) * 100

    const ee = toPercent(avg(raw.ee))
    const dp = toPercent(avg(raw.dp))
    // PA is already reversed so lower remaining = lower accomplishment = higher risk
    const pa = toPercent(avg(raw.pa))

    // Overall risk: EE and DP raise risk, low PA raises risk
    const overallRisk = (ee * 0.45 + dp * 0.3 + pa * 0.25)

    const newScores: BurnoutScores = {
      emotionalExhaustion: ee,
      depersonalization: dp,
      personalAccomplishment: 100 - pa,
      overallRisk,
    }

    try {
      await saveAssessmentResult('Burnout', newScores, 30)
      setScores(newScores)
      setIsTakingTest(false)
    } catch (error) {
      console.error('Failed to save burnout assessment', error)
      alert('Login to save your results!')
      setScores(newScores)
      setIsTakingTest(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isTakingTest) {
    const q = QUESTIONS_META[currentStep]
    const progress = ((currentStep + 1) / QUESTIONS_META.length) * 100
    const currentAnswer = answers[q.id]

    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Disclaimer */}
        <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
          {t('burnoutDisclaimer')}
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>{currentStep + 1} / {QUESTIONS_META.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1 bg-white/10" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-white/10 bg-black/40 backdrop-blur-xl mb-6">
              <CardContent className="pt-10 pb-10 px-8 text-center">
                <h3 className="text-xl font-medium text-white mb-10 leading-relaxed">
                  {t(q.key)}
                </h3>

                <div className="flex justify-center gap-2 flex-wrap">
                  {FREQUENCY_STEPS.map(step => (
                    <button
                      key={step.key}
                      onClick={() => handleAnswer(step.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        selectedValue === step.value
                          ? 'bg-rose-500/30 border-rose-400 text-rose-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {t(step.key)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {t('back')}
          </Button>
          <Button
            onClick={nextStep}
            disabled={currentAnswer === undefined || isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white min-w-[120px]"
          >
            {isSubmitting
              ? '...'
              : currentStep === QUESTIONS_META.length - 1
              ? t('calculateResults')
              : t('next')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (scores) {
    const risk = getRiskLevel(scores.overallRisk)
    const riskColor = getRiskColor(risk)
    const riskBg = getRiskBg(risk)

    const dimensions = [
      { key: 'burnoutEmotionalExhaustion', value: scores.emotionalExhaustion },
      { key: 'burnoutDepersonalization', value: scores.depersonalization },
      { key: 'burnoutPersonalAccomplishment', value: scores.personalAccomplishment },
    ]

    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        {/* Disclaimer banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 leading-relaxed space-y-1">
          <p>{t('burnoutDisclaimer')}</p>
          <p className="font-medium">{t('burnoutUrgentHelp')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk overview */}
          <Card className={`border-white/10 bg-gradient-to-br ${riskBg} backdrop-blur-xl`}>
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-rose-400" />
                {t('burnoutScoreLabel')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className={`text-6xl font-black mb-2 ${riskColor}`}>
                  {Math.round(scores.overallRisk)}
                </div>
                <div className={`text-lg font-semibold ${riskColor}`}>
                  {t(`burnoutResult${risk.charAt(0).toUpperCase() + risk.slice(1)}`)}
                </div>
              </div>
              <Progress value={scores.overallRisk} className="h-2 bg-white/10" />
              <p className="text-sm text-slate-400 leading-relaxed">
                {t(`burnoutResult${risk.charAt(0).toUpperCase() + risk.slice(1)}Desc`)}
              </p>
              <div className="pt-2 flex items-center gap-2 text-yellow-400 font-bold">
                <Coins className="h-5 w-5" />
                {initialScores ? t('profileAssessmentCompleted') : '+30 ERTC'}
              </div>
            </CardContent>
          </Card>

          {/* Dimensions */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">{t('analysis')}</CardTitle>
              <CardDescription className="text-slate-400">{t('burnoutDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {dimensions.map(dim => (
                <div key={dim.key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-200">{t(dim.key)}</span>
                    <span className="text-rose-400 font-bold">{Math.round(dim.value)}%</span>
                  </div>
                  <Progress value={dim.value} className="h-1.5 bg-white/5" />
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={startTest}
                className="text-rose-400 hover:text-rose-300 mt-2"
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> {t('retake')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Disclaimer before test */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 leading-relaxed space-y-1">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p>{t('burnoutDisclaimer')}</p>
            <p className="font-medium mt-1">{t('burnoutUrgentHelp')}</p>
          </div>
        </div>
      </div>

      <Card className="border-white/10 bg-gradient-to-br from-rose-500/10 to-orange-500/10 backdrop-blur-xl overflow-hidden py-12">
        <CardContent className="flex flex-col items-center text-center">
          <div className="p-4 bg-rose-500/20 rounded-2xl mb-6">
            <HeartPulse className="h-12 w-12 text-rose-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-4">{t('burnoutTitle')}</CardTitle>
          <CardDescription className="text-slate-400 max-w-lg mb-8 text-base">
            {t('burnoutDesc')}
          </CardDescription>
          <Button
            size="lg"
            onClick={startTest}
            className="bg-rose-600 hover:bg-rose-700 text-white px-10 rounded-full font-semibold shadow-xl hover:shadow-rose-500/20 transition-all hover:scale-105"
          >
            {t('startAssessment')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
