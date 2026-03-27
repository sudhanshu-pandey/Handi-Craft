import { useState } from 'react'
import ProductCard from '../components/ProductCard/ProductCard'
import styles from './pages.module.css'
import { products as allProducts, Product } from '../data/products'
import { useCommerce } from '../context/CommerceContext'

const Products = () => {
  const { addToCart, trackEvent } = useCommerce()
  const [products] = useState(() => allProducts)

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1)
    trackEvent('added_to_cart', { productId: product.id, source: 'products_page' })
  }

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Our Products</h1>
      <div className={styles.productsGrid}>
        {products.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  )
}

export default Products
