import { CheckoutForm } from '@/components/storefront/checkout-form'

export const metadata = {
  title: 'Checkout | Bashtoli Storefront',
  description: 'Provide your shipping info and complete your order with Cash on Delivery.',
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Confirm your order details and delivery address below.
        </p>
      </div>

      {/* Interactive Form Component */}
      <CheckoutForm />
    </div>
  )
}
