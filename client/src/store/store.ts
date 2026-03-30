import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import { cartPersistenceMiddleware } from './middleware/cartPersistence';

/**
 * Redux Store Configuration
 * Combines all reducers, middleware, and configures the store
 */
const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartPersistenceMiddleware as any),
}) as any;

export { store };

// Export types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
