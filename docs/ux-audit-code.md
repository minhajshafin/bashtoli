# Code-Level UX & Frontend Audit: Bashtoli (বাঁশতলী)

**Auditor Role:** Senior Product Designer & Frontend Auditor  
**Audit Type:** Static Code Analysis (Strictly Read-Only)  
**Evaluated Stack:** Next.js 16 (App Router), React 19, Supabase (Auth, Postgres, Storage), Tailwind CSS v4, Vercel  

---

## 1. Executive Summary & App Mapping

### App Purpose & Target Audience (3-Line Summary)
> **What it does:** Bashtoli is a specialized e-commerce storefront and fulfillment portal for artisanal stationery, journals, bamboo crafts, and desktop lifestyle goods in Bangladesh.  
> **Who it's for:** Urban creative professionals, students, and paper-craft hobbyists purchasing handcrafted stationery items via cash on delivery (COD) across Dhaka and nationwide.  
> **Core journeys:** Catalog browsing & faceted search &rarr; variant customization & bag management &rarr; guest/authenticated COD checkout with zone-based delivery &rarr; SMS/phone order tracking and self-service account management.

### Architectural Blueprint
- **Routes & Layouts:**
  - `app/layout.tsx`: Root HTML shell with `@vercel/analytics`, Google Fonts (`Fraunces`, `Source Sans 3`), and global theme variables.
  - `app/(storefront)/layout.tsx`: Asynchronous user-aware shell providing `ToastProvider`, `ConfirmDialogProvider`, `WishlistProvider`, `CartProvider`, `NavHeader`, and `Footer`.
  - `app/(storefront)/page.tsx`: Full-bleed homepage composing `Hero`, `FeaturedProducts` (Suspense-streamed), `CategoryGrid` (7-slot collage), `AboutSection`, `MarqueeBand`, and `SuggestAnItem`.
  - `app/(storefront)/products/page.tsx` & `[slug]/page.tsx`: Faceted search/filter catalog and server-rendered product details with client SKU variant selection.
  - `app/(storefront)/bag/page.tsx` & `/cart/page.tsx`: Shopping bag with real-time database price/stock validation and redirect alias.
  - `app/(storefront)/checkout/page.tsx`: Single-page COD checkout pre-filling saved addresses and enforcing Bangladeshi phone regex.
  - `app/(storefront)/order/[orderNumber]/page.tsx` & `/order/lookup/page.tsx`: Gated order lookup with phone authorization barrier.
  - `app/(storefront)/account/*`: Protected portal (`/`, `/orders`, `/addresses`, `/wishlist`, `/profile`) with sidebar sub-navigation.
  - `app/(auth)/*`: Credential auth (`/login`, `/signup`, `/forgot-password`, `/reset-password`).
  - `app/admin/*`: Back-office operations (`/`, `/products`, `/orders`, `/categories`, `/staff`, `/storefront`) behind `adminGuard` role gate.
- **Styling Architecture:** Tailwind CSS v4 via `@theme` definitions in `app/globals.css` declaring forest greens (`#080f0a` &ndash; `#e4ede7`), warm golds (`#a8863a` &ndash; `#f0e0c0`), and parchment creams (`#faf6ef` &ndash; `#e0d0b8`).
- **Auth & Data Flow:** Hybrid client/server authentication with `@supabase/ssr`. Route guarding executed in `proxy.ts` (Next.js 16 proxy convention) delegating to `lib/supabase/middleware.ts` for token rotation and `/admin` role validation.

---

## 2. Verdict

Bashtoli boasts an expressive, characterful brand identity that rises far above generic cookie-cutter Shopify templates, with thoughtful stationery touches and solid transactional safeguards. However, its execution is marred by critical accessibility compromises, including global outline stripping and severe color contrast violations on primary form labels (2.08:1). The mobile experience suffers from silent failures on the sticky purchasing bar, an unrendered hero carousel, and undersized interactive touch targets. Furthermore, architectural seams in auth redirection and missing route-level error boundaries create fragile edges that break customer trust.

**Overall UX & Frontend Score: 6.8 / 10**

---

## 3. Scorecard

