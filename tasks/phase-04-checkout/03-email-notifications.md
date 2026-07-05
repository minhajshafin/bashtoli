# Task: Email Notifications (Resend)

**Phase:** 4 — Checkout + Emails  
**Week:** 7

## Goal

Send transactional emails on order creation to owner/staff and customer (when email provided).

## Requirements

- Integrate Resend SDK
- On order creation, send:
  - **Owner/staff alert:** new order details (order number, customer name, items, total)
  - **Customer confirmation:** order summary (when guest_email provided)
- Email templates: plain HTML, mobile-friendly
- Use Resend test mode in development
- Handle email failures gracefully (order still created; log error)
- WhatsApp deep link on order confirmation page

## Acceptance Criteria

- [ ] Owner/staff receives email on new order
- [ ] Customer receives confirmation email when email provided at checkout
- [ ] No email sent when customer leaves email blank
- [ ] Email contains order number, items, and total
- [ ] Failed email send does not block order creation
- [ ] Dev environment uses Resend test mode
- [ ] WhatsApp link on confirmation page opens chat with pre-filled message

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
