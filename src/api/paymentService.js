import { BASE_URL, UPI_PROCESS_PAYMENT_API, UPI_GATEWAY_CREATE_API, UPI_GATEWAY_VERIFY_API, UPI_PAYMENT_STATUS_API } from './api';

class PaymentService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    } : { 
      'Content-Type': 'application/json' 
    };
  }

  // Create Razorpay order
  async createRazorpayOrder(orderId) {
    try {
      const response = await fetch(`${this.baseURL}${UPI_GATEWAY_CREATE_API(orderId)}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create payment order');
      }

      return await response.json();
    } catch (error) {
      console.error('Create Razorpay order error:', error);
      throw error;
    }
  }

  // Verify Razorpay payment
  async verifyRazorpayPayment(paymentData) {
    try {
      const response = await fetch(`${this.baseURL}${UPI_GATEWAY_VERIFY_API}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Verify Razorpay payment error:', error);
      throw error;
    }
  }

  // Process UPI payment directly
  async processUPIPayment(orderId, upiData) {
    try {
      const response = await fetch(`${this.baseURL}${UPI_PROCESS_PAYMENT_API(orderId)}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(upiData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'UPI payment failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Process UPI payment error:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(orderId) {
    try {
      const response = await fetch(`${this.baseURL}${UPI_PAYMENT_STATUS_API(orderId)}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }

  // Initialize Razorpay payment
  initializeRazorpayPayment(orderData, userData, upiData = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Check if Razorpay is available
        if (typeof window.Razorpay === 'undefined') {
          reject(new Error('Razorpay is not loaded. Please refresh the page and try again.'));
          return;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'NearToWomen',
          description: `Order #${String(orderData.orderId).slice(-6)}`,
          order_id: orderData.gatewayOrderId,
          handler: async (response) => {
            try {
              const verificationData = {
                orderId: orderData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...upiData
              };

              const result = await this.verifyRazorpayPayment(verificationData);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          },
          prefill: {
            name: userData.name || 'Customer',
            email: userData.email || 'customer@example.com',
            contact: userData.phone || '9999999999'
          },
          notes: {
            orderId: String(orderData.orderId),
            ...upiData
          },
          theme: { 
            color: '#e84a80' 
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Validate UPI ID format
  validateUPIId(upiId) {
    if (!upiId || typeof upiId !== 'string') {
      return { isValid: false, message: 'UPI ID is required' };
    }

    // Basic UPI ID validation (should contain @ symbol)
    if (!upiId.includes('@')) {
      return { isValid: false, message: 'Invalid UPI ID format. Should be like: name@bank' };
    }

    // Check length
    if (upiId.length < 5 || upiId.length > 50) {
      return { isValid: false, message: 'UPI ID should be between 5 and 50 characters' };
    }

    return { isValid: true, message: 'UPI ID is valid' };
  }

  // Validate UPI app
  validateUPIApp(upiApp) {
    const validApps = ['gpay', 'paytm', 'phonepe', 'bhim', 'amazonpay'];
    
    if (!upiApp || !validApps.includes(upiApp)) {
      return { 
        isValid: false, 
        message: `Invalid UPI app. Supported apps: ${validApps.join(', ')}` 
      };
    }

    return { isValid: true, message: 'UPI app is valid' };
  }

  // Get status color for UI
  getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      case 'cancelled':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  }

  // Get status icon for UI
  getStatusIcon(status) {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '❓';
    }
  }

  // Format currency
  formatCurrency(amount, currency = 'INR') {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    return formatter.format(amount);
  }

  // Format date
  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Create singleton instance
const paymentService = new PaymentService();

export default paymentService;
