# Handi-Craft API - Complete Examples & Curl Commands

## Quick Start

All API calls use the base URL:
```
http://localhost:5000/api  (local development)
https://your-domain.com/api (production)
```

Authentication header for protected routes:
```
Authorization: Bearer <jwt_token>
```

---

## 1. AUTHENTICATION

### 1.1 Send OTP to Phone

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210"
  }'
```

**Response (200)**:
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 600,
  "phone": "9876543210"
}
```

---

### 1.2 Verify OTP & Login/Register

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456"
  }'
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTc0NTg1MzQwMCwiZXhwIjoxNzQ2NDU4MjAwfQ.signed",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phone": "9876543210",
    "isVerified": true,
    "createdAt": "2026-03-28T10:30:00Z"
  }
}
```

---

### 1.3 Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200)**:
```json
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

### 1.4 Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. USER PROFILE & ADDRESSES

### 2.1 Get User Profile

```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
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
    ]
  }
}
```

---

### 2.2 Update Profile

```bash
curl -X PUT http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arjun Sharma",
    "email": "newemail@example.com",
    "gender": "male",
    "dob": "1992-04-15"
  }'
```

**Response (200)**:
```json
{
  "message": "Profile updated successfully",
  "user": {...updated user...}
}
```

---

### 2.3 Add New Address

```bash
curl -X POST http://localhost:5000/api/user/addresses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Office",
    "addressLine1": "5th Floor, Tower B",
    "addressLine2": "DLF Cyber City, Sector 24",
    "city": "Gurugram",
    "state": "Haryana",
    "postalCode": "122002",
    "country": "India",
    "isDefault": false
  }'
```

**Response (201)**:
```json
{
  "message": "Address added successfully",
  "address": {
    "_id": "507f1f77bcf86cd799439013",
    "label": "Office",
    "addressLine1": "5th Floor, Tower B",
    "city": "Gurugram",
    "state": "Haryana",
    "postalCode": "122002",
    "country": "India",
    "isDefault": false
  }
}
```

---

### 2.4 Update Address

```bash
curl -X PUT http://localhost:5000/api/user/addresses/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "New Office",
    "isDefault": true
  }'
```

**Response (200)**:
```json
{
  "message": "Address updated successfully",
  "address": {...updated address...}
}
```

---

### 2.5 Delete Address

```bash
curl -X DELETE http://localhost:5000/api/user/addresses/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
{
  "message": "Address deleted successfully"
}
```

---

## 3. PRODUCTS

### 3.1 Get All Products (with pagination)

```bash
# Page 1, 20 items per page, sorted by price (ascending)
curl -X GET "http://localhost:5000/api/products?page=1&limit=20&sort=price&order=asc"
```

**Response (200)**:
```json
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
  "pages": 5,
  "limit": 20
}
```

---

### 3.2 Get Single Product

```bash
curl -X GET http://localhost:5000/api/products/507f1f77bcf86cd799439011
```

**Response (200)**:
```json
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

---

### 3.3 Search Products

```bash
curl -X GET "http://localhost:5000/api/products/search?query=brass"
```

**Response (200)**:
```json
{
  "products": [...matching products...],
  "total": 15
}
```

---

### 3.4 Get Products by Category

```bash
curl -X GET "http://localhost:5000/api/products/category/Brass%20Handicrafts?page=1&limit=10"
```

**Response (200)**:
```json
{
  "products": [...products in category...],
  "total": 20,
  "page": 1,
  "pages": 2
}
```

---

### 3.5 Filter Products (Advanced)

```bash
curl -X POST http://localhost:5000/api/products/filter \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Brass Handicrafts",
    "minPrice": 1000,
    "maxPrice": 10000,
    "rating": 4,
    "inStock": true,
    "sortBy": "price",
    "order": "asc"
  }'
```

**Response (200)**:
```json
{
  "products": [...filtered products...],
  "total": 12
}
```

---

## 4. CART

### 4.1 Get Cart

```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
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
      "quantity": 2
    }
  ],
  "total": 11998,
  "itemCount": 1
}
```

---

### 4.2 Add to Cart

```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439012",
    "quantity": 1
  }'
```

**Response (201)**:
```json
{
  "message": "Product added to cart",
  "cart": [...updated cart...]
}
```

---

### 4.3 Update Cart Item Quantity

```bash
curl -X PUT http://localhost:5000/api/cart/update \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439012",
    "quantity": 3
  }'
