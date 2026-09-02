'use client'

import React from 'react'

interface OrderStatusProps {
  status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
}

export function OrderStatus({ status }: OrderStatusProps) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl bg-rose-50/80 border border-rose-200 p-4 flex items-start gap-3 animate-fade-in">
        <svg className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="text-sm font-bold text-rose-800">Order Cancelled</h4>
          <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
            This order has been cancelled. If you believe this is a mistake, please reach out to our team.
          </p>
        </div>
      </div>
    )
  }

  // Logical visual steps
  const steps = [
    { label: 'Placed', key: 'pending', description: 'Order registered' },
    { label: 'Confirmed', key: 'confirmed', description: 'Order processing' },
    { label: 'In Transit', key: 'shipped', description: 'Out for delivery' },
    { label: 'Delivered', key: 'delivered', description: 'Order completed' },
  ]

  let activeIndex = 0
  if (status === 'confirmed') activeIndex = 1
  if (status === 'shipped' || status === 'out_for_delivery') activeIndex = 2
  if (status === 'delivered') activeIndex = 3

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
          Order Progress
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-800 text-gold-400 capitalize">
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Mobile view: vertical stepper */}
      <div className="md:hidden space-y-4 pt-1">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex
          const isActive = idx === activeIndex

          return (
            <div key={step.label} className="flex items-center gap-3.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-gold-500 text-forest-900 shadow-xs'
                    : isActive
                    ? 'bg-forest-800 text-gold-400 border-2 border-gold-500 ring-4 ring-gold-500/20 shadow-xs'
                    : 'bg-cream-200/80 text-forest-400 border border-forest-200'
                }`}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <div>
                <p className={`text-sm font-bold ${isActive ? 'text-forest-900' : isCompleted ? 'text-forest-800' : 'text-forest-400'}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-forest-500">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop view: horizontal stepper */}
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

            return (
              <div key={step.label} className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gold-500 text-forest-900 shadow-sm'
                      : isActive
                      ? 'bg-forest-800 text-gold-400 border-2 border-gold-500 ring-4 ring-gold-500/20 shadow-sm'
                      : 'bg-cream-200 text-forest-400 border border-forest-200'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <p className={`text-xs font-bold mt-2.5 ${isActive ? 'text-forest-950 font-extrabold' : isCompleted ? 'text-forest-900' : 'text-forest-400'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-forest-500 mt-0.5">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
