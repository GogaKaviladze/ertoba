import { ClipboardList, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SurveysPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Available Surveys</h1>
        <p className="text-slate-400">Complete tasks to earn ETC tokens and contribute to the Ertoba ecosystem.</p>
      </div>

      <div className="grid gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-500/20 rounded-xl mt-1 shrink-0">
                <ClipboardList className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Daily Feedback Survey</h3>
                <p className="text-sm text-slate-400 mb-2">Share your thoughts on recent geopolitical events to help train our models.</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30">
                    Reward: +15 ETC
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-400/10 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-400/20">
                    Est. 2 mins
                  </span>
                </div>
              </div>
            </div>
            <Button className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 border-0 shrink-0">
              Start Survey
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-black/20 backdrop-blur-xl opacity-75">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-500/10 rounded-xl mt-1 shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-300">Onboarding Questionnaire</h3>
                <p className="text-sm text-slate-500 mb-2">Initial setup questionnaire.</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/30">
                    Completed
                  </span>
                </div>
              </div>
            </div>
            <Button disabled variant="outline" className="w-full md:w-auto border-white/10 bg-transparent shrink-0 text-slate-500">
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
