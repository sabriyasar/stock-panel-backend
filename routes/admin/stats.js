const express = require("express");
const router = express.Router();
const User = require("../../models/User"); // Model yolunu kendi projenine göre düzelt
let onlineUsers = require("../../utils/onlineUsers"); // 👈 az sonra açıklanacak

// Admin istatistik endpoint
router.get("/", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    res.json({
      totalUsers,
      todayUsers,
      onlineUsers: onlineUsers.size
    });
  } catch (err) {
    console.error("İstatistik hatası:", err);
    res.status(500).json({ error: "İstatistikler alınamadı" });
  }
});

module.exports = router;