| Area | Score (/10) | Auditor Assessment |
|---|:---:|---|
| **Visual Consistency** | **6.5** | Strong typographic voice, but undermined by pervasive hardcoded hex overrides and an abrupt visual rupture between storefront and the slate-corporate admin UI. |
| **Accessibility (WCAG 2.2 AA)** | **5.0** | Global focus outline stripping (`outline: none`), form labels failing 4.5:1 contrast, missing focus traps on drawers/modals, and sub-44px touch targets. |
| **Responsiveness** | **7.0** | Responsive grid layouts and clean mobile drawers, but the primary hero carousel is completely omitted on mobile, and toasts risk horizontal clipping. |
| **States & Feedback** | **6.5** | Polished bag and catalog empty states, but missing route-level `loading.tsx` and `error.tsx` on order tracking and product pages. 404 strips navigation. |
| **Forms & Input Handling** | **7.5** | Robust server-authoritative Zod schemas and honeypot protection; marred by mobile sticky button silent failures and missing inline client guidance. |
| **Auth UX** | **6.5** | Seamless guest-to-user bag/wishlist merging, but suffers from hardcoded redirect destinations (`/account`) and a noticeable flash of unauthenticated header content. |
| **Supabase Data Layer** | **7.0** | Rock-solid atomic SQL transaction (`place_order`), but occasionally leaks raw Supabase Auth exception messages directly to the UI. |
| **Perceived Performance** | **7.5** | Speedy server components and eager LCP preloading on primary logo, but category collage images default to lazy loading and trigger browser warnings. |
| **Microcopy & Tone** | **8.0** | Charming, thematic stationery tone with authentic warmth; minor ambiguities on 404 CTAs and price range labels ("onwards"). |

---

## 4. Findings Catalogue

Sorted strictly by severity: **Critical &rarr; High &rarr; Medium &rarr; Low**.

```
SEVERITY BREAKDOWN:
[CRITICAL]  3 findings
[HIGH]      6 findings
[MEDIUM]    7 findings
[LOW]       5 findings
TOTAL:     21 findings
```

### Critical Findings

