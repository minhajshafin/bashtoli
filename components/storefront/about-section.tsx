import React from 'react'
import Image from 'next/image'
import {
  AtelierChopSeal,
  BambooPaperWatermark,
  DriftingBambooLeaf,
} from '@/components/storefront/bamboo-motifs'

export function AboutSection() {
  return (
    <section
      id="aboutus"
      className="relative overflow-hidden py-18 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-10 bg-cream-100 bg-laid-paper border-b border-forest-200/80 scroll-mt-24"
    >
      {/* Blind-Debossed Pulp Watermark + Minimalist Drifting Sumi-e Leaf */}
      <BambooPaperWatermark
        theme="light"
        className="-right-12 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 opacity-60"
      />
      <DriftingBambooLeaf
        theme="light"
        className="left-10 bottom-8 hidden sm:block"
        rotation={28}
        scale={1.05}
      />

      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Left: Archival Stationery Photo Mount */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[380px]">
            {/* Washi-Tape Header Strip holding the photo */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 w-32 sm:w-36 h-6 sm:h-7 bg-[#d9cca8]/90 backdrop-blur-xs shadow-xs border-y border-dashed border-[#b59f73]/50 -rotate-1 select-none flex items-center justify-center pointer-events-none"
              style={{
                clipPath:
                  'polygon(3% 0%, 97% 0%, 100% 15%, 98% 85%, 100% 100%, 0% 100%, 2% 85%, 0% 15%)',
              }}
            >
              <span className="text-[9px] uppercase tracking-[0.24em] font-sans font-semibold text-forest-950/70">
                Bashtoli Stationery
              </span>
            </div>

            {/* Authentic Cinnabar Chop Seal (Hankō / মোহর) */}
            <AtelierChopSeal
              size="md"
              className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 z-30"
            />

            {/* Passe-Partout Archival Art Mount */}
            <div className="p-3.5 sm:p-4 rounded-[26px] bg-cream-50 border border-gold-500/35 shadow-atelier">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-cream-200 shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1694754920848-8855ee3ff364?w=800&h=1000&fit=crop&auto=format"
                  alt="Cozy stationery setup with handcrafted journal and fountain pen"
                  fill
                  sizes="(max-width: 768px) 340px, (max-width: 1024px) 380px, 420px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Premium Editorial Narrative & Typography */}
        <div className="lg:col-span-7 text-left max-w-2xl">
          {/* Subtle Overline Kicker */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="h-px w-6 bg-gold-500/70" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-sans font-medium text-gold-700">
              About Bashtoli · Est. 2026
            </span>
          </div>

          {/* Statement Display Headline with Fluid Scale & Italic Contrast */}
          <h2 className="font-display font-medium text-forest-950 text-[clamp(2.1rem,4vw,3.6rem)] leading-[1.08] tracking-[-0.02em] text-balance mb-6">
            Born from a love of{' '}
            <em className="font-editorial italic font-normal text-forest-900">
              beautiful things
            </em>
            <span className="text-gold-600/80">.</span>
          </h2>

          {/* Editorial Lead Hook */}
          <p className="font-display text-forest-900 text-lg sm:text-xl lg:text-[1.35rem] leading-[1.5] font-normal text-pretty mb-5">
            A quiet neighbourhood corner in Dhaka for anyone who still finds joy in the simple, tactile act of putting pen to paper.
          </p>

          {/* Body Narrative */}
          <p className="text-sm sm:text-[15px] leading-[1.75] text-forest-800/90 font-sans font-normal text-pretty max-w-xl">
            বাঁশতলী began as a modest weekend stall — born from a fondness for fountain pens, honest bamboo paper, and stationery made with care. Every notebook, pencil, and paper pack is held, tested, and handwritten with before it earns a spot on our shelves.
          </p>

          {/* Editorial Epigraph Footnote */}
          <div className="pt-6 sm:pt-8 mt-7 sm:mt-8 border-t border-forest-200/60 max-w-xl">
            <blockquote className="font-display italic text-forest-900 text-base sm:text-lg leading-relaxed">
              &ldquo;A notebook is a letter to your future self.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
