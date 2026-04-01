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
        {/* Left: Timeline */}
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

        {/* Right: Order info */}
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Products */}
          <section className={styles.card} style={{ padding: 14 }}>
            <h3 style={{ marginBottom: 10 }}>Items in order</h3>
            {order.items.map((item: OrderItem) => (
              <div key={item.product._id} className={styles.trackingItem}>
                <img src={item.product.image} alt={item.product.name} className={styles.trackingItemImg} loading="lazy" />
                <div>
                  <div>
                    <Link to={`/products/${item.product._id}`} className={styles.cartItemName}>{item.product.name}</Link>
                    <span style={{ marginLeft: 8, color: 'var(--text-light)', fontSize: 13 }}>× {item.quantity}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13 }}>{formatCurrency(item.product.price * item.quantity)}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-light)' }}>{item.product.category}</p>
                </div>
              </div>
            ))}
            <hr className={styles.divider} />
            <div className={styles.row} style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
              <span>Order total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </section>

          {/* Payment + Address */}
          <section className={styles.card} style={{ padding: 14, display: 'grid', gap: 10 }}>
            <h3>Delivery info</h3>
            <div className={styles.row}>
              <span style={{ color: 'var(--text-light)', fontSize: 13 }}>Payment</span>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{order.paymentMethod.toUpperCase()}</span>
            </div>
            <div className={styles.row}>
              <span style={{ color: 'var(--text-light)', fontSize: 13 }}>Status</span>
              <span className={order.paymentStatus === 'success' ? styles.stockOk : styles.stockLow}>
                {order.paymentStatus === 'success' ? '✓ Paid' : '✗ Failed'}
              </span>
            </div>
            {order.address && (
              <>
                <hr className={styles.divider} />
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-light)' }}>Delivering to</p>
                <div>
                  <strong style={{ color: 'var(--text-dark)' }}>{order.address.fullName}</strong>
                  <p style={{ margin: '2px 0', fontSize: 13 }}>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                  <p style={{ margin: '2px 0', fontSize: 13 }}>{order.address.city}, {order.address.state} – {order.address.pincode}</p>
                  <p style={{ margin: '2px 0', fontSize: 13 }}>{order.address.phone}</p>
                </div>
              </>
            )}
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
