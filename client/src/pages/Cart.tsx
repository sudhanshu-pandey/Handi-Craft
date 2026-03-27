import styles from './pages.module.css'

const Cart = () => {
  return (
    <div className="container">
      <div className={styles.cartSection}>
        <h1>Shopping Cart</h1>
        <p>Your cart is currently empty</p>
        <a href="/products" className="btn btn-primary">
          Continue Shopping
        </a>
      </div>
    </div>
  )
}

export default Cart
