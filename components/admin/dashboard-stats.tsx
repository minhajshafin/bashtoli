'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import type { DashboardMetrics } from '@/lib/queries/dashboard'

interface DashboardStatsProps {
  metrics: DashboardMetrics
}

type StatTone = 'emerald' | 'info' | 'warning' | 'danger'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  linkHref: string
  tone: StatTone
}

const TONE_ICON_STYLES: Record<StatTone, string> = {
  emerald: 'bg-adm-success-bg text-adm-success border-adm-success-border',
  info: 'bg-adm-info-bg text-adm-info border-adm-info-border',
  warning: 'bg-adm-warning-bg text-adm-warning border-adm-warning-border',
  danger: 'bg-adm-danger-bg text-adm-danger border-adm-danger-border',
}

function StatCard({ label, value, icon, linkHref, tone }: StatCardProps) {
  return (
    <Link
      href={linkHref}
      className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-adm-input-border shadow-subtle"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-adm-muted">{label}</span>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${TONE_ICON_STYLES[tone]}`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`admin-metric-value mt-4 truncate ${
          tone === 'danger' ? 'text-adm-danger' : 'text-adm-fg'
        }`}
      >
        {value}
      </p>
    </Link>
  )
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  const hasLowStock = metrics.lowStockCount > 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Today's Revenue"
        value={`Tk ${metrics.todayRevenue.toLocaleString()}`}
        icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
        linkHref="/admin/orders"
        tone="emerald"
      />

      <StatCard
        label="Today's Orders"
        value={metrics.todayOrderCount}
        icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
        linkHref="/admin/orders"
        tone="info"
      />

      <StatCard
        label="Pending Orders"
        value={metrics.pendingOrderCount}
        icon={<Clock className="h-4 w-4" aria-hidden="true" />}
        linkHref="/admin/orders?status=pending"
        tone={metrics.pendingOrderCount > 0 ? 'warning' : 'emerald'}
      />

      <StatCard
        label="Low Stock Items"
        value={metrics.lowStockCount}
        icon={
          hasLowStock ? (
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          )
        }
        linkHref="#low-stock-panel"
        tone={hasLowStock ? 'danger' : 'emerald'}
      />
    </div>
  )
}
