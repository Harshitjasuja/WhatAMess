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

    if (
      !userId ||
      !messId ||
      !items ||
      !totalAmount ||
      !pickupLocation ||
      !dropoffLocation
    ) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const order = new Order({
      userId,
      messId,
      items,
      totalAmount,
      pickupLocation,
      dropoffLocation,
      notificationSent: false,
    });
    await order.save();

    const nearbyUsers = await User.find({
      isAvailableForDelivery: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickupLocation.longitude, pickupLocation.latitude],
          },
          $maxDistance: 500,
        },
      },
    }).exec();

    console.log(`🔔 Found ${nearbyUsers.length} nearby users`);
    res.json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    console.error("🚨 Error placing order:", err);
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

// ✅ 3. Update orders live location
router.put("/update-location", async (req, res) => {
  try {
    const { orderId, lat, lng } = req.body;
    if (!orderId || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "Latitude and Longitude required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.currentLocation = { latitude: Number(lat), longitude: Number(lng) };
    await order.save();

    res.json({
      success: true,
      message: "Location updated successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 4. Mark order as delivered & apply penalty
router.post("/complete-delivery", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId)
      return res.status(400).json({ error: "Order ID is required" });

    const order = await Order.findById(orderId);
    if (!order || order.status === "Completed") {
      return res
        .status(404)
        .json({ error: "Order not found or already completed" });
    }

    const actualTime = Math.floor(
      (Date.now() - order.deliveryStartTime) / 60000
    );
    let penalty = 0;

    if (actualTime > order.estimatedDeliveryTime) {
      penalty = (actualTime - order.estimatedDeliveryTime) * 5;
      const deliveryPerson = await User.findById(order.deliveryPersonId);
      if (deliveryPerson) {
        deliveryPerson.credits = Math.max(0, deliveryPerson.credits - penalty);
        await deliveryPerson.save();
      }
    }

    order.status = "Completed";
    order.actualDeliveryTime = actualTime;
    await order.save();

    res.json({
      success: true,
      message: "Order delivered successfully",
      penalty,
      order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 5. Get Delivery Partner Location
router.get("/get-location", async (req, res) => {
  try {
    const { orderId } = req.query;
    const order = await Order.findById(orderId);
    if (!order || !order.currentLocation) {
      return res.status(404).json({ error: "Order or location not found" });
    }
    res.json(order.currentLocation);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

// ✅ 6. Get Order Status
router.get("/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({
      status: order.status,
      estimatedTime: order.estimatedDeliveryTime,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ 7. Cancel Order API
router.post("/cancel", async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.status === "Completed") {
      return res
        .status(404)
        .json({ error: "Order not found or already completed" });
    }
    order.status = "Cancelled";
    await order.save();
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
