import React, { useEffect, useState } from "react";
import productService from "../../api/productService";
import "./AdminProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products", error);
      setError("Failed to load products");
      // For testing, add dummy products
      setProducts([
        {
          _id: '1',
          name: 'Sample Product',
          price: 29.99,
          brand: 'Sample Brand',
          countInStock: 10,
          image: 'https://placehold.co/200x200'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter(product => product._id !== productId));
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="product-list-container">
        <h2>All Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-container">
        <h2>All Products</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>All Products ({products.length})</h2>
        <button onClick={fetchProducts} className="refresh-btn">
          Refresh
        </button>
      </div>
      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products available</p>
        ) : (
          products.map((product, index) => (
            <div className="product-card" key={product._id || index}>
              <img src={product.image || "https://placehold.co/200x200"} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="price">₹{product.price}</p>
              <p className="brand">Brand: {product.brand || 'N/A'}</p>
              <p className="stock">Stock: {product.countInStock}</p>
              <div className="product-actions">
                <button className="edit-btn">Edit</button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteProduct(product._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
