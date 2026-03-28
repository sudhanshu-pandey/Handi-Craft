# Handi-Craft E-Commerce API Specification

## Complete API Endpoints List

### 1. AUTHENTICATION APIS
```
POST   /api/auth/send-otp              Send OTP to phone
POST   /api/auth/verify-otp            Verify OTP & login/register
POST   /api/auth/logout                Logout user
GET    /api/auth/me                    Get current user (protected)
```

### 2. USER PROFILE APIS
```
GET    /api/user/profile               Get user profile (protected)
PUT    /api/user/profile               Update profile (protected)
GET    /api/user/addresses             Get all addresses (protected)
POST   /api/user/addresses             Add new address (protected)
PUT    /api/user/addresses/:id         Update address (protected)
DELETE /api/user/addresses/:id         Delete address (protected)
```

### 3. PRODUCT APIS
```
GET    /api/products                   Get all products (with pagination)
GET    /api/products/:id               Get single product by ID
GET    /api/products/search            Search products by query
GET    /api/products/category/:cat     Get products by category
POST   /api/products/filter            Filter products (admin only)
POST   /api/products                   Create product (admin only)
PUT    /api/products/:id               Update product (admin only)
DELETE /api/products/:id               Delete product (admin only)
```

### 4. CATEGORY APIS
```
GET    /api/categories                 Get all categories
GET    /api/categories/:id             Get category by ID
POST   /api/categories                 Create category (admin only)
PUT    /api/categories/:id             Update category (admin only)
DELETE /api/categories/:id             Delete category (admin only)
```

### 5. CART APIS (Protected)
```
GET    /api/cart                       Get user's cart
POST   /api/cart/add                   Add product to cart
PUT    /api/cart/update                Update cart item quantity
DELETE /api/cart/remove/:productId     Remove product from cart
DELETE /api/cart/clear                 Clear entire cart
```

### 6. WISHLIST APIS (Protected)
```
GET    /api/wishlist                   Get user's wishlist
POST   /api/wishlist/add/:productId    Add product to wishlist
DELETE /api/wishlist/remove/:productId Remove product from wishlist
```

### 7. ORDER APIS (Protected)
```
POST   /api/orders                     Create/place new order
GET    /api/orders                     Get all user orders
GET    /api/orders/:id                 Get order details by ID
PUT    /api/orders/:id                 Update order status (admin only)
DELETE /api/orders/:id                 Cancel order (admin only)
GET    /api/orders/:id/invoice         Get order invoice
```

### 8. REVIEW APIS (Protected)
```
GET    /api/reviews/product/:id        Get reviews for product
POST   /api/reviews                    Add review (protected)
PUT    /api/reviews/:id                Update review (own only)
DELETE /api/reviews/:id                Delete review (own only)
```

### 9. PAYMENT APIS (Protected)
```
POST   /api/payments/initialize        Initialize payment (Razorpay/Stripe)
POST   /api/payments/verify            Verify payment
GET    /api/payments/:orderId          Get payment details
```

### 10. UPLOAD APIS (Protected)
```
POST   /api/upload/image               Upload single image
POST   /api/upload/multiple            Upload multiple images
DELETE /api/upload/:fileId             Delete uploaded file
```

### 11. MISC APIS
```
POST   /api/contact                    Submit contact form
POST   /api/donate                     Submit donation
GET    /api/analytics                  Get analytics (admin only)
```

---

## Detailed Endpoint Specifications

### Authentication

#### 1. Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

Request Body:
{
  "phone": "9876543210"
}

Response (200):
{
  "message": "OTP sent successfully",
  "expiresIn": 600,
  "phone": "9876543210"
}

Error (400):
{
  "message": "Invalid phone number"
}
```

#### 2. Verify OTP & Login/Register
```
POST /api/auth/verify-otp
Content-Type: application/json

Request Body:
{
  "phone": "9876543210",
  "otp": "123456"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phone": "9876543210",
    "isVerified": true,
    "createdAt": "2026-03-28T10:30:00Z"
  }
}

