import React, { Component } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaMotorcycle, FaClock, FaCheckCircle, FaPhone, FaCommentDots } from "react-icons/fa";
import "./AcceptPage.css"; // Ensure this CSS file exists
import axios from "axios";

// Fix for missing marker icons in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

class AcceptPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: { lat: 28.6139, lng: 77.209 }, // User's home
      deliveryLocation: { lat: 28.6448, lng: 77.2167 }, // Delivery partner's location
      routePath: [],
      chatMessage: "",
      chatHistory: [],
      orderId: this.props.orderId || "12345", // Order ID dynamically set
      orderStatus: "Loading...",
      estimatedTime: "Calculating...",
    };
  }

  // Fetch order status from the backend
  fetchOrderStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${this.state.orderId}/status`);
      const { status, estimatedTime } = response.data;

      this.setState({
        orderStatus: status,
        estimatedTime: estimatedTime || "N/A",
      });
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  };

  // Fetch delivery location from the backend
  fetchDeliveryLocation = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/get-location?orderId=${this.state.orderId}`);
      const { latitude, longitude } = response.data;

      this.setState((prevState) => ({
        deliveryLocation: { lat: latitude, lng: longitude },
        routePath: [...prevState.routePath, { lat: latitude, lng: longitude }],
      }));
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  componentDidMount() {
    this.fetchOrderStatus(); // Fetch status on component mount
    this.fetchDeliveryLocation(); // Fetch location on component mount

    this.statusInterval = setInterval(this.fetchOrderStatus, 10000); // Update status every 10 seconds
    this.locationInterval = setInterval(this.fetchDeliveryLocation, 5000); // Update location every 5 seconds
  }

  componentWillUnmount() {
    clearInterval(this.statusInterval);
    clearInterval(this.locationInterval);
  }

  handleCall = () => {
    alert("Calling the user...");
  };

  handleSendMessage = () => {
    if (this.state.chatMessage.trim()) {
      this.setState((prevState) => ({
        chatHistory: [...prevState.chatHistory, { sender: "You", message: prevState.chatMessage }],
        chatMessage: "",
      }));
    }
  };

  render() {
    const { userLocation, deliveryLocation, routePath, chatMessage, chatHistory, orderStatus, estimatedTime } = this.state;

    return (
      <div className="accept-page">
        <h2 className="header">Accept Order</h2>

        {/* OpenStreetMap with Leaflet */}
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: "400px", width: "100%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={deliveryLocation} />
          <Marker position={userLocation} />
          <Polyline positions={routePath} color="red" />
        </MapContainer>

        {/* Order Status Information */}
        <div className="status-container">
          <div className="user-info">
            <h3>User Location</h3>
            <p className="user-address">Address, House, Street etc</p>
            <button className="call-button" onClick={this.handleCall}><FaPhone /> Call User</button>
          </div>

          <div className="order-status-section">
            <div className="status-item">
              <FaClock className="status-icon" />
              <div className="status-details">
                <p className="status-title">{orderStatus}</p>
                <p className="status-time">Estimated time: {estimatedTime}</p>
              </div>
            </div>
            <div className="status-item">
              <FaMotorcycle className="status-icon" />
              <div className="status-details">
                <p className="status-title">On the way</p>
                <p className="status-time">Estimated time: {estimatedTime}</p>
              </div>
            </div>
            <div className="status-item">
              <FaCheckCircle className="status-icon" />
              <div className="status-details">
                <p className="status-title">Delivered</p>
                <p className="status-address">Address, House, Street etc</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Box */}
        <div className="chat-container">
          <h4>Chat with User</h4>
          <div className="chat-box">
            {chatHistory.map((chat, index) => (
              <p key={index} className="chat-message"><strong>{chat.sender}:</strong> {chat.message}</p>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => this.setState({ chatMessage: e.target.value })}
            />
            <button onClick={this.handleSendMessage}><FaCommentDots /></button>
          </div>
        </div>
      </div>
    );
  }
}

export default AcceptPage;