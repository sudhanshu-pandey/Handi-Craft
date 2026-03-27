import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { useCommerce } from '../context/CommerceContext'
import { formatCurrency } from '../utils/commerce'
import styles from './commerce.module.css'

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCommerce()

  const wishlistProducts = wishlist
    .map((id) => products.find((entry) => entry.id === id))
    .filter((entry): entry is (typeof products)[number] => Boolean(entry))

  const compareCandidates = wishlistProducts.slice(0, 2)

  return (
    <div className={`container ${styles.page}`}>
      <h1 style={{ marginBottom: 14 }}>Wishlist</h1>

      {wishlistProducts.length === 0 ? (
        <div className={styles.card} style={{ padding: 14 }}>
          <p>No products saved yet.</p>
          <Link to="/products" className={styles.primaryBtn}>Browse products</Link>
        </div>
      ) : (
        <>
          <section className={styles.wishlistGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
            {wishlistProducts.map((product) => (
              <article key={product.id} className={styles.smallCard}>
                <img src={product.image} alt={product.name} loading="lazy" />
                <strong style={{ color: 'var(--text-dark)' }}>{product.name}</strong>
                <p>{formatCurrency(product.price)}</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  <button type="button" className={styles.primaryBtn} onClick={() => addToCart(product.id, 1)}>Add to cart</button>
                  <button type="button" className={styles.ghostBtn} onClick={() => toggleWishlist(product.id)}>Remove</button>
                </div>
              </article>
            ))}
          </section>

          {compareCandidates.length === 2 && (
            <section className={styles.card} style={{ padding: 14, marginTop: 14 }}>
              <h2 style={{ marginBottom: 8 }}>Compare products</h2>
              <div className={styles.checkoutGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                {compareCandidates.map((product) => (
                  <article key={product.id} className={styles.softCard} style={{ padding: 12 }}>
                    <strong style={{ color: 'var(--text-dark)' }}>{product.name}</strong>
                    <p>Price: {formatCurrency(product.price)}</p>
                    <p>Rating: {product.rating ?? 4.5}★</p>
                    <p>Category: {product.category}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default Wishlist
