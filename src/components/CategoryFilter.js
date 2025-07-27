import React, { useState } from "react";
import "./CategoryFilter.css";

const categories = [
  { id: 1, name: "All" },
  { id: 2, name: "Menstrual Care" },
  { id: 3, name: "Wellness" },
  { id: 4, name: "Safety" },
  { id: 5, name: "Health Food" },
];

const CategoryFilter = ({ onCategorySelect }) => {
  const [selected, setSelected] = useState("All");

  const handleSelect = (category) => {
    setSelected(category.name);
    if (onCategorySelect) {
      onCategorySelect(category.name);
    }
  };

  return (
    <div className="category-filter">
      <h2 className="filter-title">Women Products</h2>
      <div className="filter-buttons">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`filter-button ${
              selected === category.name ? "active" : ""
            }`}
            onClick={() => handleSelect(category)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
