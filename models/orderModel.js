const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: "Mess", required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu.items" },
      quantity: Number,
    },
  ],
  totalAmount: Number,
  status: { type: String, enum: ["Pending", "Completed","Out for Delivery", "Cancelled"], default: "Pending" },
  orderedAt: { type: Date, default: Date.now },

  // Delivery Details
  deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Student delivering the order
  deliveryStatus: { type: String, enum: ["Pending", "Out for Delivery", "Delivered", "Cancelled"], default: "Pending" },
  deliveryTime: { type: Date, default: null },

  // GPS Tracking
  pickupLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  dropoffLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  currentLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
});

module.exports = mongoose.model("Order", orderSchema);
