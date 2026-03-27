import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products } from '../../data/products'
import { useCommerce } from '../../context/CommerceContext'
import { formatCurrency } from '../../utils/commerce'
import styles from './MiniCart.module.css'

const MiniCart = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { cart, removeFromCart } = useCommerce()
  const navigate = useNavigate()

  const activeItems = useMemo(
    () =>
      cart
        .filter((item) => !item.savedForLater)
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId)
          return product ? { product, quantity: item.quantity } : null
        })
        .filter((item): item is { product: (typeof products)[number]; quantity: number } => item !== null),
    [cart],
  )

  const totalItems = activeItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = activeItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const close = () => setIsOpen(false)

  const handleTriggerClick = () => {
    // Mobile: toggle bottom-sheet. Desktop: navigate directly to /cart (hover already shows preview).
    if (window.innerWidth < 768) {
      setIsOpen((prev) => !prev)
    } else {
      navigate('/cart')
    }
  }

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={close} aria-hidden="true" />}

      <div
        className={styles.miniCart}
        onMouseEnter={() => { if (window.innerWidth >= 768) setIsOpen(true) }}
        onMouseLeave={() => { if (window.innerWidth >= 768) setIsOpen(false) }}
        data-testid="mini-cart"
      >
        <button
          type="button"
          className={`${styles.trigger} ${totalItems > 0 ? styles.triggerActive : ''}`.trim()}
          onClick={handleTriggerClick}
          aria-label={`Cart, ${totalItems} items`}
        >
          🛒
          <span className={styles.cartLabel}>Cart</span>
          {totalItems > 0 && (
            <span className={styles.count}>{totalItems > 99 ? '99+' : totalItems}</span>
          )}
        </button>

        {isOpen && (
          <div className={styles.dropdown} role="dialog" aria-label="Cart preview">
            <div className={styles.dropdownHeader}>
              <span className={styles.dropdownTitle}>
                🛒 My Cart
                {totalItems > 0 && <span className={styles.headerCount}> ({totalItems})</span>}
              </span>
              <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close">✕</button>
            </div>

            {activeItems.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🛍️</span>
                <p className={styles.emptyText}>Your cart is empty</p>
                <Link className={`${styles.btn} ${styles.primary}`.trim()} to="/products" onClick={close}>
                  Shop Now
                </Link>
              </div>
            ) : (
              <>
                <div className={styles.itemList}>
                  {activeItems.slice(0, 5).map(({ product, quantity }) => (
                    <div className={styles.item} key={product.id}>
                      <Link to={`/products/${product.id}`} onClick={close}>
                        <img src={product.image} alt={product.name} className={styles.itemImg} loading="lazy" />
                      </Link>
                      <div className={styles.itemInfo}>
                        <Link to={`/products/${product.id}`} className={styles.itemName} onClick={close}>
                          {product.name}
                        </Link>
                        <p className={styles.itemMeta}>Qty: {quantity} · {formatCurrency(product.price)}</p>
                      </div>
                      <div className={styles.itemRight}>
                        <strong className={styles.itemTotal}>{formatCurrency(product.price * quantity)}</strong>
                        <button type="button" className={styles.removeBtn} onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`}>✕</button>
                      </div>
                    </div>
                  ))}
                  {activeItems.length > 5 && (
                    <p className={styles.moreItems}>+{activeItems.length - 5} more items in cart</p>
                  )}
                </div>

                <div className={styles.footer}>
                  {totalAmount > 2499 && (
                    <p className={styles.freeShipping}>🎉 Free delivery on this order!</p>
                  )}
                  <div className={styles.footerRow}>
                    <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                    <strong>{formatCurrency(totalAmount)}</strong>
                  </div>
                  <div className={styles.actions}>
                    <Link className={styles.btn} to="/cart" onClick={close}>View Cart</Link>
                    <Link className={`${styles.btn} ${styles.primary}`.trim()} to="/checkout" onClick={close}>Checkout →</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default MiniCart
