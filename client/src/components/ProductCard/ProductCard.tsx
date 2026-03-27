import { memo } from 'react'
import { Link } from 'react-router-dom'
import styles from './ProductCard.module.css'

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  sale?: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

const ProductCard = memo(({ product, onAddToCart }: ProductCardProps) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        {product.sale && <span className={styles.saleBadge}>SALE!</span>}
        <span className={styles.category}>{product.category}</span>
      </div>
      <div className={styles.content}>
        <h3>{product.name}</h3>
        <div className={styles.priceSection}>
          {product.originalPrice && (
            <>
              <span className={styles.originalPrice}>
                ₹{product.originalPrice.toLocaleString()}
              </span>
              <span className={styles.discount}>-{discount}%</span>
            </>
          )}
          <p className={styles.price}>₹{product.price.toLocaleString()}</p>
          <p className={styles.gst}>inc. GST</p>
        </div>
        <div className={styles.rating}>
          ⭐⭐⭐⭐⭐ 0 out of 5
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </button>
          <Link to={`/products/${product.id}`} className="btn btn-secondary" style={{ textAlign: 'center' }}>
            View
          </Link>
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
