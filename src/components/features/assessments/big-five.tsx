'use client'

import React, { useState } from 'react'
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts'
import { Brain, RefreshCcw, Activity, Coins, ChevronRight, ChevronLeft, Building2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { saveAssessmentResult } from '@/app/actions/assessments'

const QUESTIONS_META = [
  { id: 1, trait: 'extraversion', key: 'q_b5_1' },
  { id: 2, trait: 'agreeableness', key: 'q_b5_2' },
  { id: 3, trait: 'conscientiousness', key: 'q_b5_3' },
  { id: 4, trait: 'neuroticism', key: 'q_b5_4' },
  { id: 5, trait: 'openness', key: 'q_b5_5' },
  { id: 6, trait: 'extraversion', key: 'q_b5_6' },
  { id: 7, trait: 'agreeableness', key: 'q_b5_7' },
  { id: 8, trait: 'conscientiousness', key: 'q_b5_8' },
  { id: 9, trait: 'neuroticism', key: 'q_b5_9' },
  { id: 10, trait: 'openness', key: 'q_b5_10' },
  { id: 11, trait: 'extraversion', key: 'q_b5_11' },
  { id: 12, trait: 'agreeableness', key: 'q_b5_12' },
  { id: 13, trait: 'conscientiousness', key: 'q_b5_13' },
  { id: 14, trait: 'neuroticism', key: 'q_b5_14' },
  { id: 15, trait: 'openness', key: 'q_b5_15' },
]

type BigFiveScores = {
  extraversion: number
  agreeableness: number
  conscientiousness: number
  neuroticism: number
  openness: number
}

export type { BigFiveScores }

type Props = {
  initialScores?: BigFiveScores | null
}

export function BigFive({ initialScores = null }: Props) {
  const { t } = useLanguage()

  const [scores, setScores] = useState<BigFiveScores | null>(initialScores)
  const [isTakingTest, setIsTakingTest] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswer = (val: number | number[] | readonly number[]) => {
    const value = Array.isArray(val) ? val[0] : val
    setAnswers(prev => ({ ...prev, [QUESTIONS_META[currentStep].id]: value as number }))
  }

  const nextStep = () => {
    if (currentStep < QUESTIONS_META.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      finishTest()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const finishTest = async () => {
    setIsSubmitting(true)
    const raw: Record<string, number[]> = {
      extraversion: [], agreeableness: [], conscientiousness: [], neuroticism: [], openness: []
    }

    QUESTIONS_META.forEach(q => {
      const val = answers[q.id] || 3
      raw[q.trait].push(val)
    })

    const calcScore = (arr: number[]) => {
      const sum = arr.reduce((a, b) => a + b, 0)
      return (sum / (arr.length * 5)) * 100
    }

    const newScores = {
      extraversion: calcScore(raw.extraversion),
      agreeableness: calcScore(raw.agreeableness),
      conscientiousness: calcScore(raw.conscientiousness),
      neuroticism: calcScore(raw.neuroticism),
      openness: calcScore(raw.openness),
    }

    try {
      await saveAssessmentResult('BigFive', newScores, 50)
      setScores(newScores)
      setIsTakingTest(false)
    } catch (error) {
      console.error('Failed to save assessment', error)
      alert('Login to save your results!')
      setScores(newScores)
      setIsTakingTest(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const chartData = scores ? [
    { subject: t('openness'), A: scores.openness, fullMark: 100 },
    { subject: t('conscientiousness'), A: scores.conscientiousness, fullMark: 100 },
    { subject: t('extraversion'), A: scores.extraversion, fullMark: 100 },
    { subject: t('agreeableness'), A: scores.agreeableness, fullMark: 100 },
    { subject: t('neuroticism'), A: scores.neuroticism, fullMark: 100 },
  ] : []

  if (isTakingTest) {
    const q = QUESTIONS_META[currentStep]
    const progress = ((currentStep + 1) / QUESTIONS_META.length) * 100

    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Question {currentStep + 1} of {QUESTIONS_META.length}</span>
            <span>{Math.round(progress)}% Complete</span>
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
                <h3 className="text-2xl font-medium text-white mb-10 leading-relaxed">
                  {t(q.key)}
                </h3>
                
                <div className="px-4 mb-10">
                  <Slider
                    key={`q-${q.id}-v-${answers[q.id] || 3}`}
                    defaultValue={[answers[q.id] || 3]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={handleAnswer}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between mt-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <span>{t('disagree')}</span>
                    <span>Neutral</span>
                    <span>{t('agree')}</span>
                  </div>
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
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
          >
            {isSubmitting ? 'Saving...' : 
             currentStep === QUESTIONS_META.length - 1 ? t('calculateResults') : t('next')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {!scores ? (
        <Card className="border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl overflow-hidden py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="p-4 bg-indigo-500/20 rounded-2xl mb-6">
              <Brain className="h-12 w-12 text-indigo-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-4">{t('bigFiveTitle')}</CardTitle>
            <CardDescription className="text-slate-400 max-w-lg mb-8 text-base">
              {t('bigFiveDesc')}
            </CardDescription>
            <Button
              size="lg"
              onClick={() => setIsTakingTest(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 rounded-full font-semibold shadow-xl hover:shadow-indigo-500/20 transition-all hover:scale-105"
            >
              {t('startAssessment')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white">Profile Visualization</CardTitle>
                <CardDescription>Your unique combination of traits</CardDescription>
              </div>
              {!initialScores && (
                <Button variant="ghost" size="sm" onClick={() => setIsTakingTest(true)} className="text-indigo-400">
                  <RefreshCcw className="mr-2 h-4 w-4" /> {t('retake')}
                </Button>
              )}
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="You"
                    dataKey="A"
                    stroke="#818cf8"
                    strokeWidth={3}
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-slate-900 to-black backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-400" /> {t('analysis')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(scores).map(([trait, score]) => (
                <div key={trait} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">{t(trait)}</span>
                    <span className="text-indigo-400 font-bold">{Math.round(score as number)}%</span>
                  </div>
                  <Progress value={score as number} className="h-1.5 bg-white/5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t(`${trait}Desc`)}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-yellow-400 font-bold">
                <Coins className="h-5 w-5" /> {initialScores ? 'Assessment Completed' : '+50 Tokens Earned'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* B2B CTA — shown after assessment completion */}
      {scores && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 shrink-0">
              <Building2 className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">{t('b2bCtaTitle')}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {t('b2bCtaDesc')}
              </p>
              <a
                href="mailto:contact@ertoba.info"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-5 py-2.5 rounded-xl transition-all active:scale-95 border border-white/20 text-sm"
              >
                {t('b2bCtaButton')} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
