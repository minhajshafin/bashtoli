'use client'

import React, { useTransition, useState } from 'react'
import { claimGuestOrdersAction } from '@/lib/actions/claim-guest-orders'
import { useToast } from '@/components/ui/toast'

interface GuestOrder {
  id: string
  order_number: string
  created_at: string
  total: number
}

interface ClaimOrdersPromptProps {
  initialOrders: GuestOrder[]
}

export function ClaimOrdersPrompt({ initialOrders }: ClaimOrdersPromptProps) {
  const [orders, setOrders] = useState<GuestOrder[]>(initialOrders)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  if (orders.length === 0) return null

  const handleClaim = () => {
    const orderIds = orders.map((o) => o.id)
    startTransition(async () => {
      const res = await claimGuestOrdersAction(orderIds)
      if (res.error) {
        toast(res.error, 'error')
      } else {
        toast(`Successfully linked ${orders.length} past order(s) to your account!`, 'success')
        setOrders([])
      }
    })
  }

  return (
    <div className="rounded-2xl border border-gold-400/60 bg-gold-400/10 p-5 sm:p-6 space-y-4 animate-fade-in shadow-2xs">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-gold-400 border border-forest-800 shadow-2xs">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-medium text-forest-950 font-display">
            Unlinked Guest Orders Found
          </h3>
          <p className="mt-1 text-xs text-forest-600 font-sans leading-relaxed">
            We discovered past guest orders placed with your email or phone number. Link them to your account to view their status and keep all receipts in one place.
          </p>
        </div>
      </div>

      {/* Guest orders list */}
      <div className="max-h-40 overflow-y-auto rounded-xl border border-forest-200/80 bg-cream-50 divide-y divide-forest-200/60">
        {orders.map((o) => {
          const dateStr = new Date(o.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
          return (
            <div key={o.id} className="flex justify-between items-center px-4 py-2.5 text-xs font-sans">
              <div>
                <span className="font-bold text-forest-950 font-mono">{o.order_number}</span>
                <span className="text-forest-400 mx-2">•</span>
                <span className="text-forest-600">{dateStr}</span>
              </div>
              <span className="font-bold text-forest-950 font-price">৳{o.total.toLocaleString()}</span>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleClaim}
          disabled={isPending}
          className="btn-primary inline-flex h-10 items-center justify-center rounded-xl px-5 text-xs font-sans font-semibold disabled:opacity-50"
        >
          {isPending ? 'Linking Orders...' : 'Link Orders to My Account'}
        </button>
      </div>
    </div>
  )
}
