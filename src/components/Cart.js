import React, { useState } from 'react';
import "./Cart.css"; // Import CSS for the cart page

const Cart = () => {
  // Mock data for cart items
  const cartItems = [
    {
      id: 1,
      name: "Paneer Tikka Masala",
      price: 250,
      quantity: 2,
      image: "/images/paneerbutter.jpeg", // Directly from public/images
    },
    {
      id: 2,
      name: "Butter Naan",
      price: 30,
      quantity: 4,
      image: "/images/naan.jpeg",
    },
    {
      id: 3,
      name: "Vegetable Biryani",
      price: 180,
      quantity: 1,
      image: "/images/biryani.jpeg",
    },
  ];

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // State for payment mode
  const [paymentMode, setPaymentMode] = useState("Cash on Delivery");

  // State for delivery instructions
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  return (
    <div className="cart-page">
      <h1>Here's your items, Checkout !</h1>
      <h2 className="mess-name">Food Mess At Service: Jo Paaji</h2> {/* Mess Name */}
      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="item-image" />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>
                <div className="quantity-controls">
                  <button>-</button>
                  <span>{item.quantity}</span>
                  <button>+</button>
                </div>
              </div>
              <p className="item-total">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-details">
            <p>Subtotal: ₹{totalPrice}</p>
            <p>Delivery Fee: ₹40</p>
            <p>Total: ₹{totalPrice + 40}</p>
          </div>

          {/* Delivery Address */}
          <div className="delivery-address">
            <h3>Delivery Address</h3>
            <p>123 Main Street, Apt 4B, City, State, ZIP Code</p>
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
          <button className="place-order-btn">Place Order</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
