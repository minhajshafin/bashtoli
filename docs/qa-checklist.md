# Bashtoli Storefront QA Verification Checklist

This manual QA verification checklist covers all storefront flows, edge cases, keyboard accessibility, reduced motion preferences, and responsive behavior down to a minimum 360px viewport width (Moto G4 baseline).

---

## 1. Global Layout & Shell Invariants

- [ ] **Skip Navigation Link**
  - Press `Tab` upon initial page load on any route.
  - Verify that a high-contrast focus ring button labelled `"Skip to main content"` appears at the top left.
  - Press `Enter` and confirm focus jumps directly to `<main id="main-content">`, bypassing header and navigation links.
- [ ] **Canvas Background & Inversion Consistency**
  - Storefront pages rest consistently on parchment cream (`bg-cream-50` / `bg-cream-100`).
  - Header and footer anchor the layout with deep forest (`bg-forest-950`).
  - No jarring mid-page cream-to-forest canvas inversions exist on standard reading or shopping flows.
- [ ] **No Compositing Stalls (Zero Backdrop-Filter)**
  - Verify zero `backdrop-filter` or `backdrop-blur-*` usage across scrolling surfaces, cards, badges, and modals.
  - Modals and drawers use crisp, solid tokens (e.g., `bg-forest-950/80` or `bg-forest-950/98`).
- [ ] **Mobile Bottom Navigation Dock**
  - Fixed dock appears on viewports $< 768\text{px}$.
  - Icons and active indicator use pure CSS transforms (`translate`, `scale`); no layout thrashing or `transition-all`.
  - Dock does not obscure form submission buttons or inputs on checkout or profile pages.

---

## 2. Catalog & Discovery Flows

- [ ] **Homepage (`/`)**
  - Hero banner renders within $2.5\text{s}$ observed LCP under 4× CPU mobile throttling.
  - Featured carousels pause animation when out of viewport (`IntersectionObserver`) or when tab is hidden (`document.hidden`).
  - Carousels respect `prefers-reduced-motion` and do not auto-scroll when reduced motion is enabled.
  - All prices display formatted in English as `"Tk <amount>"` (no raw `৳` symbol).
- [ ] **Product Listing Page (`/products`)**
  - Grid displays 1 column on 360px mobile, 2 columns on 640px tablet, 3-4 columns on desktop.
  - Category filter pills have touch targets $\ge 44\text{px}$.
  - Sort dropdown opens a crisp, non-blurred menu.
  - Product cards:
    - Tap or hover triggers prefetch only on intent (`touchstart` / `mouseenter`), no aggressive global prefetching.
    - Badges ("Sold Out", "Low Stock") use solid semi-opaque tokens with contrast $\ge 4.5:1$.
    - Quick add / wishlist toggle has immediate feedback without full-page re-renders.

---

## 3. Product Detail Page (`/products/[slug]`)

- [ ] **Image Gallery**
  - Single primary image prioritized for LCP (`fetchpriority="high"`), secondary thumbnails lazy loaded.
  - Pinch / swipe gestures work smoothly on mobile without horizontal page drift.
  - Fullscreen lightbox opens cleanly and closes on `Esc` key or close button click.
- [ ] **Variant Selector**
  - Variant chips meet the minimum $44\text{px}$ touch target requirement.
  - Selected variant chip is visibly distinguished by border, background, and checkmark.
  - Sold-out variants are clearly disabled and cannot be added to bag.
  - Active price updates dynamically and remains formatted as `"Tk <amount>"`.
- [ ] **Add to Bag & Sticky Action Bar**
  - Adding an item opens the sliding Cart Drawer smoothly.
  - On mobile, sticky bottom action bar appears when user scrolls past primary CTA, allowing 1-tap add to bag.

---

## 4. Shopping Bag & Checkout Flows (COD-Only)

- [ ] **Shopping Bag Drawer (`CartDrawer`)**
  - Drawer slides in from right; body scroll locks (`overflow: hidden`).
  - Focus is trapped inside the drawer while open; pressing `Tab` cycles within drawer elements.
  - Pressing `Esc` or clicking the backdrop closes the drawer.
  - Quantity increments/decrements update instantly; subtotal recalculates without lag.
