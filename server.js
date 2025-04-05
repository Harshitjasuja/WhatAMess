const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config(); // ✅ Load environment variables

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes"); // ✅ Include auth routes
const admin = require("./config/firebase"); // ✅ Firebase Admin SDK for authentication

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// ✅ Secure CORS Options
const corsOptions = {
  origin: "*", // Allow all origins for testing in Postman
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Firebase Authentication Middleware
const firebaseAuthMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(" ")[1];
  if (!idToken) {
    return res.status(403).json({ success: false, error: "No token provided" });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase Auth Middleware Error:", error);
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

// ✅ Route Middleware
app.use("/menu", menuRoutes);
app.use("/order", orderRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes); // ✅ Added auth route for login/signup

// ✅ Protected Route Example (Ensure auth is working)
app.get("/protected", firebaseAuthMiddleware, (req, res) => {
  res.json({ success: true, message: "You have accessed a protected route!", user: req.user });
});

// ✅ Handle 404 Errors
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 Global Express Error Handler:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ Connect to MongoDB & Start Server
mongoose
  .connect("mongodb://localhost:27017/WhatAmess", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("🔥 MongoDB Connected!");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

// ✅ Connection open hone ke baad database name log karein
mongoose.connection.once("open", function () {
  console.log("✅ Connected to Database:", mongoose.connection.db.databaseName);
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));