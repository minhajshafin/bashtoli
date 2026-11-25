import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Plus, ShoppingBag } from 'lucide-react'
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
 */
export default async function AdminPage({ searchParams }: PageProps) {
  await connection()
  const resolvedSearchParams = await searchParams
  const thresholdParam = resolvedSearchParams?.threshold
  const parsedThreshold = parseInt(thresholdParam ?? '', 10)
  const threshold = !isNaN(parsedThreshold) && parsedThreshold >= 0 ? parsedThreshold : 5

  const [metrics, lowStockItems] = await Promise.all([
    fetchDashboardMetrics(threshold),
    fetchLowStockList(threshold),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-adm-border">
        <h1 className="admin-page-title text-adm-fg">Dashboard</h1>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Link
            href="/admin/orders"
            className="inline-flex min-h-[42px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors shadow-subtle"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-adm-muted" aria-hidden="true" />
            <span>Orders</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex min-h-[42px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-adm-accent px-4 py-2 text-xs font-semibold text-adm-accent-fg hover:bg-adm-accent-hover transition-colors shadow-elevation-1"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      <DashboardStats metrics={metrics} />

      <LowStockList items={lowStockItems} threshold={threshold} />
    </div>
  )
}
