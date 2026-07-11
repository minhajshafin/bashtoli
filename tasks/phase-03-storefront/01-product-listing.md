# Task: Product Listing & Category Filters

**Phase:** 3 — Storefront Core  
**Week:** 4

## Goal

Build the public product listing page with category filtering for the customer storefront.

## Requirements

- Product listing page at `/products`
- Display only active products with active variants
- Category filter sidebar or tabs (handcrafts, mugs, hats, etc.)
- Text search by product name (Postgres `ILIKE`; URL param `?q=keyword`)
- Pagination: 12 products per page, URL-based page param (`?page=2`); show total count and navigation
- Product card: primary image, name, price (lowest variant price or base_price), category
- "Sold out" badge on card when all variants have `stock_qty = 0`
- Responsive grid layout (mobile-first)
- Empty state when no products match filter or search
- Server-side data fetching with Supabase

## Acceptance Criteria

- [x] `/products` displays all active products (paginated, 12 per page)
- [x] Clicking a category filters the product list
- [x] Search input filters products by name
- [x] Pagination controls navigate between pages
- [x] Sold-out products show badge but remain visible
- [x] Inactive/draft products are not shown
- [x] Product cards link to `/products/[slug]`
- [x] Layout is responsive on mobile and desktop
- [x] Page loads with optimized images via Next.js `<Image>`

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
| `lib/queries/products.ts` | Create (paginated + search query) |
| `components/storefront/search-input.tsx` | Create |
| `components/storefront/pagination.tsx` | Create |

## Definition of Done

- [x] Listing page renders real products from admin catalog
- [x] Category filtering works correctly
- [x] Mobile-responsive layout verified
- [x] Only active products visible