```

**Response (200)**:
```json
{
  "message": "Cart updated",
  "cart": [...updated cart...]
}
```

---

### 4.4 Remove from Cart

```bash
curl -X DELETE http://localhost:5000/api/cart/remove/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
{
  "message": "Product removed from cart",
  "cart": [...updated cart...]
}
```

---

### 4.5 Clear Entire Cart

```bash
curl -X DELETE http://localhost:5000/api/cart/clear \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
{
  "message": "Cart cleared",
  "cart": []
}
```

---

## 5. WISHLIST

### 5.1 Get Wishlist

```bash
curl -X GET http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
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

---

### 5.2 Add to Wishlist

```bash
curl -X POST http://localhost:5000/api/wishlist/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439012"
  }'
```

**Response (201)**:
```json
{
  "message": "Product added to wishlist",
  "wishlistItem": {...}
}
```

---

### 5.3 Remove from Wishlist

```bash
curl -X DELETE http://localhost:5000/api/wishlist/remove/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
{
  "message": "Product removed from wishlist"
}
```

---

## 6. ORDERS

### 6.1 Place Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "507f1f77bcf86cd799439012",
        "quantity": 2
      }
    ],
    "addressId": "507f1f77bcf86cd799439013",
    "paymentMethod": "upi",
    "total": 11998
  }'
```

**Response (201)**:
```json
{
  "message": "Order placed successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "product": "507f1f77bcf86cd799439012",
        "quantity": 2
      }
    ],
    "total": 11998,
    "status": "pending",
    "paymentStatus": "pending",
    "address": "507f1f77bcf86cd799439013",
    "createdAt": "2026-03-28T10:30:00Z",
    "estimatedDelivery": "2026-04-02T10:30:00Z"
  }
}
```

---

### 6.2 Get All Orders

```bash
curl -X GET "http://localhost:5000/api/orders?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
{
  "orders": [...user's orders...],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

---

### 6.3 Get Order Details

```bash
curl -X GET http://localhost:5000/api/orders/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer <token>"
```

**Response (200)**:
```json
{
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439011",
    "items": [...populated items...],
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

## 7. REVIEWS

### 7.1 Get Product Reviews

```bash
curl -X GET http://localhost:5000/api/reviews/product/507f1f77bcf86cd799439012
```

**Response (200)**:
```json
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

---

### 7.2 Add Review

```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439012",
    "rating": 5,
    "comment": "Amazing product! Highly recommend"
  }'
```

**Response (201)**:
```json
{
  "message": "Review added successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439016",
    "product": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "rating": 5,
    "comment": "Amazing product! Highly recommend",
    "createdAt": "2026-03-28T10:35:00Z"
  }
}
```

---

## 8. CATEGORIES

### 8.1 Get All Categories

```bash
curl -X GET http://localhost:5000/api/categories
```

**Response (200)**:
```json
{
  "categories": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Brass Handicrafts",
      "description": "Traditional brass items",
      "image": "/images/products/brass-idol.svg"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Wooden Handicrafts",
      "description": "Hand-carved wooden items",
      "image": "/images/products/wooden-box.svg"
    }
  ]
}
```

---

## 9. PAYMENTS

### 9.1 Initialize Payment

```bash
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439014",
    "amount": 11998,
    "paymentMethod": "razorpay"
  }'
```

**Response (201)**:
```json
{
  "message": "Payment initialized",
  "payment": {
    "_id": "507f1f77bcf86cd799439017",
    "amount": 11998,
    "paymentMethod": "razorpay",
    "status": "pending",
    "razorpayOrderId": "order_abc123..."
  }
}
```

---

### 9.2 Verify Payment

```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "507f1f77bcf86cd799439017",
    "razorpayOrderId": "order_abc123...",
    "razorpayPaymentId": "pay_xyz789...",
    "razorpaySignature": "signature_hash..."
  }'
```

**Response (200)**:
```json
{
  "message": "Payment verified successfully"
}
```

---

## Testing with Postman

1. Import all endpoints into Postman
2. Set collection-level variable: `{{baseUrl}}` = `http://localhost:5000/api`
3. Set `{{token}}` after login: `eyJhbGciOiJIUzI1NiIs...`
4. All protected routes use header: `Authorization: Bearer {{token}}`

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "error details if in development"
}
```

### Common Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate entry)
- **500** - Server Error

---

End of API Examples
