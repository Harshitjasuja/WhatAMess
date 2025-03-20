const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  messId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Mess", 
    required: true 
  },
  items: [
    {
      name: { type: String, required: true, trim: true },
      price: { 
        type: Number, 
        required: true, 
        min: [0, "Price must be a positive number"] 
      },
      description: { type: String, default: "No description provided" },
      available: { type: Boolean, default: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);
