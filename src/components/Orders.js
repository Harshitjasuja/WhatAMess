import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Orders.css"; // Import CSS for styling

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("current");
  const [menuItems, setMenuItems] = useState([]); 

  // Order details from location state
  const orderDetails = location.state || {
    messId: "",
    messName: "",
    selectedItems: [],
    totalPrice: 0,
    deliveryAddress: "",
    paymentMode: "Cash on Delivery",
    deliveryInstructions: "",
  };

  // ✅ Backend se menu krne ke liye useEffect
  useEffect(() => {
    if (orderDetails.messId) {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/api/menu/${orderDetails.messId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.items) {
            setMenuItems(data.items);
          } else {
            console.error("Invalid menu data:", data);
          }
        })
        .catch((err) => console.error("Error fetching menu:", err));
    }
  }, [orderDetails.messId]);

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
              <li key={index} className="order-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <p>{item.quantity}x {item.name}</p>
                  <p>₹{item.price.replace("₹", "")}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3>Menu from {orderDetails.messName}</h3>
          <ul>
            {menuItems.length > 0 ? (
              menuItems.map((item, index) => (
                <li key={index} className="order-item">
                  <p>{item.name} - ₹{item.price}</p>
                  <p>{item.description}</p>
                </li>
              ))
            ) : (
              <p>Loading menu...</p>
            )}
          </ul>

          <h3>Total: ₹{orderDetails.totalPrice}</h3>

          <button className="track-order-btn" onClick={() => navigate("/track-order")}>
            Track Order ➜
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
