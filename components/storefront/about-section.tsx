import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AtelierChopSeal, BambooPaperWatermark, DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'

export function AboutSection() {
  return (
    <section
      id="aboutus"
      className="relative overflow-hidden py-14 sm:py-18 px-4 sm:px-6 lg:px-8 xl:px-10 bg-cream-100 bg-laid-paper border-b border-forest-200/80 scroll-mt-24"
    >
      {/* Blind-Debossed Pulp Watermark + Minimalist Drifting Leaf */}
      <BambooPaperWatermark theme="light" className="-right-10 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 opacity-60" />
      <DriftingBambooLeaf theme="light" className="left-10 bottom-6 hidden sm:block" rotation={28} scale={1.05} />

      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Archival Passe-Partout Photo Frame */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[380px]">
            {/* Authentic Cinnabar Atelier Chop Seal (Hankō / মোহর) */}
            <AtelierChopSeal size="md" className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 z-20" />

            <div className="p-3 rounded-[26px] bg-cream-50 border border-gold-500/30 shadow-atelier">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-cream-200 shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1694754920848-8855ee3ff364?w=800&h=1000&fit=crop&auto=format"
                  alt="Cozy stationery setup with handcrafted journal and fountain pen"
                  fill
                  sizes="(max-width: 768px) 320px, (max-width: 1024px) 360px, 400px"
                  className="object-cover"
                />
              </div>
            </div>
            {/* Subtle Craft Tag */}
            <div className="absolute -bottom-2.5 right-4 px-3.5 py-1 rounded-full bg-forest-950 text-[10px] uppercase tracking-widest text-gold-300 font-semibold font-sans shadow-md border border-forest-800">
              Dhaka Bamboo Atelier
            </div>
          </div>
        </div>

        {/* Narrative Text — Bold, Upright & Highly Readable */}
        <div className="lg:col-span-7 text-left max-w-2xl">
          <p
            className="mb-2 leading-relaxed font-display text-forest-900 text-lg sm:text-xl italic font-normal"
          >
            &ldquo;A notebook is a letter to your future self.&rdquo;
          </p>

          <h2
            className="mb-4 font-display font-medium text-forest-950 text-3xl sm:text-4xl md:text-5xl leading-tight tracking-[-0.015em]"
          >
            Born from a love of beautiful things
          </h2>

          <p
            className="text-sm sm:text-base leading-relaxed text-forest-800 font-normal mb-6 max-w-xl font-sans"
          >
            বাঁশতলী began as a weekend market stall in Dhaka — today it is a sanctuary for writers,
            calligraphers, and thoughtful creators who still find joy in putting ink to paper. Every notebook,
            brass pen, and deckle bamboo sheet is held, tested, and handwritten with before it earns shelf space.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm uppercase tracking-widest font-semibold rounded-full bg-forest-950 text-cream-100 hover:bg-gold-500 hover:text-forest-950 transition-all shadow-sm active:scale-98 font-sans"
            >
              <span>Explore Collection</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <span className="text-xs text-forest-600 font-sans tracking-wide">
              Est. 2026 · Bashtola, Dhaka
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
