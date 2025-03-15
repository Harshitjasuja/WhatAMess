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
import Cart from "./components/Cart";
import Reward from "./components/Reward";
import Footer from "./components/Footer";
import Orders from "./components/Orders";
import TrackOrder from "./components/TrackOrder"; // Import TrackOrder component

function Homepage() {
  return (
    <div>
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
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/rewards" element={<Reward />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/track-order" element={<TrackOrder />} /> {/* Route for Order Tracking Page */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
