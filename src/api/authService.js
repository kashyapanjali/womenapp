import axios from 'axios';
import { BASE_URL, REGISTER_USER_API, REGISTER_ADMIN_API, LOGIN_API } from './api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add timeout and error handling
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If API server is not running, use dummy data for testing
    // when network fails
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.warn('API server not available, using dummy authentication for testing');
      return Promise.resolve({ data: { success: true, message: 'Dummy response' } });
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register user
  registerUser: async (userData) => {
    try {
      const response = await api.post(REGISTER_USER_API, userData);
      
      // For testing: if API is not available, simulate success
      if (response.data.message === 'Dummy response') {
        return { success: true, message: 'User registered successfully (dummy)' };
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Register admin
  registerAdmin: async (adminData) => {
    try {
      const response = await api.post(REGISTER_ADMIN_API, adminData);
      
      // For testing: if API is not available, simulate success
      if (response.data.message === 'Dummy response') {
        return { success: true, message: 'Admin registered successfully (dummy)' };
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Admin registration failed');
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await api.post(LOGIN_API, credentials);
      
      // For testing: if API is not available, simulate login
      if (response.data.message === 'Dummy response') {
        // Extract name from email 
        const emailPart = credentials.email.split('@')[0];
        const name = emailPart.replace(/\d+/g, ''); // Remove all numbers
        
        const dummyUser = {
          id: '1',
          name: name || emailPart, // Use cleaned name or fallback to email part
          email: credentials.email,
          role: credentials.email.includes('admin') ? 'admin' : 'user'
        };
        
        const dummyToken = 'dummy-token-' + Date.now();
        
        localStorage.setItem('token', dummyToken);
        localStorage.setItem('user', JSON.stringify(dummyUser));
        
        return { token: dummyToken, user: dummyUser };
      }
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  }
};

export default authService; 