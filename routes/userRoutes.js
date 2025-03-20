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
 * ✅ Update Delivery Person's Live Location
 * @route PUT /update-location
 * @desc Update delivery user's current location
 */
router.put("/update-location", async (req, res) => {
    try {
        const { userId, lat, lng } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid or missing userId" });
        }

        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ error: "Latitude and Longitude required" });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== "delivery") {
            return res.status(403).json({ error: "Only delivery users can update location" });
        }

        user.location = {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
        };

        await user.save();

        res.json({
            success: true,
            message: "Location updated successfully",
            userLocation: user.location,
        });
    } catch (err) {
        console.error("❌ Error updating location:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * ✅ Update Delivery Availability API
 * @route PUT /update
 * @desc Update delivery user's availability status
 */
router.put("/update", async (req, res) => {
    try {
        const { userId, isAvailableForDelivery } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid or missing userId" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isAvailableForDelivery },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.json({
            success: true,
            message: "Availability updated",
            isAvailableForDelivery: updatedUser.isAvailableForDelivery,
        });
    } catch (err) {
        console.error("❌ Error updating availability:", err);
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

/**
 * ✅ Fetch Nearby Delivery Users API
 * @route GET /users/nearby
 * @desc Get available delivery users near given location
 */
router.get("/nearby", async (req, res) => {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: "Latitude and Longitude required" });
        }

        console.log("🌍 Searching for nearby users at:", lat, lng, maxDistance);

        const nearbyUsers = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distance",
                    maxDistance: parseInt(maxDistance),
                    spherical: true
                }
            },
            {
                $match: { isAvailableForDelivery: true }
            },
            {
                $project: { name: 1, location: 1, credits: 1, distance: 1 }
            }
        ]);

        console.log("🔍 Nearby Users Found:", nearbyUsers);

        res.json({ success: true, users: nearbyUsers });
    } catch (err) {
        console.error("❌ Error fetching nearby users:", err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;