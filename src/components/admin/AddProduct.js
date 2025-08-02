import React, { useState, useEffect } from "react";
import productService from "../../api/productService";
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

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // For testing, add dummy categories
        setCategories([
          { _id: '1', name: 'Menstrual Care' },
          { _id: '2', name: 'Safety' },
          { _id: '3', name: 'Wellness' },
          { _id: '4', name: 'Health Food' }
        ]);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData({
      ...productData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validate required fields
      if (!productData.name || !productData.price || !productData.category || !productData.countInStock) {
        setMessage("Please fill in all required fields");
        return;
      }

      // Convert price and countInStock to numbers
      const productToSubmit = {
        ...productData,
        price: Number(productData.price),
        countInStock: Number(productData.countInStock)
      };

      const result = await productService.addProduct(productToSubmit);
      setMessage(result.message);
      
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
      setMessage("❌ " + error.message);
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
        <input type="text" name="description" value={productData.description} onChange={handleChange} placeholder="Description" />
        <input type="text" name="image" value={productData.image} onChange={handleChange} placeholder="Image URL" />
        <input type="text" name="brand" value={productData.brand} onChange={handleChange} placeholder="Brand" />
        <input type="number" name="price" value={productData.price} onChange={handleChange} placeholder="Price" required />
        <input type="number" name="countInStock" value={productData.countInStock} onChange={handleChange} placeholder="Stock Count" required />

        <select name="category" value={productData.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

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
