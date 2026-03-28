interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token: string): void {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('accessToken');
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  sendOTP(phone: string) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  verifyOTP(phone: string, otp: string) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  logout() {
    this.clearToken();
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Products endpoints
  getProducts(page = 1, limit = 20) {
    return this.request(`/products?page=${page}&limit=${limit}`);
  }

  getProductById(id: string | number) {
    return this.request(`/products/${id}`);
  }

  searchProducts(query: string) {
    return this.request(`/products/search?query=${encodeURIComponent(query)}`);
  }

  filterProducts(filters: any) {
    return this.request('/products/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  getCategories() {
    return this.request('/categories');
  }

  getProductsByCategory(category: string) {
    return this.request(`/products/category/${category}`);
  }

  // Reviews endpoints
  getProductReviews(productId: string | number, sort = 'latest') {
    return this.request(`/products/${productId}/reviews?sort=${sort}`);
  }

  addProductReview(productId: string | number, review: any) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // Cart endpoints
  getCart() {
    return this.request('/cart');
  }

  addToCart(productId: string | number, quantity: number) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  updateCartQuantity(productId: string | number, quantity: number) {
    return this.request('/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  toggleSaveForLater(productId: string | number, savedForLater: boolean) {
    return this.request('/cart/save-for-later', {
      method: 'POST',
      body: JSON.stringify({ productId, savedForLater }),
    });
  }

  removeFromCart(productId: string | number) {
    return this.request(`/cart/${productId}`, { method: 'DELETE' });
  }

  clearCart() {
    return this.request('/cart/clear', { method: 'POST' });
  }

  // Wishlist endpoints
  getWishlist() {
    return this.request('/wishlist');
  }

  addToWishlist(productId: string | number) {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  removeFromWishlist(productId: string | number) {
    return this.request(`/wishlist/${productId}`, { method: 'DELETE' });
  }

  // User endpoints
  getUserProfile() {
    return this.request('/user/profile');
  }

  updateUserProfile(profile: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  getAddresses() {
    return this.request('/user/addresses');
  }

  addAddress(address: any) {
    return this.request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  updateAddress(addressId: string, address: any) {
    return this.request(`/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  }

  deleteAddress(addressId: string) {
    return this.request(`/user/addresses/${addressId}`, { method: 'DELETE' });
  }

  // Orders endpoints
  getOrders() {
    return this.request('/orders');
  }

  getOrderDetails(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  cancelOrder(orderId: string) {
    return this.request(`/orders/${orderId}/cancel`, { method: 'POST' });
  }

  // Payment endpoints
  validateCoupon(couponCode: string, cartTotal: number) {
    return this.request('/payments/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode, cartTotal }),
    });
  }

  processPayment(paymentData: any) {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  initializePayment(orderId: string, amount: number, paymentMethod: string) {
    return this.request('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, paymentMethod }),
    });
  }

  verifyPayment(paymentId: string) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });
  }
}

export default new APIClient();
