import React from 'react';
import { useCommerce } from '../../context/CommerceContext';
import styles from './AddToCartButton.module.css';

interface AddToCartButtonProps {
  productId: string | number;
  productName: string;
}

/**
 * AddToCartButton Component
 * Displays an "Add to Cart" button with quantity selector.
 * Supports both guest and authenticated users.
 */
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
}) => {
  const { addToCart } = useCommerce();
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleAddToCart = () => {
    if (!productId) {
      console.error('❌ Product ID is missing');
      return;
    }

    // Convert productId to number for CommerceContext
    const numericId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    
    if (isNaN(numericId)) {
      console.error('❌ Invalid Product ID:', productId);
      return;
    }

    try {
      // CommerceContext addToCart doesn't return a result, it just updates state
      addToCart(numericId, 1);

      // Show success message
      setShowSuccess(true);

      // Clear success message after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
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
