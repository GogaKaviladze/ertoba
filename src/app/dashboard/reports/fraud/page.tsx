import { FraudCaseDashboard } from '@/components/features/analytics/fraud-case-dashboard'

export const metadata = {
  title: 'Fraud Case | Ertoba Reports',
  description: 'Statistical analysis of the state cafeteria fraud case — Aladashvili & co.',
}

export default function FraudReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">სასადილოების თაღლითობა</h1>
        <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest">სტატისტიკური ანალიზი · სუს 2026</p>
      </div>

      <FraudCaseDashboard />
    </div>
  )
}
