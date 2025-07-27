import React, { useState } from "react";
import "./Banner.css"; // External CSS
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const bannerProducts = [
  {
    id: 1,
    title: "Menstrual Kits",
    description: "Premium menstrual care products designed for comfort and protection when you need it most.",
    image: "https://5.imimg.com/data5/ANDROID/Default/2024/7/433837471/RJ/MV/HT/38818420/product-jpeg-500x500.jpg",
    buttonText: "Shop Menstrual Care",
    color: "#e84a80",
  },
  {
    id: 2,
    title: "Women's Health Supplements",
    description: "Specially formulated vitamins and supplements to support your overall health and wellbeing.",
    image: "https://cdn.anscommerce.com/live/image/catalog/brandstore/nutrela/Womenpk.JPG",
    buttonText: "Explore Supplements",
    color: "#4acce8",
  },
  {
    id: 3,
    title: "Safety Products",
    description: "Stay safe and protected with our range of personal safety devices designed for women.",
    image: "https://rukminim3.flixcart.com/image/850/1000/k7nnrm80/sanitary-pad-pantyliner/q/e/p/sanitary-pads-30pcs-pack-of-1-regular-1-sanitary-pad-women-original-imafpugaekkn3arq.jpeg?q=90&crop=false",
    buttonText: "View Safety Range",
    color: "#4a7de8",
  },
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentProduct = bannerProducts[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerProducts.length) % bannerProducts.length);
  };

  return (
    <div className="banner">
      <div
        className="banner-background"
        style={{ backgroundImage: `url(${currentProduct.image})` }}
      >
        <div className="banner-overlay" />
        <div className="banner-arrows">
          <button className="arrow-button" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="arrow-button" onClick={nextSlide}>
            <FaChevronRight />
          </button>
        </div>

        <div className="banner-content">
          <h1 className="banner-title">{currentProduct.title}</h1>
          <p className="banner-description">{currentProduct.description}</p>
          <button
            className="banner-button"
            onClick={() => console.log(`Navigate to ${currentProduct.title}`)}
            style={{ backgroundColor: currentProduct.color }}
          >
            {currentProduct.buttonText}
          </button>
          <div className="banner-indicators">
            {bannerProducts.map((_, index) => (
              <span
                key={index}
                className={`banner-indicator ${currentSlide === index ? "active" : ""}`}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