- [ ] **Dedicated Bag Page (`/bag`)**
  - Full cart review page displays items, unit prices, quantity steppers, and delivery milestone bar.
  - Empty bag state provides clear CTA button back to catalog (`/products`).
- [ ] **Checkout Page (`/checkout`)**
  - **Zero CLS ($\le 0.05$):** Layout does not shift when form or delivery fee loads.
  - Phone number validation adheres strictly to Bangladesh mobile standard (11 digits, starting with `013`-`019`).
  - Validation runs on blur matching the server Zod schema, preventing flash-of-error during typing.
  - Delivery fee (Inside Dhaka Tk 70 vs Outside Dhaka Tk 130) mirrors the SQL `place_order` function.
  - Order submission generates a unique idempotency key per attempt, preventing duplicate orders.
  - Confirmation toast or redirect occurs cleanly upon successful placement.

---

## 5. Customer Authentication & Account Flows

- [ ] **Sign In (`/login`) & Sign Up (`/signup`)**
  - Forms use native autocomplete attributes (`email`, `current-password`, `new-password`).
  - Password visibility toggle maintains $44\text{px}$ touch target.
  - `redirectTo` queries strictly validate same-origin relative paths; open redirect payloads (`//evil.com`, control chars) are safely rejected.
  - Rate limiting protects authentication routes gracefully with friendly retry notices.
- [ ] **Customer Account Dashboard (`/account`)**
  - Authenticated layout requires session (`requireUser()`).
  - Navigation tabs: Overview, Orders, Saved Addresses, Profile, Wishlist.
  - Order history shows real COD order states (Pending, Confirmed, Shipped, Delivered, Cancelled).
  - Cancellation is only available for eligible orders (e.g. Pending) and calls `customerCancelOrderAction`.
  - Saved addresses support add, edit, delete, and set-as-default.
  - Danger Zone (Delete Account):
    - Opens accessible modal with backdrop `bg-forest-950/80` (no backdrop-blur).
    - Requires typing exact confirmation string `"DELETE"`.
    - Traps focus and responds to `Esc` key.

---

## 6. Order Tracking & Public Lookup (`/order/lookup`, `/order/[orderNumber]`)

- [ ] **Order Lookup Page (`/order/lookup`)**
  - Accessible to unauthenticated customers.
  - Accepts Order Number (e.g. `ORD-20261122-1234`) and customer Phone Number.
  - Rate-limited to prevent brute-force phone/order scraping.
- [ ] **Order Confirmation / Detail Page (`/order/[orderNumber]`)**
  - Enforces `connection()` to guarantee dynamic, un-cached SSR (`Cache-Control: no-store`).
  - Guest access gated strictly by cryptographically signed HMAC token (`order-token`).
  - Unauthorized visitors receive redacted DTO view without customer PII (masked phone/address).

---

## 7. Accessibility, Contrast & Responsive Baselines

- [ ] **WCAG 2.1 AA Contrast ($\ge 4.5:1$)**
  - Forest text (`#0d231a` / `#16382b`) on cream background (`#fcfbf7` / `#f4efe6`): ratio $> 11:1$ (Pass).
  - Cream text (`#fcfbf7`) on forest background (`#0d231a`): ratio $> 11:1$ (Pass).
  - Gold accents (`#c59b27` / `#b3891d`) on dark surfaces: ratio $> 5.5:1$ (Pass).
  - Error terracotta (`#c84b31`) on dark surfaces: ratio $> 4.8:1$ (Pass).
- [ ] **Keyboard Navigation & Focus Indicators**
  - All interactive elements have visible focus outlines (`focus-visible:ring-2 focus-visible:ring-gold-500`).
  - No keyboard traps in any carousel, drawer, or modal dialog.
- [ ] **Mobile Responsiveness (360px Viewport)**
  - Test at 360px width in DevTools.
  - Zero horizontal overflow (`overflow-x: hidden` / zero scroll drift).
  - All clickable buttons and form controls have $\ge 44\text{px} \times 44\text{px}$ touch targets.
- [ ] **Reduced Motion (`prefers-reduced-motion: reduce`)**
  - Enable reduced motion in OS / browser emulation.
  - Carousels stop auto-advancing.
  - Modals and drawers appear/dismiss instantly without spring or slide physics.
  - Micro-interactions (dock indicator, hover lifts) eliminate translational motion.
