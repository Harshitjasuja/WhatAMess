import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./MessMenu.css";

const MessMenu = ({ messName, onClose }) => {
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Paneer Butter Masala", price: "₹120", quantity: 0, image: "/images/paneer.jpg" },
    { id: 2, name: "Chole Bhature", price: "₹80", quantity: 0, image: "/images/chole.jpg" },
    { id: 3, name: "Dal Makhani", price: "₹90", quantity: 0, image: "/images/dal.jpg" },
    { id: 4, name: "Jeera Rice", price: "₹60", quantity: 0, image: "/images/rice.jpg" },
    { id: 5, name: "Naan", price: "₹20", quantity: 0, image: "/images/naan.jpeg" },
    { id: 6, name: "Lassi", price: "₹30", quantity: 0, image: "/images/lassi.jpg" },
  ]);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleQuantityChange = (id, delta) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const handleProceedToCart = () => {
    // Filter items with quantity > 0
    const selectedItems = menuItems.filter((item) => item.quantity > 0);
    // Navigate to Cart and pass selected items and messName as state
    navigate("/cart", { state: { selectedItems, messName } });
  };

  return (
    <div className="mess-menu-overlay">
      <div className="mess-menu-container">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="mess-menu-title">{messName} Menu</h2>
        <div className="menu-items">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-item">
              <img src={item.image} alt={item.name} className="item-image" />
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-price">{item.price}</span>
              </div>
              <div className="quantity-controls">
                <button
                  className="quantity-button"
                  onClick={() => handleQuantityChange(item.id, -1)}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  className="quantity-button"
                  onClick={() => handleQuantityChange(item.id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="order-button" onClick={handleProceedToCart}>
          Proceed Further for Order
        </button>
      </div>
    </div>
  );
};

export default MessMenu;