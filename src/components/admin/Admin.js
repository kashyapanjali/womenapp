//render two components of addproduct and poductlist

import React, { useState } from "react";
import AddProduct from "./AddProduct";
import ProductList from "./AdminProductList";
import Order from "./Order";
import UsersDetail from "./UsersDetail";
import "./Admin.css";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("add");

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event("storage"));
    window.location.reload();
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="admin-nav">

        {/* add product by admin */}
        <button
          className={activeSection === "add" ? "active" : ""}
          onClick={() => setActiveSection("add")}
        >
          Add Product
        </button>

        {/* Product list in stock */}
        <button
          className={activeSection === "list" ? "active" : ""}
          onClick={() => setActiveSection("list")}
        >
          Product List
        </button>

        {/* Order list of customers */}
        <button className={activeSection === "orderlist"?"active":""}
        onClick={()=>setActiveSection("orderlist")}>
          OrderList
        </button>

        {/* to show the users or customer details*/}
        <button className={activeSection === "userdetail"?"active":""}
        onClick={()=>setActiveSection("userdetail")}>
          Customers
        </button>
      </div>

      <div className="admin-content">
        {activeSection === "add" && <AddProduct />}
        {activeSection === "list" && <ProductList />}
        {activeSection === "orderlist"&&<Order/>}
        {activeSection === "userdetail"&&<UsersDetail/>}
      </div>
    </div>
  );
};

export default Admin;
