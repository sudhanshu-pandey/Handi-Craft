import { Product } from '../data/products'

export const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`

export const calculateDiscountPercent = (price: number, originalPrice?: number) => {
  if (!originalPrice || originalPrice <= price) {
    return 0
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export const getStockCount = (productId: number | string) => {
  // Handle both numeric and string IDs
  let numericId = typeof productId === 'string' ? productId.charCodeAt(0) : productId
  
  // Fallback to a default if numericId is invalid
  if (isNaN(numericId) || numericId === 0) {
    numericId = 15
  }
  
  const seed = (numericId * 13) % 10
  return seed < 3 ? seed + 1 : seed + 3
}

export const estimateDeliveryByPincode = (pincode: string) => {
  const normalized = pincode.trim()

  if (!/^\d{6}$/.test(normalized)) {
    return {
      isServiceable: false,
      shippingCost: 0,
      estimatedDate: '',
      message: 'Enter a valid 6-digit pincode',
    }
  }

  const firstDigit = Number(normalized[0])
  const deliveryDays = firstDigit <= 3 ? 2 : firstDigit <= 6 ? 4 : 6
  const shippingCost = firstDigit <= 4 ? 0 : firstDigit <= 7 ? 49 : 99
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays)

  return {
    isServiceable: true,
    shippingCost,
    estimatedDate: deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }),
    message: shippingCost === 0 ? 'Free delivery available' : `Shipping ₹${shippingCost}`,
  }
}

export const getProductById = (products: Product[], id: number) => products.find((item) => item.id === id)

export const sumCartValue = (items: Array<{ product: Product; quantity: number }>) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0)

export const sumOriginalCartValue = (items: Array<{ product: Product; quantity: number }>) =>
  items.reduce(
    (total, item) => total + (item.product.originalPrice ?? item.product.price) * item.quantity,
    0,
  )
