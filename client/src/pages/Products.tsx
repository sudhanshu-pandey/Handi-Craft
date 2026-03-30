import { useState } from 'react'
import ProductCard from '../components/ProductCard/ProductCard'
import styles from './pages.module.css'
import { products as allProducts, Product } from '../data/products'

const Products = () => {
  const [products] = useState(() => allProducts)

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Our Products</h1>
      <div className={styles.productsGrid}>
        {products.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  )
}

export default Products
