# Task: Email Notifications (Resend)

**Phase:** 4 — Checkout + Emails  
**Week:** 7

## Goal

Send transactional emails on order creation to owner/staff and customer (when email provided). Status-change emails are added in Phase 6 (Task 6-02).

## Requirements

- Integrate Resend SDK (`resend` npm package)
- Configure sender domain in Resend dashboard (required for production); test mode in dev
- Owner/staff alert recipient configured via `ADMIN_NOTIFICATION_EMAIL` environment variable
- On order creation, send:
  - **Owner/staff alert:** new order details (order number, customer name, items, total, delivery zone)
  - **Customer confirmation:** order summary (when guest_email or account email provided)
- Email templates: plain HTML, mobile-friendly
- Use Resend test mode in development
- **Failure handling:** email send is fire-and-forget — failures log to Sentry but do not block order creation
- WhatsApp deep link on order confirmation page (use placeholder number until resolved; see [Open Items](../docs/open-items.md))

## Acceptance Criteria

- [ ] Owner/staff receives email on new order (to `ADMIN_NOTIFICATION_EMAIL`)
- [ ] Customer receives confirmation email when email provided at checkout
- [ ] No email sent when customer leaves email blank
- [ ] Email contains order number, items, total, and delivery zone/fee
- [ ] Failed email send does not block order creation; error logged
- [ ] Dev environment uses Resend test mode
- [ ] WhatsApp link on confirmation page opens chat with pre-filled message
- [ ] Resend sender domain verified (Resend dashboard) before production deploy

## Dependencies

- [01-cod-checkout.md](./01-cod-checkout.md)
- WhatsApp business number from [Open Items](../docs/open-items.md) (use placeholder until confirmed)

## Files to Modify

| File | Action |
|---|---|
| `lib/email/resend.ts` | Create |
| `lib/email/templates/order-alert.tsx` | Create |
| `lib/email/templates/order-confirmation.tsx` | Create |
| `lib/actions/checkout.ts` | Update |
| `app/(storefront)/order/[orderNumber]/page.tsx` | Update |
| `components/storefront/whatsapp-link.tsx` | Create |

## Definition of Done

- [ ] Both email types tested in dev (Resend test mode)
- [ ] Email failure handled without breaking checkout
- [ ] WhatsApp link functional with configured number
- [ ] Email templates readable on mobile
