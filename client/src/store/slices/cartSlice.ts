import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: number | string;
  quantity: number;
  savedForLater: boolean;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
}

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
};

/**
 * Cart Slice - Redux Toolkit
 * Manages all cart-related state and actions
 * Persists to localStorage automatically
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Load cart from localStorage
    loadCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.itemCount = action.payload.filter((item) => !item.savedForLater).length;
    },

    // Add item to cart
    // If item is saved-for-later, move it to active cart
    // If item is already active, increase quantity
    addItem: (state, action: PayloadAction<{ productId: number | string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      
      // Find existing item with flexible ID matching (handle numeric and string IDs)
      const existingItem = state.items.find((item) => {
        const existingIdStr = String(item.productId);
        const newIdStr = String(productId);
        return existingIdStr === newIdStr || item.productId === productId;
      });

      if (existingItem) {
        // If item exists and is saved-for-later, move to active cart
        if (existingItem.savedForLater) {
          existingItem.savedForLater = false;
          existingItem.quantity = quantity; // Set quantity to new amount, not increment
        } else {
          // If item is already active, increase quantity
          existingItem.quantity += quantity;
        }
      } else {
        // Create new active cart item
        state.items.push({
          productId,
          quantity,
          savedForLater: false,
        });
      }

      // Update item count (exclude saved for later)
      state.itemCount = state.items.filter((item) => !item.savedForLater).length;
    },

    // Update item quantity
    updateQuantity: (state, action: PayloadAction<{ productId: number | string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      
      // Find item with flexible ID matching (handle numeric and string IDs)
      const item = state.items.find((item) => {
        const existingIdStr = String(item.productId);
        const newIdStr = String(productId);
        return existingIdStr === newIdStr || item.productId === productId;
      });

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter((item) => {
            const existingIdStr = String(item.productId);
            const newIdStr = String(productId);
            return !(existingIdStr === newIdStr || item.productId === productId);
          });
        } else {
          item.quantity = quantity;
        }
      }

      // Update item count
      state.itemCount = state.items.filter((item) => !item.savedForLater).length;
    },

    // Remove item from cart
    removeItem: (state, action: PayloadAction<number | string>) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => {
        const existingIdStr = String(item.productId);
        const newIdStr = String(productId);
        return !(existingIdStr === newIdStr || item.productId === productId);
      });
      state.itemCount = state.items.filter((item) => !item.savedForLater).length;
    },

    // Toggle save for later
    toggleSaveForLater: (state, action: PayloadAction<number | string>) => {
      const productId = action.payload;
      const item = state.items.find((item) => {
        const existingIdStr = String(item.productId);
        const newIdStr = String(productId);
        return existingIdStr === newIdStr || item.productId === productId;
      });

      if (item) {
        item.savedForLater = !item.savedForLater;
      }

      // Update item count
      state.itemCount = state.items.filter((item) => !item.savedForLater).length;
    },

    // Move item from saved-for-later to active cart
    moveToActiveCart: (state, action: PayloadAction<number | string>) => {
      const productId = action.payload;
      const item = state.items.find((item) => item.productId === productId);

      if (item && item.savedForLater) {
        item.savedForLater = false;
      }

      // Update item count
      state.itemCount = state.items.filter((item) => !item.savedForLater).length;
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.total = 0;
    },

    // Set cart total (for future use with product prices)
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },

    // Sync cart from server (for logged-in users)
    syncCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.itemCount = action.payload.filter((item) => !item.savedForLater).length;
    },
  },
});

export const {
  loadCart,
  addItem,
  updateQuantity,
  removeItem,
  toggleSaveForLater,
  moveToActiveCart,
  clearCart,
  setTotal,
  syncCart,
} = cartSlice.actions;

export default cartSlice.reducer;
