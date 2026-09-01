import React from 'react'
import Link from 'next/link'

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
        <p className="text-xs font-bold uppercase tracking-widest text-gold-500">
          Our Heritage &amp; Craft
        </p>
        <h1
          className="text-4xl font-extrabold text-forest-900 tracking-tight sm:text-5xl"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Born from a love of beautiful things
        </h1>
        <p className="text-base text-forest-600 leading-relaxed">
          Bashtoli began with one simple goal: to be the destination where students,
          artists, writers, and anyone who still finds joy in putting ink to paper can find thoughtfully curated stationery.
        </p>
      </div>

      {/* 2. Value Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="bg-cream-100 border border-forest-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-300/30 text-forest-800">
            {/* Pencil icon */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </div>
          <h2
            className="text-lg font-bold text-forest-900"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Handpicked &amp; Tested
          </h2>
          <p className="text-xs text-forest-600 leading-relaxed">
            Every notebook, fountain pen, washi tape, and desk accessory is held, tested,
            and written with before it earns shelf space at Bashtoli.
          </p>
        </div>

        <div className="bg-cream-100 border border-forest-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-300/30 text-forest-800">
            {/* Friendly shop icon */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
          </div>
          <h2
            className="text-lg font-bold text-forest-900"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Warm &amp; Welcoming
          </h2>
          <p className="text-xs text-forest-600 leading-relaxed">
            We are a local stationery house that genuinely cares about our community.
            Whether you need a daily journal, a gift set, or fountain pen advice, we are here for you.
          </p>
        </div>
      </div>

      {/* 3. Detailed Brand Narrative */}
      <div className="bg-cream-100 border border-forest-200 rounded-3xl p-8 space-y-4">
        <h2
          className="text-xl font-bold text-forest-900"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Our Story
        </h2>
        <div className="text-xs text-forest-600 leading-relaxed space-y-3">
          <p>
            &ldquo;A notebook is a letter to your future self.&rdquo;
          </p>
          <p>
            বাঁশতলী began as a weekend market stall — today it is a destination for writers, artists, and anyone who still finds joy in putting ink to paper. Every item is held, tested, and written with before it earns shelf space.
          </p>
          <p>
            Thank you for choosing Bashtoli Stationery. We are glad to be your neighbourhood shop.
          </p>
        </div>
      </div>
    </div>
  )
}

