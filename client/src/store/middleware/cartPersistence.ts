import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const CART_STORAGE_KEY = 'hc_cart_v1';
const WISHLIST_STORAGE_KEY = 'hc_wishlist_v1';

/**
 * Redux Middleware for localStorage persistence
 * Automatically saves cart and wishlist state to localStorage on changes
 * Loads state from localStorage on app startup
 */
export const cartPersistenceMiddleware: Middleware<
  (action: any) => any,
  RootState
> = (store) => (next) => (action) => {
  // Call the reducer
  const result = next(action);

  // Save to localStorage after state updates
  const state = store.getState();
  try {
    // Persist cart
    const cartData = state.cart.items;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));

    // Persist wishlist
    const wishlistData = state.wishlist.items;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistData));
  } catch (error) {
    console.error('Failed to persist state to localStorage:', error);
  }

  return result;
};

/**
 * Load cart from localStorage
 * Call this in your app initialization
 */
export const loadCartFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

/**
 * Load wishlist from localStorage
 * Call this in your app initialization
 */
export const loadWishlistFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load wishlist from localStorage:', error);
    return [];
  }
};

