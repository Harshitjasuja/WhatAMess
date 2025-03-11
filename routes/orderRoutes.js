const express = require("express");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const router = express.Router();

// ✅ 1. Place a new order
router.post("/place", async (req, res) => {
    try {
      console.log("Received Data:", req.body); // 👀 Debugging ke liye
      const { userId, messId, items, totalAmount, pickupLocation, dropoffLocation } = req.body;
  
      // Ensure required fields exist
      if (!pickupLocation || !dropoffLocation) {
        return res.status(400).json({ error: "Pickup and dropoff locations are required!" });
      }
  
      const order = new Order({ userId, messId, items, totalAmount, pickupLocation, dropoffLocation });
      await order.save();
      res.json({ success: true, order });
    } catch (err) {
      console.error("Error placing order:", err);  // 👀 Debugging ke liye
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
    res.json({ success: true, message: "Delivery assigned successfully", order });
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

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            console.log("❌ Order not found:", orderId);
            return res.status(404).json({ error: "Order not found" });
        }

        // ✅ Ensure numbers are properly parsed
        order.currentLocation = { latitude: Number(lat), longitude: Number(lng) };

        // Save and log the update
        await order.save();
        console.log("✅ Location updated:", order.currentLocation);

        res.json({ success: true, message: "Location updated successfully", order });
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

        // Fetch order from DB
        const order = await Order.findById(orderId);
        if (!order) {
            console.log("❌ Order not found:", orderId);
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.status === "Completed") {
            console.log("⚠️ Order already completed:", orderId);
            return res.status(400).json({ error: "Order already completed" });
        }

        // Calculate Delivery Time in Minutes
        const actualTime = Math.floor((Date.now() - order.deliveryStartTime) / 60000);
        let penalty = 0;

        // Apply Penalty if Late
        if (actualTime > order.estimatedDeliveryTime) {
            penalty = (actualTime - order.estimatedDeliveryTime) * 5; // 5 points per minute
            console.log(`⚠️ Penalty applied: ${penalty} points`);

            // Deduct from delivery person’s account
            const deliveryPerson = await User.findById(order.deliveryPersonId);
            if (deliveryPerson) {
                deliveryPerson.credits -= penalty;
                await deliveryPerson.save();
                console.log("✅ Penalty deducted from:", deliveryPerson._id);
            }
        }

        // ✅ Updating Order Status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                status: "Completed",
                deliveryStatus: "Delivered",
                actualDeliveryTime: actualTime,
            },
            { new: true } // ✅ Ensures updated document is returned
        );

        console.log("✅ Order marked as delivered:", updatedOrder);

        res.json({ 
            success: true, 
            message: "Order delivered successfully", 
            penalty, 
            order: updatedOrder 
        });

    } catch (err) {
        console.error("🚨 Error completing delivery:", err);
        res.status(500).json({ error: err.message });
    }
});

  

module.exports = router;
