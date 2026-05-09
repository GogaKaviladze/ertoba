'use client'

import dynamic from 'next/dynamic'
import { GeorgianDashboardSkeleton } from '@/components/features/analytics/georgian-dashboard-skeleton'

export const GeorgianAnalyticsDashboardLazy = dynamic(
  () =>
    import('@/components/features/analytics/georgian-dashboard').then((module) => module.GeorgianAnalyticsDashboard),
  {
    loading: () => <GeorgianDashboardSkeleton />,
    ssr: false,
  }
)
