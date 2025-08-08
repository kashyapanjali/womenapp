import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL, PRODUCTS_API } from "../../api/api";
import "./AdminProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    image: "",
    brand: "",
    price: "",
    category: "",
    countInStock: "",
    isFeatures: false,
  });
  const [categories, setCategories] = useState([]);
  const [editMessage, setEditMessage] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${BASE_URL}${PRODUCTS_API}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {  //fetch the category
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch categories for edit form
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/category`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  //this function for the delete of product by admin
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${BASE_URL}${PRODUCTS_API}/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setProducts(products.filter(product => product._id !== productId));
        
        // Trigger product update event for ecommerce page
        window.dispatchEvent(new Event('productsUpdated'));
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
      }
    }
  };

  // Handle edit product - open edit form
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name || "",
      description: product.description || "",
      image: product.image || "",
      brand: product.brand || "",
      price: product.price || "",
      category: product.category?._id || product.category || "",
      countInStock: product.countInStock || "",
      isFeatures: product.isFeatures || false,
    });
    setEditMessage("");
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };


  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage("");

    try {
      // Validate required fields
      if (!editFormData.name || !editFormData.description || !editFormData.price || !editFormData.category || !editFormData.countInStock) {
        setEditMessage("Please fill in all required fields");
        setEditLoading(false);
        return;
      }

      // Convert price and countInStock to numbers
      const productToUpdate = {
        ...editFormData,
        price: Number(editFormData.price),
        countInStock: Number(editFormData.countInStock)
      };

      const token = localStorage.getItem('token');
      
      // Update the product
      const response = await axios.put(`${BASE_URL}${PRODUCTS_API}/${editingProduct._id}`, productToUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setEditMessage("✅ Product updated successfully!");
      
      // Trigger product update event for ecommerce page
      window.dispatchEvent(new Event('productsUpdated'));
      
      // Refresh the product list
      fetchProducts();
      
      // Close the edit form after a short delay
      setTimeout(() => {
        setEditingProduct(null);
        setEditMessage("");
      }, 1500);
      
    } catch (error) {
      setEditMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setEditLoading(false);
    }
  };


  // Handle close edit form
  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditMessage("");
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
      {editingProduct ? (
        // Edit Form
        <div style={{ 
          maxWidth: '500px', 
          margin: '40px auto', 
          padding: '20px',
          border: '2px solid #e684a3',
          borderRadius: '10px',
          backgroundColor: '#fff0f5',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h2 style={{ margin: 0, color: '#a8336e' }}>Edit Product</h2>
            <button 
              onClick={handleCloseEdit}
              style={{ 
                background: '#e84a80', 
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕ Close
            </button>
          </div>
          
          {editMessage && (
            <p style={{ 
              textAlign: 'center', 
              marginBottom: '10px', 
              fontWeight: 'bold', 
              color: '#444' 
            }}>
              {editMessage}
            </p>
          )}
          
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" 
              name="name" 
              value={editFormData.name} 
              onChange={handleEditChange} 
              placeholder="Product Name" 
              required 
              style={{ padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
            <input 
              type="text" 
              name="description" 
              value={editFormData.description} 
              onChange={handleEditChange} 
              placeholder="Description" 
              required 
              style={{ padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
            <input 
              type="text" 
              name="image" 
              value={editFormData.image} 
              onChange={handleEditChange} 
              placeholder="Image URL" 
              style={{ padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
            <input 
              type="text" 
              name="brand" 
              value={editFormData.brand} 
              onChange={handleEditChange} 
              placeholder="Brand" 
              style={{ padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
            <input 
              type="number" 
              name="price" 
              value={editFormData.price} 
              onChange={handleEditChange} 
              placeholder="Price" 
              required 
              style={{ padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
            <input 
              type="number" 
              name="countInStock" 
              value={editFormData.countInStock} 
              onChange={handleEditChange} 
              placeholder="Stock Count" 
              required 
              style={{ padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
            />

            <select 
              name="category" 
              value={editFormData.category} 
              onChange={handleEditChange} 
              required
              style={{ padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', marginTop: '10px' }}>
              <input
                type="checkbox"
                name="isFeatures"
                checked={editFormData.isFeatures}
                onChange={handleEditChange}
              />
              Featured Product?
            </label>
            
            <button 
              type="submit" 
              disabled={editLoading}
              style={{ 
                padding: '10px', 
                backgroundColor: '#a8336e', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginTop: '10px'
              }}
            >
              {editLoading ? "Updating Product..." : "Update Product"}
            </button>
          </form>
        </div>
      ) : (
        // Product List
        <>
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
                   <div className="product-info-container">
                     <div className="product-details">
                       <h3>{product.name}</h3>
                       <p className="price">₹{product.price}</p>
                       <p className="brand">Brand: {product.brand || 'N/A'}</p>
                       <p className="stock">Stock: {product.countInStock}</p>
                     </div>
                     
                     <div className="product-actions">
                       <button 
                         className="edit-btn" 
                         onClick={() => handleEditProduct(product)}
                       >
                         Edit
                       </button>
                       <button 
                         className="delete-btn" 
                         onClick={() => handleDeleteProduct(product._id)}
                       >
                         Delete
                       </button>
                     </div>
                   </div>
                 </div>
               ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;
