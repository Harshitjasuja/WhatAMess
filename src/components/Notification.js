import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./NotificationButton.css";

const NotificationButton = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [orders, setOrders] = useState([
    { id: 1, location: "Sardar Bhagat Singh Hostel", distance: "0.5 km" },
    { id: 2, location: "APJ Abdul Kalam Hostel", distance: "1.5 km" },
    { id: 3, location: "Marina Hostel", distance: "2 km" },
  ]);

  const navigate = useNavigate();

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleResponse = (id, response) => {
    if (response === "accepted") {
      navigate("/accept"); // Redirect to the accept page
    } else {
      alert(`You have ${response} the delivery for Order ID: ${id}`);
    }
    setOrders(orders.filter((order) => order.id !== id)); // Remove the order from the list
  };

  return (
    <div className="notification-container">
      <button className="notification-btn" onClick={toggleNotifications}>
        <FaBell className="icon" />
        {orders.length > 0 && <span className="badge">{orders.length}</span>}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <h4>New Orders</h4>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="notification-item">
                <p>📍 Order near {order.location} ({order.distance})</p>
                <button
                  className="accept"
                  onClick={() => handleResponse(order.id, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="decline"
                  onClick={() => handleResponse(order.id, "declined")}
                >
                  Decline
                </button>
              </div>
            ))
          ) : (
            <p>No new requests</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
