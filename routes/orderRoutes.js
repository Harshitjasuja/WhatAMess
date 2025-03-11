const express = require("express");
const Order = require("../models/orderModel");
const router = express.Router();

// Place an order
router.post("/place", async (req, res) => {
  try {
    const { userId, messId, items, totalAmount } = req.body;
    const order = new Order({ userId, messId, items, totalAmount });
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user orders
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate("messId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
