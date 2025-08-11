import React, { useState, useEffect } from "react";
import "./Cart.css";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaArrowRight,
} from "react-icons/fa";
import { BASE_URL, UPDATE_CART_ITEM_API, REMOVE_FROM_CART_API, CLEAR_CART_API } from "../api/api";

function Cart({ cart, closeCart, onAddToCart }){
  const [localCart, setLocalCart] = useState(cart || []);
  const [loading, setLoading] = useState(false);

  // Update local cart when prop changes
  useEffect(() => {
    setLocalCart(cart || []);
  }, [cart]);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  // Get current user from token (more secure)
  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  // Decode JWT token to get user ID (more secure approach)
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Decode JWT token (base64 decode the payload part)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.userId || decodedPayload.id || decodedPayload._id;
    } catch (error) {
      console.error('Error decoding token:', error);
      // Fallback to localStorage user data
      const user = getCurrentUser();
      return user ? (user._id || user.id) : null;
    }
  };

  // Update cart item quantity
  const updateCartQuantity = async (productId, newQuantity) => {
    try {
      setLoading(true);
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error('No user ID found in token');
        return;
      }

      const res = await fetch(`${BASE_URL}${UPDATE_CART_ITEM_API(userId)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity: newQuantity })
      });

      if (!res.ok) throw new Error('Failed to update cart item');
      
      // Update local cart state
      setLocalCart(prevCart => 
        prevCart.map(item => 
          (item.productId || item.product?._id || item._id) === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Trigger parent cart update
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (e) {
      console.error('Update quantity error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error('No user ID found in token');
        return;
      }

      const res = await fetch(`${BASE_URL}${REMOVE_FROM_CART_API(userId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId })
      });

      if (!res.ok) throw new Error('Failed to remove item');
      
      // Remove item from local cart
      setLocalCart(prevCart => 
        prevCart.filter(item => 
          (item.productId || item.product?._id || item._id) !== productId
        )
      );

      // Trigger parent cart update
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (e) {
      console.error('Remove from cart error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error('No user ID found in token');
        return;
      }
      const res = await fetch(`${BASE_URL}${CLEAR_CART_API(userId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) throw new Error('Failed to clear cart');
      
      // Clear local cart
      setLocalCart([]);

      // Trigger parent cart update
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (e) {
      console.error('Clear cart error:', e);
    } finally {
      setLoading(false);
    }
  };

  const total = (localCart || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  return (
    <div className="cart-overlay">
      <div className="cart-panel">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={closeCart}>
            <FaTimes />
          </button>
        </div>

        {!localCart || localCart.length === 0 ? (
          <div className="empty-cart">
            <FaShoppingCart size={40} />
            <p>Your cart is empty</p>
            <button className="btn btn-primary" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {localCart.map((item) => (
                <div className="cart-item" key={item.productId || item._id}>
                  <img
                    src={item.image || item.product?.image || "https://placehold.co/100x100"}
                    alt={item.name || item.product?.name || "Product"}
                  />
                  <div className="cart-info">
                    <p className="cart-name">{item.name || item.product?.name}</p>
                    <p className="cart-price">₹{Number(item.price || item.product?.price || 0).toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateCartQuantity(
                          item.productId || item.product?._id || item._id, 
                          Math.max(1, (item.quantity || 1) - 1)
                        )}
                        disabled={loading}
                      >
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(
                          item.productId || item.product?._id || item._id, 
                          (item.quantity || 1) + 1
                        )}
                        disabled={loading}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  <p className="cart-total">
                    ₹{(Number(item.price || item.product?.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                  </p>
                  <button
                    className="cart-remove"
                    onClick={() => removeFromCart(item.productId || item.product?._id || item._id)}
                    disabled={loading}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <p className="tax-note">Taxes and shipping calculated at checkout</p>
              <button className="btn btn-primary">
                Proceed to Checkout <FaArrowRight />
              </button>
              <button 
                className="btn btn-danger" 
                onClick={clearCart}
                disabled={loading}
              >
                {loading ? 'Clearing...' : 'Clear Cart'}
              </button>
              <button className="btn btn-secondary" onClick={closeCart}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
