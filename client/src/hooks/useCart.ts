/**
 * useCart Hook
 * Production-grade hook for cart operations
 * Handles guest and logged-in user flows seamlessly
 */

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import CartService from '../services/cart.service'
import { getLocalCart } from '../utils/cartStorage'
import type { CartItem, CartOperationResult } from '../types/cart.types'

interface UseCartState {
  items: CartItem[]
  savedItems: CartItem[]
  total: number
  itemCount: number
  loading: boolean
  syncing: boolean
  error: string | null
}

interface UseCartActions {
  addToCart: (productId: string | number, quantity: number) => Promise<CartOperationResult>
  removeFromCart: (productId: string | number) => Promise<CartOperationResult>
  updateQuantity: (productId: string | number, quantity: number) => Promise<CartOperationResult>
  toggleSaveForLater: (productId: string | number, saved: boolean) => Promise<CartOperationResult>
  clearCart: () => Promise<CartOperationResult>
  refreshCart: () => Promise<CartOperationResult>
  clearError: () => void
}

export const useCart = (): UseCartState & UseCartActions => {
  const { isLoggedIn } = useAuth()
  const [state, setState] = useState<UseCartState>({
    items: [],
    savedItems: [],
    total: 0,
    itemCount: 0,
    loading: false,
    syncing: false,
    error: null,
  })

  /**
   * Load cart on mount or when login status changes
   */
  useEffect(() => {
    const loadCart = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await CartService.getCart(isLoggedIn)

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          items: result.data!.cart || [],
          savedItems: result.data!.savedItems || [],
          total: result.data!.total || 0,
          itemCount: result.data!.itemCount || 0,
          loading: false,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Failed to load cart',
          loading: false,
        }))
      }
    }

    loadCart()
  }, [isLoggedIn])

  /**
   * Listen for cart changes across tabs (guest cart sync)
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'hc_guest_cart_v2' && !isLoggedIn) {
        // Guest cart changed in another tab
        try {
          if (event.newValue) {
            const cartItems = JSON.parse(event.newValue)
            const activeItems = cartItems.filter((item: any) => !item.savedForLater)
            const savedItems = cartItems.filter((item: any) => item.savedForLater)
            
            setState((prev) => ({
              ...prev,
              items: activeItems,
              savedItems: savedItems,
              itemCount: activeItems.length,
            }))
            console.log('🔄 [useCart] Guest cart synced from another tab')
          } else {
            // Cart was cleared in another tab
            setState((prev) => ({
              ...prev,
              items: [],
              savedItems: [],
              itemCount: 0,
            }))
          }
        } catch (err) {
          console.error('❌ [useCart] Error syncing cart across tabs:', err)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [isLoggedIn])

  /**
   * Sync guest cart when user logs in
   */
  useEffect(() => {
    const syncOnLogin = async () => {
      if (isLoggedIn) {
        const guestCart = getLocalCart()
        if (guestCart.length > 0) {
          setState((prev) => ({ ...prev, syncing: true }))
          const result = await CartService.syncGuestCart()

          if (result.success) {
            console.log('✅ [useCart] Cart synced successfully on login')
            // Refresh cart after sync
            const refreshResult = await CartService.getCart(true)
            if (refreshResult.success && refreshResult.data) {
              setState((prev) => ({
                ...prev,
                items: refreshResult.data!.cart || [],
                savedItems: refreshResult.data!.savedItems || [],
                total: refreshResult.data!.total || 0,
                itemCount: refreshResult.data!.itemCount || 0,
                syncing: false,
              }))
            }
          } else {
            setState((prev) => ({
              ...prev,
              error: result.error || 'Failed to sync cart',
              syncing: false,
            }))
          }
        }
      } else {
        // User logged out - clear cart state
        console.log('🔴 [useCart] User logged out - clearing cart')
        setState((prev) => ({
          ...prev,
          items: [],
          savedItems: [],
          total: 0,
          itemCount: 0,
        }))
      }
    }

    syncOnLogin()
  }, [isLoggedIn])

  /**
   * Add item to cart
   */
  const addToCart = useCallback(
    async (productId: string | number, quantity: number): Promise<CartOperationResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await CartService.addToCart(productId, quantity, isLoggedIn)

      if (result.success) {
        if (result.data) {
          setState((prev) => ({
            ...prev,
            items: result.data!.cart || [],
            savedItems: result.data!.savedItems || [],
            total: result.data!.total || 0,
            itemCount: result.data!.itemCount || 0,
            loading: false,
          }))
        } else {
          // Guest mode - update from local cart
          const localCart = getLocalCart()
          setState((prev) => ({
            ...prev,
            items: localCart.filter((item) => !item.savedForLater),
            savedItems: localCart.filter((item) => item.savedForLater),
            itemCount: localCart.filter((item) => !item.savedForLater).length,
            loading: false,
          }))
        }
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Failed to add to cart',
          loading: false,
        }))
      }

      return result
    },
    [isLoggedIn]
  )

  /**
   * Remove from cart
   */
  const removeFromCart = useCallback(
    async (productId: string | number): Promise<CartOperationResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await CartService.removeFromCart(productId, isLoggedIn)

      if (result.success) {
        if (result.data) {
          setState((prev) => ({
            ...prev,
            items: result.data!.cart || [],
            savedItems: result.data!.savedItems || [],
            total: result.data!.total || 0,
            itemCount: result.data!.itemCount || 0,
            loading: false,
          }))
        } else {
          // Guest mode
          const localCart = getLocalCart()
          setState((prev) => ({
            ...prev,
            items: localCart.filter((item) => !item.savedForLater),
            savedItems: localCart.filter((item) => item.savedForLater),
            itemCount: localCart.filter((item) => !item.savedForLater).length,
            loading: false,
          }))
        }
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Failed to remove from cart',
          loading: false,
        }))
      }

      return result
    },
    [isLoggedIn]
  )

  /**
   * Update quantity
   */
  const updateQuantity = useCallback(
    async (productId: string | number, quantity: number): Promise<CartOperationResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await CartService.updateQuantity(productId, quantity, isLoggedIn)

      if (result.success) {
        if (result.data) {
          setState((prev) => ({
            ...prev,
            items: result.data!.cart || [],
            savedItems: result.data!.savedItems || [],
            total: result.data!.total || 0,
            itemCount: result.data!.itemCount || 0,
            loading: false,
          }))
        } else {
          // Guest mode
          const localCart = getLocalCart()
          setState((prev) => ({
            ...prev,
            items: localCart.filter((item) => !item.savedForLater),
            savedItems: localCart.filter((item) => item.savedForLater),
            itemCount: localCart.filter((item) => !item.savedForLater).length,
            loading: false,
          }))
        }
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Failed to update cart',
          loading: false,
        }))
      }

      return result
    },
    [isLoggedIn]
  )

  /**
   * Toggle save for later
   */
  const toggleSaveForLater = useCallback(
    async (productId: string | number, saved: boolean): Promise<CartOperationResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await CartService.toggleSaveForLater(productId, saved, isLoggedIn)

      if (result.success) {
        if (result.data) {
          setState((prev) => ({
            ...prev,
            items: result.data!.cart || [],
            savedItems: result.data!.savedItems || [],
            total: result.data!.total || 0,
            itemCount: result.data!.itemCount || 0,
            loading: false,
          }))
        } else {
          // Guest mode
          const localCart = getLocalCart()
          setState((prev) => ({
            ...prev,
            items: localCart.filter((item) => !item.savedForLater),
            savedItems: localCart.filter((item) => item.savedForLater),
            loading: false,
          }))
        }
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Failed to toggle save for later',
          loading: false,
        }))
      }

      return result
    },
    [isLoggedIn]
  )

  /**
   * Clear cart
   */
  const clearCart = useCallback(async (): Promise<CartOperationResult> => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const result = await CartService.clearCart(isLoggedIn)

    if (result.success) {
      setState((prev) => ({
        ...prev,
        items: [],
        savedItems: [],
        total: 0,
        itemCount: 0,
        loading: false,
      }))
    } else {
      setState((prev) => ({
        ...prev,
        error: result.error || 'Failed to clear cart',
        loading: false,
      }))
    }

    return result
  }, [isLoggedIn])

  /**
   * Refresh cart from server/localStorage
   */
  const refreshCart = useCallback(async (): Promise<CartOperationResult> => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const result = await CartService.getCart(isLoggedIn)

    if (result.success && result.data) {
      setState((prev) => ({
        ...prev,
        items: result.data!.cart || [],
        savedItems: result.data!.savedItems || [],
        total: result.data!.total || 0,
        itemCount: result.data!.itemCount || 0,
        loading: false,
      }))
    } else {
      setState((prev) => ({
        ...prev,
        error: result.error || 'Failed to refresh cart',
        loading: false,
      }))
    }

    return result
  }, [isLoggedIn])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    items: state.items,
    savedItems: state.savedItems,
    total: state.total,
    itemCount: state.itemCount,
    loading: state.loading,
    syncing: state.syncing,
    error: state.error,
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSaveForLater,
    clearCart,
    refreshCart,
    clearError,
  }
}

export default useCart
