import React, { useState } from "react";
import authService from "../api/authService";
import "./Login.css";

function Login({ onClose, onAuthenticated }){
  const [isSignUp, setIsSignUp] = useState(false);
  const [registerAsAdmin, setRegisterAsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  //form data to give the user input as an login for so that they can login and signup
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };






  //register by utility function of authservices
  const register = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      if (registerAsAdmin) {
        await authService.registerAdmin(formData);
      } else {
        await authService.registerUser(formData);
      }
      
      setSuccess("Account created successfully! Please login.");
      setIsSignUp(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };


  //login by utility function of authservices
  const login = async () => {
    try {
      setLoading(true);
      setError("");
      
      await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Trigger storage event to update header
      window.dispatchEvent(new Event("storage"));
      
      // Call the onAuthenticated callback
      if (onAuthenticated) {
        onAuthenticated();
      }
    } catch (error) {
      setError(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = () => {
    if (isSignUp) {
      register();
    } else {
      login();
    }
  };

  
  const toggleForm = () => {
    setIsSignUp((prev) => !prev);
    setRegisterAsAdmin(false);
    setFormData({ name: "", email: "", password: "" });
  };


  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1 className="auth-title">NearToWomen</h1>
          <p className="auth-tagline">Your Women's Wellness Destination</p>
        </div>

        <div className="auth-form">
          <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p>{isSignUp ? "Join our community of women" : "Sign in to your account"}</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />

          {isSignUp && (
            <div className="register-options">
              <button
                className={`option-btn ${!registerAsAdmin ? "selected" : ""}`}
                onClick={() => setRegisterAsAdmin(false)}
              >
                User
              </button>
              <button
                className={`option-btn ${registerAsAdmin ? "selected" : ""}`}
                onClick={() => setRegisterAsAdmin(true)}
              >
                Admin
              </button>
            </div>
          )}

          <button
            className={`auth-submit ${loading ? "disabled" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>

          <p className="toggle-link" onClick={toggleForm}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span>{isSignUp ? "Sign In" : "Sign Up"}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
