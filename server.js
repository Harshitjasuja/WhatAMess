const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
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

// ✅ Server Listening
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
