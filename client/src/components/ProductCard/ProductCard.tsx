import { memo } from 'react'
import { Link } from 'react-router-dom'
import QuantityControl from '../QuantityControl/QuantityControl'
import styles from './ProductCard.module.css'

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  sale?: boolean
  _id?: string | number
}

interface ProductCardProps {
  product: Product
}

const ProductCard = memo(({ product }: ProductCardProps) => {
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
        <div className={styles.buttonGroup}>
          <QuantityControl 
            productId={typeof product.id === 'number' ? product.id : parseInt(String(product.id), 10)}
          />
          <Link to={`/products/${product.id}`} className={styles.viewButton}>
            View
          </Link>
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
