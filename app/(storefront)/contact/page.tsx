import React from 'react'

export const metadata = {
  title: 'Contact Us | Bashtoli',
  description: 'Reach out to our customer support team or visit our local showroom in Dhaka, Bangladesh.',
}

/**
 * Storefront Contact Us Page.
 * Renders support hotline, WhatsApp deep-link prompts, opening hours, and location address guides.
 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* 1. Header segment */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight sm:text-5xl">
          Get in Touch
        </h1>
        <p className="text-base text-zinc-550 leading-relaxed dark:text-zinc-400">
          Have any questions about our products, customization options, or bulk orders? We would love to hear from you.
        </p>
      </div>

      {/* 2. Contact details and opening hours grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Support hotline */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Hotline</p>
          <p className="text-lg font-black text-zinc-800 dark:text-zinc-200">+880 1700-000000</p>
          <p className="text-[11px] text-zinc-500 leading-relaxed dark:text-zinc-450">
            Speak directly with our support team for immediate help regarding orders or delivery updates.
          </p>
        </div>

        {/* WhatsApp chat */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">WhatsApp Support</p>
          <div className="pt-1">
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.566 0 10.1-4.507 10.103-10.03.001-2.675-1.03-5.188-2.906-7.07C16.59 1.63 14.09 1.05 11.989 1.05 6.42 1.05 1.884 5.558 1.88 11.082c-.001 1.558.423 3.082 1.23 4.426l-1.036 3.79 3.973-1.044h.01zm11.367-6.52c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed dark:text-zinc-450">
            Message us anytime. Our support agents usually respond within a few minutes.
          </p>
        </div>

        {/* Business hours */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Business Hours</p>
          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 space-y-1">
            <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed dark:text-zinc-450">
            Our physical showroom and support team operates within standard hours.
          </p>
        </div>
      </div>

      {/* 3. Physical Location & Map guide segment */}
      <div className="bg-stone-50 border border-zinc-200/80 rounded-3xl p-8 dark:bg-zinc-900/20 dark:border-zinc-850 space-y-6">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">Visit Our Dhaka Showroom</h2>
          <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
            Come explore our hand-woven catalogs in person.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-xs font-semibold text-zinc-550 leading-relaxed dark:text-zinc-400">
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Showroom Address</p>
              <p className="mt-1 font-bold text-zinc-800 dark:text-zinc-250">House 45, Road 11, Banani, Dhaka, Bangladesh</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Directions Guide</p>
              <p className="mt-1 font-normal text-zinc-500">
                Located right opposite the main Banani lakeside walk path, easily accessible from the Kemal Ataturk Avenue junction. Free street parking is available.
              </p>
            </div>
          </div>

          {/* Abstract map placeholder graphic */}
          <div className="relative aspect-video rounded-2xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-400 dark:border-zinc-850 dark:bg-zinc-900">
            <div className="text-center space-y-2">
              <svg className="mx-auto h-8 w-8 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-[10px] font-bold uppercase tracking-wider">Showroom Location Map</p>
              <p className="text-[9px] text-zinc-400/80 font-normal">Banani Road 11, Dhaka</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
