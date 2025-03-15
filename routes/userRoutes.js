const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const router = express.Router();

/**
 * ✅ Get User Profile API
 * @route GET /:userId/profile
 * @desc Fetch user profile details
 */
router.get("/:userId/profile", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            success: true,
            user: {
                name: user.name,
                credits: user.credits,
                isAvailableForDelivery: user.isAvailableForDelivery,
                location: user.location,
            },
        });
    } catch (error) {
        console.error("🚨 Error fetching profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * ✅ Update Delivery User Location API
 * @route PUT /update
 * @desc Update delivery user's location and availability
 */
router.put("/update", async (req, res) => {
    try {
        const { userId, isAvailableForDelivery, location } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid or missing userId" });
        }

        if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            return res.status(400).json({ error: "Valid location (longitude, latitude) is required" });
        }

        location.coordinates = location.coordinates.map(coord => Number(coord));

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isAvailableForDelivery, location },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.json({ success: true, message: "Location updated", user: updatedUser });
    } catch (err) {
        console.error("❌ Error updating user location:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * ✅ Find Nearby Delivery Users API
 * @route POST /find-nearby-delivery
 * @desc Find available delivery users within a 500m radius
 */
router.post("/find-nearby-delivery", async (req, res) => {
    try {
        const { longitude, latitude } = req.body;

        if (typeof longitude !== "number" || typeof latitude !== "number") {
            return res.status(400).json({ error: "Valid longitude and latitude required" });
        }

        const nearbyUsers = await User.find({
            isAvailableForDelivery: true,
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: 500,
                },
            },
        });

        res.json({
            success: true,
            nearbyUsers,
        });
    } catch (err) {
        console.error("❌ Error finding nearby users:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * ✅ Accept Order API
 * @route POST /accept-order
 * @desc Assign order to delivery user
 */
router.post("/accept-order", async (req, res) => {
    try {
        const { userId, orderId } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid or missing userId" });
        }

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: "Invalid or missing orderId" });
        }

        const user = await User.findById(userId);
        if (!user || !user.isAvailableForDelivery) {
            return res.status(400).json({ error: "User is not available for delivery" });
        }

        // Logic to assign order to user (Assume Order model exists)
        const Order = require("../models/orderModel");
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { deliveryUserId: userId, status: "assigned" },
            { new: true }
        );

        if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

        res.json({ success: true, message: "Order assigned", order: updatedOrder });
    } catch (err) {
        console.error("❌ Error accepting order:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
