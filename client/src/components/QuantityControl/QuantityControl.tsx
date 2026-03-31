import React, { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addItem, updateQuantity, removeItem } from '../../store/slices/cartSlice';
import type { CartItem } from '../../store/slices/cartSlice';
import styles from './QuantityControl.module.css';

interface QuantityControlProps {
  productId: number;
  initialQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

/**
 * QuantityControl Component
 * Professional cart quantity toggle UI
 * Shows "Add to Cart" button initially
 * On click, shows [-] quantity [+] controls
 * Uses Redux Toolkit for state management
 */
export const QuantityControl: React.FC<QuantityControlProps> = ({
  productId,
  initialQuantity = 0,
  onQuantityChange,
}) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get current quantity from Redux store
  const cartItem = cartItems.find((item: CartItem) => item.productId === productId);
  const currentQuantity = cartItem?.quantity || initialQuantity;
  // Item is "in cart" only if quantity > 0
  const isInCart = cartItem && cartItem.quantity > 0;

  // Add to cart
  const handleAddToCart = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      dispatch(addItem({ productId, quantity: 1 }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onQuantityChange?.(1);
    } finally {
      setIsLoading(false);
    }
  }, [productId, dispatch, onQuantityChange]);

  // Increment quantity
  const handleIncrement = useCallback(() => {
    if (isLoading || currentQuantity >= 999) return;

    const newQuantity = currentQuantity + 1;
    setIsLoading(true);
    
    try {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
      onQuantityChange?.(newQuantity);
    } finally {
      setIsLoading(false);
    }
  }, [productId, currentQuantity, dispatch, onQuantityChange]);

  // Decrement quantity
  const handleDecrement = useCallback(() => {
    if (isLoading) return;

    const newQuantity = currentQuantity - 1;
    setIsLoading(true);

    try {
      if (newQuantity <= 0) {
        dispatch(removeItem(productId));
      } else {
        dispatch(updateQuantity({ productId, quantity: newQuantity }));
      }
      onQuantityChange?.(newQuantity);
    } finally {
      setIsLoading(false);
    }
  }, [productId, currentQuantity, dispatch, onQuantityChange]);



  return (
    <div className={styles.container}>
      {/* Success Message */}
      {showSuccess && (
        <div className={styles.successMessage}>
          ✅ Added to cart
        </div>
      )}

      {/* If not in cart: Show "Add to Cart" button */}
      {!isInCart ? (
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`${styles.addButton} ${isLoading ? styles.disabled : ''}`}
          aria-label="Add item to cart"
        >
          {isLoading ? '⏳ Adding...' : '🛒 Add to Cart'}
        </button>
      ) : (
        /* If in cart: Show quantity controls */
        <div className={styles.quantityControls}>
          {/* Decrement Button */}
          <button
            onClick={handleDecrement}
            disabled={isLoading}
            className={`${styles.controlButton} ${styles.decrementButton}`}
            aria-label="Decrease quantity"
            title="Decrease quantity"
          >
            −
          </button>

          {/* Quantity Display */}
          <div className={styles.quantityDisplay}>
            <span className={styles.quantity}>{currentQuantity}</span>
          </div>

          {/* Increment Button */}
          <button
            onClick={handleIncrement}
            disabled={isLoading || currentQuantity >= 999}
            className={`${styles.controlButton} ${styles.incrementButton}`}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default QuantityControl;
