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
import Checkout from "./components/Checkout";
import Orders from "./components/Orders";

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
    const scope = sessionStorage.getItem('authScope') === 'session' ? 'session' : 'local';
    const fromStore = scope === 'session' ? sessionStorage.getItem('user') : localStorage.getItem('user');
    if (fromStore) return JSON.parse(fromStore);
    return null;
  });
  
  // Simple checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [showOrders, setShowOrders] = useState(false);

  const isAdmin = user && user.role === "admin";
  const getScope = () => (sessionStorage.getItem('authScope') === 'session' ? 'session' : 'local');
  const getViewOverride = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = (params.get('view') || '').toLowerCase();
      if (view === 'shop' || view === 'store' || view === 'ecom') return 'shop';
      if (view === 'admin' || view === 'dashboard') return 'admin';
      return null;
    } catch (_) {
      return null;
    }
  };
  const viewOverride = getViewOverride();
  const preferredView = (() => {
    try {
      const scope = getScope();
      return (scope === 'session' ? sessionStorage.getItem('preferredView') : localStorage.getItem('preferredView')) || null;
    } catch (_) {
      return null;
    }
  })();
  // by the Admin session it recognize and give admin pannel
  const showAdminUI = isAdmin && (viewOverride === 'admin' || preferredView === 'admin');

  // normalize various cart payload shapes to an array of items
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
      // Set default categories if backend is not available
      setCategories([
        { _id: '1', name: 'Menstrual Care' },
        { _id: '2', name: 'Health Supplements' },
        { _id: '3', name: 'Safety Products' }
      ]);
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
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${BASE_URL}${PRODUCTS_API}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      if (error.name === 'AbortError') {
        setProductsError('Request timed out. The server is taking too long to respond.');
      } else if (error.message.includes('Failed to fetch')) {
        setProductsError('Unable to connect to server. Please check your internet connection.');
      } else {
        setProductsError('Backend server not available. Please try again later.');
      }
      
      // Set some sample products for testing
      setProducts([
        {
          _id: '1',
          name: 'Premium Sanitary Pads',
          description: 'Comfortable and reliable protection',
          price: 299,
          image: 'https://5.imimg.com/data5/ANDROID/Default/2024/7/433837471/RJ/MV/HT/38818420/product-jpeg-500x500.jpg',
          category: { _id: '1', name: 'Menstrual Care' },
          countInStock: 50
        },
        {
          _id: '2',
          name: 'Women\'s Health Vitamins',
          description: 'Essential vitamins for women\'s health',
          price: 599,
          image: 'https://cdn.anscommerce.com/live/image/catalog/brandstore/nutrela/Womenpk.JPG',
          category: { _id: '2', name: 'Health Supplements' },
          countInStock: 30
        }
      ]);
    } finally {
      setProductsLoading(false);
    }
  };


  // Cart API helpers (for profile users)
  const getAuthHeaders = () => {
    const scope = sessionStorage.getItem('authScope') === 'session' ? 'session' : 'local';
    const token = scope === 'session' ? sessionStorage.getItem('token') : localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };


  const fetchCart = async () => {
    try {
      // Read user directly from the chosen scope
      const scope = sessionStorage.getItem('authScope') === 'session' ? 'session' : 'local';
      const userData = scope === 'session' ? sessionStorage.getItem('user') : localStorage.getItem('user');
      const token = scope === 'session' ? sessionStorage.getItem('token') : localStorage.getItem('token');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const userId = parsedUser?._id || parsedUser?.id;
      
      // Only fetch cart if user is logged in and has valid token
      if (!userId || !token) {
        console.log('User not logged in, skipping cart fetch');
        return;
      }

      const res = await fetch(`${BASE_URL}${USER_CART_API(userId)}`, { headers: getAuthHeaders() });
      if (!res.ok) {
        if (res.status === 401) {
          console.log('User not authorized, clearing auth data');
          // Clear invalid auth data
          if (scope === 'session') {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          setUser(null);
          setCart([]);
          return;
        }
        throw new Error('Failed to fetch cart');
      }
      const data = await res.json();
      const items = normalizeCart(data);
      setCart(items);
    } catch (e) {
      console.error('Fetch cart error:', e);
    }
  };

  const addToCart = async (product) => {
    try {
      if (!user) {
        setShowSignIn(true);
        return;
      }
      
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

  
  // Buy Now handler
  const handleBuyNow = (product) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    setCheckoutProduct(product || null);
    setShowCheckout(true);
  };

  // Proceed to checkout from cart
  const handleCartCheckout = () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    setCheckoutProduct(null); // whole cart
    setShowCart(false);
    setShowCheckout(true);
  };

  // Handle product click navigation - filter products by category or search
  const handleProductClick = (product) => {
    if (product.category) {
      // If product has a category, filter by that category
      setActiveCategory(product.category._id || product.category);
    } else if (product.name) {
      // If no category, search by product name
      handleSearch(product.name);
    }
    // Close cart if it's open
    setShowCart(false);
  };
  
  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      const scope = sessionStorage.getItem('authScope') === 'session' ? 'session' : 'local';
      const userData = scope === 'session' ? sessionStorage.getItem('user') : localStorage.getItem('user');
      const token = scope === 'session' ? sessionStorage.getItem('token') : localStorage.getItem('token');
      
      if (userData && token) {
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
    // When search is active, show search results as-is and ignore category filter
    if (searchResults !== null) {
      return searchResults;
    }
    if (activeCategory === "all") {
      return products;
    }
    return products.filter((product) => {
      const productCategory = product.category?._id || product.category;
      return productCategory === activeCategory;
    });
  };

  const filteredProducts = getFilteredProducts();

  // Close checkout view
  const closeCheckout = () => {
    setShowCheckout(false);
    setCheckoutProduct(null);
  };

  return (
    <div className="app-container">
      {showSignIn ? (
        <SignInSignup
          onClose={() => setShowSignIn(false)}
          onAuthenticated={() => {
            const scope = sessionStorage.getItem('authScope') === 'session' ? 'session' : 'local';
            const newUser = JSON.parse((scope === 'session' ? sessionStorage.getItem("user") : localStorage.getItem("user")) || 'null');
            setUser(newUser);
            setShowSignIn(false);
            fetchCart();
          }}
        />
      ) : showAdminUI ? (
        <Admin />
      ) : showCheckout ? (
        <>
          <Header
            cartItemCount={cartItemCount}
            toggleCart={() => setShowCart(true)}
            onSearch={handleSearch}
            isWeb={isWeb}
            windowWidth={windowWidth}
            onSignInClick={() => setShowSignIn(true)}
            onOrdersClick={() => setShowOrders(true)}
          />
          <div className="main-content">
            <Checkout 
              product={checkoutProduct}
              cartItems={cart}
              onClose={closeCheckout}
              onOrderPlaced={() => {
                closeCheckout();
                setShowOrders(true);
              }}
            />
          </div>
          <Footer isWeb={isWeb} />
        </>
      ) : showOrders ? (
        <>
          <Header
            cartItemCount={cartItemCount}
            toggleCart={() => setShowCart(true)}
            onSearch={handleSearch}
            isWeb={isWeb}
            windowWidth={windowWidth}
            onSignInClick={() => setShowSignIn(true)}
            onOrdersClick={() => setShowOrders(true)}
          />
          <div className="main-content">
            <Orders onBack={() => setShowOrders(false)} />
          </div>
          <Footer isWeb={isWeb} />
          {showCart && (
            <Cart
              cart={cart}
              closeCart={() => setShowCart(false)}
              onAddToCart={fetchCart}
              onCheckout={handleCartCheckout}
              onProductClick={handleProductClick}
            />
          )}
        </>
      ) : (
        <>
          <Header
            cartItemCount={cartItemCount}
            toggleCart={() => setShowCart(true)}
            onSearch={handleSearch}
            isWeb={isWeb}
            windowWidth={windowWidth}
            onSignInClick={() => setShowSignIn(true)}
            onOrdersClick={() => setShowOrders(true)}
          />
          <div className="main-content">
            <Banner isWeb={isWeb} />
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              isWeb={isWeb}
              windowWidth={windowWidth}
            />

            {productsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #e84a80',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ margin: 0, color: '#666' }}>Loading products...</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
                    This may take a moment due to server cold start
                  </p>
                </div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
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
                onBuyNow={handleBuyNow}
                onProductClick={handleProductClick}
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
              onCheckout={handleCartCheckout}
              onProductClick={handleProductClick}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
