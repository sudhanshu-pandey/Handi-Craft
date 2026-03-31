import React from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import styles from './CartDisplay.module.css';

/**
 * CartDisplay Component
 * 
 * Displays the user's shopping cart with all items.
 * Shows active items and cart summary.
 * 
 * Features:
 * - Display all cart items with images and prices
 * - Update quantities
 * - Remove items
 * - Cart total and item count
 * - Loading and error states
 * - Guest vs authenticated user view
 * 
 * Usage:
 * <CartDisplay />
 */
export const CartDisplay: React.FC = () => {
  const { items, total, itemCount, loading, error, 
    removeFromCart, updateQuantity, clearError } = useCart();
  const { isLoggedIn } = useAuth();

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}>⏳</div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>❌ {error}</p>
          <button onClick={clearError} className={styles.dismissButton}>
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Shopping Cart</h1>
        {!isLoggedIn && (
          <p className={styles.guestWarning}>
            👤 Items saved locally. <strong>Log in to sync across devices.</strong>
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Start shopping to add items to your cart</p>
          <a href="/products" className={styles.shopButton}>
            Continue Shopping
          </a>
        </div>
      ) : (
        <>
          {/* Cart Items Section */}
          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <h2>Cart Items ({itemCount})</h2>
            </div>

            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.productId} className={styles.cartItem}>
                  {/* Product Image */}
                  {item.product?.image && (
                    <div className={styles.imageWrapper}>
                      <img
                        src={item.product.image}
                        alt={item.product?.name}
                        className={styles.productImage}
                      />
                    </div>
                  )}

                  {/* Product Details */}
                  <div className={styles.itemDetails}>
                    <h3 className={styles.productName}>
                      {item.product?.name || 'Product'}
                    </h3>
                    <p className={styles.price}>
                      ₹{(item.product?.price || 0).toFixed(2)}
                    </p>
                    <p className={styles.subtotal}>
                      Subtotal: ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Control */}
                  <div className={styles.quantityControl}>
                    <label htmlFor={`qty-${item.productId}`}>Quantity:</label>
                    <div className={styles.quantityInputGroup}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={styles.quantityBtn}
                      >
                        −
                      </button>
                      <input
                        id={`qty-${item.productId}`}
                        type="number"
                        min="1"
                        max="999"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            updateQuantity(item.productId, val);
                          }
                        }}
                        className={styles.quantityInput}
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className={styles.quantityBtn}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={styles.actions}>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className={styles.removeButton}
                      title="Remove from cart"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className={styles.summarySection}>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span className={styles.free}>FREE</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax (est.):</span>
                <span>₹{(total * 0.18).toFixed(2)}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.totalRow}>
                <span>Total:</span>
                <span>₹{(total * 1.18).toFixed(2)}</span>
              </div>

              <div className={styles.buttonGroup}>
                <a href="/checkout" className={styles.checkoutButton}>
                  Proceed to Checkout
                </a>
                <a href="/products" className={styles.continueShoppingButton}>
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartDisplay;
