import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function AboutSection() {
  return (
    <section
      id="aboutus"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-cream-100 border-b border-forest-200/80 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-center">
        {/* Archival Passe-Partout Photo Frame */}
        <div className="relative shrink-0 w-full max-w-[280px] md:max-w-none md:w-64 lg:w-72">
          <div className="p-2.5 rounded-[24px] bg-cream-50 border border-gold-500/25 shadow-atelier">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-cream-200 shadow-inner">
              <Image
                src="https://images.unsplash.com/photo-1694754920848-8855ee3ff364?w=800&h=1000&fit=crop&auto=format"
                alt="Cozy stationery setup with handcrafted journal and fountain pen"
                fill
                sizes="(max-width: 768px) 280px, (max-width: 1024px) 256px, 288px"
                className="object-cover"
              />
            </div>
          </div>
          {/* Subtle Craft Tag */}
          <div className="absolute -bottom-2.5 right-4 px-3 py-1 rounded-full bg-forest-950 text-[10px] uppercase tracking-widest text-gold-300 font-semibold font-sans shadow-md border border-forest-800">
            Dhaka Atelier
          </div>
        </div>

        {/* Narrative Text */}
        <div className="flex-1 text-left">
          <p
            className="mb-2.5 leading-relaxed font-editorial text-forest-800 text-lg sm:text-xl italic"
          >
            &ldquo;A notebook is a letter to your future self.&rdquo;
          </p>

          <h2
            className="mb-3.5 font-editorial text-forest-950 text-2xl sm:text-3xl md:text-4xl font-normal leading-tight"
          >
            Born from a love of beautiful things
          </h2>

          <p
            className="text-xs sm:text-sm leading-relaxed text-forest-700 font-light mb-6 max-w-lg font-sans"
          >
            বাঁশতলী began as a weekend market stall in Dhaka — today it is a sanctuary for writers,
            calligraphers, and thoughtful creators who still find joy in putting ink to paper. Every notebook,
            brass pen, and deckle sheet is held, tested, and handwritten with before it earns shelf space.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-full bg-forest-950 text-cream-100 hover:bg-gold-500 hover:text-forest-950 transition-all shadow-sm active:scale-98"
            >
              <span>Explore Collection</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <span className="text-xs text-forest-500 font-sans tracking-wide">
              Est. 2026 · Bashtola, Dhaka
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
