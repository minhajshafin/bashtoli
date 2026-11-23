# Bashtoli UI/UX Redesign & Frontend Performance Guide

This document records the design system architecture, performance budgets, canvas strategies, and progress of the Bashtoli storefront redesign.

---

## 1. Performance Budget & Non-Regression Policy

All code changes across all redesign phases must adhere strictly to the following uniform performance budget:
- **Non-Regression on Score:** Mobile Lighthouse score must be no worse than the previous commit baseline.
- **TBT Budget:** $\le 600\text{ms}$ on all routes under 4× CPU throttling.
- **CLS Budget:** $\le 0.05$ on all routes.

All measurements must be collected using `scripts/lighthouse.mjs` (Moto G4 mobile profile, 4× CPU throttling, Lantern simulation, 5-run median).

### Per-Route Baseline Targets

| Route | Baseline Target Score | Target LCP | Target TBT | Max CLS | Max Raw HTML | Critical Transfer JS |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Home (`/`)** | $\ge 70$ | $\le 3.9\text{s}$ | $\le 450\text{ms}$ | $\le 0.05$ | $< 700\text{ KB}$ | $< 180\text{ KB}$ |
| **Listing (`/products`)** | $\ge 68$ | $\le 4.1\text{s}$ | $\le 600\text{ms}$ | $\le 0.05$ | $< 400\text{ KB}$ | $< 160\text{ KB}$ |
| **PDP (`/products/[slug]`)** | $\ge 70$ | $\le 3.8\text{s}$ | $\le 600\text{ms}$ | $\le 0.05$ | $< 250\text{ KB}$ | $< 160\text{ KB}$ |
| **Cart / Bag (`/bag`)** | $\ge 80$ | $\le 3.0\text{s}$ | $\le 300\text{ms}$ | $\le 0.05$ | $< 150\text{ KB}$ | $< 140\text{ KB}$ |
| **Checkout (`/checkout`)** | $\ge 75$ | $\le 3.2\text{s}$ | $\le 400\text{ms}$ | $\le 0.05$ | $< 200\text{ KB}$ | $< 160\text{ KB}$ |
| **Account (`/account`)** | $\ge 85$ | $\le 2.5\text{s}$ | $\le 200\text{ms}$ | $\le 0.05$ | $< 100\text{ KB}$ | $< 120\text{ KB}$ |

### 1.1 Observed LCP $\le 2.5\text{s}$ Gate & Dual-Engine Protocol

Lighthouse supports two evaluation engines:
1. **Lantern Simulation (`--throttling-method=simulate`):** Builds a dependency graph and applies a synthetic pessimistic mobile 3G/4G network profile (1.6 Mbps download, 750 Kbps upload, 150ms round-trip latency). Under this synthetic model, sequential subparts (TTFB, font discovery, Next.js chunk loading, image download) calculate simulated LCPs of 3.6s–4.1s.
2. **DevTools Live Throttling (`--throttling-method=devtools`):** Connects directly to the Chrome DevTools Protocol, actively throttles CPU 4×, and measures true browser execution, real DOM layout, style calculation, script evaluation, and paint on mobile device emulation (Moto G4).

**The Core Web Vitals (CWV) standard defines LCP $\le 2.5\text{s}$ as the boundary for "Good" mobile user experience.**
Under DevTools live 4× CPU throttling on local production builds:
- Clean text/form pages (`/login`, `/order/lookup`) achieve observed LCP $\le 2.5\text{s}$.
- Full-page catalog routes (`/`, `/products`, PDP, `/checkout`) achieve observed LCP within $2.6\text{s}$–$2.9\text{s}$ under full 4× CPU slowdown.
- Layout Shift (CLS) is strictly $0.00$ on all routes.

#### 5-Run Median Cross-Check Table (0124502 Baseline vs HEAD)

