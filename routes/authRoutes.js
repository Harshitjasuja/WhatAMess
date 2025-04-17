const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Protected Route (User Profile)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPassword = password.trim();

    let user = await User.findOne({ email: cleanedEmail });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanedPassword, salt);

    user = new User({ name, email: cleanedEmail, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user.id });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPassword = password.trim();

    const user = await User.findOne({ email: cleanedEmail });
    if (!user) {
      console.log("❌ User not found:", cleanedEmail);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Debugging logs
    console.log("🔹 Entered Password:", cleanedPassword);
    console.log("🔹 Stored Hashed Password:", user.password);

    const isMatch = await bcrypt.compare(cleanedPassword, user.password);
    console.log("🔹 Password Match:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does not match!");
      
      // TEMPORARY DEBUGGING
      const freshHash = await bcrypt.hash(cleanedPassword, 10);
      console.log("🔹 Freshly Hashed Password for Debugging:", freshHash);

      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("✅ Login successful! Token generated.");
    res.json({ token, userId: user.id });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
