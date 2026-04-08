import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import productReducer from './slices/productSlice';
import addressReducer from './slices/addressSlice';
import orderReducer from './slices/orderSlice';
import filterReducer from './slices/filterSlice';
import { cartPersistenceMiddleware } from './middleware/cartPersistence';
import { filterPersistenceMiddleware } from './middleware/filterPersistence';

/**
 * Redux Store Configuration
 * Combines all reducers, middleware, and configures the store
 */
const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
    address: addressReducer,
    orders: orderReducer,
    filters: filterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      cartPersistenceMiddleware as any,
      filterPersistenceMiddleware as any
    ),
}) as any;

export { store };

// Export types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
