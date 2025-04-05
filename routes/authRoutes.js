const express = require("express");
const router = express.Router();
const admin = require("../config/firebase");
const User = require("../models/userModel");
const protect = require("../middleware/authMiddleware");

// ✅ Verify OTP using Firebase ID Token
router.post("/verify-otp", async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, msg: "ID Token is required" });
    }

    try {
        // Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, msg: "Phone number missing in token" });
        }

        // Find or create user
        let user = await User.findOne({ phoneNumber });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await User.create({
                phoneNumber,
                name: "New User", // Default name for new users
                role: "customer", // Default role
                createdAt: new Date()
            });
        }

        // Return user details with a flag indicating if this is a new user
        res.status(200).json({
            success: true,
            msg: "Authentication successful",
            userId: user._id,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isNewUser: isNewUser
        });
    } catch (error) {
        console.error("❌ Firebase Token Verification Error:", error);
        res.status(401).json({ success: false, msg: "Invalid or expired token" });
    }
});

// ✅ Update user profile (for new users)
router.post("/update-profile", protect, async (req, res) => {
    try {
        const { name, email, location } = req.body;
        
        // req.user comes from the middleware
        const userId = req.user._id;
        
        // Update user details
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { 
                name: name || req.user.name,
                email: email || req.user.email,
                location: location || req.user.location,
                isProfileComplete: true
            }, 
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        res.json({ 
            success: true, 
            msg: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                phoneNumber: updatedUser.phoneNumber,
                role: updatedUser.role,
                email: updatedUser.email,
                location: updatedUser.location
            }
        });
    } catch (error) {
        console.error("❌ Profile Update Error:", error);
        res.status(500).json({ success: false, msg: "Server Error", error: error.message });
    }
});

// ✅ Get user profile
router.get("/profile", protect, async (req, res) => {
    try {
        // req.user comes from the middleware
        const user = await User.findById(req.user._id).select("-password");
        
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("❌ Profile Fetch Error:", error);
        res.status(500).json({ success: false, msg: "Server Error", error: error.message });
    }
});

module.exports = router;