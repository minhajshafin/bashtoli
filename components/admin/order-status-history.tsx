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
      return 'bg-adm-success-bg text-adm-success border-adm-success-border'
    case 'cancelled':
      return 'bg-adm-danger-bg text-adm-danger border-adm-danger-border'
    case 'out_for_delivery':
      return 'bg-adm-accent-tint text-adm-accent-text border-adm-accent-border'
    case 'shipped':
    case 'confirmed':
      return 'bg-adm-info-bg text-adm-info border-adm-info-border'
    default:
      return 'bg-adm-warning-bg text-adm-warning border-adm-warning-border'
  }
}

export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-adm-surface border border-adm-border rounded-2xl p-5 shadow-subtle">
        <h2 className="text-sm font-semibold text-adm-fg mb-2">Status History</h2>
        <p className="text-xs text-adm-muted">No status updates recorded.</p>
      </div>
    )
  }

  return (
    <div className="bg-adm-surface border border-adm-border rounded-2xl p-5 shadow-subtle space-y-4">
      <h2 className="text-sm font-semibold text-adm-fg border-b border-adm-border pb-2.5">
        Status History
      </h2>

      <div className="flow-root">
        <ul className="-mb-6">
          {history.map((entry, idx) => {
            const dateStr = new Date(entry.changed_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <li key={entry.id}>
                <div className="relative pb-6">
                  {idx !== history.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-px bg-adm-border"
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full border flex items-center justify-center ring-4 ring-adm-surface ${getTimelineNodeClasses(
                          entry.status
                        )}`}
                      >
                        <svg
                          className="h-3.5 w-3.5"
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
                        <p className="text-sm font-semibold text-adm-fg">
                          {ORDER_STATUS_LABELS[entry.status] || entry.status}
                        </p>
                        <p className="text-xs text-adm-muted">
                          by {entry.changed_by_name || 'System'}
                        </p>
                      </div>
                      <div className="text-right font-mono text-[11px] whitespace-nowrap text-adm-muted pt-0.5">
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
