import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!navRef.current) {
        return
      }

      const target = event.target as Node | null
      if (target && !navRef.current.contains(target)) {
        setIsMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className={styles.navbar} ref={navRef}>
      <div className="container">
        <div className={styles.navContent}>
          <button
            type="button"
            className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ''}`.trim()}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={styles.themeControl}>
            <ThemeSwitcher />
          </div>

          <div className={`${styles.menuLinks} ${isMenuOpen ? styles.menuOpen : ''}`.trim()}>
            <Link to="/" className={styles.navLink} onClick={handleLinkClick}>Home</Link>
            <Link to="/products" className={styles.navLink} onClick={handleLinkClick}>Products</Link>
            <Link to="/cart" className={styles.navLink} onClick={handleLinkClick}>Cart</Link>
            <Link to="/about" className={styles.navLink} onClick={handleLinkClick}>About Us</Link>
            <Link to="/contact" className={styles.navLink} onClick={handleLinkClick}>Contact Us</Link>
          </div>
        </div>
      </div>
      <button
        type="button"
        className={`${styles.backdrop} ${isMenuOpen ? styles.backdropVisible : ''}`.trim()}
        onClick={() => setIsMenuOpen(false)}
        aria-label="Close navigation menu"
      />
    </nav>
  )
}

export default Navbar
