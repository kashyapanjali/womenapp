import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  // Fetch all products
  useEffect(() => {
    // axios.get("/api/products")
    //   .then((res) => {
    //     setProducts(res.data);
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching products", err);
    //   });
  }, []);

  return (
    <div className="product-list-container">
      <h2>All Products</h2>
      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products available</p>
        ) : (
          products.map((product, index) => (
            <div className="product-card" key={product._id || index}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="price">₹{product.price}</p>
              <p className="brand">Brand: {product.brand}</p>
              <p className="stock">Stock: {product.countInStock}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
