import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TopHeader from './components/TopHeader/TopHeader.tsx'
import Navbar from './components/Navbar/Navbar.tsx'
import Header from './components/Header/Header.tsx'
import Footer from './components/Footer/Footer.tsx'
import Home from './pages/Home.tsx'
import Products from './pages/Products.tsx'
import ProductDetails from './pages/ProductDetails.tsx'
import Cart from './pages/Cart.tsx'
import About from './pages/About.tsx'
import Contact from './pages/Contact.tsx'

function App() {
  return (
    <Router>
      <div className="app">
        <TopHeader />
        <Header />
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App
