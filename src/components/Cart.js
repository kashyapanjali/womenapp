import React from "react";
import "./Cart.css";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaArrowRight,
} from "react-icons/fa";

function Cart({ cart, closeCart, onQuantityChange, onRemoveItem, onClearCart }){
  const total = (cart || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  return (
    <div className="cart-overlay">
      <div className="cart-panel">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={closeCart}>
            <FaTimes />
          </button>
        </div>

        {!cart || cart.length === 0 ? (
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
              {cart.map((item) => (
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
                        onClick={() =>
                          onQuantityChange && onQuantityChange(item.productId || item.product?._id || item._id, Math.max(1, (item.quantity || 1) - 1))
                        }
                      >
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          onQuantityChange && onQuantityChange(item.productId || item.product?._id || item._id, (item.quantity || 1) + 1)
                        }
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
                    onClick={() => onRemoveItem && onRemoveItem(item.productId || item.product?._id || item._id)}
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
              <button className="btn btn-danger" onClick={() => onClearCart && onClearCart()}>
                Clear Cart
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
