import { useEffect, useRef, useState } from 'react'
import { useAuth, Address } from '../../context/AuthContext'
import styles from './ProfileModal.module.css'

type Tab = 'profile' | 'addresses' | 'orders' | 'wishlist'

type ProfileModalProps = {
  isOpen: boolean
  onClose: () => void
}

const MOCK_ORDERS = [
  { id: 'MLS20245821', date: 'Mar 18, 2026', status: 'Delivered', amount: '₹5,999', items: 'Brass Krishna Idol', statusColor: 'delivered' },
  { id: 'MLS20245630', date: 'Mar 04, 2026', status: 'Shipped', amount: '₹1,499', items: 'Brass Buddha Door Knocker', statusColor: 'shipped' },
  { id: 'MLS20245104', date: 'Feb 14, 2026', status: 'Processing', amount: '₹3,499', items: 'Brass Elephant Figurine', statusColor: 'processing' },
]

const MOCK_WISHLIST = [
  { id: 'w1', name: 'Marble Taj Mahal Replica', price: '₹8,499', category: 'Marble Handicrafts' },
  { id: 'w2', name: 'Dhokra Tribal Figurine', price: '₹2,299', category: 'Dhokra' },
  { id: 'w3', name: 'Hand-Woven Silk Textile', price: '₹4,199', category: 'Textiles' },
]

const AVATAR_INITIALS = (name: string) => {
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase()
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { userProfile, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !userProfile) return null

  const handleLogout = () => {
    logout()
    onClose()
    window.location.href = '/'
  }

  const initials = AVATAR_INITIALS(userProfile.name)

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <aside
        ref={modalRef}
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
        aria-label="User profile"
      >
        {/* --- Header --- */}
        <div className={styles.drawerHeader}>
          <div className={styles.avatarRing}>
            <div className={styles.avatar}>{initials}</div>
            <span className={styles.onlineDot} aria-hidden="true" />
          </div>
          <div className={styles.userMeta}>
            <h2 className={styles.userName}>{userProfile.name}</h2>
            <p className={styles.userMobile}>+91 {userProfile.mobile}</p>
            <p className={styles.userEmail}>{userProfile.email}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close profile">
            ✕
          </button>
        </div>

        {/* --- Tabs --- */}
        <nav className={styles.tabs} aria-label="Profile sections">
          {(['profile', 'addresses', 'orders', 'wishlist'] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className={styles.tabIcon}>{TAB_ICONS[tab]}</span>
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

        {/* --- Content --- */}
        <div className={styles.content}>
          {activeTab === 'profile' && <ProfileTab profile={userProfile} />}
          {activeTab === 'addresses' && <AddressesTab addresses={userProfile.addresses} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'wishlist' && <WishlistTab />}
        </div>

        {/* --- Footer Logout --- */}
        <div className={styles.drawerFooter}>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <span>⎋</span> Sign Out
          </button>
        </div>
      </aside>
    </div>
  )
}

/* ─── Sub-tabs ──────────────────────────────────────────── */

const TAB_ICONS: Record<Tab, string> = {
  profile: '👤',
  addresses: '📍',
  orders: '📦',
  wishlist: '❤️',
}

const TAB_LABELS: Record<Tab, string> = {
  profile: 'Profile',
  addresses: 'Addresses',
  orders: 'Orders',
  wishlist: 'Wishlist',
}

const ProfileTab = ({ profile }: { profile: NonNullable<ReturnType<typeof useAuth>['userProfile']> }) => (
  <div className={styles.section}>
    <h3 className={styles.sectionTitle}>Personal Details</h3>
    <div className={styles.fieldGrid}>
      <FieldRow label="Full Name" value={profile.name} icon="👤" />
      <FieldRow label="Mobile" value={`+91 ${profile.mobile}`} icon="📱" />
      <FieldRow label="Email" value={profile.email} icon="✉️" />
      <FieldRow label="Gender" value={profile.gender} icon="⚧" />
      <FieldRow label="Date of Birth" value={formatDob(profile.dob)} icon="🎂" />
    </div>

    <div className={styles.statsRow}>
      <div className={styles.statCard}>
        <span className={styles.statNum}>3</span>
        <span className={styles.statLabel}>Orders</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statNum}>3</span>
        <span className={styles.statLabel}>Wishlist</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statNum}>₹10,947</span>
        <span className={styles.statLabel}>Total Spent</span>
      </div>
    </div>

    <div className={styles.memberBadge}>
      <span>🏅</span>
      <div>
        <strong>Silver Member</strong>
        <p>Spend ₹4,053 more to reach Gold</p>
      </div>
    </div>
  </div>
)

const AddressesTab = ({ addresses }: { addresses: Address[] }) => (
  <div className={styles.section}>
    <h3 className={styles.sectionTitle}>Saved Addresses</h3>
    <div className={styles.addressList}>
      {addresses.map((addr) => (
        <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.addressDefault : ''}`}>
          <div className={styles.addressTop}>
            <span className={styles.addressLabel}>{addr.label}</span>
            {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
          </div>
          <p className={styles.addressText}>
            {addr.line1}, {addr.line2}
          </p>
          <p className={styles.addressText}>
            {addr.city}, {addr.state} – {addr.pincode}
          </p>
          <div className={styles.addressActions}>
            <button type="button" className={styles.addrBtn}>Edit</button>
            {!addr.isDefault && <button type="button" className={styles.addrBtn}>Set Default</button>}
            {!addr.isDefault && <button type="button" className={`${styles.addrBtn} ${styles.addrBtnDanger}`}>Remove</button>}
          </div>
        </div>
      ))}
    </div>
    <button type="button" className={styles.addAddressBtn}>+ Add New Address</button>
  </div>
)

const OrdersTab = () => (
  <div className={styles.section}>
    <h3 className={styles.sectionTitle}>Recent Orders</h3>
    <div className={styles.orderList}>
      {MOCK_ORDERS.map((order) => (
        <div key={order.id} className={styles.orderCard}>
          <div className={styles.orderTop}>
            <span className={styles.orderId}>{order.id}</span>
            <span className={`${styles.orderStatus} ${styles[`status_${order.statusColor}`]}`}>{order.status}</span>
          </div>
          <p className={styles.orderItem}>{order.items}</p>
          <div className={styles.orderMeta}>
            <span className={styles.orderDate}>📅 {order.date}</span>
            <span className={styles.orderAmount}>{order.amount}</span>
          </div>
          <div className={styles.orderActions}>
            <button type="button" className={styles.addrBtn}>Track</button>
            <button type="button" className={styles.addrBtn}>Invoice</button>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const WishlistTab = () => (
  <div className={styles.section}>
    <h3 className={styles.sectionTitle}>My Wishlist</h3>
    <div className={styles.wishList}>
      {MOCK_WISHLIST.map((item) => (
        <div key={item.id} className={styles.wishCard}>
          <div className={styles.wishInfo}>
            <p className={styles.wishName}>{item.name}</p>
            <p className={styles.wishCat}>{item.category}</p>
            <p className={styles.wishPrice}>{item.price}</p>
          </div>
          <div className={styles.wishActions}>
            <button type="button" className={styles.wishCartBtn}>Add to Cart</button>
            <button type="button" className={styles.wishRemoveBtn}>✕</button>
          </div>
        </div>
      ))}
    </div>
  </div>
)

/* ─── Helpers ─────────────────────────────────────────────── */

const FieldRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <div className={styles.fieldRow}>
    <span className={styles.fieldIcon}>{icon}</span>
    <div>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  </div>
)

const formatDob = (dob: string) => {
  const d = new Date(dob)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default ProfileModal
