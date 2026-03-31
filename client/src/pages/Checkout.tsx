import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { products } from '../data/products'
import { Address, useCommerce } from '../context/CommerceContext'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../components/LoginModal/LoginModal'
import AddressForm from '../components/AddressForm/AddressForm'
import { formatCurrency, sumCartValue, sumOriginalCartValue } from '../utils/commerce'
import styles from './commerce.module.css'

type Step = 1 | 2 | 3

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'razorpay' | 'stripe'

const Checkout = () => {
  const navigate = useNavigate()
  const { isLoggedIn, login } = useAuth()
  const { addresses, upsertAddress, removeAddress, clearCart, createOrder, trackEvent } = useCommerce()
  
  // Use Redux cart instead of CommerceContext cart
  const reduxCart = useAppSelector((state) => state.cart.items)

  const [step, setStep] = useState<Step>(1)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [netBankingBank, setNetBankingBank] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle')
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const activeItems = useMemo(
    () =>
      reduxCart
        .filter((entry: any) => !entry.savedForLater)
        .map((entry: any) => {
          const product = products.find((item) => item.id === entry.productId)
          return product ? { product, quantity: entry.quantity } : null
        })
        .filter((entry: any): entry is { product: (typeof products)[number]; quantity: number } => entry !== null),
    [reduxCart],
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
    const defaultAddress = addresses.find((entry) => entry.isDefault) ?? addresses[0]
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id)
    }
    if (addresses.length === 0) {
      setShowAddForm(true)
    }
  }, [addresses, selectedAddressId])

  const handleAddressSubmit = (address: Address) => {
    upsertAddress(address)
    setSelectedAddressId(address.id)
    setEditingAddress(null)
    setShowAddForm(false)
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

  const handlePlaceOrder = () => {
    if (!validatePayment() || !selectedAddressId || activeItems.length === 0) {
      setPaymentStatus('failed')
      return
    }

    const estimated = new Date()
    estimated.setDate(estimated.getDate() + 5)

    const newOrder = createOrder({
      productIds: activeItems.map((entry: any) => entry.product.id),
      total: finalTotal,
      paymentMethod,
      paymentStatus: 'success',
      estimatedDelivery: estimated.toISOString(),
      status: 'shipped',
      addressId: selectedAddressId,
    })

    setPaymentStatus('success')
    clearCart()
    window.setTimeout(() => navigate(`/order-tracking/${newOrder.id}`), 900)
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

            {addresses.map((address) => (
              <article className={styles.softCard} style={{ padding: 12, marginBottom: 10 }} key={address.id}>
                <div className={styles.row}>
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', flex: 1 }}>
                    <input
                      type="radio"
                      name="selected-address"
                      style={{ marginTop: 4 }}
                      checked={selectedAddressId === address.id}
                      onChange={() => {
                        setSelectedAddressId(address.id)
                        setShowAddForm(false)
                        setEditingAddress(null)
                      }}
                    />
                    <div>
                      <strong style={{ color: 'var(--text-dark)' }}>{address.fullName}</strong>
                      {address.isDefault && (
                        <span style={{ marginLeft: 6, fontSize: 11, padding: '2px 6px', borderRadius: 999, background: 'color-mix(in srgb, var(--primary) 14%, var(--bg-white))', color: 'var(--primary)', fontWeight: 700 }}>Default</span>
                      )}
                      <p style={{ margin: '2px 0' }}>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                      <p style={{ margin: '2px 0' }}>{address.city}, {address.state} – {address.pincode}</p>
                      <p style={{ margin: '2px 0' }}>{address.phone}</p>
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
                    <button type="button" className={styles.ghostBtn} onClick={() => removeAddress(address.id)}>Delete</button>
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
            {!selectedAddressId && addresses.length > 0 && (
              <p style={{ color: 'var(--error-color)', fontSize: 13, marginTop: 8, fontWeight: 600 }}>Please select a delivery address.</p>
            )}
            {!selectedAddressId && addresses.length === 0 && (
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
              <article key={product.id} className={styles.softCard} style={{ padding: 10, marginBottom: 8 }}>
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
