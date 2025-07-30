// components/Header.jsx
import React, { useEffect, useState } from "react";
import { FaBars, FaTimes, FaSearch, FaUser, FaShoppingCart, FaChevronDown, FaMapMarker, FaGift, FaLeaf, FaMedkit, FaShieldAlt, FaHeart, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import "./Header.css";

function Header({ cartItemCount, toggleCart, onSearch, isWeb, windowWidth: propWindowWidth, onSignInClick }){
  const [searchText, setSearchText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const windowWidth = propWindowWidth || window.innerWidth;
  const isMobile = !isWeb || windowWidth < 768;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, []);

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
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setShowUserMenu(false);
    window.dispatchEvent(new Event("storage"));
    window.location.reload();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    onSearch(text);
  };

  return (
    <header className="header">
      <div className="header-main">
        <div className="header-left">
          {isMobile && (
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
          <h1 className="logo">NearToWomen</h1>
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
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search women's products"
            />
            <button className="search-btn">
              <FaSearch />
            </button>
          </div>
        </div>

        <div className="header-right">
          {user ? (
            <div className="user-profile">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="user-button">
                <div>
                  <span className="user-greet">Hello, {user.name}</span>
                  <span className="user-account">My Account <FaChevronDown /></span>
                </div>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <button><FaUser /> Profile</button>
                  <button><FaFileAlt /> Orders</button>
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
            <div className="returns-orders">
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
              <button><FaFileAlt /> Orders</button>
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
