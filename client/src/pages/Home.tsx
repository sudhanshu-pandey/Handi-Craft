import { useState } from 'react'
import CategoryGrid from '../components/CategoryGrid/CategoryGrid'
import BenefitsSection from '../components/BenefitsSection/BenefitsSection'
import TestimonialCarousel from '../components/TestimonialCarousel/TestimonialCarousel'
import ProductCard from '../components/ProductCard/ProductCard'
import styles from './pages.module.css'
import { products as allProducts, categories as allCategories, Product } from '../data/products' // Update path if needed

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  image: string
  rating: number
}

const Home = () => {
  const [products] = useState(() => allProducts.slice(0, 6))
  const [categories] = useState(() => allCategories)

  const [benefits] = useState([
    {
      id: 1,
      icon: '🔒',
      title: '100% Secure',
      description: 'Payment Protection',
    },
    {
      id: 2,
      icon: '💵',
      title: 'Cash On Delivery',
      description: 'Get First, Pay Later',
    },
    {
      id: 3,
      icon: '↩️',
      title: 'Easy Return',
      description: 'Easy Return & Refund',
    },
    {
      id: 4,
      icon: '🚚',
      title: 'Free Shipping',
      description: 'Free Delivery Across India',
    },
  ])

  const [testimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: 'Hari Krishna',
      role: 'Business Man',
      content:
        'Good collection of Indian made handicrafts and really great prices. No need to go far off places like Janpath if looking to gift Indian handicrafts/souvenirs.',
      image: '/images/avatars/avatar-hk.svg',
      rating: 5,
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Interior Designer',
      content:
        'Excellent quality products with authentic craftsmanship. The customer service is outstanding and delivery is always on time.',
      image: '/images/avatars/avatar-ps.svg',
      rating: 5,
    },
    {
      id: 3,
      name: 'Rajesh Patel',
      role: 'Entrepreneur',
      content:
        'Best place to buy traditional handicrafts. The prices are competitive and the products are exactly as pictured.',
      image: '/images/avatars/avatar-rp.svg',
      rating: 5,
    },
  ])

  const handleAddToCart = (product: Product) => {
    alert(`${product.name} added to cart!`)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          <h1>Welcome to MLS Handicrafts</h1>
          <p>Discover authentic, handcrafted products that celebrate tradition and artistry</p>
          <a href="/products" className="btn btn-primary">
            Shop Now
          </a>
        </div>
      </section>

      {/* Categories Section */}
      <CategoryGrid categories={categories} />

      {/* New Arrivals Section */}
      <section className={styles.arrivals}>
        <div className="container">
          <h2 className={styles.sectionTitle}>New Arrivals</h2>
          <div className={styles.productsGrid}>
            {products.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
            <a href="/products" className="btn btn-primary">
              View All Products
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection benefits={benefits} />

      {/* Testimonials Section */}
      <TestimonialCarousel testimonials={testimonials} />
    </div>
  )
}

export default Home
