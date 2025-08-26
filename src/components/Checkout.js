import React, { useState, useMemo } from "react";
import "./Checkout.css";
import { BASE_URL, PURCHASE_FROM_CART_API, DIRECT_PURCHASE_API } from "../api/api.js";
import { UPI_PROCESS_PAYMENT_API ,UPI_GATEWAY_CREATE_API, UPI_GATEWAY_VERIFY_API} from "../api/api.js";

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


  //intiate payment method
  const initiatePayment = async (orderId) => {
    const res = await fetch(`${BASE_URL}${UPI_GATEWAY_CREATE_API(orderId)}`, { method: 'POST' });
    const data = await res.json();
  
    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: 'Your App Name',
      description: 'Purchase Description',
      order_id: data.gatewayOrderId,
      handler: async function (response) {
        // Send payment details to backend for verification
        const verifyRes = await fetch(`${BASE_URL}${UPI_GATEWAY_VERIFY_API}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        const result = await verifyRes.json();
        alert(result.message);
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      theme: { color: '#3399cc' }
    };
  
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };
  

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !zip.trim() || !phone.trim()) {
      alert("Please fill street, city, zip and phone.");
      return;
    }
    if (paymentMethod === "upi" && !upiId.trim()) {
      alert("Please enter your UPI ID.");
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

      // If UPI, process payment immediately
      if (paymentMethod === 'upi') {
        const payRes = await fetch(`${BASE_URL}${UPI_PROCESS_PAYMENT_API(createdOrderId)}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ upiId, upiApp })
        });
        if (!payRes.ok) {
          const err = await payRes.json().catch(() => ({}));
          throw new Error(err.message || 'UPI payment failed');
        }
      }

      alert('Order placed successfully!');
      onOrderPlaced && onOrderPlaced();
      onClose && onClose();
    } catch (err) {
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
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              required
              style={{ flex: 1 }}
            />
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="ZIP / PIN"
              required
              style={{ flex: 1 }}
            />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            required
          />
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
                className="upi-id"
                placeholder="Enter your UPI ID (e.g., name@bank)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="actions">
          <div style={{ marginRight: 'auto', fontWeight: 700 }}>
            Total: ₹{cartTotals.subtotal.toFixed(2)}
          </div>
          <button type="button" className="secondary-btn" onClick={onClose}>Back</button>
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
