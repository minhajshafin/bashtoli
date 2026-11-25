'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'
import type { DashboardMetrics } from '@/lib/queries/dashboard'

interface DashboardStatsProps {
  metrics: DashboardMetrics
}

interface StatCardProps {
  indexCode: string
  label: string
  value: string | number
  sublabel: string
  icon: React.ReactNode
  linkHref: string
  tone?: 'obsidian' | 'paper'
  alertActive?: boolean
}

function StatCard({
  indexCode,
  label,
  value,
  sublabel,
  icon,
  linkHref,
  tone = 'paper',
  alertActive = false,
}: StatCardProps) {
  const isObsidian = tone === 'obsidian'

  return (
    <Link
      href={linkHref}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 sm:p-6 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 ${
        isObsidian
          ? 'border-ink-800 bg-ink-950 text-paper-50 shadow-elevation-2 hover:border-ink-600 focus-visible:outline-paper-50'
          : 'border-paper-300 bg-paper-50 text-ink-950 shadow-subtle hover:border-ink-950'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${
              isObsidian
                ? 'border-ink-700 bg-ink-900 text-paper-50'
                : alertActive
                ? 'border-signal-danger-border bg-signal-danger-bg text-signal-danger'
                : 'border-paper-300 bg-paper-200 text-ink-950'
            }`}
          >
            {icon}
          </div>
          <span
            className={`font-mono text-[10px] font-semibold tracking-[0.16em] uppercase ${
              isObsidian ? 'text-paper-500' : 'text-ink-500'
            }`}
          >
            {indexCode}
          </span>
        </div>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
            isObsidian
              ? 'border-ink-800 bg-ink-900 text-paper-300 group-hover:bg-paper-50 group-hover:text-ink-950 group-hover:border-paper-50'
              : 'border-paper-300 bg-paper-100 text-ink-600 group-hover:bg-ink-950 group-hover:text-paper-50 group-hover:border-ink-950'
          }`}
        >
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-6">
        <p
          className={`admin-kicker ${
            isObsidian ? 'text-paper-400' : 'text-ink-500'
          }`}
        >
          {label}
        </p>
        <p
          className={`admin-metric-value mt-2 truncate ${
            isObsidian
              ? 'text-paper-50'
              : alertActive
              ? 'text-signal-danger'
              : 'text-ink-950'
          }`}
        >
          {value}
        </p>
        <p
          className={`text-xs mt-2 font-medium ${
            isObsidian ? 'text-paper-400' : 'text-ink-600'
          }`}
        >
          {sublabel}
        </p>
      </div>
    </Link>
  )
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  const hasLowStock = metrics.lowStockCount > 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        indexCode="KPI 01"
        label="Today's Revenue"
        value={`Tk ${metrics.todayRevenue.toLocaleString()}`}
        sublabel="Gross non-cancelled today"
        icon={<TrendingUp className="h-4.5 w-4.5" aria-hidden="true" />}
        linkHref="/admin/orders"
        tone="obsidian"
      />

      <StatCard
        indexCode="KPI 02"
        label="Today's Orders"
        value={metrics.todayOrderCount}
        sublabel="New checkouts placed"
        icon={<ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />}
        linkHref="/admin/orders"
      />

      <StatCard
        indexCode="KPI 03"
        label="Pending Orders"
        value={metrics.pendingOrderCount}
        sublabel="Awaiting phone verification"
        icon={<Clock className="h-4.5 w-4.5" aria-hidden="true" />}
        linkHref="/admin/orders?status=pending"
      />

      <StatCard
        indexCode="KPI 04"
        label="Low Stock Items"
        value={metrics.lowStockCount}
        sublabel={hasLowStock ? 'At or below safety threshold' : 'All variants healthy'}
        icon={
          hasLowStock ? (
            <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
          )
        }
        linkHref="#low-stock-panel"
        alertActive={hasLowStock}
      />
    </div>
  )
}