Error (401):
{
  "message": "Invalid or expired OTP"
}
```

#### 3. Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
Content-Type: application/json

Response (200):
{
  "message": "Logged out successfully"
}
```

#### 4. Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phone": "9876543210",
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "gender": "male",
    "dob": "1992-04-15",
    "isVerified": true,
    "createdAt": "2026-03-28T10:30:00Z"
  }
}
```

---

### User Profile

#### 1. Get Profile
```
GET /api/user/profile
Authorization: Bearer <token>

Response (200):
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phone": "9876543210",
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "gender": "male",
    "dob": "1992-04-15",
    "addresses": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "label": "Home",
        "addressLine1": "12, Rajpur Road",
        "addressLine2": "Near City Mall",
        "city": "Dehradun",
        "state": "Uttarakhand",
        "postalCode": "248001",
        "country": "India",
        "isDefault": true
      }
    ],
    "createdAt": "2026-03-28T10:30:00Z"
  }
}
```

#### 2. Update Profile
```
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Arjun Sharma",
  "email": "arjun.new@example.com",
  "gender": "male",
  "dob": "1992-04-15"
}

Response (200):
{
  "message": "Profile updated successfully",
  "user": {...updated user object...}
}
```

#### 3. Add Address
```
POST /api/user/addresses
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "label": "Office",
  "addressLine1": "5th Floor, Tower B, DLF Cyber City",
  "addressLine2": "Sector 24",
  "city": "Gurugram",
  "state": "Haryana",
  "postalCode": "122002",
  "country": "India",
  "isDefault": false
}

Response (201):
{
  "message": "Address added successfully",
  "address": {...address object...}
}
```

#### 4. Update Address
```
PUT /api/user/addresses/:addressId
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "label": "Home",
  "addressLine1": "New address",
  "isDefault": true
}

Response (200):
{
  "message": "Address updated successfully",
  "address": {...updated address object...}
}
```

#### 5. Delete Address
```
DELETE /api/user/addresses/:addressId
Authorization: Bearer <token>

Response (200):
{
  "message": "Address deleted successfully"
}
```

---

### Products

#### 1. Get All Products (with pagination & filters)
```
GET /api/products?page=1&limit=20&category=Brass&sort=price&order=asc

Response (200):
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Brass Krishna Idol",
      "price": 5999,
      "originalPrice": 6999,
      "category": "Brass Handicrafts",
      "description": "Beautiful brass Krishna idol with intricate details",
      "image": "/images/products/brass-idol.svg",
      "rating": 4.8,
      "reviews": 145,
      "stock": 50,
      "sale": true,
      "createdAt": "2026-03-28T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

#### 2. Get Single Product
```
GET /api/products/:productId

Response (200):
{
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Brass Krishna Idol",
    "price": 5999,
    "originalPrice": 6999,
    "category": "Brass Handicrafts",
    "description": "Beautiful brass Krishna idol with intricate details",
    "image": "/images/products/brass-idol.svg",
    "rating": 4.8,
    "reviews": 145,
    "stock": 50,
    "sale": true,
    "createdAt": "2026-03-28T10:30:00Z"
  }
}
```

#### 3. Search Products
```
GET /api/products/search?query=brass&category=Handicrafts&minPrice=1000&maxPrice=10000

Response (200):
{
  "products": [...matching products...],
  "total": 15
}
```

#### 4. Filter Products
```
POST /api/products/filter
Content-Type: application/json

Request Body:
{
  "category": "Brass Handicrafts",
  "minPrice": 1000,
  "maxPrice": 10000,
  "rating": 4,
  "inStock": true,
  "sortBy": "price",
  "order": "asc"
}

Response (200):
{
  "products": [...filtered products...],
  "total": 20
}
```

---

### Cart

#### 1. Get Cart
```
GET /api/cart
Authorization: Bearer <token>

Response (200):
{
  "cart": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "product": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Brass Krishna Idol",
        "price": 5999,
        "image": "/images/products/brass-idol.svg"
      },
      "quantity": 2,
      "savedForLater": false
    }
  ],
  "total": 11998,
  "itemCount": 1
}
```

