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
  status: { type: String, enum: ["Pending", "Completed", "Cancelled"], default: "Pending" },
  orderedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
