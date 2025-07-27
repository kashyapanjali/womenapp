// components/Footer.jsx
import React, { useEffect, useState } from "react";
import "./Footer.css";

const Footer = ({ isWeb }) => {
  const currentYear = new Date().getFullYear();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = !isWeb || windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`simple-footer ${isMobile ? "mobile" : "desktop"}`}>
      <div className="simple-footer-content">
        <p className="footer-title">NearToWomen</p>
        <p className="footer-copy">© {currentYear} NearToWomen. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;