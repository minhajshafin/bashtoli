import React from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { fetchDashboardMetrics, fetchLowStockList } from '@/lib/queries/dashboard'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { LowStockList } from '@/components/admin/low-stock-list'

export const metadata: Metadata = {
  title: 'Dashboard | Bashtoli Admin',
  description: 'Bashtoli store management metrics dashboard',
}

interface PageProps {
  searchParams: Promise<{
    threshold?: string
  }>
}

/**
 * Admin Dashboard homepage.
 * Server component loading welcome profiles, sales/pending order count metrics,
 * and low-stock variant lists.
 */
export default async function AdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const thresholdParam = resolvedSearchParams?.threshold
  const threshold = thresholdParam ? parseInt(thresholdParam, 10) : 5

  const supabase = await createClient()

  // 1. Retrieve user profile greeting details
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()
    : { data: null }

  const greeting = profile?.full_name
    ? `Welcome back, ${profile.full_name.split(' ')[0]}!`
    : 'Welcome back!'

  // 2. Fetch live metrics and stock levels
  const metrics = await fetchDashboardMetrics(threshold)
  const lowStockItems = await fetchLowStockList(threshold)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Heading Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{greeting}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s a live snapshot of your store catalog and checkout states today.
          </p>
        </div>

        {/* Threshold quick adjuster form */}
        <form method="get" className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <label htmlFor="threshold" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Low Stock Threshold:
          </label>
          <input
            id="threshold"
            name="threshold"
            type="number"
            min="0"
            max="100"
            defaultValue={threshold}
            className="w-14 h-7 text-center rounded border border-slate-350 bg-white text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="h-7 px-2.5 rounded bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Metrics Card Grid */}
      <DashboardStats metrics={metrics} />

      {/* Low-Stock alerts list */}
      <LowStockList items={lowStockItems} threshold={threshold} />
    </div>
  )
}
