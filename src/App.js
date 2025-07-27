// App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Banner from "./components/Banner";
import ProductList from "./components/ProductList";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import SignInSignup from "./components/Login";
import CategoryFilter from "./components/CategoryFilter";
import Admin from "./components/admin/AddProduct";
import { products } from "./data/product";

if (typeof window !== "undefined") {
  localStorage.clear();
}

function App() {
  const [showCart, setShowCart] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isWeb, setIsWeb] = useState(true);

  const [user, setUser] = useState(() => {
    if (localStorage.getItem("user")) {
      return JSON.parse(localStorage.getItem("user"));
    }
    return null;
  });
  const isAdmin = user && user.role === "admin";

  const womenCategories = [
    { id: "all", name: "All Products" },
    { id: "menstrual", name: "Menstrual Care" },
    { id: "safety", name: "Safety" },
    { id: "wellness", name: "Wellness" },
    { id: "food", name: "Health Foods" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem.quantity === 1) {
      setCart(cart.filter((item) => item.id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const safetyProducts = products.filter((p) => p.category === "safety");
  const wellnessProducts = products.filter((p) => p.category === "wellness");

  return (
    <div className="app-container">
      {showSignIn ? (
        <SignInSignup
          onClose={() => setShowSignIn(false)}
          onAuthenticated={() => {
            const newUser = JSON.parse(localStorage.getItem("user"));
            setUser(newUser);
            setIsAuthenticated(true);
            setShowSignIn(false);
          }}
        />
      ) : isAdmin ? (
        <Admin />
      ) : (
        <>
          <Header
            cartItemCount={cartItemCount}
            toggleCart={() => setShowCart(true)}
            onSearch={setSearchTerm}
            isWeb={isWeb}
            windowWidth={windowWidth}
            onSignInClick={() => setShowSignIn(true)}
          />
          <div className="main-content">
            <Banner isWeb={isWeb} />
            <CategoryFilter
              categories={womenCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              isWeb={isWeb}
            />

            <ProductList
              products={
                activeCategory === "all"
                  ? products
                  : products.filter((product) => product.category === activeCategory)
              }
              categories={womenCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchTerm={searchTerm}
              addToCart={addToCart}
              isWeb={isWeb}
              windowWidth={windowWidth}
            />
          </div>

           {/* footer section */}
          <Footer isWeb={isWeb} />

          {showCart && (
            <Cart
              cart={cart}
              closeCart={() => setShowCart(false)}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              isWeb={isWeb}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
