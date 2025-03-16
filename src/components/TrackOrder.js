import React, { Component } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaMotorcycle, FaClock, FaCheckCircle, FaPhone, FaCommentDots } from "react-icons/fa";
import "./TrackOrder.css";
import useWebSocket from "../hooks/useWebSocket"; // Import the custom hook

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

class TrackOrder extends Component {
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

  componentDidMount() {
    // Initialize WebSocket connection
    this.socket = io("http://localhost:5000");

    // Listen for order status updates
    this.socket.on("order-status", (data) => {
      this.setState({
        orderStatus: data.status,
        estimatedTime: data.estimatedTime || "N/A",
      });
    });

    // Listen for delivery location updates
    this.socket.on("delivery-location", (location) => {
      this.setState((prevState) => ({
        deliveryLocation: { lat: location.latitude, lng: location.longitude },
        routePath: [...prevState.routePath, { lat: location.latitude, lng: location.longitude }],
      }));
    });

    // Listen for chat messages
    this.socket.on("chat-message", (message) => {
      this.setState((prevState) => ({
        chatHistory: [...prevState.chatHistory, { sender: "Rahul", message }],
      }));
    });
  }

  componentWillUnmount() {
    // Disconnect WebSocket on unmount
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  handleCall = () => {
    alert("Calling Matt, your delivery partner...");
  };

  handleSendMessage = () => {
    if (this.state.chatMessage.trim()) {
      // Send chat message via WebSocket
      this.socket.emit("chat-message", this.state.chatMessage);
      this.setState((prevState) => ({
        chatHistory: [...prevState.chatHistory, { sender: "You", message: prevState.chatMessage }],
        chatMessage: "",
      }));
    }
  };

  render() {
    const { userLocation, deliveryLocation, routePath, chatMessage, chatHistory, orderStatus, estimatedTime } = this.state;

    return (
      <div className="track-order-container">
        <h2 className="header">Track Your Order</h2>

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
          <div className="delivery-boy-info">
            <h3>Rahul Joshi</h3>
            <p className="delivery-boy-role">Delivery Partner</p>
            <button className="call-button" onClick={this.handleCall}><FaPhone /> Call</button>
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
          <h4>Chat with Rahul</h4>
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

export default TrackOrder;
