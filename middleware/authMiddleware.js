const admin = require("../config/firebase");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const idToken = authHeader.split(" ")[1];

    // 🔐 Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 🔍 Fetch or validate user in DB using phone number
    const user = await User.findOne({ phoneNumber: decodedToken.phone_number });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = protect;
