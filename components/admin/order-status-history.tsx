'use client'

import React from 'react'

interface HistoryEntry {
  id: string
  status: string
  changed_at: string
  changed_by: string | null
  changed_by_name: string | null
}

interface OrderStatusHistoryProps {
  history: HistoryEntry[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Verification',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function getBulletColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-450 text-white'
    case 'confirmed':
      return 'bg-blue-500 text-white'
    case 'shipped':
      return 'bg-indigo-500 text-white'
    case 'out_for_delivery':
      return 'bg-violet-500 text-white'
    case 'delivered':
      return 'bg-emerald-500 text-white'
    case 'cancelled':
      return 'bg-rose-500 text-white'
    default:
      return 'bg-slate-500 text-white'
  }
}

export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Status History Log
        </h2>
        <p className="text-xs text-slate-400 italic">No history log records exist for this order.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Status History Log
      </h2>

      <div className="flow-root">
        <ul className="-mb-8">
          {history.map((entry, idx) => {
            const dateStr = new Date(entry.changed_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <li key={entry.id}>
                <div className="relative pb-8">
                  {/* Timeline connecting line */}
                  {idx !== history.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative flex space-x-3">
                    {/* Circle icon */}
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getBulletColor(entry.status)}`}>
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>

                    {/* Meta info details */}
                    <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {STATUS_LABELS[entry.status] || entry.status}{' '}
                          <span className="text-xs font-normal text-slate-400">
                            by {entry.changed_by_name || 'System'}
                          </span>
                        </p>
                      </div>
                      <div className="text-right text-xs whitespace-nowrap text-slate-500 font-semibold">
                        <time dateTime={entry.changed_at}>{dateStr}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
