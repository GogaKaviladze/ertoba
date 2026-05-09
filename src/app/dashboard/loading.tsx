import { Card, CardContent } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-10" aria-busy="true">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-md bg-white/10" />
        <div className="h-4 w-64 rounded-md bg-white/5" />
      </div>

      <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-slate-950/80 to-slate-950/90">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-md bg-indigo-400/20" />
            <div className="h-7 w-40 rounded-md bg-white/10" />
            <div className="h-4 w-full max-w-2xl rounded-md bg-white/5" />
            <div className="h-4 w-5/6 max-w-xl rounded-md bg-white/5" />
            <div className="h-11 w-48 rounded-md bg-indigo-500/30" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="border-white/5 bg-white/5">
            <CardContent className="space-y-4 p-5">
              <div className="h-5 w-32 rounded-md bg-white/10" />
              <div className="h-9 w-full rounded-md bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
