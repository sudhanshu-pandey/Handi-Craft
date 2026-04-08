import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import ProductCard from '../components/ProductCard/ProductCard'
import FilterSidebar from '../components/FilterSidebar/FilterSidebar'
import FilterModal from '../components/FilterModal/FilterModal'
import FilterChips from '../components/FilterChips/FilterChips'
import useProducts from '../hooks/useProducts'
import {
  selectFilterState,
  openFilterModal,
  selectHasActiveFilters,
  selectActiveFilterCount,
} from '../store/slices/filterSlice'
import { applyFiltersAndSort, getUniqueCategoriesFromProducts } from '../utils/filterUtils'
import styles from './pages.module.css'

const Products = () => {
  const dispatch = useAppDispatch()
  const { loadProducts, allProducts, loading, error } = useProducts()
  const filters = useAppSelector(selectFilterState)
  const hasActiveFilters = useAppSelector(selectHasActiveFilters)
  const activeFilterCount = useAppSelector(selectActiveFilterCount)
  
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 15

  // Fetch all products on component mount
  useEffect(() => {
    loadProducts(1, 100)
  }, [loadProducts])

  // Get unique categories for filter modal
  const categories = useMemo(
    () => getUniqueCategoriesFromProducts(allProducts),
    [allProducts]
  )

  // Apply filters and sorting
  const filteredProducts = useMemo(
    () => applyFiltersAndSort(allProducts, filters),
    [allProducts, filters]
  )

  // Calculate pagination based on filtered products
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

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
        <div
          style={{
            padding: '20px',
            color: '#d32f2f',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          ❌ Failed to load products: {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: '60px',
            textAlign: 'center',
            color: '#666',
            fontSize: '16px',
          }}
        >
          ⏳ Loading products...
        </div>
      ) : (
        <>
          {/* Main Layout Container - Desktop: 25/75 split, Mobile: Full width */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            {/* Left Sidebar - Desktop Only */}
            <div
              style={{
                display: 'none',
              }}
              className="desktop-filters"
            >
              <FilterSidebar categories={categories} />
            </div>

            {/* Right Column - Products Section */}
            <div
              style={{
                flex: 1,
              }}
            >
              {/* Mobile Filter Button - Hidden on Desktop */}
              <div
                style={{
                  display: 'none',
                  marginBottom: '20px',
                }}
                className="mobile-filters-button"
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: hasActiveFilters ? '#ff6b35' : '#f5f5f5',
                    color: hasActiveFilters ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  } as React.CSSProperties}
                  onClick={() => dispatch(openFilterModal())}
                >
                  <span>🔍 Filters</span>
                  {activeFilterCount > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && <FilterChips />}

              {/* Products Grid or No Results */}
              {filteredProducts.length === 0 ? (
                <div
                  style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#666' }}>
                    No Products Found
                  </h3>
                  <p style={{ marginBottom: '20px', color: '#999' }}>
                    Try adjusting your filters or sorting options
                  </p>
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
                          stock: product.stock,
                          rating: product.rating,
                          reviewCount: product.reviewCount,
                        }}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '40px',
                        marginBottom: '40px',
                        flexWrap: 'wrap',
                      }}
                    >
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
                          transition: 'all 0.2s',
                        } as React.CSSProperties}
                      >
                        ← Previous
                      </button>

                      <div
                        style={{
                          display: 'flex',
                          gap: '4px',
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                        }}
                      >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (pageNumber) => (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageClick(pageNumber)}
                              style={{
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor:
                                  currentPage === pageNumber ? '#f97316' : '#fff',
                                color:
                                  currentPage === pageNumber ? '#fff' : '#333',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight:
                                  currentPage === pageNumber ? 'bold' : 'normal',
                                transition: 'all 0.2s',
                              } as React.CSSProperties}
                            >
                              {pageNumber}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor:
                            currentPage === totalPages ? '#f5f5f5' : '#fff',
                          cursor:
                            currentPage === totalPages
                              ? 'not-allowed'
                              : 'pointer',
                          color:
                            currentPage === totalPages ? '#999' : '#333',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                        } as React.CSSProperties}
                      >
                        Next →
                      </button>
                    </div>
                  )}

                  <p
                    style={{
                      textAlign: 'center',
                      color: '#666',
                      marginBottom: '20px',
                      fontSize: '14px',
                    }}
                  >
                    Showing {indexOfFirstProduct + 1} to{' '}
                    {Math.min(indexOfLastProduct, filteredProducts.length)} of{' '}
                    {filteredProducts.length} products
                  </p>
                </>
              )}
            </div>
          </div>

          {/* CSS Media Queries for Responsive Layout */}
          <style>{`
            /* Desktop Layout (> 768px) - Show sidebar, hide mobile button */
            @media (min-width: 769px) {
              .desktop-filters {
                display: block !important;
                width: 25%;
                min-width: 300px;
              }
              
              .mobile-filters-button {
                display: none !important;
              }
            }
            
            /* Mobile Layout (< 768px) - Hide sidebar, show mobile button */
            @media (max-width: 768px) {
              .desktop-filters {
                display: none !important;
              }
              
              .mobile-filters-button {
                display: block !important;
              }
            }
          `}</style>
        </>
      )}

      {/* Filter Modal - Mobile Only */}
      {filters.isFilterModalOpen && (
        <FilterModal categories={categories} />
      )}
    </div>
  )
}

export default Products
