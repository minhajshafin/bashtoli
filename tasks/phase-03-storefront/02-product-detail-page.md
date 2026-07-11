# Task: Product Detail Page (PDP)

**Phase:** 3 — Storefront Core  
**Week:** 4–5

## Goal

Build the product detail page with image gallery, variant selection, stock display, and add-to-cart.

## Requirements

- PDP at `/products/[slug]`
- Image gallery with thumbnails (from `product_images`, sorted)
- Product name, description, price
- Variant selector: option buttons/dropdowns based on product options
- Update displayed price and stock when variant selected
- Stock availability indicator (in stock / out of stock)
- "Add to Cart" button (disabled when out of stock or no variant selected)
- Breadcrumb: Home → Category → Product

## Acceptance Criteria

- [x] PDP loads for any active product by slug
- [x] Image gallery shows all product images with thumbnail navigation
- [x] Selecting a variant updates price and stock display
- [x] Out-of-stock variants show "Out of Stock" and disable add-to-cart
- [x] Add to Cart adds selected variant + qty to guest cart (localStorage)
- [x] 404 page shown for inactive or non-existent products
- [x] Breadcrumb navigation works

## Dependencies

- [01-product-listing.md](./01-product-listing.md)
- [04-variant-management.md](../phase-02-admin-mvp/04-variant-management.md)
- [05-product-image-upload.md](../phase-02-admin-mvp/05-product-image-upload.md)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/products/[slug]/page.tsx` | Create |
| `components/storefront/image-gallery.tsx` | Create |
| `components/storefront/variant-selector.tsx` | Create |
| `components/storefront/add-to-cart-button.tsx` | Create |
| `components/storefront/breadcrumb.tsx` | Create |
| `lib/queries/product-detail.ts` | Create |

## Definition of Done

- [x] PDP renders correctly for products with single and multi-dimension variants
- [x] Add to Cart integrates with guest cart (next task)
- [x] Stock status accurate per variant
- [x] Page tested on mobile
