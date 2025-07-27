import React from "react";
import "./Button.css";

export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  onClick,
  className = "",
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
