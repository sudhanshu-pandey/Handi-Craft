import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { addItem as addItemToCart, updateQuantity, removeItem, type CartItem } from '../store/slices/cartSlice'
import { applyCoupon, removeCoupon } from '../store/slices/couponSlice'
import { addItem as addToWishlist, removeItem as removeFromWishlist } from '../store/slices/wishlistSlice'
import useProducts from '../hooks/useProducts'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../components/LoginModal/LoginModal'
import { formatCurrency, sumCartValue, sumOriginalCartValue } from '../utils/commerce'
import { verifyCoupon } from '../api/coupon.api'
import styles from './commerce.module.css'

const Cart = () => {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const wishlistItems = useAppSelector((state) => state.wishlist.items)
  const reduxCoupon = useAppSelector((state) => state.coupon)
  const { allProducts, loadProducts } = useProducts()
  const { isLoggedIn, login } = useAuth()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // Load products on mount to populate cart
  useEffect(() => {
    // Always load products with a higher limit to ensure we get all products
    loadProducts(1, 1000)  // Load up to 1000 products
  }, [])  // Only run on mount

  // Map cart items with product details from Redux
  const cartItems = useMemo(
    () => {
      const mapped = items.map((item: CartItem, index: number) => {
        const itemIdStr = String(item.productId)
        
        // Try to find product by converting everything to string
        let product = allProducts.find((p: any) => {
          const pid = p.id !== undefined ? String(p.id) : null
          const p_id = p._id !== undefined ? String(p._id) : null
          
          return pid === itemIdStr || p_id === itemIdStr
        })
        
        // If no product found, use stored product details or fallback
        if (!product) {
          if (item.productName || item.productPrice !== undefined) {
            // Use stored product details
            product = {
              id: item.productId,
              _id: item.productId,
              name: item.productName || `Product ${item.productId}`,
              price: item.productPrice ?? 0,
              image: item.productImage || '/images/products/placeholder.svg'
            }
          } else if (allProducts.length > 0 && index < allProducts.length) {
            // Fallback: use product at same index
            product = allProducts[index]
          }
        }
        
        return product ? { product, quantity: item.quantity, productId: item.productId } : null
      })
      
      const filtered = mapped.filter((item: any): item is { product: any; quantity: number; productId: number | string } => item !== null)
      return filtered
    },
    [items, allProducts]
  )

  // Get wishlist products
  // Get wishlist products
  const wishlistProducts = useMemo(
    () => {
      return wishlistItems
        .map((item: any) => {
          const itemIdStr = String(item.productId)
          
          let product = allProducts.find((p: any) => {
            const pid = p.id !== undefined ? String(p.id) : null
            const p_id = p._id !== undefined ? String(p._id) : null
            
            return pid === itemIdStr || p_id === itemIdStr
          })
          
          if (!product) {
            if (item.productName || item.productPrice !== undefined) {
              product = {
                id: item.productId,
                _id: item.productId,
                name: item.productName || `Product ${item.productId}`,
                price: item.productPrice ?? 0,
                image: item.productImage || '/images/products/placeholder.svg'
              }
            }
          }
          
          return product ? { product, productId: item.productId } : null
        })
        .filter((item: any): item is any => item !== null)
    },
    [wishlistItems, allProducts]
  )

  const subtotal = sumCartValue(cartItems)
  const originalSubtotal = sumOriginalCartValue(cartItems)
  const discount = Math.max(0, originalSubtotal - subtotal)
  const couponDiscount = reduxCoupon.code ? reduxCoupon.discountAmount : 0
  const deliveryFee = subtotal > 2499 || subtotal === 0 ? 0 : 49
  const total = subtotal - couponDiscount + deliveryFee

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError('Enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      // Verify coupon from backend
      const response = await verifyCoupon(code, subtotal)

      if (!response.success) {
        setCouponError(response.message)
        dispatch(removeCoupon())
        return
      }

      // Apply coupon with discount details from backend
      dispatch(applyCoupon({
        code: response.data?.code || code,
        discountPct: response.data?.discountValue || 0,
        discountAmount: response.data?.discountAmount || 0,
      }))
      setCouponCode('')
    } catch (error) {
      setCouponError('Failed to apply coupon. Please try again.')
      dispatch(removeCoupon())
    } finally {
      setCouponLoading(false)
    }
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

      {cartItems.length === 0 && wishlistProducts.length === 0 ? (
        <div className={styles.card} style={{ padding: 24, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-dark)', marginBottom: 12 }}>Your cart is empty</h2>
          <p style={{ marginBottom: 24 }}>Add artisan products to continue checkout.</p>
          <Link to="/products" className={styles.primaryBtn} style={{ display: 'inline-block' }}>Continue shopping</Link>
        </div>
      ) : (
        <div className={styles.checkoutGrid}>
          <section className={styles.card} style={{ padding: 14 }}>
            {cartItems.map(({ product, quantity, productId }: { product: any; quantity: number; productId: number | string }) => (
              <article key={productId} className={styles.softCard} style={{ padding: 12, marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'min(90px, 20%) 1fr auto', gap: 12, alignItems: 'center' }}>
                  <img src={product.image} alt={product.name} loading="lazy" style={{ width: '100%', maxWidth: 90, height: 'auto', aspectRatio: '1', borderRadius: 10, objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ color: 'var(--text-dark)', marginBottom: 4 }}>{product.name}</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      {product.originalPrice && product.originalPrice !== product.price ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                            {formatCurrency(product.originalPrice)}
                          </span>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                            {formatCurrency(product.price)}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                    
                    {/* Quantity controls */}
                    <div style={{ marginBottom: 10 }}>
                      <div className={styles.qtyWrap}>
                        <button 
                          type="button" 
                          className={styles.qtyBtn} 
                          onClick={() => {
                            const newQty = quantity - 1;
                            if (newQty <= 0) {
                              dispatch(removeItem(productId));
                            } else {
                              dispatch(updateQuantity({ productId, quantity: newQty }));
                            }
                          }}
                        >
                          -
                        </button>
                        <span className={styles.qtyVal} data-testid={`cart-qty-${productId}`}>{quantity}</span>
                        <button type="button" className={styles.qtyBtn} onClick={() => dispatch(updateQuantity({ productId, quantity: quantity + 1 }))}>+</button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons on the right for desktop */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 'fit-content' }}>
                    <button type="button" className={styles.ghostBtn} onClick={() => {
                      dispatch(addToWishlist(productId));
                      dispatch(removeItem(productId));
                    }} style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '8px 10px' }}>❤️ Add to wishlist</button>
                    <button type="button" className={styles.ghostBtn} onClick={() => dispatch(removeItem(productId))} style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '8px 10px' }}>Remove</button>
                  </div>
                </div>
              </article>
            ))}
            {wishlistProducts.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <h3>❤️ Wishlist ({wishlistProducts.length})</h3>
                {wishlistProducts.map(({ product, productId }: { product: any; productId: number | string }) => (
                  <article key={productId} className={styles.softCard} style={{ padding: 12, marginTop: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'min(90px, 20%) 1fr auto', gap: 12, alignItems: 'center' }}>
                      <img src={product.image} alt={product.name} loading="lazy" style={{ width: '100%', maxWidth: 90, height: 'auto', aspectRatio: '1', borderRadius: 10, objectFit: 'cover' }} />
                      <div>
                        <strong style={{ color: 'var(--text-dark)', display: 'block', marginBottom: 4 }}>{product.name}</strong>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {product.originalPrice && product.originalPrice !== product.price ? (
                            <>
                              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                                {formatCurrency(product.originalPrice)}
                              </span>
                              <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                                {formatCurrency(product.price)}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 'fit-content' }}>
                        <button type="button" className={styles.secondaryBtn} onClick={() => {
                          dispatch(addItemToCart({ 
                            productId, 
                            quantity: 1,
                            productName: product.name,
                            productPrice: product.price,
                            productImage: product.image
                          }));
                          dispatch(removeFromWishlist(productId));
                        }} style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '8px 10px' }}>
                          Add to cart
                        </button>
                        <button type="button" className={styles.ghostBtn} onClick={() => {
                          dispatch(removeFromWishlist(productId));
                        }} style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '8px 10px' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className={styles.card} style={{ padding: 14, height: 'fit-content' }}>
            <h3 style={{ marginBottom: 10 }}>Price summary</h3>
            <div className={styles.row}><span>Subtotal</span><span>{formatCurrency(originalSubtotal)}</span></div>
            {discount > 0 && (
              <div className={styles.row}><span>Discount</span><span style={{ color: 'var(--success-color)' }}>-{formatCurrency(discount)}</span></div>
            )}
            {couponDiscount > 0 && (
              <div className={styles.row}><span>Coupon ({reduxCoupon?.code})</span><span style={{ color: 'var(--success-color)' }}>-{formatCurrency(couponDiscount)}</span></div>
            )}
            <div className={styles.row}><span>Delivery fee</span><span>{deliveryFee === 0 ? <span className={styles.stockOk}>Free</span> : formatCurrency(deliveryFee)}</span></div>
            <hr className={styles.divider} />
            <div className={styles.row} style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '1.05rem' }}>
              <span>Total</span>
              <span data-testid="cart-total">{formatCurrency(total)}</span>
            </div>

            {/* Coupon */}
            {reduxCoupon.code ? (
              <div className={styles.couponApplied}>
                <span>🎉 {reduxCoupon.code} applied – {reduxCoupon.discountPct}% off</span>
                <button type="button" style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 700, cursor: 'pointer' }} onClick={() => dispatch(removeCoupon())}>×</button>
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <div className={styles.couponRow}>
                  <input
                    className={styles.couponInput}
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(event) => { setCouponCode(event.target.value); setCouponError('') }}
                    onKeyDown={(event) => event.key === 'Enter' && !couponLoading && handleApplyCoupon()}
                    disabled={couponLoading}
                    data-testid="coupon-input"
                  />
                  <button 
                    type="button" 
                    className={styles.secondaryBtn} 
                    onClick={handleApplyCoupon} 
                    disabled={couponLoading}
                    data-testid="apply-coupon-btn"
                  >
                    {couponLoading ? 'Verifying...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p style={{ color: 'var(--error-color)', fontSize: 12, marginTop: 4 }}>{couponError}</p>}
                <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>Coupons are fetched from our backend</p>
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
