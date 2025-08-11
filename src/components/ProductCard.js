import React from "react";
import "./ProductCard.css";
import { FaCartPlus } from "react-icons/fa";

function ProductCard({ product, onAddToCart, onBuyNow }){
  // Function to truncate description to 60 characters
  const truncateDescription = (description) => {
    if (!description) return '';
    if (description.length <= 60) return description;
    return description.substring(0, 60) + '...';
  };

  return (
    <div className="product-ca">
      <img
        src={product.image || "https://placehold.co/300x300"}
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{truncateDescription(product.description)}</p>
        <p className="product-price">₹{Number(product.price).toFixed(2)}</p>
        <button 
          className="add-to-cart-btn" 
          onClick={() => onAddToCart(product)}
          disabled={product.countInStock <= 0}
        >
          <FaCartPlus /> 
          {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button 
          className="buy-now-btn"
          onClick={() => onBuyNow && onBuyNow(product)}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
