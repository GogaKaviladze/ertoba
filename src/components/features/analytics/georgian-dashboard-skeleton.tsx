export function GeorgianDashboardSkeleton() {
  return (
    <div className="space-y-6 pb-10" aria-live="polite" aria-busy="true">
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="h-5 w-48 rounded-full bg-white/10 animate-pulse" />
        <div className="mt-3 h-4 w-full rounded-full bg-white/5 animate-pulse" />
        <div className="mt-2 h-4 w-5/6 rounded-full bg-white/5 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg"
          >
            <div className="h-10 w-10 rounded-lg bg-white/10 animate-pulse" />
            <div className="mt-4 h-3 w-24 rounded-full bg-white/10 animate-pulse" />
            <div className="mt-2 h-8 w-16 rounded-full bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl"
          >
            <div className="h-5 w-40 rounded-full bg-white/10 animate-pulse" />
            <div className="mt-6 h-[250px] sm:h-[300px] rounded-2xl bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
