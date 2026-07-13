'use client'

import React from 'react'
import Link from 'next/link'
import type { DashboardMetrics } from '@/lib/queries/dashboard'

interface DashboardStatsProps {
  metrics: DashboardMetrics
}

interface StatCardProps {
  label: string
  value: number
  accent: string
  icon: React.ReactNode
  linkHref: string
  linkText: string
}

function StatCard({ label, value, icon, accent, linkHref, linkText }: StatCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110 ${accent}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{value.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
        <span className="text-slate-450 font-medium">Quick link</span>
        <Link
          href={linkHref}
          className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 group/link"
        >
          {linkText}
          <svg className="h-3 w-3 stroke-current fill-none transition-transform group-hover/link:translate-x-0.5" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Today's Orders */}
      <StatCard
        label="Today's Orders"
        value={metrics.todayOrderCount}
        accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
            <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.14A1.75 1.75 0 0 0 3.84 18.5H16.16a1.75 1.75 0 0 0 1.742-1.763l-.826-9.14A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
          </svg>
        }
        linkHref="/admin/orders"
        linkText="View orders list"
      />

      {/* Pending Orders */}
      <StatCard
        label="Pending Orders"
        value={metrics.pendingOrderCount}
        accent="bg-amber-50 text-amber-600 dark:bg-amber-950/20"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
          </svg>
        }
        linkHref="/admin/orders?status=pending"
        linkText="Review pending list"
      />

      {/* Low Stock Items */}
      <StatCard
        label="Low Stock Items"
        value={metrics.lowStockCount}
        accent="bg-rose-50 text-rose-600 dark:bg-rose-950/20"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
        }
        linkHref="#low-stock-panel"
        linkText="Scroll to alert list"
      />
    </div>
  )
}
