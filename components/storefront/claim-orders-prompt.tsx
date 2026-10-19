'use client'

import React, { useTransition, useState } from 'react'
import { claimGuestOrdersAction } from '@/lib/actions/claim-guest-orders'
import { useToast } from '@/components/ui/toast'
import { AlertCircle, Link2 } from 'lucide-react'

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
    <div className="rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md text-forest-950 p-4 sm:p-6 space-y-4 animate-fade-in">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-950 text-gold-400 border border-forest-800 shadow-2xs">
          <AlertCircle className="h-5 w-5 stroke-[1.8]" />
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
      <div className="max-h-40 overflow-y-auto rounded-xl border border-forest-200/90 bg-white divide-y divide-forest-200/60">
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
          className="w-full sm:w-auto inline-flex h-11 sm:h-10 items-center justify-center gap-2 rounded-xl bg-forest-900 text-cream-50 hover:bg-gold-500 hover:text-forest-950 px-5 text-xs font-sans font-semibold disabled:opacity-50 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cream-100 border-t-gold-400" />
              <span>Linking Orders...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Link2 className="h-4 w-4" />
              <span>Link Orders to My Account</span>
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
