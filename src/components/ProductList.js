import React from "react";
import "./ProductList.css";
import ProductCard from "./ProductCard";

const sampleProducts = [
  {
    id: 1,
    name: "Menstrual Kit",
    description: "Complete care for periods",
    price: 299,
    image:
      "https://5.imimg.com/data5/ANDROID/Default/2024/7/433837471/RJ/MV/HT/38818420/product-jpeg-500x500.jpg",
  },
  {
    id: 2,
    name: "Safety Product",
    description: "Essential safety pack",
    price: 499,
    image:
      "https://rukminim3.flixcart.com/image/850/1000/k7nnrm80/sanitary-pad-pantyliner/q/e/p/sanitary-pads-30pcs-pack-of-1-regular-1-sanitary-pad-women-original-imafpugaekkn3arq.jpeg?q=90&crop=false",
  },
  {
    id: 3,
    name: "Multivitamin Tablets",
    description: "Daily dose of nutrients",
    price: 199,
    image: "https://www.jiomart.com/images/product/original/rvnkfls72e/...",
  },
];

const ProductList = ({ onAddToCart }) => {
  return (
    <div className="product-list">
      {sampleProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductList;
