// components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import authService from "../api/authService";
import { FaBars, FaTimes, FaSearch, FaUser, FaShoppingCart, FaChevronDown, FaMapMarker, FaGift, FaLeaf, FaMedkit, FaShieldAlt, FaHeart, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import "./Header.css";
import { BASE_URL, PRODUCT_SEARCH_API } from "../api/api";

function Header({ cartItemCount, toggleCart, onSearch, isWeb, windowWidth: propWindowWidth, onSignInClick, onOrdersClick }){
  //to search the product
  const [searchText, setSearchText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const windowWidth = propWindowWidth || window.innerWidth;
  const isMobile = !isWeb || windowWidth < 768;

  // Debounce and request cancellation refs
  const debounceRef = useRef(null);
  const requestControllerRef = useRef(null);

  //useEffect to get the user data from the local storage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, []);

  //useEffect to listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userData && token) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };
    //listen for storage changes
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  //logout by utility function of authservices
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setShowUserMenu(false);
    window.dispatchEvent(new Event("storage"));
    window.location.reload();
  };

  const performSearch = async (text, minPrice, maxPrice, category) => {
    const trimmed = (text || "").trim();

    // Reset only when ALL filters are empty
    const noFilters =
      trimmed === "" &&
      (minPrice === undefined || minPrice === null || minPrice === "") &&
      (maxPrice === undefined || maxPrice === null || maxPrice === "") &&
      (category === undefined || category === null || category === "");

    if (noFilters) {
      setSearchText("");
      onSearch(null);
      return;
    }

    // Enforce min 2 characters when only text is used
    const onlyText = trimmed !== "" &&
      (minPrice === undefined || minPrice === null || minPrice === "") &&
      (maxPrice === undefined || maxPrice === null || maxPrice === "") &&
      (category === undefined || category === null || category === "");
    if (onlyText && trimmed.length < 2) {
      return; // wait for more input to avoid spamming server
    }

    // Cancel any in-flight request
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }
    const controller = new AbortController();
    requestControllerRef.current = controller;

    const params = new URLSearchParams();
    if (trimmed !== "") params.set("query", trimmed);
    if (minPrice !== undefined && minPrice !== null && minPrice !== "")
      params.set("minPrice", String(minPrice));
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "")
      params.set("maxPrice", String(maxPrice));
    if (category !== undefined && category !== null && category !== "")
      params.set("category", String(category));

    try {
      const res = await fetch(`${BASE_URL}${PRODUCT_SEARCH_API}?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();
      onSearch(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === 'AbortError') return; // ignore aborted requests
      console.error("Search error:", err);
      onSearch([]);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
  };

  // Debounced trigger to reduce 429 rate-limit issues
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(searchText);
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <header className="header">
      <div className="header-main">
        <div className="header-left">
          {isMobile && (
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
          <h1 className="logo" onClick={() => window.location.href = '/'}>NearToWomen</h1>
        </div>

        <div className="header-center">
          <div className="search-bar">
            {!isMobile && (
              <div className="category">
                <span>All</span>
                <FaChevronDown className="dropdown-icon" />
              </div>
            )}
            <input
              type="text"
              value={searchText}
              onChange={handleInputChange}
              placeholder="Search women's products"
            />
            <button className="search-btn" onClick={() => performSearch(searchText)}>
              <FaSearch />
            </button>
          </div>
        </div>

        <div className="header-right">
          {user ? (
            <div className="user-profile">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="user-button">
                <div>
                  <span className="user-greet">Hello, {user.name}<FaChevronDown /></span>
                </div>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <button><FaUser /> Profile</button>
                  <button onClick={onOrdersClick}><FaFileAlt /> Orders</button>
                  <button><FaHeart /> Wishlist</button>
                  <hr />
                  <button className="logout" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            !isMobile && (
            <div className="sign-in-vertical" onClick={onSignInClick}>
                <span className="user-greet">Hello! Women</span>
                <span className="user-account">Sign In <FaUser /></span>
            </div>
            )
          )}
            {!isMobile && (
            <div className="returns-orders" onClick={onOrdersClick} style={{ cursor: 'pointer' }}>
                <span className="user-greet">Returns</span>
                <span className="user-account">& Orders</span>
            </div>
            )}

          <button className="cart-btn" onClick={toggleCart}>
            <FaShoppingCart />
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            {!isMobile && <span className="cart-label">Cart</span>}
          </button>
        </div>
      </div>

      {menuOpen && isMobile && (
        <div className="mobile-menu">
          {user ? (
            <>
              <button><FaUser /> My Account</button>
              <button onClick={onOrdersClick}><FaFileAlt /> Orders</button>
              <button><FaHeart /> Wishlist</button>
              <hr />
              <button className="logout" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
            </>
          ) : (
            <button onClick={onSignInClick}><FaUser /> Sign In</button>
          )}
          <button><FaGift /> Today's Deals</button>
          <button><FaLeaf /> Wellness</button>
          <button><FaMedkit /> Health Products</button>
          <button><FaShieldAlt /> Safety</button>
        </div>
      )}

      {(!isMobile) && (
        <div className="sub-header">
          <div className="deliver-info">
            <FaMapMarker /> Deliver to your location
          </div>
          <div className="sub-nav">
            <span>Today's Deals</span>
            <span>Customer Service</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
