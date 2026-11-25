# Bashtoli Admin Panel Redesign — Modern Black & White Dual-Tone System

This document records the design system, architectural choices, accessibility standards, and component modularization for the `/admin` Control Studio redesign.

---

## 1. Visual Direction & Dual-Tone Architecture

The administrative panel adopts a **Modern Black & White Dual-Tone Editorial** aesthetic ("Obsidian Ink & Alabaster Paper"), intentionally differentiated from the warm cream-and-forest storefront while preserving shared typography DNA.

### Design Tokens (`app/globals.css`)
All colors are defined under `@theme` in `app/globals.css` with zero inline hex literals in component TSX:

| Token Group | Tokens | Role |
|---|---|---|
| **Paper (Light Surfaces)** | `paper-50` (`#fcfbf9`), `paper-100` (`#f4f3ef`), `paper-200` (`#eae8e1`), `paper-300` (`#d8d5cc`), `paper-400` (`#b8b4a8`), `paper-500` (`#a3a098`) | Workspace canvas, elevated cards, sunken table headers, hairline borders, muted dark-surface copy |
| **Ink (Dark Surfaces & Text)** | `ink-950` (`#0c0c0e`), `ink-900` (`#151518`), `ink-800` (`#202024`), `ink-700` (`#2e2e34`), `ink-600` (`#45454d`), `ink-500` (`#5c5c66`), `ink-400` (`#767680`) | Obsidian sidebar monolith, inverted KPI anchor cards, inverted COD settlement ledger, primary buttons, body text, `>= 3:1` input boundaries |
| **Restrained Signal Accents** | `signal-danger*`, `signal-warning*`, `signal-success*` | Reserved strictly for validation errors, cancelled orders, out-of-stock/low-stock alerts, and destructive confirmations |

### Typography
- **UI Sans**: `Plus Jakarta Sans` (`--font-sans`) with fluid `clamp()` hierarchy classes (`.admin-page-title`, `.admin-section-title`, `.admin-metric-value`).
- **Monospace Data**: `JetBrains Mono` (`--font-jetbrains` loaded strictly inside `app/admin/layout.tsx`) for SKUs, order numbers, URL slugs, timestamps, tabular prices, and uppercase section kickers (`.admin-kicker`).

---

## 2. Accessibility & Native Platform Architecture

- **Native `<dialog>` Modal & Mobile Drawer**:
  - `components/admin/admin-confirm-dialog.tsx` rebuilt on native `<dialog>` using `showModal()`, `overscroll-behavior: contain`, `closedby="any"` + bounded pointer light-dismiss fallback, and safe-action autofocus (`Cancel` on `danger`/`warning` dialogs).
  - `components/admin/sidebar.tsx` renders a desktop `<aside>` at `>= 768px` and a native `<dialog>` drawer via `showModal()` below `768px` using `matchMedia` (`useSyncExternalStore`) so `#admin-nav-*` IDs never duplicate in the DOM.
- **Container-Aware Responsive Tables (`.admin-table-region`, `.admin-responsive-table`)**:
  - Tables wrap in `tabIndex={0}` `role="region"` containers with `<caption className="sr-only">`, `<th scope="col">`, and `<th scope="row">`.
  - Below `640px` container width, `@container admin-table (width < 640px)` transforms rows into readable monochrome stacked cards with `data-label` prefixes, preventing horizontal page overflow at `360px` viewports.
- **Touch Targets & Motion**:
  - Primary interactive controls and form inputs enforce `min-h-[44px]` (and compact icon buttons `min-h-[40px] min-w-[40px]`).
  - Animations use composite-safe properties only (`transform`, `opacity`) and respect `@media (prefers-reduced-motion: no-preference)`.

---

## 3. Modularized Components & Shared Utilities

Completed deferred refactors from `docs/open-items.md`:
- **Product Studio (`Step 7`)**: Split `components/admin/product-form.tsx` into `product-studio-header.tsx`, `product-general-card.tsx`, and `product-sidebar-cards.tsx`; split `variant-table.tsx` into `variant-row.tsx`; split `product-list.tsx` controls into `product-row-controls.tsx`.
- **Storefront CMS (`Step 8`)**: Split `components/admin/hero-slides-manager.tsx` into `hero-slide-card.tsx` and `hero-slide-create-form.tsx`; split `components/admin/category-collage-manager.tsx` into `collage-slot-card.tsx` and `collage-available-grid.tsx`.
- **Orders & Shared Utilities**: Extracted `components/admin/order-status-badge.tsx`, `lib/utils/order-csv.ts`, and `lib/utils/admin-upload.ts` to eliminate duplicated status styles, CSV export logic, and storage upload helpers.
- **Toast System**: Extended `components/ui/toast.tsx` with `variant="admin"` for monochrome obsidian toast capsules while leaving storefront toasts untouched.
