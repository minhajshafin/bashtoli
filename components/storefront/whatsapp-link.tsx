'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'

interface WhatsAppLinkProps {
  orderNumber: string
  className?: string
  label?: string
}

export function WhatsAppLink({
  orderNumber,
  className = '',
  label = 'Confirm via WhatsApp',
}: WhatsAppLinkProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801825414737'
  const message = `Hello Bashtoli, I would like to inquire about my order ${orderNumber}.`
  const deepLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={deepLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} for order ${orderNumber}`}
      className={`inline-flex h-12 sm:h-11 items-center justify-center gap-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-750 text-cream-50 border border-emerald-700/60 px-5 text-xs sm:text-sm font-sans font-semibold shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 ${className}`}
    >
      <MessageCircle className="h-4 w-4 fill-emerald-300/30 text-emerald-300 shrink-0" />
      <span>{label}</span>
    </a>
  )
}
