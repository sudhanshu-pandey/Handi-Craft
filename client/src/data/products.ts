export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  sale?: boolean
  description?: string
  rating?: number
  reviews?: number
}

const getProductImage = (category: string): string => {
  const images: { [key: string]: string } = {
    'Brass Handicrafts': '/images/products/brass-idol.svg',
    'Wooden Handicrafts': '/images/products/wooden-box.svg',
    'Marble Handicrafts': '/images/products/marble-art.svg',
    'Table Lamps': '/images/products/lamp.svg',
    'Dhokra Handicrafts': '/images/products/dhokra.svg',
    'Textiles': '/images/products/textile.svg',
    'Pottery': '/images/products/pottery.svg',
    'Stone Carving': '/images/products/marble-art.svg',
  }
  return images[category] || '/images/products/brass-idol.svg'
}

export const products: Product[] = [
  // Brass Handicrafts
  { id: 1, name: 'Brass Krishna Idol', price: 5999, originalPrice: 6999, image: getProductImage('Brass Handicrafts'), category: 'Brass Handicrafts', sale: true, description: 'Beautiful brass Krishna idol with intricate details', rating: 4.8, reviews: 145 },
  { id: 2, name: 'Brass Buddha Door Knocker', price: 1499, originalPrice: 1999, image: getProductImage('Brass Handicrafts'), category: 'Brass Handicrafts', sale: true, description: 'Decorative Buddha door knocker in solid brass', rating: 4.6, reviews: 89 },
  { id: 3, name: 'Brass Elephant Figurine', price: 3499, originalPrice: 4299, image: getProductImage('Brass Handicrafts'), category: 'Brass Handicrafts', sale: true, description: 'Handcrafted brass elephant with ornate design', rating: 4.7, reviews: 112 },
  { id: 4, name: 'Brass Oil Lamp', price: 2499, originalPrice: 2999, image: getProductImage('Brass Handicrafts'), category: 'Brass Handicrafts', description: 'Traditional brass diya/oil lamp', rating: 4.5, reviews: 76 },

  // Wooden Handicrafts
  { id: 5, name: 'Wooden Decorative Box', price: 1899, originalPrice: 2499, image: getProductImage('Wooden Handicrafts'), category: 'Wooden Handicrafts', sale: true, description: 'Hand-carved wooden storage and decorative box', rating: 4.6, reviews: 98 },
  { id: 6, name: 'Wooden Mask', price: 999, originalPrice: 1399, image: getProductImage('Wooden Handicrafts'), category: 'Wooden Handicrafts', sale: true, description: 'Traditional wooden tribal mask', rating: 4.4, reviews: 67 },
  { id: 7, name: 'Wooden Statue', price: 4999, image: getProductImage('Wooden Handicrafts'), category: 'Wooden Handicrafts', description: 'Hand-carved wooden figurine statue', rating: 4.8, reviews: 156 },
  { id: 8, name: 'Wooden Jewelry Box', price: 2799, originalPrice: 3499, image: getProductImage('Wooden Handicrafts'), category: 'Wooden Handicrafts', sale: true, description: 'Beautiful wooden jewelry storage box', rating: 4.7, reviews: 124 },

  // Marble Handicrafts
  { id: 9, name: 'Marble Taj Mahal Model', price: 7999, originalPrice: 9999, image: getProductImage('Marble Handicrafts'), category: 'Marble Handicrafts', sale: true, description: 'Exquisite marble replica of Taj Mahal', rating: 4.9, reviews: 203 },
  { id: 10, name: 'Marble Chess Set', price: 5499, originalPrice: 6999, image: getProductImage('Marble Handicrafts'), category: 'Marble Handicrafts', sale: true, description: 'Hand-carved marble chess board with pieces', rating: 4.8, reviews: 178 },
  { id: 11, name: 'Marble Fruit Bowl', price: 3999, originalPrice: 4999, image: getProductImage('Marble Handicrafts'), category: 'Marble Handicrafts', sale: true, description: 'Decorative marble fruit bowl', rating: 4.6, reviews: 91 },
  { id: 12, name: 'Marble Vase', price: 4499, image: getProductImage('Marble Handicrafts'), category: 'Marble Handicrafts', description: 'Hand-carved marble decorative vase', rating: 4.7, reviews: 134 },

  // Table Lamps
  { id: 13, name: 'Brass Table Lamp', price: 3999, originalPrice: 4999, image: getProductImage('Table Lamps'), category: 'Table Lamps', sale: true, description: 'Vintage style brass table lamp with warm lighting', rating: 4.7, reviews: 167 },
  { id: 14, name: 'Wooden Base Table Lamp', price: 2999, originalPrice: 3799, image: getProductImage('Table Lamps'), category: 'Table Lamps', sale: true, description: 'Traditional wooden base with fabric shade', rating: 4.6, reviews: 103 },
  { id: 15, name: 'Marble Crystal Lamp', price: 5999, image: getProductImage('Table Lamps'), category: 'Table Lamps', description: 'Elegant marble and crystal table lamp', rating: 4.8, reviews: 189 },
  { id: 16, name: 'Decorative Lantern Lamp', price: 1999, originalPrice: 2599, image: getProductImage('Table Lamps'), category: 'Table Lamps', sale: true, description: 'Handcrafted decorative lantern style lamp', rating: 4.5, reviews: 78 },

  // Dhokra Handicrafts
  { id: 17, name: 'Dhokra Elephant', price: 2499, originalPrice: 3199, image: getProductImage('Dhokra Handicrafts'), category: 'Dhokra Handicrafts', sale: true, description: 'Traditional dhokra cast elephant figurine', rating: 4.7, reviews: 145 },
  { id: 18, name: 'Dhokra Peacock', price: 1999, originalPrice: 2599, image: getProductImage('Dhokra Handicrafts'), category: 'Dhokra Handicrafts', sale: true, description: 'Beautiful dhokra peacock showpiece', rating: 4.6, reviews: 112 },
  { id: 19, name: 'Dhokra Oil Lamp', price: 1499, originalPrice: 1999, image: getProductImage('Dhokra Handicrafts'), category: 'Dhokra Handicrafts', sale: true, description: 'Traditional dhokra oil lamp (diya)', rating: 4.5, reviews: 89 },
  { id: 20, name: 'Dhokra Wall Hanging', price: 2799, image: getProductImage('Dhokra Handicrafts'), category: 'Dhokra Handicrafts', description: 'Decorative dhokra wall hanging with patterns', rating: 4.8, reviews: 156 },

  // Textiles
  { id: 21, name: 'Handwoven Carpet', price: 9999, originalPrice: 12999, image: getProductImage('Textiles'), category: 'Textiles', sale: true, description: 'Hand-woven traditional carpet with intricate patterns', rating: 4.8, reviews: 234 },
  { id: 22, name: 'Handwoven Table Runner', price: 1999, originalPrice: 2499, image: getProductImage('Textiles'), category: 'Textiles', sale: true, description: 'Colorful handwoven table runner', rating: 4.6, reviews: 87 },
  { id: 23, name: 'Handwoven Basket', price: 999, originalPrice: 1399, image: getProductImage('Textiles'), category: 'Textiles', sale: true, description: 'Traditional handwoven decorative basket', rating: 4.5, reviews: 64 },
  { id: 24, name: 'Handwoven Cushion Cover', price: 799, originalPrice: 1099, image: getProductImage('Textiles'), category: 'Textiles', sale: true, description: 'Handwoven cushion cover with traditional design', rating: 4.4, reviews: 71 },

  // Pottery
  { id: 25, name: 'Traditional Pottery Vase', price: 1599, originalPrice: 1999, image: getProductImage('Pottery'), category: 'Pottery', sale: true, description: 'Hand-thrown ceramic pottery vase', rating: 4.6, reviews: 103 },
  { id: 26, name: 'Clay Figurine Set', price: 2499, originalPrice: 3199, image: getProductImage('Pottery'), category: 'Pottery', sale: true, description: 'Set of hand-molded clay figurines', rating: 4.7, reviews: 128 },
  { id: 27, name: 'Terracotta Pot', price: 799, originalPrice: 1099, image: getProductImage('Pottery'), category: 'Pottery', sale: true, description: 'Traditional terracotta water pot', rating: 4.5, reviews: 92 },
  { id: 28, name: 'Painted Pottery Bowl', price: 1299, originalPrice: 1699, image: getProductImage('Pottery'), category: 'Pottery', sale: true, description: 'Hand-painted decorative pottery bowl', rating: 4.6, reviews: 115 },

  // Stone Carving
  { id: 29, name: 'Stone Carved Decorative Plaque', price: 3999, originalPrice: 4999, image: getProductImage('Stone Carving'), category: 'Stone Carving', sale: true, description: 'Intricately carved stone decorative plaque', rating: 4.7, reviews: 134 },
  { id: 30, name: 'Soapstone Carving', price: 1999, originalPrice: 2599, image: getProductImage('Stone Carving'), category: 'Stone Carving', sale: true, description: 'Hand-carved soapstone figurine', rating: 4.6, reviews: 98 },
]

export const categories = [
  { id: 1, name: 'Brass Handicrafts', slug: 'brass', image: '/images/products/brass-idol.svg' },
  { id: 2, name: 'Wooden Handicrafts', slug: 'wooden', image: '/images/products/wooden-box.svg' },
  { id: 3, name: 'Marble Handicrafts', slug: 'marble', image: '/images/products/marble-art.svg' },
  { id: 4, name: 'Table Lamps', slug: 'lamps', image: '/images/products/lamp.svg' },
  { id: 5, name: 'Dhokra', slug: 'dhokra', image: '/images/products/dhokra.svg' },
  { id: 6, name: 'Textiles', slug: 'textiles', image: '/images/products/textile.svg' },
]
