# Bashtoli Storefront — Owner Confirmation & Business Fact Audit

This document compiles all business facts, policies, legal statements, and contact details currently displayed across `/about`, `/privacy`, and `/terms`.

As mandated by `AGENTS.md`, AI agents must never invent or alter business facts (legal text, shop address, business hours, contact numbers, email addresses, delivery pricing, or replacement promises) without explicit owner confirmation.

---

## 0. Restored Authentic Contact Details (Pre-Redesign Baseline)

The following authentic business contact details existed in the repository prior to the redesign and have been restored per Phase 1j instructions:

| Component | Restored Business Detail | Source in Baseline (`0124502`) | Status |
| :--- | :--- | :--- | :--- |
| `components/storefront/footer.tsx` | Street Address: "Shajadpur, Bashtola, Gulshan-1212, Dhaka, Bangladesh" | Pre-redesign `footer.tsx` | Restored |
| `components/storefront/footer.tsx` | Operating Hours: "Open 7 days · 7am – 11pm" | Pre-redesign `footer.tsx` | Restored |
| `components/storefront/footer.tsx` | Telephone: `tel:01320903666` ("01320-903666") | Pre-redesign `footer.tsx` | Restored |
| `components/storefront/footer.tsx` | Google Maps Location: `Bashtoli Computer Shajadpur Dhaka` query | Pre-redesign `footer.tsx` | Restored |
| `components/storefront/footer.tsx` | WhatsApp Link: `https://wa.me/8801825414737` | Pre-redesign `footer.tsx` | Restored |
| `components/storefront/whatsapp-link.tsx` | WhatsApp Fallback Number: `8801825414737` | Pre-redesign `whatsapp-link.tsx` | Restored |
| `app/(storefront)/order/lookup/page.tsx` | WhatsApp Support Deep Link: `https://wa.me/8801825414737` | Pre-redesign `order/lookup/page.tsx` | Restored |
| `components/storefront/delivery-zone-select.tsx` | Studio Pickup Location: "Gulshan-1, Dhaka · Studio Pickup Hours: Saturday – Thursday, 10 AM – 8 PM" | Pre-redesign `delivery-zone-select.tsx` | Restored |

### Operating Hours Conflict: Retail Store Hours vs. Studio Pickup Hours (TODO for Owner)
- **Retail Store Hours (Footer):** Stated as `Store Hours: Open 7 days · 7am – 11pm` for the physical shop at Shajadpur, Bashtola.
- **Studio Pickup Hours (Checkout):** Stated as `Studio Pickup Hours: Saturday – Thursday, 10 AM – 8 PM` for pickup at Gulshan-1, Dhaka.
- **Current Storefront Labeling:** Both schedules are retained and clearly distinguished on the frontend so customers are not misled:
  - `components/storefront/footer.tsx`: Explicitly labeled `Store Hours: Open 7 days · 7am – 11pm`.
  - `components/storefront/delivery-zone-select.tsx`: Explicitly labeled `Studio Pickup Hours: Saturday – Thursday, 10 AM – 8 PM`.
- **TODO [Owner Action Required]:** Please confirm whether:
  1. The retail store (Shajadpur, Bashtola) and the pickup studio (Gulshan-1) have separate operating schedules as currently displayed, OR
  2. Both refer to the same location/schedule and should be unified under a single operating window across the footer, delivery options, and terms.

### Contact Email Consistency (TODO for Owner)
- **Storewide Email:** `contact@bashtoli.com` is now used consistently across `/footer`, `/about`, `/privacy`, and `/terms`.
- **TODO [Owner Action Required]:** Confirm whether `contact@bashtoli.com` is configured with active MX records on the domain host or if another address (e.g. `support@bashtoli.com` or owner Gmail) should receive store contact inquiries.

---

## 1. About Page (`/about`)

