import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearCart as clearReduxCart } from '../store/slices/cartSlice'
import { addNewAddress, updateAddressAsync, deleteAddressAsync, fetchAddresses } from '../store/slices/addressSlice'
import { useCommerce } from '../context/CommerceContext'
import { useAuth } from '../context/AuthContext'
import useProducts from '../hooks/useProducts'
import LoginModal from '../components/LoginModal/LoginModal'
import AddressForm from '../components/AddressForm/AddressForm'
import { formatCurrency, sumCartValue, sumOriginalCartValue } from '../utils/commerce'
import api from '../services/api'
import styles from './commerce.module.css'

type Step = 1 | 2 | 3

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'razorpay' | 'stripe'

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoggedIn, login } = useAuth()
  const { clearCart, trackEvent } = useCommerce()
  
  // Use Redux cart and addresses
  const reduxCart = useAppSelector((state) => state.cart.items)
  const { addresses: reduxAddresses, loading: addressesLoading } = useAppSelector((state: any) => state.address)
  const { allProducts, loadProducts } = useProducts()

  const [step, setStep] = useState<Step>(1)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [netBankingBank, setNetBankingBank] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle')
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // Load products on mount
  useEffect(() => {
    if (allProducts.length === 0) {
      loadProducts(1, 1000)
    }
  }, [allProducts.length, loadProducts])

  // Load addresses on mount
  useEffect(() => {
    if (isLoggedIn && reduxAddresses.length === 0) {
      dispatch(fetchAddresses() as any)
    }
  }, [isLoggedIn, reduxAddresses.length, dispatch])

  const activeItems = useMemo(
    () => {
      return reduxCart
        .filter((entry: any) => !entry.savedForLater)
        .map((entry: any) => {
          const itemIdStr = String(entry.productId)
          const product = allProducts.find((p: any) => {
            const pid = p.id !== undefined ? String(p.id) : null
            const p_id = p._id !== undefined ? String(p._id) : null
            return pid === itemIdStr || p_id === itemIdStr
          })
          return product ? { product, quantity: entry.quantity } : null
        })
        .filter((entry: any): entry is { product: any; quantity: number } => entry !== null)
    },
    [reduxCart, allProducts],
  )

  const subtotal = sumCartValue(activeItems)
  const originalTotal = sumOriginalCartValue(activeItems)
  const discount = Math.max(0, originalTotal - subtotal)
  const deliveryFee = subtotal > 2499 || subtotal === 0 ? 0 : 49
  const finalTotal = subtotal + deliveryFee

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoginOpen(true)
    }
  }, [isLoggedIn])

  useEffect(() => {
    trackEvent('checkout_started', { itemCount: activeItems.length, subtotal: finalTotal })
  }, [activeItems.length, finalTotal, trackEvent])

  useEffect(() => {
    const defaultAddress = reduxAddresses.find((entry: any) => entry.isDefault) ?? reduxAddresses[0]
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress._id || defaultAddress.id)
      setShowAddForm(false)
    }
    // Only show form if addresses are loaded and empty
    if (reduxAddresses.length === 0 && !addressesLoading) {
      setShowAddForm(true)
    }
  }, [reduxAddresses, selectedAddressId, addressesLoading])

  const handleAddressSubmit = async (address: any) => {
    try {
      if (editingAddress?._id) {
        // Update existing address
        await dispatch(updateAddressAsync({ addressId: editingAddress._id, data: address }) as any)
      } else {
        // Add new address
        await dispatch(addNewAddress(address) as any)
      }
      setSelectedAddressId(address._id || address.id)
      setEditingAddress(null)
      setShowAddForm(false)
    } catch (error: any) {
      // Error handled by Redux state
    }
  }

  const proceedToPayment = () => {
    if (!selectedAddressId) {
      return
    }
    setStep(3)
  }

  const validatePayment = () => {
    if (paymentMethod === 'upi') {
      return upiId.includes('@')
    }
    if (paymentMethod === 'card') {
      return cardNumber.length >= 12 && cardExpiry.length >= 4 && cardCvv.length >= 3
    }
    if (paymentMethod === 'netbanking') {
      return netBankingBank.trim().length > 2
    }
    return true
  }

  const handlePlaceOrder = async () => {
    if (!validatePayment() || !selectedAddressId || activeItems.length === 0) {
      setPaymentStatus('failed')
      return
    }

    const estimated = new Date()
    estimated.setDate(estimated.getDate() + 5)

    // Prepare order items with product IDs and quantities
    const orderItems = activeItems.map((entry: any) => ({
      productId: entry.product.id || entry.product._id,
      quantity: entry.quantity,
    }))

    // Get address details
    const selectedAddress = reduxAddresses.find((a: any) => a._id === selectedAddressId || a.id === selectedAddressId)

    try {
      // Create order in database via API
      const orderResponse = await api.request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: orderItems,
          total: finalTotal,
          subtotal: subtotal,
          discount: discount,
          deliveryFee: deliveryFee,
          paymentMethod,
          paymentStatus: 'success',
          estimatedDelivery: estimated.toISOString(),
          address: selectedAddress,
          couponCode: null,
        }),
      })
      
      const newOrder = orderResponse.order

      // Update stock in database
      try {
        await api.request('/products/update-stock', {
          method: 'POST',
          body: JSON.stringify({ items: orderItems }),
        })
      } catch (error) {
        // Stock update failed, but order was created
      }

      setPaymentStatus('success')
      
      // Clear Redux cart
      dispatch(clearReduxCart())
      
      // Clear CommerceContext cart
      clearCart()
      
      window.setTimeout(() => navigate(`/order-tracking/${newOrder._id}`), 900)
    } catch (error) {
      setPaymentStatus('failed')
    }
  }

  if (activeItems.length === 0 && paymentStatus !== 'success') {
    return (
      <div className={`container ${styles.page}`} data-testid="checkout-page">
        <div className={styles.card} style={{ padding: 16 }}>
          <h2 style={{ color: 'var(--text-dark)' }}>No items available for checkout</h2>
          <Link to="/cart" className={styles.primaryBtn}>Go to cart</Link>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className={`container ${styles.page}`} data-testid="checkout-page">
        <div className={styles.card} style={{ padding: 16 }}>
          <h2 style={{ color: 'var(--text-dark)' }}>Login required</h2>
          <p>Please login to continue checkout.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className={styles.primaryBtn} onClick={() => setIsLoginOpen(true)} data-testid="checkout-login-btn">
              Login to continue
            </button>
            <Link to="/cart" className={styles.ghostBtn}>Back to cart</Link>
          </div>
        </div>
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(identifier, provider = 'mobile') => {
            login(provider === 'google' ? '9999999999' : identifier)
            setIsLoginOpen(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`} data-testid="checkout-page">
      <h1 style={{ marginBottom: 16 }}>Checkout</h1>

      <div className={styles.tabs}>
        <span className={`${styles.tab} ${step === 1 ? styles.tabActive : ''}`.trim()}>1. Address</span>
        <span className={`${styles.tab} ${step === 2 ? styles.tabActive : ''}`.trim()}>2. Summary</span>
        <span className={`${styles.tab} ${step === 3 ? styles.tabActive : ''}`.trim()}>3. Payment</span>
      </div>

      {step === 1 && (
        <div className={styles.checkoutGrid} style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          <section className={styles.card} style={{ padding: 14 }}>
            <h3 style={{ marginBottom: 10 }}>Delivery address</h3>

            {reduxAddresses.map((address: any) => (
              <article className={styles.softCard} style={{ padding: 12, marginBottom: 10 }} key={address._id || address.id}>
                <div className={styles.row}>
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', flex: 1 }}>
                    <input
                      type="radio"
                      name="selected-address"
                      style={{ marginTop: 4 }}
                      checked={selectedAddressId === (address._id || address.id)}
                      onChange={() => {
                        setSelectedAddressId(address._id || address.id)
                        setShowAddForm(false)
                        setEditingAddress(null)
                      }}
                    />
                    <div>
                      <strong style={{ color: 'var(--text-dark)' }}>{address.label}</strong>
                      {address.isDefault && (
                        <span style={{ marginLeft: 6, fontSize: 11, padding: '2px 6px', borderRadius: 999, background: 'color-mix(in srgb, var(--primary) 14%, var(--bg-white))', color: 'var(--primary)', fontWeight: 700 }}>Default</span>
                      )}
                      {address.name && <p style={{ margin: '2px 0', fontWeight: 600 }}>{address.name}</p>}
                      {address.phone && <p style={{ margin: '2px 0', fontSize: '12px', color: 'var(--text-light)' }}>📞 {address.phone}</p>}
                      <p style={{ margin: '2px 0' }}>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                      <p style={{ margin: '2px 0' }}>{address.city}, {address.state} – {address.pincode}</p>
                      {address.landmark && <p style={{ margin: '2px 0', fontSize: '12px', color: 'var(--text-light)' }}>Landmark: {address.landmark}</p>}
                    </div>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => { setEditingAddress(address); setShowAddForm(true); setSelectedAddressId('') }}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      className={styles.ghostBtn} 
                      onClick={() => dispatch(deleteAddressAsync(address._id || address.id) as any)}
                      disabled={addressesLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {!showAddForm && (
              <button
                type="button"
                style={{ marginTop: 6, marginBottom: 12, background: 'none', border: '1.5px dashed var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                onClick={() => { setShowAddForm(true); setEditingAddress(null) }}
                data-testid="add-new-address-btn"
              >
                + Add new address
              </button>
            )}

            {showAddForm && (
              <div style={{ marginTop: 10 }}>
                <h3 style={{ marginBottom: 12 }}>{editingAddress ? 'Edit address' : 'Add new address'}</h3>
                <AddressForm
                  initialAddress={editingAddress ?? {}}
                  submitLabel={editingAddress ? 'Update address' : 'Save address'}
                  onSubmit={handleAddressSubmit}
                  onCancel={() => { setShowAddForm(false); setEditingAddress(null) }}
                />
              </div>
            )}
          </section>

          <aside className={styles.card} style={{ padding: 14 }}>
            <h3 style={{ marginBottom: 8 }}>Order quick summary</h3>
            <div className={styles.row}><span>Items</span><span>{activeItems.length}</span></div>
            <div className={styles.row}><span>Total</span><span>{formatCurrency(finalTotal)}</span></div>
            {!selectedAddressId && reduxAddresses.length > 0 && (
              <p style={{ color: 'var(--error-color)', fontSize: 13, marginTop: 8, fontWeight: 600 }}>Please select a delivery address.</p>
            )}
            {!selectedAddressId && reduxAddresses.length === 0 && (
              <p style={{ color: 'var(--text-light)', fontSize: 13, marginTop: 8 }}>Add an address to continue.</p>
            )}
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ marginTop: 10, width: '100%', opacity: !selectedAddressId || showAddForm ? 0.5 : 1 }}
              disabled={!selectedAddressId || showAddForm}
              onClick={() => setStep(2)}
              data-testid="proceed-summary-btn"
            >
              Continue to summary
            </button>
          </aside>
        </div>
      )}

      {step === 2 && (
        <div className={styles.checkoutGrid} style={{ gridTemplateColumns: '1.3fr 1fr' }}>
          <section className={styles.card} style={{ padding: 14 }}>
            <h3 style={{ marginBottom: 10 }}>Order summary</h3>
            {activeItems.map(({ product, quantity }: any) => (
              <article key={product.id || product._id} className={styles.softCard} style={{ padding: 10, marginBottom: 8 }}>
                <div className={styles.row}>
                  <span style={{ color: 'var(--text-dark)' }}>{product.name} × {quantity}</span>
                  <span>{formatCurrency(product.price * quantity)}</span>
                </div>
              </article>
            ))}
          </section>

          <aside className={styles.card} style={{ padding: 14 }}>
            <div className={styles.row}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className={styles.row}><span>Discount</span><span>-{formatCurrency(discount)}</span></div>
            <div className={styles.row}><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span></div>
            <hr style={{ margin: '12px 0', borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)' }} />
            <div className={styles.row} style={{ color: 'var(--text-dark)', fontWeight: 800 }}>
              <span>Grand total</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" className={styles.ghostBtn} onClick={() => setStep(1)}>Back</button>
              <button type="button" className={styles.primaryBtn} onClick={proceedToPayment} data-testid="proceed-payment-btn">Proceed to payment</button>
            </div>
          </aside>
        </div>
      )}

      {step === 3 && (
        <div className={styles.checkoutGrid} style={{ gridTemplateColumns: '1.3fr 1fr' }}>
          <section className={styles.card} style={{ padding: 14 }}>
            <h3 style={{ marginBottom: 10 }}>Payment</h3>
            <div className={styles.tabs}>
              {(['upi', 'card', 'netbanking', 'cod', 'razorpay', 'stripe'] as PaymentMethod[]).map((entry) => (
                <button
                  key={entry}
                  type="button"
                  className={`${styles.tab} ${paymentMethod === entry ? styles.tabActive : ''}`.trim()}
                  onClick={() => setPaymentMethod(entry)}
                  data-testid={`payment-method-${entry}`}
                >
                  {entry.toUpperCase()}
                </button>
              ))}
            </div>

            {paymentMethod === 'upi' && (
              <input className={styles.input} placeholder="UPI ID (name@bank)" value={upiId} onChange={(event) => setUpiId(event.target.value)} />
            )}

            {paymentMethod === 'card' && (
              <div className={styles.checkoutGrid} style={{ gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
                <input className={styles.input} placeholder="Card Number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} />
                <input className={styles.input} placeholder="MM/YY" value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} />
                <input className={styles.input} placeholder="CVV" value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} />
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <input className={styles.input} placeholder="Bank name" value={netBankingBank} onChange={(event) => setNetBankingBank(event.target.value)} />
            )}

            {(paymentMethod === 'razorpay' || paymentMethod === 'stripe') && (
              <div className={styles.softCard} style={{ padding: 12, marginTop: 8 }}>
                <p>{paymentMethod === 'razorpay' ? 'Razorpay Checkout UI ready for API key/order integration.' : 'Stripe PaymentIntent UI ready for clientSecret integration.'}</p>
              </div>
            )}

            {paymentStatus === 'failed' && <p className={styles.stockLow}>Payment failed. Verify details and retry.</p>}
            {paymentStatus === 'success' && <p className={styles.stockOk}>Payment successful! Redirecting to tracking...</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" className={styles.ghostBtn} onClick={() => setStep(2)}>Back</button>
              <button type="button" className={styles.primaryBtn} onClick={handlePlaceOrder} data-testid="place-order-btn">Pay {formatCurrency(finalTotal)}</button>
            </div>
          </section>

          <aside className={styles.card} style={{ padding: 14 }}>
            <h3>Secure checkout</h3>
            <p>🔐 256-bit encrypted payment flow</p>
            <p>✅ Authentic handcrafted products</p>
            <p>↩️ Easy return protection</p>
          </aside>
        </div>
      )}
    </div>
  )
}

export default Checkout
