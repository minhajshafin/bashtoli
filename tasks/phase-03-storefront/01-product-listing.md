# Task: Product Listing & Category Filters

**Phase:** 3 — Storefront Core  
**Week:** 4

## Goal

Build the public product listing page with category filtering for the customer storefront.

## Requirements

- Product listing page at `/products`
- Display only active products with active variants
- Category filter sidebar or tabs (handcrafts, mugs, hats, etc.)
- Product card: primary image, name, price (lowest variant price or base_price), category
- Responsive grid layout (mobile-first)
- Empty state when no products match filter
- Server-side data fetching with Supabase

## Acceptance Criteria

- [ ] `/products` displays all active products
- [ ] Clicking a category filters the product list
- [ ] Inactive/draft products are not shown
- [ ] Product cards link to `/products/[slug]`
- [ ] Layout is responsive on mobile and desktop
- [ ] Page loads with optimized images via Next.js `<Image>`

## Dependencies

- Phase 2 complete (products and categories exist in DB)
- [03-product-crud.md](../phase-02-admin-mvp/03-product-crud.md)
- [02-category-management.md](../phase-02-admin-mvp/02-category-management.md)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/products/page.tsx` | Create |
| `components/storefront/product-card.tsx` | Create |
| `components/storefront/category-filter.tsx` | Create |
| `lib/queries/products.ts` | Create |

## Definition of Done

- [ ] Listing page renders real products from admin catalog
- [ ] Category filtering works correctly
- [ ] Mobile-responsive layout verified
- [ ] Only active products visible
