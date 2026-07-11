export interface CartItem {
  variant_id: string
  product_id: string
  name: string
  variant_name: string
  price: number
  image_url: string | null
  qty: number
}

const CART_KEY = 'bashtoli_guest_cart'

/**
 * Retrieve the guest cart from localStorage.
 * Returns an empty array if not in browser or if cart doesn't exist.
 */
export function getGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const value = localStorage.getItem(CART_KEY)
    return value ? JSON.parse(value) : []
  } catch (error) {
    console.error('Error reading guest cart:', error)
    return []
  }
}

/**
 * Persist the guest cart to localStorage.
 */
export function saveGuestCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving guest cart:', error)
  }
}

/**
 * Add an item to the guest cart. If it already exists, increment quantity.
 */
export function addToGuestCart(item: Omit<CartItem, 'qty'>, qty: number): CartItem[] {
  const cart = getGuestCart()
  const existing = cart.find((i) => i.variant_id === item.variant_id)

  if (existing) {
    existing.qty += qty
  } else {
    cart.push({ ...item, qty })
  }

  saveGuestCart(cart)
  return cart
}

/**
 * Update the quantity of a specific item in the guest cart.
 */
export function updateGuestCartQty(variantId: string, qty: number): CartItem[] {
  let cart = getGuestCart()
  const item = cart.find((i) => i.variant_id === variantId)

  if (item) {
    item.qty = Math.max(1, qty)
    saveGuestCart(cart)
  }

  return cart
}

/**
 * Remove an item from the guest cart.
 */
export function removeFromGuestCart(variantId: string): CartItem[] {
  const cart = getGuestCart().filter((i) => i.variant_id !== variantId)
  saveGuestCart(cart)
  return cart
}

/**
 * Empty the guest cart.
 */
export function clearGuestCart(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(CART_KEY)
  } catch (error) {
    console.error('Error clearing guest cart:', error)
  }
}