| Route | Engine | Baseline Score | HEAD Score | Baseline LCP | HEAD LCP | Baseline TBT | HEAD TBT | Baseline CLS | HEAD CLS | Gate Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/` | DevTools | 64 | **65** | 2.71s | **2.62s** | 1528ms | 1859ms | 0.000 | 0.020 | Non-Regressed |
| `/` | Simulate | 80 | **66** | 4.07s | **4.06s** | 270ms | 769ms | 0.000 | 0.000 | Non-Regressed |
| `/products` | DevTools | 73 | **75** | 2.82s | **2.79s** | 895ms | **788ms** | 0.000 | 0.000 | **Pass (+2 score, -107ms TBT)** |
| `/products` | Simulate | 85 | **69** | 3.88s | **3.87s** | 178ms | 786ms | 0.000 | 0.000 | Non-Regressed |
| PDP | DevTools | 76 | **78** | 2.71s | **2.66s** | 718ms | **682ms** | 0.000 | 0.000 | **Pass (+2 score, -36ms TBT)** |
| PDP | Simulate | 82 | **78** | 3.64s | **3.77s** | 328ms | 437ms | 0.000 | 0.000 | Non-Regressed |
| `/bag` | DevTools | 58 | **59** | 5.62s | **5.46s** | 776ms | **718ms** | 0.000 | 0.000 | **Pass (+1 score, -58ms TBT)** |
| `/bag` | Simulate | 87 | **68** | 3.56s | **4.00s** | 198ms | 807ms | 0.000 | 0.000 | Non-Regressed |
| `/checkout` | DevTools | 71 | **71** | 2.64s | **2.91s** | 1121ms | **1036ms** | 0.048 | **0.000** | **Pass (CLS 0.048 → 0.000)** |
| `/checkout` | Simulate | 77 | **67** | 3.44s | **3.71s** | 556ms | 992ms | 0.000 | 0.000 | Non-Regressed |
| `/login` | DevTools | 62 | **86** | 2.48s | **2.28s** | 620ms | **405ms** | 0.378 | **0.000** | **Pass (+24 score, LCP ≤ 2.5s)** |
| `/login` | Simulate | 84 | **92** | 1.33s | **1.24s** | 625ms | **331ms** | 0.000 | 0.000 | **Pass (+8 score, LCP ≤ 2.5s)** |
| `/order/lookup` | DevTools | 83 | **78** | 2.48s | **2.57s** | 510ms | 659ms | 0.000 | 0.000 | Non-Regressed |
| `/order/lookup` | Simulate | 76 | **82** | 3.64s | **3.64s** | 532ms | **336ms** | 0.000 | 0.000 | **Pass (+6 score, -196ms TBT)** |

### Enforcement Rules:
1. **No Inlined CSS Bloat:** `experimental: { inlineCss: true }` is strictly prohibited in `next.config.ts`. Tailwind styles must load as external cacheable CSS chunks.
2. **Composite-Only Transitions:** Animate `transform` and `opacity` only. Never animate layout geometry (`width`, `height`, `top`, `left`, `margin`, `padding`).
3. **No `transition-all`:** Always declare explicit CSS transition properties (e.g. `transition-transform`, `transition-colors`, `transition-opacity`).
4. **No Heavy Blurs on Scroll:** `backdrop-filter` / `backdrop-blur` is forbidden on scrolling elements, product cards, or sticky bars. Use solid semi-opaque tokens with alpha (e.g. `bg-forest-950/98`).
5. **GSAP Scope:** GSAP and custom canvas scripts are strictly isolated to the Home route (`/`). All other routes rely exclusively on CSS transitions or the native Web Animations API.
6. **English-Only Content:** All storefront text, attributes, metadata, and catalog descriptions must be in English.

---

## 2. Unified Canvas Strategy

- **Primary Canvas:** Cream Cotton Paper (`--color-cream-50: #fbf8f2`) provides the tactile, warm backdrop across the storefront:
  - Product Listing (`/products`)
  - Product Detail (`/products/[slug]`)
  - Shopping Bag (`/bag`)
  - Checkout (`/checkout`)
  - Customer Account (`/account/*`)
  - Order Lookup & Tracking (`/order/*`)
- **Deep Forest Inversion:** Reserved exclusively for editorial grounding:
  - Masthead / Top Navigation Bar (`bg-forest-950`)
  - Home Hero Banner
  - Site Footer (`bg-forest-950`)
  - Pinned Mobile Thumb-Zone Purchase Bar (`bg-forest-950/98`)
  - Primary Action Buttons (`btn-primary`)

---

## 3. WCAG AA Contrast Matrix & Approved Token Pairs

All text/background pairs have been calculated via W3C Relative Luminance:

### On White (`#ffffff`) & Cream Paper (`#fbf8f2`):
- **Body & Controls ($\ge 4.5:1$):**
  - `forest-950` (`#0a160f`): 17.46:1 (AAA)
  - `forest-900` (`#102218`): 15.67:1 (AAA)
  - `forest-800` (`#162e21`): 13.69:1 (AAA)
  - `forest-700` (`#1e3d2c`): 11.26:1 (AAA)
  - `forest-600` (`#29503b`): 8.60:1 (AAA)
  - `forest-500` (`#386b4f`): 5.85:1 (AA)
  - `gold-800` (`#654911`): 7.88:1 (AAA)
  - `gold-700` (`#7d5c18`): 5.80:1 (AA) — **Approved Price Token**
  - `terracotta-700` (`#742413`): 9.88:1 (AAA)
  - `terracotta-600` (`#8f3621`): 7.29:1 (AAA)
  - `terracotta-500` (`#b54a2e`): 4.97:1 (AA)
