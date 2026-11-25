# Bashtoli Admin Panel Redesign — Minimal Adaptive Light & Dark System

This document records the design system, minimal UI copy principles, Light/Dark theme plumbing, accessibility architecture, and component modularization for `/admin`.

---

## 1. Visual Direction & Adaptive Theme

The `/admin` workspace uses a **Minimal Crisp Slate + Bashtoli Emerald** palette supporting both **Light Mode** and **Dark Mode**, completely isolated from the public warm-cream storefront (`/` through `/account/*`).

### Theme Scoping & Toggle Mechanics (`app/globals.css`, `app/admin/layout.tsx`, `components/admin/admin-theme-toggle.tsx`)
- **Zero Storefront Leakage**: Adaptive `color-scheme` rules use `:root:has(.admin-theme)` so the public storefront stays fixed in its cream light palette regardless of OS preference or admin toggle state.
- **FOUC Prevention**: A synchronous inline init script inside `app/admin/layout.tsx` applies `localStorage.getItem('bashtoli-admin-theme')` to `document.documentElement.dataset.adminTheme` before first paint.
- **Two-State Toggle**: Follows OS `prefers-color-scheme` by default without pinning an override. Toggling writes `'light'` or `'dark'` to `localStorage` only when diverging from the OS preference, and clears storage when returning to match the OS preference. Multi-tab `storage` events stay synchronized.
- **Native CSS `light-dark()` + Fallback**: Every `--adm-*` surface, border, text, accent, and status variable resolves dynamically via `light-dark(...)` (with `@supports not` fallbacks).

### Palette Overview
- **Light Mode**: Off-white canvas (`#f7f8f9`), clean elevated cards (`#fcfcfd`), subtle dividers (`#e2e5e9`), `>= 3:1` input borders (`#8a929e`), carbon text hierarchy (`#111618` / `#3b434b` / `#57616c`), and emerald primary actions (`#14533c`).
- **Dark Mode**: Deep carbon canvas (`#101315`), lighter card surfaces (`#171b1e`), muted hairline borders (`#2a3137`), `>= 3:1` input borders (`#6e7884`), crisp slate text (`#eef1f4` / `#c2c9d1` / `#919ca7`), and balanced emerald accents (`#166849`).
- **Semantic Status Colors**: Used strictly for functional signals across order states, inventory alerts, published/featured flags, and toast/validation feedback:
  - Success (`adm-success*`), Warning (`adm-warning*`), Info (`adm-info*`), Danger (`adm-danger*`).

---

## 2. Minimal Copy & Information Hierarchy

Decorative editorial branding (`"Studio"`, `"Admin Ledger"`, `"Monochrome Studio"`, `"COD Ops"`), numbered group/KPI codes (`"01 / ..."`, `"KPI 01"`), eyebrow labels above headings, and repetitive helper taglines were removed across all admin pages and cards. Headings and controls carry direct functional names only.

---

## 3. Accessibility & Native Platform Architecture

- **Native `<dialog>` Modal & Mobile Drawer**:
  - `components/admin/admin-confirm-dialog.tsx` uses `<dialog>.showModal()`, `overscroll-behavior: contain`, `closedby="any"` + bounded pointer fallback, and safe-action autofocus on destructive prompts.
  - `components/admin/sidebar.tsx` switches cleanly between a desktop `<aside>` (`>= 768px`) and a mobile `<dialog>` drawer (`< 768px`) using `useSyncExternalStore`, preventing duplicate `#admin-nav-*` DOM IDs.
- **Container-Aware Responsive Tables (`.admin-table-region`, `.admin-responsive-table`)**:
  - Below `640px` container width, `@container admin-table (width < 640px)` stacks table rows into responsive cards with `data-label` labels to maintain `0px` horizontal page overflow on `360px` screens.
- **Touch Targets & Motion**:
  - Interactive buttons and controls meet accessible touch target minimums (`40px`–`44px`), and transitions animate `transform`/`opacity` only while honoring `prefers-reduced-motion`.

---

## 4. Modularized Components & Shared Utilities

Completed deferred refactors from `docs/open-items.md`:
- **Product Studio (`Step 7`)**: Split `components/admin/product-form.tsx` into `product-studio-header.tsx`, `product-general-card.tsx`, and `product-sidebar-cards.tsx`; split `variant-table.tsx` into `variant-row.tsx`; split `product-list.tsx` controls into `product-row-controls.tsx`.
- **Storefront CMS (`Step 8`)**: Split `components/admin/hero-slides-manager.tsx` into `hero-slide-card.tsx` and `hero-slide-create-form.tsx`; split `components/admin/category-collage-manager.tsx` into `collage-slot-card.tsx` and `collage-available-grid.tsx`.
- **Orders & Shared Utilities**: Extracted `components/admin/order-status-badge.tsx`, `lib/utils/order-csv.ts`, and `lib/utils/admin-upload.ts`.
- **Toast System**: Extended `components/ui/toast.tsx` with `variant="admin"` using adaptive theme tokens while keeping storefront toasts untouched.
