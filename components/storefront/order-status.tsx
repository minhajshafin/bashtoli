'use client'

import React from 'react'

interface OrderStatusProps {
  status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
}

export function OrderStatus({ status }: OrderStatusProps) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 dark:bg-rose-950/20 dark:border-rose-900 animate-fade-in">
        <svg className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">Order Cancelled</h4>
          <p className="text-xs text-rose-650 dark:text-rose-450 mt-0.5">
            This order has been cancelled. Please contact our support if you believe this is a mistake.
          </p>
        </div>
      </div>
    )
  }

  // Define logical visual steps
  const steps = [
    { label: 'Placed', key: 'pending', description: 'Order registered' },
    { label: 'Confirmed', key: 'confirmed', description: 'Order processing' },
    { label: 'In Transit', key: 'shipped', description: 'Out for delivery' },
    { label: 'Delivered', key: 'delivered', description: 'Order completed' },
  ]

  // Determine current active step index
  let activeIndex = 0 // pending
  if (status === 'confirmed') activeIndex = 1
  if (status === 'shipped' || status === 'out_for_delivery') activeIndex = 2
  if (status === 'delivered') activeIndex = 3

  return (
    <div className="space-y-4 py-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Status</h3>
      
      {/* Mobile view: vertical list */}
      <div className="md:hidden space-y-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex
          const isActive = idx === activeIndex
          
          return (
            <div key={step.label} className="flex items-center gap-3.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-amber-600 text-white'
                    : isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 ring-4 ring-zinc-900/10 dark:ring-zinc-50/15'
                    : 'bg-zinc-150 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-650'
                }`}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <div>
                <p className={`text-sm font-bold ${isActive ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-500'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-zinc-400">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop view: horizontal line stepper */}
      <div className="hidden md:block relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-zinc-150 dark:bg-zinc-850 -z-10" />
        <div
          className="absolute top-4 left-[12.5%] h-0.5 bg-amber-600 transition-all duration-500 -z-10"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 75}%` }}
        />

        <div className="grid grid-cols-4 text-center">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex
            const isActive = idx === activeIndex
            
            return (
              <div key={step.label} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-amber-600 text-white'
                      : isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 ring-4 ring-zinc-900/10 dark:ring-zinc-50/15'
                      : 'bg-zinc-150 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-650'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <p className={`text-xs font-bold mt-2 ${isActive ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-500'}`}>
                  {step.label}
                </p>
                <p className="text-[9px] text-zinc-400 mt-0.5">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
