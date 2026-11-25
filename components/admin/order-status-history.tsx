'use client'

import React from 'react'
import { ORDER_STATUS_LABELS } from '@/components/admin/order-status-badge'

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

function getTimelineNodeClasses(status: string) {
  switch (status) {
    case 'delivered':
      return 'bg-ink-950 text-paper-50 border-ink-950'
    case 'cancelled':
      return 'bg-signal-danger text-paper-50 border-signal-danger'
    case 'shipped':
    case 'out_for_delivery':
    case 'confirmed':
      return 'bg-ink-800 text-paper-50 border-ink-800'
    default:
      return 'bg-paper-200 text-ink-950 border-ink-400'
  }
}

export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-paper-50 border border-paper-300 rounded-2xl p-5 shadow-subtle">
        <h2 className="admin-kicker text-ink-500 mb-3">Status History Log</h2>
        <p className="text-xs text-ink-600 italic">
          No history log records exist for this order.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-paper-50 border border-paper-300 rounded-2xl p-5 shadow-subtle space-y-4">
      <h2 className="admin-kicker text-ink-500 border-b border-paper-200 pb-2.5">
        Status History Log
      </h2>

      <div className="flow-root">
        <ul className="-mb-7">
          {history.map((entry, idx) => {
            const dateStr = new Date(entry.changed_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <li key={entry.id}>
                <div className="relative pb-7">
                  {idx !== history.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-px bg-paper-300"
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full border flex items-center justify-center ring-4 ring-paper-50 ${getTimelineNodeClasses(
                          entry.status
                        )}`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 pt-1 flex justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink-950">
                          {ORDER_STATUS_LABELS[entry.status] || entry.status}
                        </p>
                        <p className="text-xs text-ink-600">
                          by {entry.changed_by_name || 'System'}
                        </p>
                      </div>
                      <div className="text-right font-mono text-[11px] whitespace-nowrap text-ink-500 font-semibold pt-0.5">
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
