import React, { useState } from "react";
import "./Cart.css";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaArrowRight,
} from "react-icons/fa";

function Cart({closeCart}){
  const [cart, setCart] = useState([
    {
      id: 1,
      name: "Menstrual Kit",
      price: 299,
      quantity: 2,
      image: "https://5.imimg.com/data5/ANDROID/Default/2024/7/433837471/RJ/MV/HT/38818420/product-jpeg-500x500.jpg",
    },
    {
      id: 2,
      name: "Safety Product",
      price: 499,
      quantity: 1,
      image: "https://rukminim3.flixcart.com/image/850/1000/k7nnrm80/sanitary-pad-pantyliner/q/e/p/sanitary-pads-30pcs-pack-of-1-regular-1-sanitary-pad-women-original-imafpugaekkn3arq.jpeg?q=90&crop=false",
    },
  ]);

  const handleQuantityChange = (productId, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-overlay">
      <div className="cart-panel">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={closeCart}>
            <FaTimes />
          </button>
        </div>

        {cart.length === 0 ? (
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
                <div className="cart-item" key={item.id}>
                  <img
                    src={item.image || "https://placehold.co/100x100"}
                    alt={item.name}
                  />
                  <div className="cart-info">
                    <p className="cart-name">{item.name}</p>
                    <p className="cart-price">₹{item.price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, Math.max(1, item.quantity - 1))
                        }
                      >
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  <p className="cart-total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className="cart-remove"
                    onClick={() => handleRemoveFromCart(item.id)}
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
              <button className="btn btn-danger" onClick={handleClearCart}>
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
