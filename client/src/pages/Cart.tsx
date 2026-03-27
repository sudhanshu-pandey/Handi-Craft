import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products } from '../data/products'
import { useCommerce } from '../context/CommerceContext'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../components/LoginModal/LoginModal'
import { formatCurrency, sumCartValue, sumOriginalCartValue } from '../utils/commerce'
import styles from './commerce.module.css'

const VALID_COUPONS: Record<string, number> = {
  ARTISAN10: 10,
  CRAFT20: 20,
  HANDICRAFT5: 5,
}

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, toggleSaveForLater } = useCommerce()
  const { isLoggedIn, login } = useAuth()
    const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const cartItems = cart
    .filter((item) => !item.savedForLater)
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      return product ? { product, quantity: item.quantity } : null
    })
    .filter((item): item is { product: (typeof products)[number]; quantity: number } => item !== null)

  const savedItems = cart
    .filter((item) => item.savedForLater)
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      return product ? { product, quantity: item.quantity } : null
    })
    .filter((item): item is { product: (typeof products)[number]; quantity: number } => item !== null)

  const subtotal = sumCartValue(cartItems)
  const originalSubtotal = sumOriginalCartValue(cartItems)
  const discount = Math.max(0, originalSubtotal - subtotal)
  const couponDiscount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discountPct / 100)) : 0
  const deliveryFee = subtotal > 2499 || subtotal === 0 ? 0 : 49
  const total = subtotal - couponDiscount + deliveryFee

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError('Enter a coupon code')
      return
    }
    const pct = VALID_COUPONS[code]
    if (!pct) {
      setCouponError('Invalid or expired coupon')
      setAppliedCoupon(null)
      return
    }
    setAppliedCoupon({ code, discountPct: pct })
    setCouponError('')
    setCouponCode('')
  }

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true)
      return
    }
    navigate('/checkout')
  }

  return (
    <div className={`container ${styles.page}`} data-testid="cart-page">
      <h1 style={{ marginBottom: 16 }}>Smart Cart</h1>

      {cartItems.length === 0 ? (
        <div className={styles.card} style={{ padding: 16 }}>
          <h2 style={{ color: 'var(--text-dark)' }}>Your cart is empty</h2>
          <p>Add artisan products to continue checkout.</p>
          <Link to="/products" className={styles.primaryBtn}>Continue shopping</Link>
        </div>
      ) : (
        <div className={styles.checkoutGrid} style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          <section className={styles.card} style={{ padding: 14 }}>
            {cartItems.map(({ product, quantity }) => (
              <article key={product.id} className={styles.softCard} style={{ padding: 12, marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10 }}>
                  <img src={product.image} alt={product.name} loading="lazy" style={{ width: 90, height: 90, borderRadius: 10, objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ color: 'var(--text-dark)', marginBottom: 4 }}>{product.name}</h3>
                    <p style={{ marginBottom: 8 }}>{formatCurrency(product.price)}</p>
                    <div className={styles.row}>
                      <div className={styles.qtyWrap}>
                        <button type="button" className={styles.qtyBtn} onClick={() => updateCartQuantity(product.id, quantity - 1)}>-</button>
                        <span className={styles.qtyVal} data-testid={`cart-qty-${product.id}`}>{quantity}</span>
                        <button type="button" className={styles.qtyBtn} onClick={() => updateCartQuantity(product.id, quantity + 1)}>+</button>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" className={styles.ghostBtn} onClick={() => toggleSaveForLater(product.id)}>Save for later</button>
                        <button type="button" className={styles.ghostBtn} onClick={() => removeFromCart(product.id)}>Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {savedItems.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <h3>Saved for later</h3>
                {savedItems.map(({ product, quantity }) => (
                  <article key={product.id} className={styles.softCard} style={{ padding: 12, marginTop: 10 }}>
                    <div className={styles.row}>
                      <div>
                        <strong style={{ color: 'var(--text-dark)' }}>{product.name}</strong>
                        <p>Qty: {quantity}</p>
                      </div>
                      <button type="button" className={styles.secondaryBtn} onClick={() => toggleSaveForLater(product.id)}>
                        Move to cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className={styles.card} style={{ padding: 14, height: 'fit-content' }}>
            <h3 style={{ marginBottom: 10 }}>Price summary</h3>
            <div className={styles.row}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className={styles.row}><span>Discount</span><span style={{ color: 'var(--success-color)' }}>-{formatCurrency(discount)}</span></div>
            {couponDiscount > 0 && (
              <div className={styles.row}><span>Coupon ({appliedCoupon?.code})</span><span style={{ color: 'var(--success-color)' }}>-{formatCurrency(couponDiscount)}</span></div>
            )}
            <div className={styles.row}><span>Delivery fee</span><span>{deliveryFee === 0 ? <span className={styles.stockOk}>Free</span> : formatCurrency(deliveryFee)}</span></div>
            <hr className={styles.divider} />
            <div className={styles.row} style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '1.05rem' }}>
              <span>Total</span>
              <span data-testid="cart-total">{formatCurrency(total)}</span>
            </div>

            {/* Coupon */}
            {appliedCoupon ? (
              <div className={styles.couponApplied}>
                <span>🎉 {appliedCoupon.code} applied – {appliedCoupon.discountPct}% off</span>
                <button type="button" style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 700, cursor: 'pointer' }} onClick={() => setAppliedCoupon(null)}>×</button>
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <div className={styles.couponRow}>
                  <input
                    className={styles.couponInput}
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(event) => { setCouponCode(event.target.value); setCouponError('') }}
                    onKeyDown={(event) => event.key === 'Enter' && handleApplyCoupon()}
                    data-testid="coupon-input"
                  />
                  <button type="button" className={styles.secondaryBtn} onClick={handleApplyCoupon} data-testid="apply-coupon-btn">
                    Apply
                  </button>
                </div>
                {couponError && <p style={{ color: 'var(--error-color)', fontSize: 12, marginTop: 4 }}>{couponError}</p>}
                <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>Try: ARTISAN10 · CRAFT20 · HANDICRAFT5</p>
              </div>
            )}

            <button
              type="button"
              className={styles.primaryBtn}
              style={{ display: 'block', marginTop: 12, width: '100%', textAlign: 'center' }}
              onClick={handleCheckout}
              data-testid="proceed-checkout-btn"
            >
              Proceed to Checkout
            </button>
            {!isLoggedIn && (
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 6, textAlign: 'center' }}>Login required to checkout</p>
            )}
          </aside>
        </div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(identifier, provider = 'mobile') => {
          login(provider === 'google' ? '9999999999' : identifier)
          setIsLoginOpen(false)
          navigate('/checkout')
        }}
      />
    </div>
  )
}

export default Cart
