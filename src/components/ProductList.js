import React from "react";
import "./ProductList.css";
import ProductCard from "./ProductCard";


//products and addToproduct prop receiving by productList
function ProductList({ products, onAddToCart }){
  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product._id || product.id} // Use _id from database or fallback to id
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
