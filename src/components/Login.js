import React from "react";
import { Link } from "react-router-dom";
import "../components/Auth.css";
import logo from "../components/WhatAMess.png";

const Login = () => {
  return (
    <div className="auth-container">
      {/* Logo */}
      <div className="logo-container">
        <img src={logo} alt="What A Mess" className="auth-logo" />
      </div>

      {/* Login Box */}
      <div className="auth-box">
        <h2 className="auth-title">Welcome Back!</h2>

        <form className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="Enter your email" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required />
          </div>

          <div className="auth-options">
            <label className="checkbox">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn login-btn">Log In</button>
        </form>

        <p className="signup-text">
          Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
