import React from "react";
import "./CategoryFilter.css";

//here two props passed from productList.js
function CategoryFilter ({ categories, activeCategory, setActiveCategory }){
  return (
    <div className="category-filter">
      <h2 className="filter-title">Women Products</h2>
      <div className="filter-buttons">
        {/* Always show "All" option */}
        <button
          key="all"
          className={`filter-button ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        
        {/* Show categories from database */}
        {categories.map((category) => (
          <button
            key={category._id}
            className={`filter-button ${activeCategory === category._id ? "active" : ""}`}
            onClick={() => setActiveCategory(category._id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
