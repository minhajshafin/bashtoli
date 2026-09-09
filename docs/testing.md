# Testing & Observability

## Environments

| Environment | Purpose | Notes |
|---|---|---|
| Local | Development | Supabase local or dev project; Resend test mode |
| Staging | Pre-production validation | Recommended before launch |
| Production | Live site | Vercel deployment |

## E2E Testing (Playwright)

Bashtoli features a comprehensive automated end-to-end regression test suite powered by [Playwright](https://playwright.dev). The suite validates all critical customer shopping journeys, account synchronization workflows, customer item suggestion pipelines, and admin operational controls against a real Next.js application server and Supabase database.

### Test Architecture & Seeding

- **Test Helpers (`tests/e2e/test-helpers.ts`)**:
  - Automatically loads `.env.local` credentials and creates administrative Supabase clients (`getAdminClient()`).
  - Idempotently seeds an active test category, product (`E2E Test Bamboo Product`), variant, and high stock quantity via `ensureTestCatalog()`.
  - Creates or resets confirmed test customers (`createOrGetTestCustomer()`).
  - Seeds unclaimed guest orders (`createTestGuestOrder()`).
  - Standardizes UI login across customer and administrative roles (`loginViaUI()`).

### Test Suites & Coverage

| Test Spec | Journey Covered | Key Verifications |
|---|---|---|
| `tests/e2e/checkout.spec.ts` | **Guest Checkout Happy Path** | PDP browsing, add-to-bag, delivery zone selection, cash-on-delivery order placement, and redirection to order confirmation page (`/order/ORD-...`). |
| `tests/e2e/admin-orders.spec.ts` | **Admin Order Fulfillment** | Admin authentication, `/admin/orders` table lookup, order status transitions (`pending` → `processing`), and order history tracking. |
| `tests/e2e/guest-order-claim.spec.ts` | **Guest Order Claiming & Account Sync** | Places a guest order with matching phone/email, logs into newly registered customer account, detects `ClaimOrdersPrompt` banner, and atomically claims orders via `claim_guest_orders` RPC. |
| `tests/e2e/account-wishlist.spec.ts` | **Wishlist Persistence & Sync** | **Guest:** Optimistic heart button toggle on product cards backed by `localStorage`.<br>**Customer:** Real-time database synchronization to Supabase and listing verification on `/account/wishlist`. |
| `tests/e2e/admin-storefront.spec.ts` | **Storefront CMS & Customization** | Admin customization of Hero Slide badge text in `/admin/storefront` and verification that updates reflect live on the homepage (`/`). |
| `tests/e2e/suggestions.spec.ts` | **Customer Suggestions & Bot Defense** | **Valid:** Customer submits product suggestion modal, displays success confirmation, and triggers email notifications.<br>**Honeypot:** Hidden anti-spam trap triggers silent acknowledgment without database spam or notifications. |

### Running E2E Tests

```bash
# Run the entire E2E test suite (headless, sequential worker)
npm run test:e2e

# Run tests in interactive UI mode (recommended for local development)
npx playwright test --ui

# Run tests with a visible browser window (headed mode)
npx playwright test --headed

# Run a specific test suite
npx playwright test tests/e2e/checkout.spec.ts
npx playwright test tests/e2e/admin-orders.spec.ts
npx playwright test tests/e2e/guest-order-claim.spec.ts
npx playwright test tests/e2e/account-wishlist.spec.ts
npx playwright test tests/e2e/admin-storefront.spec.ts
npx playwright test tests/e2e/suggestions.spec.ts

# View HTML test execution and failure report
npx playwright show-report
```

### Debugging & Troubleshooting

- **Server Action Timing:** When asserting mutations triggered by Server Actions, ensure locators assert on state changes or wait for pending button states to clear (`await expect(button).toBeEnabled()`).
- **Database Authentication & RLS:** Test helpers leverage `createAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY` to bypass schema caching anomalies during automated tests while standard Server Actions run against customer sessions.
- **Port Conflicts:** The Playwright configuration automatically starts a dev server on port 3000 via `webServer: { command: 'next dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI }`. Ensure port 3000 is available or already running the current commit.

## Observability & Error Monitoring

- **Vercel Web Analytics & Speed Insights:** Enabled across all storefront routes (`@vercel/analytics`).
- Observability and operational health are tracked directly through the Vercel dashboard and server-side console diagnostics.

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
