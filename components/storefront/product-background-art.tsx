import React from 'react'

/**
 * ProductBackgroundArt
 * Renders handcrafted botanical bamboo artwork, archival laid-paper dot grid,
 * and delicate drifting ink-wash foliage for the Product Detail Page.
 * Pure SVG, non-intrusive (pointer-events-none, absolute positioning, zero layout shift).
 */
export function ProductBackgroundArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Ambient Warm Laid-Paper Radial Light */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(255, 253, 248, 0.7) 0%, rgba(246, 240, 228, 0.3) 55%, transparent 80%)',
        }}
      />

      {/* 2. Delicate Stationery Dot-Grid Pattern (Archival Journal Paper) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035] text-forest-950"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="stationery-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stationery-dots)" />
      </svg>

      {/* 3. Top-Right Botanical Bamboo Spray (Arching above product info) */}
      <svg
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-12 -right-16 sm:-right-8 w-[380px] sm:w-[480px] lg:w-[560px] max-w-none text-forest-900/[0.08] transition-opacity duration-700"
      >
        {/* Main curved culm stem */}
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {/* Main arching branch */}
          <path d="M580 10 C460 60, 360 140, 280 260" strokeWidth="3" />
          <path d="M280 260 C240 320, 200 390, 170 460" strokeWidth="2" strokeDasharray="95 3 60 2" />

          {/* Node rings */}
          <path d="M510 40 C506 48, 514 53, 518 45" strokeWidth="2.5" />
          <path d="M420 95 C416 103, 424 108, 428 100" strokeWidth="2.5" />
          <path d="M340 180 C336 188, 344 193, 348 185" strokeWidth="2.2" />
          <path d="M280 260 C276 268, 284 273, 288 265" strokeWidth="2" />

          {/* Lateral branchlets */}
          <path d="M512 45 C460 65, 410 70, 360 60" strokeWidth="1.5" />
          <path d="M422 100 C370 120, 330 150, 300 200" strokeWidth="1.5" />
          <path d="M342 185 C290 200, 240 230, 210 270" strokeWidth="1.3" />
          <path d="M282 265 C240 280, 200 310, 170 360" strokeWidth="1.2" />
        </g>

        {/* Sumi-e Leaf Clusters (Layered fills) */}
        <g fill="currentColor">
          {/* Cluster 1 - Upper stem */}
          <path d="M360 60 C320 50, 270 55, 230 75 C270 68, 310 68, 360 60 Z" />
          <path d="M360 60 C330 75, 290 100, 260 130 C290 105, 325 85, 360 60 Z" />
          <path d="M360 60 C340 40, 305 25, 270 20 C295 35, 330 45, 360 60 Z" />

          {/* Cluster 2 - Mid branchlet */}
          <path d="M300 200 C260 185, 210 190, 170 215 C210 205, 250 205, 300 200 Z" />
          <path d="M300 200 C270 215, 235 240, 205 275 C235 248, 268 228, 300 200 Z" />
          <path d="M300 200 C280 180, 250 160, 215 150 C240 168, 270 185, 300 200 Z" />

          {/* Cluster 3 - Lower branchlet */}
          <path d="M210 270 C175 260, 130 270, 95 295 C135 282, 175 280, 210 270 Z" />
          <path d="M210 270 C185 288, 155 315, 130 350 C155 320, 185 298, 210 270 Z" />

          {/* Delicate flutter leaves */}
          <path d="M422 100 C400 80, 365 75, 330 80 C360 88, 395 95, 422 100 Z" />
          <path d="M342 185 C320 160, 290 150, 255 155 C285 168, 315 178, 342 185 Z" />
        </g>
      </svg>

      {/* 4. Bottom-Left Ascending Bamboo Grove Stems (Anchoring photo column) */}
      <svg
        viewBox="0 0 500 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -bottom-16 -left-16 sm:-left-8 w-[340px] sm:w-[440px] lg:w-[500px] max-w-none text-forest-900/[0.07]"
      >
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {/* Stem 1 (tall slender upright) */}
          <path d="M80 620 C90 480, 110 320, 140 160" strokeWidth="2.8" />
          <path d="M140 160 C155 80, 175 20, 195 -30" strokeWidth="2" strokeDasharray="90 3 60 2" />
          {/* Node rings on Stem 1 */}
          <path d="M88 510 C96 507, 104 507, 112 510" strokeWidth="2.5" />
          <path d="M102 380 C110 377, 118 377, 126 380" strokeWidth="2.3" />
          <path d="M124 240 C132 237, 140 237, 148 240" strokeWidth="2" />
          <path d="M140 160 C148 157, 156 157, 164 160" strokeWidth="1.8" />

          {/* Stem 2 (gently curving offshoot) */}
          <path d="M140 620 C145 520, 160 410, 185 290" strokeWidth="2.2" />
          <path d="M185 290 C205 190, 235 110, 270 40" strokeWidth="1.6" />
          {/* Node rings on Stem 2 */}
          <path d="M152 470 C160 467, 168 467, 176 470" strokeWidth="2" />
          <path d="M172 340 C180 337, 188 337, 196 340" strokeWidth="1.8" />
          <path d="M210 200 C218 197, 226 197, 234 200" strokeWidth="1.5" />

          {/* Side shoots */}
          <path d="M102 380 C135 365, 170 360, 205 365" strokeWidth="1.4" />
          <path d="M124 240 C160 220, 195 210, 235 215" strokeWidth="1.4" />
          <path d="M172 340 C210 320, 250 310, 290 315" strokeWidth="1.2" />
          <path d="M140 160 C180 140, 220 135, 260 145" strokeWidth="1.2" />
        </g>

        {/* Sumi-e Leaves */}
        <g fill="currentColor">
          {/* Shoot 1 foliage */}
          <path d="M205 365 C240 350, 280 355, 310 375 C275 368, 240 368, 205 365 Z" />
          <path d="M205 365 C235 380, 265 405, 290 435 C265 410, 235 390, 205 365 Z" />
          <path d="M205 365 C225 345, 255 330, 290 325 C265 340, 235 352, 205 365 Z" />

          {/* Shoot 2 foliage */}
          <path d="M235 215 C270 200, 310 202, 345 220 C310 215, 270 215, 235 215 Z" />
          <path d="M235 215 C265 230, 295 250, 320 280 C295 255, 265 238, 235 215 Z" />

          {/* Crown foliage */}
          <path d="M260 145 C295 130, 335 132, 370 150 C335 145, 295 145, 260 145 Z" />
          <path d="M270 40 C305 25, 345 25, 380 40 C345 36, 305 37, 270 40 Z" />
          <path d="M270 40 C295 55, 320 75, 345 100 C320 80, 295 65, 270 40 Z" />
        </g>
      </svg>

      {/* 5. Gold Brushstroke & Seal Watermark Accent (Subtle Artisanal Mark in corner) */}
      <div className="hidden lg:block absolute bottom-6 right-10 opacity-30 pointer-events-none">
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Weathered seal boundary */}
          <rect
            x="4"
            y="4"
            width="72"
            height="72"
            rx="12"
            stroke="#a33327"
            strokeWidth="1.5"
            strokeDasharray="60 2 40 2"
            className="opacity-40"
          />
          <text
            x="40"
            y="36"
            textAnchor="middle"
            fill="#a33327"
            fillOpacity="0.45"
            fontSize="15"
            fontFamily="serif"
            fontWeight="600"
          >
            বাঁশতলী
          </text>
          <text
            x="40"
            y="56"
            textAnchor="middle"
            fill="#a33327"
            fillOpacity="0.35"
            fontSize="7"
            fontFamily="sans-serif"
            letterSpacing="0.16em"
          >
            DHAKA · ২০২৬
          </text>
        </svg>
      </div>

      {/* 6. Poetic Fallen Bamboo Leaves Settled on the Canvas */}
      <div
        className="absolute top-1/4 right-[42%] w-12 h-6 opacity-60 pointer-events-none hidden xl:block"
        style={{ transform: 'rotate(32deg)' }}
      >
        <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-forest-900/10">
          <path d="M2 16 C16 6, 42 6, 62 16 C42 22, 16 22, 2 16 Z" fill="currentColor" />
          <path d="M2 16 C20 15, 40 15, 58 16" stroke="#f6f0e4" strokeWidth="0.75" strokeOpacity="0.6" strokeLinecap="round" />
        </svg>
      </div>
      <div
        className="absolute bottom-1/3 left-[44%] w-10 h-5 opacity-50 pointer-events-none hidden xl:block"
        style={{ transform: 'rotate(-24deg)' }}
      >
        <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-forest-900/10">
          <path d="M2 16 C16 6, 42 6, 62 16 C42 22, 16 22, 2 16 Z" fill="currentColor" />
          <path d="M2 16 C20 15, 40 15, 58 16" stroke="#f6f0e4" strokeWidth="0.75" strokeOpacity="0.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
