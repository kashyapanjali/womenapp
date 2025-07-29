//render two components of addproduct and poductlist

import React, { useState } from "react";
import AddProduct from "./AddProduct";
import ProductList from "./AdminProductList";
import "./Admin.css";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("add");

  return (
    <div className="admin-container">
      <div className="admin-nav">
        <button
          className={activeSection === "add" ? "active" : ""}
          onClick={() => setActiveSection("add")}
        >
          Add Product
        </button>
        <button
          className={activeSection === "list" ? "active" : ""}
          onClick={() => setActiveSection("list")}
        >
          Product List
        </button>
      </div>

      <div className="admin-content">
        {activeSection === "add" && <AddProduct />}
        {activeSection === "list" && <ProductList />}
      </div>
    </div>
  );
};

export default Admin;
