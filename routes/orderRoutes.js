const express = require("express");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const router = express.Router();

// ✅ 1. Place a new order
router.post("/place", async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    const {
      userId,
      messId,
      items,
      totalAmount,
      pickupLocation,
      dropoffLocation,
    } = req.body;

    if (!pickupLocation || !dropoffLocation) {
      return res
        .status(400)
        .json({ error: "Pickup and dropoff locations are required!" });
    }

    const order = new Order({
      userId,
      messId,
      items,
      totalAmount,
      pickupLocation,
      dropoffLocation,
    });
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 2. Assign a delivery person
router.post("/assign-delivery", async (req, res) => {
  try {
    const { orderId, deliveryPersonId, estimatedTime } = req.body;

    if (!orderId || !deliveryPersonId || !estimatedTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.deliveryPersonId = deliveryPersonId;
    order.deliveryStartTime = new Date();
    order.estimatedDeliveryTime = estimatedTime;
    order.status = "Out for Delivery";

    await order.save();
    res.json({
      success: true,
      message: "Delivery assigned successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 3. Update delivery person's live location
router.put("/update-location", async (req, res) => {
  try {
    const { orderId, lat, lng } = req.body;

    if (!orderId || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "Latitude and Longitude required" });
    }

    console.log("🛰️ Received location update:", { orderId, lat, lng });

    const order = await Order.findById(orderId);
    if (!order) {
      console.log("❌ Order not found:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    order.currentLocation = { latitude: Number(lat), longitude: Number(lng) };

    await order.save();
    console.log("✅ Location updated:", order.currentLocation);

    res.json({
      success: true,
      message: "Location updated successfully",
      order,
    });
  } catch (err) {
    console.error("🚨 Error updating location:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 4. Mark order as delivered & apply penalty
router.post("/complete-delivery", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    console.log("📦 Completing delivery for order:", orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      console.log("❌ Order not found:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "Completed") {
      console.log("⚠️ Order already completed:", orderId);
      return res.status(400).json({ error: "Order already completed" });
    }

    const actualTime = Math.floor(
      (Date.now() - order.deliveryStartTime) / 60000
    );
    let penalty = 0;

    if (actualTime > order.estimatedDeliveryTime) {
      penalty = (actualTime - order.estimatedDeliveryTime) * 5;
      console.log(`⚠️ Penalty applied: ${penalty} points`);

      const deliveryPerson = await User.findById(order.deliveryPersonId);
      if (deliveryPerson) {
        deliveryPerson.credits -= penalty;
        await deliveryPerson.save();
        console.log("✅ Penalty deducted from:", deliveryPerson._id);
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "Completed",
        deliveryStatus: "Delivered",
        actualDeliveryTime: actualTime,
      },
      { new: true }
    );

    console.log("✅ Order marked as delivered:", updatedOrder);

    res.json({
      success: true,
      message: "Order delivered successfully",
      penalty,
      order: updatedOrder,
    });
  } catch (err) {
    console.error("🚨 Error completing delivery:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 5. Get Delivery Partner Location
router.get("/get-location", async (req, res) => {
  const { orderId } = req.query;
  console.log("Received orderId:", orderId);

  try {
    const order = await Order.findById(orderId);
    console.log("Fetched Order:", order);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.currentLocation) {
      return res
        .status(400)
        .json({ error: "Current location not updated yet" });
    }

    res.json({
      latitude: order.currentLocation.latitude,
      longitude: order.currentLocation.longitude,
    });
  } catch (err) {
    console.error("Error fetching location:", err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

// ✅ 6. Get Order Status
router.get("/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    console.log("Received orderId:", orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      status: order.status,
      estimatedTime: order.estimatedDeliveryTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ 7. Cancel Order API
router.post("/cancel", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    console.log("🚫 Cancelling order:", orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "Completed") {
      return res.status(400).json({ error: "Cannot cancel a completed order" });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    console.error("🚨 Error cancelling order:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
