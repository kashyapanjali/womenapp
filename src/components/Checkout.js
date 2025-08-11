import React, { useState, useMemo } from "react";
import "./Checkout.css";

function Checkout({ product, cartItems = [], onClose, onOrderPlaced }) {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [upiApp, setUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");

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

  const placeOrder = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      alert("Please enter your delivery address.");
      return;
    }
    if (paymentMethod === "upi" && !upiId.trim()) {
      alert("Please enter your UPI ID.");
      return;
    }
    alert("Order placed successfully!");
    onOrderPlaced && onOrderPlaced();
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
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full delivery address"
            rows={4}
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
          <button type="submit" className="primary-btn">Place Order</button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
