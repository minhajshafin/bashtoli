# Open Items

Decisions pending confirmation with the business owner. These affect implementation details and should be resolved before the relevant phase begins.

## Business Policy

| Item | Priority | Impact | Relevant Phase |
|---|---|---|---|
| Made-to-order products and lead time display | Medium | Additional product field + PDP display | Phase 3 (Storefront) |
| Minimum order amount (if any) | Low | Checkout validation rules | Phase 4 (Checkout) |

## Staff & Access

| Item | Priority | Impact | Relevant Phase |
|---|---|---|---|
| Who counts as "staff" | Low | Add employees later, or owner-only for now? | Phase 6 |

## Branding & Content

| Item | Priority | Impact | Relevant Phase |
|---|---|---|---|
| Branding assets | **High** | Logo, colors, business info for footer/About page — needed before Phase 7 | Phase 7 (Polish) |
| WhatsApp business number | **High** | Contact page and order confirmation link — needed before Phase 4 | Phase 4, Phase 7 |

## Technical

| Item | Priority | Impact | Relevant Phase |
|---|---|---|---|
| Supabase Storage bucket visibility | Medium | Public bucket (direct URL in `<Image>`) vs private (signed URLs). Recommend: **public** for simplicity | Phase 1 |
| Slug generation strategy | Low | Auto-generate from product/category name; allow manual override; unique constraint enforced | Phase 2 |

## Future (v1.1)

| Item | Impact | Notes |
|---|---|---|
| SMS notifications on order status | Twilio or local provider | Deferred from v1; fast follow-up |
| Return/refund flow | Affects order cancellation UI | Deferred until owner confirms policy |

## Resolution Tracking

| Item | Status | Decision | Date |
|---|---|---|---|
| Delivery fee logic | ✅ Resolved | Zone-based: ৳70 inside Dhaka, ৳120 outside Dhaka | 2026-07-05 |
| Shipping/delivery areas | ✅ Resolved | Dhaka city (inside) and rest of Bangladesh (outside) | 2026-07-05 |
| Delivery vs pickup | ✅ Resolved | Both offered: delivery (zoned fee) + pickup (free) | 2026-07-05 |
| Order cancellation window | ✅ Resolved | Customer: ≤24h from creation, pending only. Admin: anytime non-final | 2026-07-05 |
| Product return/cancellation policy | ✅ Resolved | No returns in v1; cancellation window defined above | 2026-07-05 |
| Made-to-order products | Open | — | — |
| Minimum order amount | Open | — | — |
| Staff access model | Open | — | — |
| Branding assets | Open | — | — |
| WhatsApp business number | Open | — | — |
| Supabase Storage bucket | Open | — | — |
| Slug generation strategy | Open | — | — |
| SMS notifications | Deferred (v1.1) | — | — |
| Return/refund flow | Deferred (v1.1) | — | — |

Update this table as decisions are made.