| Item | Current Value on Storefront | Status | Required Owner Action |
| :--- | :--- | :--- | :--- |
| **Brand Name** | Bashtoli / Bashtoli Stationery | Active | Confirm exact legal trade name. |
| **Location** | Dhaka, Bangladesh | Active | Confirm primary operating city. |
| **Store Founding Date** | Previously stated "Est. 2026" (removed in Phase 1h) | Pending Owner Input | Provide official founding year (e.g. 2024, 2025, 2026). |
| **Physical Shop Address** | Previously invented addresses removed. Current placeholder: "Shop location in Dhaka" | Pending Owner Input | Provide exact street address, shop/plot number, road, and neighborhood (e.g. Dhanmondi, Gulshan, Shahbagh). |
| **Brand Story & Narrative** | Neutral placeholder emphasizing quality paper, journals, and desktop essentials. | Pending Owner Input | Supply official brand story, craftsmanship details, paper sourcing origins, and store ethos. |
| **Product Categories** | Fine notebooks, sketchbooks, writing instruments, and paper essentials. | Active | Confirm catalog categories. |

---

## 2. Privacy Policy (`/privacy`)

| Item | Current Value on Storefront | Status | Required Owner Action |
| :--- | :--- | :--- | :--- |
| **Effective / Update Date** | September 2026 | Active | Confirm launch month/year. |
| **Support Email** | `contact@bashtoli.com` | Active | Confirm whether this inbox is configured or if an alternative (e.g. `support@bashtoli.com` or personal email) should be used. |
| **Customer Support Hours** | "Dhaka, Bangladesh · 7 Days a week" | Active | Confirm operating hours (e.g., 9:00 AM – 9:00 PM, 6 days a week vs 7 days). |
| **Data Collected** | Full name, delivery phone number, shipping address, optional email address, order history. | Active | Matches technical database schema (`orders` table). |
| **Customer Communication** | Transactional updates via WhatsApp, phone call, or email. | Active | Confirm whether customer service communicates via WhatsApp, SMS, or phone. |
| **Payment Privacy** | Stated that no credit card information is collected or stored; all payments are COD. | Active | Strictly matches technical implementation (COD-only). |
| **Data Sharing Policy** | Customer data shared exclusively with delivery courier partners for fulfillment; never sold/rented to advertisers. | Active | Confirm standard courier agreement. |
| **Account Deletion / Data Rights** | Customers can request data deletion or address correction by emailing `contact@bashtoli.com`. | Active | Confirm operational procedure for handling customer privacy inquiries. |

---

## 3. Terms of Service (`/terms`)

| Item | Current Value on Storefront | Status | Required Owner Action |
| :--- | :--- | :--- | :--- |
| **Effective / Update Date** | September 2026 | Active | Confirm launch month/year. |
| **Currency & Taxes** | Bangladeshi Taka (`Tk`, BDT), all listed prices inclusive of local VAT/taxes. | Active | Confirm tax inclusion in product catalog prices. |
| **Payment Terms** | Cash on Delivery (COD) only upon package arrival and physical inspection. | Active | Strictly matches technical implementation. |
| **Order Cancellation** | Customers may cancel pending orders within 24 hours of placement directly from the tracking page prior to dispatch. | Active | Matches technical customer cancellation feature. |
| **Shipping Fees & Delivery Times** | | | |
| &bull; Inside Dhaka | **Tk 70** (24 to 48 hours delivery) | Active | Matches `lib/config/delivery.ts` and `place_order` SQL function. |
| &bull; Outside Dhaka | **Tk 120** (3 to 5 business days delivery) | Active | Matches `lib/config/delivery.ts` and `place_order` SQL function. |
| &bull; Store Pickup | **Free** (Collection from Dhaka shop location) | Active | Confirm whether in-person store pickup is active at launch. |
| **Return & Replacement Window** | **7-Day Replacement Promise**; customers must report defects/damage within **48 hours** of parcel delivery. | Active | Confirm whether 48 hours for reporting damage and 7-day replacement window matches store policy. |
| **Evidence for Claims** | Customers requested to send photographs via WhatsApp to customer support. | Active | Confirm WhatsApp support channel. |
| **Customer Support Channels** | `contact@bashtoli.com` | Active | Confirm official customer support email and phone/WhatsApp number. |
| **Intellectual Property** | Photography, graphics, and text are property of Bashtoli Stationery. | Active | Standard copyright protection. |

---

## 4. Instructions for Store Owner

To finalize and approve these claims for launch:
1. Review the values listed above.
2. If any value requires adjustment (e.g., replacement window, contact email, business hours, shop pickup availability), specify the revised wording.
3. Provide the official brand story and physical store address for `/about`.
