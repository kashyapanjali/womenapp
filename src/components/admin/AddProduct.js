import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL, PRODUCTS_API, CATEGORIES_API } from "../../api/api";
import "./AddProduct.css";


const AddProduct = () => {
  const [productData, setProductData] = useState({
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Fetch categories from backend
  useEffect(() => {  //this for all users 
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}${CATEGORIES_API}`);
        setCategories(response.data);
      } catch (error) {
        setMessage("Failed to load categories");
      }
    };
    fetchCategories();
    
    // Debug: Check authentication status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (user) {
      // Debug: Check user data
      console.log('User data:', JSON.parse(user));
    }
    
    // Test JWT token decoding (client-side)
    if (token) {
      try {
        // Debug: Check JWT payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT payload:', payload);
      } catch (e) {
        console.log('Failed to decode JWT:', e);
      }
    }
  }, []);

  // Handle dropdown change
  const handleCategoryChange = (e) => {
    if (e.target.value === "__new__") {
      setShowNewCategoryInput(true);
      setProductData({ ...productData, category: "" });
    } else {
      setShowNewCategoryInput(false);
      setProductData({ ...productData, category: e.target.value });
    }
  };


  // Handle new category submit
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}${CATEGORIES_API}`, {
        name: newCategoryName.trim(),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCategories([...categories, response.data]);
      setProductData({ ...productData, category: response.data._id });
      setShowNewCategoryInput(false);
      setNewCategoryName("");
    } catch (error) {
      setMessage("Failed to add category");
    }
  };



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData({
      ...productData,
      [name]: type === "checkbox" ? checked : value,
    });
  };


  //add product by admin function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validate required fields
      if (!productData.name || !productData.description || !productData.price || !productData.category || !productData.countInStock) {
        setMessage("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Convert price and countInStock to numbers
      const productToSubmit = {
        ...productData,
        price: Number(productData.price),
        countInStock: Number(productData.countInStock)
      };

      const token = localStorage.getItem('token');
      
      //this for admin only to add the product
      const response = await axios.post(`${BASE_URL}${PRODUCTS_API}`, productToSubmit, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMessage("✅ " + response.data.message);
      
      // Trigger product update event for ecommerce page
      window.dispatchEvent(new Event('productsUpdated'));
      
      // Reset form
      setProductData({
        name: "",
        description: "",
        image: "",
        brand: "",
        price: "",
        category: "",
        countInStock: "",
        isFeatures: false,
      });
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="product-form">
        <input type="text" name="name" value={productData.name} onChange={handleChange} placeholder="Product Name" required />
        <input type="text" name="description" value={productData.description} onChange={handleChange} placeholder="Description" required />
        <input type="text" name="image" value={productData.image} onChange={handleChange} placeholder="Image URL" />
        <input type="text" name="brand" value={productData.brand} onChange={handleChange} placeholder="Brand" />
        <input type="number" name="price" value={productData.price} onChange={handleChange} placeholder="Price" required />
        <input type="number" name="countInStock" value={productData.countInStock} onChange={handleChange} placeholder="Stock Count" required />

        <select name="category" value={productData.category} onChange={handleCategoryChange} required>
          <option value="">Select Category</option>
          {categories
            .filter((cat) => cat.name !== "New Category")
            .map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          <option value="__new__">+ Create new category...</option>
        </select>
        {showNewCategoryInput && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              required
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleAddCategory} style={{ minWidth: 60 }}>Add</button>
            <button type="button" onClick={() => setShowNewCategoryInput(false)} style={{ minWidth: 60 }}>Cancel</button>
          </div>
        )}
        <label className="checkbox">
          <input
            type="checkbox"
            name="isFeatures"
            checked={productData.isFeatures}
            onChange={handleChange}
          />
          Featured Product?
        </label>
        <div className="btn">
          <button type="submit" disabled={loading}>
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
