import React from 'react'

export const metadata = {
  title: 'About Us | Bashtoli Stationery',
  description: 'Learn about Bashtoli Stationery — your friendly neighbourhood shop for pens, pencils, notebooks, pouches and everyday stationery essentials in Dhaka.',
  alternates: {
    canonical: 'https://bashtoli.com/about',
  },
  openGraph: {
    title: 'About Us | Bashtoli Stationery',
    description: 'Learn about Bashtoli Stationery — your friendly neighbourhood shop for pens, pencils, notebooks, pouches and everyday stationery essentials in Dhaka.',
    url: 'https://bashtoli.com/about',
    siteName: 'Bashtoli Stationery',
    locale: 'en_US',
    type: 'website',
  },
}

/**
 * Storefront About Us Page.
 * Renders the Bashtoli Stationery brand story and key selling points.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* 1. Header segment */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight sm:text-5xl">
          Your Neighbourhood Stationery Shop
        </h1>
        <p className="text-base text-zinc-550 leading-relaxed dark:text-zinc-400">
          Bashtoli Stationery was started with one simple goal: to be the go-to place where students,
          parents, professionals, and everyone in between can find the stationery they need — at honest prices,
          with a smile.
        </p>
      </div>

      {/* 2. Value Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 space-y-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500">
            {/* Pencil icon */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Everything in One Place</h2>
          <p className="text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
            From everyday ballpoint pens and sharpened pencils to premium notebooks, colourful pouches,
            pencil bags, and handy accessories like key rings — we stock a wide mixed range so you can
            pick up everything you need in a single stop.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 space-y-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-950/20 dark:text-orange-400">
            {/* Friendly shop icon */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Warm &amp; Approachable</h2>
          <p className="text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
            We are a local shop that genuinely cares about its community. Whether you are a school student
            stocking up for the new term, a parent buying supplies for your kids, or someone looking for a
            thoughtful little gift — we are always happy to help you find the right thing.
          </p>
        </div>
      </div>

      {/* 3. Detailed Brand Narrative */}
      <div className="bg-stone-50 border border-zinc-200/80 rounded-3xl p-8 dark:bg-zinc-900/20 dark:border-zinc-850 space-y-4">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white">Our Story</h2>
        <div className="text-xs text-zinc-550 leading-relaxed dark:text-zinc-400 space-y-3">
          <p>
            Bashtoli Stationery grew out of a love for the little everyday items that make a big difference —
            a pen that writes just right, a notebook that feels good to open, a pouch that keeps everything
            neatly in its place. We believe stationery is not just a necessity; it is something that can
            bring a little joy to your day.
          </p>
          <p>
            Our selection focuses on quality mixed stationery essentials — pens, pencils, paper, notebooks,
            pencil bags and pouches — along with accessories like key rings that we add based on what our
            customers actually want. We keep our range practical, well-priced, and curated with care.
          </p>
          <p>
            Thank you for choosing Bashtoli Stationery. We are glad to be your neighbourhood shop.
          </p>
        </div>
      </div>
    </div>
  )
}
