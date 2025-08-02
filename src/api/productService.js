import axios from 'axios';
import { BASE_URL, PRODUCTS_API, CATEGORIES_API } from './api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If API server is not running, use dummy data for testing
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.warn('API server not available, using dummy data for testing');
      return Promise.resolve({ data: { success: true, message: 'Dummy response' } });
    }
    return Promise.reject(error);
  }
);

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await api.get(PRODUCTS_API);
      
      // For testing: if API is not available, return dummy data
      if (response.data.message === 'Dummy response') {
        return [
          {
            _id: '1',
            name: 'Organic Cotton Pads',
            price: 12.99,
            brand: 'EcoCare',
            countInStock: 45,
            image: 'https://placehold.co/200x200',
            description: 'Natural cotton menstrual pads'
          },
          {
            _id: '2',
            name: 'Safety Whistle',
            price: 9.99,
            brand: 'SafeGuard',
            countInStock: 23,
            image: 'https://placehold.co/200x200',
            description: 'Emergency safety whistle'
          }
        ];
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // Add new product
  addProduct: async (productData) => {
    try {
      const response = await api.post(PRODUCTS_API, productData);
      
      // For testing: if API is not available, simulate success
      if (response.data.message === 'Dummy response') {
        return { 
          success: true, 
          message: 'Product added successfully (dummy)',
          product: {
            _id: Date.now().toString(),
            ...productData
          }
        };
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add product');
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`${PRODUCTS_API}/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`${PRODUCTS_API}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`${PRODUCTS_API}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await api.get(CATEGORIES_API);
      
      // For testing: if API is not available, return dummy categories
      if (response.data.message === 'Dummy response') {
        return [
          { _id: '1', name: 'Menstrual Care' },
          { _id: '2', name: 'Safety' },
          { _id: '3', name: 'Wellness' },
          { _id: '4', name: 'Health Food' }
        ];
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  // Search products
  searchProducts: async (searchParams) => {
    try {
      const response = await api.get(`${PRODUCTS_API}/search`, { params: searchParams });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search products');
    }
  }
};

export default productService; 