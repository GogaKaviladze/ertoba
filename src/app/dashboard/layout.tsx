import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { cookies } from 'next/headers'
import { getDictionary, isLanguage } from '@/lib/i18n/dictionaries'
import { createClient } from '@/lib/supabase/server'
import { getUserBalance } from '@/services/userService'
import { Suspense } from 'react'

const dashboardBackgroundClass =
  'absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_32%),linear-gradient(180deg,_rgba(7,7,10,0.94)_0%,_#050505_72%)]'

async function HeaderWithBalance({ initialLanguage }: { initialLanguage: 'ka' | 'en' | 'de' }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const balance = user ? await getUserBalance(user.id).catch(() => 0) : 0
  return <Header initialLanguage={initialLanguage} balance={balance} />
}

function HeaderSkeleton() {
  return <div className="h-16 bg-white/5 animate-pulse border-b border-white/5" />
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('ertoba_lang')?.value
  const initialLanguage = isLanguage(rawLang) ? rawLang : 'ka'
  const dictionary = getDictionary(initialLanguage)

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#050505]">
      {/* Decorative gradient backgrounds */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className={dashboardBackgroundClass} />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-900/20 to-transparent sm:hidden" />
        <div className="absolute left-1/2 top-0 hidden h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl opacity-70 sm:block" />
        <div className="absolute right-[-8rem] top-40 hidden h-80 w-80 rounded-full bg-purple-500/10 blur-3xl opacity-60 sm:block" />
      </div>

      <Sidebar
        className="hidden md:flex md:w-64 md:fixed md:inset-y-0 border-r border-white/10 bg-black/40 backdrop-blur-xl z-50"
        labels={{
          navDashboard: dictionary.navDashboard,
          navAssessments: dictionary.navAssessments,
          navSurveys: dictionary.navSurveys,
          navMarket: dictionary.navMarket,
          navProfile: dictionary.navProfile,
          navAnalytics: dictionary.navAnalytics,
          navReports: dictionary.navReports,
        }}
      />

      <div className="md:pl-64 flex flex-col min-h-screen relative z-10">
        <Suspense fallback={<HeaderSkeleton />}>
          <HeaderWithBalance initialLanguage={initialLanguage} />
        </Suspense>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-7xl sm:animate-in sm:fade-in sm:slide-in-from-bottom-4 sm:duration-500 sm:ease-out">
            {children}
          </div>
        </main>
        <Footer privacyLabel={dictionary.footerPrivacy} imprintLabel={dictionary.footerImprint} />
      </div>
    </div>
  )
}
