const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config(); // ✅ Load environment variables

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes"); // ✅ Include auth routes
const handleSocketConnections = require("./socketHandler"); // ✅ Corrected filename

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } }); // ✅ WebSocket allowed for all origins

// ✅ Attach WebSocket instance to app for global access
app.set("io", io);
handleSocketConnections(io); // ✅ Initialize WebSocket event handlers

const PORT = process.env.PORT || 5000;

// ✅ Secure CORS Options
const corsOptions = {
  origin: "http://localhost:3000", // 🛑 Change to frontend URL in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Route Middleware
app.use("/menu", menuRoutes);
app.use("/order", orderRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes); // ✅ Added auth route for login/signup

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
