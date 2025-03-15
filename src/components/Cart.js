import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import "./Cart.css";

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate

  const { selectedItems, messName } = location.state || { selectedItems: [], messName: "" };

  // Calculate total price
  const totalPrice = selectedItems.reduce(
    (total, item) => total + parseInt(item.price.replace("₹", "")) * item.quantity,
    0
  );

  // State for payment mode
  const [paymentMode, setPaymentMode] = React.useState("Cash on Delivery");

  // State for delivery instructions
  const [deliveryInstructions, setDeliveryInstructions] = React.useState("");

  // Handle Place Order button click
  const handlePlaceOrder = () => {
    const orderDetails = {
      messName,
      selectedItems,
      totalPrice: totalPrice + 20, // Include delivery fee
      deliveryAddress: "Sardar Bhagat Singh Hostel Clement Town Dehradun",
      paymentMode,
      deliveryInstructions,
    };
    navigate("/orders", { state: orderDetails }); // Navigate to Orders page with order details
  };

  return (
    <div className="cart-page">
      <h1>Here's your items, Checkout !</h1>
      <h2 className="mess-name">Food Mess At Service: {messName}</h2> {/* Mess Name */}
      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
          {selectedItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="item-image" />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>{item.price}</p>
                <div className="quantity-controls">
                  <span>Quantity: {item.quantity}</span>
                </div>
              </div>
              <p className="item-total">
                ₹{parseInt(item.price.replace("₹", "")) * item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-details">
            <p>Subtotal: ₹{totalPrice}</p>
            <p>Delivery Fee: ₹20</p>
            <p>Total: ₹{totalPrice + 20}</p>
          </div>

          {/* Delivery Address */}
          <div className="delivery-address">
            <h3>Delivery Address</h3>
            <p>Sardar Bhagat Singh Hostel Clement Town Dehradun</p>
          </div>

          {/* Payment Mode Dropdown */}
          <div className="payment-mode">
            <h3>Payment Mode</h3>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="UPI ID">UPI ID</option>
            </select>
          </div>

          {/* Delivery Instructions */}
          <div className="delivery-instructions">
            <h3>Delivery Instructions</h3>
            <textarea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="Add instructions for the delivery partner..."
            />
          </div>

          {/* Place Order Button */}
          <button className="place-order-btn" onClick={handlePlaceOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
