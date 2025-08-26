import React, { useState, useMemo } from "react";
import "./Checkout.css";
import { BASE_URL, PURCHASE_FROM_CART_API, DIRECT_PURCHASE_API } from "../api/api.js";
// import paymentService from "../api/paymentService.js";
import paymentService from "../api/testPaymentService.js"; // Using test service for now

function Checkout({ product, cartItems = [], onClose, onOrderPlaced }) {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [upiApp, setUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isSingleProduct = Boolean(product);

  const cartTotals = useMemo(() => {
    if (isSingleProduct) {
      const price = Number(product?.price || 0);
      return { subtotal: price, itemsCount: 1 };
    }
    const subtotal = (cartItems || []).reduce(
      (sum, item) => sum + Number(item.price || item.product?.price || 0) * Number(item.quantity || 0),
      0
    );
    const itemsCount = (cartItems || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    return { subtotal, itemsCount };
  }, [isSingleProduct, product, cartItems]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?._id || user?.id;
    } catch (e) {
      return null;
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};

    if (!street.trim()) errors.street = 'Street address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!zip.trim()) errors.zip = 'ZIP/PIN is required';
    if (!phone.trim()) errors.phone = 'Phone number is required';

    if (paymentMethod === "upi") {
      const upiValidation = paymentService.validateUPIId(upiId);
      if (!upiValidation.isValid) {
        errors.upiId = upiValidation.message;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Complete Razorpay payment initiation
  const initiateRazorpayPayment = async (orderId) => {
    try {
      setPaymentProcessing(true);
      
      // Create Razorpay order
      const orderData = await paymentService.createRazorpayOrder(orderId);
      
      // Get user details for prefill
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare UPI data
      const upiData = paymentMethod === 'upi' ? { upiApp, upiId } : {};
      
      // Initialize Razorpay payment
      const result = await paymentService.initializeRazorpayPayment(
        { ...orderData, orderId },
        { ...user, phone },
        upiData
      );
      
      alert('Payment successful! ' + result.message);
      
      // Close checkout and trigger order placed callback
      onOrderPlaced && onOrderPlaced();
      onClose && onClose();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Process UPI payment directly (without Razorpay)
  const processUPIPayment = async (orderId) => {
    try {
      setPaymentProcessing(true);
      
      const result = await paymentService.processUPIPayment(orderId, { upiId, upiApp });
      alert('UPI payment successful! Transaction ID: ' + result.payment.transactionId);
      
      // Close checkout and trigger order placed callback
      onOrderPlaced && onOrderPlaced();
      onClose && onClose();
      
    } catch (error) {
      console.error('UPI payment error:', error);
      alert('UPI payment failed: ' + error.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert('Please sign in to place an order.');
      return;
    }

    try {
      setSubmitting(true);

      const commonAddress = {
        shippingAddress: { street, city, zip },
        city,
        zip,
        phone
      };

      let createdOrderId = null;

      if (isSingleProduct) {
        // Direct purchase
        const body = JSON.stringify({
          productId: product._id || product.id,
          quantity: 1,
          ...commonAddress
        });
        const res = await fetch(`${BASE_URL}${DIRECT_PURCHASE_API(userId)}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to create order');
        }
        const data = await res.json();
        createdOrderId = data?.order?.id || data?.order?._id || data?.orderId || data?.id;
      } else {
        // From cart
        const body = JSON.stringify({ ...commonAddress });
        const res = await fetch(`${BASE_URL}${PURCHASE_FROM_CART_API(userId)}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to create order from cart');
        }
        const data = await res.json();
        const order = data?.order || data;
        createdOrderId = order?.id || order?._id;
      }

      if (!createdOrderId) {
        throw new Error('Order created but no order ID was returned');
      }

      // Handle payment based on method
      if (paymentMethod === 'upi') {
        // Use Razorpay for UPI payments
        await initiateRazorpayPayment(createdOrderId);
      } else {
        // Cash on Delivery - order is already created
        alert('Order placed successfully! You will pay on delivery.');
        onOrderPlaced && onOrderPlaced();
        onClose && onClose();
      }
      
    } catch (err) {
      console.error('Order placement error:', err);
      alert(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const goToProducts = () => {
    onClose && onClose();
    // Returning to products list; App will render product list when checkout is closed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h2>Checkout</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {isSingleProduct ? (
        <div className="product-summary" onClick={goToProducts} style={{ cursor: 'pointer' }}>
          <img src={product.image || "https://placehold.co/120x120"} alt={product.name} />
          <div className="summary-info">
            <h3>{product.name}</h3>
            <p className="price">₹{Number(product.price).toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <div className="product-summary">
          <div className="summary-info">
            <h3>Purchasing {cartTotals.itemsCount} item(s)</h3>
            <p className="price">Subtotal: ₹{cartTotals.subtotal.toFixed(2)}</p>
          </div>
        </div>
      )}

      <form className="checkout-form" onSubmit={placeOrder}>
        <div className="card-block">
          <h4>Delivery Address</h4>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Street address"
            required
            className={validationErrors.street ? 'error' : ''}
          />
          {validationErrors.street && <span className="error-text">{validationErrors.street}</span>}
          
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              required
              style={{ flex: 1 }}
              className={validationErrors.city ? 'error' : ''}
            />
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="ZIP / PIN"
              required
              style={{ flex: 1 }}
              className={validationErrors.zip ? 'error' : ''}
            />
          </div>
          {(validationErrors.city || validationErrors.zip) && (
            <div style={{ display: 'flex', gap: 12 }}>
              {validationErrors.city && <span className="error-text" style={{ flex: 1 }}>{validationErrors.city}</span>}
              {validationErrors.zip && <span className="error-text" style={{ flex: 1 }}>{validationErrors.zip}</span>}
            </div>
          )}
          
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            required
            className={validationErrors.phone ? 'error' : ''}
          />
          {validationErrors.phone && <span className="error-text">{validationErrors.phone}</span>}
        </div>

        <div className="card-block">
          <h4>Address Instructions</h4>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Landmark, call before delivery, drop at reception, etc."
            rows={3}
          />
        </div>

        <div className="card-block">
          <h4>Payment Method</h4>
          <div className="payment-options">
            <label className="radio-option">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={() => setPaymentMethod("upi")}
              />
              UPI (GPay, Paytm, PhonePe)
            </label>
          </div>

          {paymentMethod === "upi" && (
            <div className="upi-section">
              <div className="upi-apps">
                <label>
                  <input
                    type="radio"
                    name="upiApp"
                    value="gpay"
                    checked={upiApp === "gpay"}
                    onChange={() => setUpiApp("gpay")}
                  />
                  GPay
                </label>
                <label>
                  <input
                    type="radio"
                    name="upiApp"
                    value="paytm"
                    checked={upiApp === "paytm"}
                    onChange={() => setUpiApp("paytm")}
                  />
                  Paytm
                </label>
                <label>
                  <input
                    type="radio"
                    name="upiApp"
                    value="phonepe"
                    checked={upiApp === "phonepe"}
                    onChange={() => setUpiApp("phonepe")}
                  />
                  PhonePe
                </label>
              </div>
              <input
                type="text"
                className={`upi-id ${validationErrors.upiId ? 'error' : ''}`}
                placeholder="Enter your UPI ID (e.g., name@bank)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              {validationErrors.upiId && <span className="error-text">{validationErrors.upiId}</span>}
            </div>
          )}
        </div>

        <div className="actions">
          <div style={{ marginRight: 'auto', fontWeight: 700 }}>
            Total: ₹{cartTotals.subtotal.toFixed(2)}
          </div>
          <button type="button" className="secondary-btn" onClick={onClose}>Back</button>
          <button 
            type="submit" 
            className="primary-btn" 
            disabled={submitting || paymentProcessing}
          >
            {submitting ? 'Placing...' : paymentProcessing ? 'Processing Payment...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
