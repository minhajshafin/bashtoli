import React from 'react'
import Image from 'next/image'
import { BambooPaperWatermark, DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'

export function AboutSection() {
  return (
    <section
      id="aboutus"
      className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-forest-950 bg-laid-paper-dark text-cream-50 scroll-mt-20 border-y border-forest-800/80"
    >
      {/* Blind-Debossed Pulp Watermark + Minimalist Drifting Leaf Motif */}
      <BambooPaperWatermark
        theme="dark"
        className="-left-14 top-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 opacity-35 pointer-events-none"
      />
      <DriftingBambooLeaf
        theme="dark"
        className="right-8 sm:right-16 bottom-6 hidden sm:block opacity-40 pointer-events-none"
        rotation={-18}
        scale={1.1}
      />

      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center">
        {/* Left: Minimal Archival Photo in Antique Brass Glint Frame */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[160px] sm:max-w-[260px] lg:max-w-[290px]">
            <div className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-forest-900/80 border border-gold-500/30 shadow-elevation-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg sm:rounded-xl bg-forest-950 shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1694754920848-8855ee3ff364?w=800&h=1000&fit=crop&auto=format"
                  alt="Cozy stationery setup with handcrafted journal and fountain pen"
                  fill
                  sizes="(max-width: 640px) 160px, (max-width: 1024px) 260px, 290px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Editorial Narrative in Deep Forest (Tone 1 Inversion) */}
        <div className="lg:col-span-7 text-left max-w-xl">
          {/* Subtle Overline Kicker */}
          <div className="hidden sm:flex items-center gap-2 mb-2 sm:mb-3">
            <span className="h-px w-3 sm:w-4 bg-gold-400/70" />
            <span className="type-kicker text-gold-400">
              Our Story &middot; Dhaka, Est. 2026
            </span>
          </div>

          {/* Statement Headline */}
          <h2 className="type-heading font-medium text-cream-50 mb-2 sm:mb-3">
            Born from a love of{' '}
            <em className="font-editorial italic font-normal text-gold-300">
              beautiful things
            </em>
            <span className="text-gold-400">.</span>
          </h2>

          {/* Editorial Lead Hook */}
          <p className="type-lead text-cream-100/90 font-normal mb-2.5 sm:mb-3">
            A quiet corner in Dhaka for anyone who finds joy in the tactile act of putting pen to paper.
          </p>

          {/* Body Narrative */}
          <p className="hidden sm:block type-body-sm leading-relaxed text-forest-200/80 font-normal">
            Bashtoli began as a modest weekend stall — born from a fondness for fountain pens, honest bamboo paper, and stationery made with care. Every notebook, pencil, and paper pack is held, tested, and handwritten with before it earns a spot on our shelves.
          </p>

          {/* Minimal Footnote Quote */}
          <div className="hidden sm:block pt-2.5 mt-3 sm:pt-3.5 sm:mt-4 border-t border-forest-800/80">
            <blockquote className="font-editorial italic text-gold-200/90 type-body-sm leading-relaxed">
              &ldquo;A notebook is a letter to your future self.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
