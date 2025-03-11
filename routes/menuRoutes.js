const express = require("express");
const Menu = require("../models/menuModel");
const router = express.Router();

// Mess owner can add/update menu
router.post("/add", async (req, res) => {
  try {
    const { messId, items } = req.body;
    const menu = new Menu({ messId, items });
    await menu.save();
    res.json({ success: true, menu });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch menu for a specific mess
router.get("/:messId", async (req, res) => {
  try {
    const menu = await Menu.findOne({ messId: req.params.messId });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
