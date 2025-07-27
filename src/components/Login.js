import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setFormData({ name: "", email: "", password: "" });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login/signup
    alert(`${isSignUp ? "Sign Up" : "Sign In"} Successful!`);
    if (onLogin) onLogin(formData);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>

        {isSignUp && (
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="auth-btn">
          {isSignUp ? "Create Account" : "Login"}
        </button>

        <p className="auth-toggle">
          {isSignUp
            ? "Already have an account?"
            : "Don't have an account?"}
          <button type="button" onClick={toggleMode}>
            {isSignUp ? " Sign In" : " Sign Up"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
