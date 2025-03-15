import React, { Component } from "react";
import { FaBell } from "react-icons/fa";
import "./NotificationButton.css";

class NotificationButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNotifications: false,
      orders: [
        { id: 1, location: "Sardar Bhagat Singh Hostel", distance: "0.5 km" },
        { id: 2, location: "APJ Abdul Kalam Hostel", distance: "1.5 km" },
        { id: 3, location: "Marina Hostel",distance:"2km"},
      ],
    };
  }

  toggleNotifications = () => {
    this.setState({ showNotifications: !this.state.showNotifications });
  };

  handleResponse = (id, response) => {
    alert(`You have ${response} the delivery for Order ID: ${id}`);
    this.setState({
      orders: this.state.orders.filter((order) => order.id !== id),
    });
  };

  render() {
    return (
      <div className="notification-container">
        <button className="notification-btn" onClick={this.toggleNotifications}>
          <FaBell className="icon" />
          {this.state.orders.length > 0 && <span className="badge">{this.state.orders.length}</span>}
        </button>

        {this.state.showNotifications && (
          <div className="notification-dropdown">
            <h4>New Orders</h4>
            {this.state.orders.length > 0 ? (
              this.state.orders.map((order) => (
                <div key={order.id} className="notification-item">
                  <p>📍 Order near {order.location} ({order.distance})</p>
                  <button className="accept" onClick={() => this.handleResponse(order.id, "accepted")}>Accept</button>
                  <button className="decline" onClick={() => this.handleResponse(order.id, "declined")}>Decline</button>
                </div>
              ))
            ) : (
              <p>No new requests</p>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default NotificationButton;
