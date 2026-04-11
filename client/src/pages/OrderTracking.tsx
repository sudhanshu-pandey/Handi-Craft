import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/commerce'
import api from '../services/api'
import styles from './commerce.module.css'

const statusSteps = ['ordered', 'packed', 'shipped', 'out_for_delivery', 'delivered'] as const

const stepMeta: Record<(typeof statusSteps)[number], { label: string; icon: string; desc: string }> = {
  ordered:          { label: 'Order placed',     icon: '📦', desc: 'We have received your order.' },
  packed:           { label: 'Packed',            icon: '🏷️', desc: 'Your order has been packed.' },
  shipped:          { label: 'Shipped',           icon: '🚚', desc: 'Your order is on the way.' },
  out_for_delivery: { label: 'Out for delivery',  icon: '🏃', desc: 'Arriving today — stay home!' },
  delivered:        { label: 'Delivered',         icon: '✅', desc: 'Package delivered.' },
}

interface OrderItem {
  product: {
    _id: string
    name: string
    price: number
    image: string
    category: string
  }
  quantity: number
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  subtotal: number
  discount: number
  couponDiscount: number
  deliveryFee: number
  couponCode?: string
  status: (typeof statusSteps)[number]
  paymentMethod: string
  paymentStatus: string
  estimatedDelivery: string
  address: {
    fullName: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    phone: string
  }
}