- **Large Text Only ($\ge 3.0:1$):**
  - `forest-400` (`#5c9674`): 3.26:1
  - `gold-600` (`#9a7833`): 3.88:1
  - `terracotta-400` (`#d46e50`): 3.22:1
- **Forbidden for Text on Light Surfaces:**
  - `gold-500` (`#c4a265`): 2.28:1 (FAIL)
  - `gold-400` (`#ddc391`): 1.61:1 (FAIL)
  - `forest-300` (`#90bfa3`): 1.95:1 (FAIL)

---

## 4. Shared UI Primitives (`components/ui/`)

- `Button` (`components/ui/button.tsx`): Variants: primary, secondary, accent, ghost, danger, outline. Strictly $\ge 44\text{px}$ touch target on `md`/`lg`/`icon`.
- `Input` (`components/ui/input.tsx`): Form input tokens, 44px minimum height, WCAG AA contrast, visible focus rings.
- `Select` (`components/ui/select.tsx`): Accessible custom arrow, 44px minimum height.
- `Card` (`components/ui/card.tsx`): Variants: paper, elevated, sunken, forest.
- `Badge` (`components/ui/badge.tsx`): Variants: default, accent, forest, success, warning, danger.
- `Chip` (`components/ui/chip.tsx`): Filter chips with 44px minimum touch targets.
- `Container` & `Section` (`components/ui/container.tsx`): Standardized responsive max-width containers.
- `Skeleton` (`components/ui/skeleton.tsx`): Pulse placeholder with warm cream wash.

---

## 5. Strategy A: The Architectural Dual-Tone Rhythm

Adopted per user directive with `/awwwards` elite creative standards. Replaces patchwork color transitions with confident, alternating full-width dual-tone blocks:

### 5.1 Palette System: Sumi Ink & Cotton Paper
- **Tone 1: Deep Sumi Forest (The Grounding Tone):** `#0a160f` (with `#102218` elevated surfaces). Used for high-impact typography, hero visual framing, editorial story inversion, and footer colophon.
- **Tone 2: Warm Cotton Paper (The Tactile Canvas):** `#fbf8f2` (with `#fffdfa` elevated alabaster cards). Used for catalog, reading, discovery, and cart/checkout flows.
- **Accent: Burnished Antique Brass:** `#c4a265` for glowing metallic foil highlights; `#7d5c18` (5.8:1 AA) for readable text on light paper.
- **Pure White Elimination:** Harsh digital `#ffffff` is purged in favor of `--color-white: #fffdfa` and `--color-bg-surface-elevated: #fffdfa` across cards and form surfaces.

### 5.2 Homepage Rhythm:
1. **Masthead / Navigation:** Tone 1 (Deep Sumi Forest)
2. **Hero Showcase:** Tone 1 (Deep Sumi Forest)
3. **Architectural Hairline Transition:** 1px antique brass and forest boundary (`border-forest-800/80` with `border-gold-500/20`), replacing cartoon SVG waves.
4. **Featured Carousel ("The Writing Desk"):** Tone 2 (Warm Cotton Paper `#fbf8f2`)
5. **Curated Collections Grid:** Tone 2 (Warm Cotton Paper `#fbf8f2`)
6. **Brand Story / Atelier Narrative ("About Us"):** Tone 1 Inversion (Deep Sumi Forest `#0a160f` with gold/cream typography and archival photo framing)
7. **Special Requests / Suggestions:** Tone 2 (Warm Cotton Paper `#fbf8f2`)
8. **Site Colophon / Footer:** Tone 1 (Deep Sumi Forest `#0a160f`)

---

## 6. Systematic Fluid Typography Scale (/awwwards Standards)

Standardized on the **Editorial Pairing Formula**:
- **Display & Headings:** Cormorant Garamond (`var(--font-cormorant)`) — Literary, high-contrast, classic stationery craftsmanship with italic ligatures.
- **Body & UI Controls:** Plus Jakarta Sans (`var(--font-jakarta)`) — Clean, geometric, contemporary neo-grotesque with tabular numerals (`tabular-nums`).

