import React from 'react';
import { useAppDispatch } from '../../store/hooks';
import { addItem } from '../../store/slices/cartSlice';
import styles from './AddToCartButton.module.css';

interface AddToCartButtonProps {
  productId: string | number;
  productName: string;
}

/**
 * AddToCartButton Component
 * Displays an "Add to Cart" button with quantity selector.
 * Uses Redux for state management.
 */
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
}) => {
  const dispatch = useAppDispatch();
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleAddToCart = () => {
    if (!productId) {
      return;
    }

    try {
      // Dispatch Redux action to add item to cart
      // Keep productId as-is (could be string or number)
      dispatch(addItem({ productId, quantity: 1 }));

      // Show success message
      setShowSuccess(true);

      // Clear success message after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      // Error adding to cart
    }
  };

  return (
    <div className={styles.container}>
      {/* Success Message */}
      {showSuccess && (
        <div className={styles.successMessage}>
          ✅ Added to cart
        </div>
      )}

      <div className={styles.wrapper}>
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={styles.addButton}
        >
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
};

export default AddToCartButton;
