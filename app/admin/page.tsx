import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Plus, ShoppingBag } from 'lucide-react'
import { getServerProfile } from '@/lib/supabase/get-server-profile'
import { fetchDashboardMetrics, fetchLowStockList } from '@/lib/queries/dashboard'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { LowStockList } from '@/components/admin/low-stock-list'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Bashtoli store management metrics dashboard',
}

export const instant = false

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
  await connection()
  const resolvedSearchParams = await searchParams
  const thresholdParam = resolvedSearchParams?.threshold
  const parsedThreshold = parseInt(thresholdParam ?? '', 10)
  const threshold = !isNaN(parsedThreshold) && parsedThreshold >= 0 ? parsedThreshold : 5

  const profile = await getServerProfile()
  const greeting = profile?.full_name
    ? `Welcome back, ${profile.full_name.split(' ')[0]}`
    : 'Welcome back'

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
      {/* Editorial Dual-Tone Masthead */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 pb-6 border-b border-paper-300">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="admin-kicker text-ink-500">01 / Operations Snapshot</span>
            <span className="text-ink-400" aria-hidden="true">·</span>
            <time className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
              {todayFormatted}
            </time>
          </div>
          <h1 className="admin-page-title text-ink-950">
            {greeting}
          </h1>
          <p className="text-sm text-ink-600 max-w-xl text-pretty">
            Live fulfillment pulse, daily cash-on-delivery revenue, and catalog stock thresholds.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Link
            href="/admin/orders"
            className="inline-flex min-h-[44px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-ink-400/70 bg-paper-50 px-4 py-2 text-xs font-bold text-ink-950 hover:bg-paper-200 transition-colors shadow-subtle"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-ink-700" aria-hidden="true" />
            <span>Orders</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex min-h-[44px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-ink-950 px-4 py-2 text-xs font-bold text-paper-50 hover:bg-ink-800 transition-colors shadow-elevation-1"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Dual-Tone Bento Metric Strip */}
      <DashboardStats metrics={metrics} />

      {/* Low-Stock Alerts Ledger */}
      <LowStockList items={lowStockItems} threshold={threshold} />
    </div>
  )
}