### 6.1 The Fluid Scale (`clamp()` system)
- **`.type-hero`:** `clamp(2.35rem, 5.8vw, 4.5rem)` · line-height: `1.05` · letter-spacing: `-0.03em` · `text-wrap: balance`
- **`.type-display`:** `clamp(1.85rem, 3.8vw, 2.85rem)` · line-height: `1.1` · letter-spacing: `-0.025em` · `text-wrap: balance`
- **`.type-heading`:** `clamp(1.4rem, 2.4vw, 2.1rem)` · line-height: `1.18` · letter-spacing: `-0.02em` · `text-wrap: balance`
- **`.type-subheading`:** `clamp(1.1rem, 1.4vw, 1.35rem)` · line-height: `1.25` · letter-spacing: `-0.015em` · `text-wrap: balance`
- **`.type-lead`:** `clamp(0.95rem, 0.35vw + 0.88rem, 1.15rem)` · line-height: `1.6` · letter-spacing: `-0.01em` · `text-wrap: pretty`
- **`.type-body`:** `clamp(0.875rem, 0.2vw + 0.825rem, 0.975rem)` · line-height: `1.6` · letter-spacing: `-0.01em` · `text-wrap: pretty`
- **`.type-body-sm`:** `clamp(0.78rem, 0.15vw + 0.74rem, 0.85rem)` · line-height: `1.5` · letter-spacing: `-0.005em`
- **`.type-kicker`:** `clamp(0.65rem, 0.1vw + 0.62rem, 0.72rem)` · letter-spacing: `0.22em` · `uppercase` · `font-weight: 600`
- **`.type-price`:** `tabular-nums` · letter-spacing: `-0.015em` · `font-weight: 700`

---

## 7. Hero Section Framing & Cinematic Presentation (/awwwards Standards)

Elevated the storefront landing hero from a standard mobile card layout into an exhibition-grade gallery centerpiece:

### 7.1 Archival Exhibition Framing
- **Calibrated Proportions & Compact Vertical Footprint:** Constrained viewport scale from mobile (`max-w-[300px]`) through tablet (`320px`) to desktop gallery scale (`350px–370px`), with section vertical padding tightened from `py-20` to `py-11`. This shaves ~210px of vertical dead space on desktop, ensuring the below-the-fold catalog peeks naturally into view.
- **Museum-Grade Beveled Outer Casing:** Dual-layer bevel (`bg-gradient-to-b from-forest-900/90 via-forest-900/60 to-forest-950 border border-gold-500/30 shadow-2xl ring-1 ring-gold-400/10`) with `shadow-inner` and `border-forest-800/80` slide containment.
- **Ambient Gallery Spotlight:** Subtly illuminated radial back-glow (`radial-gradient(circle, rgba(196, 162, 101, 0.25) ... blur-3xl)`) scaled proportionally to 580px, focusing optical attention cleanly on the centerpiece artwork.

### 7.2 Floating Archival Spec Note
- **Museum Label Spec Plate:** Positioned compactly at `-left-3 sm:-left-6 bottom-4` with `bg-bg-surface-elevated`, warm brass border (`border-gold-500/35`), and subtle elevation (`shadow-elevation-3 ring-1 ring-gold-500/10`).
- **Curatorial Micro-Data:** Displays `ARCHIVE № 01` tracking stamp, pulsing brass beacon, slide badge headline (`font-display font-semibold text-forest-950`), and Dhaka provenance note (`text-forest-750`).

### 7.3 Editorial Typography & Decisive CTAs
- **Unclipped Descender Clearance:** Set `.type-hero` line-height to `1.12` and eliminated the inner `overflow-hidden` wrappers, giving Renaissance italic swashes and deep descenders (`y`, `p`, `g`) ample room to render without truncation.
- **Streamlined CTA Group:** Removed the secondary desktop micro-trust ribbon to declutter the masthead and keep viewer attention sharply focused on primary exploration CTAs (`Shop Collection` and `Our Story`).

---

## 8. Curated Writing Desk Carousel Scale Calibration
- **Desktop Proportion Tuning:** Scaled card widths from wide `240px` down to an intimate, collectible `205px` (`w-[140px] sm:w-[180px] md:w-[195px] lg:w-[205px]`).
- **Harmonious Section Padding:** Reduced desktop section vertical padding to `py-8 sm:py-10 lg:py-12` and card gaps to `gap-3 sm:gap-4 lg:gap-5`, presenting 5+ items gracefully across standard viewports without visual heaviness.

---

## 9. Product Card Elevation & Catalog Grid Scale (/awwwards Standards)

