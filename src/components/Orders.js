import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate
import "./Orders.css"; // Import CSS for styling

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to manage the selected tab
  const [activeTab, setActiveTab] = useState("current");

  // Get order details from location state
  const orderDetails = location.state || {
    messName: "",
    selectedItems: [],
    totalPrice: 0,
    deliveryAddress: "",
    paymentMode: "Cash on Delivery",
    deliveryInstructions: "",
  };

  // Sample previous orders (you can replace it with dynamic data from a backend)
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
          <h2>{orderDetails.messName}</h2>
          <p><b>Order Placed: {new Date().toLocaleString()}</b></p>
          <p>Estimated Delivery: 25-35 min</p>
          <p>{orderDetails.deliveryAddress}</p>
          <p><b>Status: Preparing your order</b></p>

          <h3>Order Items</h3>
          <ul>
            {orderDetails.selectedItems.map((item, index) => (
              <li key={index}>
                {item.quantity}x {item.name} - ₹{item.price.replace("₹", "")}
              </li>
            ))}
          </ul>

          <h3>Total: ₹{orderDetails.totalPrice}</h3>

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