#### `CRIT-01` &mdash; Global Focus Outline Removal Without Guaranteed Visible Indicator
- **File & Line:** [`app/globals.css:85-89`](file:///home/billy/Projects/bashtoli/app/globals.css#L85-L89), [`components/storefront/checkout-form.tsx:218, 239, 258, 289, 308`](file:///home/billy/Projects/bashtoli/components/storefront/checkout-form.tsx#L218), [`components/storefront/suggest-an-item.tsx:131, 146, 164`](file:///home/billy/Projects/bashtoli/components/storefront/suggest-an-item.tsx#L131)
- **Problem:** Native focus indicators are globally disabled (`input:focus-visible, textarea:focus-visible, select:focus-visible { outline: none; }`). In components like `SuggestAnItem` and `NavHeader`, inputs rely solely on a 1px border color transition (`focus:border-gold-500`) with no outline offset, no ring, or explicit `outline-none` overrides.
- **User Impact:** Keyboard and switch-device navigators cannot clearly identify which form input or control currently holds focus. Fails WCAG 2.2 Success Criterion 2.4.7 (Focus Visible) and 2.4.11 (Focus Not Obscured).

#### `CRIT-02` &mdash; Illegible Form Labels from Severe Color Contrast Failure (2.08:1)
- **File & Line:** [`components/storefront/checkout-form.tsx:208, 229, 248, 275, 298`](file:///home/billy/Projects/bashtoli/components/storefront/checkout-form.tsx#L208), [`app/(storefront)/account/layout.tsx:47`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/account/layout.tsx#L47), [`components/storefront/bag-client.tsx:83`](file:///home/billy/Projects/bashtoli/components/storefront/bag-client.tsx#L83), [`app/globals.css:22, 27`](file:///home/billy/Projects/bashtoli/app/globals.css#L22)
- **Problem:** Primary form labels (`Full Name *`, `Phone Number *`, `Shipping Address *`, `Order Notes`) and portal subtitles render in `text-gold-500` (`#c9a96e`) against cream backgrounds (`#faf6ef` / `#f5ede0`). The measured contrast ratio is **2.08:1** (minimum WCAG AA requirement is 4.5:1 for normal text).
- **User Impact:** Users with low vision, aging eyes, or viewing mobile screens under outdoor sunlight cannot read field labels, leading to hesitation, input errors, and checkout abandonment.

#### `CRIT-03` &mdash; Missing Focus Trapping & Escape Key Listener on Mobile Drawer & Modals
- **File & Line:** [`components/storefront/mobile-nav.tsx:55-157`](file:///home/billy/Projects/bashtoli/components/storefront/mobile-nav.tsx#L55-L157), [`components/ui/confirm-dialog.tsx:89-176`](file:///home/billy/Projects/bashtoli/components/ui/confirm-dialog.tsx#L89-L176)
- **Problem:** 
  1. `mobile-nav.tsx` does not trap focus inside the drawer when open. Tabbing past the last link escapes into invisible background header elements.
  2. Pressing `Escape` does not dismiss `mobile-nav.tsx`.
  3. Lacks WAI-ARIA modal attributes (`role="dialog"`, `aria-modal="true"`).
  4. `confirm-dialog.tsx` autofocuses the confirm button but does not prevent Tab / Shift+Tab from escaping out to background document nodes.
- **User Impact:** Screen reader and keyboard users get trapped or lost behind the drawer overlay, creating an inaccessible loop. Fails WCAG 2.1 SC 2.1.2 (No Keyboard Trap).

---

### High Severity Findings

#### `HIGH-01` &mdash; Mobile Sticky Purchasing Bar Fails Silently When Options Are Unselected
- **File & Line:** [`components/storefront/product-client.tsx:91-95, 268-289`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/products/%5Bslug%5D/product-client.tsx#L91-L95)
- **Problem:** On desktop, the "Add to Bag" button is disabled and reads "Select Options" when variants are unpicked. On the mobile sticky bottom bar (`ProductDetailClient`), the buttons are NOT disabled because the condition checks `disabled={isSelectionComplete && selectedVariant?.stock_qty === 0}` (evaluates to `false` when options are incomplete). Tapping "Add" or "Buy Now" triggers `handleAddToCart`, which executes `if (!targetVariant) return;` &mdash; completely silent, with zero toast, alert, or scroll prompt.
- **User Impact:** Mobile shoppers tap "Add" or "Buy Now" on the floating bar, nothing happens, and they assume the site is frozen or broken, directly harming conversion rates.

#### `HIGH-02` &mdash; Hardcoded Account Redirects Overwrite Intended Customer Destinations
- **File & Line:** [`app/(storefront)/account/layout.tsx:26-28`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/account/layout.tsx#L26-L28), [`app/(storefront)/account/page.tsx:23-25`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/account/page.tsx#L23-L25)
- **Problem:** `AccountLayout` explicitly hardcodes `redirect('/login?redirectTo=/account')`. If an unauthenticated user clicks a direct email or browser link to `/account/orders`, `/account/addresses`, or `/account/wishlist`, the specific sub-route is wiped out.
- **User Impact:** After signing in, the user is dumped on the generic account dashboard instead of their intended destination (e.g. checking their order history), requiring redundant manual navigation.

#### `HIGH-03` &mdash; Flash of Unauthenticated Content (FOUC) on Header Navigation
- **File & Line:** [`app/(storefront)/layout.tsx:19-42, 96-98`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/layout.tsx#L19-L42)
- **Problem:** The storefront layout wraps `AuthAwareShell` inside a React `Suspense` boundary with fallback `<StorefrontLayoutFallback>`. This fallback unconditionally renders `NavHeader` with `isLoggedIn={false}`. When `supabase.auth.getUser()` completes, the header snaps to authenticated state.
- **User Impact:** Logged-in users experience a jarring layout jump on every full page navigation where "Sign In / Register" abruptly morphs into "Hi, [Name]" and the user account menu.

#### `HIGH-04` &mdash; Missing Storefront 404 Boundary Strips Global Navigation & Footer
- **File & Line:** [`app/(storefront)/products/[slug]/page.tsx:85-87`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/products/%5Bslug%5D/page.tsx#L85-L87), [`app/not-found.tsx:13-71`](file:///home/billy/Projects/bashtoli/app/not-found.tsx#L13-L71)
- **Problem:** When a product slug does not exist, `notFound()` is invoked. Because there is no `app/(storefront)/not-found.tsx`, Next.js escapes the `(storefront)` route group and renders root `app/not-found.tsx`.
- **User Impact:** The 404 page strips out `NavHeader` and `Footer`. The user loses site search, cart access, and category links, leaving them marooned on a standalone page with only two text buttons.

#### `HIGH-05` &mdash; Mobile Viewport Clipping Risk on Toast Notifications
- **File & Line:** [`components/ui/toast.tsx:41`](file:///home/billy/Projects/bashtoli/components/ui/toast.tsx#L41)
- **Problem:** Toast container uses `className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"`. On a standard 375px mobile viewport, `right-6` (24px) plus `max-w-sm` (384px) equals 408px, which exceeds viewport width.
- **User Impact:** On mobile devices, toasts can overflow the viewport edge horizontally or cause off-screen clipping of alert messages and dismiss buttons.

#### `HIGH-06` &mdash; Raw Supabase Exception Strings Leaked to End-Users
- **File & Line:** [`lib/actions/auth.ts:163-167`](file:///home/billy/Projects/bashtoli/lib/actions/auth.ts#L163-L167), [`lib/actions/profile.ts:186, 254`](file:///home/billy/Projects/bashtoli/lib/actions/profile.ts#L186)
- **Problem:** Server actions return raw error strings directly from Supabase (`error.message || 'Failed to sign up.'`, `deleteError.message`).
- **User Impact:** Technical messages (e.g., database constraint violations, RLS failures, internal API codes) confuse non-technical users and leak architectural details.

---

### Medium Severity Findings

#### `MED-01` &mdash; Interactive Touch Targets Below Minimum Guidelines (32px vs 44px)
- **File & Line:** [`components/storefront/product-card.tsx:163`](file:///home/billy/Projects/bashtoli/components/storefront/product-card.tsx#L163), [`components/storefront/wishlist-button.tsx:50`](file:///home/billy/Projects/bashtoli/components/storefront/wishlist-button.tsx#L50), [`components/storefront/footer.tsx:156`](file:///home/billy/Projects/bashtoli/components/storefront/footer.tsx#L156)
- **Problem:** Mobile quick-add button is sized `h-8 w-8` (32x32px), wishlist card toggle is `h-9 w-9` (36x36px), and footer social icons are `h-8 w-8` (32x32px).
- **User Impact:** Fails WCAG 2.2 Target Size guideline (2.5.8 Minimum 24x24px with spacing; Apple/Google recommended 44x44px & 48x48px). Increases mis-taps on mobile devices.

#### `MED-02` &mdash; Hero Carousel Completely Omitted on Mobile Viewports
- **File & Line:** [`components/storefront/hero.tsx:251-255`](file:///home/billy/Projects/bashtoli/components/storefront/hero.tsx#L251-L255)
- **Problem:** The dynamic hero slideshow managed via the admin visual CMS is enclosed in `<div className="hidden lg:flex lg:col-span-5...">`.
- **User Impact:** Over 70% of Bangladeshi e-commerce traffic is mobile; these mobile visitors never see the promotional slides, featured item photography, or visual banner badges.

#### `MED-03` &mdash; Password Visibility Toggle Keyboard Lockout (`tabIndex={-1}`)
- **File & Line:** [`components/storefront/auth-form.tsx:174`](file:///home/billy/Projects/bashtoli/components/storefront/auth-form.tsx#L174)
- **Problem:** The password visibility eye toggle button explicitly sets `tabIndex={-1}`.
- **User Impact:** Keyboard-only users who mis-type their password cannot tab to toggle visibility and inspect input without switching to a mouse.

#### `MED-04` &mdash; Sighted Field Context Lost via `sr-only` Floating Labels
- **File & Line:** [`components/storefront/suggest-an-item.tsx:120-165`](file:///home/billy/Projects/bashtoli/components/storefront/suggest-an-item.tsx#L120-L165)
- **Problem:** Form labels for Name, Contact, and Message are styled with `sr-only`, leaving sighted users dependent solely on input placeholders.
- **User Impact:** As soon as a user starts typing, the placeholder disappears. If interrupted, the user loses visual context of what the field requested.

#### `MED-05` &mdash; Missing Route-Level Loading & Error Boundaries for Order Tracking
- **File & Line:** `app/(storefront)/order/[orderNumber]`, `app/(storefront)/order/lookup`
- **Problem:** Neither order route contains a dedicated `loading.tsx` or `error.tsx`.
- **User Impact:** Slow order status queries show no interim skeleton, and transient database/network errors cascade to the root error screen rather than offering an inline retry.

#### `MED-06` &mdash; Hardcoded Color Tokens & Storefront-to-Admin Aesthetic Fracture
- **File & Line:** [`components/storefront/product-card.tsx:77, 116, 142`](file:///home/billy/Projects/bashtoli/components/storefront/product-card.tsx#L77), [`components/storefront/product-client.tsx:134, 142, 160`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/products/%5Bslug%5D/product-client.tsx#L134), [`app/admin/layout.tsx:35`](file:///home/billy/Projects/bashtoli/app/admin/layout.tsx#L35)
- **Problem:** Extensive use of raw inline hex strings (`#c9a96e`, `#1a3326`, `#f5ede0`, `#3d6e54`) instead of semantic Tailwind v4 design tokens. Admin dashboard abruptly switches to generic `bg-slate-50` and `bg-indigo-600`.
- **User Impact:** Inconsistent visual maintenance, broken dark mode extensibility, and an abrupt disconnect when staff switch between public shop and back-office.

#### `MED-07` &mdash; LCP Images Configured with `loading="lazy"`
- **File & Line:** [`components/storefront/category-grid.tsx:37`](file:///home/billy/Projects/bashtoli/components/storefront/category-grid.tsx#L37), [`components/storefront/footer.tsx:100`](file:///home/billy/Projects/bashtoli/components/storefront/footer.tsx#L100)
- **Problem:** Category collage covers and brand imagery visible in or near the initial fold are marked `loading="lazy"` without `priority`.
- **User Impact:** Triggers browser LCP warnings, delays image decoding, and increases perceived load time on initial visits.

---

### Low Severity Findings

#### `LOW-01` &mdash; Account Dropdown Lacks WAI-ARIA State Indicators
- **File & Line:** [`components/storefront/nav-header.tsx:178-186`](file:///home/billy/Projects/bashtoli/components/storefront/nav-header.tsx#L178-L186)
- **Problem:** Account toggle button opens an inline menu but lacks `aria-haspopup="menu"` and `aria-expanded={accountOpen}`.
- **User Impact:** Screen reader users are not notified when the dropdown menu expands or collapses.

#### `LOW-02` &mdash; Satirical Microcopy in 404 Primary Navigation Action
- **File & Line:** [`app/not-found.tsx:58`](file:///home/billy/Projects/bashtoli/app/not-found.tsx#L58)
- **Problem:** The primary call-to-action on the 404 page is labeled `"Return to Civilization (Home)"`.
- **User Impact:** While playful, verbose metaphors can create micro-friction for hurried shoppers attempting to navigate back to safety.

#### `LOW-03` &mdash; Illegible 10px Microcopy on Checkout Payment Notice
- **File & Line:** [`components/storefront/checkout-form.tsx:388`](file:///home/billy/Projects/bashtoli/components/storefront/checkout-form.tsx#L388)
- **Problem:** Payment disclaimer is styled `text-[10px] text-forest-400` on `#f5ede0` (contrast ratio 2.66:1 at 10px).
- **User Impact:** Critical cash on delivery preparation instructions are virtually unreadable on mobile screens.

#### `LOW-04` &mdash; Wishlist Icon Hydration Flicker
- **File & Line:** [`lib/wishlist/wishlist-context.tsx:48, 64`](file:///home/billy/Projects/bashtoli/lib/wishlist/wishlist-context.tsx#L48)
- **Problem:** Initial `wishlistIds` state is initialized empty and populated asynchronously inside `useEffect`.
- **User Impact:** Users see heart icons flash from un-wishlisted to wishlisted a split second after hydration.

#### `LOW-05` &mdash; Static Hardcoded Version in Admin Sidebar
- **File & Line:** [`components/admin/sidebar.tsx:220`](file:///home/billy/Projects/bashtoli/components/admin/sidebar.tsx#L220)
- **Problem:** Admin sidebar footer displays hardcoded string `"v1.2.0"`.
- **User Impact:** Misleading technical artifact that drifts out of sync with actual release deployments.

---

## 5. Proposed Changes (P0 / P1 / P2)

### Priority P0 (Immediate Fixes &mdash; Release Blockers)

| Priority | Exact Code Change | Findings Resolved | Effort |
|:---:|---|---|:---:|
| **P0** | **Fix Label Contrast:** In [`checkout-form.tsx:208, 229, 248, 275, 298`](file:///home/billy/Projects/bashtoli/components/storefront/checkout-form.tsx#L208), [`account/layout.tsx:47`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/account/layout.tsx#L47), and [`bag-client.tsx:83`](file:///home/billy/Projects/bashtoli/components/storefront/bag-client.tsx#L83), change `text-gold-500` to `text-forest-800` (or `text-forest-700`). Ensures a minimum contrast of **7.5:1** on `#faf6ef`. | `CRIT-02` | **S** |
| **P0** | **Restore Focus Outlines:** In [`app/globals.css:85-89`](file:///home/billy/Projects/bashtoli/app/globals.css#L85-L89), remove `outline: none;` on `input:focus-visible, textarea:focus-visible, select:focus-visible`. Add `outline: 2px solid #a8863a; outline-offset: 2px;` to all input classes. | `CRIT-01` | **S** |
| **P0** | **Fix Mobile Sticky Button Logic:** In [`product-client.tsx:268, 280`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/products/%5Bslug%5D/product-client.tsx#L268), update mobile sticky button states to `disabled={!isSelectionComplete || selectedVariant?.stock_qty === 0}`. If tapped when incomplete, scroll smoothly to the variant picker and trigger an informative toast (`"Please select your preferences first"`). | `HIGH-01` | **S** |
| **P0** | **Accessible Drawer & Dialog:** In [`mobile-nav.tsx:55`](file:///home/billy/Projects/bashtoli/components/storefront/mobile-nav.tsx#L55), add `role="dialog"`, `aria-modal="true"`, an `Escape` key event listener in `useEffect`, and focus trap management. Add Tab wrapping to [`confirm-dialog.tsx`](file:///home/billy/Projects/bashtoli/components/ui/confirm-dialog.tsx). | `CRIT-03` | **M** |

### Priority P1 (High Impact &mdash; Near Term)

| Priority | Exact Code Change | Findings Resolved | Effort |
|:---:|---|---|:---:|
| **P1** | **Preserve Deep Redirects:** In [`account/layout.tsx:26`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/account/layout.tsx#L26), capture the incoming pathname using server headers / search params or proxy rewrite so redirected logins return to `/account/orders`, `/account/addresses`, etc. | `HIGH-02` | **S** |
| **P1** | **Add Storefront 404 Route:** Create [`app/(storefront)/not-found.tsx`](file:///home/billy/Projects/bashtoli/app/%28storefront%29) that wraps the stationery error illustration inside the persistent `NavHeader` and `Footer`. | `HIGH-04` | **S** |
| **P1** | **Responsive Toast Positioning:** In [`components/ui/toast.tsx:41`](file:///home/billy/Projects/bashtoli/components/ui/toast.tsx#L41), change container class to `fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm`. Eliminates mobile horizontal clipping. | `HIGH-05` | **S** |
| **P1** | **Expose Hero on Mobile:** In [`hero.tsx:251`](file:///home/billy/Projects/bashtoli/components/storefront/hero.tsx#L251), change `hidden lg:flex` to `flex mt-8 lg:mt-0 lg:col-span-5` so mobile users experience the dynamic slide carousel above the fold. | `MED-02` | **M** |
| **P1** | **Enlarge Mobile Touch Targets:** In [`product-card.tsx:163`](file:///home/billy/Projects/bashtoli/components/storefront/product-card.tsx#L163) and [`wishlist-button.tsx:50`](file:///home/billy/Projects/bashtoli/components/storefront/wishlist-button.tsx#L50), expand hit-areas to `h-11 w-11` (44x44px) minimum with `p-2` tap target padding. | `MED-01` | **S** |
| **P1** | **Mask Raw Supabase Errors:** In [`lib/actions/auth.ts:165`](file:///home/billy/Projects/bashtoli/lib/actions/auth.ts#L165) and [`lib/actions/profile.ts:186`](file:///home/billy/Projects/bashtoli/lib/actions/profile.ts#L186), map Supabase error messages through a sanitized customer dictionary. | `HIGH-06` | **S** |

### Priority P2 (Refinements & Polish)

| Priority | Exact Code Change | Findings Resolved | Effort |
|:---:|---|---|:---:|
| **P2** | **Eliminate Header FOUC:** In [`app/(storefront)/layout.tsx:96-98`](file:///home/billy/Projects/bashtoli/app/%28storefront%29/layout.tsx#L96-L98), remove the fallback that flashes guest links; render a neutral logo skeleton shell in the header slot while session verification resolves. | `HIGH-03` | **M** |
| **P2** | **Keyboard Password Toggle:** In [`auth-form.tsx:174`](file:///home/billy/Projects/bashtoli/components/storefront/auth-form.tsx#L174), remove `tabIndex={-1}` and add `aria-label={showPassword ? 'Hide password' : 'Show password'}`. | `MED-03` | **S** |
| **P2** | **Floating Labels in Suggestion:** In [`suggest-an-item.tsx:120-165`](file:///home/billy/Projects/bashtoli/components/storefront/suggest-an-item.tsx#L120-L165), convert `sr-only` labels into persistent field headers above each input. | `MED-04` | **S** |
| **P2** | **Order Route Boundaries:** Add `loading.tsx` and `error.tsx` under `app/(storefront)/order/[orderNumber]` with matching botanical leaf decoration skeletons. | `MED-05` | **M** |
| **P2** | **Tokenize Inline Colors:** Refactor raw `#c9a96e`, `#1a3326`, and `#f5ede0` occurrences across product components into standard Tailwind CSS classes (`text-gold-500`, `bg-forest-900`, `bg-cream-100`). | `MED-06` | **L** |
| **P2** | **Clean Microcopy:** In [`app/not-found.tsx:58`](file:///home/billy/Projects/bashtoli/app/not-found.tsx#L58), change `"Return to Civilization (Home)"` to `"Back to Home"`; bump [`checkout-form.tsx:388`](file:///home/billy/Projects/bashtoli/components/storefront/checkout-form.tsx#L388) text to `text-xs text-forest-600`. | `LOW-02`, `LOW-03` | **S** |

---

## 6. Top 5 Quick Wins (< 1 Hour Each)

1. **Checkout Form Label Accessibility (`CRIT-02`):**  
   Replace `text-gold-500` with `text-forest-800 font-semibold` across form labels in `components/storefront/checkout-form.tsx` (lines 208, 229, 248, 275, 298). *Time: 10 mins.*
2. **Keyboard Password Reveal (`MED-03`):**  
   Delete `tabIndex={-1}` from the eye toggle button in `components/storefront/auth-form.tsx` (line 174). *Time: 5 mins.*
3. **Toast Mobile Bounds Fix (`HIGH-05`):**  
   Change toast container in `components/ui/toast.tsx` (line 41) to `fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm`. *Time: 10 mins.*
4. **Mobile Sticky Button Disabled State (`HIGH-01`):**  
   In `app/(storefront)/products/[slug]/product-client.tsx` (lines 268 & 280), set `disabled={!isSelectionComplete || selectedVariant?.stock_qty === 0}` on both floating buttons. *Time: 15 mins.*
5. **Escape Key Support on Mobile Menu (`CRIT-03`):**  
   Add a `keydown` listener for `e.key === 'Escape'` inside `components/storefront/mobile-nav.tsx` to dismiss the navigation drawer. *Time: 20 mins.*

---

## 7. Needs Browser Verification

*The following potential anomalies are suspected from static code analysis but require live runtime or browser validation to confirm:*

1. **Wave Divider Sub-Pixel Gapping on High-DPI Displays:**  
   `app/(storefront)/page.tsx` uses negative margins (`marginBottom: '-1px'`, `marginTop: '-1px'`) on raw SVG wave shapes. On certain mobile WebKit viewports (Retina @2x/@3x), sub-pixel rendering may produce a 1px white hairline seam between background sections. *(Unverified)*
2. **Rate Limit 429 Error UI in Middleware:**  
   `lib/supabase/middleware.ts:151, 165` returns plain-text `new NextResponse('Too many requests...')`. If triggered during client-side Next.js soft transitions, it is unverified whether the browser renders a broken JSON string or an unstyled blank white page. *(Unverified)*
3. **Cart Merge Race Condition on Instant Login:**  
   `lib/cart/cart-context.tsx` and `lib/wishlist/wishlist-context.tsx` execute asynchronous guest localStorage merges inside `useEffect` on `isLoggedIn` change. It is unverified whether fast route redirection post-login can cause partial item drops if the page unmounts mid-flight. *(Unverified)*
4. **Google Maps Iframe Scroll Interception on Touch Devices:**  
   In `components/storefront/footer.tsx:171`, the location iframe spans `width="100%" height="180"`. On mobile viewports, dragging past the footer may inadvertently capture user finger gestures inside the map canvas rather than scrolling the page. *(Unverified)*

---

*Awaiting approval before any changes.*
