/**
 * Cart API Service
 * Enterprise-grade API calls for cart operations
 * Handles guest and logged-in user flows
 */

import type {
  AddToCartPayload,
  CartResponse,
  UpdateQuantityPayload,
  SyncCartPayload,
} from '../types/cart.types'
import api from '../services/api'

/**
 * Add product to cart
 * @param payload - { productId, quantity }
 * @returns CartResponse
 */
export const addToCartAPI = async (payload: AddToCartPayload): Promise<CartResponse> => {
  try {
    console.log('🔵 [CartAPI] Adding to cart:', payload)
    const response = await api.addToCart(payload.productId, payload.quantity)
    console.log('🟢 [CartAPI] Add to cart success:', response)
    return response
  } catch (error: any) {
    console.error('🔴 [CartAPI] Add to cart failed:', error.message)
    throw new Error(error.message || 'Failed to add item to cart')
  }
}

/**
 * Get user's cart from backend
 * @returns CartResponse
 */
export const getCartAPI = async (): Promise<CartResponse> => {
  try {
    console.log('🔵 [CartAPI] Fetching cart from backend')
    const response = await api.getCart()
    console.log('🟢 [CartAPI] Cart fetched:', response)
    return response
  } catch (error: any) {
    console.error('🔴 [CartAPI] Get cart failed:', error.message)
    throw new Error(error.message || 'Failed to fetch cart')
  }
}

/**
 * Update cart item quantity
 * @param payload - { productId, quantity }
 * @returns CartResponse
 */
export const updateCartQuantityAPI = async (
  payload: UpdateQuantityPayload
): Promise<CartResponse> => {
  try {
    console.log('🔵 [CartAPI] Updating cart quantity:', payload)
    const response = await api.updateCartQuantity(payload.productId, payload.quantity)
    console.log('🟢 [CartAPI] Update quantity success:', response)
    return response
  } catch (error: any) {
    console.error('🔴 [CartAPI] Update quantity failed:', error.message)
    throw new Error(error.message || 'Failed to update cart')
  }
}

/**
 * Remove item from cart
 * @param productId - string | number
 * @returns CartResponse
 */
export const removeFromCartAPI = async (productId: string | number): Promise<CartResponse> => {
  try {
    console.log('🔵 [CartAPI] Removing from cart:', productId)
    const response = await api.removeFromCart(productId)
    console.log('🟢 [CartAPI] Remove from cart success:', response)
    return response
  } catch (error: any) {
    console.error('🔴 [CartAPI] Remove from cart failed:', error.message)
    throw new Error(error.message || 'Failed to remove item from cart')
  }
}

/**
 * Sync guest cart with backend
 * Called when user logs in
 * @param payload - { items: CartItem[] }
 * @returns CartResponse
 */
export const syncCartAPI = async (payload: SyncCartPayload): Promise<CartResponse> => {
  try {
    console.log('🔵 [CartAPI] Syncing cart with backend, items:', payload.items.length)
    // Note: This endpoint needs to be added to backend if not exists
    const response = await api.request('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items: payload.items }),
    })
    console.log('🟢 [CartAPI] Cart sync success:', response)
    return response
  } catch (error: any) {
    console.error('🔴 [CartAPI] Cart sync failed:', error.message)
    throw new Error(error.message || 'Failed to sync cart')
  }
}

/**
 * Toggle save for later
 * @param productId - string | number
 * @param savedForLater - boolean
 * @returns CartResponse
 */
export const toggleSaveForLaterAPI = async (
  productId: string | number,
  savedForLater: boolean
): Promise<CartResponse> => {
  try {
    console.log('🔵 [CartAPI] Toggling save for later:', productId, savedForLater)
    const response = await api.toggleSaveForLater(productId, savedForLater)
    console.log('🟢 [CartAPI] Save for later success:', response)
    return response
  } catch (error: any) {
    console.error('🔴 [CartAPI] Save for later failed:', error.message)
    throw new Error(error.message || 'Failed to update save for later')
  }
}

/**
 * Clear entire cart
 * @returns CartResponse
 */
export const clearCartAPI = async (): Promise<CartResponse> => {
  try {
    console.log('🔵 [CartAPI] Clearing entire cart')
    const response = await api.clearCart()
    console.log('🟢 [CartAPI] Clear cart success:', response)
    return response
  } catch (error: any) {
    console.error('🔴 [CartAPI] Clear cart failed:', error.message)
    throw new Error(error.message || 'Failed to clear cart')
  }
}
