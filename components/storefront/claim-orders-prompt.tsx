'use client'

import React, { useTransition, useState } from 'react'
import { claimGuestOrdersAction } from '@/lib/actions/claim-guest-orders'

interface GuestOrder {
  id: string
  order_number: string
  created_at: string
  total: number
}

interface ClaimOrdersPromptProps {
  initialOrders: GuestOrder[]
}

/**
 * Claim Guest Orders prompt component.
 * Allows customers to associate past anonymous checkouts matching their details with their profile.
 */
export function ClaimOrdersPrompt({ initialOrders }: ClaimOrdersPromptProps) {
  const [orders, setOrders] = useState<GuestOrder[]>(initialOrders)
  const [isPending, startTransition] = useTransition()

  if (orders.length === 0) return null

  const handleClaim = () => {
    const orderIds = orders.map((o) => o.id)
    startTransition(async () => {
      const res = await claimGuestOrdersAction(orderIds)
      if (res.error) {
        alert(res.error)
      } else {
        alert(`Successfully linked ${orders.length} past order(s) to your account!`)
        setOrders([]) // Clear prompt list on success
      }
    })
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/10 space-y-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
          <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
            Unlinked Guest Orders Found
          </h3>
          <p className="mt-1 text-xs text-zinc-650 dark:text-zinc-400 leading-normal">
            We discovered past guest orders placed with your email or phone number. Link them to your account to view their status and keep order records in one place.
          </p>
        </div>
      </div>

      {/* Guest orders summary list */}
      <div className="max-h-40 overflow-y-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-800">
        {orders.map((o) => {
          const dateStr = new Date(o.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
          return (
            <div key={o.id} className="flex justify-between items-center px-4 py-2.5 text-xs">
              <div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{o.order_number}</span>
                <span className="text-zinc-400 mx-2">•</span>
                <span className="text-zinc-500">{dateStr}</span>
              </div>
              <span className="font-black text-zinc-900 dark:text-zinc-50">৳{o.total.toLocaleString()}</span>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleClaim}
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center rounded-xl bg-amber-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50 transition-all dark:bg-amber-700 dark:hover:bg-amber-600"
        >
          {isPending ? 'Linking Orders...' : 'Link Orders to My Account'}
        </button>
      </div>
    </div>
  )
}
