'use client'

import React from 'react'

interface WhatsAppLinkProps {
  orderNumber: string
}

export function WhatsAppLink({ orderNumber }: WhatsAppLinkProps) {
  // Read WhatsApp contact number from client environment or use fallback
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801700000000'
  
  // Format confirmation message template
  const message = `Hello Bashtoli, I would like to confirm my order ${orderNumber}.`
  const deepLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={deepLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* WhatsApp SVG brand logo */}
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.566 0 10.1-4.507 10.103-10.03.001-2.675-1.03-5.188-2.906-7.07C16.59 1.63 14.09 1.05 11.989 1.05 6.42 1.05 1.884 5.558 1.88 11.082c-.001 1.558.423 3.082 1.23 4.426l-1.036 3.79 3.973-1.044h.01zm11.367-6.52c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      </svg>
      Confirm via WhatsApp
    </a>
  )
}
