const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },

    role: {
      type: String,
      enum: ["customer", "delivery"],
      default: "customer",
    },

    credits: { type: Number, default: 0 },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: function () {
          return this.role === "delivery" ? "Point" : undefined;
        },
      },
      coordinates: {
        type: [Number],
        required: function () {
          return this.role === "delivery";
        },
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
      },
    },
  },
  { timestamps: true }
);

// ✅ Pre-save: Cleanup location if not delivery
UserSchema.pre("save", function (next) {
  if (this.role !== "delivery") {
    this.location = undefined;
    this.isAvailableForDelivery = false;
  } else if (this.location && this.location.coordinates) {
    this.location.coordinates = this.location.coordinates.map((coord) => Number(coord));
  }
  next();
});

// ✅ Geospatial index for delivery users
UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);
