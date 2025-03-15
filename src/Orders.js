import React, { useState } from "react";
import "./Orders.css"; // Import CSS for styling
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const navigate = useNavigate();
  
  // State to manage the selected tab
  const [activeTab, setActiveTab] = useState("current");

  // Sample order data (you can replace it with dynamic data from a backend)
  const currentOrder = {
    restaurant: "Spice Garden",
    time: "Today, 7:15 PM",
    deliveryTime: "25-35 min",
    address: "123 Main Street, Apt 4B",
    status: "On the way",
    items: [
      { name: "Butter Chicken", quantity: 1, price: 299 },
      { name: "Garlic Naan", quantity: 2, price: 100 },
      { name: "Vegetable Biryani", quantity: 1, price: 250 },
    ],
  };

  const previousOrders = [
    {
      restaurant: "Tandoori House",
      time: "March 10, 6:30 PM",
      total: 450,
      items: ["Paneer Tikka", "Tandoori Roti", "Dal Makhani"],
    },
    {
      restaurant: "Chaat Corner",
      time: "March 5, 4:00 PM",
      total: 220,
      items: ["Pani Puri", "Dahi Puri"],
    },
  ];

  return (
    <div className="orders-container">
      {/* Tab Buttons */}
      <div className="tab-buttons">
        <button 
          className={activeTab === "current" ? "active" : ""} 
          onClick={() => setActiveTab("current")}
        >
          Current Order
        </button>
        <button 
          className={activeTab === "history" ? "active" : ""} 
          onClick={() => setActiveTab("history")}
        >
          Order History
        </button>
      </div>

      {/* Current Order Section */}
      {activeTab === "current" && (
        <div className="order-card">
          <h2>{currentOrder.restaurant}</h2>
          <p><b>{currentOrder.time}</b></p>
          <p>Estimated Delivery: {currentOrder.deliveryTime}</p>
          <p>{currentOrder.address}</p>
          <p><b>Status: {currentOrder.status}</b></p>

          <h3>Order Items</h3>
          <ul>
            {currentOrder.items.map((item, index) => (
              <li key={index}>
                {item.quantity}x {item.name} - ₹{item.price}
              </li>
            ))}
          </ul>

          <h3>Total: ₹{currentOrder.items.reduce((sum, item) => sum + item.price, 0)}</h3>

          <button className="track-order-btn" onClick={() => navigate("/track-order")}>
            Track Order ➜
          </button>
        </div>
      )}

      {/* Order History Section */}
      {activeTab === "history" && (
        <div className="order-history">
          {previousOrders.map((order, index) => (
            <div key={index} className="history-card">
              <h3>{order.restaurant}</h3>
              <p>{order.time}</p>
              <p><b>Items:</b> {order.items.join(", ")}</p>
              <p><b>Total:</b> ₹{order.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