const OrderTracking = () => {
  const { orderId } = useParams()
  const { isLoggedIn } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!isLoggedIn || !orderId) {
        setError('Please login to view order details')
        setLoading(false)
        return
      }

      try {
        const response = await api.request(`/orders/${orderId}`)
        setOrder(response.order)
      } catch (err: any) {
        setError(err.message || 'Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.card} style={{ padding: 20 }}>
          <h2 style={{ color: 'var(--text-dark)' }}>Login required</h2>
          <p>Please login to view your order details.</p>
          <Link to="/" className={styles.primaryBtn} style={{ marginTop: 10, display: 'inline-block' }}>Go back home</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.card} style={{ padding: 20, textAlign: 'center' }}>
          <p>⏳ Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.card} style={{ padding: 20 }}>
          <h2 style={{ color: 'var(--text-dark)' }}>Order not found</h2>
          <p>{error || 'Check your order ID or browse more products.'}</p>
          <Link to="/products" className={styles.primaryBtn} style={{ marginTop: 10, display: 'inline-block' }}>Continue shopping</Link>
        </div>
      </div>
    )
  }

  // Calculate progress
  const activeIndex = statusSteps.findIndex((entry) => entry === order.status)
  const progressWidth = `${Math.max(8, ((activeIndex + 1) / statusSteps.length) * 100)}%`

  return (
    <div className={`container ${styles.page}`} data-testid="order-tracking-page">
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <span>›</span>
        <span>Order Tracking</span>
        <span>›</span>
        <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{order._id}</span>
      </nav>

      <h1 style={{ marginBottom: 16 }}>Order Tracking</h1>

      <div className={styles.checkoutGrid} style={{ gridTemplateColumns: '1.3fr 1fr', alignItems: 'flex-start' }}>
        {/* Left: Timeline + Delivery Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Timeline Section */}
          <section className={styles.card} style={{ padding: 20 }}>
            <div className={styles.row} style={{ marginBottom: 14 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-light)' }}>Order ID</p>
                <strong style={{ color: 'var(--text-dark)', letterSpacing: 0.5 }}>{order._id}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-light)' }}>Estimated delivery</p>
                <strong style={{ color: 'var(--primary)' }}>
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </strong>
              </div>
            </div>

            {/* Progress bar */}
            <div className={styles.progress} style={{ marginBottom: 20 }}>
              <div className={styles.progressFill} style={{ width: progressWidth }} />
            </div>

            {/* Timeline */}
            <div className={styles.timeline}>
              {statusSteps.map((step, index) => {
                const active = index <= activeIndex
                const meta = stepMeta[step]
                return (
                  <div key={step} className={`${styles.step} ${active ? styles.stepActive : ''}`.trim()}>
                    <span className={`${styles.stepIcon} ${active ? styles.stepIconActive : ''}`.trim()}>
                      {active ? meta.icon : ''}
                    </span>
                    <strong>{meta.label}</strong>
                    {active && <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 400, color: 'var(--text-light)' }}>{meta.desc}</p>}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Delivery Info Section */}
          <section className={styles.card} style={{ padding: 16 }}>
            <h3 style={{ 
              marginBottom: 14, 
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--text-dark)',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '12px'
            }}>
              Delivery Info
            </h3>
            
            {/* Payment Method */}
            <div className={styles.row} style={{ marginBottom: 12 }}>
              <span style={{ color: 'var(--text-light)', fontSize: 13 }}>Payment Method</span>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{order.paymentMethod.toUpperCase()}</span>
            </div>

            {/* Payment Status */}
            <div className={styles.row} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: 'var(--text-light)', fontSize: 13 }}>Payment Status</span>
              <span className={order.paymentStatus === 'success' ? styles.stockOk : styles.stockLow}>
                {order.paymentStatus === 'success' ? '✓ Paid' : '✗ Failed'}
              </span>
            </div>

            {/* Address Section */}
            {order.address && (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: 13, color: 'var(--text-light)', fontWeight: '600' }}>Delivering to</p>
                <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                  <strong style={{ color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>{order.address.fullName}</strong>
                  <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#333' }}>
                    {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}
                  </p>
                  <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#333' }}>
                    {order.address.city}, {order.address.state} – {order.address.pincode}
                  </p>
                  <p style={{ margin: '0', fontSize: 13, color: '#333', fontWeight: '500' }}>
                    📞 {order.address.phone}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right: Order info */}
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Products */}
          <section className={styles.card} style={{ padding: 16 }}>
            <h3 style={{ 
              marginBottom: 14, 
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--text-dark)',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '12px'
            }}>
              Items in order
            </h3>
            
            {/* Order Items */}
            <div style={{ marginBottom: '16px' }}>
              {order.items.map((item: OrderItem) => (
                <div 
                  key={item.product._id} 
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '10px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                    e.currentTarget.style.borderColor = '#d0d0d0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Product Image */}
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    loading="lazy"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                      flexShrink: 0
                    }} 
                  />
                  
                  {/* Item Details */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Link 
                        to={`/products/${item.product._id}`} 
                        style={{
                          color: 'var(--text-dark)',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'block',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dark)'}
                      >
                        {item.product.name}
                      </Link>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '12px', 
                        color: '#999',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#666' }}>Qty: <strong>{item.quantity}</strong></span>
                        <span>{formatCurrency(item.product.price)}/unit</span>
                      </p>
                    </div>
                    
                    {/* Item Total */}
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#2ecc71'
                      }}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                      <p style={{
                        margin: '2px 0 0 0',
                        fontSize: '11px',
                        color: '#999'
                      }}>
                        {item.product.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ 
              height: '1px', 
              backgroundColor: '#e0e0e0', 
              margin: '14px 0' 
            }} />

            {/* Price Breakdown */}
            <div style={{ marginTop: '14px' }}>
              <h4 style={{ 
                color: '#666', 
                fontSize: '13px', 
                fontWeight: '600', 
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Price Breakdown
              </h4>

              {/* Subtotal */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Subtotal</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '13px' }}>
                  {formatCurrency(order.subtotal || order.total + (order.discount || 0) + (order.couponDiscount || 0))}
                </span>
              </div>

              {/* Discount (Product Discount) */}
              {order.discount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span style={{ color: '#666', fontSize: '13px' }}>Product Discount</span>
                  <span style={{ color: '#10b981', fontWeight: '600', fontSize: '13px' }}>
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}

              {/* Coupon Discount */}
              {order.couponDiscount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span style={{ color: '#666', fontSize: '13px' }}>
                    Coupon {order.couponCode && <span style={{ color: '#10b981', fontWeight: '600' }}>({order.couponCode})</span>}
                  </span>
                  <span style={{ color: '#10b981', fontWeight: '600', fontSize: '13px' }}>
                    -{formatCurrency(order.couponDiscount)}
                  </span>
                </div>
              )}

              {/* Delivery Fee */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Delivery Fee</span>
                {order.deliveryFee > 0 ? (
                  <span style={{ color: '#333', fontWeight: '500', fontSize: '13px' }}>
                    {formatCurrency(order.deliveryFee)}
                  </span>
                ) : (
                  <span style={{ color: '#10b981', fontWeight: '600', fontSize: '13px' }}>Free</span>
                )}
              </div>

              {/* Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '6px',
                marginTop: '10px'
              }}>
                <span style={{ color: '#333', fontWeight: 'bold', fontSize: '15px' }}>Order Total</span>
                <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '16px' }}>
                  {formatCurrency(order.total)}
                </span>
              </div>

              {/* Savings Badge */}
              {(order.discount > 0 || order.couponDiscount > 0) && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 10px',
                  backgroundColor: '#d4f4dd',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '12px', 
                    color: '#10b981', 
                    fontWeight: '600' 
                  }}>
                    🎉 You saved {formatCurrency((order.discount || 0) + (order.couponDiscount || 0))}!
                  </p>
                </div>
              )}
            </div>
          </section>

          <Link to="/products" className={styles.secondaryBtn} style={{ textAlign: 'center', display: 'block' }}>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
