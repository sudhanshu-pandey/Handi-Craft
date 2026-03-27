import { memo } from 'react'
import styles from './CategoryGrid.module.css'

interface Category {
  id: number
  name: string
  slug: string
  image: string
}

interface CategoryGridProps {
  categories: Category[]
}

const CategoryGrid = memo(({ categories }: CategoryGridProps) => {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>Shop by Categories</h2>
        <div className={styles.grid}>
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/category/${category.slug}`}
              className={styles.categoryCard}
            >
              <div className={styles.imageWrapper}>
                <img src={category.image} alt={category.name} />
              </div>
              <h3>{category.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
})

CategoryGrid.displayName = 'CategoryGrid'

export default CategoryGrid
