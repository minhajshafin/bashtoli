'use client'

import React from 'react'
import Link from 'next/link'

interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3
  variant?: 'light' | 'dark'
  className?: string
}

/**
 * CheckoutSteps
 * Sleek modern 3-step segmented progress track supporting light cream and deep forest green canvases.
 */
export function CheckoutSteps({ currentStep, variant = 'light', className = '' }: CheckoutStepsProps) {
  const isDark = variant === 'dark'

  const steps = [
    { number: 1, label: 'Shopping Bag', shortLabel: 'Bag', href: '/bag' },
    { number: 2, label: 'Delivery Details', shortLabel: 'Delivery', href: '/checkout' },
    { number: 3, label: 'Confirmation', shortLabel: 'Receipt', href: null },
  ]

  return (
    <nav aria-label="Checkout Progress" className={`w-full ${className}`}>
      <ol className="grid grid-cols-3 gap-2 sm:gap-3">
        {steps.map((step) => {
          const isDone = currentStep > step.number
          const isCurrent = currentStep === step.number
          const isClickable = isDone && step.href

          const content = (
            <div className="flex flex-col gap-1.5 group cursor-pointer transition-all">
              {/* Top Hairline Progress Bar */}
              <div
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-gold-400 shadow-xs'
                    : isDone
                    ? isDark
                      ? 'bg-gold-500/50'
                      : 'bg-forest-900/60'
                    : isDark
                    ? 'bg-forest-800/60'
                    : 'bg-forest-200/60'
                }`}
              />

              {/* Step Label & Number */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span
                  className={`text-[10px] sm:text-[11px] font-mono font-bold transition-colors ${
                    isCurrent
                      ? isDark
                        ? 'text-gold-300'
                        : 'text-forest-950'
                      : isDone
                      ? isDark
                        ? 'text-gold-400/80 group-hover:text-gold-300'
                        : 'text-forest-700'
                      : isDark
                      ? 'text-cream-300/40'
                      : 'text-forest-400'
                  }`}
                >
                  0{step.number}
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-sans tracking-wide transition-colors truncate ${
                    isCurrent
                      ? isDark
                        ? 'font-semibold text-cream-50'
                        : 'font-semibold text-forest-950'
                      : isDone
                      ? isDark
                        ? 'font-medium text-cream-200/80 group-hover:text-cream-50'
                        : 'font-medium text-forest-700'
                      : isDark
                      ? 'font-normal text-cream-300/40'
                      : 'font-normal text-forest-400'
                  }`}
                >
                  <span className="sm:hidden">{step.shortLabel}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                </span>
                {isDone && (
                  <span className={`text-[10px] font-bold ${isDark ? 'text-gold-400' : 'text-forest-700'}`}>✓</span>
                )}
              </div>
            </div>
          )

          return (
            <li key={step.number}>
              {isClickable ? (
                <Link href={step.href!} className="no-underline block">
                  {content}
                </Link>
              ) : (
                <div>{content}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