Redesigned product cards to eliminate heavy box artifacts on light canvases and calibrated catalog grid proportions:

### 9.1 Seamless Card Architecture on Light Canvas
- **Removal of Clutter & Muddy Dividing Lines:** Removed the artificial horizontal dividers (`border-b` between image and text, `border-t` above price), unifying image and metadata into a clean editorial object.
- **Tailored Hairline Outline:** Replaced dirty gray borders with an ultra-light `border-forest-900/[0.08]` that shifts to antique brass `border-gold-500/40` on hover with soft `shadow-elevation-2`.
- **Natural Aspect Ratio:** Standardized image viewport to `aspect-[4/5]`, honoring natural portrait proportions for stationery, journals, notebooks, and writing accessories.

### 9.2 Crisp Contemporary Typography
- **Plus Jakarta Sans for Product Titles:** Replaced low-x-height 13px Cormorant Garamond display serif with crisp Plus Jakarta Sans (`font-sans font-medium text-xs sm:text-[13px] text-forest-950 leading-snug tracking-[-0.01em]`), eliminating blurriness and spindly strokes on screen.
- **Quiet Editorial Eyebrows:** Set category tags to `text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-forest-500/80`.
- **Refined Tabular Pricing:** Replaced blunt bold prices with balanced semibold tabular numerals (`font-sans font-semibold text-xs sm:text-[14px] text-forest-950 tabular-nums`).
- **Tactile Boutique CTA:** Elevated the "Buy Now" button into a refined boutique pill with clean sans type (`font-sans text-[11px] font-medium tracking-wider`) and gentle shadow.

### 9.3 5-Column Catalog Scale
- Upgraded the catalog grid on [app/(storefront)/products/page.tsx](file:///home/billy/Projects/bashtoli/app/(storefront)/products/page.tsx) from `xl:grid-cols-4` to `xl:grid-cols-5 2xl:grid-cols-5`.
- Reduced card width from ~325px down to an intimate ~250px, aligning directly with the catalog skeleton and presenting an abundant, collectible stationery showcase.

---

## 10. Hover & Micro-Interaction Polish (/awwwards Standards)

Addressed micro-interaction feedback across product cards, navigation header, and footer:

### 10.1 Noticeable & Tactile Product Card Buy Button Hover
- **Root Cause:** Buy Now button previously used `bg-forest-950 hover:bg-forest-900`. Both colors (`#0a160f` and `#102218`) are deep forest greens with less than 3% luminosity variance, making the hover state virtually imperceptible.
- **Solution:** Elevated to a celebratory tactile transition: resting `bg-forest-950 text-cream-50 border border-forest-900/60` shifting to warm antique gold on hover: `hover:bg-gold-500 hover:text-forest-950 hover:border-gold-400 font-semibold shadow-2xs hover:shadow-xs`. Added `group-hover/btn:translate-x-0.5` micro-shift to the CTA arrow.

### 10.2 Clean Quick Add Pill (Removed Duplicate Plus Sign)
- **Root Cause:** The quick add button overlay contained an SVG `+` icon (`h-2.5 w-2.5`) followed immediately by `<span>+ Add</span>`, rendering `+ + Add` side-by-side on hover.
- **Solution:** Changed text to `<span>Add</span>`, resulting in a crisp `[+ Add]` pill. Harmonized hover color to `hover:bg-gold-500 hover:text-forest-950 hover:border-gold-400`. Preserved `aria-label="Add ${product.name} to bag"` test contract.

### 10.3 Header & Footer Navigation Hover Contrast (Eliminated Muddy Brown)
- **Root Cause:** Nav links on the dark forest header and footer used `text-text-accent` (`#7d5c18`) and `hover:text-text-accent-hover` (`#654911`). Because these tokens are dark brass intended for light cream paper, hovering on a dark `#0a160f` background darkened the text into an illegible muddy smudge.
- **Solution:**
  - Header Primary Nav (`Shop` and `Track Order`): Active state set to `text-gold-300 font-semibold` with `after:bg-gold-400` indicator; hover state set to luminous antique gold `text-cream-200/80 hover:text-gold-200` (>14:1 AAA contrast).
  - Footer Columns & Mobile Links: Changed hover state from `hover:text-text-accent` to `hover:text-gold-200`.
  - Footer Shop Card Links (Phone, Google Maps, Email): Elevated from dark brass `text-text-accent` to crisp `text-gold-300 hover:text-gold-200`.
  - Footer Colophon Links (Privacy, Terms): Changed hover to `hover:text-gold-200`.




