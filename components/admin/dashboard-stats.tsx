'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react'
import type { DashboardMetrics } from '@/lib/queries/dashboard'

interface DashboardStatsProps {
  metrics: DashboardMetrics
}

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  accent: {
    bg: string
    text: string
    border: string
    glow: string
  }
  icon: React.ReactNode
  linkHref: string
}

function StatCard({ label, value, sublabel, icon, accent, linkHref }: StatCardProps) {
  return (
    <Link
      href={linkHref}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accent.border} ${accent.bg} ${accent.text} transition-transform group-hover:scale-105`}
        >
          {icon}
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors">
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight truncate">
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{sublabel}</p>
        )}
      </div>
    </Link>
  )
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Today's Revenue */}
      <StatCard
        label="Today's Revenue"
        value={`৳${metrics.todayRevenue.toLocaleString()}`}
        sublabel="Gross processed today"
        accent={{
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          glow: 'group-hover:ring-emerald-500/10',
        }}
        icon={<TrendingUp className="h-5 w-5" />}
        linkHref="/admin/orders"
      />

      {/* Today's Orders */}
      <StatCard
        label="Today's Orders"
        value={metrics.todayOrderCount}
        sublabel="New checkouts placed"
        accent={{
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          glow: 'group-hover:ring-indigo-500/10',
        }}
        icon={<ShoppingBag className="h-5 w-5" />}
        linkHref="/admin/orders"
      />

      {/* Pending Orders */}
      <StatCard
        label="Pending Orders"
        value={metrics.pendingOrderCount}
        sublabel="Awaiting confirmation"
        accent={{
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          glow: 'group-hover:ring-amber-500/10',
        }}
        icon={<Clock className="h-5 w-5" />}
        linkHref="/admin/orders?status=pending"
      />

      {/* Low Stock Items */}
      <StatCard
        label="Low Stock Items"
        value={metrics.lowStockCount}
        sublabel="At or below threshold"
        accent={{
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          glow: 'group-hover:ring-rose-500/10',
        }}
        icon={<AlertTriangle className="h-5 w-5" />}
        linkHref="#low-stock-panel"
      />
    </div>
  )
}
