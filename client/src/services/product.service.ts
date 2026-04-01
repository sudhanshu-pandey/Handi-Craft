/**
 * Product API Service
 * Handles all product-related API calls
 */

import api from './api';

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: any[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

class ProductService {
  /**
   * Get all products with pagination
   */
  async getAllProducts(params?: FetchProductsParams): Promise<ProductsResponse> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await api.request(`/products${queryString}`);
      
      return {
        products: response.products || [],
        total: response.total || 0,
        page: response.page || 1,
        pages: response.pages || 1,
        limit: response.limit || 20,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products');
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(productId: string | number): Promise<any> {
    try {
      const response = await api.request(`/products/${productId}`);
      return response.product || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product');
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<any[]> {
    try {
      const response = await api.request(`/products/category/${category}`);
      return response.products || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products by category');
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<any[]> {
    try {
      const response = await api.request(`/products/search?query=${encodeURIComponent(query)}`);
      return response.products || [];
    } catch (error: any) {
      throw new Error(error.message || 'Search failed');
    }
  }

  /**
   * Filter products
   */
  async filterProducts(filters: Record<string, any>): Promise<any[]> {
    try {
      const response = await api.request('/products/filter', {
        method: 'POST',
        body: JSON.stringify(filters),
      });
      return response.products || [];
    } catch (error: any) {
      throw new Error(error.message || 'Filter failed');
    }
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params?: FetchProductsParams): string {
    if (!params) return '';
    
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

export default new ProductService();
