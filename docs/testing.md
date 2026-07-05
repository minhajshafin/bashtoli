# Testing & Observability

## Environments

| Environment | Purpose | Notes |
|---|---|---|
| Local | Development | Supabase local or dev project; Resend test mode |
| Staging | Pre-production validation | Recommended before launch |
| Production | Live site | Vercel deployment |

## E2E Testing (Playwright)

### Scope (v1 minimum)

Happy-path checkout flow:

1. Browse products
2. Add item to cart
3. Complete COD checkout (guest)
4. Verify order confirmation page
5. Verify admin sees the new order

### Timeline

- **Phase 4:** First Playwright E2E test written alongside checkout implementation
- **Phase 8:** Expand coverage, fix failures, run before launch

### Planned Location

```
tests/e2e/
├── checkout.spec.ts       # Guest checkout happy path
└── admin-order.spec.ts    # Admin order visibility
```

## Error Monitoring (Sentry)

- Set up on Next.js before launch (Phase 8)
- Free tier sufficient for this order volume
- Captures unhandled errors in both storefront and admin

## Email in Development

| Option | Notes |
|---|---|
| Resend test mode | Sends to verified addresses only |
| Mail catcher | Local SMTP capture (e.g. Mailpit) |

Use test mode during Phases 4–7; switch to production Resend key at launch.

## Manual Testing Checklist (Pre-Launch)

### Storefront

- [ ] Product listing loads with category filters
- [ ] PDP shows images, variants, stock status
- [ ] Guest cart persists across page reloads
- [ ] Checkout rejects insufficient stock
- [ ] Order confirmation shows correct order number
- [ ] Guest order lookup works (order number + phone)
- [ ] WhatsApp link on confirmation page works
- [ ] Mobile responsive on common screen sizes

### Customer Accounts

- [ ] Sign up / log in / log out
- [ ] Cart merges on login (higher qty wins)
- [ ] Saved addresses pre-fill checkout
- [ ] Wishlist add/remove
- [ ] Order history shows past orders

### Admin

- [ ] Role guard blocks customers from `/admin/*`
- [ ] Product CRUD with variants and images
- [ ] Category management
- [ ] Order status workflow (all transitions)
- [ ] Cancelled order restocks inventory
- [ ] Low-stock indicator on dashboard
- [ ] Staff role management (admin only)

### SEO

- [ ] Product pages have dynamic meta tags
- [ ] JSON-LD Product schema on PDP
- [ ] Sitemap accessible
- [ ] robots.txt present

## Performance Targets

- Product listing page loads in <3s on 3G (mobile)
- Images optimized via Next.js `<Image>` (WebP, responsive sizes)
- No layout shift on image load (width/height set)
