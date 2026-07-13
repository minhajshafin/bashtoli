import React from 'react'

export const metadata = {
  title: 'Our Story & Artisans | Bashtoli',
  description: 'Learn about our heritage of hand-weaving bamboo and cane handicraft items in Bangladesh.',
}

/**
 * Storefront About Us Page.
 * Renders the business heritage, artisan partnerships, and materials selection details.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* 1. Header segment */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight sm:text-5xl">
          Crafting a Greener Tomorrow
        </h1>
        <p className="text-base text-zinc-550 leading-relaxed dark:text-zinc-400">
          Bashtoli was founded with a simple vision: to celebrate the timeless beauty of Bangladeshi hand-weaving heritage while supporting the rural artisan communities who keep it alive.
        </p>
      </div>

      {/* 2. Visual Story Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 space-y-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Artisan First</h2>
          <p className="text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
            Every basket, chair, and tray we offer is crafted by hand. We partner directly with family cooperatives in rural districts, ensuring fair wages, safe working conditions, and sustainable livelihoods for weavers and their families.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 space-y-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m.5-8.5a6.7 6.7 0 11-1.8 4.75" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Truly Sustainable</h2>
          <p className="text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
            Bamboo and cane are incredibly fast-growing, renewable resources that absorb carbon dioxide and require no toxic pesticides. Our production methods are completely organic and leave a minimal ecological footprint.
          </p>
        </div>
      </div>

      {/* 3. Detailed Mission Narrative Segment */}
      <div className="bg-stone-50 border border-zinc-200/80 rounded-3xl p-8 dark:bg-zinc-900/20 dark:border-zinc-850 space-y-4">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white">Our Craftsmanship Journey</h2>
        <div className="text-xs text-zinc-550 leading-relaxed dark:text-zinc-400 space-y-3">
          <p>
            In the local language, <em>Bashtoli</em> translates to &ldquo;the place of bamboo.&rdquo; Across the rural floodplains of Bangladesh, bamboo and cane harvesting has been an integral part of community life for generations. Artisans weave these natural materials to create highly durable structures, household items, and storage units.
          </p>
          <p>
            By designing modern functional home goods that blend traditional weave patterns with contemporary minimalist aesthetics, we strive to bring these organic materials into urban homes worldwide. Thank you for supporting sustainable design and artisanal crafts.
          </p>
        </div>
      </div>
    </div>
  )
}
