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

//Admin Dashboard
import Admin from "./components/admin/Admin";

// Remove dummy data import - we'll fetch from API
// import { products } from "./data/product";


// Remove the localStorage.clear() - this was preventing authentication from persisting

function App() {
  const [showCart, setShowCart] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isWeb, setIsWeb] = useState(true);
  
  // Add state for real products from API
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");


  //it can define which is admin or not
  const [user, setUser] = useState(() => {
    if (localStorage.getItem("user")) {
      return JSON.parse(localStorage.getItem("user"));
    }
    return null;
  });

  const isAdmin = user && user.role === "admin";

  // Categories state for real categories from database
  const [categories, setCategories] = useState([]);
  
  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/category');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");
      const response = await fetch('http://localhost:3000/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductsError('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    // Check initial state
    handleStorageChange();

    // Listen for storage events
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Listen for product updates from admin panel
  useEffect(() => {
    const handleProductUpdate = () => {
      fetchProducts();
    };

    // Listen for custom event when products are updated
    window.addEventListener('productsUpdated', handleProductUpdate);
    return () => window.removeEventListener('productsUpdated', handleProductUpdate);
  }, []);

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

  // Filter products based on category (using category ID from database)
  const getFilteredProducts = () => {
    if (activeCategory === "all") {
      return products;
    }
    return products.filter((product) => {
      // Check if product has category object (from populated data) or category ID
      const productCategory = product.category?._id || product.category;
      return productCategory === activeCategory;
    });
  };

  const filteredProducts = getFilteredProducts();

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
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              isWeb={isWeb}
            />

            {productsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading products...</p>
              </div>
            ) : productsError ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                <p>{productsError}</p>
                <button onClick={fetchProducts} style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#e84a80', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  Retry
                </button>
              </div>
            ) : (
              <ProductList
                products={filteredProducts}
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchTerm={searchTerm}
                onAddToCart={addToCart}
                isWeb={isWeb}
                windowWidth={windowWidth}
              />
            )}
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
