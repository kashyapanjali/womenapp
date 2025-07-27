import React from "react";
import "./CategoryFilter.css";

const categories = [
  { id: "all", name: "All" },
  { id: "menstrual", name: "Menstrual Care" },
  { id: "wellness", name: "Wellness" },
  { id: "safety", name: "Safety" },
  { id: "food", name: "Health Food" },
];

const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="category-filter">
      <h2 className="filter-title">Women Products</h2>
      <div className="filter-buttons">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`filter-button ${activeCategory === category.id ? "active" : ""}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
