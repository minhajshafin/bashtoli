'use client'

import React from 'react'
import Link from 'next/link'

interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3
}

/**
 * CheckoutSteps
 * Harmonized 3-step checkout stepper perfectly matching the aesthetic of /bag and the site.
 */
export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { number: 1, label: 'Shopping Bag', href: '/bag' },
    { number: 2, label: 'Delivery Details', href: '/checkout' },
    { number: 3, label: 'Confirmation', href: null },
  ]

  return (
    <nav aria-label="Checkout Progress" className="w-full max-w-md mx-auto mb-6 sm:mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isDone = currentStep > step.number
          const isCurrent = currentStep === step.number
          const isClickable = isDone && step.href

          const content = (
            <div className="flex items-center gap-2 group cursor-pointer">
              <div
                className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[11px] font-mono transition-colors ${
                  isDone
                    ? 'bg-forest-900 text-gold-400 border border-forest-800'
                    : isCurrent
                    ? 'bg-gold-500 text-forest-950 font-bold ring-2 ring-gold-400/30 shadow-xs'
                    : 'bg-cream-200/80 border border-forest-200 text-forest-500'
                }`}
              >
                {isDone ? (
                  <svg className="h-3 w-3 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              <span
                className={`text-xs font-sans transition-colors ${
                  isCurrent
                    ? 'font-semibold text-forest-950'
                    : isDone
                    ? 'font-medium text-forest-700 group-hover:text-forest-950'
                    : 'font-normal text-forest-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )

          return (
            <React.Fragment key={step.number}>
              <li className="flex items-center">
                {isClickable ? (
                  <Link href={step.href!} className="no-underline">
                    {content}
                  </Link>
                ) : (
                  <div>{content}</div>
                )}
              </li>

              {idx < steps.length - 1 && (
                <li
                  aria-hidden="true"
                  className={`flex-1 mx-2.5 sm:mx-4 h-px transition-colors ${
                    currentStep > step.number ? 'bg-gold-500/60' : 'bg-forest-200/80'
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
