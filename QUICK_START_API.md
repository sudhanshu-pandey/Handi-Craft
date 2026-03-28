# Quick Start: API Integration Guide

## 🚀 Getting Started

### Backend Setup

1. **Install Dependencies**
```bash
cd server
npm install
```

2. **Configure Environment**
Create `.env` file in `/server` with:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/handi-craft
PORT=5000
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE=+1234567890
TWILIO_WHATSAPP=whatsapp:+1234567890
```

3. **Seed Database**
```bash
node src/seeds/seed.js
```

4. **Start Server**
```bash
npm start
```
Server runs on `http://localhost:5000`

### Frontend Setup

1. **Create `.env.local` in `/client`**
```env
VITE_API_URL=http://localhost:5000/api
```

2. **Install & Run**
```bash
cd client
npm install
npm run dev
```

## 📡 API Endpoints Reference

### Authentication
```
POST   /api/auth/send-otp         → Send OTP
POST   /api/auth/verify-otp       → Verify OTP & Login
POST   /api/auth/logout           → Logout
```

### Products
```
GET    /api/products              → All products (paginated)
GET    /api/products/search       → Search products
POST   /api/products/filter       → Filter products
GET    /api/products/:id          → Single product
GET    /api/products/:id/reviews  → Product reviews
POST   /api/products/:id/reviews  → Add review (auth required)
GET    /api/categories            → All categories
```

### Cart
```
GET    /api/cart                  → Get cart (auth required)
POST   /api/cart                  → Add to cart (auth required)
PUT    /api/cart                  → Update quantity (auth required)
POST   /api/cart/save-for-later  → Save for later (auth required)
DELETE /api/cart/:productId       → Remove from cart (auth required)
POST   /api/cart/clear            → Clear cart (auth required)
```

### Wishlist
```
GET    /api/wishlist              → Get wishlist (auth required)
POST   /api/wishlist              → Add to wishlist (auth required)
DELETE /api/wishlist/:productId   → Remove from wishlist (auth required)
```

### User/Profile
```
GET    /api/user/profile          → Get profile (auth required)
PUT    /api/user/profile          → Update profile (auth required)
GET    /api/user/addresses        → Get addresses (auth required)
POST   /api/user/addresses        → Add address (auth required)
PUT    /api/user/addresses/:id    → Update address (auth required)
DELETE /api/user/addresses/:id    → Delete address (auth required)
```

### Orders
```
GET    /api/orders                → Get all orders (auth required)
GET    /api/orders/:orderId       → Get order details (auth required)
PUT    /api/orders/:orderId/status → Update status (auth required)
POST   /api/orders/:orderId/cancel → Cancel order (auth required)
```

### Payments
```
POST   /api/payments/validate-coupon → Validate coupon
POST   /api/payments/process         → Process payment & create order
POST   /api/payments/initialize      → Initialize payment gateway
POST   /api/payments/verify          → Verify payment
```

## 🔌 Using the API Client

### In React Components

```typescript
import api from '@/services/api'

// Auth
await api.sendOTP(phone)
await api.verifyOTP(phone, otp)
api.setToken(accessToken) // Store token

// Products
const { products, total, pages } = await api.getProducts(1, 20)
const { product } = await api.getProductById(productId)
const { reviews } = await api.getProductReviews(productId)

// Cart
await api.addToCart(productId, quantity)
const { cart, savedItems, total } = await api.getCart()
await api.toggleSaveForLater(productId, true)

// Orders
const { orders } = await api.getOrders()
const { order } = await api.getOrderDetails(orderId)

// Payments
const { coupon } = await api.validateCoupon(code, cartTotal)
const { order } = await api.processPayment({
  items: cartItems,
  total: totalAmount,
  paymentMethod: 'upi',
  addressId: selectedAddressId,
  couponCode: appliedCoupon
})
```

## 📋 Sample Test Data

### Available Coupon Codes
- `ARTISAN10` - 10% off (min ₹500)
- `CRAFT20` - 20% off (min ₹2000)
- `HANDICRAFT5` - ₹500 off (min ₹2500)

### Sample Products (Post Seeding)
1. Handcrafted Brass Idol - ₹2,499
2. Wooden Storage Box - ₹1,899
3. Ceramic Decorative Lamp - ₹3,299
4. Marble Art Piece - ₹5,999
5. Hand-Woven Textile - ₹2,199
6. Embroidered Cushion Cover - ₹899
7. Terracotta Vase - ₹1,299
8. Brass Wall Hanging - ₹1,699

## 🔐 Authentication Flow

1. User enters phone number
2. Call `api.sendOTP(phone)`
3. User receives OTP via SMS/WhatsApp
4. User enters OTP
5. Call `api.verifyOTP(phone, otp)`
6. Get `accessToken` in response
7. Call `api.setToken(accessToken)`
8. All subsequent requests include auth header

## 💾 Response Formats

### Success Response
```json
{
  "products": [...],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

### Auth Response
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

## 🛠️ Troubleshooting

### CORS Issues
```javascript
// Make sure backend has CORS configured
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

### Auth Token Issues
```javascript
// Clear token and re-authenticate
localStorage.removeItem('accessToken')
api.clearToken()
```

### Database Connection
```bash
# Check MongoDB connection string
# Verify network access in MongoDB Atlas
# Ensure IP whitelist includes your current IP
```

## 📊 Performance Tips

- Use pagination: `api.getProducts(page, limit)`
- Cache product data where possible
- Debounce search inputs
- Batch cart operations
- Use product reviews sorting: `api.getProductReviews(id, 'highest')`

## 🔄 State Management Integration

### CommerceContext Integration
```typescript
const { cart, addToCart } = useCommerce()

useEffect(() => {
  // Sync with API on mount
  api.getCart().then(data => {
    setCart(data.cart)
  })
}, [])

const handleAddToCart = async (productId, qty) => {
  const result = await api.addToCart(productId, qty)
  addToCart(productId, qty) // Update local state
}
```

### AuthContext Integration
```typescript
const { login } = useAuth()

const handleVerifyOTP = async (phone, otp) => {
  const result = await api.verifyOTP(phone, otp)
  api.setToken(result.accessToken)
  login(phone)
}
```

## 📝 API Implementation Status

✅ Product Management
✅ User Authentication (OTP-based)
✅ Shopping Cart
✅ Wishlist
✅ Orders & Checkout
✅ Payment Processing
✅ Coupon/Discount System
✅ Product Reviews
✅ User Profiles & Addresses
✅ Order Tracking

## 🚀 Next Steps

1. **Update Home.tsx** - Fetch featured products
2. **Update Products.tsx** - Load from API with pagination
3. **Update Cart.tsx** - Use API endpoints with coupon validation
4. **Update Checkout.tsx** - Process payment through API
5. **Update OrderTracking.tsx** - Fetch order from API
6. **Update AuthContext** - Integrate OTP login
7. **Update CommerceContext** - Replace localStorage with API calls
8. **Add Error Handling** - Toast notifications for API errors
9. **Add Loading States** - Show spinners during API calls
10. **Test Complete Flow** - End-to-end user journey

---

For detailed API documentation, see `API_IMPLEMENTATION_COMPLETE.md`
