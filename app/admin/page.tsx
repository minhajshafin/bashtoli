import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, ShoppingBag } from 'lucide-react'
import { getServerProfile } from '@/lib/supabase/get-server-profile'
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
 * Profile is loaded via the shared getServerProfile() helper (React cache),
 * so Header + this page share one DB round-trip (ARCH-3).
 */
export default async function AdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const thresholdParam = resolvedSearchParams?.threshold
  const parsedThreshold = parseInt(thresholdParam ?? '', 10)
  // Guard against NaN (e.g. ?threshold=abc) and negative values
  const threshold = !isNaN(parsedThreshold) && parsedThreshold >= 0 ? parsedThreshold : 5

  // Profile fetch — deduplicated with Header via React cache()
  const profile = await getServerProfile()
  const greeting = profile?.full_name
    ? `Welcome back, ${profile.full_name.split(' ')[0]}!`
    : 'Welcome back!'

  // Fetch live metrics and stock levels
  const metrics = await fetchDashboardMetrics(threshold)
  const lowStockItems = await fetchLowStockList(threshold)

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Heading Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {greeting}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {todayFormatted} · Here&apos;s a live snapshot of your store catalog and checkout activity.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-slate-500" />
            <span>Orders</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Card Grid */}
      <DashboardStats metrics={metrics} />

      {/* Low-Stock alerts list with integrated threshold setting */}
      <LowStockList items={lowStockItems} threshold={threshold} />
    </div>
  )
}
