const admin = require("../config/firebase");
const User = require("../models/userModel");

const verifyFirebaseToken = async (req, res) => {
  const { idToken, name } = req.body; // name is optional for new users

  if (!idToken) {
    return res.status(400).json({ success: false, error: "ID Token is required" });
  }

  try {
    // 🔐 Verify ID Token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Phone number not found in token" });
    }

    // 🔍 Check if user exists in DB
    let user = await User.findOne({ phoneNumber });

    // 🆕 Create new user if doesn't exist
    if (!user) {
      user = new User({
        name: name || "Unnamed User",
        phoneNumber,
        role: "customer", // or dynamically assign if needed
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        credits: user.credits,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Firebase Token Verification Error:", error);
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

module.exports = { verifyFirebaseToken };
