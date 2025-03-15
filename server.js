const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } }); // ✅ Allow all origins for WebSocket

// ✅ Attach WebSocket to app for global access
app.set("io", io);

const PORT = process.env.PORT || 5000;

// ✅ Secure CORS Options
const corsOptions = {
  origin: "http://localhost:3000", // 🛑 Update this with frontend URL when deployed
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Route Middleware
app.use("/menu", menuRoutes);
app.use("/order", orderRoutes);
app.use("/user", userRoutes);

// ✅ Handle 404 Errors
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 Global Express Error Handler:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ Database Connection with Error Handling
mongoose
  .connect("mongodb://localhost:27017/WhatAmess", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🔥 MongoDB Connected!"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1); // Exit process if DB connection fails
  });

// ✅ Start Server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
