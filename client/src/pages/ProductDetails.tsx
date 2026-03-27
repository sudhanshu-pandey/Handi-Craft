import { useParams } from 'react-router-dom'
import styles from './pages.module.css'

const ProductDetails = () => {
  const { id } = useParams()

  return (
    <div className="container">
      <div className={styles.detailsSection}>
        <h1>Product Details - ID: {id}</h1>
        <p>Product details page coming soon!</p>
        <p>This page will show detailed information about the selected product.</p>
      </div>
    </div>
  )
}

export default ProductDetails
