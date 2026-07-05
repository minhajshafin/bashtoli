# Task: SEO Implementation

**Phase:** 7 — Polish & Content  
**Week:** 11

## Goal

Implement SEO best practices: dynamic metadata, structured data, sitemap, and robots.txt.

## Requirements

- Dynamic `title`, `description`, and Open Graph tags on product pages
- JSON-LD `Product` schema on PDP
- `robots.txt` via Next.js or `public/robots.txt`
- Sitemap via Next.js `app/sitemap.ts` (products + static pages)
- Meta tags on all public pages (home, about, contact, product listing)
- Canonical URLs on product pages

## Acceptance Criteria

- [ ] Product pages have unique title and description in `<head>`
- [ ] Open Graph tags present (og:title, og:description, og:image)
- [ ] JSON-LD Product schema validates in Google Rich Results Test
- [ ] `/sitemap.xml` lists all active products and static pages
- [ ] `/robots.txt` allows crawling of public pages, disallows `/admin`
- [ ] Social share preview shows product image and name

## Dependencies

- Phase 3 storefront (product pages exist)
- [01-static-content-pages.md](./01-static-content-pages.md)

## Files to Modify

| File | Action |
|---|---|
| `app/sitemap.ts` | Create |
| `app/robots.ts` | Create |
| `app/(storefront)/products/[slug]/page.tsx` | Update (metadata + JSON-LD) |
| `app/(storefront)/products/page.tsx` | Update (metadata) |
| `app/(storefront)/page.tsx` | Update (metadata) |
| `app/(storefront)/about/page.tsx` | Update (metadata) |
| `app/(storefront)/contact/page.tsx` | Update (metadata) |
| `components/storefront/json-ld.tsx` | Create |

## Definition of Done

- [ ] All meta tags verified in page source
- [ ] JSON-LD validates without errors
- [ ] Sitemap accessible and complete
- [ ] robots.txt correct
