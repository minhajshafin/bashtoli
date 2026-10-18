'use client'

import React from 'react'
import { Check, Clock, PackageCheck, Truck, Home, AlertCircle } from 'lucide-react'

interface OrderStatusProps {
  status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
  createdAt?: string
}

export function OrderStatus({ status, createdAt }: OrderStatusProps) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl bg-terracotta-100/90 border border-terracotta-500/40 p-4 sm:p-5 flex items-start gap-3.5 animate-fade-in">
        <AlertCircle className="h-5 w-5 text-terracotta-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-terracotta-900 font-sans">Order Cancelled</h4>
          <p className="text-xs text-terracotta-800 leading-relaxed font-sans">
            This order has been cancelled. If you believe this is an error or wish to re-order your stationery items, please contact our studio via WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  // Logical milestone steps
  const steps = [
    {
      label: 'Order Placed',
      shortLabel: 'Placed',
      key: 'pending',
      description: 'Order received and logged in system',
      icon: Clock,
    },
    {
      label: 'Studio Packing',
      shortLabel: 'Processing',
      key: 'confirmed',
      description: 'Handcrafted & packed in Dhaka studio',
      icon: PackageCheck,
    },
    {
      label: 'In Transit',
      shortLabel: 'In Transit',
      key: 'shipped',
      description: 'Handed to courier partner (Steadfast / Pathao)',
      icon: Truck,
    },
    {
      label: 'Delivered',
      shortLabel: 'Delivered',
      key: 'delivered',
      description: 'Parcel safely delivered to your doorstep',
      icon: Home,
    },
  ]

  let activeIndex = 0
  if (status === 'confirmed') activeIndex = 1
  if (status === 'shipped' || status === 'out_for_delivery') activeIndex = 2
  if (status === 'delivered') activeIndex = 3

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="space-y-4 py-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
          <h3 className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
            Delivery Milestones
          </h3>
        </div>
        <span className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-forest-900 text-gold-400 capitalize border border-forest-800 shadow-2xs">
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Mobile view: True Vertical Milestone Timeline */}
      <div className="md:hidden relative pt-2 pb-1 space-y-0">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex
          const isActive = idx === activeIndex
          const isLast = idx === steps.length - 1
          const StepIcon = step.icon

          return (
            <div key={step.label} className="relative flex items-start gap-4 pb-6 last:pb-1">
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={`absolute left-[17px] top-8 w-0.5 bottom-0 transition-colors duration-300 ${
                    isCompleted
                      ? 'bg-gold-500'
                      : isActive
                      ? 'bg-gradient-to-b from-gold-500 to-cream-300'
                      : 'bg-cream-300/80'
                  }`}
                />
              )}

              {/* Node Icon */}
              <div
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gold-500 text-forest-950 shadow-xs'
                    : isActive
                    ? 'bg-forest-900 text-gold-400 border-2 border-gold-500 ring-4 ring-gold-500/25 shadow-sm'
                    : 'bg-cream-200/90 text-forest-400 border border-forest-200/80'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : isActive ? (
                  <StepIcon className="h-4 w-4 stroke-[2.2]" />
                ) : (
                  <span className="font-mono text-xs font-semibold">{idx + 1}</span>
                )}
              </div>

              {/* Content description */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-sm font-sans tracking-tight ${
                      isActive
                        ? 'font-bold text-forest-950 text-[15px]'
                        : isCompleted
                        ? 'font-semibold text-forest-900'
                        : 'font-normal text-forest-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gold-400/20 text-gold-600 border border-gold-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 animate-ping" />
                      Current
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs mt-0.5 font-sans leading-relaxed ${
                    isActive
                      ? 'text-forest-700 font-medium'
                      : isCompleted
                      ? 'text-forest-600'
                      : 'text-forest-400/80'
                  }`}
                >
                  {step.description}
                </p>

                {/* Placement timestamp badge on step 0 */}
                {idx === 0 && formattedDate && (
                  <p className="text-[11px] font-mono text-forest-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 opacity-70" />
                    {formattedDate}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop view: Horizontal Stepper */}
      <div className="hidden md:block relative pt-3 pb-2">
        {/* Track Line */}
        <div className="absolute top-7 left-[12.5%] right-[12.5%] h-1 bg-cream-300/80 rounded-full -z-10" />
        <div
          className="absolute top-7 left-[12.5%] h-1 bg-gold-500 rounded-full transition-all duration-500 -z-10"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 75}%` }}
        />

        <div className="grid grid-cols-4 text-center">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex
            const isActive = idx === activeIndex
            const StepIcon = step.icon

            return (
              <div key={step.label} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gold-500 text-forest-950 shadow-sm'
                      : isActive
                      ? 'bg-forest-900 text-gold-400 border-2 border-gold-500 ring-4 ring-gold-500/20 shadow-sm'
                      : 'bg-cream-200 text-forest-400 border border-forest-200/80'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : isActive ? (
                    <StepIcon className="h-4 w-4 stroke-[2.2]" />
                  ) : (
                    <span className="font-mono text-xs">{idx + 1}</span>
                  )}
                </div>
                <p
                  className={`text-xs font-bold mt-2.5 font-sans ${
                    isActive
                      ? 'text-forest-950 font-extrabold'
                      : isCompleted
                      ? 'text-forest-900'
                      : 'text-forest-400'
                  }`}
                >
                  {step.shortLabel}
                </p>
                <p className="text-[10px] text-forest-500 mt-0.5 max-w-[140px] leading-tight font-sans">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
