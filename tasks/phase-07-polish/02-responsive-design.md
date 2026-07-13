# Task: Responsive Design Pass

**Phase:** 7 — Polish & Content  
**Week:** 10–11

## Goal

Ensure all storefront and admin pages are fully responsive and usable on mobile devices.

## Requirements

- Audit all pages on mobile viewport (375px), tablet (768px), and desktop (1280px)
- Fix layout issues: overflow, touch targets, font sizes, spacing
- Mobile navigation: hamburger menu for storefront header
- Admin sidebar: collapsible on mobile
- Cart and checkout forms optimized for mobile input
- Touch-friendly buttons (min 44px tap target)

## Acceptance Criteria

- [x] All storefront pages usable on 375px viewport without horizontal scroll
- [x] Mobile navigation menu works (open, navigate, close)
- [x] Checkout form fields accessible on mobile keyboard
- [x] Admin dashboard usable on tablet
- [x] Product image gallery swipeable on mobile
- [x] No content clipped or overlapping at any breakpoint

## Dependencies

- Phases 2–6 complete (all pages exist)

## Files to Modify

| File | Action |
|---|---|
| `components/storefront/header.tsx` | Update |
| `components/storefront/mobile-nav.tsx` | Create |
| `components/admin/sidebar.tsx` | Update |
| `app/globals.css` | Update |
| Various page and component files | Update |

## Definition of Done

- [x] Mobile audit completed for all pages
- [x] Issues found during audit are fixed
- [x] Tested on at least one real mobile device or emulator
