import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard/ProductCard'
import useProducts from '../hooks/useProducts'
import styles from './pages.module.css'

const Products = () => {
  const { loadProducts, allProducts, loading, error } = useProducts()
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 15

  // Fetch all products on component mount
  useEffect(() => {
    loadProducts(1, 100) // Load more products for products page
  }, [loadProducts])

  // Calculate pagination
  const totalPages = Math.ceil(allProducts.length / productsPerPage)
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Our Products</h1>

      {error && (
        <div style={{ padding: '20px', color: '#d32f2f', textAlign: 'center', marginBottom: '20px' }}>
          ❌ Failed to load products: {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#666', fontSize: '16px' }}>
          ⏳ Loading products...
        </div>
      ) : allProducts.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#999', fontSize: '16px' }}>
          No products available
        </div>
      ) : (
        <>
          <div className={styles.productsGrid}>
            {currentProducts.map((product: any) => (
              <ProductCard
                key={product._id || product.id}
                product={{
                  id: product.id,
                  _id: product._id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.image,
                  category: product.category,
                  sale: product.sale,
                  stock: product.stock
                }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '40px',
              marginBottom: '40px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? '#999' : '#333',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                ← Previous
              </button>

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageClick(pageNumber)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: currentPage === pageNumber ? '#f97316' : '#fff',
                      color: currentPage === pageNumber ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: currentPage === pageNumber ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage === totalPages ? '#999' : '#333',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Next →
              </button>
            </div>
          )}

          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, allProducts.length)} of {allProducts.length} products
          </p>
        </>
      )}
    </div>
  )
}

export default Products
