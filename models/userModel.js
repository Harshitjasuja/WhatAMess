const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "delivery"], default: "customer" },
    credits: { type: Number, default: 0 }, // ✅ Added credits field
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        required: function () {
          return this.role === "delivery";
        }, // ✅ Required only for delivery users
        validate: {
          validator: function (arr) {
            return arr.length === 2;
          },
          message: "Coordinates must have [longitude, latitude]",
        },
      },
    },
    isAvailableForDelivery: {
      type: Boolean,
      default: function () {
        return this.role === "delivery";
      }, // ✅ Customers are always unavailable for delivery
    },
  },
  { timestamps: true }
);

// ✅ Ensure coordinates are numbers before saving
UserSchema.pre("save", function (next) {
  if (this.location && this.location.coordinates) {
    this.location.coordinates = this.location.coordinates.map((coord) => Number(coord));
  }
  next();
});

// ✅ Password Hashing before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Generate JWT Token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ✅ Add Geospatial Index
UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);
