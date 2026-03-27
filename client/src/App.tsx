import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TopHeader from './components/TopHeader/TopHeader.tsx'
import Navbar from './components/Navbar/Navbar.tsx'
import Header from './components/Header/Header.tsx'
import Footer from './components/Footer/Footer.tsx'

const Home = lazy(() => import('./pages/Home.tsx'))
const Products = lazy(() => import('./pages/Products.tsx'))
const ProductDetails = lazy(() => import('./pages/ProductDetails.tsx'))
const Cart = lazy(() => import('./pages/Cart.tsx'))
const About = lazy(() => import('./pages/About.tsx'))
const Contact = lazy(() => import('./pages/Contact.tsx'))
const Donate = lazy(() => import('./pages/Donate.tsx'))
const Checkout = lazy(() => import('./pages/Checkout.tsx'))
const OrderTracking = lazy(() => import('./pages/OrderTracking.tsx'))
const Wishlist = lazy(() => import('./pages/Wishlist.tsx'))

function App() {
  return (
    <Router>
      <div className="app">
        <TopHeader />
        <Header />
        <Navbar />
        
        <main>
          <Suspense fallback={<div className="container" style={{ padding: '26px 0' }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/donate" element={<Donate />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App
