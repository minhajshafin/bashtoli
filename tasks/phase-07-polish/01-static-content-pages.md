# Task: Static Content Pages

**Phase:** 7 — Polish & Content  
**Week:** 10

## Goal

Build Home, About, and Contact pages with business information and branding.

## Requirements

- Home page at `/` with hero section, featured products (query `products WHERE featured = true AND active = true`, ordered by `sort_order`; fall back to 4 newest active products if none featured), and category links
- About page at `/about` with business story and branding
- Contact page at `/contact` with:
  - Phone number
  - WhatsApp link
  - Business hours
  - Location/map (embed or link)
- Footer on all storefront pages with business info and navigation links
- Content placeholders until owner provides final copy and assets

## Acceptance Criteria

- [ ] Home page displays featured/active products
- [ ] About page renders with business description
- [ ] Contact page shows phone, WhatsApp link, hours, and location
- [ ] Footer present on all storefront pages with nav links
- [ ] Pages are mobile-responsive
- [ ] Branding assets integrated when provided (see [Open Items](../docs/open-items.md))

## Dependencies

- Phase 3 storefront core
- Branding assets and WhatsApp number from owner ([Open Items](../docs/open-items.md))

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/page.tsx` | Create/Update |
| `app/(storefront)/about/page.tsx` | Create |
| `app/(storefront)/contact/page.tsx` | Create |
| `components/storefront/hero.tsx` | Create |
| `components/storefront/featured-products.tsx` | Create |
| `components/storefront/footer.tsx` | Create |
| `app/(storefront)/layout.tsx` | Update |

## Definition of Done

- [ ] All three static pages live and responsive
- [ ] Footer consistent across storefront
- [ ] Owner can review and update content
- [ ] Placeholders documented for pending owner input
