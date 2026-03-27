import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Header.module.css'
import LoginModal from '../LoginModal/LoginModal'
import ProfileModal from '../ProfileModal/ProfileModal'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { isLoggedIn, userProfile, login, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLoginSuccess = (mobile: string) => {
    login(mobile)
    setTimeout(() => setIsLoginOpen(false), 1200)
  }

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
    navigate('/')
  }

  const initials = userProfile
    ? (() => {
        const parts = userProfile.name.trim().split(' ')
        return parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : parts[0].slice(0, 2).toUpperCase()
      })()
    : ''

  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerContainer}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <a href="/" className={styles.logoLink} title="Go to homepage">
            <img
              src="/images/amazon-store/amazon-store-logo.png"
              alt="MLS HANDICRAFTS - Premium Indian Handicraft Products"
              className={styles.logoImage}
            />
          </a>
          <div className={styles.brandText}>
            <h1 className={styles.brandName}>MLS Handicrafts</h1>
            <p className={styles.brandTagline}>GIFT · DECOR · DIVINE</p>
          </div>
        </div>

        <div className={styles.spacer} />

        {/* Right Actions */}
        <div className={styles.headerActions}>
          <a href="/products" className={styles.shopNow}>Shop Now</a>

          <button className={styles.searchBtn} onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Search">
            🔍
          </button>

          <a href="/cart" className={styles.cartLink} aria-label="Cart">🛒</a>

          {isLoggedIn && userProfile ? (
            <div className={styles.authActions}>
              <button
                type="button"
                className={styles.profileBtn}
                onClick={() => setIsProfileOpen(true)}
                aria-label="Open profile"
                title={userProfile.name}
              >
                <span className={styles.avatarInitials}>{initials}</span>
              </button>

              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
                aria-label="Logout"
              >
                <span className={styles.logoutIcon}>⎋</span>
                <span className={styles.logoutText}>Logout</span>
              </button>
            </div>
          ) : (
            <button type="button" className={styles.loginLink} onClick={() => setIsLoginOpen(true)}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search products..." />
          <button>Search</button>
        </div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </header>
  )
}

export default Header
