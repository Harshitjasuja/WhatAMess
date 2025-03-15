const express = require("express");
const User = require("../models/userModel");
const router = express.Router();

// ✅ Get User Profile API
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
      },
    });
  } catch (error) {
    console.error("🚨 Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
