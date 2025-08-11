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

//category , product , cart and base url import
import{CATEGORIES_API, BASE_URL, PRODUCTS_API, ADD_TO_CART_API, USER_CART_API} from "./api/api";

function App() {
  const [showCart, setShowCart] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isWeb] = useState(true);
  
  // Add state for real products from API
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // Results returned from Header search
  const [searchResults, setSearchResults] = useState(null);
  // Categories state for real categories from database
  const [categories, setCategories] = useState([]);
  
  // Current user
  const [user, setUser] = useState(() => {
    if (localStorage.getItem("user")) {
      return JSON.parse(localStorage.getItem("user"));
    }
    return null;
  });
  

  const isAdmin = user && user.role === "admin";

  // Helper: normalize various cart payload shapes to an array of items
  const normalizeCart = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    if (data.cart && Array.isArray(data.cart.items)) return data.cart.items;
    if (Array.isArray(data.cartItems)) return data.cartItems;
    if (data.data && Array.isArray(data.data.items)) return data.data.items;
    return [];
  };


  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}${CATEGORIES_API}`);
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
      const response = await fetch(`${BASE_URL}${PRODUCTS_API}`);
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

  // Cart API helpers (for profile users)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const fetchCart = async () => {
    try {
      // Read user directly from localStorage
      const userData = localStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const userId = parsedUser?._id || parsedUser?.id;
      if (!userId) return;

      const res = await fetch(`${BASE_URL}${USER_CART_API(userId)}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      const items = normalizeCart(data);
      setCart(items);
    } catch (e) {
      console.error('Fetch cart error:', e);
      setCart([]);
    }
  };

  const addToCart = async (product) => {
    try {
      if (!user) {
        setShowSignIn(true);
        return;
      }
      
      //in the request body only send productId and quantity
      const body = JSON.stringify({productId: product._id || product.id, quantity: 1 });

      const res = await fetch(`${BASE_URL}${ADD_TO_CART_API}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body
      });

      if (!res.ok) throw new Error('Failed to add to cart');
      const data = await res.json().catch(() => null);
      const items = normalizeCart(data);
      if (items.length) {
        setCart(items);
      } else {
        await fetchCart();
      }
      setShowCart(true);
    } catch (e) {
      console.error('Add to cart error:', e);
    }
  };

  
  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        // fetch cart for new user
        fetchCart();
      } else {
        setUser(null);
        setCart([]);
      }
    };

    // Check initial state
    handleStorageChange();
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Receive search results from Header and apply in UI
  const handleSearch = (resultsOrNull) => {
    if (resultsOrNull === null) {
      setSearchResults(null);
      return;
    }
    setSearchResults(Array.isArray(resultsOrNull) ? resultsOrNull : []);
  };

  const cartItemCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

  // Filter products based on category (using category ID from database)
  const getFilteredProducts = () => {
    const source = searchResults !== null ? searchResults : products;
    if (activeCategory === "all") {
      return source;
    }
    return source.filter((product) => {
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
            setShowSignIn(false);
            fetchCart();
          }}
        />
      ) : isAdmin ? (
        <Admin />
      ) : (
        <>
          <Header
            cartItemCount={cartItemCount}
            toggleCart={() => setShowCart(true)}
            onSearch={handleSearch}
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
              onAddToCart={fetchCart}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
