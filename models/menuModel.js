const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: "Mess", required: true },
  items: [
    {
      name: String,
      price: Number,
      description: String,
      available: { type: Boolean, default: true },
    },
  ],
});

module.exports = mongoose.model("Menu", menuSchema);
