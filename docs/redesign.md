# Bashtoli UI/UX Redesign & Frontend Performance Guide

This document records the design system architecture, performance budgets, canvas strategies, and progress of the Bashtoli storefront redesign.

---

## 1. Performance Budget & Non-Regression Policy

All code changes across all redesign phases must adhere strictly to the following performance budget. **Per-route Lighthouse mobile score and Total Blocking Time (TBT) must not regress vs. HEAD at each phase.**

All measurements must be collected using `scripts/lighthouse.mjs` (Moto G4 mobile profile, 4× CPU throttling, Lantern simulation, 5-run median).

### Per-Route Performance Baselines & Budgets

| Route | Target Mobile Score | Target LCP | Target TBT | Max CLS | Max Raw HTML | Critical Transfer JS |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Home (`/`)** | $\ge 70$ | $\le 3.9\text{s}$ | $\le 450\text{ms}$ | $\le 0.05$ | $< 700\text{ KB}$ | $< 180\text{ KB}$ |
| **Listing (`/products`)** | $\ge 68$ | $\le 4.1\text{s}$ | $\le 600\text{ms}$ | $\le 0.05$ | $< 400\text{ KB}$ | $< 160\text{ KB}$ |
| **PDP (`/products/[slug]`)** | $\ge 70$ | $\le 3.8\text{s}$ | $\le 650\text{ms}$ | $\le 0.05$ | $< 250\text{ KB}$ | $< 160\text{ KB}$ |
| **Cart / Bag (`/bag`)** | $\ge 80$ | $\le 3.0\text{s}$ | $\le 300\text{ms}$ | $\le 0.05$ | $< 150\text{ KB}$ | $< 140\text{ KB}$ |
| **Checkout (`/checkout`)** | $\ge 75$ | $\le 3.2\text{s}$ | $\le 400\text{ms}$ | $\le 0.05$ | $< 200\text{ KB}$ | $< 160\text{ KB}$ |
| **Account (`/account`)** | $\ge 88$ | $\le 2.5\text{s}$ | $\le 200\text{ms}$ | $\le 0.05$ | $< 100\text{ KB}$ | $< 120\text{ KB}$ |

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