#### 2. Add to Cart
```
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 1
}

Response (201):
{
  "message": "Product added to cart",
  "cart": [...updated cart...]
}
```

#### 3. Update Cart Item
```
PUT /api/cart/update
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 3
}

Response (200):
{
  "message": "Cart updated",
  "cart": [...updated cart...]
}
```

#### 4. Remove from Cart
```
DELETE /api/cart/remove/:productId
Authorization: Bearer <token>

Response (200):
{
  "message": "Product removed from cart",
  "cart": [...updated cart...]
}
```

---

### Wishlist

#### 1. Get Wishlist
```
GET /api/wishlist
Authorization: Bearer <token>

Response (200):
{
  "wishlist": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "product": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Brass Krishna Idol",
        "price": 5999,
        "category": "Brass Handicrafts"
      },
      "addedAt": "2026-03-28T10:30:00Z"
    }
  ],
  "total": 5
}
```

#### 2. Add to Wishlist
```
POST /api/wishlist/add/:productId
Authorization: Bearer <token>

Response (201):
{
  "message": "Product added to wishlist",
  "wishlist": [...updated wishlist...]
}
```

#### 3. Remove from Wishlist
```
DELETE /api/wishlist/remove/:productId
Authorization: Bearer <token>

Response (200):
{
  "message": "Product removed from wishlist",
  "wishlist": [...updated wishlist...]
}
```

---

### Orders

#### 1. Place Order
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "items": [
    {
      "product": "507f1f77bcf86cd799439012",
      "quantity": 2
    }
  ],
  "addressId": "507f1f77bcf86cd799439013",
  "paymentMethod": "upi",
  "total": 11998
}

Response (201):
{
  "message": "Order placed successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "items": [...items...],
    "total": 11998,
    "status": "pending",
    "paymentStatus": "pending",
    "address": "507f1f77bcf86cd799439013",
    "createdAt": "2026-03-28T10:30:00Z",
    "estimatedDelivery": "2026-04-02T10:30:00Z"
  }
}
```

#### 2. Get All Orders
```
GET /api/orders?page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "orders": [...user's orders...],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

#### 3. Get Order Details
```
GET /api/orders/:orderId
Authorization: Bearer <token>

Response (200):
{
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "product": {...product details...},
        "quantity": 2
      }
    ],
    "total": 11998,
    "status": "shipped",
    "paymentStatus": "success",
    "address": {...address details...},
    "createdAt": "2026-03-28T10:30:00Z",
    "estimatedDelivery": "2026-04-02T10:30:00Z"
  }
}
```

---

### Reviews

#### 1. Get Product Reviews
```
GET /api/reviews/product/:productId

Response (200):
{
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "product": "507f1f77bcf86cd799439012",
      "user": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Arjun",
        "phone": "9876543210"
      },
      "rating": 5,
      "comment": "Excellent product, very satisfied!",
      "createdAt": "2026-03-28T10:30:00Z"
    }
  ],
  "total": 10,
  "averageRating": 4.8
}
```

#### 2. Add Review
```
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "productId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "comment": "Amazing product! Highly recommend"
}

Response (201):
{
  "message": "Review added successfully",
  "review": {...review object...}
}
```

---

### Upload

#### 1. Upload Image
```
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: <binary image data>
- type: "product|profile|review"

Response (201):
{
  "message": "Image uploaded successfully",
  "file": {
    "_id": "507f1f77bcf86cd799439011",
    "url": "https://cdn.example.com/uploads/image-123.jpg",
    "publicId": "handi-craft/image-123",
    "size": 245632,
    "type": "image/jpeg",
    "uploadedAt": "2026-03-28T10:30:00Z"
  }
}
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth token missing/invalid |
| 403 | Forbidden - User not authorized |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal server error |

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Token format: JWT (JSON Web Token)
Token expiry: 7 days
Refresh token: Automatically sent in response

## Error Format

All errors follow this format:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Pagination

For list endpoints that support pagination:
```
- page: Page number (default: 1)
- limit: Items per page (default: 20, max: 100)
```

Response includes:
```
{
  "data": [...],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

---

End of API Specification
