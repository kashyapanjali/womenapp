import React from "react";
import "./ProductCard.css";
import { FaCartPlus } from "react-icons/fa";

function ProductCard({ product, onAddToCart }){
  return (
    <div className="product-card">
      <img
        src={product.image || "https://placehold.co/300x300"}
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <p className="product-price">₹{product.price.toFixed(2)}</p>
        <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
          <FaCartPlus /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
