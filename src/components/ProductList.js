import React from "react";
import "./ProductList.css";
import ProductCard from "./ProductCard";

const ProductList = ({ products, onAddToCart }) => {
  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))
      ) : (
        <p style={{ textAlign: "center", padding: "20px" }}>No products found.</p>
      )}
    </div>
  );
};

export default ProductList;
