import React from "react";
import { FaHome, FaClipboardList, FaShoppingCart, FaGift, FaUserCircle } from "react-icons/fa";
import logo from "../components/WhatAMess.png";
import "./Navbar.css"; // Custom styling

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <img src={logo} alt="What A Mess Logo" className="logo" />
        </a>
        <div className="nav-container">
          <ul className="navbar-nav nav-box">
            <li className="nav-item">
              <a className="nav-link" href="/home">
                <FaHome className="nav-icon" />
                <span>Home</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/orders">
                <FaClipboardList className="nav-icon" />
                <span>Orders</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/cart">
                <FaShoppingCart className="nav-icon" />
                <span>Cart</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/rewards">
                <FaGift className="nav-icon" />
                <span>Rewards</span>
              </a>
            </li>
            <li className="nav-item user-item">
              <a className="nav-link user-link" href="/profile">
                <FaUserCircle className="nav-icon" />
                <span>User</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;