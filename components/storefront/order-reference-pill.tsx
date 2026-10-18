'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface OrderReferencePillProps {
  orderNumber: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * OrderReferencePill
 * Interactive 1-tap copy pill for order references (e.g. BSH-XXXX or ORD-XXXX).
 * Copies reference to clipboard with instant tactile feedback.
 */
export function OrderReferencePill({
  orderNumber,
  className = '',
  size = 'md',
}: OrderReferencePillProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(orderNumber)
      } else {
        // Fallback for older browsers / non-HTTPS
        const textarea = document.createElement('textarea')
        textarea.value = orderNumber
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch (err) {
      console.error('Failed to copy order reference:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCopy(e)
    }
  }

  const sizeClasses = {
    sm: 'text-xs py-1 px-3 gap-1.5',
    md: 'text-xs sm:text-sm py-1.5 px-3.5 gap-2',
    lg: 'text-sm sm:text-base py-2 px-4 gap-2.5',
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      aria-label={`Copy order reference ${orderNumber}`}
      title="Click to copy order reference"
      className={`group relative inline-flex items-center rounded-full bg-forest-900 border border-forest-800 text-gold-400 font-mono font-bold tracking-wider shadow-2xs hover:bg-forest-850 hover:border-gold-500/40 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-500 select-none ${sizeClasses[size]} ${className}`}
    >
      <span className="text-[10px] uppercase font-sans tracking-widest text-forest-400 font-semibold hidden xs:inline">
        Ref:
      </span>
      <span className="text-cream-100 font-bold">{orderNumber}</span>

      <span
        className={`inline-flex items-center justify-center rounded-full transition-all duration-200 ${
          copied
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-forest-800 text-gold-400 group-hover:text-gold-300 group-hover:bg-forest-750'
        } p-1`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 stroke-[2.5] text-emerald-400 animate-scale-in" />
        ) : (
          <Copy className="h-3.2 w-3.2 stroke-[2] opacity-80 group-hover:opacity-100" />
        )}
      </span>

      <span
        className={`text-[10px] font-sans font-semibold uppercase tracking-wider transition-all duration-200 ${
          copied ? 'text-emerald-400 font-bold' : 'text-forest-400 group-hover:text-forest-300'
        }`}
      >
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  )
}
