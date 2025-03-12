import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import SearchBar from "./components/searchbar";
import MessCard from "./components/messcard";
import WomenMode from "./components/WomenMode";
import VegNonVegToggle from "./components/VegNonveg";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Cart from "./components/Cart.js"; // Import the Cart component
import Reward from "./components/Reward"; // Import the Reward component

function Homepage() {
  return (
    <div>
      <Navbar />
      <SearchBar />
      <MessCard />
      <WomenMode />
      <VegNonVegToggle />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} /> {/* Add route for Cart Page */}
        <Route path="/rewards" element={<Reward />} /> {/* Add route for Reward Page */}
      </Routes>
    </Router>
  );
}

// eslint-disable-next-line semi
export default App;
