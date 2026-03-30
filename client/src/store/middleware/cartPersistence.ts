import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const CART_STORAGE_KEY = 'hc_cart_v1';

/**
 * Redux Middleware for localStorage persistence
 * Automatically saves cart state to localStorage on changes
 * Loads cart state from localStorage on app startup
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
    const cartData = state.cart.items;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error('Failed to persist cart to localStorage:', error);
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
